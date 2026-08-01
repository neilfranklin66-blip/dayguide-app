import { PACKET166_CALIBRATION_PLAN } from './packet166Approval';

export const PACKET166_RUN_ACKNOWLEDGEMENT =
  'PACKET166_MAXIMUM_24_PROVIDER_EVENTS_APPROVED';
export const PACKET166_CANONICAL_PRODUCTION_ORIGIN =
  'https://ubiquitous-melomakarona-874d9c.netlify.app';

export const PACKET166_RUN_ERROR = {
  INVALID_ACKNOWLEDGEMENT: 'PACKET166_ACKNOWLEDGEMENT_REQUIRED',
  INVALID_PREVIEW_ORIGIN: 'PACKET166_PREVIEW_ORIGIN_INVALID',
  INVALID_BATCH_SELECTION: 'PACKET166_BATCH_SELECTION_INVALID',
  AUTHENTICATION_FAILED: 'PACKET166_AUTHENTICATION_FAILED',
  PREVIEW_UNAVAILABLE: 'PACKET166_PREVIEW_UNAVAILABLE',
  PREVIEW_RATE_LIMITED: 'PACKET166_PREVIEW_RATE_LIMITED',
  PROVIDER_REJECTED: 'PACKET166_PROVIDER_REJECTED',
  INVALID_RESPONSE: 'PACKET166_RESPONSE_INVALID',
};

const errorWithCode = code => new Error(code);

const normalizePreviewOrigin = value => {
  let url;
  try {
    url = new URL(value);
  } catch (_) {
    throw errorWithCode(PACKET166_RUN_ERROR.INVALID_PREVIEW_ORIGIN);
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/' ||
    !url.hostname.endsWith('.netlify.app') ||
    url.origin === PACKET166_CANONICAL_PRODUCTION_ORIGIN
  ) {
    throw errorWithCode(PACKET166_RUN_ERROR.INVALID_PREVIEW_ORIGIN);
  }
  return url.origin;
};

const normalizeBatchIndexes = value => {
  const indexes = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',').map(item => Number(item.trim()))
      : [];
  if (
    indexes.length < 1 ||
    indexes.length > 3 ||
    indexes.some(index => !Number.isInteger(index)) ||
    new Set(indexes).size !== indexes.length ||
    indexes.some(
      index =>
        index < 0 || index >= PACKET166_CALIBRATION_PLAN.batches.length,
    )
  ) {
    throw errorWithCode(PACKET166_RUN_ERROR.INVALID_BATCH_SELECTION);
  }
  return [...indexes].sort((left, right) => left - right);
};

export function createPacket166RunSelection({
  previewOrigin,
  acknowledgement,
  batchIndexes,
} = {}) {
  if (acknowledgement !== PACKET166_RUN_ACKNOWLEDGEMENT) {
    throw errorWithCode(
      PACKET166_RUN_ERROR.INVALID_ACKNOWLEDGEMENT,
    );
  }
  const normalizedIndexes = normalizeBatchIndexes(batchIndexes);
  const batches = normalizedIndexes.map(
    index => PACKET166_CALIBRATION_PLAN.batches[index],
  );
  const providerRequestCount = batches.reduce(
    (count, batch) => count + batch.requests.length,
    0,
  );

  return {
    previewOrigin: normalizePreviewOrigin(previewOrigin),
    batchIndexes: normalizedIndexes,
    batches,
    providerRequestCount,
    fullExerciseMaximumProviderRequests:
      PACKET166_CALIBRATION_PLAN.maximumBillableEvents,
    automaticRetryCount: 0,
  };
}

const parsePayload = async response => {
  try {
    return await response.json();
  } catch (_) {
    throw errorWithCode(PACKET166_RUN_ERROR.INVALID_RESPONSE);
  }
};

const statusError = (response, payload) => {
  if (response.status === 429 || payload?.status === 'OVER_QUERY_LIMIT') {
    return PACKET166_RUN_ERROR.PREVIEW_RATE_LIMITED;
  }
  if (response.status === 401 || response.status === 403) {
    return PACKET166_RUN_ERROR.AUTHENTICATION_FAILED;
  }
  if (
    payload?.status === 'REQUEST_DENIED' ||
    payload?.status === 'AUTH_REQUIRED'
  ) {
    return PACKET166_RUN_ERROR.PROVIDER_REJECTED;
  }
  if (
    payload?.status === 'DISABLED' ||
    payload?.status === 'AUTH_UNAVAILABLE' ||
    payload?.status === 'FETCH_ERROR' ||
    !response.ok
  ) {
    return PACKET166_RUN_ERROR.PREVIEW_UNAVAILABLE;
  }
  return null;
};

