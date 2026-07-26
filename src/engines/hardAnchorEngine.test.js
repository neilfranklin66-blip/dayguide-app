import {
  createEndPoint,
  createFlexibleStop,
  createHardAnchor,
  createPlaceRef,
  createStartPoint,
} from '../models/geographicalPlan';
import {
  assessFlexibleStopFit,
  buildHardAnchorPlan,
} from './hardAnchorEngine';

const place = (id, lat, lng) =>
  createPlaceRef({
    id,
    name: id,
    coordinates: { lat, lng },
    source: 'test_fixture',
    timezone: 'Europe/London',
  });

const euston = place('Euston', 51.5282, -0.1337);
const lunchPlace = place('Lunch', 51.515, -0.12);
const theatrePlace = place('Theatre', 51.511, -0.127);
const southwarkHotel = place('Southwark Hotel', 51.503, -0.09);

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

const hotel = createEndPoint({
  place: southwarkHotel,
  arrivalDeadlineMinutes: 22 * 60 + 30,
});

const travelByWindow = {
  'start->lunch': 30,
  'lunch->theatre': 20,
  'theatre->end': 25,
};

const travelResolver = ({ from, to }) =>
  travelByWindow[`${from.id}->${to.id}`] ?? null;

test('buildHardAnchorPlan creates deterministic feasible windows around hard anchors', () => {
  const result = buildHardAnchorPlan({
    start,
    anchors: [lunch, theatre],
    end: hotel,
    getTravelMinutes: travelResolver,
  });

  expect(result.status).toBe('feasible');
  expect(result.problems).toEqual([]);
  expect(result.windows).toEqual([
    expect.objectContaining({
      id: 'start->lunch',
      opensAtMinutes: 540,
      arrivalTargetMinutes: 710,
      spanMinutes: 170,
      directTravelMinutes: 30,
      availableFlexibleMinutes: 140,
      status: 'feasible',
    }),
    expect.objectContaining({
      id: 'lunch->theatre',
      opensAtMinutes: 780,
      arrivalTargetMinutes: 1095,
      spanMinutes: 315,
      directTravelMinutes: 20,
      availableFlexibleMinutes: 295,
      status: 'feasible',
    }),
    expect.objectContaining({
      id: 'theatre->end',
      opensAtMinutes: 1260,
      arrivalTargetMinutes: 1350,
      spanMinutes: 90,
      directTravelMinutes: 25,
      availableFlexibleMinutes: 65,
      status: 'feasible',
    }),
  ]);
});

test('the engine sorts anchors by fixed time without mutating the input array', () => {
  const anchors = [theatre, lunch];
  const originalOrder = anchors.map(anchor => anchor.id);

  const result = buildHardAnchorPlan({
    start,
    anchors,
    getTravelMinutes: travelResolver,
  });

  expect(anchors.map(anchor => anchor.id)).toEqual(originalOrder);
  expect(result.anchors.map(anchor => anchor.id)).toEqual(['lunch', 'theatre']);
});

test('the engine preserves hard-anchor place, time, duration, buffer, and lock', () => {
  const result = buildHardAnchorPlan({
    start,
    anchors: [theatre],
    getTravelMinutes: () => 30,
  });

  expect(result.anchors[0]).toEqual(theatre);
  expect(result.anchors[0]).not.toBe(theatre);
  expect(result.anchors[0].place).not.toBe(theatre.place);
  expect(result.anchors[0].plannerLocked).toBe(true);
  expect(result.anchors[0].startTimeMinutes).toBe(1110);
});

test('insufficient travel time makes a plan infeasible without moving the anchor', () => {
  const lateStart = createStartPoint({
    place: euston,
    departureTimeMinutes: 17 * 60 + 50,
  });

  const result = buildHardAnchorPlan({
    start: lateStart,
    anchors: [theatre],
    getTravelMinutes: () => 40,
  });

  expect(result.status).toBe('infeasible');
  expect(result.anchors[0].startTimeMinutes).toBe(1110);
  expect(result.windows[0]).toMatchObject({
    status: 'infeasible',
    availableFlexibleMinutes: -15,
  });
  expect(result.problems).toEqual([
    {
      code: 'insufficient_travel_time',
      windowId: 'start->theatre',
      fromPointId: 'start',
      toPointId: 'theatre',
      shortfallMinutes: 15,
    },
  ]);
});

