import { getRestaurantSourceFromError } from './restaurantEngine';

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
