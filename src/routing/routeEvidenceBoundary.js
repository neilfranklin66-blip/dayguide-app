import { buildHardAnchorPlan } from '../engines/hardAnchorEngine';
import { createRouteLeg } from '../models/geographicalPlan';

export const ROUTE_TRAVEL_MODE = {
  WALKING: 'walking',
  CYCLING: 'cycling',
  DRIVING: 'driving',
  TRANSIT: 'transit',
};

export const ROUTE_EVIDENCE_CLASS = {
  PROVIDER_ROUTE: 'provider_route',
  OPERATOR_SCHEDULE: 'operator_schedule',
  APPROXIMATE: 'approximate',
};

export const ROUTE_EVIDENCE_STATUS = {
  COMPLETE: 'complete',
  PARTIAL: 'partial',
  UNAVAILABLE: 'unavailable',
  NOT_REQUIRED: 'not_required',
};

export const ROUTE_EVIDENCE_PROBLEM = {
  ROUTE_EVIDENCE_UNAVAILABLE: 'route_evidence_unavailable',
  ROUTE_PROVIDER_UNAVAILABLE: 'route_provider_unavailable',
  ROUTE_QUOTA_EXCEEDED: 'route_quota_exceeded',
  ROUTE_ACCESS_DENIED: 'route_access_denied',
  ROUTE_NETWORK_ERROR: 'route_network_error',
  INVALID_ROUTE_EVIDENCE: 'invalid_route_evidence',
  UNTRUSTED_ROUTE_EVIDENCE: 'untrusted_route_evidence',
  DUPLICATE_ROUTE_EVIDENCE: 'duplicate_route_evidence',
  UNEXPECTED_ROUTE_EVIDENCE: 'unexpected_route_evidence',
};

const TRUSTED_EVIDENCE_CLASSES = new Set([
  ROUTE_EVIDENCE_CLASS.PROVIDER_ROUTE,
  ROUTE_EVIDENCE_CLASS.OPERATOR_SCHEDULE,
]);

const isNonEmptyString = value =>
  typeof value === 'string' && value.trim().length > 0;

const isNonNegativeWholeNumber = value =>
  Number.isInteger(value) && value >= 0;

const isValidDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
};

const isValidObservedAt = value =>
  isNonEmptyString(value) &&
  /(Z|[+-]\d{2}:\d{2})$/.test(value) &&
  !Number.isNaN(Date.parse(value));

const isValidTimeZone = value => {
  if (!isNonEmptyString(value)) return false;
  try {
    new Intl.DateTimeFormat('en-GB', {
      timeZone: value.trim(),
    }).format(new Date(0));
    return true;
  } catch (_) {
    return false;
  }
};

const copyPlace = place => ({
  ...place,
  coordinates: { ...place.coordinates },
});

const copyRouteRequest = request => ({
  ...request,
  fromPlace: copyPlace(request.fromPlace),
  toPlace: copyPlace(request.toPlace),
});

