import {
  ROUTE_EVIDENCE_CLASS,
  ROUTE_EVIDENCE_PROBLEM,
  ROUTE_EVIDENCE_STATUS,
  ROUTE_TRAVEL_MODE,
  buildRouteEvidenceRequests,
  collectRouteEvidence,
  createRoutePlanningContext,
} from './routeEvidenceBoundary';
import {
  createEndPoint,
  createHardAnchor,
  createPlaceRef,
  createStartPoint,
} from '../models/geographicalPlan';

const place = (id, name, lat, lng) =>
  createPlaceRef({
    id,
    name,
    coordinates: { lat, lng },
    source: 'test_fixture',
  });

const euston = place('euston', 'London Euston', 51.5282, -0.1337);
const lunchPlace = place('lunch-place', 'Lunch', 51.515, -0.12);
const theatrePlace = place('theatre-place', 'Theatre', 51.511, -0.127);
const hotelPlace = place('hotel-place', 'Southwark Hotel', 51.503, -0.09);

const start = createStartPoint({
  place: euston,
  departureTimeMinutes: 9 * 60,
});
const lunch = createHardAnchor({
  id: 'lunch',
  title: 'Booked lunch',
  place: lunchPlace,
  startTimeMinutes: 12 * 60,
  durationMinutes: 60,
  arrivalBufferMinutes: 10,
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

const planningInput = {
  start,
  anchors: [theatre, lunch],
  end,
};
const context = {
  date: '2026-08-04',
  timezone: 'Europe/London',
  travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
};

const evidenceFor = (request, durationMinutes = 20, overrides = {}) => ({
  requestId: request.id,
  evidenceClass: ROUTE_EVIDENCE_CLASS.PROVIDER_ROUTE,
  travelMode: request.travelMode,
  durationMinutes,
  distanceMeters: 2500,
  evidenceSource: 'provider_fixture',
  observedAt: '2026-08-04T08:55:00Z',
  ...overrides,
});

test('route context requires a real date, timezone and supported travel mode', () => {
  expect(createRoutePlanningContext(context)).toEqual(context);
  expect(() =>
    createRoutePlanningContext({ ...context, date: '2026-02-30' }),
  ).toThrow('real calendar date');
  expect(() =>
    createRoutePlanningContext({ ...context, timezone: '' }),
  ).toThrow('timezone');
  expect(() =>
    createRoutePlanningContext({ ...context, timezone: 'Mars/Olympus' }),
  ).toThrow('IANA timezone');
  expect(() =>
    createRoutePlanningContext({ ...context, travelMode: 'teleport' }),
  ).toThrow('travelMode');
});

test('builds dated adjacent-leg requests in fixed-anchor order', () => {
  const requests = buildRouteEvidenceRequests({ planningInput, context });

  expect(requests.map(request => request.id)).toEqual([
    'start->lunch',
    'lunch->theatre',
    'theatre->end',
  ]);
  expect(requests[0]).toMatchObject({
    fromPointId: 'start',
    toPointId: 'lunch',
    departureMinuteOfDay: 540,
    departureLocalDateTime: '2026-08-04T09:00',
    arrivalTargetMinuteOfDay: 710,
    arrivalTargetLocalDateTime: '2026-08-04T11:50',
    timezone: 'Europe/London',
    travelMode: 'transit',
  });
  expect(requests[1]).toMatchObject({
    departureMinuteOfDay: 780,
    departureLocalDateTime: '2026-08-04T13:00',
    arrivalTargetLocalDateTime: '2026-08-04T18:15',
  });
  expect(requests[0].fromPlace).toEqual(euston);
  expect(requests[0].fromPlace).not.toBe(euston);
  expect(requests[0].fromPlace.coordinates).not.toBe(euston.coordinates);
});

test('collects a complete batch of trustworthy provider route evidence', async () => {
  const resolveRouteEvidence = jest.fn(({ requests }) =>
    requests.map((request, index) => evidenceFor(request, 20 + index * 5)),
  );

  const result = await collectRouteEvidence({
    planningInput,
    context,
    resolveRouteEvidence,
  });

  expect(resolveRouteEvidence).toHaveBeenCalledTimes(1);
  expect(result.status).toBe(ROUTE_EVIDENCE_STATUS.COMPLETE);
  expect(result.problems).toEqual([]);
  expect(result.evidence).toHaveLength(3);
  expect(result.evidence[0]).toEqual({
    requestId: 'start->lunch',
    evidenceClass: ROUTE_EVIDENCE_CLASS.PROVIDER_ROUTE,
    routeLeg: {
      id: 'start->lunch',
      fromPointId: 'start',
      toPointId: 'lunch',
      mode: 'transit',
      durationMinutes: 20,
      distanceMeters: 2500,
      evidenceSource: 'provider_fixture',
      observedAt: '2026-08-04T08:55:00Z',
    },
  });
});

test('returns partial evidence when one requested leg is absent', async () => {
  const result = await collectRouteEvidence({
    planningInput,
    context,
    resolveRouteEvidence: ({ requests }) => [
      evidenceFor(requests[0]),
      evidenceFor(requests[2]),
    ],
  });

  expect(result.status).toBe(ROUTE_EVIDENCE_STATUS.PARTIAL);
  expect(result.evidence).toHaveLength(2);
  expect(result.problems).toContainEqual({
    code: ROUTE_EVIDENCE_PROBLEM.ROUTE_EVIDENCE_UNAVAILABLE,
    requestId: 'lunch->theatre',
    fromPointId: 'lunch',
    toPointId: 'theatre',
  });
});

test('refuses to use an approximate estimate as feasibility evidence', async () => {
  const result = await collectRouteEvidence({
    planningInput: { start, anchors: [lunch], end: null },
    context,
    resolveRouteEvidence: ({ requests }) => [
      evidenceFor(requests[0], 12, {
        evidenceClass: ROUTE_EVIDENCE_CLASS.APPROXIMATE,
        evidenceSource: 'current_transport_heuristic',
      }),
    ],
  });

  expect(result.status).toBe(ROUTE_EVIDENCE_STATUS.UNAVAILABLE);
  expect(result.evidence).toEqual([]);
  expect(result.problems[0].code).toBe(
    ROUTE_EVIDENCE_PROBLEM.UNTRUSTED_ROUTE_EVIDENCE,
  );
});

test('rejects wrong modes, stale shapes, duplicate records and unknown request ids', async () => {
  const result = await collectRouteEvidence({
    planningInput: { start, anchors: [lunch, theatre], end: null },
    context,
    resolveRouteEvidence: ({ requests }) => [
      evidenceFor(requests[0], 20, { travelMode: 'driving' }),
      evidenceFor(requests[1]),
      evidenceFor(requests[1]),
      {
        ...evidenceFor(requests[0]),
        requestId: 'unknown->leg',
      },
    ],
  });

  expect(result.status).toBe(ROUTE_EVIDENCE_STATUS.UNAVAILABLE);
  expect(result.problems.map(problem => problem.code)).toEqual(
    expect.arrayContaining([
      ROUTE_EVIDENCE_PROBLEM.INVALID_ROUTE_EVIDENCE,
      ROUTE_EVIDENCE_PROBLEM.DUPLICATE_ROUTE_EVIDENCE,
      ROUTE_EVIDENCE_PROBLEM.UNEXPECTED_ROUTE_EVIDENCE,
    ]),
  );
});

test.each([
  [
    'ROUTE_QUOTA_EXCEEDED',
    ROUTE_EVIDENCE_PROBLEM.ROUTE_QUOTA_EXCEEDED,
  ],
  ['ROUTE_ACCESS_DENIED', ROUTE_EVIDENCE_PROBLEM.ROUTE_ACCESS_DENIED],
  ['NETWORK_ERROR', ROUTE_EVIDENCE_PROBLEM.ROUTE_NETWORK_ERROR],
  ['private provider detail', ROUTE_EVIDENCE_PROBLEM.ROUTE_PROVIDER_UNAVAILABLE],
])('maps provider failure %s to stable problem %s', async (message, code) => {
  const result = await collectRouteEvidence({
    planningInput: { start, anchors: [lunch], end: null },
    context,
    resolveRouteEvidence: jest.fn().mockRejectedValue(new Error(message)),
  });

  expect(result.status).toBe(ROUTE_EVIDENCE_STATUS.UNAVAILABLE);
  expect(result.problems[0].code).toBe(code);
  expect(JSON.stringify(result)).not.toContain('private provider detail');
});

test('does not call a provider when there is no route leg to resolve', async () => {
  const resolveRouteEvidence = jest.fn();

  const result = await collectRouteEvidence({
    planningInput: { start, anchors: [], end: null },
    context,
    resolveRouteEvidence,
  });

  expect(result.status).toBe(ROUTE_EVIDENCE_STATUS.NOT_REQUIRED);
  expect(result.requests).toEqual([]);
  expect(resolveRouteEvidence).not.toHaveBeenCalled();
});
