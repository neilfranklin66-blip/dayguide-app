import {
  getRestaurantSourceFromError,
  resolveRestaurantSearchOutcome,
} from './restaurantEngine';
import {
  RESTAURANT_UNAVAILABLE_REASONS,
  LIVE_SEARCH_FAILURE_SOURCES,
} from '../config/dayGuideOptions';

test.each([
  // DayGuide's own configuration. A rejected key reads to the user the same as
  // no key at all: live search is not correctly set up.
  ['NO_API_KEY', 'no_key'],
  ['API_DENIED', 'no_key'],
  ['QUOTA_EXCEEDED', 'quota'],
  // DayGuide could not even form the request.
  ['INCOMPLETE_REQUEST', 'bad_request'],
  // The user can act on these.
  ['NO_LOCATION', 'no_location'],
  ['LOCATION_DENIED', 'location_denied'],
  // Outside DayGuide's control.
  ['NETWORK_ERROR', 'network'],
])('getRestaurantSourceFromError maps %s to source %s', (message, source) => {
  expect(getRestaurantSourceFromError(new Error(message))).toBe(source);
});

test.each([
  ['an unrecognised message', new Error('STATUS_INVALID_REQUEST')],
  ['an HTTP status message', new Error('HTTP_500')],
  ['no error at all', undefined],
  ['an error without a message', {}],
])('getRestaurantSourceFromError falls back to error for %s', (_label, error) => {
  expect(getRestaurantSourceFromError(error)).toBe('error');
});

// A source label is only useful if the UI has copy for it. Guard the seam
// between the two modules rather than trusting them to stay in step.
test('every source getRestaurantSourceFromError can return has an unavailable reason', () => {
  const messages = [
    'NO_API_KEY', 'API_DENIED', 'QUOTA_EXCEEDED', 'INCOMPLETE_REQUEST',
    'NO_LOCATION', 'LOCATION_DENIED', 'NETWORK_ERROR', 'ANYTHING_ELSE',
  ];

  messages.forEach(message => {
    const source = getRestaurantSourceFromError(new Error(message));
    expect(RESTAURANT_UNAVAILABLE_REASONS).toHaveProperty(source);
    expect(LIVE_SEARCH_FAILURE_SOURCES.has(source)).toBe(true);
  });
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
  ['LOCATION_DENIED', 'location_denied'],
  ['INCOMPLETE_REQUEST', 'bad_request'],
  ['NETWORK_ERROR', 'network'],
  ['STATUS_UNKNOWN', 'error'],
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
