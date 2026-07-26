import {
  ROUTING_POLICY_ERROR,
  ROUTING_PROVIDER_POLICY,
  createProviderRouteBatch,
  localDateTimeToInstant,
} from './routingProviderPolicy';

const context = {
  date: '2026-07-26',
  timezone: 'Europe/London',
  travelMode: 'transit',
};

const request = (id = 'start->anchor') => ({
  id,
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
});

test('converts unambiguous local planning times into absolute instants', () => {
  expect(
    localDateTimeToInstant('2026-07-26T18:30', 'Europe/London'),
  ).toBe('2026-07-26T17:30:00.000Z');
  expect(
    localDateTimeToInstant('2026-01-26T18:30', 'Europe/London'),
  ).toBe('2026-01-26T18:30:00.000Z');
});

test('refuses nonexistent and ambiguous daylight-saving local times', () => {
  expect(() =>
    localDateTimeToInstant('2026-03-29T01:30', 'Europe/London'),
  ).toThrow(ROUTING_POLICY_ERROR.INVALID_LOCAL_TIME);
  expect(() =>
    localDateTimeToInstant('2026-10-25T01:30', 'Europe/London'),
  ).toThrow(ROUTING_POLICY_ERROR.AMBIGUOUS_LOCAL_TIME);
});

test('uses a fixed arrival target for transit without also sending departure time', () => {
  const batch = createProviderRouteBatch({
    context,
    requests: [request()],
  });

  expect(batch).toEqual({
    schemaVersion: 1,
    providerMode: 'google_routes_compute_routes_essentials',
    requests: [
      {
        id: 'start->anchor',
        origin: { lat: 51.5282, lng: -0.1337 },
        destination: { lat: 51.5033, lng: -0.1195 },
        travelMode: 'transit',
        arrivalTime: '2026-07-26T17:20:00.000Z',
      },
    ],
    costEnvelope: {
      providerRequestCount: 1,
      maximumProviderRequestCount: 6,
      billingUnit: 'request_per_adjacent_leg',
      automaticRetryCount: 0,
      alternativesPerLeg: 0,
      matrixElementCount: 0,
    },
  });
  expect(batch.requests[0]).not.toHaveProperty('departureTime');
});

test('uses departure time for non-transit legs and never changes the source request', () => {
  const walkingContext = { ...context, travelMode: 'walking' };
  const source = {
    ...request(),
    travelMode: 'walking',
    arrivalTargetLocalDateTime: '2026-07-26T18:20',
  };

  const batch = createProviderRouteBatch({
    context: walkingContext,
    requests: [source],
  });

  expect(batch.requests[0]).toEqual(
    expect.objectContaining({
      travelMode: 'walking',
      departureTime: '2026-07-26T16:15:00.000Z',
    }),
  );
  expect(batch.requests[0]).not.toHaveProperty('arrivalTime');
  expect(source.fromPlace.coordinates).toEqual({
    lat: 51.5282,
    lng: -0.1337,
  });
});

test('caps an explicit check at six unique adjacent legs before any provider call', () => {
  const sixRequests = Array.from({ length: 6 }, (_, index) =>
    request(`leg-${index + 1}`),
  );
  const batch = createProviderRouteBatch({
    context,
    requests: sixRequests,
  });

  expect(batch.requests).toHaveLength(6);
  expect(batch.costEnvelope.providerRequestCount).toBe(6);
  expect(ROUTING_PROVIDER_POLICY).toEqual(
    expect.objectContaining({
      maxLegsPerCheck: 6,
      maxRoutesPerLeg: 1,
      maxAutomaticRetries: 0,
      maxChecksPerIpPerMinute: 3,
      computeAlternativeRoutes: false,
      useRouteMatrix: false,
      useTrafficAwareRouting: false,
      fieldMask: 'routes.duration,routes.distanceMeters',
    }),
  );

  expect(() =>
    createProviderRouteBatch({
      context,
      requests: [...sixRequests, request('leg-7')],
    }),
  ).toThrow(ROUTING_POLICY_ERROR.LEG_LIMIT_EXCEEDED);
});

test('rejects duplicate, mismatched, malformed, and out-of-range legs', () => {
  expect(() =>
    createProviderRouteBatch({
      context,
      requests: [request('same'), request('same')],
    }),
  ).toThrow(ROUTING_POLICY_ERROR.INVALID_BATCH);

  expect(() =>
    createProviderRouteBatch({
      context,
      requests: [{ ...request(), travelMode: 'walking' }],
    }),
  ).toThrow(ROUTING_POLICY_ERROR.INVALID_BATCH);

  expect(() =>
    createProviderRouteBatch({
      context,
      requests: [
        {
          ...request(),
          fromPlace: { coordinates: { lat: 91, lng: 0 } },
        },
      ],
    }),
  ).toThrow(ROUTING_POLICY_ERROR.INVALID_BATCH);
});

test('client-side policy source contains no server key name or direct provider host', () => {
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(
    path.join(__dirname, 'routingProviderPolicy.js'),
    'utf8',
  );

  expect(source).not.toContain('GOOGLE_ROUTES_API_KEY');
  expect(source).not.toContain('GOOGLE_PLACES_API_KEY');
  expect(source).not.toContain('REACT_APP_');
  expect(source).not.toContain('routes.googleapis.com');
});
