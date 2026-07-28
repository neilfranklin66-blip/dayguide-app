import {
  createEndPoint,
  createHardAnchor,
  createPlaceRef,
  createStartPoint,
} from '../models/geographicalPlan';
import {
  restoreGeographicalPlanning,
  serializeGeographicalPlanning,
} from './geographicalPlanPersistence';

const place = (id, name, coordinates) =>
  createPlaceRef({
    id,
    name,
    address: `${name} address`,
    coordinates,
    source: 'google_places',
    accuracyMeters: 12,
    locality: 'London',
    countryCode: 'GB',
    timezone: 'Europe/London',
  });

const euston = place('euston', 'London Euston', {
  lat: 51.5282,
  lng: -0.1337,
});
const theatre = place('theatre', 'Theatre', {
  lat: 51.511,
  lng: -0.127,
});
const hotel = place('hotel', 'Southwark Hotel', {
  lat: 51.503,
  lng: -0.09,
});

const planningInput = {
  schemaVersion: 2,
  start: createStartPoint({
    place: euston,
    departureTimeMinutes: 9 * 60,
  }),
  anchors: [
    createHardAnchor({
      id: 'anchor-1',
      title: 'Evening theatre',
      place: theatre,
      startTimeMinutes: 18 * 60 + 30,
      durationMinutes: 120,
      arrivalBufferMinutes: 15,
    }),
  ],
  end: createEndPoint({
    place: hotel,
    arrivalDeadlineMinutes: 22 * 60,
    arrivalBufferMinutes: 10,
  }),
  locationProvenance: {
    start: 'resolved_place',
    end: 'resolved_place',
  },
};

test('saved-plan v2 geographical data round-trips as valid planning input', () => {
  const restored = restoreGeographicalPlanning(
    serializeGeographicalPlanning(planningInput),
  );

  expect(restored.start.place).toEqual(
    expect.objectContaining({
      id: 'euston',
      name: 'London Euston',
      coordinates: euston.coordinates,
    }),
  );
  expect(restored.anchors[0]).toEqual(
    expect.objectContaining({
      id: 'anchor-1',
      title: 'Evening theatre',
      plannerLocked: true,
    }),
  );
  expect(restored.end.place).toEqual(
    expect.objectContaining({
      id: 'hotel',
      coordinates: hotel.coordinates,
    }),
  );
});

test('storage keeps only the minimum selected route-capable place data', () => {
  const stored = serializeGeographicalPlanning(planningInput);
  const places = [
    stored.start.place,
    stored.anchors[0].place,
    stored.end.place,
  ];

  places.forEach(storedPlace => {
    expect(Object.keys(storedPlace).sort()).toEqual(
      ['coordinates', 'id', 'name', 'source'].sort(),
    );
    expect(storedPlace).not.toHaveProperty('address');
    expect(storedPlace).not.toHaveProperty('accuracyMeters');
    expect(storedPlace).not.toHaveProperty('locality');
    expect(storedPlace).not.toHaveProperty('countryCode');
    expect(storedPlace).not.toHaveProperty('timezone');
  });
});

test('malformed or unsupported geographical data is not restored', () => {
  expect(restoreGeographicalPlanning({ version: 99 })).toBeNull();

  const stored = serializeGeographicalPlanning(planningInput);
  stored.start.place.coordinates.lat = 999;
  expect(restoreGeographicalPlanning(stored)).toBeNull();
});

test('null planning input remains null', () => {
  expect(serializeGeographicalPlanning(null)).toBeNull();
  expect(restoreGeographicalPlanning(null)).toBeNull();
});
