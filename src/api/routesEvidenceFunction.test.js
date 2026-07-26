const routesEvidence = require('../../netlify/functions/routes-evidence');

const ORIGINAL_MODE = process.env.DAYGUIDE_ROUTES_PROVIDER_MODE;
const ORIGINAL_ROUTES_KEY = process.env.GOOGLE_ROUTES_API_KEY;
const ORIGINAL_PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;
const ORIGINAL_CLIENT_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
const ORIGINAL_FETCH = global.fetch;

const ENABLED_MODE = 'google_routes_compute_routes_essentials';
const TEST_KEY = 'routing-secret-key';

const transitRequest = (id = 'start->anchor') => ({
  id,
  origin: { lat: 51.5282, lng: -0.1337 },
  destination: { lat: 51.5033, lng: -0.1195 },
  travelMode: 'transit',
  arrivalTime: '2026-07-26T17:20:00.000Z',
});

const eventFor = requests => ({
  httpMethod: 'POST',
  body: JSON.stringify({
    schemaVersion: 1,
    providerMode: ENABLED_MODE,
    requests,
    costEnvelope: {
      providerRequestCount: requests.length,
    },
  }),
});

const googleResponse = ({
  status = 200,
  routes = [{ duration: '1439s', distanceMeters: 4200 }],
} = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => ({ routes }),
});

beforeEach(() => {
  delete process.env.DAYGUIDE_ROUTES_PROVIDER_MODE;
  delete process.env.GOOGLE_ROUTES_API_KEY;
  delete process.env.GOOGLE_PLACES_API_KEY;
  delete process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
  global.fetch = jest.fn();
});

afterAll(() => {
  const restore = (name, value) => {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  };
  restore('DAYGUIDE_ROUTES_PROVIDER_MODE', ORIGINAL_MODE);
  restore('GOOGLE_ROUTES_API_KEY', ORIGINAL_ROUTES_KEY);
  restore('GOOGLE_PLACES_API_KEY', ORIGINAL_PLACES_KEY);
  restore('REACT_APP_GOOGLE_PLACES_API_KEY', ORIGINAL_CLIENT_KEY);
  global.fetch = ORIGINAL_FETCH;
});

test('is disabled by default even when a routing key exists', async () => {
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;

  const res = await routesEvidence.handler(
    eventFor([transitRequest()]),
  );

  expect(JSON.parse(res.body)).toEqual({
    status: 'DISABLED',
    evidence: [],
  });
  expect(global.fetch).not.toHaveBeenCalled();
});

test('requires the exact approved provider mode', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = 'true';
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;

  const res = await routesEvidence.handler(
    eventFor([transitRequest()]),
  );

  expect(JSON.parse(res.body).status).toBe('DISABLED');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('does not accept either Places credential as a routing credential', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_PLACES_API_KEY = 'places-server-key';
  process.env.REACT_APP_GOOGLE_PLACES_API_KEY = 'legacy-browser-key';

  const res = await routesEvidence.handler(
    eventFor([transitRequest()]),
  );

  expect(JSON.parse(res.body)).toEqual({
    status: 'REQUEST_DENIED',
    evidence: [],
  });
  expect(global.fetch).not.toHaveBeenCalled();
});

test('rejects malformed, duplicated, and oversized batches before provider calls', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;

  const malformed = await routesEvidence.handler({
    httpMethod: 'POST',
    body: '{bad-json',
  });
  const duplicated = await routesEvidence.handler(
    eventFor([transitRequest('same'), transitRequest('same')]),
  );
  const oversized = await routesEvidence.handler(
    eventFor(
      Array.from({ length: 7 }, (_, index) =>
        transitRequest(`leg-${index}`),
      ),
    ),
  );

  expect(malformed.statusCode).toBe(400);
  expect(duplicated.statusCode).toBe(400);
  expect(oversized.statusCode).toBe(400);
  expect(global.fetch).not.toHaveBeenCalled();
});

