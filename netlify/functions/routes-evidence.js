const crypto = require('crypto');

const GOOGLE_COMPUTE_ROUTES_URL =
  'https://routes.googleapis.com/directions/v2:computeRoutes';
const FIREBASE_CERTIFICATES_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const FIREBASE_PROJECT_ID = 'dayguide-541ee';
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const ENABLED_PROVIDER_MODE = 'google_routes_compute_routes_essentials';
const MAX_LEGS_PER_CHECK = 6;
const UPSTREAM_TIMEOUT_MS = 8000;
const FIELD_MASK = 'routes.duration,routes.distanceMeters';
const MAX_TOKEN_LENGTH = 8192;

let certificateCache = {
  certificates: null,
  expiresAt: 0,
};

const TRAVEL_MODE = {
  walking: 'WALK',
  cycling: 'BICYCLE',
  driving: 'DRIVE',
  transit: 'TRANSIT',
};

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const decodeJwtPart = value => {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
  } catch (_) {
    return null;
  }
};

const certificateMaxAgeSeconds = response => {
  const cacheControl = response.headers?.get?.('cache-control') || '';
  const match = cacheControl.match(/(?:^|,)\s*max-age=(\d+)/i);
  return match ? Number(match[1]) : 300;
};

const getFirebaseCertificates = async () => {
  const now = Date.now();
  if (
    certificateCache.certificates &&
    certificateCache.expiresAt > now
  ) {
    return certificateCache.certificates;
  }

  let response;
  try {
    response = await fetch(FIREBASE_CERTIFICATES_URL);
  } catch (_) {
    throw new Error('AUTH_VERIFICATION_UNAVAILABLE');
  }
  if (!response.ok) {
    throw new Error('AUTH_VERIFICATION_UNAVAILABLE');
  }

  let certificates;
  try {
    certificates = await response.json();
  } catch (_) {
    throw new Error('AUTH_VERIFICATION_UNAVAILABLE');
  }
  if (
    !certificates ||
    typeof certificates !== 'object' ||
    Array.isArray(certificates)
  ) {
    throw new Error('AUTH_VERIFICATION_UNAVAILABLE');
  }

  certificateCache = {
    certificates,
    expiresAt:
      now + certificateMaxAgeSeconds(response) * 1000,
  };
  return certificates;
};

const verifyFirebaseIdToken = async token => {
  if (
    typeof token !== 'string' ||
    token.length === 0 ||
    token.length > MAX_TOKEN_LENGTH
  ) {
    throw new Error('AUTH_INVALID');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('AUTH_INVALID');
  }
  const header = decodeJwtPart(parts[0]);
  const payload = decodeJwtPart(parts[1]);
  if (
    header?.alg !== 'RS256' ||
    typeof header?.kid !== 'string' ||
    header.kid.length === 0 ||
    !payload
  ) {
    throw new Error('AUTH_INVALID');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    payload.aud !== FIREBASE_PROJECT_ID ||
    payload.iss !== FIREBASE_ISSUER ||
    typeof payload.sub !== 'string' ||
    payload.sub.length === 0 ||
    payload.sub.length > 128 ||
    typeof payload.exp !== 'number' ||
    payload.exp <= nowSeconds ||
    typeof payload.iat !== 'number' ||
    payload.iat > nowSeconds ||
    typeof payload.auth_time !== 'number' ||
    payload.auth_time > nowSeconds ||
    typeof payload.firebase?.sign_in_provider !== 'string' ||
    payload.firebase.sign_in_provider.length === 0
  ) {
    throw new Error('AUTH_INVALID');
  }

  const certificates = await getFirebaseCertificates();
  const certificate = certificates[header.kid];
  if (typeof certificate !== 'string' || certificate.length === 0) {
    throw new Error('AUTH_INVALID');
  }

  let signatureIsValid = false;
  try {
    signatureIsValid = crypto.verify(
      'RSA-SHA256',
      Buffer.from(`${parts[0]}.${parts[1]}`),
      certificate,
      Buffer.from(parts[2], 'base64url'),
    );
  } catch (_) {
    throw new Error('AUTH_INVALID');
  }
  if (!signatureIsValid) {
    throw new Error('AUTH_INVALID');
  }

  return {
    uid: payload.sub,
    signInProvider: payload.firebase.sign_in_provider,
  };
};

const authenticateEvent = async event => {
  const authorization =
    event.headers?.authorization || event.headers?.Authorization || '';
  const match =
    typeof authorization === 'string' &&
    authorization.match(/^Bearer\s+(\S+)$/i);
  if (!match) return { status: 'required' };

  try {
    const identity = await verifyFirebaseIdToken(match[1]);
    return { status: 'authenticated', identity };
  } catch (error) {
    return {
      status:
        error?.message === 'AUTH_VERIFICATION_UNAVAILABLE'
          ? 'unavailable'
          : 'required',
    };
  }
};

const isFiniteCoordinate = value =>
  typeof value === 'number' && Number.isFinite(value);

const isValidCoordinates = coordinates =>
  isFiniteCoordinate(coordinates?.lat) &&
  coordinates.lat >= -90 &&
  coordinates.lat <= 90 &&
  isFiniteCoordinate(coordinates?.lng) &&
  coordinates.lng >= -180 &&
  coordinates.lng <= 180;

const isAbsoluteInstant = value =>
  typeof value === 'string' &&
  /(Z|[+-]\d{2}:\d{2})$/.test(value) &&
  !Number.isNaN(Date.parse(value));

