const GOOGLE_FIND_PLACE_URL =
  'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 120;
const MAX_CANDIDATES = 5;

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const normalizeQuery = value =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

const isFiniteCoordinate = value =>
  typeof value === 'number' && Number.isFinite(value);

const sanitizeCandidate = candidate => {
  const location = candidate?.geometry?.location;
  if (
    typeof candidate?.place_id !== 'string' ||
    candidate.place_id.trim().length === 0 ||
    typeof candidate?.name !== 'string' ||
    candidate.name.trim().length === 0 ||
    !isFiniteCoordinate(location?.lat) ||
    !isFiniteCoordinate(location?.lng) ||
    location.lat < -90 ||
    location.lat > 90 ||
    location.lng < -180 ||
    location.lng > 180
  ) {
    return null;
  }

  return {
    id: candidate.place_id,
    name: candidate.name.trim(),
    address:
      typeof candidate.formatted_address === 'string' &&
      candidate.formatted_address.trim().length > 0
        ? candidate.formatted_address.trim()
        : null,
    coordinates: {
      lat: location.lat,
      lng: location.lng,
    },
    source: 'google_places',
  };
};

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      status: 'INVALID_REQUEST',
      error_message: 'METHOD_NOT_ALLOWED',
      candidates: [],
    });
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body || '{}');
  } catch (_) {
    return jsonResponse(400, {
      status: 'INVALID_REQUEST',
      error_message: 'INVALID_JSON',
      candidates: [],
    });
  }

  const query = normalizeQuery(requestBody.query);
  if (query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    return jsonResponse(400, {
      status: 'INVALID_REQUEST',
      error_message: 'INVALID_QUERY',
      candidates: [],
    });
  }

  // Server-side only. A REACT_APP_* variable would be compiled into the
  // browser bundle and must never be used here.
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return jsonResponse(200, {
      status: 'REQUEST_DENIED',
      error_message: 'NO_API_KEY',
      candidates: [],
    });
  }

  const params = new URLSearchParams({
    input: query,
    inputtype: 'textquery',
    fields: 'place_id,name,formatted_address,geometry',
    key: apiKey,
  });

  try {
    const response = await fetch(`${GOOGLE_FIND_PLACE_URL}?${params}`);
    if (!response.ok) {
      return jsonResponse(502, {
        status: 'FETCH_ERROR',
        error_message: 'UPSTREAM_HTTP_ERROR',
        candidates: [],
      });
    }

    const data = await response.json();
    if (data?.status === 'ZERO_RESULTS') {
      return jsonResponse(200, {
        status: 'ZERO_RESULTS',
        candidates: [],
      });
    }
    if (data?.status !== 'OK') {
      return jsonResponse(200, {
        status:
          typeof data?.status === 'string' ? data.status : 'UNKNOWN_ERROR',
        candidates: [],
      });
    }

    const candidates = (Array.isArray(data.candidates) ? data.candidates : [])
      .map(sanitizeCandidate)
      .filter(Boolean)
      .slice(0, MAX_CANDIDATES);

    return jsonResponse(200, {
      status: candidates.length > 0 ? 'OK' : 'ZERO_RESULTS',
      candidates,
    });
  } catch (_) {
    return jsonResponse(502, {
      status: 'FETCH_ERROR',
      error_message: 'NETWORK_ERROR',
      candidates: [],
    });
  }
};
