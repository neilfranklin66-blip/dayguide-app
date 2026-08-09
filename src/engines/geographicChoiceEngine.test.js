import {
  distanceBetweenKm,
  getGeographicChoiceGuidance,
  getGeographicSearchAreas,
} from './geographicChoiceEngine';

const start = {
  name: 'Place A',
  coordinates: { lat: 52.237, lng: -0.895 },
};
const finish = {
  name: 'Place B',
  coordinates: { lat: 52.4068, lng: -1.5197 },
};

test('creates an optional geographic choice for a later fixed commitment elsewhere', () => {
  const guidance = getGeographicChoiceGuidance({
    planning: {
      start: { place: start, departureTimeMinutes: 10 * 60 },
      anchors: [{ title: 'Concert', place: finish, startTimeMinutes: 18 * 60 }],
      end: null,
    },
    selectedPlace: {
      name: 'Museum',
      coordinates: { lat: 52.25, lng: -0.91 },
      duration: 1.5,
    },
    selectedItems: [{ duration: 1.5 }],
    availableTimeHours: 4,
  });

  expect(guidance.later.name).toBe('Concert');
  expect(guidance.distanceFromStartKm).toBeGreaterThan(0);
  expect(guidance.distanceToLaterKm).toBeGreaterThan(0);
  expect(guidance.remainingMinutes).toBe(150);
  expect(getGeographicSearchAreas(guidance).map(area => area.id)).toEqual([
    'start', 'later', 'between',
  ]);
});

test('does not interrupt a day whose later stop is nearby', () => {
  expect(getGeographicChoiceGuidance({
    planning: {
      start: { place: start, departureTimeMinutes: 10 * 60 },
      anchors: [],
      end: { place: { name: 'Nearby finish', coordinates: { lat: 52.24, lng: -0.9 } } },
    },
    selectedPlace: { name: 'Museum', coordinates: start.coordinates },
    availableTimeHours: 4,
  })).toBeNull();
});

test('distance is directional geography only, not a route duration', () => {
  expect(distanceBetweenKm(start.coordinates, finish.coordinates)).toBeGreaterThan(40);
});
