import {
  GEOGRAPHICAL_PLAN_SCHEMA_VERSION,
  PLANNING_POINT_KIND,
  createRouteLeg,
  isPlaceRef,
} from '../models/geographicalPlan';

const isNonNegativeWholeNumber = value =>
  Number.isInteger(value) && value >= 0;

const requirePlanningPoint = (point, expectedKind, label) => {
  if (
    point == null ||
    typeof point !== 'object' ||
    point.kind !== expectedKind ||
    typeof point.id !== 'string' ||
    point.id.length === 0 ||
    !isPlaceRef(point.place)
  ) {
    throw new TypeError(`${label} must be a valid ${expectedKind} point`);
  }

  if (
    expectedKind === PLANNING_POINT_KIND.START &&
    (!Number.isInteger(point.departureTimeMinutes) ||
      point.departureTimeMinutes < 0 ||
      point.departureTimeMinutes >= 24 * 60)
  ) {
    throw new TypeError(`${label} has an invalid departure time`);
  }

  if (
    expectedKind === PLANNING_POINT_KIND.HARD_ANCHOR &&
    (!Number.isInteger(point.startTimeMinutes) ||
      point.startTimeMinutes < 0 ||
      point.startTimeMinutes >= 24 * 60 ||
      !isNonNegativeWholeNumber(point.durationMinutes) ||
      !isNonNegativeWholeNumber(point.arrivalBufferMinutes) ||
      point.arrivalBufferMinutes > point.startTimeMinutes ||
      point.startTimeMinutes + point.durationMinutes > 24 * 60 ||
      point.plannerLocked !== true)
  ) {
    throw new TypeError(`${label} has invalid hard-anchor constraints`);
  }

  if (
    expectedKind === PLANNING_POINT_KIND.END &&
    ((point.arrivalDeadlineMinutes != null &&
      (!Number.isInteger(point.arrivalDeadlineMinutes) ||
        point.arrivalDeadlineMinutes < 0 ||
        point.arrivalDeadlineMinutes >= 24 * 60)) ||
      !isNonNegativeWholeNumber(point.arrivalBufferMinutes) ||
      (point.arrivalDeadlineMinutes != null &&
        point.arrivalBufferMinutes > point.arrivalDeadlineMinutes))
  ) {
    throw new TypeError(`${label} has invalid end-point constraints`);
  }

  return point;
};

const requireTravelResolver = getTravelMinutes => {
  if (typeof getTravelMinutes !== 'function') {
    throw new TypeError('getTravelMinutes must be a function');
  }
  return getTravelMinutes;
};

const departureTimeFor = point => {
  if (point.kind === PLANNING_POINT_KIND.START) {
    return point.departureTimeMinutes;
  }
  return point.startTimeMinutes + point.durationMinutes;
};

const arrivalTargetFor = point => {
  if (point.kind === PLANNING_POINT_KIND.HARD_ANCHOR) {
    return point.startTimeMinutes - point.arrivalBufferMinutes;
  }
  if (
    point.kind === PLANNING_POINT_KIND.END &&
    point.arrivalDeadlineMinutes != null
  ) {
    return point.arrivalDeadlineMinutes - point.arrivalBufferMinutes;
  }
  return null;
};

const normalizeTravelEvidence = evidence => {
  if (isNonNegativeWholeNumber(evidence)) {
    return {
      durationMinutes: evidence,
      mode: 'unspecified',
      distanceMeters: null,
      evidenceSource: 'injected',
      observedAt: null,
    };
  }

  if (
    evidence == null ||
    typeof evidence !== 'object' ||
    !isNonNegativeWholeNumber(evidence.durationMinutes)
  ) {
    return null;
  }

  return {
    durationMinutes: evidence.durationMinutes,
    mode:
      typeof evidence.mode === 'string' && evidence.mode.length > 0
        ? evidence.mode
        : 'unspecified',
    distanceMeters:
      typeof evidence.distanceMeters === 'number' &&
      Number.isFinite(evidence.distanceMeters) &&
      evidence.distanceMeters >= 0
        ? evidence.distanceMeters
        : null,
    evidenceSource:
      typeof evidence.evidenceSource === 'string' &&
      evidence.evidenceSource.length > 0
        ? evidence.evidenceSource
        : 'injected',
    observedAt:
      typeof evidence.observedAt === 'string' && evidence.observedAt.length > 0
        ? evidence.observedAt
        : null,
  };
};

const copyPlanningPoint = point => ({
  ...point,
  place: {
    ...point.place,
    coordinates: { ...point.place.coordinates },
  },
});

const sortAnchorsWithoutMutation = anchors =>
  anchors
    .map((anchor, originalIndex) => ({ anchor, originalIndex }))
    .sort(
      (left, right) =>
        left.anchor.startTimeMinutes - right.anchor.startTimeMinutes ||
        left.originalIndex - right.originalIndex,
    )
    .map(({ anchor }) => anchor);

const buildProblem = ({
  code,
  windowId,
  fromPointId,
  toPointId,
  shortfallMinutes = null,
}) => ({
  code,
  windowId,
  fromPointId,
  toPointId,
  shortfallMinutes,
});

/**
 * Build the fixed planning windows between the start point, hard anchors, and
 * optional end point.
 *
 * The engine is deliberately provider-independent: getTravelMinutes supplies
 * deterministic travel evidence. A missing estimate makes the plan
 * indeterminate; it never becomes a guessed success. Hard anchors are copied
 * exactly and never moved.
 */
