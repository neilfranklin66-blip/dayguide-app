import {
  PLACE_RESOLUTION_ERROR,
  isValidPlaceQuery,
  normalizePlaceQuery,
  resolvePlaceQuery,
} from './placeResolutionApi';

const okResponse = payload => ({
  ok: true,
  status: 200,
  json: async () => payload,
});

const eustonCandidate = {
  id: 'euston-id',
  name: 'London Euston',
  address: 'Euston Road, London',
  coordinates: { lat: 51.5282, lng: -0.1337 },
  source: 'google_places',
};

test('normalizes and bounds explicit place queries before any request', async () => {
  const fetchImpl = jest.fn();

  expect(normalizePlaceQuery('  London   Euston  ')).toBe('London Euston');
  expect(isValidPlaceQuery('ab')).toBe(false);
  expect(isValidPlaceQuery('London Euston')).toBe(true);

  await expect(resolvePlaceQuery('x', fetchImpl)).rejects.toThrow(
    PLACE_RESOLUTION_ERROR.INVALID_QUERY,
  );
  expect(fetchImpl).not.toHaveBeenCalled();
});

test('calls only the same-origin resolver and creates route-capable place references', async () => {
  const fetchImpl = jest.fn().mockResolvedValue(
    okResponse({
      status: 'OK',
      candidates: [eustonCandidate],
    }),
  );

  const places = await resolvePlaceQuery('  London   Euston  ', fetchImpl);

  expect(fetchImpl).toHaveBeenCalledWith('/.netlify/functions/places-resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'London Euston' }),
  });
  expect(fetchImpl.mock.calls[0][0]).not.toContain('key=');
  expect(fetchImpl.mock.calls[0][0]).not.toContain('London Euston');
  expect(places).toEqual([
    expect.objectContaining(eustonCandidate),
  ]);
  expect(places[0].coordinates).not.toBe(eustonCandidate.coordinates);
});

test('returns an empty list only for a successful zero-result response', async () => {
  const fetchImpl = jest.fn().mockResolvedValue(
    okResponse({ status: 'ZERO_RESULTS', candidates: [] }),
  );

  await expect(resolvePlaceQuery('Unknown place', fetchImpl)).resolves.toEqual(
    [],
  );
});

test.each([
  [
    { status: 'REQUEST_DENIED', error_message: 'NO_API_KEY', candidates: [] },
    PLACE_RESOLUTION_ERROR.NO_API_KEY,
  ],
  [
    { status: 'REQUEST_DENIED', candidates: [] },
    PLACE_RESOLUTION_ERROR.API_DENIED,
  ],
  [
    { status: 'OVER_QUERY_LIMIT', candidates: [] },
    PLACE_RESOLUTION_ERROR.QUOTA_EXCEEDED,
  ],
])('maps provider status %p to %s', async (payload, expected) => {
  const fetchImpl = jest.fn().mockResolvedValue(okResponse(payload));

  await expect(resolvePlaceQuery('London Euston', fetchImpl)).rejects.toThrow(
    expected,
  );
});

test('distinguishes a missing resolver, network failure and malformed response', async () => {
  await expect(
    resolvePlaceQuery(
      'London Euston',
      jest.fn().mockResolvedValue({ ok: false, status: 404 }),
    ),
  ).rejects.toThrow(PLACE_RESOLUTION_ERROR.RESOLVER_UNAVAILABLE);

  await expect(
    resolvePlaceQuery(
      'London Euston',
      jest.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    ),
  ).rejects.toThrow(PLACE_RESOLUTION_ERROR.NETWORK_ERROR);

  await expect(
    resolvePlaceQuery(
      'London Euston',
      jest.fn().mockResolvedValue(okResponse({ status: 'OK', candidates: [{}] })),
    ),
  ).rejects.toThrow(PLACE_RESOLUTION_ERROR.INVALID_RESPONSE);
});

test('client source contains neither a browser key name nor a direct Google host', () => {
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(
    path.join(__dirname, 'placeResolutionApi.js'),
    'utf8',
  );

  expect(source).not.toContain('REACT_APP_GOOGLE_PLACES_API_KEY');
  expect(source).not.toContain('maps.googleapis.com');
});
