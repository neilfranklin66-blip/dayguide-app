export const getInitialSelectionRoute = ({ startWith = 'activities' } = {}) =>
  startWith === 'food_drinks' ? 'restaurants' : 'activities';

export const getRouteAfterRestaurants = ({ startWith = 'activities' } = {}) =>
  startWith === 'food_drinks' ? 'activities' : 'timeline';

export const getRouteAfterActivities = ({ startWith = 'activities' } = {}) =>
  startWith === 'food_drinks' ? 'timeline' : 'meal-prompt';
