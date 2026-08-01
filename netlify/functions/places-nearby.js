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
  'places.businessStatus',
  'places.rating',
  'places.priceLevel',
  'places.photos',
].join(',');

const PRICE_LEVELS_BY_MAX_PRICE = {
  1: ['PRICE_LEVEL_FREE', 'PRICE_LEVEL_INEXPENSIVE'],
  2: ['PRICE_LEVEL_FREE', 'PRICE_LEVEL_INEXPENSIVE', 'PRICE_LEVEL_MODERATE'],
  4: [
    'PRICE_LEVEL_FREE',
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

const response = body => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const number = value => Number(value);

const validCoordinates = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) &&
  lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

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
  business_status: place.businessStatus,
  rating: place.rating,
  price_level: LEGACY_PRICE_LEVELS[place.priceLevel],
  photos: Array.isArray(place.photos)
    ? place.photos
        // A photo with an author attribution needs presentation work in the
        // browser before it can be shown.  Do not proxy it until that work is
        // in place; an unattributed photo or the normal card fallback remains
        // safe to use now.
        .filter(
          photo =>
            typeof photo?.name === 'string' &&
            photo.name.length > 0 &&
            (!Array.isArray(photo.authorAttributions) ||
              photo.authorAttributions.length === 0),
        )
        .map(photo => ({ photo_reference: photo.name }))
    : [],
});

const providerFailure = (status, payload) => {
  // This diagnostic deliberately names only the HTTP family. It lets the
  // preview prove whether a supplied credential reaches Places API (New),
  // without returning Google's message or any credential material.
  const upstreamDiagnostic = `UPSTREAM_HTTP_${status}`;
  if (status === 429 || payload?.error?.status === 'RESOURCE_EXHAUSTED') {
    return { status: 'OVER_QUERY_LIMIT', error_message: upstreamDiagnostic };
  }
  if (status === 401 || status === 403 || payload?.error?.status === 'PERMISSION_DENIED') {
    return { status: 'REQUEST_DENIED', error_message: upstreamDiagnostic };
  }
  return { status: 'UNKNOWN_ERROR', error_message: upstreamDiagnostic };
};

exports.handler = async event => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return response({ status: 'REQUEST_DENIED', error_message: 'NO_API_KEY' });
  }

  const { location, radius, type, keyword, maxprice } =
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
  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': PLACE_FIELD_MASK,
  };
  const priceLevels = PRICE_LEVELS_BY_MAX_PRICE[Number(maxprice)];
  const hasKeyword = typeof keyword === 'string' && keyword.trim().length > 0;
  const requestBody = hasKeyword
    ? {
        textQuery: keyword.trim(),
        includedType: type || 'restaurant',
        locationBias: { circle },
        maxResultCount: 20,
        ...(priceLevels ? { priceLevels } : {}),
      }
    : {
        includedTypes: [type || 'restaurant'],
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
    });
  } catch (_) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'FETCH_ERROR', error_message: 'NETWORK_ERROR' }),
    };
  }
};
