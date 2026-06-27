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
