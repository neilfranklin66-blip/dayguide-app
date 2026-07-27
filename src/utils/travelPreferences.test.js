import {
  DEFAULT_TRAVEL_PREFERENCES,
  TRAVEL_PREFERENCES_STORAGE_KEY,
  WALKING_PACE,
  applyTravelPreferenceChanges,
  getWalkingSpeedKmh,
  loadTravelPreferences,
  normalizeTravelPreferences,
  recordWalkingExperience,
  saveTravelPreferences,
} from './travelPreferences';

beforeEach(() => localStorage.clear());

test('uses a universal typical pace and 45-minute walking boundary by default', () => {
  expect(normalizeTravelPreferences()).toEqual(
    DEFAULT_TRAVEL_PREFERENCES,
  );
  expect(getWalkingSpeedKmh()).toBe(4.8);
});

test('accepts user-selected pace and maximum walking time', () => {
  const preferences = normalizeTravelPreferences({
    walkingPace: WALKING_PACE.RELAXED,
    maximumWalkingMinutes: 60,
  });

  expect(preferences.walkingPace).toBe(WALKING_PACE.RELAXED);
  expect(preferences.maximumWalkingMinutes).toBe(60);
  expect(getWalkingSpeedKmh(preferences)).toBe(4);
});

test('stores travel preferences independently from a saved itinerary', () => {
  saveTravelPreferences({
    walkingPace: WALKING_PACE.BRISK,
    maximumWalkingMinutes: 30,
  });

  expect(loadTravelPreferences()).toEqual({
    walkingPace: WALKING_PACE.BRISK,
    maximumWalkingMinutes: 30,
    learnedWalkingMinutesPerKm: null,
    walkingExperienceCount: 0,
  });
  expect(localStorage.getItem(TRAVEL_PREFERENCES_STORAGE_KEY)).not.toBeNull();
});

test('learns only a pace number from explicit experience without storing a route or location', () => {
  const learned = recordWalkingExperience(
    DEFAULT_TRAVEL_PREFERENCES,
    { distanceKm: 2, actualMinutes: 30 },
  );

  expect(learned.learnedWalkingMinutesPerKm).toBe(15);
  expect(learned.walkingExperienceCount).toBe(1);
  expect(getWalkingSpeedKmh(learned)).toBe(4);
  expect(learned).not.toHaveProperty('route');
  expect(learned).not.toHaveProperty('location');
});

test('an explicit pace choice replaces a previously learned pace', () => {
  const learned = recordWalkingExperience(
    DEFAULT_TRAVEL_PREFERENCES,
    { distanceKm: 2, actualMinutes: 30 },
  );
  const changed = applyTravelPreferenceChanges(learned, {
    walkingPace: WALKING_PACE.BRISK,
  });

  expect(changed.learnedWalkingMinutesPerKm).toBeNull();
  expect(changed.walkingExperienceCount).toBe(0);
  expect(getWalkingSpeedKmh(changed)).toBe(5.6);
});

test('discards corrupted learned pace values loaded from storage', () => {
  localStorage.setItem(
    TRAVEL_PREFERENCES_STORAGE_KEY,
    JSON.stringify({
      walkingPace: WALKING_PACE.TYPICAL,
      maximumWalkingMinutes: 45,
      learnedWalkingMinutesPerKm: 0.1,
      walkingExperienceCount: 8,
    }),
  );

  expect(loadTravelPreferences()).toEqual(
    DEFAULT_TRAVEL_PREFERENCES,
  );
});

test('rejects implausible experience rather than corrupting the learned pace', () => {
  expect(() =>
    recordWalkingExperience(DEFAULT_TRAVEL_PREFERENCES, {
      distanceKm: 1,
      actualMinutes: 2,
    }),
  ).toThrow('outside the supported calibration range');
});
