const GOOGLE_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 120;
const MAX_CANDIDATES = 5;
const FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.location';

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const normalizeQuery = value =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

const isFiniteCoordinate = value =>
  typeof value === 'number' && Number.isFinite(value);

const sanitizeCandidate = place => {
  const location = place?.location;
  if (
    typeof place?.id !== 'string' ||
    place.id.trim().length === 0 ||
    typeof place?.displayName?.text !== 'string' ||
    place.displayName.text.trim().length === 0 ||
    !isFiniteCoordinate(location?.latitude) ||
    !isFiniteCoordinate(location?.longitude) ||
    location.latitude < -90 || location.latitude > 90 ||
    location.longitude < -180 || location.longitude > 180
  ) {
    return null;
  }

  return {
    id: place.id,
    name: place.displayName.text.trim(),
    address:
      typeof place.formattedAddress === 'string' && place.formattedAddress.trim().length > 0
        ? place.formattedAddress.trim()
        : null,
    coordinates: { lat: location.latitude, lng: location.longitude },
    source: 'google_places',
  };
};

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { status: 'INVALID_REQUEST', error_message: 'METHOD_NOT_ALLOWED', candidates: [] });
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body || '{}');
  } catch (_) {
    return jsonResponse(400, { status: 'INVALID_REQUEST', error_message: 'INVALID_JSON', candidates: [] });
  }

  const query = normalizeQuery(requestBody.query);
  if (query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    return jsonResponse(400, { status: 'INVALID_REQUEST', error_message: 'INVALID_QUERY', candidates: [] });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return jsonResponse(200, { status: 'REQUEST_DENIED', error_message: 'NO_API_KEY', candidates: [] });
  }

  try {
    const upstream = await fetch(GOOGLE_TEXT_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: MAX_CANDIDATES }),
    });
    const payload = await upstream.json();
    if (!upstream.ok) {
      if (upstream.status === 401 || upstream.status === 403) {
        return jsonResponse(200, { status: 'REQUEST_DENIED', candidates: [] });
      }
      if (upstream.status === 429) {
        return jsonResponse(200, { status: 'OVER_QUERY_LIMIT', candidates: [] });
      }
      return jsonResponse(502, { status: 'FETCH_ERROR', error_message: 'UPSTREAM_HTTP_ERROR', candidates: [] });
    }

    const candidates = (Array.isArray(payload?.places) ? payload.places : [])
      .map(sanitizeCandidate)
      .filter(Boolean)
      .slice(0, MAX_CANDIDATES);
    return jsonResponse(200, { status: candidates.length > 0 ? 'OK' : 'ZERO_RESULTS', candidates });
  } catch (_) {
    return jsonResponse(502, { status: 'FETCH_ERROR', error_message: 'NETWORK_ERROR', candidates: [] });
  }
};
