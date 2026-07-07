import {
  getRestaurantSourceFromError,
  resolveRestaurantSearchOutcome,
} from './restaurantEngine';

test('getRestaurantSourceFromError maps missing API key errors', () => {
  expect(getRestaurantSourceFromError(new Error('NO_API_KEY'))).toBe('no_key');
});

test('getRestaurantSourceFromError maps quota errors', () => {
  expect(getRestaurantSourceFromError(new Error('QUOTA_EXCEEDED'))).toBe('quota');
});

test('getRestaurantSourceFromError maps missing location errors', () => {
  expect(getRestaurantSourceFromError(new Error('NO_LOCATION'))).toBe('no_location');
});

test('getRestaurantSourceFromError falls back to error for unknown errors', () => {
  expect(getRestaurantSourceFromError(new Error('NETWORK_ERROR'))).toBe('error');
});

test('getRestaurantSourceFromError falls back to error when no error is provided', () => {
  expect(getRestaurantSourceFromError()).toBe('error');
});

// --- resolveRestaurantSearchOutcome ---

// Google Places-parsed shape as returned by placesApi.parsePlaces.
const liveResult = (overrides = {}) => ({
  id: 'live-1',
  place_id: 'live-1',
  name: 'Live Bistro',
  cuisine: ['italian'],
  rating: 4.6,
  priceRange: '$$',
  distance: 0.6,
  duration: 1.5,
  address: '1 Test Street',
  image: 'https://example.com/live.jpg',
  ...overrides,
});

// mockRestaurantData.json entry shape.
const mockRestaurant = (overrides = {}) => ({
  id: 1,
  name: 'Mock Trattoria',
  cuisine: ['italian'],
  rating: 4.4,
  priceRange: '$$',
  distance: 1.2,
  duration: 1.5,
  address: '2 Mock Lane',
  image: 'https://example.com/mock.jpg',
  familyFriendly: true,
  ...overrides,
});

test('live results produce a ranked queue with source live and no nearest hint', () => {
  const outcome = resolveRestaurantSearchOutcome({
    results: [liveResult()],
    mockRestaurants: [mockRestaurant()],
    selectedRestaurants: [],
    cuisines: ['italian'],
    price: '$$',
    hasChildren: false,
  });

  expect(outcome.source).toBe('live');
  expect(outcome.queue.map(card => card.name)).toContain('Live Bistro');
  expect(outcome.nearestHint).toBeNull();
});

test('a sparse live result missing all optional fields still produces a live queue without crashing', () => {
  const outcome = resolveRestaurantSearchOutcome({
    results: [{ id: 'sparse-1', name: 'Sparse Bistro' }],
    mockRestaurants: [mockRestaurant()],
    selectedRestaurants: [],
    cuisines: ['italian'],
    price: '$$',
    hasChildren: true,
  });

  expect(outcome.source).toBe('live');
  expect(outcome.nearestHint).toBeNull();
  const card = outcome.queue.find(c => c.id === 'sparse-1');
  expect(card).toBeDefined();
  expect(card.rating).toBeNull();
  expect(card.priceRange).toBeNull();
  expect(card.cuisine).toEqual([]);
});

test('live results fully deduped by prior selections fall back to the mock queue with source no_results', () => {
  const outcome = resolveRestaurantSearchOutcome({
    results: [liveResult()],
    mockRestaurants: [mockRestaurant()],
    selectedRestaurants: [{ id: 'live-1', name: 'Live Bistro' }],
    cuisines: [],
    price: null,
    hasChildren: null,
  });

  expect(outcome.source).toBe('no_results');
  const names = outcome.queue.map(card => card.name);
  expect(names).toContain('Mock Trattoria');
  expect(names).not.toContain('Live Bistro');
  expect(outcome.nearestHint).toBeNull();
});

test.each([
  ['NO_API_KEY', 'no_key'],
  ['QUOTA_EXCEEDED', 'quota'],
  ['NO_LOCATION', 'no_location'],
  ['NETWORK_ERROR', 'error'],
])('error %s falls back to the mock queue with source %s', (message, source) => {
  const outcome = resolveRestaurantSearchOutcome({
    error: new Error(message),
    mockRestaurants: [mockRestaurant()],
    selectedRestaurants: [],
    cuisines: [],
    price: null,
    hasChildren: null,
  });

  expect(outcome.source).toBe(source);
  expect(outcome.queue.map(card => card.name)).toContain('Mock Trattoria');
  expect(outcome.nearestHint).toBeNull();
});

test('fallback filters matching nothing produce an empty queue and a nearest hint from the full mock list', () => {
  const outcome = resolveRestaurantSearchOutcome({
    error: new Error('NO_API_KEY'),
    mockRestaurants: [
      mockRestaurant({ id: 1, name: 'Far Diner', distance: 3.4 }),
      mockRestaurant({ id: 2, name: 'Near Cafe', distance: 0.4 }),
    ],
    selectedRestaurants: [],
    cuisines: ['japanese'],
    price: null,
    hasChildren: null,
  });

  expect(outcome.source).toBe('no_key');
  expect(outcome.queue).toEqual([]);
  expect(outcome.nearestHint).toEqual({ name: 'Near Cafe', distance: 0.4 });
});