export function buildHardAnchorPlan({
  start,
  anchors = [],
  end = null,
  getTravelMinutes,
} = {}) {
  requirePlanningPoint(start, PLANNING_POINT_KIND.START, 'start');
  requireTravelResolver(getTravelMinutes);

  if (!Array.isArray(anchors)) {
    throw new TypeError('anchors must be an array');
  }
  anchors.forEach((anchor, index) =>
    requirePlanningPoint(
      anchor,
      PLANNING_POINT_KIND.HARD_ANCHOR,
      `anchors[${index}]`,
    ),
  );
  if (end != null) {
    requirePlanningPoint(end, PLANNING_POINT_KIND.END, 'end');
  }

  const sortedAnchors = sortAnchorsWithoutMutation(anchors);
  const destinations = end == null ? sortedAnchors : [...sortedAnchors, end];
  const pointIds = [start, ...destinations].map(point => point.id);
  if (new Set(pointIds).size !== pointIds.length) {
    throw new TypeError('planning point ids must be unique');
  }
  const windows = [];
  const problems = [];
  let origin = start;

  destinations.forEach(destination => {
    const windowId = `${origin.id}->${destination.id}`;
    const opensAtMinutes = departureTimeFor(origin);
    const arrivalTargetMinutes = arrivalTargetFor(destination);
    const travelEvidence = normalizeTravelEvidence(
      getTravelMinutes({
        from: copyPlanningPoint(origin),
        to: copyPlanningPoint(destination),
      }),
    );
    const spanMinutes =
      arrivalTargetMinutes == null
        ? null
        : arrivalTargetMinutes - opensAtMinutes;

    let status = arrivalTargetMinutes == null ? 'unconstrained' : 'feasible';
    let availableFlexibleMinutes = null;
    let routeLeg = null;

    if (!travelEvidence) {
      status = 'indeterminate';
      problems.push(
        buildProblem({
          code: 'travel_time_unavailable',
          windowId,
          fromPointId: origin.id,
          toPointId: destination.id,
        }),
      );
    } else {
      routeLeg = createRouteLeg({
        id: windowId,
        fromPointId: origin.id,
        toPointId: destination.id,
        ...travelEvidence,
      });

      if (arrivalTargetMinutes != null) {
        availableFlexibleMinutes =
          spanMinutes - travelEvidence.durationMinutes;
        if (availableFlexibleMinutes < 0) {
          status = 'infeasible';
          problems.push(
            buildProblem({
              code: 'insufficient_travel_time',
              windowId,
              fromPointId: origin.id,
              toPointId: destination.id,
              shortfallMinutes: Math.abs(availableFlexibleMinutes),
            }),
          );
        }
      }
    }

    windows.push({
      id: windowId,
      fromPointId: origin.id,
      toPointId: destination.id,
      opensAtMinutes,
      arrivalTargetMinutes,
      spanMinutes,
      directTravelMinutes: routeLeg?.durationMinutes ?? null,
      availableFlexibleMinutes,
      status,
      routeLeg,
    });

    origin = destination;
  });

  const status = problems.some(
    problem => problem.code === 'insufficient_travel_time',
  )
    ? 'infeasible'
    : problems.length > 0
      ? 'indeterminate'
      : 'feasible';

  return {
    schemaVersion: GEOGRAPHICAL_PLAN_SCHEMA_VERSION,
    status,
    start: copyPlanningPoint(start),
    anchors: sortedAnchors.map(copyPlanningPoint),
    end: end == null ? null : copyPlanningPoint(end),
    windows,
    problems,
  };
}

/**
 * Determine whether one flexible stop safely fits inside a constrained window.
 * Both travel legs must be supplied; this function never substitutes a guessed
 * travel time.
 */
export function assessFlexibleStopFit({
  window,
  stop,
  travelToStopMinutes,
  travelFromStopMinutes,
  useMinimumDuration = false,
} = {}) {
  if (
    window == null ||
    typeof window !== 'object' ||
    window.arrivalTargetMinutes == null
  ) {
    return {
      fits: null,
      reason: 'window_not_constrained',
      requiredMinutes: null,
      remainingMinutes: null,
    };
  }

  if (!Number.isInteger(window.spanMinutes)) {
    throw new TypeError('window must contain a whole-minute span');
  }

  if (window.spanMinutes < 0) {
    return {
      fits: false,
      reason: 'window_infeasible',
      requiredMinutes: null,
      remainingMinutes: window.spanMinutes,
    };
  }

  if (
    stop == null ||
    stop.kind !== PLANNING_POINT_KIND.FLEXIBLE_STOP ||
    !isPlaceRef(stop.place) ||
    !isNonNegativeWholeNumber(stop.durationMinutes) ||
    stop.durationMinutes === 0 ||
    !isNonNegativeWholeNumber(stop.minimumDurationMinutes) ||
    stop.minimumDurationMinutes === 0 ||
    stop.minimumDurationMinutes > stop.durationMinutes ||
    stop.plannerLocked !== false
  ) {
    throw new TypeError('stop must be a valid flexible_stop');
  }

  if (
    !isNonNegativeWholeNumber(travelToStopMinutes) ||
    !isNonNegativeWholeNumber(travelFromStopMinutes)
  ) {
    return {
      fits: null,
      reason: 'travel_time_unavailable',
      requiredMinutes: null,
      remainingMinutes: null,
    };
  }

  const visitMinutes = useMinimumDuration
    ? stop.minimumDurationMinutes
    : stop.durationMinutes;
  const requiredMinutes =
    travelToStopMinutes + visitMinutes + travelFromStopMinutes;
  const remainingMinutes = window.spanMinutes - requiredMinutes;

  return {
    fits: remainingMinutes >= 0,
    reason: remainingMinutes >= 0 ? 'fits' : 'insufficient_time',
    requiredMinutes,
    remainingMinutes,
  };
}

const hardAnchorEngine = {
  assessFlexibleStopFit,
  buildHardAnchorPlan,
};

export default hardAnchorEngine;
