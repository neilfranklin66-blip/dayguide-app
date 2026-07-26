import {
  GEOGRAPHICAL_PLAN_SCHEMA_VERSION,
  PLANNING_POINT_KIND,
  createEndPoint,
  createHardAnchor,
  createPlaceRef,
  createStartPoint,
  isPlaceRef,
} from '../models/geographicalPlan';

export const PLACE_SELECTION_MODE = {
  CURRENT_LOCATION: 'current_location',
  RESOLVED_PLACE: 'resolved_place',
};

export const PLANNING_INPUT_ERROR = {
  START_PLACE_REQUIRED: 'start_place_required',
  START_TIME_INVALID: 'start_time_invalid',
  DESTINATION_PLACE_REQUIRED: 'destination_place_required',
  DESTINATION_DEADLINE_INVALID: 'destination_deadline_invalid',
  ANCHOR_INVALID: 'anchor_invalid',
  ANCHOR_ID_RESERVED: 'anchor_id_reserved',
  ANCHOR_ID_DUPLICATE: 'anchor_id_duplicate',
};

const RESERVED_POINT_IDS = new Set(['start', 'end']);

const isMinuteOfDay = value =>
  Number.isInteger(value) && value >= 0 && value < 24 * 60;

const copyPlace = place => ({
  ...place,
  coordinates: { ...place.coordinates },
});

const copySelection = selection =>
  selection == null
    ? null
    : {
        mode: selection.mode,
        place: copyPlace(selection.place),
      };

const copyAnchor = anchor => ({
  ...anchor,
  place: copyPlace(anchor.place),
});

export const isResolvedPlaceSelection = selection =>
  selection != null &&
  Object.values(PLACE_SELECTION_MODE).includes(selection.mode) &&
  isPlaceRef(selection.place);

export function createPlaceSelection({ mode, place } = {}) {
  if (!Object.values(PLACE_SELECTION_MODE).includes(mode)) {
    throw new TypeError('mode must identify current location or a resolved place');
  }
  if (!isPlaceRef(place)) {
    throw new TypeError('place must be a route-capable place reference');
  }
  if (
    mode === PLACE_SELECTION_MODE.CURRENT_LOCATION &&
    place.source !== 'current_gps'
  ) {
    throw new TypeError(
      'current location selection requires current_gps provenance',
    );
  }

  return {
    mode,
    place: copyPlace(place),
  };
}

export function createCurrentLocationSelection({
  position,
  name = 'Current location',
  timezone = null,
} = {}) {
  const place = createPlaceRef({
    id: 'current-location',
    name,
    coordinates: {
      lat: position?.lat,
      lng: position?.lng,
    },
    source: 'current_gps',
    accuracyMeters:
      typeof position?.accuracy === 'number' ? position.accuracy : null,
    timezone,
  });

  return createPlaceSelection({
    mode: PLACE_SELECTION_MODE.CURRENT_LOCATION,
    place,
  });
}

export function createPlanningInputDraft({
  departureTimeMinutes = 9 * 60,
} = {}) {
  return {
    schemaVersion: GEOGRAPHICAL_PLAN_SCHEMA_VERSION,
    startSelection: null,
    departureTimeMinutes,
    destination: {
      enabled: false,
      selection: null,
      arrivalDeadlineMinutes: null,
      arrivalBufferMinutes: 0,
    },
    anchors: [],
  };
}

export function setStartSelection(draft, selection) {
  if (selection != null && !isResolvedPlaceSelection(selection)) {
    throw new TypeError('selection must be null or a resolved place selection');
  }

  return {
    ...draft,
    startSelection: copySelection(selection),
  };
}

export function setDepartureTime(draft, departureTimeMinutes) {
  return {
    ...draft,
    departureTimeMinutes,
  };
}

export function setDestinationEnabled(draft, enabled) {
  if (enabled) {
    return {
      ...draft,
      destination: {
        ...draft.destination,
        enabled: true,
      },
    };
  }

  return {
    ...draft,
    destination: {
      enabled: false,
      selection: null,
      arrivalDeadlineMinutes: null,
      arrivalBufferMinutes: 0,
    },
  };
}

export function setDestinationSelection(draft, selection) {
  if (selection != null && !isResolvedPlaceSelection(selection)) {
    throw new TypeError('selection must be null or a resolved place selection');
  }

  return {
    ...draft,
    destination: {
      ...draft.destination,
      selection: copySelection(selection),
    },
  };
}

export function setDestinationTiming(
  draft,
  { arrivalDeadlineMinutes = null, arrivalBufferMinutes = 0 } = {},
) {
  return {
    ...draft,
    destination: {
      ...draft.destination,
      arrivalDeadlineMinutes,
      arrivalBufferMinutes,
    },
  };
}

const normalizeHardAnchor = anchor => {
  if (
    anchor == null ||
    anchor.kind !== PLANNING_POINT_KIND.HARD_ANCHOR ||
    anchor.plannerLocked !== true
  ) {
    return null;
  }

  try {
    return createHardAnchor({
      id: anchor.id,
      title: anchor.title,
      place: anchor.place,
      startTimeMinutes: anchor.startTimeMinutes,
      durationMinutes: anchor.durationMinutes,
      arrivalBufferMinutes: anchor.arrivalBufferMinutes,
    });
  } catch (_) {
    return null;
  }
};

