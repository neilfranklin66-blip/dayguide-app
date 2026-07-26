import {
  ROUTE_PROVIDER_ERROR,
  resolveGoogleRouteEvidence,
} from './routeEvidenceApi';

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

test('calls only the same-origin function with a bounded provider batch', async () => {
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

  await expect(
    resolveGoogleRouteEvidence(batch, fetchImpl),
  ).resolves.toEqual([evidence]);

  expect(fetchImpl).toHaveBeenCalledTimes(1);
  expect(fetchImpl.mock.calls[0][0]).toBe(
    '/.netlify/functions/routes-evidence',
  );
  const options = fetchImpl.mock.calls[0][1];
  const sent = JSON.parse(options.body);
  expect(options.method).toBe('POST');
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
  expect(options.body).not.toContain('API_KEY');
});

test('does not call the function when there are no route legs', async () => {
  const fetchImpl = jest.fn();

  await expect(
    resolveGoogleRouteEvidence(
      { ...batch, requests: [] },
      fetchImpl,
    ),
  ).resolves.toEqual([]);
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
    resolveGoogleRouteEvidence(batch, fetchImpl),
  ).rejects.toThrow(expected);
});

test('keeps zero routes distinct from provider failure', async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(response({ status: 'ZERO_RESULTS', evidence: [] }));

  await expect(
    resolveGoogleRouteEvidence(batch, fetchImpl),
  ).resolves.toEqual([]);
});

test('rejects network, missing-function, and malformed responses', async () => {
  await expect(
    resolveGoogleRouteEvidence(
      batch,
      jest.fn().mockRejectedValue(new Error('offline')),
    ),
  ).rejects.toThrow(ROUTE_PROVIDER_ERROR.NETWORK_ERROR);

  await expect(
    resolveGoogleRouteEvidence(
      batch,
      jest
        .fn()
        .mockResolvedValue(response({}, { ok: false, status: 404 })),
    ),
  ).rejects.toThrow(ROUTE_PROVIDER_ERROR.UNAVAILABLE);

  await expect(
    resolveGoogleRouteEvidence(
      batch,
      jest.fn().mockResolvedValue(response({ status: 'OK' })),
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
