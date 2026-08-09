import { getLiveSearchSourceFromError } from './liveSearchOutcome';

test.each([
  ['NO_API_KEY', 'no_key'],
  ['API_DENIED', 'no_key'],
  ['QUOTA_EXCEEDED', 'quota'],
  ['INCOMPLETE_REQUEST', 'bad_request'],
  ['NO_LOCATION', 'no_location'],
  ['LOCATION_DENIED', 'location_denied'],
  ['NETWORK_ERROR', 'network'],
  ['UNEXPECTED_PROVIDER_RESPONSE', 'error'],
])('maps %s to %s', (message, source) => {
  expect(getLiveSearchSourceFromError(new Error(message))).toBe(source);
});