const isValidRequest = request => {
  const hasDeparture = isAbsoluteInstant(request?.departureTime);
  const hasArrival = isAbsoluteInstant(request?.arrivalTime);
  return (
    typeof request?.id === 'string' &&
    request.id.trim().length > 0 &&
    isValidCoordinates(request.origin) &&
    isValidCoordinates(request.destination) &&
    Object.prototype.hasOwnProperty.call(TRAVEL_MODE, request.travelMode) &&
    hasDeparture !== hasArrival &&
    (!hasArrival || request.travelMode === 'transit')
  );
};

const isValidBatch = body => {
  if (
    body?.schemaVersion !== 1 ||
    body?.providerMode !== ENABLED_PROVIDER_MODE ||
    !Array.isArray(body.requests) ||
    body.requests.length < 1 ||
    body.requests.length > MAX_LEGS_PER_CHECK ||
    !body.requests.every(isValidRequest)
  ) {
    return false;
  }
  return new Set(body.requests.map(request => request.id)).size ===
    body.requests.length;
};

const providerBody = request => {
  const body = {
    origin: {
      location: {
        latLng: {
          latitude: request.origin.lat,
          longitude: request.origin.lng,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: request.destination.lat,
          longitude: request.destination.lng,
        },
      },
    },
    travelMode: TRAVEL_MODE[request.travelMode],
    computeAlternativeRoutes: false,
  };

  if (request.departureTime) {
    body.departureTime = request.departureTime;
  } else {
    body.arrivalTime = request.arrivalTime;
  }
  if (request.travelMode === 'driving') {
    body.routingPreference = 'TRAFFIC_UNAWARE';
  }
  return body;
};

const parseDurationMinutes = duration => {
  const match =
    typeof duration === 'string' &&
    duration.match(/^(\d+(?:\.\d+)?)s$/);
  if (!match) return null;
  const seconds = Number(match[1]);
  return Number.isFinite(seconds) ? Math.ceil(seconds / 60) : null;
};

const sanitizeRoute = (data, request, observedAt) => {
  const route = Array.isArray(data?.routes) ? data.routes[0] : null;
  const durationMinutes = parseDurationMinutes(route?.duration);
  const distanceMeters = route?.distanceMeters;
  if (
    durationMinutes == null ||
    !Number.isInteger(distanceMeters) ||
    distanceMeters < 0
  ) {
    return null;
  }

  return {
    requestId: request.id,
    evidenceClass: 'provider_route',
    travelMode: request.travelMode,
    durationMinutes,
    distanceMeters,
    evidenceSource: 'google_routes_compute_routes_essentials',
    observedAt,
  };
};

const fetchRoute = async (request, apiKey) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const response = await fetch(GOOGLE_COMPUTE_ROUTES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify(providerBody(request)),
      signal: controller.signal,
    });

    if (response.status === 401 || response.status === 403) {
      return { kind: 'denied' };
    }
    if (response.status === 429) {
      return { kind: 'quota' };
    }
    if (!response.ok) {
      return { kind: 'failed' };
    }

    const data = await response.json();
    if (!Array.isArray(data?.routes) || data.routes.length === 0) {
      return { kind: 'no_route' };
    }
    const evidence = sanitizeRoute(
      data,
      request,
      new Date().toISOString(),
    );
    return evidence
      ? { kind: 'evidence', evidence }
      : { kind: 'failed' };
  } catch (_) {
    return { kind: 'failed' };
  } finally {
    clearTimeout(timeout);
  }
};

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      status: 'INVALID_REQUEST',
      evidence: [],
    });
  }

  if (process.env.DAYGUIDE_ROUTES_PROVIDER_MODE !== ENABLED_PROVIDER_MODE) {
    return jsonResponse(200, {
      status: 'DISABLED',
      evidence: [],
    });
  }

  const authentication = await authenticateEvent(event);
  if (authentication.status === 'required') {
    return jsonResponse(401, {
      status: 'AUTH_REQUIRED',
      evidence: [],
    });
  }
  if (authentication.status === 'unavailable') {
    return jsonResponse(503, {
      status: 'AUTH_UNAVAILABLE',
      evidence: [],
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return jsonResponse(400, {
      status: 'INVALID_REQUEST',
      evidence: [],
    });
  }
  if (!isValidBatch(body)) {
    return jsonResponse(400, {
      status: 'INVALID_REQUEST',
      evidence: [],
    });
  }

  const apiKey = process.env.GOOGLE_ROUTES_API_KEY;
  if (!apiKey) {
    return jsonResponse(200, {
      status: 'REQUEST_DENIED',
      evidence: [],
    });
  }

  const outcomes = await Promise.all(
    body.requests.map(request => fetchRoute(request, apiKey)),
  );
  const evidence = outcomes
    .filter(outcome => outcome.kind === 'evidence')
    .map(outcome => outcome.evidence);

  if (evidence.length === body.requests.length) {
    return jsonResponse(200, { status: 'OK', evidence });
  }
  if (evidence.length > 0) {
    return jsonResponse(200, { status: 'PARTIAL', evidence });
  }
  if (outcomes.some(outcome => outcome.kind === 'denied')) {
    return jsonResponse(200, { status: 'REQUEST_DENIED', evidence: [] });
  }
  if (outcomes.some(outcome => outcome.kind === 'quota')) {
    return jsonResponse(200, { status: 'OVER_QUERY_LIMIT', evidence: [] });
  }
  if (outcomes.every(outcome => outcome.kind === 'no_route')) {
    return jsonResponse(200, { status: 'ZERO_RESULTS', evidence: [] });
  }
  return jsonResponse(502, { status: 'FETCH_ERROR', evidence: [] });
};

exports.config = {
  path: '/.netlify/functions/routes-evidence',
  rateLimit: {
    windowLimit: 3,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};

exports.__test = {
  resetCertificateCache: () => {
    certificateCache = {
      certificates: null,
      expiresAt: 0,
    };
  },
  verifyFirebaseIdToken,
};
