import { PLACE_CARD_DEFAULT } from '../models/placeCard';

/**
 * placeCardAdapter
 * - Exposes conversion functions to normalize mock restaurant and Google Places data
 *   into stable internal PlaceCard shape.
 * - Includes batch helpers `mapFromMockArray` and `mapFromPlacesArray`.
 *
 * DISTANCE FIELD STRATEGY (Stage 1 behaviour):
 * - Canonical field: `distanceMeters` (always in metres; unambiguous)
 * - Explicit field: `distanceKm` (kilometres; matches current mock source and UI)
 * - Display-ready field: `distanceMiles` (available for future US/UK preference)
 * - Legacy alias: `distance` (kilometres for current Stage 1 UI behaviour)
 * - Note: Do not change current DayGuide.jsx km labels or locale strings in Stage 1.
 *
 * PRICE RANGE FIELD:
 * - `priceRange` is a symbolic budget scale (e.g. '$', '$$', '$$$'), not a currency.
 * - Do not localize or replace the $ symbol; treat as a universal budget gauge icon.
 */

const DEFAULT_WALKING_SPEED_M_PER_MIN = 83.33; // 5 km/h -> 5000m / 60 = 83.33 m/min

export const PLACE_CARD_SOURCES = {
  MOCK_RESTAURANT: 'mock_restaurant_data',
  GOOGLE_PLACES: 'google_places',
};

export const FOOD_DRINK_SUBCATEGORIES = {
  RESTAURANT: 'Restaurant',
  CAFE: 'Cafe',
  BAR: 'Bar',
  PUB: 'Pub',
  BAKERY: 'Bakery',
  COFFEE_SHOP: 'Coffee Shop',
};

export function getDefaultPlaceCardMetadata() {
  return {
    energyLevel: null,
    isAnchorCapable: false,
    isFamilyFriendly: null,
    isOpenNow: null,
  };
}

function createPlaceCard(fields) {
  return Object.assign({}, PLACE_CARD_DEFAULT, fields);
}

function metersToMiles(meters) {
  if (typeof meters !== 'number') return null;
  return Math.round((meters / 1609.34) * 10) / 10; // 1 mile = 1609.34 meters; round to 1 decimal
}

function metersToKilometres(meters) {
  if (typeof meters !== 'number') return null;
  return Math.round((meters / 1000) * 10) / 10; // round to 1 decimal
}

function buildLegacyAliases({ photoUrl, distanceMeters, duration, cuisine }) {
  const distanceKm = metersToKilometres(distanceMeters);
  const distanceMiles = metersToMiles(distanceMeters);
  return {
    image: photoUrl,
    distance: distanceKm, // legacy field: kilometres for current Stage 1 UI behaviour
    distanceKm,
    distanceMiles, // future/display-ready field, not currently used by UI
    duration: duration ?? null,
    cuisine: cuisine ?? [],
  };
}

export function normalizePlaceId(id) {
  if (id == null) return null;
  return String(id);
}

function kmToMeters(km) {
  if (typeof km !== 'number') return null;
  return Math.round(km * 1000);
}

function hoursToMinutes(hours) {
  if (typeof hours !== 'number') return null;
  return Math.round(hours * 60);
}

function estimateWalkingMinutesFromMeters(meters) {
  if (typeof meters !== 'number') return null;
  return Math.max(1, Math.round(meters / DEFAULT_WALKING_SPEED_M_PER_MIN));
}

function buildMapsSearchUrl(name, address) {
  const q = `${name || ''} ${address || ''}`.trim();
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/**
 * Convert a mock restaurant object (mockRestaurantData.json entry) to a PlaceCard.
 * Assumes mock fields: id (number), name, city, cuisine (array), priceRange, rating, duration (hours), distance (km), address, image
 *
 * Maps to:
 *   type: 'food_drink' (supports broader food/drink venues)
 *   category: 'Food and Drinks' (user-facing category)
 *   subCategory: 'Restaurant' (specific venue type)
 *   cuisine: preserved as detail field
 */
export function fromMockRestaurant(r) {
  const distanceMeters = kmToMeters(r.distance);
  const durationMinutes = hoursToMinutes(r.duration);
  const photoUrl = r.image || null;
  const mapsUrl = buildMapsSearchUrl(r.name, r.address);
  const cuisineArray = r.cuisine ?? [];

  const base = {
    id: normalizePlaceId(r.id),
    name: r.name || null,
    type: 'food_drink',
    category: 'Food and Drinks',
    subCategory: FOOD_DRINK_SUBCATEGORIES.RESTAURANT,
    cuisine: cuisineArray,
    rating: typeof r.rating === 'number' ? r.rating : null,
    priceRange: r.priceRange ?? null,
    distanceMeters,
    walkingTimeMinutes: estimateWalkingMinutesFromMeters(distanceMeters),
    durationMinutes,
    address: r.address ?? null,
    photoUrl,
    mapsUrl,
    reason: null,
    source: PLACE_CARD_SOURCES.MOCK_RESTAURANT,
    vendorData: { raw: r },
    metadata: getDefaultPlaceCardMetadata(),
  };

  return createPlaceCard({
    ...base,
    ...buildLegacyAliases({
      photoUrl,
      distanceMeters,
      duration: r.duration,
      cuisine: cuisineArray,
    }),
  });
}

/**
 * Convert a Google Places-like parsed object (as returned by src/api/placesApi.parsePlaces)
 * to a PlaceCard.
 *
 * Maps to:
 *   type: 'food_drink' (supports broader food/drink venues)
 *   category: 'Food and Drinks' (user-facing category)
 *   subCategory: 'Restaurant' (specific venue type)
 *   cuisine: preserved as detail field
 */
export function fromPlacesParsed(p) {
  const distanceMeters = kmToMeters(p.distance);
  const durationMinutes = hoursToMinutes(p.duration);
  const photoUrl = p.image || null;
  const mapsUrl = p.place_id
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}&query_place_id=${encodeURIComponent(p.id)}`
    : buildMapsSearchUrl(p.name, p.address);
  const cuisineArray = p.cuisine ?? [];

  const base = {
    id: normalizePlaceId(p.id),
    name: p.name || null,
    type: 'food_drink',
    category: 'Food and Drinks',
    subCategory: FOOD_DRINK_SUBCATEGORIES.RESTAURANT,
    cuisine: cuisineArray,
    rating: typeof p.rating === 'number' ? p.rating : null,
    priceRange: p.priceRange ?? null,
    distanceMeters,
    walkingTimeMinutes: estimateWalkingMinutesFromMeters(distanceMeters),
    durationMinutes,
    address: p.address ?? null,
    photoUrl,
    mapsUrl,
    reason: null,
    source: PLACE_CARD_SOURCES.GOOGLE_PLACES,
    vendorData: { raw: p },
    metadata: getDefaultPlaceCardMetadata(),
  };

  return createPlaceCard({
    ...base,
    ...buildLegacyAliases({
      photoUrl,
      distanceMeters,
      duration: p.duration,
      cuisine: cuisineArray,
    }),
  });
}

export function mapFromMockArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(fromMockRestaurant);
}

export function mapFromPlacesArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(fromPlacesParsed);
}

const placeCardAdapter = {
  fromMockRestaurant,
  fromPlacesParsed,
  mapFromMockArray,
  mapFromPlacesArray,
};

export default placeCardAdapter;
