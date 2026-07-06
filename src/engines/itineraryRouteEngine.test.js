import {
  getInitialSelectionRoute,
  getRouteAfterActivities,
  getRouteAfterRestaurants,
} from './itineraryRouteEngine';

test('getInitialSelectionRoute starts with activities by default', () => {
  expect(getInitialSelectionRoute()).toBe('activities');
  expect(getInitialSelectionRoute({ startWith: 'activities' })).toBe('activities');
});

test('getInitialSelectionRoute starts with restaurants for food and drinks first', () => {
  expect(getInitialSelectionRoute({ startWith: 'food_drinks' })).toBe('restaurants');
});

test('getRouteAfterRestaurants goes to timeline for activity-first planning', () => {
  expect(getRouteAfterRestaurants()).toBe('timeline');
  expect(getRouteAfterRestaurants({ startWith: 'activities' })).toBe('timeline');
});

test('getRouteAfterRestaurants goes to activities for food and drinks first', () => {
  expect(getRouteAfterRestaurants({ startWith: 'food_drinks' })).toBe('activities');
});

test('getRouteAfterActivities goes to meal prompt for activity-first planning', () => {
  expect(getRouteAfterActivities()).toBe('meal-prompt');
  expect(getRouteAfterActivities({ startWith: 'activities' })).toBe('meal-prompt');
});

test('getRouteAfterActivities goes to timeline for food and drinks first', () => {
  expect(getRouteAfterActivities({ startWith: 'food_drinks' })).toBe('timeline');
});