test('overlapping anchors are reported as infeasible through their connecting window', () => {
  const first = createHardAnchor({
    id: 'first',
    title: 'First commitment',
    place: lunchPlace,
    startTimeMinutes: 12 * 60,
    durationMinutes: 120,
    arrivalBufferMinutes: 0,
  });
  const second = createHardAnchor({
    id: 'second',
    title: 'Second commitment',
    place: theatrePlace,
    startTimeMinutes: 13 * 60 + 30,
    durationMinutes: 60,
    arrivalBufferMinutes: 10,
  });

  const result = buildHardAnchorPlan({
    start,
    anchors: [first, second],
    getTravelMinutes: ({ from, to }) =>
      from.id === 'first' && to.id === 'second' ? 20 : 10,
  });

  expect(result.status).toBe('infeasible');
  expect(result.problems).toContainEqual({
    code: 'insufficient_travel_time',
    windowId: 'first->second',
    fromPointId: 'first',
    toPointId: 'second',
    shortfallMinutes: 60,
  });
});

test('missing travel evidence makes the plan indeterminate, never guessed feasible', () => {
  const result = buildHardAnchorPlan({
    start,
    anchors: [theatre],
    getTravelMinutes: () => null,
  });

  expect(result.status).toBe('indeterminate');
  expect(result.windows[0]).toMatchObject({
    status: 'indeterminate',
    routeLeg: null,
    directTravelMinutes: null,
    availableFlexibleMinutes: null,
  });
  expect(result.problems[0].code).toBe('travel_time_unavailable');
});

test('the engine rejects a hand-built anchor that is not planner locked', () => {
  expect(() =>
    buildHardAnchorPlan({
      start,
      anchors: [{ ...theatre, plannerLocked: false }],
      getTravelMinutes: () => 20,
    }),
  ).toThrow('invalid hard-anchor constraints');
});

test('the engine rejects duplicate planning point identifiers', () => {
  const duplicateEnd = createEndPoint({
    id: 'theatre',
    place: southwarkHotel,
    arrivalDeadlineMinutes: 22 * 60,
  });

  expect(() =>
    buildHardAnchorPlan({
      start,
      anchors: [theatre],
      end: duplicateEnd,
      getTravelMinutes: () => 20,
    }),
  ).toThrow('planning point ids must be unique');
});

test('structured travel evidence is retained as a provider-independent route leg', () => {
  const result = buildHardAnchorPlan({
    start,
    anchors: [theatre],
    getTravelMinutes: () => ({
      durationMinutes: 35,
      distanceMeters: 5100,
      mode: 'transit',
      evidenceSource: 'fixture_matrix',
      observedAt: '2026-07-26T12:00:00Z',
    }),
  });

  expect(result.windows[0].routeLeg).toEqual({
    id: 'start->theatre',
    fromPointId: 'start',
    toPointId: 'theatre',
    mode: 'transit',
    durationMinutes: 35,
    distanceMeters: 5100,
    evidenceSource: 'fixture_matrix',
    observedAt: '2026-07-26T12:00:00Z',
  });
});

test('an end point without a deadline stays directional rather than fabricating slack', () => {
  const directionalEnd = createEndPoint({ place: southwarkHotel });

  const result = buildHardAnchorPlan({
    start,
    anchors: [],
    end: directionalEnd,
    getTravelMinutes: () => 25,
  });

  expect(result.status).toBe('feasible');
  expect(result.windows[0]).toMatchObject({
    status: 'unconstrained',
    arrivalTargetMinutes: null,
    spanMinutes: null,
    directTravelMinutes: 25,
    availableFlexibleMinutes: null,
  });
});

