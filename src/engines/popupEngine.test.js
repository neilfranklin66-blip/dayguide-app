import {
  findNearbyRestaurantSuggestion,
  getPopupMessage,
  getTimelinePopupSuggestion,
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

test('hasLongActivityRun returns false when a long activity run is followed by food and drinks', () => {
  const timeline = [
    { category: 'museums', duration: 2 },
    { type: 'food_drink', category: 'Food and Drinks', duration: 1 },
  ];

  expect(hasLongActivityRun({
    timeline,
    activityCategories,
    thresholdHours: 2,
  })).toBe(false);
});

test('hasLongActivityRun returns true when food and drinks is followed by a long activity run', () => {
  const timeline = [
    { type: 'food_drink', category: 'Food and Drinks', duration: 1 },
    { category: 'museums', duration: 2 },
  ];

  expect(hasLongActivityRun({
    timeline,
    activityCategories,
    thresholdHours: 2,
  })).toBe(true);
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

test('getPopupMessage builds the nearby restaurant popup message', () => {
  const t = (key, params) => {
    if (key.startsWith('cuisine.')) return key.replace('cuisine.', '');
    if (params) return `${key}:${params.cuisine}:${params.name}:${params.distance}`;
    return key;
  };

  const popup = {
    type: 'nearbyRestaurant',
    restaurant: {
      name: 'Dishoom',
      cuisine: ['indian'],
      distance: 0.42,
    },
  };

  expect(getPopupMessage({ popup, t })).toBe(
    'popups.nearbyRestaurant.message:indian:Dishoom:420'
  );
});

test('getPopupMessage falls back to the generic popup message key', () => {
  const t = key => key;

  expect(getPopupMessage({
    popup: { type: 'coffeeBreak' },
    t,
  })).toBe('popups.coffeeBreak.message');
});

test('getPopupMessage returns an empty string when there is no popup', () => {
  const t = key => key;

  expect(getPopupMessage({
    popup: null,
    t,
  })).toBe('');
});

test('getTimelinePopupSuggestion returns the nearby restaurant popup first', () => {
  const restaurants = [
    { name: 'Good Nearby', distance: 0.4, rating: 4.4 },
  ];
  const timeline = [
    { category: 'museums', duration: 2 },
  ];

  expect(getTimelinePopupSuggestion({
    restaurants,
    timeline,
    activityCategories,
    canShowPopup: () => true,
  })).toEqual({
    type: 'nearbyRestaurant',
    restaurant: restaurants[0],
  });
});

test('getTimelinePopupSuggestion returns coffee break when nearby restaurant is unavailable', () => {
  const timeline = [
    { category: 'museums', duration: 1 },
    { category: 'parks', duration: 1 },
  ];

  expect(getTimelinePopupSuggestion({
    restaurants: [],
    timeline,
    activityCategories,
    canShowPopup: () => true,
  })).toEqual({ type: 'coffeeBreak' });
});

test('getTimelinePopupSuggestion returns activity break when there are no activities', () => {
  const timeline = [
    { category: 'cafe', duration: 1 },
    { category: 'thai', duration: 1 },
  ];

  expect(getTimelinePopupSuggestion({
    restaurants: [],
    timeline,
    activityCategories,
    canShowPopup: type => type !== 'coffeeBreak',
  })).toEqual({ type: 'activityBreak' });
});

test('getTimelinePopupSuggestion returns null when no popup qualifies', () => {
  expect(getTimelinePopupSuggestion({
    restaurants: [],
    timeline: [{ category: 'museums', duration: 0.5 }],
    activityCategories,
    canShowPopup: () => true,
  })).toBeNull();
});
