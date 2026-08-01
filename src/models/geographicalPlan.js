/**
 * Provider-independent geographical planning models.
 *
 * Packet 148 established the provider-independent data contract. Later
 * planning controls may record user choices alongside these points, but no
 * model here performs a provider call or asserts route feasibility.
 */

export const GEOGRAPHICAL_PLAN_SCHEMA_VERSION = 2;

export const PLANNING_POINT_KIND = {
  START: 'start',
  HARD_ANCHOR: 'hard_anchor',
  END: 'end',
  FLEXIBLE_STOP: 'flexible_stop',
};

const MINUTES_PER_DAY = 24 * 60;

const isFiniteNumber = value =>
  typeof value === 'number' && Number.isFinite(value);

const requireNonEmptyString = (value, fieldName) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${fieldName} must be a non-empty string`);
  }
  return value.trim();
};

const optionalTrimmedString = value =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const requireMinuteOfDay = (value, fieldName) => {
  if (!Number.isInteger(value) || value < 0 || value >= MINUTES_PER_DAY) {
    throw new RangeError(`${fieldName} must be a whole minute from 0 to 1439`);
  }
  return value;
};

const requireNonNegativeMinutes = (value, fieldName) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a non-negative whole number`);
  }
  return value;
};

export const isValidCoordinates = coordinates =>
  coordinates != null &&
  isFiniteNumber(coordinates.lat) &&
  isFiniteNumber(coordinates.lng) &&
  coordinates.lat >= -90 &&
  coordinates.lat <= 90 &&
  coordinates.lng >= -180 &&
  coordinates.lng <= 180;

export const isPlaceRef = place =>
  place != null &&
  typeof place === 'object' &&
  typeof place.name === 'string' &&
  place.name.trim().length > 0 &&
  typeof place.source === 'string' &&
  place.source.trim().length > 0 &&
  isValidCoordinates(place.coordinates);

const requirePlaceRef = (place, fieldName = 'place') => {
  if (!isPlaceRef(place)) {
    throw new TypeError(`${fieldName} must be a route-capable place reference`);
  }
  return place;
};

export function createPlaceRef({
  id = null,
  name,
  address = null,
  coordinates,
  source = 'user_selected',
  accuracyMeters = null,
  locality = null,
  countryCode = null,
  timezone = null,
} = {}) {
  if (!isValidCoordinates(coordinates)) {
    throw new RangeError('coordinates must contain valid latitude and longitude');
  }

  if (
    accuracyMeters != null &&
    (!isFiniteNumber(accuracyMeters) || accuracyMeters < 0)
  ) {
    throw new RangeError('accuracyMeters must be null or a non-negative number');
  }

  return {
    id: id == null ? null : String(id),
    name: requireNonEmptyString(name, 'name'),
    address: optionalTrimmedString(address),
    coordinates: {
      lat: coordinates.lat,
      lng: coordinates.lng,
    },
    source: requireNonEmptyString(source, 'source'),
    accuracyMeters,
    locality: optionalTrimmedString(locality),
    countryCode: optionalTrimmedString(countryCode)?.toUpperCase() ?? null,
    timezone: optionalTrimmedString(timezone),
  };
}

export function createStartPoint({
  id = 'start',
  place,
  departureTimeMinutes,
} = {}) {
  return {
    kind: PLANNING_POINT_KIND.START,
    id: requireNonEmptyString(id, 'id'),
    place: requirePlaceRef(place),
    departureTimeMinutes: requireMinuteOfDay(
      departureTimeMinutes,
      'departureTimeMinutes',
    ),
  };
}

