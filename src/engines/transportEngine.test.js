import { selectTransportOptions } from './transportEngine';

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
