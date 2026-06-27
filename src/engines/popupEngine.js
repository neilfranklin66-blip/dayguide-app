export const findNearbyRestaurantSuggestion = ({
  restaurants = [],
  timeline = [],
  maxDistanceKm = 0.5,
  minRating = 4.3,
}) =>
  restaurants.find(restaurant =>
    restaurant.distance <= maxDistanceKm &&
    restaurant.rating >= minRating &&
    !timeline.some(item => item.activity === restaurant.name)
  );

export const hasLongActivityRun = ({
  timeline = [],
  activityCategories = new Set(),
  thresholdHours = 2,
}) => {
  let consecutive = 0;

  for (const item of timeline) {
    if (activityCategories.has(item.category)) {
      consecutive += item.duration;

      if (consecutive >= thresholdHours) {
        return true;
      }
    } else {
      consecutive = 0;
    }
  }

  return false;
};

export const shouldSuggestActivityBreak = ({
  timeline = [],
  activityCategories = new Set(),
  minItems = 2,
}) =>
  timeline.length >= minItems &&
  !timeline.some(item => activityCategories.has(item.category));

export const getPopupMessage = ({
  popup,
  t,
}) => {
  if (!popup) return '';

  if (popup.type === 'nearbyRestaurant' && popup.restaurant) {
    const restaurant = popup.restaurant;
    const cuisineLabel = (restaurant.cuisine || [])
      .map(cuisine => t(`cuisine.${cuisine}`))
      .join('/');
    const distanceM = Math.round(restaurant.distance * 1000);

    return t('popups.nearbyRestaurant.message', {
      cuisine: cuisineLabel,
      name: restaurant.name,
      distance: distanceM,
    });
  }

  return t(`popups.${popup.type}.message`);
};
