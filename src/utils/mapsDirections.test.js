import {
  buildGoogleMapsDirectionsUrl,
  routePointLabel,
} from './mapsDirections';

const from = {
  activity: 'British Museum',
  address: 'Great Russell Street, London',
};
const to = {
  activity: 'Royal Opera House',
  address: 'Bow Street, London',
};

test.each([
  ['walk', 'walking'],
  ['taxi', 'driving'],
  ['tube', 'transit'],
  ['bus', 'transit'],
])('builds a key-free live %s directions handoff', (mode, travelmode) => {
  const url = new URL(
    buildGoogleMapsDirectionsUrl({ origin: from, destination: to, mode }),
  );

  expect(url.origin).toBe('https://www.google.com');
  expect(url.pathname).toBe('/maps/dir/');
  expect(url.searchParams.get('api')).toBe('1');
  expect(url.searchParams.get('origin')).toContain('British Museum');
  expect(url.searchParams.get('destination')).toContain(
    'Royal Opera House',
  );
  expect(url.searchParams.get('travelmode')).toBe(travelmode);
  expect(url.search).not.toMatch(/key=/i);
});
test('requires both itinerary points and a supported mode', () => {
  expect(
    buildGoogleMapsDirectionsUrl({
      origin: from,
      destination: null,
      mode: 'walk',
    }),
  ).toBeNull();
  expect(
    buildGoogleMapsDirectionsUrl({
      origin: from,
      destination: to,
      mode: 'hovercraft',
    }),
  ).toBeNull();
});

test('builds a route label from a place name and address', () => {
  expect(routePointLabel(from)).toBe(
    'British Museum, Great Russell Street, London',
  );
});
