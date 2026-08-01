import {
  PLACE_SELECTION_MODE,
  PLANNING_INPUT_ERROR,
  JOURNEY_INTENT,
  createCurrentLocationSelection,
  createPlaceSelection,
  createPlanningInputDraft,
  createPlanningInputDraftFromValue,
  collectPlanningPlaces,
  finalizePlanningInput,
  minutesToTimeInput,
  removeHardAnchor,
  setDepartureTime,
  setDestinationEnabled,
  setDestinationSelection,
  setDestinationTiming,
  setJourneyIntent,
  setStartSelection,
  timeInputToMinutes,
  upsertHardAnchor,
} from './planningInputWorkflow';
import {
  createHardAnchor,
  createPlaceRef,
} from '../models/geographicalPlan';

const euston = createPlaceRef({
  id: 'euston',
  name: 'London Euston',
  coordinates: { lat: 51.5282, lng: -0.1337 },
  source: 'current_gps',
  timezone: 'Europe/London',
});

const theatrePlace = createPlaceRef({
  id: 'theatre-place',
  name: 'Theatre',
  coordinates: { lat: 51.511, lng: -0.127 },
  source: 'resolved_place',
  timezone: 'Europe/London',
});

const hotel = createPlaceRef({
  id: 'hotel',
  name: 'Southwark Hotel',
  coordinates: { lat: 51.503, lng: -0.09 },
  source: 'resolved_place',
  timezone: 'Europe/London',
});

const currentSelection = createPlaceSelection({
  mode: PLACE_SELECTION_MODE.CURRENT_LOCATION,
  place: euston,
});

const resolvedSelection = place =>
  createPlaceSelection({
    mode: PLACE_SELECTION_MODE.RESOLVED_PLACE,
    place,
  });

const theatre = createHardAnchor({
  id: 'anchor-1',
  title: 'Theatre',
  place: theatrePlace,
  startTimeMinutes: 18 * 60 + 30,
  durationMinutes: 150,
  arrivalBufferMinutes: 15,
});

test('createPlaceSelection accepts only route-capable places', () => {
  expect(currentSelection.mode).toBe(PLACE_SELECTION_MODE.CURRENT_LOCATION);
  expect(currentSelection.place).toEqual(euston);
  expect(currentSelection.place).not.toBe(euston);

  expect(() =>
    createPlaceSelection({
      mode: PLACE_SELECTION_MODE.RESOLVED_PLACE,
      place: { name: 'Free text only' },
    }),
  ).toThrow('route-capable');
});

test('current-location mode cannot be assigned to a non-GPS place', () => {
  expect(() =>
    createPlaceSelection({
      mode: PLACE_SELECTION_MODE.CURRENT_LOCATION,
      place: theatrePlace,
    }),
  ).toThrow('current_gps provenance');
});

test('createCurrentLocationSelection safely converts browser position provenance', () => {
  expect(createCurrentLocationSelection({
    position: {
      lat: 51.5,
      lng: -0.1,
      accuracy: 25,
    },
    timezone: 'Europe/London',
  })).toEqual({
    mode: PLACE_SELECTION_MODE.CURRENT_LOCATION,
    place: {
      id: 'current-location',
      name: 'Current location',
      address: null,
      coordinates: { lat: 51.5, lng: -0.1 },
      source: 'current_gps',
      accuracyMeters: 25,
      locality: null,
      countryCode: null,
      timezone: 'Europe/London',
    },
  });
});

test('draft updates are immutable and preserve location provenance', () => {
  const draft = createPlanningInputDraft({ departureTimeMinutes: 600 });
  const withStart = setStartSelection(draft, currentSelection);
  const withTime = setDepartureTime(withStart, 630);

  expect(draft.startSelection).toBeNull();
  expect(withStart.startSelection).toEqual(currentSelection);
  expect(withStart.startSelection).not.toBe(currentSelection);
  expect(withTime.departureTimeMinutes).toBe(630);
  expect(withStart.departureTimeMinutes).toBe(600);
  expect(draft.journeyIntent).toBe(JOURNEY_INTENT.FLEXIBLE);
});

