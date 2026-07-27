export const WALKING_PACE = Object.freeze({
  RELAXED: 'relaxed',
  TYPICAL: 'typical',
  BRISK: 'brisk',
});

export const WALKING_SPEED_KMH = Object.freeze({
  [WALKING_PACE.RELAXED]: 4,
  [WALKING_PACE.TYPICAL]: 4.8,
  [WALKING_PACE.BRISK]: 5.6,
});

export const TRAVEL_PREFERENCES_STORAGE_KEY =
  'dayguide_travel_preferences_v1';

export const DEFAULT_TRAVEL_PREFERENCES = Object.freeze({
  walkingPace: WALKING_PACE.TYPICAL,
  maximumWalkingMinutes: 45,
  learnedWalkingMinutesPerKm: null,
  walkingExperienceCount: 0,
});

const ALLOWED_MAXIMUM_WALKING_MINUTES = Object.freeze([
  15,
  30,
  45,
  60,
  90,
]);

const isFinitePositiveNumber = value =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0;

const isSupportedLearnedPace = value =>
  isFinitePositiveNumber(value) && value >= 5 && value <= 30;

export function normalizeTravelPreferences(value = {}) {
  const walkingPace = Object.values(WALKING_PACE).includes(
    value?.walkingPace,
  )
    ? value.walkingPace
    : DEFAULT_TRAVEL_PREFERENCES.walkingPace;
  const maximumWalkingMinutes =
    ALLOWED_MAXIMUM_WALKING_MINUTES.includes(
      value?.maximumWalkingMinutes,
    )
      ? value.maximumWalkingMinutes
      : DEFAULT_TRAVEL_PREFERENCES.maximumWalkingMinutes;
  const learnedWalkingMinutesPerKm =
    isSupportedLearnedPace(value?.learnedWalkingMinutesPerKm)
      ? value.learnedWalkingMinutesPerKm
      : null;
  const walkingExperienceCount =
    Number.isInteger(value?.walkingExperienceCount) &&
    value.walkingExperienceCount > 0 &&
    learnedWalkingMinutesPerKm != null
      ? value.walkingExperienceCount
      : 0;

  return {
    walkingPace,
    maximumWalkingMinutes,
    learnedWalkingMinutesPerKm,
    walkingExperienceCount,
  };
}

export function applyTravelPreferenceChanges(preferences, changes = {}) {
  const current = normalizeTravelPreferences(preferences);
  const next = { ...current, ...changes };
  if (
    Object.prototype.hasOwnProperty.call(changes, 'walkingPace') &&
    changes.walkingPace !== current.walkingPace
  ) {
    next.learnedWalkingMinutesPerKm = null;
    next.walkingExperienceCount = 0;
  }
  return normalizeTravelPreferences(next);
}

export function getWalkingSpeedKmh(preferences = {}) {
  const normalized = normalizeTravelPreferences(preferences);
  if (normalized.learnedWalkingMinutesPerKm != null) {
    return 60 / normalized.learnedWalkingMinutesPerKm;
  }
  return WALKING_SPEED_KMH[normalized.walkingPace];
}

export function recordWalkingExperience(
  preferences,
  { distanceKm, actualMinutes } = {},
) {
  if (
    !isFinitePositiveNumber(distanceKm) ||
    !isFinitePositiveNumber(actualMinutes)
  ) {
    throw new TypeError(
      'walking experience requires positive distance and duration',
    );
  }

  const normalized = normalizeTravelPreferences(preferences);
  const observedMinutesPerKm = actualMinutes / distanceKm;
  if (observedMinutesPerKm < 5 || observedMinutesPerKm > 30) {
    throw new RangeError(
      'walking experience is outside the supported calibration range',
    );
  }

  const priorCount = normalized.walkingExperienceCount;
  const priorMinutesPerKm =
    normalized.learnedWalkingMinutesPerKm ??
    60 / WALKING_SPEED_KMH[normalized.walkingPace];
  const nextCount = Math.min(priorCount + 1, 20);
  const retainedCount = Math.min(priorCount, 19);
  const learnedWalkingMinutesPerKm =
    (priorMinutesPerKm * retainedCount + observedMinutesPerKm) /
    (retainedCount + 1);

  return {
    ...normalized,
    learnedWalkingMinutesPerKm,
    walkingExperienceCount: nextCount,
  };
}

export function loadTravelPreferences() {
  try {
    const raw = localStorage.getItem(TRAVEL_PREFERENCES_STORAGE_KEY);
    return raw
      ? normalizeTravelPreferences(JSON.parse(raw))
      : { ...DEFAULT_TRAVEL_PREFERENCES };
  } catch (_) {
    return { ...DEFAULT_TRAVEL_PREFERENCES };
  }
}

export function saveTravelPreferences(preferences) {
  const normalized = normalizeTravelPreferences(preferences);
  try {
    localStorage.setItem(
      TRAVEL_PREFERENCES_STORAGE_KEY,
      JSON.stringify(normalized),
    );
  } catch (_) {}
  return normalized;
}

export { ALLOWED_MAXIMUM_WALKING_MINUTES };
