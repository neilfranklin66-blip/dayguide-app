import { createPlaceRef, isPlaceRef } from '../models/geographicalPlan';

const PLACE_RESOLUTION_URL = '/.netlify/functions/places-resolve';

export const PLACE_QUERY_MIN_LENGTH = 3;
export const PLACE_QUERY_MAX_LENGTH = 120;

export const PLACE_RESOLUTION_ERROR = {
  INVALID_QUERY: 'INVALID_QUERY',
  NO_API_KEY: 'NO_API_KEY',
  API_DENIED: 'API_DENIED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RESOLVER_UNAVAILABLE: 'RESOLVER_UNAVAILABLE',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  RESOLUTION_FAILED: 'RESOLUTION_FAILED',
};

export const normalizePlaceQuery = value =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

export const isValidPlaceQuery = value => {
  const query = normalizePlaceQuery(value);
  return (
    query.length >= PLACE_QUERY_MIN_LENGTH &&
    query.length <= PLACE_QUERY_MAX_LENGTH
  );
};

const resolutionError = code => new Error(code);

const parseCandidate = candidate => {
  try {
    const place = createPlaceRef({
      id: candidate?.id,
      name: candidate?.name,
      address: candidate?.address,
      coordinates: candidate?.coordinates,
      source: candidate?.source,
    });
    return place.id && place.source === 'google_places' ? place : null;
  } catch (_) {
    return null;
  }
};

export async function resolvePlaceQuery(
  query,
  fetchImpl = (...args) => fetch(...args),
) {
  const normalizedQuery = normalizePlaceQuery(query);
  if (!isValidPlaceQuery(normalizedQuery)) {
    throw resolutionError(PLACE_RESOLUTION_ERROR.INVALID_QUERY);
  }

  let response;
  try {
    response = await fetchImpl(PLACE_RESOLUTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: normalizedQuery }),
    });
  } catch (_) {
    throw resolutionError(PLACE_RESOLUTION_ERROR.NETWORK_ERROR);
  }

  if (response.status === 404) {
    throw resolutionError(PLACE_RESOLUTION_ERROR.RESOLVER_UNAVAILABLE);
  }
  if (!response.ok) {
    throw resolutionError(`HTTP_${response.status}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (_) {
    throw resolutionError(PLACE_RESOLUTION_ERROR.INVALID_RESPONSE);
  }

  if (payload?.status === 'ZERO_RESULTS') return [];
  if (payload?.status === 'REQUEST_DENIED') {
    throw resolutionError(
      payload.error_message === 'NO_API_KEY'
        ? PLACE_RESOLUTION_ERROR.NO_API_KEY
        : PLACE_RESOLUTION_ERROR.API_DENIED,
    );
  }
  if (payload?.status === 'OVER_QUERY_LIMIT') {
    throw resolutionError(PLACE_RESOLUTION_ERROR.QUOTA_EXCEEDED);
  }
  if (payload?.status !== 'OK' || !Array.isArray(payload.candidates)) {
    throw resolutionError(PLACE_RESOLUTION_ERROR.RESOLUTION_FAILED);
  }

  const candidates = payload.candidates.map(parseCandidate).filter(isPlaceRef);
  if (payload.candidates.length > 0 && candidates.length === 0) {
    throw resolutionError(PLACE_RESOLUTION_ERROR.INVALID_RESPONSE);
  }
  return candidates;
}

const placeResolutionApi = {
  PLACE_QUERY_MAX_LENGTH,
  PLACE_QUERY_MIN_LENGTH,
  PLACE_RESOLUTION_ERROR,
  isValidPlaceQuery,
  normalizePlaceQuery,
  resolvePlaceQuery,
};

export default placeResolutionApi;
