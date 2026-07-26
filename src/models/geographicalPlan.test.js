import {
  GEOGRAPHICAL_PLAN_SCHEMA_VERSION,
  PLANNING_POINT_KIND,
  createEndPoint,
  createFlexibleStop,
  createHardAnchor,
  createPlaceRef,
  createRouteLeg,
  createStartPoint,
  isPlaceRef,
  isValidCoordinates,
} from './geographicalPlan';

const euston = createPlaceRef({
  id: 'euston',
  name: 'London Euston',
  address: 'Euston Road, London',
  coordinates: { lat: 51.5282, lng: -0.1337 },
  source: 'searched_place',
  locality: 'London',
  countryCode: 'gb',
  timezone: 'Europe/London',
});

test('geographical plan schema starts at version 2 without changing saved plan v1', () => {
  expect(GEOGRAPHICAL_PLAN_SCHEMA_VERSION).toBe(2);
});

test('createPlaceRef normalizes identity and international locality fields', () => {
  expect(euston).toEqual({
    id: 'euston',
    name: 'London Euston',
    address: 'Euston Road, London',
    coordinates: { lat: 51.5282, lng: -0.1337 },
    source: 'searched_place',
    accuracyMeters: null,
    locality: 'London',
    countryCode: 'GB',
    timezone: 'Europe/London',
  });
  expect(isPlaceRef(euston)).toBe(true);
});

test('coordinate validation accepts the equator and Greenwich meridian', () => {
  expect(isValidCoordinates({ lat: 0, lng: 0 })).toBe(true);
});

test('a route-capable place reference requires named location provenance', () => {
  expect(isPlaceRef({
    name: 'Unknown source',
    coordinates: { lat: 51.5, lng: -0.1 },
  })).toBe(false);
  expect(isPlaceRef({
    name: '   ',
    source: 'test',
    coordinates: { lat: 51.5, lng: -0.1 },
  })).toBe(false);
});

test('createPlaceRef rejects missing, non-finite, and out-of-range coordinates', () => {
  expect(() => createPlaceRef({ name: 'Missing' })).toThrow(RangeError);
  expect(() =>
    createPlaceRef({
      name: 'Infinite',
      coordinates: { lat: Infinity, lng: 0 },
    }),
  ).toThrow(RangeError);
  expect(() =>
    createPlaceRef({
      name: 'Outside',
      coordinates: { lat: 91, lng: -181 },
    }),
  ).toThrow(RangeError);
});

test('createStartPoint requires a valid minute within the selected day', () => {
  expect(createStartPoint({
    place: euston,
    departureTimeMinutes: 9 * 60,
  })).toEqual({
    kind: PLANNING_POINT_KIND.START,
    id: 'start',
    place: euston,
    departureTimeMinutes: 540,
  });

  expect(() =>
    createStartPoint({ place: euston, departureTimeMinutes: 1440 }),
  ).toThrow(RangeError);
});

test('createHardAnchor is planner-locked and preserves its fixed place and time', () => {
  const anchor = createHardAnchor({
    id: 'theatre',
    title: 'Theatre',
    place: euston,
    startTimeMinutes: 18 * 60 + 30,
    durationMinutes: 150,
    arrivalBufferMinutes: 15,
  });

  expect(anchor).toMatchObject({
    kind: PLANNING_POINT_KIND.HARD_ANCHOR,
    id: 'theatre',
    startTimeMinutes: 1110,
    durationMinutes: 150,
    arrivalBufferMinutes: 15,
    plannerLocked: true,
    place: euston,
  });
});

test('createHardAnchor rejects an anchor that finishes outside the selected day', () => {
  expect(() =>
    createHardAnchor({
      id: 'late',
      title: 'Late event',
      place: euston,
      startTimeMinutes: 23 * 60,
      durationMinutes: 90,
    }),
  ).toThrow(RangeError);
});

test('createHardAnchor rejects an arrival buffer that begins before the day', () => {
  expect(() =>
    createHardAnchor({
      id: 'early',
      title: 'Early event',
      place: euston,
      startTimeMinutes: 10,
      arrivalBufferMinutes: 15,
    }),
  ).toThrow(RangeError);
});

test('createEndPoint supports a directional destination without a hard deadline', () => {
  expect(createEndPoint({ place: euston })).toEqual({
    kind: PLANNING_POINT_KIND.END,
    id: 'end',
    place: euston,
    arrivalDeadlineMinutes: null,
    arrivalBufferMinutes: 0,
  });
});

test('createEndPoint rejects a deadline buffer that begins before the day', () => {
  expect(() =>
    createEndPoint({
      place: euston,
      arrivalDeadlineMinutes: 5,
      arrivalBufferMinutes: 10,
    }),
  ).toThrow(RangeError);
});

test('createEndPoint rejects a buffer on a destination without a deadline', () => {
  expect(() =>
    createEndPoint({
      place: euston,
      arrivalBufferMinutes: 10,
    }),
  ).toThrow(RangeError);
});

test('createFlexibleStop is explicitly movable by the planner', () => {
  expect(createFlexibleStop({
    id: 'coffee',
    title: 'Coffee',
    place: euston,
    durationMinutes: 30,
    minimumDurationMinutes: 20,
  })).toMatchObject({
    kind: PLANNING_POINT_KIND.FLEXIBLE_STOP,
    durationMinutes: 30,
    minimumDurationMinutes: 20,
    plannerLocked: false,
  });
});

test('createFlexibleStop rejects an impossible minimum duration', () => {
  expect(() =>
    createFlexibleStop({
      id: 'coffee',
      title: 'Coffee',
      place: euston,
      durationMinutes: 30,
      minimumDurationMinutes: 45,
    }),
  ).toThrow(RangeError);
});

test('createRouteLeg records injected travel evidence without provider coupling', () => {
  expect(createRouteLeg({
    id: 'start-to-theatre',
    fromPointId: 'start',
    toPointId: 'theatre',
    mode: 'transit',
    durationMinutes: 25,
    distanceMeters: 4500,
    evidenceSource: 'test_matrix',
  })).toEqual({
    id: 'start-to-theatre',
    fromPointId: 'start',
    toPointId: 'theatre',
    mode: 'transit',
    durationMinutes: 25,
    distanceMeters: 4500,
    evidenceSource: 'test_matrix',
    observedAt: null,
  });
});