const isHardAnchor = anchor => normalizeHardAnchor(anchor) != null;

export function upsertHardAnchor(draft, anchor) {
  if (!isHardAnchor(anchor)) {
    throw new TypeError('anchor must be a planner-locked hard anchor');
  }
  if (RESERVED_POINT_IDS.has(anchor.id)) {
    throw new TypeError('hard anchor id is reserved');
  }

  const existingIndex = draft.anchors.findIndex(item => item.id === anchor.id);
  const anchors = draft.anchors.map(copyAnchor);
  const normalizedAnchor = normalizeHardAnchor(anchor);

  if (existingIndex === -1) {
    anchors.push(normalizedAnchor);
  } else {
    anchors[existingIndex] = normalizedAnchor;
  }

  return {
    ...draft,
    anchors,
  };
}

export function removeHardAnchor(draft, anchorId) {
  return {
    ...draft,
    anchors: draft.anchors
      .filter(anchor => anchor.id !== anchorId)
      .map(copyAnchor),
  };
}

export function minutesToTimeInput(minutes) {
  if (!isMinuteOfDay(minutes)) return '';
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function timeInputToMinutes(value) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }
  const [hours, minutes] = value.split(':').map(Number);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
}

export function finalizePlanningInput(draft) {
  const errors = [];
  const destination = draft?.destination ?? {
    enabled: false,
    selection: null,
    arrivalDeadlineMinutes: null,
    arrivalBufferMinutes: 0,
  };
  const anchors = Array.isArray(draft?.anchors) ? draft.anchors : null;

  if (!isResolvedPlaceSelection(draft?.startSelection)) {
    errors.push(PLANNING_INPUT_ERROR.START_PLACE_REQUIRED);
  }
  if (!isMinuteOfDay(draft?.departureTimeMinutes)) {
    errors.push(PLANNING_INPUT_ERROR.START_TIME_INVALID);
  }

  if (destination.enabled) {
    if (!isResolvedPlaceSelection(destination.selection)) {
      errors.push(PLANNING_INPUT_ERROR.DESTINATION_PLACE_REQUIRED);
    }
    if (
      destination.arrivalDeadlineMinutes != null &&
      !isMinuteOfDay(destination.arrivalDeadlineMinutes)
    ) {
      errors.push(PLANNING_INPUT_ERROR.DESTINATION_DEADLINE_INVALID);
    }
    if (
      !Number.isInteger(destination.arrivalBufferMinutes) ||
      destination.arrivalBufferMinutes < 0 ||
      (destination.arrivalDeadlineMinutes == null &&
        destination.arrivalBufferMinutes !== 0) ||
      (destination.arrivalDeadlineMinutes != null &&
        destination.arrivalBufferMinutes >
          destination.arrivalDeadlineMinutes)
    ) {
      errors.push(PLANNING_INPUT_ERROR.DESTINATION_DEADLINE_INVALID);
    }
  }

  if (anchors == null || anchors.some(anchor => !isHardAnchor(anchor))) {
    errors.push(PLANNING_INPUT_ERROR.ANCHOR_INVALID);
  } else {
    if (anchors.some(anchor => RESERVED_POINT_IDS.has(anchor.id))) {
      errors.push(PLANNING_INPUT_ERROR.ANCHOR_ID_RESERVED);
    }
    if (new Set(anchors.map(anchor => anchor.id)).size !== anchors.length) {
      errors.push(PLANNING_INPUT_ERROR.ANCHOR_ID_DUPLICATE);
    }
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors: [...new Set(errors)],
      value: null,
    };
  }

  try {
    const start = createStartPoint({
      place: draft.startSelection.place,
      departureTimeMinutes: draft.departureTimeMinutes,
    });
    const end = destination.enabled
      ? createEndPoint({
          place: destination.selection.place,
          arrivalDeadlineMinutes: destination.arrivalDeadlineMinutes,
          arrivalBufferMinutes: destination.arrivalBufferMinutes,
        })
      : null;

    const normalizedAnchors = anchors.map(normalizeHardAnchor);

    return {
      ok: true,
      errors: [],
      value: {
        schemaVersion: GEOGRAPHICAL_PLAN_SCHEMA_VERSION,
        start,
        anchors: normalizedAnchors.map(copyAnchor),
        end,
        locationProvenance: {
          start: draft.startSelection.mode,
          end: destination.enabled ? destination.selection.mode : null,
        },
      },
    };
  } catch (_) {
    return {
      ok: false,
      errors: [PLANNING_INPUT_ERROR.ANCHOR_INVALID],
      value: null,
    };
  }
}

const planningInputWorkflow = {
  PLACE_SELECTION_MODE,
  PLANNING_INPUT_ERROR,
  createPlaceSelection,
  createCurrentLocationSelection,
  createPlanningInputDraft,
  finalizePlanningInput,
  isResolvedPlaceSelection,
  minutesToTimeInput,
  removeHardAnchor,
  setDepartureTime,
  setDestinationEnabled,
  setDestinationSelection,
  setDestinationTiming,
  setStartSelection,
  timeInputToMinutes,
  upsertHardAnchor,
};

export default planningInputWorkflow;
