// All Google Places calls go through Netlify functions so the private
// GOOGLE_PLACES_API_KEY never reaches the client bundle. No REACT_APP_*
// key may be read here — REACT_APP_ values are embedded into the built JS.
const NEARBY_URL = '/.netlify/functions/places-nearby';
const PHOTO_URL = '/.netlify/functions/places-photo';

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
  return `${PHOTO_URL}?ref=${encodeURIComponent(photoReference)}&maxwidth=400`;
}

// A record without numeric coordinates can't be distance-filtered or routed;
// skip it rather than letting one malformed result throw away the whole batch.
function hasUsableGeometry(p) {
  const loc = p?.geometry?.location;
  return typeof loc?.lat === 'number' && typeof loc?.lng === 'number';
}

// Provider search constraints improve relevance but are not a substitute for
// validating each returned record. A live result may still be a shop or other
// non-food venue, so restaurant discovery accepts only food-and-drink types.
const FOOD_AND_DRINK_PLACE_TYPES = new Set([
  'restaurant',
  'cafe',
  'coffee_shop',
  'bakery',
  'bar',
  'pub',
  'meal_takeaway',
  'ice_cream_shop',
]);

function isFoodAndDrinkVenue(primaryType, types) {
  if (typeof primaryType === 'string') {
    return FOOD_AND_DRINK_PLACE_TYPES.has(primaryType) ||
      primaryType.endsWith('_restaurant') ||
      primaryType.endsWith('_cafe');
  }

  return Array.isArray(types) && types.some(type =>
    typeof type === 'string' && (
      FOOD_AND_DRINK_PLACE_TYPES.has(type) ||
      type.endsWith('_restaurant') ||
      type.endsWith('_cafe')
    ),
  );
}

function parsePlaces(results, lat, lng) {
  return results
    .filter(p =>
      hasUsableGeometry(p) &&
      p.business_status !== 'CLOSED_PERMANENTLY' &&
      isFoodAndDrinkVenue(p.primary_type, p.types),
    )
    .map(p => {
      const name = p.name || '';
      const priceSymbol = PRICE_LEVEL_TO_SYMBOL[p.price_level] ?? '$$';
      const dist = parseFloat(
        haversineKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng).toFixed(1),
      );
      const imgSrc = p.photos?.[0]?.photo_reference
        ? buildPhotoUrl(p.photos[0].photo_reference)
        : `https://placehold.co/400x300/667eea/ffffff?text=${encodeURIComponent(name.slice(0, 14) || 'Restaurant')}`;

      return {
        id: p.place_id,
        name,
        city: '',
        cuisine: detectCuisine(name, p.types),
        venueType: p.primary_type_display_name || null,
        priceRange: priceSymbol,
        rating: parseFloat((p.rating || 4.0).toFixed(1)),
        duration: PRICE_TO_DURATION[priceSymbol] ?? 1.5,
        distance: dist,
        address: p.vicinity,
        coordinates: {
          lat: p.geometry.location.lat,
          lng: p.geometry.location.lng,
        },
        image: imgSrc,
      };
    });
}

async function nearbySearch(lat, lng, keyword, maxprice, type = 'restaurant', types = null) {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: 5000,
    type,
  });
  if (keyword) params.set('keyword', keyword);
  if (Array.isArray(types) && types.length > 0) params.set('types', types.join(','));
  if (maxprice != null) params.set('maxprice', String(maxprice));

  let res;
  try {
    res = await fetch(`${NEARBY_URL}?${params}`);
  } catch (cause) {
    // fetch only rejects when the request never completed at all — offline,
    // DNS failure, connection reset. A request that reached the server and
    // came back 4xx/5xx resolves, and is handled below as a provider error.
    throw new Error('NETWORK_ERROR');
  }
  // 404 means the Netlify function isn't deployed/running — live search is
  // unconfigured, which is the same user-facing state as a missing key.
  if (res.status === 404) throw new Error('NO_API_KEY');
  if (!res.ok) throw new Error(`HTTP_${res.status}`);

  const json = await res.json();
  if (json.status === 'REQUEST_DENIED') {
    // The proxy reports its own missing server-side key as NO_API_KEY.
    throw new Error(json.error_message === 'NO_API_KEY' ? 'NO_API_KEY' : 'API_DENIED');
  }
  if (json.status === 'OVER_QUERY_LIMIT') throw new Error('QUOTA_EXCEEDED');
  if (json.status === 'ZERO_RESULTS') return [];
  if (json.status !== 'OK') throw new Error(`STATUS_${json.status}`);
  return json.results || [];
}