test('journey context is explicit, validated and does not alter timing fields', () => {
  const draft = createPlanningInputDraft();
  const timeSensitive = setJourneyIntent(
    draft,
    JOURNEY_INTENT.TIME_SENSITIVE,
  );

  expect(draft.journeyIntent).toBe(JOURNEY_INTENT.FLEXIBLE);
  expect(timeSensitive.journeyIntent).toBe(JOURNEY_INTENT.TIME_SENSITIVE);
  expect(timeSensitive.destination).toEqual(draft.destination);
  expect(() => setJourneyIntent(draft, 'arrival_guaranteed')).toThrow(
    'supported journey context',
  );
});

test('disabling destination clears place, deadline, and buffer', () => {
  let draft = createPlanningInputDraft();
  draft = setDestinationEnabled(draft, true);
  draft = setDestinationSelection(draft, resolvedSelection(hotel));
  draft = setDestinationTiming(draft, {
    arrivalDeadlineMinutes: 22 * 60,
    arrivalBufferMinutes: 10,
  });

  const cleared = setDestinationEnabled(draft, false);

  expect(cleared.destination).toEqual({
    enabled: false,
    selection: null,
    arrivalDeadlineMinutes: null,
    arrivalBufferMinutes: 0,
  });
});

test('upsertHardAnchor adds and replaces an anchor without mutating the draft', () => {
  const draft = createPlanningInputDraft();
  const added = upsertHardAnchor(draft, theatre);
  const updatedTheatre = createHardAnchor({
    ...theatre,
    title: 'Updated theatre',
    startTimeMinutes: 19 * 60,
  });
  const updated = upsertHardAnchor(added, updatedTheatre);

  expect(draft.anchors).toEqual([]);
  expect(added.anchors).toHaveLength(1);
  expect(updated.anchors).toHaveLength(1);
  expect(updated.anchors[0].title).toBe('Updated theatre');
  expect(added.anchors[0].title).toBe('Theatre');
});

test('upsertHardAnchor rejects reserved start and end identifiers', () => {
  const reserved = { ...theatre, id: 'start' };

  expect(() =>
    upsertHardAnchor(createPlanningInputDraft(), reserved),
  ).toThrow('reserved');
});

test('upsertHardAnchor rejects a hand-built anchor with invalid timing', () => {
  expect(() =>
    upsertHardAnchor(createPlanningInputDraft(), {
      ...theatre,
      startTimeMinutes: 1500,
    }),
  ).toThrow('planner-locked hard anchor');
});

test('removeHardAnchor removes only the selected hard anchor', () => {
  const second = createHardAnchor({
    ...theatre,
    id: 'anchor-2',
    title: 'Dinner',
    startTimeMinutes: 21 * 60,
    durationMinutes: 60,
  });
  let draft = upsertHardAnchor(createPlanningInputDraft(), theatre);
  draft = upsertHardAnchor(draft, second);

  const result = removeHardAnchor(draft, 'anchor-1');

  expect(result.anchors.map(anchor => anchor.id)).toEqual(['anchor-2']);
  expect(draft.anchors.map(anchor => anchor.id)).toEqual([
    'anchor-1',
    'anchor-2',
  ]);
});

test('finalizePlanningInput requires a resolved start place', () => {
  const result = finalizePlanningInput(createPlanningInputDraft());

  expect(result).toEqual({
    ok: false,
    errors: [PLANNING_INPUT_ERROR.START_PLACE_REQUIRED],
    value: null,
  });
});

test('finalizePlanningInput builds validated start, anchor, and destination models', () => {
  let draft = createPlanningInputDraft({ departureTimeMinutes: 9 * 60 });
  draft = setStartSelection(draft, currentSelection);
  draft = setJourneyIntent(draft, JOURNEY_INTENT.TIME_SENSITIVE);
  draft = upsertHardAnchor(draft, theatre);
  draft = setDestinationEnabled(draft, true);
  draft = setDestinationSelection(draft, resolvedSelection(hotel));
  draft = setDestinationTiming(draft, {
    arrivalDeadlineMinutes: 22 * 60 + 30,
    arrivalBufferMinutes: 10,
  });

  const result = finalizePlanningInput(draft);

  expect(result.ok).toBe(true);
  expect(result.value).toMatchObject({
    schemaVersion: 2,
    journeyIntent: JOURNEY_INTENT.TIME_SENSITIVE,
    start: {
      id: 'start',
      departureTimeMinutes: 540,
      place: euston,
    },
    anchors: [
      {
        id: 'anchor-1',
        startTimeMinutes: 1110,
        plannerLocked: true,
      },
    ],
    end: {
      id: 'end',
      arrivalDeadlineMinutes: 1350,
      arrivalBufferMinutes: 10,
      place: hotel,
    },
    locationProvenance: {
      start: PLACE_SELECTION_MODE.CURRENT_LOCATION,
      end: PLACE_SELECTION_MODE.RESOLVED_PLACE,
    },
  });
});

