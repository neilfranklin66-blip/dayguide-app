import {
  ROUTE_PROVIDER_ERROR,
  resolveGoogleRouteEvidence,
} from './routeEvidenceApi';

const ID_TOKEN = 'short-lived-firebase-id-token';

const batch = {
  context: {
    date: '2026-07-26',
    timezone: 'Europe/London',
    travelMode: 'transit',
  },
  requests: [
    {
      id: 'start->anchor',
      fromPlace: {
        coordinates: { lat: 51.5282, lng: -0.1337 },
      },
      toPlace: {
        coordinates: { lat: 51.5033, lng: -0.1195 },
      },
      travelMode: 'transit',
      departureLocalDateTime: '2026-07-26T17:15',
      arrivalTargetLocalDateTime: '2026-07-26T18:20',
      timezone: 'Europe/London',
    },
  ],
};

const response = (payload, overrides = {}) => ({
  ok: true,
  status: 200,
  json: async () => payload,
  ...overrides,
});

const authenticatedOptions = fetchImpl => ({
  fetchImpl,
  getIdToken: jest.fn().mockResolvedValue(ID_TOKEN),
});

test('calls only the same-origin function with a Firebase token and bounded batch', async () => {
  const evidence = {
    requestId: 'start->anchor',
    evidenceClass: 'provider_route',
    travelMode: 'transit',
    durationMinutes: 24,
    distanceMeters: 4200,
    evidenceSource: 'google_routes_compute_routes_essentials',
    observedAt: '2026-07-26T12:00:00.000Z',
  };
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(response({ status: 'OK', evidence: [evidence] }));
  const options = authenticatedOptions(fetchImpl);

  await expect(
    resolveGoogleRouteEvidence(batch, options),
  ).resolves.toEqual([evidence]);

  expect(options.getIdToken).toHaveBeenCalledTimes(1);
  expect(fetchImpl).toHaveBeenCalledTimes(1);
  expect(fetchImpl.mock.calls[0][0]).toBe(
    '/.netlify/functions/routes-evidence',
  );
  const requestOptions = fetchImpl.mock.calls[0][1];
  const sent = JSON.parse(requestOptions.body);
  expect(requestOptions.method).toBe('POST');
  expect(requestOptions.headers).toEqual({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ID_TOKEN}`,
  });
  expect(sent.requests).toHaveLength(1);
  expect(sent.costEnvelope).toEqual(
    expect.objectContaining({
      providerRequestCount: 1,
      maximumProviderRequestCount: 6,
      automaticRetryCount: 0,
      alternativesPerLeg: 0,
      matrixElementCount: 0,
    }),
  );
  expect(requestOptions.body).not.toContain(ID_TOKEN);
  expect(requestOptions.body).not.toContain('API_KEY');
});

test('fails closed before a network request when no signed-in token is available', async () => {
  const fetchImpl = jest.fn();

  await expect(
    resolveGoogleRouteEvidence(batch, {
      fetchImpl,
      getIdToken: jest.fn().mockResolvedValue(null),
    }),
  ).rejects.toThrow(ROUTE_PROVIDER_ERROR.ACCESS_DENIED);
  expect(fetchImpl).not.toHaveBeenCalled();

  await expect(
    resolveGoogleRouteEvidence(batch, {
      fetchImpl,
      getIdToken: jest.fn().mockRejectedValue(new Error('signed out')),
    }),
  ).rejects.toThrow(ROUTE_PROVIDER_ERROR.ACCESS_DENIED);
  expect(fetchImpl).not.toHaveBeenCalled();
});

test('does not request a token or call the function when there are no route legs', async () => {
  const fetchImpl = jest.fn();
  const getIdToken = jest.fn();

  await expect(
    resolveGoogleRouteEvidence(
      { ...batch, requests: [] },
      { fetchImpl, getIdToken },
    ),
  ).resolves.toEqual([]);
  expect(getIdToken).not.toHaveBeenCalled();
  expect(fetchImpl).not.toHaveBeenCalled();
});

test.each([
  ['DISABLED', ROUTE_PROVIDER_ERROR.UNAVAILABLE],
  ['REQUEST_DENIED', ROUTE_PROVIDER_ERROR.ACCESS_DENIED],
  ['OVER_QUERY_LIMIT', ROUTE_PROVIDER_ERROR.QUOTA_EXCEEDED],
  ['FETCH_ERROR', ROUTE_PROVIDER_ERROR.NETWORK_ERROR],
])('maps stable server status %s to %s', async (status, expected) => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(response({ status, evidence: [] }));

  await expect(
    resolveGoogleRouteEvidence(batch, authenticatedOptions(fetchImpl)),
  ).rejects.toThrow(expected);
});

test.each([
  [401, ROUTE_PROVIDER_ERROR.ACCESS_DENIED],
  [403, ROUTE_PROVIDER_ERROR.ACCESS_DENIED],
  [429, ROUTE_PROVIDER_ERROR.QUOTA_EXCEEDED],
])('maps HTTP %s before attempting to parse a response body', async (status, expected) => {
  const fetchImpl = jest.fn().mockResolvedValue({
    ok: false,
    status,
  });

  await expect(
    resolveGoogleRouteEvidence(batch, authenticatedOptions(fetchImpl)),
  ).rejects.toThrow(expected);
});

test('keeps zero routes distinct from provider failure', async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(response({ status: 'ZERO_RESULTS', evidence: [] }));

  await expect(
    resolveGoogleRouteEvidence(batch, authenticatedOptions(fetchImpl)),
  ).resolves.toEqual([]);
});

test('rejects network, missing-function, and malformed responses', async () => {
  await expect(
    resolveGoogleRouteEvidence(
      batch,
      authenticatedOptions(
        jest.fn().mockRejectedValue(new Error('offline')),
      ),
    ),
  ).rejects.toThrow(ROUTE_PROVIDER_ERROR.NETWORK_ERROR);

  await expect(
    resolveGoogleRouteEvidence(
      batch,
      authenticatedOptions(
        jest
          .fn()
          .mockResolvedValue(response({}, { ok: false, status: 404 })),
      ),
    ),
  ).rejects.toThrow(ROUTE_PROVIDER_ERROR.UNAVAILABLE);

  await expect(
    resolveGoogleRouteEvidence(
      batch,
      authenticatedOptions(
        jest.fn().mockResolvedValue(response({ status: 'OK' })),
      ),
    ),
  ).rejects.toThrow(ROUTE_PROVIDER_ERROR.INVALID_RESPONSE);
});

test('client adapter source contains no credential name or provider endpoint', () => {
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(
    path.join(__dirname, 'routeEvidenceApi.js'),
    'utf8',
  );

  expect(source).not.toContain('GOOGLE_ROUTES_API_KEY');
  expect(source).not.toContain('GOOGLE_PLACES_API_KEY');
  expect(source).not.toContain('REACT_APP_');
  expect(source).not.toContain('routes.googleapis.com');
});
