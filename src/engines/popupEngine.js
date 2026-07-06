export const getRestaurantSuggestionKey = (restaurant) =>
  restaurant?.place_id || restaurant?.id || restaurant?.name || null;

export const findNearbyRestaurantSuggestion = ({
  restaurants = [],
  timeline = [],
  dismissedRestaurantKeys = new Set(),
  maxDistanceKm = 0.5,
  minRating = 4.3,
}) =>
  restaurants.find(restaurant => {
    const restaurantKey = getRestaurantSuggestionKey(restaurant);

    return (
      restaurant.distance <= maxDistanceKm &&
      restaurant.rating >= minRating &&
      !timeline.some(item => item.activity === restaurant.name) &&
      (!restaurantKey || !dismissedRestaurantKeys.has(restaurantKey))
    );
  });

export const hasLongActivityRun = ({
  timeline = [],
  activityCategories = new Set(),
  thresholdHours = 2,
}) => {
  let consecutive = 0;

  for (const item of timeline) {
    if (activityCategories.has(item.category)) {
      consecutive += item.duration;
    } else {
      consecutive = 0;
    }
  }

  return consecutive >= thresholdHours;
};

export const shouldSuggestActivityBreak = ({
  timeline = [],
  activityCategories = new Set(),
  minItems = 2,
}) =>
  timeline.length >= minItems &&
  !timeline.some(item => activityCategories.has(item.category));

export const getTimelinePopupSuggestion = ({
  restaurants = [],
  timeline = [],
  activityCategories = new Set(),
  canShowPopup = () => true,
  maxDistanceKm = 0.5,
  minRating = 4.3,
  activityThresholdHours = 2,
  activityBreakMinItems = 2,
  dismissedRestaurantKeys = new Set(),
}) => {
  if (canShowPopup('nearbyRestaurant')) {
    const nearby = findNearbyRestaurantSuggestion({
      restaurants,
      timeline,
      maxDistanceKm,
      minRating,
      dismissedRestaurantKeys,
    });

    if (nearby) {
      return { type: 'nearbyRestaurant', restaurant: nearby };
    }
  }

  if (
    canShowPopup('coffeeBreak') &&
    hasLongActivityRun({
      timeline,
      activityCategories,
      thresholdHours: activityThresholdHours,
    })
  ) {
    return { type: 'coffeeBreak' };
  }

  if (
    canShowPopup('activityBreak') &&
    shouldSuggestActivityBreak({
      timeline,
      activityCategories,
      minItems: activityBreakMinItems,
    })
  ) {
    return { type: 'activityBreak' };
  }

  return null;
};
export const getPopupYesAction = (popup) => {
  if (!popup) return null;

  if (popup.type === 'nearbyRestaurant' || popup.type === 'coffeeBreak') {
    return 'restaurants';
  }

  if (popup.type === 'activityBreak') {
    return 'activitiesThenTimeline';
  }

  return null;
};

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