test('makes one minimal transit route call and never echoes the key', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;
  global.fetch.mockResolvedValue(googleResponse());

  const res = await routesEvidence.handler(
    eventFor([transitRequest()]),
  );

  expect(global.fetch).toHaveBeenCalledTimes(1);
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toBe(
    'https://routes.googleapis.com/directions/v2:computeRoutes',
  );
  expect(options.headers).toEqual({
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': TEST_KEY,
    'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
  });
  const body = JSON.parse(options.body);
  expect(body).toEqual({
    origin: {
      location: {
        latLng: { latitude: 51.5282, longitude: -0.1337 },
      },
    },
    destination: {
      location: {
        latLng: { latitude: 51.5033, longitude: -0.1195 },
      },
    },
    travelMode: 'TRANSIT',
    computeAlternativeRoutes: false,
    arrivalTime: '2026-07-26T17:20:00.000Z',
  });
  expect(body).not.toHaveProperty('departureTime');

  expect(JSON.parse(res.body)).toEqual({
    status: 'OK',
    evidence: [
      expect.objectContaining({
        requestId: 'start->anchor',
        evidenceClass: 'provider_route',
        travelMode: 'transit',
        durationMinutes: 24,
        distanceMeters: 4200,
        evidenceSource: 'google_routes_compute_routes_essentials',
        observedAt: expect.stringMatching(/Z$/),
      }),
    ],
  });
  expect(res.body).not.toContain(TEST_KEY);
});

test('keeps driving in the Essentials boundary with traffic unaware routing', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;
  global.fetch.mockResolvedValue(googleResponse());
  const driving = {
    ...transitRequest('drive-leg'),
    travelMode: 'driving',
    departureTime: '2026-07-26T16:15:00.000Z',
  };
  delete driving.arrivalTime;

  await routesEvidence.handler(eventFor([driving]));

  const body = JSON.parse(global.fetch.mock.calls[0][1].body);
  expect(body).toEqual(
    expect.objectContaining({
      travelMode: 'DRIVE',
      departureTime: '2026-07-26T16:15:00.000Z',
      routingPreference: 'TRAFFIC_UNAWARE',
      computeAlternativeRoutes: false,
    }),
  );
});

test('caps fan-out at six one-shot calls with no automatic retry', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;
  global.fetch.mockResolvedValue(googleResponse());
  const requests = Array.from({ length: 6 }, (_, index) =>
    transitRequest(`leg-${index + 1}`),
  );

  const res = await routesEvidence.handler(eventFor(requests));

  expect(global.fetch).toHaveBeenCalledTimes(6);
  expect(JSON.parse(res.body).evidence).toHaveLength(6);
});

test('returns sanitized partial and stable total-failure outcomes', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;
  global.fetch
    .mockResolvedValueOnce(googleResponse())
    .mockResolvedValueOnce(googleResponse({ routes: [] }));

  const partial = await routesEvidence.handler(
    eventFor([transitRequest('one'), transitRequest('two')]),
  );
  expect(JSON.parse(partial.body)).toEqual({
    status: 'PARTIAL',
    evidence: [expect.objectContaining({ requestId: 'one' })],
  });

  global.fetch.mockReset();
  global.fetch.mockResolvedValue(googleResponse({ status: 429 }));
  const quota = await routesEvidence.handler(
    eventFor([transitRequest()]),
  );
  expect(JSON.parse(quota.body)).toEqual({
    status: 'OVER_QUERY_LIMIT',
    evidence: [],
  });

  global.fetch.mockReset();
  global.fetch.mockRejectedValue(new Error('private upstream detail'));
  const failed = await routesEvidence.handler(
    eventFor([transitRequest()]),
  );
  expect(failed.statusCode).toBe(502);
  expect(JSON.parse(failed.body)).toEqual({
    status: 'FETCH_ERROR',
    evidence: [],
  });
  expect(failed.body).not.toContain('private upstream detail');
});

test('exports a per-IP Netlify rate limit for the exact function path', () => {
  expect(routesEvidence.config).toEqual({
    path: '/.netlify/functions/routes-evidence',
    rateLimit: {
      windowLimit: 3,
      windowSize: 60,
      aggregateBy: ['ip', 'domain'],
    },
  });
});

test('server source has a distinct key and no browser or Places key fallback', () => {
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(
    path.join(
      __dirname,
      '..',
      '..',
      'netlify',
      'functions',
      'routes-evidence.js',
    ),
    'utf8',
  );

  expect(source).toContain('GOOGLE_ROUTES_API_KEY');
  expect(source).not.toContain('GOOGLE_PLACES_API_KEY');
  expect(source).not.toContain('REACT_APP_');
});
