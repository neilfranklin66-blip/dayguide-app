const crypto = require('crypto');
const routesEvidence = require('../../netlify/functions/routes-evidence');

const ORIGINAL_MODE = process.env.DAYGUIDE_ROUTES_PROVIDER_MODE;
const ORIGINAL_ROUTES_KEY = process.env.GOOGLE_ROUTES_API_KEY;
const ORIGINAL_PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;
const ORIGINAL_CLIENT_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
const ORIGINAL_FETCH = global.fetch;

const ENABLED_MODE = 'google_routes_compute_routes_essentials';
const FIREBASE_CERTIFICATES_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const ROUTES_URL =
  'https://routes.googleapis.com/directions/v2:computeRoutes';
const FIREBASE_PROJECT_ID = 'dayguide-541ee';
const TEST_KEY = 'routing-secret-key';
const TEST_KEY_ID = 'test-firebase-signing-key';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const PUBLIC_KEY_PEM = publicKey.export({
  type: 'spki',
  format: 'pem',
});

const transitRequest = (id = 'start->anchor') => ({
  id,
  origin: { lat: 51.5282, lng: -0.1337 },
  destination: { lat: 51.5033, lng: -0.1195 },
  travelMode: 'transit',
  arrivalTime: '2026-07-26T17:20:00.000Z',
});

const eventFor = (requests, token) => ({
  httpMethod: 'POST',
  headers: token ? { authorization: `Bearer ${token}` } : {},
  body: JSON.stringify({
    schemaVersion: 1,
    providerMode: ENABLED_MODE,
    requests,
    costEnvelope: {
      providerRequestCount: requests.length,
    },
  }),
});

const createToken = ({
  payloadOverrides = {},
  headerOverrides = {},
  signingKey = privateKey,
} = {}) => {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    kid: TEST_KEY_ID,
    typ: 'JWT',
    ...headerOverrides,
  };
  const payload = {
    aud: FIREBASE_PROJECT_ID,
    iss: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    sub: 'private-alpha-user',
    user_id: 'private-alpha-user',
    iat: now - 60,
    exp: now + 3600,
    auth_time: now - 60,
    firebase: { sign_in_provider: 'anonymous' },
    ...payloadOverrides,
  };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    'base64url',
  );
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url',
  );
  const signed = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.sign(
    'RSA-SHA256',
    Buffer.from(signed),
    signingKey,
  );
  return `${signed}.${signature.toString('base64url')}`;
};

const googleResponse = ({
  status = 200,
  routes = [{ duration: '1439s', distanceMeters: 4200 }],
} = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => ({ routes }),
});

const certificateResponse = ({
  ok = true,
  certificates = { [TEST_KEY_ID]: PUBLIC_KEY_PEM },
} = {}) => ({
  ok,
  status: ok ? 200 : 503,
  headers: {
    get: name =>
      name.toLowerCase() === 'cache-control'
        ? 'public, max-age=3600'
        : null,
  },
  json: async () => certificates,
});

const installFetch = (routeResponses = [googleResponse()]) => {
  const queue = [...routeResponses];
  global.fetch.mockImplementation(async url => {
    if (url === FIREBASE_CERTIFICATES_URL) {
      return certificateResponse();
    }
    if (url === ROUTES_URL) {
      if (queue.length === 0) {
        throw new Error('unexpected extra provider call');
      }
      const next = queue.shift();
      if (next instanceof Error) throw next;
      return next;
    }
    throw new Error(`unexpected URL: ${url}`);
  });
};

const providerCalls = () =>
  global.fetch.mock.calls.filter(([url]) => url === ROUTES_URL);

const certificateCalls = () =>
  global.fetch.mock.calls.filter(
    ([url]) => url === FIREBASE_CERTIFICATES_URL,
  );