export function createHardAnchor({
  id,
  title,
  place,
  startTimeMinutes,
  durationMinutes = 0,
  arrivalBufferMinutes = 15,
} = {}) {
  const normalizedStart = requireMinuteOfDay(
    startTimeMinutes,
    'startTimeMinutes',
  );
  const normalizedDuration = requireNonNegativeMinutes(
    durationMinutes,
    'durationMinutes',
  );
  const normalizedBuffer = requireNonNegativeMinutes(
    arrivalBufferMinutes,
    'arrivalBufferMinutes',
  );

  if (normalizedStart + normalizedDuration > MINUTES_PER_DAY) {
    throw new RangeError('hard anchor must finish within the selected day');
  }
  if (normalizedBuffer > normalizedStart) {
    throw new RangeError(
      'arrivalBufferMinutes cannot begin before the selected day',
    );
  }

  return {
    kind: PLANNING_POINT_KIND.HARD_ANCHOR,
    id: requireNonEmptyString(id, 'id'),
    title: requireNonEmptyString(title, 'title'),
    place: requirePlaceRef(place),
    startTimeMinutes: normalizedStart,
    durationMinutes: normalizedDuration,
    arrivalBufferMinutes: normalizedBuffer,
    plannerLocked: true,
  };
}

export function createEndPoint({
  id = 'end',
  place,
  arrivalDeadlineMinutes = null,
  arrivalBufferMinutes = 0,
} = {}) {
  const normalizedDeadline =
    arrivalDeadlineMinutes == null
      ? null
      : requireMinuteOfDay(
          arrivalDeadlineMinutes,
          'arrivalDeadlineMinutes',
        );
  const normalizedBuffer = requireNonNegativeMinutes(
    arrivalBufferMinutes,
    'arrivalBufferMinutes',
  );

  if (normalizedDeadline != null && normalizedBuffer > normalizedDeadline) {
    throw new RangeError(
      'arrivalBufferMinutes cannot begin before the selected day',
    );
  }
  if (normalizedDeadline == null && normalizedBuffer !== 0) {
    throw new RangeError(
      'arrivalBufferMinutes requires an arrivalDeadlineMinutes value',
    );
  }

  return {
    kind: PLANNING_POINT_KIND.END,
    id: requireNonEmptyString(id, 'id'),
    place: requirePlaceRef(place),
    arrivalDeadlineMinutes: normalizedDeadline,
    arrivalBufferMinutes: normalizedBuffer,
  };
}

export function createFlexibleStop({
  id,
  title,
  place,
  durationMinutes,
  minimumDurationMinutes = durationMinutes,
} = {}) {
  const normalizedDuration = requireNonNegativeMinutes(
    durationMinutes,
    'durationMinutes',
  );
  const normalizedMinimum = requireNonNegativeMinutes(
    minimumDurationMinutes,
    'minimumDurationMinutes',
  );

  if (normalizedDuration === 0) {
    throw new RangeError('durationMinutes must be greater than zero');
  }
  if (normalizedMinimum === 0 || normalizedMinimum > normalizedDuration) {
    throw new RangeError(
      'minimumDurationMinutes must be greater than zero and no longer than durationMinutes',
    );
  }

  return {
    kind: PLANNING_POINT_KIND.FLEXIBLE_STOP,
    id: requireNonEmptyString(id, 'id'),
    title: requireNonEmptyString(title, 'title'),
    place: requirePlaceRef(place),
    durationMinutes: normalizedDuration,
    minimumDurationMinutes: normalizedMinimum,
    plannerLocked: false,
  };
}

export function createRouteLeg({
  id,
  fromPointId,
  toPointId,
  mode = 'unspecified',
  durationMinutes,
  distanceMeters = null,
  evidenceSource = 'injected',
  observedAt = null,
} = {}) {
  if (
    distanceMeters != null &&
    (!isFiniteNumber(distanceMeters) || distanceMeters < 0)
  ) {
    throw new RangeError('distanceMeters must be null or a non-negative number');
  }

  return {
    id: requireNonEmptyString(id, 'id'),
    fromPointId: requireNonEmptyString(fromPointId, 'fromPointId'),
    toPointId: requireNonEmptyString(toPointId, 'toPointId'),
    mode: requireNonEmptyString(mode, 'mode'),
    durationMinutes: requireNonNegativeMinutes(
      durationMinutes,
      'durationMinutes',
    ),
    distanceMeters,
    evidenceSource: requireNonEmptyString(evidenceSource, 'evidenceSource'),
    observedAt: optionalTrimmedString(observedAt),
  };
}

const geographicalPlanModel = {
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
};

export default geographicalPlanModel;
