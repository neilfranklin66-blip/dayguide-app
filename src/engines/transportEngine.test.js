import {
  TRANSPORT_ESTIMATE_STATUS,
  estimateTransportMinutes,
  getTransportPlanningEstimate,
  selectTransportOptions,
} from './transportEngine';
import { WALKING_PACE } from '../utils/travelPreferences';

const transportOptions = [
  { mode: 'walk' },
  { mode: 'taxi' },
  { mode: 'tube' },
  { mode: 'bus' },
];

test('leaves mode choice with the user for short distances', () => {
  expect(selectTransportOptions(transportOptions, 0.4)).toEqual(
    transportOptions,
  );
});

test('removes only walks over the preferred maximum', () => {
  expect(selectTransportOptions(transportOptions, 4)).toEqual([
    { mode: 'taxi' },
    { mode: 'tube' },
    { mode: 'bus' },
  ]);
});

test('uses user pace and maximum rather than a city distance rule', () => {
  expect(
    selectTransportOptions(transportOptions, 4, {
      walkingPace: WALKING_PACE.BRISK,
      maximumWalkingMinutes: 45,
    }),
  ).toEqual(transportOptions);
});

test('estimateTransportMinutes grows with distance for estimated modes', () => {
  ['walk', 'tube', 'bus'].forEach(mode => {
    const short = estimateTransportMinutes(mode, 0.5);
    const long = estimateTransportMinutes(mode, 5);
    expect(short).toBeLessThan(long);
  });
});

test('estimateTransportMinutes uses typical walking pace by default', () => {
  expect(estimateTransportMinutes('walk', 2)).toBe(25);
});

test('adds fixed overhead only to rough public-transport planning estimates', () => {
  expect(estimateTransportMinutes('bus', 3)).toBe(19);
  expect(estimateTransportMinutes('tube', 3)).toBe(14);
});

test('rounds to whole minutes and clamps to at least 1', () => {
  expect(Number.isInteger(estimateTransportMinutes('walk', 1.234))).toBe(
    true,
  );
  expect(estimateTransportMinutes('walk', 0)).toBe(1);
  expect(estimateTransportMinutes('walk', 0.01)).toBe(1);
});

test('clamps very long estimated trips to 120 minutes', () => {
  expect(estimateTransportMinutes('walk', 500)).toBe(120);
});

test('falls back for missing or invalid distance', () => {
  expect(estimateTransportMinutes('walk', undefined, 15)).toBe(15);
  expect(estimateTransportMinutes('walk', null, 15)).toBe(15);
  expect(estimateTransportMinutes('walk', NaN, 15)).toBe(15);
  expect(estimateTransportMinutes('walk', -1, 15)).toBe(15);
  expect(estimateTransportMinutes('walk', '2', 15)).toBe(15);
  expect(estimateTransportMinutes('walk', undefined)).toBeNull();
});

test('falls back for unknown modes', () => {
  expect(estimateTransportMinutes('hovercraft', 2, 9)).toBe(9);
});

test('taxi requires a live traffic check instead of a fixed city speed', () => {
  expect(
    getTransportPlanningEstimate({ mode: 'taxi', distanceKm: 3 }),
  ).toEqual({
    minutes: null,
    status: TRANSPORT_ESTIMATE_STATUS.LIVE_CHECK_REQUIRED,
    liveCheckRecommended: true,
  });
});

test('uses live provider evidence when supplied but still recommends checking', () => {
  expect(
    getTransportPlanningEstimate({
      mode: 'taxi',
      distanceKm: 3,
      providerDurationMinutes: 24,
    }),
  ).toEqual({
    minutes: 24,
    status: TRANSPORT_ESTIMATE_STATUS.PROVIDER_ESTIMATE,
    liveCheckRecommended: true,
  });
});

test('walking estimates respond to the user-selected pace', () => {
  const relaxed = estimateTransportMinutes('walk', 2, null, {
    walkingPace: WALKING_PACE.RELAXED,
    maximumWalkingMinutes: 45,
  });
  const brisk = estimateTransportMinutes('walk', 2, null, {
    walkingPace: WALKING_PACE.BRISK,
    maximumWalkingMinutes: 45,
  });

  expect(relaxed).toBe(30);
  expect(brisk).toBe(21);
});
