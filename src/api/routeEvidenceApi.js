import {
  ROUTING_PROVIDER_POLICY,
  createProviderRouteBatch,
} from '../routing/routingProviderPolicy';

const ROUTE_EVIDENCE_URL = '/.netlify/functions/routes-evidence';

export const ROUTE_PROVIDER_ERROR = {
  UNAVAILABLE: 'ROUTE_PROVIDER_UNAVAILABLE',
  ACCESS_DENIED: 'ROUTE_ACCESS_DENIED',
  QUOTA_EXCEEDED: 'ROUTE_QUOTA_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE: 'ROUTE_PROVIDER_INVALID_RESPONSE',
};

const providerError = code => new Error(code);

export async function resolveGoogleRouteEvidence(
  batch,
  {
    fetchImpl = globalThis.fetch,
    getIdToken,
  } = {},
) {
  const providerBatch = createProviderRouteBatch(batch);
  if (providerBatch.requests.length === 0) return [];

  let idToken;
  try {
    idToken =
      typeof getIdToken === 'function' ? await getIdToken() : null;
  } catch (_) {
    throw providerError(ROUTE_PROVIDER_ERROR.ACCESS_DENIED);
  }
  if (typeof idToken !== 'string' || idToken.trim() === '') {
    throw providerError(ROUTE_PROVIDER_ERROR.ACCESS_DENIED);
  }

  let response;
  try {
    response = await fetchImpl(ROUTE_EVIDENCE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(providerBatch),
    });
  } catch (_) {
    throw providerError(ROUTE_PROVIDER_ERROR.NETWORK_ERROR);
  }

  if (response.status === 404) {
    throw providerError(ROUTE_PROVIDER_ERROR.UNAVAILABLE);
  }
  if (response.status === 401 || response.status === 403) {
    throw providerError(ROUTE_PROVIDER_ERROR.ACCESS_DENIED);
  }
  if (response.status === 429) {
    throw providerError(ROUTE_PROVIDER_ERROR.QUOTA_EXCEEDED);
  }
  if (!response.ok) {
    throw providerError(ROUTE_PROVIDER_ERROR.UNAVAILABLE);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (_) {
    throw providerError(ROUTE_PROVIDER_ERROR.INVALID_RESPONSE);
  }

  if (payload?.status === 'DISABLED') {
    throw providerError(ROUTE_PROVIDER_ERROR.UNAVAILABLE);
  }
  if (payload?.status === 'REQUEST_DENIED') {
    throw providerError(ROUTE_PROVIDER_ERROR.ACCESS_DENIED);
  }
  if (payload?.status === 'OVER_QUERY_LIMIT') {
    throw providerError(ROUTE_PROVIDER_ERROR.QUOTA_EXCEEDED);
  }
  if (payload?.status === 'FETCH_ERROR') {
    throw providerError(ROUTE_PROVIDER_ERROR.NETWORK_ERROR);
  }
  if (payload?.status === 'ZERO_RESULTS') return [];
  if (
    !['OK', 'PARTIAL'].includes(payload?.status) ||
    !Array.isArray(payload.evidence) ||
    payload.evidence.length > ROUTING_PROVIDER_POLICY.maxLegsPerCheck
  ) {
    throw providerError(ROUTE_PROVIDER_ERROR.INVALID_RESPONSE);
  }

  return payload.evidence;
}

const routeEvidenceApi = {
  ROUTE_PROVIDER_ERROR,
  resolveGoogleRouteEvidence,
};

export default routeEvidenceApi;