const sanitizeBatchResult = ({ batchIndex, batch, payload }) => {
  if (
    !['OK', 'PARTIAL', 'ZERO_RESULTS'].includes(payload?.status) ||
    !Array.isArray(payload?.evidence)
  ) {
    throw errorWithCode(PACKET166_RUN_ERROR.INVALID_RESPONSE);
  }
  const evidenceById = new Map(
    payload.evidence.map(item => [item?.requestId, item]),
  );
  if (evidenceById.size !== payload.evidence.length) {
    throw errorWithCode(PACKET166_RUN_ERROR.INVALID_RESPONSE);
  }
  const results = batch.requests.map(request => {
    const evidence = evidenceById.get(request.id);
    if (!evidence) {
      return {
        scenarioId: request.id,
        travelMode: request.travelMode,
        providerRouteFound: false,
        providerDurationMinutes: null,
        distanceMeters: null,
        observedAt: null,
      };
    }
    if (
      evidence.travelMode !== request.travelMode ||
      !Number.isInteger(evidence.durationMinutes) ||
      evidence.durationMinutes < 1 ||
      !Number.isInteger(evidence.distanceMeters) ||
      evidence.distanceMeters < 0 ||
      typeof evidence.observedAt !== 'string'
    ) {
      throw errorWithCode(PACKET166_RUN_ERROR.INVALID_RESPONSE);
    }
    return {
      scenarioId: request.id,
      travelMode: request.travelMode,
      providerRouteFound: true,
      providerDurationMinutes: evidence.durationMinutes,
      distanceMeters: evidence.distanceMeters,
      observedAt: evidence.observedAt,
    };
  });
  if (
    evidenceById.size !==
    results.filter(result => result.providerRouteFound).length
  ) {
    throw errorWithCode(PACKET166_RUN_ERROR.INVALID_RESPONSE);
  }

  return {
    batchIndex,
    providerStatus: payload.status,
    requestCount: batch.requests.length,
    results,
  };
};

export async function runPacket166Calibration({
  selection,
  getIdToken,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (
    !selection ||
    typeof getIdToken !== 'function' ||
    typeof fetchImpl !== 'function'
  ) {
    throw errorWithCode(PACKET166_RUN_ERROR.AUTHENTICATION_FAILED);
  }
  const output = [];
  for (let offset = 0; offset < selection.batches.length; offset += 1) {
    let idToken;
    try {
      idToken = await getIdToken();
    } catch (_) {
      throw errorWithCode(PACKET166_RUN_ERROR.AUTHENTICATION_FAILED);
    }
    if (typeof idToken !== 'string' || idToken.trim() === '') {
      throw errorWithCode(PACKET166_RUN_ERROR.AUTHENTICATION_FAILED);
    }
    let response;
    try {
      response = await fetchImpl(
        `${selection.previewOrigin}/.netlify/functions/routes-evidence`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(selection.batches[offset]),
        },
      );
    } catch (_) {
      throw errorWithCode(PACKET166_RUN_ERROR.PREVIEW_UNAVAILABLE);
    }
    const payload = await parsePayload(response);
    const failure = statusError(response, payload);
    if (failure) throw errorWithCode(failure);
    output.push(
      sanitizeBatchResult({
        batchIndex: selection.batchIndexes[offset],
        batch: selection.batches[offset],
        payload,
      }),
    );
  }

  return {
    schemaVersion: 1,
    packet: 166,
    previewHost: new URL(selection.previewOrigin).hostname,
    batchIndexes: [...selection.batchIndexes],
    providerRequestCount: selection.providerRequestCount,
    automaticRetryCount: 0,
    batches: output,
  };
}

const packet166CalibrationRunner = {
  PACKET166_CANONICAL_PRODUCTION_ORIGIN,
  PACKET166_RUN_ACKNOWLEDGEMENT,
  PACKET166_RUN_ERROR,
  createPacket166RunSelection,
  runPacket166Calibration,
};

export default packet166CalibrationRunner;