const localDateTime = (date, minuteOfDay) => {
  const hours = Math.floor(minuteOfDay / 60);
  const minutes = minuteOfDay % 60;
  return `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export function createRoutePlanningContext({
  date,
  timezone,
  travelMode = ROUTE_TRAVEL_MODE.TRANSIT,
} = {}) {
  if (!isValidDate(date)) {
    throw new TypeError('date must be a real calendar date in YYYY-MM-DD form');
  }
  if (!isValidTimeZone(timezone)) {
    throw new TypeError('timezone must be a valid IANA timezone name');
  }
  if (!Object.values(ROUTE_TRAVEL_MODE).includes(travelMode)) {
    throw new TypeError('travelMode is not supported by the route boundary');
  }

  return {
    date,
    timezone: timezone.trim(),
    travelMode,
  };
}

export function buildRouteEvidenceRequests({
  planningInput,
  context,
} = {}) {
  const normalizedContext = createRoutePlanningContext(context);
  const provisionalPlan = buildHardAnchorPlan({
    start: planningInput?.start,
    anchors: planningInput?.anchors,
    end: planningInput?.end,
    getTravelMinutes: () => null,
  });
  const points = new Map(
    [provisionalPlan.start, ...provisionalPlan.anchors, provisionalPlan.end]
      .filter(Boolean)
      .map(point => [point.id, point]),
  );

  return provisionalPlan.windows.map(window => {
    const from = points.get(window.fromPointId);
    const to = points.get(window.toPointId);

    return {
      id: window.id,
      fromPointId: from.id,
      toPointId: to.id,
      fromPlace: copyPlace(from.place),
      toPlace: copyPlace(to.place),
      travelMode: normalizedContext.travelMode,
      departureMinuteOfDay: window.opensAtMinutes,
      departureLocalDateTime: localDateTime(
        normalizedContext.date,
        window.opensAtMinutes,
      ),
      arrivalTargetMinuteOfDay: window.arrivalTargetMinutes,
      arrivalTargetLocalDateTime:
        window.arrivalTargetMinutes == null
          ? null
          : localDateTime(
              normalizedContext.date,
              window.arrivalTargetMinutes,
            ),
      timezone: normalizedContext.timezone,
    };
  });
}

const problemFor = (code, request, requestId = request?.id ?? null) => ({
  code,
  requestId,
  fromPointId: request?.fromPointId ?? null,
  toPointId: request?.toPointId ?? null,
});

const providerProblemCode = error => {
  switch (error?.message) {
    case 'ROUTE_QUOTA_EXCEEDED':
      return ROUTE_EVIDENCE_PROBLEM.ROUTE_QUOTA_EXCEEDED;
    case 'ROUTE_ACCESS_DENIED':
      return ROUTE_EVIDENCE_PROBLEM.ROUTE_ACCESS_DENIED;
    case 'NETWORK_ERROR':
      return ROUTE_EVIDENCE_PROBLEM.ROUTE_NETWORK_ERROR;
    default:
      return ROUTE_EVIDENCE_PROBLEM.ROUTE_PROVIDER_UNAVAILABLE;
  }
};

const normalizeEvidence = (record, request) => {
  if (!TRUSTED_EVIDENCE_CLASSES.has(record?.evidenceClass)) {
    return {
      evidence: null,
      problemCode:
        record?.evidenceClass === ROUTE_EVIDENCE_CLASS.APPROXIMATE
          ? ROUTE_EVIDENCE_PROBLEM.UNTRUSTED_ROUTE_EVIDENCE
          : ROUTE_EVIDENCE_PROBLEM.INVALID_ROUTE_EVIDENCE,
    };
  }
  if (
    record.requestId !== request.id ||
    record.travelMode !== request.travelMode ||
    !isNonNegativeWholeNumber(record.durationMinutes) ||
    (record.distanceMeters != null &&
      (typeof record.distanceMeters !== 'number' ||
        !Number.isFinite(record.distanceMeters) ||
        record.distanceMeters < 0)) ||
    !isNonEmptyString(record.evidenceSource) ||
    !isValidObservedAt(record.observedAt)
  ) {
    return {
      evidence: null,
      problemCode: ROUTE_EVIDENCE_PROBLEM.INVALID_ROUTE_EVIDENCE,
    };
  }

  return {
    evidence: {
      requestId: request.id,
      evidenceClass: record.evidenceClass,
      routeLeg: createRouteLeg({
        id: request.id,
        fromPointId: request.fromPointId,
        toPointId: request.toPointId,
        mode: record.travelMode,
        durationMinutes: record.durationMinutes,
        distanceMeters: record.distanceMeters ?? null,
        evidenceSource: record.evidenceSource.trim(),
        observedAt: record.observedAt,
      }),
    },
    problemCode: null,
  };
};

const collectionStatus = (requestCount, evidenceCount) => {
  if (requestCount === 0) return ROUTE_EVIDENCE_STATUS.NOT_REQUIRED;
  if (evidenceCount === requestCount) return ROUTE_EVIDENCE_STATUS.COMPLETE;
  if (evidenceCount > 0) return ROUTE_EVIDENCE_STATUS.PARTIAL;
  return ROUTE_EVIDENCE_STATUS.UNAVAILABLE;
};

export async function collectRouteEvidence({
  planningInput,
  context,
  resolveRouteEvidence,
} = {}) {
  if (typeof resolveRouteEvidence !== 'function') {
    throw new TypeError('resolveRouteEvidence must be a function');
  }

  const normalizedContext = createRoutePlanningContext(context);
  const requests = buildRouteEvidenceRequests({
    planningInput,
    context: normalizedContext,
  });

  if (requests.length === 0) {
    return {
      status: ROUTE_EVIDENCE_STATUS.NOT_REQUIRED,
      context: normalizedContext,
      requests: [],
      evidence: [],
      problems: [],
    };
  }

  let records;
  try {
    records = await resolveRouteEvidence({
      context: { ...normalizedContext },
      requests: requests.map(copyRouteRequest),
    });
  } catch (error) {
    const problemCode = providerProblemCode(error);
    return {
      status: ROUTE_EVIDENCE_STATUS.UNAVAILABLE,
      context: normalizedContext,
      requests,
      evidence: [],
      problems: requests.map(request => problemFor(problemCode, request)),
    };
  }

  if (!Array.isArray(records)) {
    return {
      status: ROUTE_EVIDENCE_STATUS.UNAVAILABLE,
      context: normalizedContext,
      requests,
      evidence: [],
      problems: requests.map(request =>
        problemFor(
          ROUTE_EVIDENCE_PROBLEM.INVALID_ROUTE_EVIDENCE,
          request,
        ),
      ),
    };
  }

  const recordsByRequest = new Map();
  records.forEach(record => {
    const requestId = isNonEmptyString(record?.requestId)
      ? record.requestId
      : '';
    const existing = recordsByRequest.get(requestId) ?? [];
    existing.push(record);
    recordsByRequest.set(requestId, existing);
  });

  const requestById = new Map(requests.map(request => [request.id, request]));
  const evidence = [];
  const problems = [];

  requests.forEach(request => {
    const matching = recordsByRequest.get(request.id) ?? [];
    if (matching.length === 0) {
      problems.push(
        problemFor(
          ROUTE_EVIDENCE_PROBLEM.ROUTE_EVIDENCE_UNAVAILABLE,
          request,
        ),
      );
      return;
    }
    if (matching.length > 1) {
      problems.push(
        problemFor(
          ROUTE_EVIDENCE_PROBLEM.DUPLICATE_ROUTE_EVIDENCE,
          request,
        ),
      );
      return;
    }

    const normalized = normalizeEvidence(matching[0], request);
    if (normalized.evidence) {
      evidence.push(normalized.evidence);
    } else {
      problems.push(problemFor(normalized.problemCode, request));
    }
  });

  recordsByRequest.forEach((matching, requestId) => {
    if (requestById.has(requestId)) return;
    matching.forEach(() =>
      problems.push(
        problemFor(
          ROUTE_EVIDENCE_PROBLEM.UNEXPECTED_ROUTE_EVIDENCE,
          null,
          requestId || null,
        ),
      ),
    );
  });

  return {
    status: collectionStatus(requests.length, evidence.length),
    context: normalizedContext,
    requests,
    evidence,
    problems,
  };
}

const routeEvidenceBoundary = {
  ROUTE_EVIDENCE_CLASS,
  ROUTE_EVIDENCE_PROBLEM,
  ROUTE_EVIDENCE_STATUS,
  ROUTE_TRAVEL_MODE,
  buildRouteEvidenceRequests,
  collectRouteEvidence,
  createRoutePlanningContext,
};

export default routeEvidenceBoundary;
