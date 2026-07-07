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

test('live results produce a ranked queue with source live', () => {
  const outcome = resolveRestaurantSearchOutcome({
    results: [liveResult()],
    selectedRestaurants: [],
    cuisines: ['italian'],
    price: '$$',
    hasChildren: false,
  });

  expect(outcome.source).toBe('live');
  expect(outcome.queue.map(card => card.name)).toContain('Live Bistro');
});

test('a sparse live result missing all optional fields still produces a live queue without crashing', () => {
  const outcome = resolveRestaurantSearchOutcome({
    results: [{ id: 'sparse-1', name: 'Sparse Bistro' }],
    selectedRestaurants: [],
    cuisines: ['italian'],
    price: '$$',
    hasChildren: true,
  });

  expect(outcome.source).toBe('live');
  const card = outcome.queue.find(c => c.id === 'sparse-1');
  expect(card).toBeDefined();
  expect(card.rating).toBeNull();
  expect(card.priceRange).toBeNull();
  expect(card.cuisine).toEqual([]);
});

// Mock venues must never be surfaced as real nearby recommendations, so a
// failed or empty live search yields an empty queue and only the source label
// for the UI to explain what happened.

test('live results fully deduped by prior selections produce an empty queue with source no_results', () => {
  const outcome = resolveRestaurantSearchOutcome({
    results: [liveResult()],
    selectedRestaurants: [{ id: 'live-1', name: 'Live Bistro' }],
    cuisines: [],
    price: null,
    hasChildren: null,
  });

  expect(outcome.source).toBe('no_results');
  expect(outcome.queue).toEqual([]);
});

test('an empty live search produces an empty queue with source no_results, never mock cards', () => {
  const outcome = resolveRestaurantSearchOutcome({
    results: [],
    selectedRestaurants: [],
    cuisines: [],
    price: null,
    hasChildren: null,
  });

  expect(outcome.source).toBe('no_results');
  expect(outcome.queue).toEqual([]);
});

test.each([
  ['NO_API_KEY', 'no_key'],
  ['QUOTA_EXCEEDED', 'quota'],
  ['NO_LOCATION', 'no_location'],
  ['NETWORK_ERROR', 'error'],
])('error %s produces an empty queue with source %s, never mock cards', (message, source) => {
  const outcome = resolveRestaurantSearchOutcome({
    error: new Error(message),
    selectedRestaurants: [],
    cuisines: [],
    price: null,
    hasChildren: null,
  });

  expect(outcome.source).toBe(source);
  expect(outcome.queue).toEqual([]);
});
