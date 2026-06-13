/**
 * PlaceCard model definition and helpers.
 * This file documents the canonical internal PlaceCard shape and provides
 * a small runtime validator to help during migration.
 */

export const PLACE_CARD_DEFAULT = {
  id: null,
  name: null,
  type: null, // 'food_drink' | 'activity' | 'event' | 'attraction' | 'place'
  category: null, // user-facing category, e.g. 'Food and Drinks', 'Activities', 'Events'
  subCategory: null, // specific venue type, e.g. 'Restaurant', 'Cafe', 'Bar', 'Museum'
  cuisine: null, // array of cuisine types (for food venues)
  rating: null,
  priceRange: null,
  distanceMeters: null, // CANONICAL: always in metres
  distanceKm: null, // explicit kilometre field matching source/mock values
  distanceMiles: null, // future/display-ready field in miles
  walkingTimeMinutes: null,
  durationMinutes: null,
  address: null,
  photoUrl: null,
  mapsUrl: null,
  reason: null,
  source: null,
  vendorData: {},
  metadata: {
    energyLevel: null, // 'low' | 'medium' | 'high' | null
    isAnchorCapable: false,
    isFamilyFriendly: null,
    isOpenNow: null,
  },
};

/**
 * Lightweight runtime validator — returns true for objects that look like PlaceCards.
 * This is intentionally permissive to ease migration; stricter checks may be added
 * in later stages.
 */
export function isPlaceCard(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (!obj.id || typeof obj.id !== 'string') return false;
  if (!obj.name || typeof obj.name !== 'string') return false;
  if (!obj.source || typeof obj.source !== 'string') return false;
  return true;
}

const placeCardModel = {
  PLACE_CARD_DEFAULT,
  isPlaceCard,
};

export default placeCardModel;
