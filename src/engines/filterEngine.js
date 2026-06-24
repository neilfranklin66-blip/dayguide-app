const hasSameIdentity = (a, b) => a.id === b.id || a.name === b.name;

export const excludeAlreadySelected = (items, selectedItems = []) =>
  items.filter(item => !selectedItems.some(selected => hasSameIdentity(item, selected)));

export const getActivitiesForInterests = ({
  activityData,
  interests = [],
  selectedActivities = [],
  limit = 10,
  shuffle = true,
}) => {
  const seen = new Set();
  const all = [];
  const categories = interests.length > 0 ? interests : Object.keys(activityData);

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
