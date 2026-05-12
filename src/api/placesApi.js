const API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
const NEARBY_URL = '/.netlify/functions/places-nearby';
const PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo';

const CUISINE_KEYWORDS = {
  italian: 'Italian restaurant',
  indian: 'Indian restaurant',
  british: 'British restaurant',
  japanese: 'Japanese restaurant',
  mexican: 'Mexican restaurant',
  mediterranean: 'Mediterranean restaurant',
  spanish: 'Spanish restaurant',
  french: 'French restaurant',
  chinese: 'Chinese restaurant',
  asian: 'Asian restaurant',
  american: 'American restaurant',
  middleEastern: 'Middle Eastern restaurant',
};

// Places API price_level (0–4) → app price symbols
const PRICE_LEVEL_TO_SYMBOL = { 0: '$', 1: '$', 2: '$$', 3: '$$$', 4: '$$$' };

// App price symbol → Places API maxprice param
const SYMBOL_TO_MAXPRICE = { '$': 1, '$$': 2, '$$$': 4 };

// Meal duration heuristic by price level
const PRICE_TO_DURATION = { '$': 1, '$$': 1.5, '$$$': 2 };

// Name-based cuisine detection — legacy Places API only returns generic types like
// "restaurant", "food", "meal_takeaway", so we infer cuisine from the restaurant name.
const NAME_CUISINE_PATTERNS = [
  [/(italian|pizza|pizzeria|pasta|trattoria|ristorante|risotto|carbonara|gelato)/i, 'italian'],
  [/(indian|curry|tandoor|masala|biryani|tikka|balti|punjabi|bengali|dhal?\b)/i, 'indian'],
  [/(japanese|sushi|ramen|udon|soba|yakitori|tempura|teriyaki|teppanyaki|gyoza)/i, 'japanese'],
  [/(chinese|cantonese|szechuan|dim.?sum|dumpling|peking|wonton)/i, 'chinese'],
  [/(thai|vietnamese|korean|pad.?thai|\bpho\b|banh.?mi|bibimbap|kimchi)/i, 'asian'],
  [/(mexican|taco|burrito|enchilada|quesadilla|cantina)/i, 'mexican'],
  [/(french|brasserie|bistro|patisserie|cr[eê]pe)/i, 'french'],
  [/(mediterranean|greek|mezze|souvlaki|moussaka)/i, 'mediterranean'],
  [/(spanish|tapas|paella)/i, 'spanish'],
  [/(lebanese|turkish|persian|moroccan|falafel|kebab|shawarma|hummus|tagine)/i, 'middleEastern'],
  [/fish.?and.?chips?|chippy|\bcarvery\b|\bpub\b/i, 'british'],
  [/\bburger|\bbbq\b|barbecue|steakhouse|smokehouse|\bdiner\b/i, 'american'],
  [/caf[eé]|coffee.?shop|\bbakery\b|espresso.?bar/i, 'cafe'],
];

function detectCuisine(name = '', types = []) {
  for (const [pattern, cuisine] of NAME_CUISINE_PATTERNS) {
    if (pattern.test(name)) return [cuisine];
  }
  // Fallback: Google does return cafe/bakery types reliably
  if (types.some(t => ['cafe', 'bakery', 'coffee_shop'].includes(t))) return ['cafe'];
  return [];
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildPhotoUrl(photoReference) {
  return `${PHOTO_URL}?maxwidth=400&photo_reference=${encodeURIComponent(photoReference)}&key=${API_KEY}`;
}

function parsePlaces(results, lat, lng) {
  return results
    .filter(p => p.business_status !== 'CLOSED_PERMANENTLY')
    .map(p => {
      const priceSymbol = PRICE_LEVEL_TO_SYMBOL[p.price_level] ?? '$$';
      const dist = parseFloat(
        haversineKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng).toFixed(1),
      );
      const imgSrc = p.photos?.[0]?.photo_reference
        ? buildPhotoUrl(p.photos[0].photo_reference)
        : `https://placehold.co/400x300/667eea/ffffff?text=${encodeURIComponent(p.name.slice(0, 14))}`;

      return {
        id: p.place_id,
        name: p.name,
        city: '',
        cuisine: detectCuisine(p.name, p.types),
        priceRange: priceSymbol,
        rating: parseFloat((p.rating || 4.0).toFixed(1)),
        duration: PRICE_TO_DURATION[priceSymbol] ?? 1.5,
        distance: dist,
        address: p.vicinity,
        image: imgSrc,
      };
    });
}

async function nearbySearch(lat, lng, keyword, maxprice) {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: 5000,
    type: 'restaurant',
  });
  if (keyword) params.set('keyword', keyword);
  if (maxprice != null) params.set('maxprice', String(maxprice));

  const res = await fetch(`${NEARBY_URL}?${params}`);
  if (!res.ok) throw new Error(`HTTP_${res.status}`);

  const json = await res.json();
  if (json.status === 'REQUEST_DENIED') throw new Error('API_DENIED');
  if (json.status === 'OVER_QUERY_LIMIT') throw new Error('QUOTA_EXCEEDED');
  if (json.status === 'ZERO_RESULTS') return [];
  if (json.status !== 'OK') throw new Error(`STATUS_${json.status}`);
  return json.results || [];
}

/**
 * Search for nearby restaurants via Google Places Nearby Search.
 * Throws:
 *   'NO_API_KEY'     — REACT_APP_GOOGLE_PLACES_API_KEY not set
 *   'QUOTA_EXCEEDED' — daily quota hit
 *   'API_DENIED'     — key or referrer restriction problem
 *   other Error      — network / unexpected status
 *
 * Returns array of restaurant objects shaped like mockRestaurantData entries.
 */
export async function searchRestaurants(lat, lng, cuisineFilters = [], priceFilter = null) {
  if (!API_KEY) throw new Error('NO_API_KEY');

  const maxprice = priceFilter != null ? SYMBOL_TO_MAXPRICE[priceFilter] : null;
  const cuisinesToQuery = cuisineFilters.slice(0, 3); // cap at 3 concurrent calls

  let raw;
  if (cuisinesToQuery.length === 0) {
    raw = await nearbySearch(lat, lng, null, maxprice);
  } else if (cuisinesToQuery.length === 1) {
    raw = await nearbySearch(lat, lng, CUISINE_KEYWORDS[cuisinesToQuery[0]], maxprice);
  } else {
    const batches = await Promise.all(
      cuisinesToQuery.map(c => nearbySearch(lat, lng, CUISINE_KEYWORDS[c] ?? `${c} restaurant`, maxprice)),
    );
    const seen = new Set();
    raw = [];
    batches.forEach(batch =>
      batch.forEach(p => {
        if (!seen.has(p.place_id)) { seen.add(p.place_id); raw.push(p); }
      }),
    );
  }

  const parsed = parsePlaces(raw, lat, lng);
  const byRating = parsed
    .filter(r => r.rating >= 3.5 && r.distance <= 5)
    .sort((a, b) => b.rating - a.rating);

  // Remove restaurants whose detected cuisine is known but doesn't match any selected filter.
  // Restaurants with no detected cuisine (r.cuisine.length === 0) are always kept.
  const cuisineFiltered = cuisineFilters.length === 0
    ? byRating
    : byRating.filter(r => r.cuisine.length === 0 || r.cuisine.some(c => cuisineFilters.includes(c)));

  return cuisineFiltered.slice(0, 12);
}
