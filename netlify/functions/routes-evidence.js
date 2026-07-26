const GOOGLE_COMPUTE_ROUTES_URL =
  'https://routes.googleapis.com/directions/v2:computeRoutes';
const ENABLED_PROVIDER_MODE = 'google_routes_compute_routes_essentials';
const MAX_LEGS_PER_CHECK = 6;
const UPSTREAM_TIMEOUT_MS = 8000;
const FIELD_MASK = 'routes.duration,routes.distanceMeters';

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

  const apiKey = process.env.GOOGLE_ROUTES_API_KEY;
  if (!apiKey) {
    return jsonResponse(200, {
      status: 'REQUEST_DENIED',
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
