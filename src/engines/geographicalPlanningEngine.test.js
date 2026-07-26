import {
  GEOGRAPHICAL_PLANNING_STATUS,
  assessGeographicalPlanningInput,
  prepareGeographicalPlan,
} from './geographicalPlanningEngine';
import {
  ROUTE_EVIDENCE_CLASS,
  ROUTE_TRAVEL_MODE,
} from '../routing/routeEvidenceBoundary';
import {
  createEndPoint,
  createHardAnchor,
  createPlaceRef,
  createStartPoint,
} from '../models/geographicalPlan';
import {
  PLACE_SELECTION_MODE,
  createPlaceSelection,
  createPlanningInputDraft,
  finalizePlanningInput,
  setStartSelection,
  upsertHardAnchor,
} from '../utils/planningInputWorkflow';

const place = (id, lat, lng) =>
  createPlaceRef({
    id,
    name: id,
    coordinates: { lat, lng },
    source: 'test_fixture',
  });

const euston = place('Euston', 51.5282, -0.1337);
const theatrePlace = place('Theatre place', 51.511, -0.127);
const hotelPlace = place('Hotel place', 51.503, -0.09);
const start = createStartPoint({
  place: euston,
  departureTimeMinutes: 17 * 60,
});
const theatre = createHardAnchor({
  id: 'theatre',
  title: 'Theatre',
  place: theatrePlace,
  startTimeMinutes: 18 * 60 + 30,
  durationMinutes: 150,
  arrivalBufferMinutes: 15,
});
const end = createEndPoint({
  place: hotelPlace,
  arrivalDeadlineMinutes: 22 * 60 + 30,
});
const planningInput = { start, anchors: [theatre], end };
const context = {
  date: '2026-08-04',
  timezone: 'Europe/London',
  travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
};

const evidenceFor = (request, durationMinutes) => ({
  requestId: request.id,
  evidenceClass: ROUTE_EVIDENCE_CLASS.PROVIDER_ROUTE,
  travelMode: request.travelMode,
  durationMinutes,
  distanceMeters: 3000,
  evidenceSource: 'route_provider_fixture',
  observedAt: '2026-08-04T15:00:00Z',
});

test('prepares a feasible plan from Packet 149 input and complete route evidence', async () => {
  const result = await prepareGeographicalPlan({
    planningInput,
    context,
    resolveRouteEvidence: ({ requests }) =>
      requests.map(request =>
        evidenceFor(request, request.id === 'start->theatre' ? 45 : 20),
      ),
  });

  expect(result.status).toBe(GEOGRAPHICAL_PLANNING_STATUS.READY);
  expect(result.canContinue).toBe(true);
  expect(result.fixedConstraintsPreserved).toBe(true);
  expect(result.summary).toEqual({
    anchorCount: 1,
    routeLegCount: 2,
    evidencedLegCount: 2,
    constrainedWindowCount: 2,
  });
  expect(result.plan.anchors[0]).toEqual(theatre);
  expect(result.plan.anchors[0]).not.toBe(theatre);
  expect(result.plan.windows[0]).toMatchObject({
    directTravelMinutes: 45,
    availableFlexibleMinutes: 30,
    status: 'feasible',
  });
});

test('accepts the exact finalized Packet 149 workflow output', async () => {
  let draft = createPlanningInputDraft({ departureTimeMinutes: 17 * 60 });
  draft = setStartSelection(
    draft,
    createPlaceSelection({
      mode: PLACE_SELECTION_MODE.RESOLVED_PLACE,
      place: euston,
    }),
  );
  draft = upsertHardAnchor(draft, theatre);
  const finalized = finalizePlanningInput(draft);

  expect(finalized.ok).toBe(true);
  const result = await prepareGeographicalPlan({
    planningInput: finalized.value,
    context,
    resolveRouteEvidence: ({ requests }) => [
      evidenceFor(requests[0], 30),
    ],
  });

  expect(result.status).toBe(GEOGRAPHICAL_PLANNING_STATUS.READY);
  expect(result.plan.start.place).toEqual(euston);
  expect(result.plan.anchors[0]).toEqual(theatre);
});

