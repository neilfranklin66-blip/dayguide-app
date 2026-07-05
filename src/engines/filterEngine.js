import { ADULT_ONLY_CATEGORIES } from '../config/dayGuideOptions';

const hasSameIdentity = (a, b) => a.id === b.id || a.name === b.name;

export const excludeAlreadySelected = (items, selectedItems = []) =>
  items.filter(item => !selectedItems.some(selected => hasSameIdentity(item, selected)));

export const getActivitiesForInterests = ({
  activityData,
  interests = [],
  selectedActivities = [],
  hasChildren = null,
  limit = 10,
  shuffle = true,
}) => {
  const seen = new Set();
  const all = [];
  // Explicit interests are respected as-is; the implicit all-categories pool
  // drops adult-only categories when children are in the party. The
  // already-selected fallback below draws from the same pool, so adult-only
  // categories cannot be reintroduced there.
  const categories = interests.length > 0
    ? interests
    : Object.keys(activityData).filter(
        category => !(hasChildren === true && ADULT_ONLY_CATEGORIES.includes(category))
      );

  categories.forEach(category => {
    (activityData[category] || []).forEach(activity => {
      if (!seen.has(activity.id)) {
        all.push(activity);
        seen.add(activity.id);
      }
    });
  });

  const filtered = excludeAlreadySelected(all, selectedActivities);
  const pool = filtered.length > 0 ? filtered : all;
  const ordered = shuffle ? [...pool].sort(() => Math.random() - 0.5) : [...pool];

  return ordered.slice(0, limit);
};

export const filterRestaurants = ({
  restaurants,
  cuisines = [],
  price = null,
  selectedRestaurants = [],
  maxDistanceKm = 5,
}) =>
  restaurants.filter(restaurant => {
    if (restaurant.distance > maxDistanceKm) return false;
    if (cuisines.length > 0 && !restaurant.cuisine.some(cuisine => cuisines.includes(cuisine))) return false;
    if (price && restaurant.priceRange !== price) return false;
    if (selectedRestaurants.some(selected => hasSameIdentity(restaurant, selected))) return false;
    return true;
  });

// The no-results hint reports km because the locale strings are km-based;
// distanceKm is preferred, with the legacy `distance` field (also km) as backup.
const getUsableDistanceKm = (restaurant) => {
  if (Number.isFinite(restaurant?.distanceKm)) return restaurant.distanceKm;
  if (Number.isFinite(restaurant?.distance)) return restaurant.distance;
  return null;
};

export const findNearestRestaurant = (restaurants) => {
  if (!Array.isArray(restaurants)) return null;

  let nearest = null;
  let nearestDistance = null;

  restaurants.forEach(restaurant => {
    const distance = getUsableDistanceKm(restaurant);
    if (distance === null) return;
    if (nearestDistance === null || distance < nearestDistance) {
      nearest = restaurant;
      nearestDistance = distance;
    }
  });

  return nearest ? { name: nearest.name, distance: nearestDistance } : null;
};

export const buildRestaurantQueue = ({
  restaurants,
  cuisines = [],
  price = null,
  selectedRestaurants = [],
  maxDistanceKm = 5,
  limit = 8,
  shuffle = true,
}) => {
  const filtered = filterRestaurants({
    restaurants,
    cuisines,
    price,
    selectedRestaurants,
    maxDistanceKm,
  });

  const ordered = shuffle ? [...filtered].sort(() => Math.random() - 0.5) : [...filtered];

  return ordered.slice(0, limit);
};