beforeEach(() => {
  delete process.env.DAYGUIDE_ROUTES_PROVIDER_MODE;
  delete process.env.GOOGLE_ROUTES_API_KEY;
  delete process.env.GOOGLE_PLACES_API_KEY;
  delete process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
  global.fetch = jest.fn();
  routesEvidence.__test.resetCertificateCache();
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

test('is disabled by default before authentication even when a routing key exists', async () => {
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

test('requires the exact approved provider mode before authentication', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = 'true';
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;

  const res = await routesEvidence.handler(
    eventFor([transitRequest()]),
  );

  expect(JSON.parse(res.body).status).toBe('DISABLED');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('rejects missing and malformed bearer tokens before key or provider access', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;

  const missing = await routesEvidence.handler(
    eventFor([transitRequest()]),
  );
  const malformed = await routesEvidence.handler({
    ...eventFor([transitRequest()]),
    headers: { authorization: 'Bearer not-a-jwt' },
  });

  expect(missing.statusCode).toBe(401);
  expect(JSON.parse(missing.body)).toEqual({
    status: 'AUTH_REQUIRED',
    evidence: [],
  });
  expect(malformed.statusCode).toBe(401);
  expect(global.fetch).not.toHaveBeenCalled();
});

test.each([
  [
    'wrong audience',
    { payloadOverrides: { aud: 'another-project' } },
  ],
  [
    'wrong issuer',
    { payloadOverrides: { iss: 'https://example.com' } },
  ],
  [
    'expired token',
    { payloadOverrides: { exp: 1 } },
  ],
  [
    'future issued-at',
    {
      payloadOverrides: {
        iat: Math.floor(Date.now() / 1000) + 3600,
      },
    },
  ],
  [
    'wrong algorithm',
    { headerOverrides: { alg: 'HS256' } },
  ],
  [
    'missing Firebase sign-in provider',
    { payloadOverrides: { firebase: {} } },
  ],
])('rejects a signed token with %s', async (_, tokenOptions) => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;

  const res = await routesEvidence.handler(
    eventFor([transitRequest()], createToken(tokenOptions)),
  );

  expect(res.statusCode).toBe(401);
  expect(providerCalls()).toHaveLength(0);
});

test('rejects a forged signature against the published Firebase key', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;
  const alternate = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  global.fetch.mockResolvedValue(certificateResponse());

  const res = await routesEvidence.handler(
    eventFor(
      [transitRequest()],
      createToken({ signingKey: alternate.privateKey }),
    ),
  );

  expect(res.statusCode).toBe(401);
  expect(certificateCalls()).toHaveLength(1);
  expect(providerCalls()).toHaveLength(0);
});

test('fails closed when Firebase signing certificates cannot be retrieved', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;
  global.fetch.mockRejectedValue(new Error('certificate network failure'));

  const res = await routesEvidence.handler(
    eventFor([transitRequest()], createToken()),
  );

  expect(res.statusCode).toBe(503);
  expect(JSON.parse(res.body)).toEqual({
    status: 'AUTH_UNAVAILABLE',
    evidence: [],
  });
  expect(res.body).not.toContain('certificate network failure');
  expect(providerCalls()).toHaveLength(0);
});

test('does not accept either Places credential as a routing credential', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_PLACES_API_KEY = 'places-server-key';
  process.env.REACT_APP_GOOGLE_PLACES_API_KEY = 'legacy-browser-key';
  installFetch([]);

  const res = await routesEvidence.handler(
    eventFor([transitRequest()], createToken()),
  );

  expect(JSON.parse(res.body)).toEqual({
    status: 'REQUEST_DENIED',
    evidence: [],
  });
  expect(certificateCalls()).toHaveLength(1);
  expect(providerCalls()).toHaveLength(0);
});

test('rejects malformed, duplicated, and oversized authenticated batches before provider calls', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;
  const token = createToken();
  installFetch([]);

  const malformed = await routesEvidence.handler({
    httpMethod: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: '{bad-json',
  });
  const duplicated = await routesEvidence.handler(
    eventFor(
      [transitRequest('same'), transitRequest('same')],
      token,
    ),
  );
  const oversized = await routesEvidence.handler(
    eventFor(
      Array.from({ length: 7 }, (_, index) =>
        transitRequest(`leg-${index}`),
      ),
      token,
    ),
  );

  expect(malformed.statusCode).toBe(400);
  expect(duplicated.statusCode).toBe(400);
  expect(oversized.statusCode).toBe(400);
  expect(certificateCalls()).toHaveLength(1);
  expect(providerCalls()).toHaveLength(0);
});