// Text Search can return further pages. Keep it separate from the established
// planning search: this is only for the first-minute nearby card flow.
async function restaurantPageSearch(lat, lng, keyword, maxprice, pageToken = null) {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: 5000,
    unfiltered: '1',
  });
  if (pageToken) params.set('pageToken', pageToken);
  else params.set('keyword', keyword);
  if (maxprice != null) params.set('maxprice', String(maxprice));

  let res;
  try {
    res = await fetch(`${NEARBY_URL}?${params}`);
  } catch (_) {
    throw new Error('NETWORK_ERROR');
  }
  if (res.status === 404) throw new Error('NO_API_KEY');
  if (!res.ok) throw new Error(`HTTP_${res.status}`);

  const json = await res.json();
  if (json.status === 'REQUEST_DENIED') {
    throw new Error(json.error_message === 'NO_API_KEY' ? 'NO_API_KEY' : 'API_DENIED');
  }
  if (json.status === 'OVER_QUERY_LIMIT') throw new Error('QUOTA_EXCEEDED');
  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
    throw new Error(`STATUS_${json.status}`);
  }
  return { results: json.results || [], nextPageToken: json.next_page_token || null };
}

// When every cuisine batch fails, surface the most actionable failure so the
// caller's error-to-source mapping (quota, denied key, …) stays meaningful.
// NETWORK_ERROR ranks last: it is the least specific of the named reasons, but
// still beats an opaque HTTP_/STATUS_ string picked arbitrarily by position.
const BATCH_ERROR_PRIORITY = ['NO_API_KEY', 'QUOTA_EXCEEDED', 'API_DENIED', 'NETWORK_ERROR'];

function pickMostSpecificError(reasons) {
  for (const message of BATCH_ERROR_PRIORITY) {
    const match = reasons.find(r => r?.message === message);
    if (match) return match;
  }
  return reasons[0] ?? new Error('ALL_BATCHES_FAILED');
}

/**
 * Search for nearby restaurants via the places-nearby Netlify function
 * (which holds the private Google key server-side).
 * Throws:
 *   'NO_API_KEY'     — server-side GOOGLE_PLACES_API_KEY not set, or the
 *                      Netlify function is not deployed (HTTP 404)
 *   'QUOTA_EXCEEDED' — daily quota hit
 *   'API_DENIED'     — key or referrer restriction problem
 *   other Error      — network / unexpected status
 *
 * Returns array of restaurant objects shaped like mockRestaurantData entries.
 */