test('a finalized input can be reopened as an editable draft with its places', () => {
  let draft = createPlanningInputDraft({ departureTimeMinutes: 9 * 60 });
  draft = setStartSelection(draft, currentSelection);
  draft = setJourneyIntent(draft, JOURNEY_INTENT.COMFORTABLE_ARRIVAL);
  draft = upsertHardAnchor(draft, theatre);
  draft = setDestinationEnabled(draft, true);
  draft = setDestinationSelection(draft, resolvedSelection(hotel));

  const finalized = finalizePlanningInput(draft).value;
  const reopened = createPlanningInputDraftFromValue(finalized);

  expect(reopened.startSelection).toEqual(currentSelection);
  expect(reopened.journeyIntent).toBe(JOURNEY_INTENT.COMFORTABLE_ARRIVAL);
  expect(reopened.anchors).toEqual([theatre]);
  expect(reopened.destination.enabled).toBe(true);
  expect(reopened.destination.selection.place).toEqual(hotel);
  expect(collectPlanningPlaces(finalized).map(place => place.id)).toEqual([
    'euston',
    'theatre-place',
    'hotel',
  ]);
});

test('finalizePlanningInput supports a soft destination without a deadline', () => {
  let draft = createPlanningInputDraft();
  draft = setStartSelection(draft, currentSelection);
  draft = setDestinationEnabled(draft, true);
  draft = setDestinationSelection(draft, resolvedSelection(hotel));

  const result = finalizePlanningInput(draft);

  expect(result.ok).toBe(true);
  expect(result.value.end.arrivalDeadlineMinutes).toBeNull();
  expect(result.value.end.arrivalBufferMinutes).toBe(0);
});

test('finalizePlanningInput rejects an enabled destination without a place', () => {
  let draft = createPlanningInputDraft();
  draft = setStartSelection(draft, currentSelection);
  draft = setDestinationEnabled(draft, true);

  const result = finalizePlanningInput(draft);

  expect(result.ok).toBe(false);
  expect(result.errors).toContain(
    PLANNING_INPUT_ERROR.DESTINATION_PLACE_REQUIRED,
  );
});

test('finalizePlanningInput rejects duplicate anchor ids from an imported draft', () => {
  let draft = createPlanningInputDraft();
  draft = setStartSelection(draft, currentSelection);
  draft = {
    ...draft,
    anchors: [theatre, { ...theatre }],
  };

  const result = finalizePlanningInput(draft);

  expect(result.ok).toBe(false);
  expect(result.errors).toContain(
    PLANNING_INPUT_ERROR.ANCHOR_ID_DUPLICATE,
  );
});

test('finalizePlanningInput rejects an unsupported journey context', () => {
  const draft = {
    ...setStartSelection(createPlanningInputDraft(), currentSelection),
    journeyIntent: 'arrival_guaranteed',
  };

  const result = finalizePlanningInput(draft);

  expect(result.ok).toBe(false);
  expect(result.errors).toContain(PLANNING_INPUT_ERROR.JOURNEY_INTENT_INVALID);
});

test('time input helpers round-trip valid local minutes and reject invalid text', () => {
  expect(minutesToTimeInput(18 * 60 + 30)).toBe('18:30');
  expect(timeInputToMinutes('18:30')).toBe(1110);
  expect(minutesToTimeInput(1440)).toBe('');
  expect(timeInputToMinutes('24:00')).toBeNull();
  expect(timeInputToMinutes('not-time')).toBeNull();
});