test('assessFlexibleStopFit accounts for both travel legs and the full visit', () => {
  const plan = buildHardAnchorPlan({
    start,
    anchors: [lunch],
    getTravelMinutes: () => 30,
  });
  const coffee = createFlexibleStop({
    id: 'coffee',
    title: 'Coffee',
    place: lunchPlace,
    durationMinutes: 45,
    minimumDurationMinutes: 30,
  });

  expect(assessFlexibleStopFit({
    window: plan.windows[0],
    stop: coffee,
    travelToStopMinutes: 20,
    travelFromStopMinutes: 15,
  })).toEqual({
    fits: true,
    reason: 'fits',
    requiredMinutes: 80,
    remainingMinutes: 90,
  });
});

test('assessFlexibleStopFit rejects a suggestion that would risk the next anchor', () => {
  const plan = buildHardAnchorPlan({
    start,
    anchors: [lunch],
    getTravelMinutes: () => 30,
  });
  const longStop = createFlexibleStop({
    id: 'museum',
    title: 'Museum',
    place: theatrePlace,
    durationMinutes: 150,
    minimumDurationMinutes: 90,
  });

  expect(assessFlexibleStopFit({
    window: plan.windows[0],
    stop: longStop,
    travelToStopMinutes: 30,
    travelFromStopMinutes: 20,
  })).toEqual({
    fits: false,
    reason: 'insufficient_time',
    requiredMinutes: 200,
    remainingMinutes: -30,
  });
});

test('assessFlexibleStopFit can use an explicitly allowed minimum duration', () => {
  const plan = buildHardAnchorPlan({
    start,
    anchors: [lunch],
    getTravelMinutes: () => 30,
  });
  const adjustableStop = createFlexibleStop({
    id: 'gallery',
    title: 'Gallery',
    place: theatrePlace,
    durationMinutes: 150,
    minimumDurationMinutes: 90,
  });

  expect(assessFlexibleStopFit({
    window: plan.windows[0],
    stop: adjustableStop,
    travelToStopMinutes: 30,
    travelFromStopMinutes: 20,
    useMinimumDuration: true,
  })).toMatchObject({
    fits: true,
    requiredMinutes: 140,
    remainingMinutes: 30,
  });
});

test('assessFlexibleStopFit refuses to claim a fit without travel evidence', () => {
  const coffee = createFlexibleStop({
    id: 'coffee',
    title: 'Coffee',
    place: lunchPlace,
    durationMinutes: 30,
  });

  expect(assessFlexibleStopFit({
    window: {
      arrivalTargetMinutes: 720,
      spanMinutes: 120,
    },
    stop: coffee,
    travelToStopMinutes: null,
    travelFromStopMinutes: 10,
  })).toEqual({
    fits: null,
    reason: 'travel_time_unavailable',
    requiredMinutes: null,
    remainingMinutes: null,
  });
});

test('assessFlexibleStopFit rejects an already impossible planning window', () => {
  const coffee = createFlexibleStop({
    id: 'coffee',
    title: 'Coffee',
    place: lunchPlace,
    durationMinutes: 30,
  });

  expect(assessFlexibleStopFit({
    window: {
      arrivalTargetMinutes: 700,
      spanMinutes: -10,
    },
    stop: coffee,
    travelToStopMinutes: 5,
    travelFromStopMinutes: 5,
  })).toEqual({
    fits: false,
    reason: 'window_infeasible',
    requiredMinutes: null,
    remainingMinutes: -10,
  });
});

test('assessFlexibleStopFit rejects a hand-built stop marked as planner locked', () => {
  const coffee = createFlexibleStop({
    id: 'coffee',
    title: 'Coffee',
    place: lunchPlace,
    durationMinutes: 30,
  });

  expect(() =>
    assessFlexibleStopFit({
      window: {
        arrivalTargetMinutes: 700,
        spanMinutes: 100,
      },
      stop: { ...coffee, plannerLocked: true },
      travelToStopMinutes: 5,
      travelFromStopMinutes: 5,
    }),
  ).toThrow('valid flexible_stop');
});