export async function searchRestaurants(lat, lng, cuisineFilters = [], priceFilter = null) {
  const maxprice = priceFilter != null ? SYMBOL_TO_MAXPRICE[priceFilter] : null;
  const cuisinesToQuery = cuisineFilters.slice(0, 3); // cap at 3 concurrent calls

  let raw;
  if (cuisinesToQuery.length === 0) {
    raw = await nearbySearch(lat, lng, null, maxprice);
  } else if (cuisinesToQuery.length === 1) {
    raw = await nearbySearch(lat, lng, CUISINE_KEYWORDS[cuisinesToQuery[0]], maxprice);
  } else {
    const settled = await Promise.allSettled(
      cuisinesToQuery.map(c => nearbySearch(lat, lng, CUISINE_KEYWORDS[c] ?? `${c} restaurant`, maxprice)),
    );
    const batches = settled.filter(s => s.status === 'fulfilled').map(s => s.value);
    if (batches.length === 0) {
      throw pickMostSpecificError(settled.map(s => s.reason));
    }
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

  return cuisineFiltered.slice(0, 20);
}

/**
 * A paged broad-food request for nearby discovery. Google controls the
 * maximum and order; a later page is available only with its next-page token.
 */
export async function searchRestaurantPage(
  lat,
  lng,
  cuisineFilters = [],
  priceFilter = null,
  pageToken = null,
) {
  const maxprice = priceFilter != null ? SYMBOL_TO_MAXPRICE[priceFilter] : null;
  const selectedCuisine = cuisineFilters.length === 1 ? cuisineFilters[0] : null;
  const keyword = selectedCuisine
    ? (CUISINE_KEYWORDS[selectedCuisine] || `${selectedCuisine} restaurant`)
    : 'food and drink';
  const { results, nextPageToken } = await restaurantPageSearch(
    lat, lng, keyword, maxprice, pageToken,
  );
  const parsed = parsePlaces(results, lat, lng)
    .filter(r => r.rating >= 3.5 && r.distance <= 5)
    .filter(r => cuisineFilters.length === 0 || r.cuisine.length === 0 ||
      r.cuisine.some(c => cuisineFilters.includes(c)))
    .sort((a, b) => b.rating - a.rating);

  return { results: parsed, nextPageToken };
}

const ACTIVITY_TYPES = {
  museums: ['museum', 'art_museum', 'history_museum'],
  galleries: ['art_gallery'],
  parks: ['park', 'city_park', 'botanical_garden'],
  shopping: ['shopping_mall'],
  theater: ['performing_arts_theater', 'opera_house'],
  liveMusic: ['live_music_venue', 'concert_hall'],
  sportsEvents: ['stadium', 'sports_club'],
  nightlife: ['night_club'],
  historicalSites: ['historical_place', 'historical_landmark'],
  foodMarkets: ['farmers_market'],
  cinema: ['movie_theater'],
  comedy: ['comedy_club'],
};

const ACTIVITY_ICONS = {
  museums: '🏛️', galleries: '🎨', parks: '🌳', shopping: '🛍️',
  theater: '🎭', liveMusic: '🎵', sportsEvents: '🏟️', nightlife: '🍸',
  historicalSites: '🏰', foodMarkets: '🥕', cinema: '🎬', comedy: '😂',
};

const activityCategoryFor = (primaryType, requestedCategories) =>
  requestedCategories.find(category => ACTIVITY_TYPES[category]?.includes(primaryType)) ?? null;

export async function searchActivities(lat, lng, categories = []) {
  const requestedCategories = categories.length > 0 ? categories : Object.keys(ACTIVITY_TYPES);
  const types = [...new Set(requestedCategories.flatMap(category => ACTIVITY_TYPES[category] || []))];
  const raw = await nearbySearch(lat, lng, null, null, 'tourist_attraction', types);

  return raw
    .filter(place => hasUsableGeometry(place) && place.business_status !== 'CLOSED_PERMANENTLY')
    .map(place => {
      const category = activityCategoryFor(place.primary_type, requestedCategories);
      if (!category) return null;
      const distance = parseFloat(haversineKm(
        lat, lng, place.geometry.location.lat, place.geometry.location.lng,
      ).toFixed(1));
      return {
        id: place.place_id,
        name: place.name || '',
        category,
        venueType: place.primary_type_display_name || null,
        image: ACTIVITY_ICONS[category],
        rating: parseFloat((place.rating || 4.0).toFixed(1)),
        duration: 1.5,
        distance,
        address: place.vicinity,
        coordinates: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${place.name || 'place'},${place.geometry.location.lat},${place.geometry.location.lng}`,
        )}`,
        source: 'google_places',
      };
    })
    .filter(Boolean)
    .filter(place => place.rating >= 3.5 && place.distance <= 5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20);
}
