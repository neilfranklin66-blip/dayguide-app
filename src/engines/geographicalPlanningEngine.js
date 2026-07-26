import { buildHardAnchorPlan } from './hardAnchorEngine';
import {
  ROUTE_EVIDENCE_CLASS,
  collectRouteEvidence,
} from '../routing/routeEvidenceBoundary';

export const GEOGRAPHICAL_PLANNING_STATUS = {
  READY: 'ready',
  INFEASIBLE: 'infeasible',
  EVIDENCE_REQUIRED: 'evidence_required',
  DIRECTIONAL: 'directional',
  NO_ROUTE_REQUIRED: 'no_route_required',
};

const resolverFromEvidence = routeEvidence => {
  const trustedClasses = new Set([
    ROUTE_EVIDENCE_CLASS.PROVIDER_ROUTE,
    ROUTE_EVIDENCE_CLASS.OPERATOR_SCHEDULE,
  ]);
  const byWindow = new Map();
  (Array.isArray(routeEvidence?.evidence) ? routeEvidence.evidence : []).forEach(
    item => {
      const leg = item?.routeLeg;
      if (
        trustedClasses.has(item?.evidenceClass) &&
        leg &&
        leg.id === item.requestId &&
        leg.fromPointId &&
        leg.toPointId
      ) {
        byWindow.set(leg.id, leg);
      }
    },
  );

  return ({ from, to }) => {
    const id = `${from.id}->${to.id}`;
    const leg = byWindow.get(id);
    if (
      !leg ||
      leg.fromPointId !== from.id ||
      leg.toPointId !== to.id
    ) {
      return null;
    }
    return {
      durationMinutes: leg.durationMinutes,
      distanceMeters: leg.distanceMeters,
      mode: leg.mode,
      evidenceSource: leg.evidenceSource,
      observedAt: leg.observedAt,
    };
  };
};

const copyRouteEvidence = routeEvidence => {
  if (routeEvidence == null || typeof routeEvidence !== 'object') return null;
  return {
    ...routeEvidence,
    context:
      routeEvidence.context == null ? null : { ...routeEvidence.context },
    requests: Array.isArray(routeEvidence.requests)
      ? routeEvidence.requests.map(request => ({
          ...request,
          fromPlace: request.fromPlace
            ? {
                ...request.fromPlace,
                coordinates: { ...request.fromPlace.coordinates },
              }
            : null,
          toPlace: request.toPlace
            ? {
                ...request.toPlace,
                coordinates: { ...request.toPlace.coordinates },
              }
            : null,
        }))
      : [],
    evidence: Array.isArray(routeEvidence.evidence)
      ? routeEvidence.evidence.map(item => ({
          ...item,
          routeLeg: item.routeLeg ? { ...item.routeLeg } : null,
        }))
      : [],
    problems: Array.isArray(routeEvidence.problems)
      ? routeEvidence.problems.map(problem => ({ ...problem }))
      : [],
  };
};

const planningStatusFor = plan => {
  if (plan.windows.length === 0) {
    return GEOGRAPHICAL_PLANNING_STATUS.NO_ROUTE_REQUIRED;
  }
  if (plan.status === 'infeasible') {
    return GEOGRAPHICAL_PLANNING_STATUS.INFEASIBLE;
  }
  if (plan.status === 'indeterminate') {
    return GEOGRAPHICAL_PLANNING_STATUS.EVIDENCE_REQUIRED;
  }
  if (plan.windows.every(window => window.arrivalTargetMinutes == null)) {
    return GEOGRAPHICAL_PLANNING_STATUS.DIRECTIONAL;
  }
  return GEOGRAPHICAL_PLANNING_STATUS.READY;
};

export function assessGeographicalPlanningInput({
  planningInput,
  routeEvidence,
} = {}) {
  const copiedRouteEvidence = copyRouteEvidence(routeEvidence);
  const plan = buildHardAnchorPlan({
    start: planningInput?.start,
    anchors: planningInput?.anchors,
    end: planningInput?.end,
    getTravelMinutes: resolverFromEvidence(copiedRouteEvidence),
  });
  const status = planningStatusFor(plan);
  const routeProblems = Array.isArray(copiedRouteEvidence?.problems)
    ? copiedRouteEvidence.problems.map(problem => ({ ...problem }))
    : [];

  return {
    status,
    canContinue: [
      GEOGRAPHICAL_PLANNING_STATUS.READY,
      GEOGRAPHICAL_PLANNING_STATUS.DIRECTIONAL,
      GEOGRAPHICAL_PLANNING_STATUS.NO_ROUTE_REQUIRED,
    ].includes(status),
    fixedConstraintsPreserved: true,
    plan,
    routeEvidence: copiedRouteEvidence,
    problems: [
      ...routeProblems,
      ...plan.problems.map(problem => ({ ...problem })),
    ],
    summary: {
      anchorCount: plan.anchors.length,
      routeLegCount: plan.windows.length,
      evidencedLegCount: plan.windows.filter(window => window.routeLeg).length,
      constrainedWindowCount: plan.windows.filter(
        window => window.arrivalTargetMinutes != null,
      ).length,
    },
  };
}

export async function prepareGeographicalPlan({
  planningInput,
  context,
  resolveRouteEvidence,
} = {}) {
  const routeEvidence = await collectRouteEvidence({
    planningInput,
    context,
    resolveRouteEvidence,
  });
  return assessGeographicalPlanningInput({
    planningInput,
    routeEvidence,
  });
}

const geographicalPlanningEngine = {
  GEOGRAPHICAL_PLANNING_STATUS,
  assessGeographicalPlanningInput,
  prepareGeographicalPlan,
};

export default geographicalPlanningEngine;