test('reports the exact shortfall without moving an infeasible hard anchor', async () => {
  const result = await prepareGeographicalPlan({
    planningInput,
    context,
    resolveRouteEvidence: ({ requests }) =>
      requests.map(request => evidenceFor(request, 100)),
  });

  expect(result.status).toBe(GEOGRAPHICAL_PLANNING_STATUS.INFEASIBLE);
  expect(result.canContinue).toBe(false);
  expect(result.plan.anchors[0].startTimeMinutes).toBe(1110);
  expect(result.plan.problems).toContainEqual({
    code: 'insufficient_travel_time',
    windowId: 'start->theatre',
    fromPointId: 'start',
    toPointId: 'theatre',
    shortfallMinutes: 25,
  });
});

test('partial route evidence produces evidence_required, never guessed readiness', async () => {
  const result = await prepareGeographicalPlan({
    planningInput,
    context,
    resolveRouteEvidence: ({ requests }) => [evidenceFor(requests[0], 40)],
  });

  expect(result.status).toBe(
    GEOGRAPHICAL_PLANNING_STATUS.EVIDENCE_REQUIRED,
  );
  expect(result.canContinue).toBe(false);
  expect(result.summary.evidencedLegCount).toBe(1);
  expect(result.plan.windows[1].status).toBe('indeterminate');
});

test('an evidenced destination without a deadline remains directional', async () => {
  const directionalInput = {
    start,
    anchors: [],
    end: createEndPoint({ place: hotelPlace }),
  };
  const result = await prepareGeographicalPlan({
    planningInput: directionalInput,
    context,
    resolveRouteEvidence: ({ requests }) => [
      evidenceFor(requests[0], 35),
    ],
  });

  expect(result.status).toBe(GEOGRAPHICAL_PLANNING_STATUS.DIRECTIONAL);
  expect(result.canContinue).toBe(true);
  expect(result.plan.windows[0]).toMatchObject({
    arrivalTargetMinutes: null,
    availableFlexibleMinutes: null,
    directTravelMinutes: 35,
  });
});

test('a start without anchors or destination needs no provider call', async () => {
  const resolveRouteEvidence = jest.fn();
  const result = await prepareGeographicalPlan({
    planningInput: { start, anchors: [], end: null },
    context,
    resolveRouteEvidence,
  });

  expect(result.status).toBe(
    GEOGRAPHICAL_PLANNING_STATUS.NO_ROUTE_REQUIRED,
  );
  expect(result.canContinue).toBe(true);
  expect(result.summary.routeLegCount).toBe(0);
  expect(resolveRouteEvidence).not.toHaveBeenCalled();
});

test('assessment ignores mismatched injected evidence', () => {
  const result = assessGeographicalPlanningInput({
    planningInput: { start, anchors: [theatre], end: null },
    routeEvidence: {
      status: 'complete',
      evidence: [
        {
          requestId: 'wrong->leg',
          routeLeg: {
            id: 'wrong->leg',
            fromPointId: 'wrong',
            toPointId: 'leg',
            mode: 'transit',
            durationMinutes: 1,
            distanceMeters: 1,
            evidenceSource: 'bad_fixture',
            observedAt: '2026-08-04T15:00:00Z',
          },
        },
      ],
      problems: [],
    },
  });

  expect(result.status).toBe(
    GEOGRAPHICAL_PLANNING_STATUS.EVIDENCE_REQUIRED,
  );
  expect(result.plan.windows[0].routeLeg).toBeNull();
});

test('assessment cannot bypass the boundary with approximate evidence', () => {
  const result = assessGeographicalPlanningInput({
    planningInput: { start, anchors: [theatre], end: null },
    routeEvidence: {
      status: 'complete',
      evidence: [
        {
          requestId: 'start->theatre',
          evidenceClass: ROUTE_EVIDENCE_CLASS.APPROXIMATE,
          routeLeg: {
            id: 'start->theatre',
            fromPointId: 'start',
            toPointId: 'theatre',
            mode: 'transit',
            durationMinutes: 1,
            distanceMeters: 1,
            evidenceSource: 'current_transport_heuristic',
            observedAt: '2026-08-04T15:00:00Z',
          },
        },
      ],
      problems: [],
    },
  });

  expect(result.status).toBe(
    GEOGRAPHICAL_PLANNING_STATUS.EVIDENCE_REQUIRED,
  );
  expect(result.plan.windows[0].routeLeg).toBeNull();
});
