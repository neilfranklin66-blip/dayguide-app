const GOOGLE_NEARBY_SEARCH_URL =
  'https://places.googleapis.com/v1/places:searchNearby';
const GOOGLE_TEXT_SEARCH_URL =
  'https://places.googleapis.com/v1/places:searchText';

const PLACE_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.types',
  'places.primaryType',
  'places.primaryTypeDisplayName',
  'places.businessStatus',
  'places.rating',
  'places.priceLevel',
  'places.photos',
].join(',');

// `nextPageToken` belongs to Text Search responses, not Nearby Search. A
// shared mask caused Google to reject an otherwise valid Things-to-do request
// with INVALID_ARGUMENT, leaving genuine activity venues looking unavailable.
const TEXT_SEARCH_FIELD_MASK = `${PLACE_FIELD_MASK},nextPageToken`;

const PRICE_LEVELS_BY_MAX_PRICE = {
  // `PRICE_LEVEL_FREE` may be returned by Places API (New), but Google does
  // not permit it in a Text Search request's priceLevels filter.
  1: ['PRICE_LEVEL_INEXPENSIVE'],
  2: ['PRICE_LEVEL_INEXPENSIVE', 'PRICE_LEVEL_MODERATE'],
  4: [
    'PRICE_LEVEL_INEXPENSIVE',
    'PRICE_LEVEL_MODERATE',
    'PRICE_LEVEL_EXPENSIVE',
    'PRICE_LEVEL_VERY_EXPENSIVE',
  ],
};

const LEGACY_PRICE_LEVELS = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

// Google reports a dead key as 400 INVALID_ARGUMENT whether it is expired,
// revoked or malformed. `details[].reason` carries the machine-readable code
// and is the signal to trust; the message text is English prose that Google
// has already varied ("not valid" vs "expired") and could vary again, so it
// stays only as a fallback for responses that omit the structured detail.
const INVALID_KEY_REASON = 'API_KEY_INVALID';
const INVALID_KEY_MESSAGE =
  /api key (?:is )?not valid|api key expired|provided api key is invalid/i;

const isInvalidKeyError = error =>
  (Array.isArray(error?.details) &&
    error.details.some(detail => detail?.reason === INVALID_KEY_REASON)) ||
  INVALID_KEY_MESSAGE.test(error?.message || '');

const SAFE_PROVIDER_ERROR_STATUSES = new Set([
  'INVALID_ARGUMENT',
  'FAILED_PRECONDITION',
  'UNAUTHENTICATED',
  'PERMISSION_DENIED',
  'RESOURCE_EXHAUSTED',
  'NOT_FOUND',
  'UNAVAILABLE',
]);

const response = body => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const number = value => Number(value);

const validCoordinates = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) &&
  lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

const safeHttpsUrl = value =>
  typeof value === 'string' && /^https:\/\//i.test(value) ? value : null;

const toPhotoAttribution = attribution => {
  const name = typeof attribution?.displayName === 'string'
    ? attribution.displayName.trim()
    : '';
  if (!name) return null;

  return {
    name,
    uri: safeHttpsUrl(attribution.uri),
    photo_uri: safeHttpsUrl(attribution.photoUri),
  };
};

const toLegacyPhoto = photo => {
  if (typeof photo?.name !== 'string' || photo.name.length === 0) return null;

  return {
    photo_reference: photo.name,
    author_attributions: Array.isArray(photo.authorAttributions)
      ? photo.authorAttributions.map(toPhotoAttribution).filter(Boolean)
      : [],
    google_maps_uri: safeHttpsUrl(photo.googleMapsUri),
  };
};

const toLegacyPlace = place => ({
  place_id: place.id,
  name: place.displayName?.text || '',
  vicinity: place.formattedAddress || '',
  // Keep the response shape that the existing browser client accepts while
  // translating Places API (New)'s latitude/longitude fields.
  geometry: {
    location: {
      lat: place.location?.latitude,
      lng: place.location?.longitude,
    },
  },
  types: Array.isArray(place.types) ? place.types : [],
  primary_type: place.primaryType || null,
  primary_type_display_name: place.primaryTypeDisplayName?.text || null,
  business_status: place.businessStatus,
  rating: place.rating,
  price_level: LEGACY_PRICE_LEVELS[place.priceLevel],
  // Keep the author and source details alongside the short-lived reference.
  // The browser only renders a photo when it can show the accompanying credit
  // and a direct Google Maps source link where Google supplies them.
  photos: Array.isArray(place.photos)
    ? place.photos.map(toLegacyPhoto).filter(Boolean)
    : [],
});

