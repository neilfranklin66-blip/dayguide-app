import { estimateTransportMinutes, selectTransportOptions } from './transportEngine';

const transportOptions = [
  { mode: 'walk' },
  { mode: 'taxi' },
  { mode: 'tube' },
  { mode: 'bus' },
];

test('selectTransportOptions returns walk and taxi for short distances', () => {
  expect(selectTransportOptions(transportOptions, 0.4)).toEqual([
    { mode: 'walk' },
    { mode: 'taxi' },
  ]);
});

test('selectTransportOptions removes walk for long distances', () => {
  expect(selectTransportOptions(transportOptions, 2)).toEqual([
    { mode: 'taxi' },
    { mode: 'tube' },
    { mode: 'bus' },
  ]);
});

test('selectTransportOptions returns all options for medium distances', () => {
  expect(selectTransportOptions(transportOptions, 1)).toEqual(transportOptions);
});

test('estimateTransportMinutes grows with distance for each mode', () => {
  ['walk', 'taxi', 'tube', 'bus'].forEach(mode => {
    const short = estimateTransportMinutes(mode, 0.5);
    const long = estimateTransportMinutes(mode, 5);
    expect(short).toBeLessThan(long);
  });
});

test('estimateTransportMinutes uses walking speed for walk mode', () => {
  // 2 km at ~4.8 km/h => 25 minutes, no overhead
  expect(estimateTransportMinutes('walk', 2)).toBe(25);
});

test('estimateTransportMinutes adds fixed overhead for motorised modes', () => {
  // taxi: 3 km at 18 km/h = 10 min + 3 min overhead
  expect(estimateTransportMinutes('taxi', 3)).toBe(13);
  // bus: 3 km at 14 km/h ≈ 12.86 min + 6 min overhead => 19
  expect(estimateTransportMinutes('bus', 3)).toBe(19);
  // tube: 3 km at 30 km/h = 6 min + 8 min overhead
  expect(estimateTransportMinutes('tube', 3)).toBe(14);
});

test('estimateTransportMinutes rounds to whole minutes and clamps to at least 1', () => {
  expect(Number.isInteger(estimateTransportMinutes('walk', 1.234))).toBe(true);
  expect(estimateTransportMinutes('walk', 0)).toBe(1);
  expect(estimateTransportMinutes('walk', 0.01)).toBe(1);
});

test('estimateTransportMinutes clamps very long trips to 120 minutes', () => {
  expect(estimateTransportMinutes('walk', 500)).toBe(120);
});

test('estimateTransportMinutes falls back for missing or invalid distance', () => {
  expect(estimateTransportMinutes('walk', undefined, 15)).toBe(15);
  expect(estimateTransportMinutes('walk', null, 15)).toBe(15);
  expect(estimateTransportMinutes('walk', NaN, 15)).toBe(15);
  expect(estimateTransportMinutes('walk', -1, 15)).toBe(15);
  expect(estimateTransportMinutes('walk', '2', 15)).toBe(15);
  expect(estimateTransportMinutes('walk', undefined)).toBeNull();
});

test('estimateTransportMinutes falls back for unknown modes', () => {
  expect(estimateTransportMinutes('hovercraft', 2, 9)).toBe(9);
});