test('makes one minimal route call only after successful authentication', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;
  installFetch();

  const res = await routesEvidence.handler(
    eventFor([transitRequest()], createToken()),
  );

  expect(certificateCalls()).toHaveLength(1);
  expect(providerCalls()).toHaveLength(1);
  const [url, options] = providerCalls()[0];
  expect(url).toBe(ROUTES_URL);
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
  expect(res.body).not.toContain('private-alpha-user');
});

test('caches Firebase public certificates while their max-age is valid', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;
  installFetch([googleResponse(), googleResponse()]);
  const token = createToken();

  await routesEvidence.handler(
    eventFor([transitRequest('one')], token),
  );
  await routesEvidence.handler(
    eventFor([transitRequest('two')], token),
  );

  expect(certificateCalls()).toHaveLength(1);
  expect(providerCalls()).toHaveLength(2);
});

test('keeps driving in the Essentials boundary with traffic unaware routing', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;
  installFetch();
  const driving = {
    ...transitRequest('drive-leg'),
    travelMode: 'driving',
    departureTime: '2026-07-26T16:15:00.000Z',
  };
  delete driving.arrivalTime;

  await routesEvidence.handler(
    eventFor([driving], createToken()),
  );

  const body = JSON.parse(providerCalls()[0][1].body);
  expect(body).toEqual(
    expect.objectContaining({
      travelMode: 'DRIVE',
      departureTime: '2026-07-26T16:15:00.000Z',
      routingPreference: 'TRAFFIC_UNAWARE',
      computeAlternativeRoutes: false,
    }),
  );
});

test('caps authenticated fan-out at six one-shot calls with no retry', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;
  installFetch(
    Array.from({ length: 6 }, () => googleResponse()),
  );
  const requests = Array.from({ length: 6 }, (_, index) =>
    transitRequest(`leg-${index + 1}`),
  );

  const res = await routesEvidence.handler(
    eventFor(requests, createToken()),
  );

  expect(certificateCalls()).toHaveLength(1);
  expect(providerCalls()).toHaveLength(6);
  expect(JSON.parse(res.body).evidence).toHaveLength(6);
});

test('returns sanitized partial and stable total-failure outcomes', async () => {
  process.env.DAYGUIDE_ROUTES_PROVIDER_MODE = ENABLED_MODE;
  process.env.GOOGLE_ROUTES_API_KEY = TEST_KEY;
  installFetch([
    googleResponse(),
    googleResponse({ routes: [] }),
  ]);
  const token = createToken();

  const partial = await routesEvidence.handler(
    eventFor(
      [transitRequest('one'), transitRequest('two')],
      token,
    ),
  );
  expect(JSON.parse(partial.body)).toEqual({
    status: 'PARTIAL',
    evidence: [expect.objectContaining({ requestId: 'one' })],
  });

  routesEvidence.__test.resetCertificateCache();
  global.fetch.mockReset();
  installFetch([googleResponse({ status: 429 })]);
  const quota = await routesEvidence.handler(
    eventFor([transitRequest()], token),
  );
  expect(JSON.parse(quota.body)).toEqual({
    status: 'OVER_QUERY_LIMIT',
    evidence: [],
  });

  routesEvidence.__test.resetCertificateCache();
  global.fetch.mockReset();
  installFetch([new Error('private upstream detail')]);
  const failed = await routesEvidence.handler(
    eventFor([transitRequest()], token),
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

test('server source has one distinct routing key and no browser or Places fallback', () => {
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
  expect(source).not.toContain('serviceAccount');
  expect(source).not.toContain('PRIVATE_KEY');
});
