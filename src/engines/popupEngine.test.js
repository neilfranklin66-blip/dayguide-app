import {
  findNearbyRestaurantSuggestion,
  hasLongActivityRun,
  shouldSuggestActivityBreak,
} from './popupEngine';

const activityCategories = new Set(['museums', 'parks']);

test('hasLongActivityRun returns true for consecutive activity duration meeting the threshold', () => {
  const timeline = [
    { category: 'museums', duration: 1 },
    { category: 'parks', duration: 1 },
  ];

  expect(hasLongActivityRun({
    timeline,
    activityCategories,
    thresholdHours: 2,
  })).toBe(true);
});

test('hasLongActivityRun resets consecutive duration after a non-activity item', () => {
  const timeline = [
    { category: 'museums', duration: 1.5 },
    { category: 'cafe', duration: 0.5 },
    { category: 'parks', duration: 0.75 },
  ];

  expect(hasLongActivityRun({
    timeline,
    activityCategories,
    thresholdHours: 2,
  })).toBe(false);
});

test('shouldSuggestActivityBreak returns true when a multi-item timeline has no activities', () => {
  const timeline = [
    { category: 'cafe', duration: 1 },
    { category: 'thai', duration: 1 },
  ];

  expect(shouldSuggestActivityBreak({
    timeline,
    activityCategories,
    minItems: 2,
  })).toBe(true);
});

test('shouldSuggestActivityBreak returns false for a single restaurant item', () => {
  const timeline = [
    { category: 'cafe', duration: 1 },
  ];

  expect(shouldSuggestActivityBreak({
    timeline,
    activityCategories,
    minItems: 2,
  })).toBe(false);
});

test('shouldSuggestActivityBreak returns false when the timeline includes an activity', () => {
  const timeline = [
    { category: 'cafe', duration: 1 },
    { category: 'museums', duration: 1 },
  ];

  expect(shouldSuggestActivityBreak({
    timeline,
    activityCategories,
    minItems: 2,
  })).toBe(false);
});

test('findNearbyRestaurantSuggestion returns the first matching nearby restaurant', () => {
  const restaurants = [
    { name: 'Too Far', distance: 0.8, rating: 4.8 },
    { name: 'Good Nearby', distance: 0.4, rating: 4.4 },
    { name: 'Also Good Nearby', distance: 0.3, rating: 4.7 },
  ];

  expect(findNearbyRestaurantSuggestion({
    restaurants,
    timeline: [],
    maxDistanceKm: 0.5,
    minRating: 4.3,
  })).toEqual(restaurants[1]);
});

test('findNearbyRestaurantSuggestion ignores restaurants already in the timeline', () => {
  const restaurants = [
    { name: 'Already Planned', distance: 0.4, rating: 4.8 },
    { name: 'Replacement', distance: 0.3, rating: 4.5 },
  ];
  const timeline = [
    { activity: 'Already Planned' },
  ];

  expect(findNearbyRestaurantSuggestion({
    restaurants,
    timeline,
    maxDistanceKm: 0.5,
    minRating: 4.3,
  })).toEqual(restaurants[1]);
});

test('findNearbyRestaurantSuggestion returns undefined when no restaurant qualifies', () => {
  const restaurants = [
    { name: 'Too Far', distance: 0.8, rating: 4.8 },
    { name: 'Too Low Rated', distance: 0.3, rating: 4.1 },
  ];

  expect(findNearbyRestaurantSuggestion({
    restaurants,
    timeline: [],
    maxDistanceKm: 0.5,
    minRating: 4.3,
  })).toBeUndefined();
});