const providerFailure = (status, payload) => {
  // This diagnostic deliberately names only the HTTP family. It lets the
  // preview prove whether a supplied credential reaches Places API (New),
  // without returning Google's message or any credential material.
  const upstreamDiagnostic = `UPSTREAM_HTTP_${status}`;
  const providerStatus = payload?.error?.status;
  const safeProviderStatus = SAFE_PROVIDER_ERROR_STATUSES.has(providerStatus)
    ? { provider_status: providerStatus }
    : {};
  const safeProviderCause = isInvalidKeyError(payload?.error)
    ? { provider_cause: 'INVALID_API_KEY' }
    : {};
  if (status === 429 || payload?.error?.status === 'RESOURCE_EXHAUSTED') {
    return {
      status: 'OVER_QUERY_LIMIT',
      error_message: upstreamDiagnostic,
      ...safeProviderStatus,
      ...safeProviderCause,
    };
  }
  // An expired or revoked key arrives as 400 INVALID_ARGUMENT rather than 401
  // or 403, so `provider_cause` is the only thing that identifies it. Treating
  // it as UNKNOWN_ERROR sent the person a card saying the search was
  // temporarily unreachable, with a Try again button that could never succeed;
  // REQUEST_DENIED reaches the no_key card, which names the setup fault and
  // offers no retry.
  if (
    status === 401 ||
    status === 403 ||
    payload?.error?.status === 'PERMISSION_DENIED' ||
    safeProviderCause.provider_cause === 'INVALID_API_KEY'
  ) {
    return {
      status: 'REQUEST_DENIED',
      error_message: upstreamDiagnostic,
      ...safeProviderStatus,
      ...safeProviderCause,
    };
  }
  return {
    status: 'UNKNOWN_ERROR',
    error_message: upstreamDiagnostic,
    ...safeProviderStatus,
    ...safeProviderCause,
  };
};

exports.handler = async event => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return response({ status: 'REQUEST_DENIED', error_message: 'NO_API_KEY' });
  }

  const { location, radius, type, types, keyword, maxprice, pageToken, unfiltered } =
    event.queryStringParameters || {};
  const [latString, lngString] = typeof location === 'string' ? location.split(',') : [];
  const lat = number(latString);
  const lng = number(lngString);
  const parsedRadius = number(radius || 5000);
  const safeRadius = Number.isFinite(parsedRadius)
    ? Math.min(Math.max(parsedRadius, 1), 50000)
    : 5000;

  if (!validCoordinates(lat, lng)) {
    return response({ status: 'INVALID_REQUEST' });
  }

  const circle = {
    center: { latitude: lat, longitude: lng },
    radius: safeRadius,
  };
  const priceLevels = PRICE_LEVELS_BY_MAX_PRICE[Number(maxprice)];
  const hasKeyword = typeof keyword === 'string' && keyword.trim().length > 0;
  const includedTypes = typeof types === 'string' && types.length > 0
    ? types.split(',').filter(Boolean)
    : [type || 'restaurant'];
  const hasPageToken = typeof pageToken === 'string' && pageToken.length > 0;
  const includedType = unfiltered === '1' ? null : (type || 'restaurant');
  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': hasKeyword || hasPageToken
      ? TEXT_SEARCH_FIELD_MASK
      : PLACE_FIELD_MASK,
  };
  const requestBody = hasPageToken
    ? { pageToken, pageSize: 20 }
    : hasKeyword
    ? {
        textQuery: keyword.trim(),
        ...(includedType ? { includedType, strictTypeFiltering: true } : {}),
        locationBias: { circle },
        pageSize: 20,
        ...(priceLevels ? { priceLevels } : {}),
      }
    : {
        includedTypes,
        locationRestriction: { circle },
        rankPreference: 'POPULARITY',
        maxResultCount: 20,
      };

  try {
    const upstream = await fetch(
      hasKeyword ? GOOGLE_TEXT_SEARCH_URL : GOOGLE_NEARBY_SEARCH_URL,
      { method: 'POST', headers, body: JSON.stringify(requestBody) },
    );
    const payload = await upstream.json();
    if (!upstream.ok) return response(providerFailure(upstream.status, payload));

    return response({
      status: 'OK',
      results: (Array.isArray(payload?.places) ? payload.places : []).map(toLegacyPlace),
      ...(typeof payload?.nextPageToken === 'string' && payload.nextPageToken.length > 0
        ? { next_page_token: payload.nextPageToken }
        : {}),
    });
  } catch (_) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'FETCH_ERROR', error_message: 'NETWORK_ERROR' }),
    };
  }
};
