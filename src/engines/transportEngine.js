import {
  DEFAULT_TRAVEL_PREFERENCES,
  getWalkingSpeedKmh,
  normalizeTravelPreferences,
} from '../utils/travelPreferences';

// Rough public-transport planning profiles. distanceKm is currently venue
// proximity, not true leg-to-leg routed distance, so these remain ballpark
// figures until the geographical-plan route legs are mounted.
const MODE_TRAVEL_PROFILES = {
  tube: { speedKmh: 30, overheadMinutes: 8 },
  bus: { speedKmh: 14, overheadMinutes: 6 },
};

const MIN_ESTIMATE_MINUTES = 1;
const MAX_ESTIMATE_MINUTES = 120;

export const estimateTransportMinutes = (
  mode,
  distanceKm,
  fallbackMinutes = null,
  travelPreferences = DEFAULT_TRAVEL_PREFERENCES,
) => {
  const profile =
    mode === 'walk'
      ? {
          speedKmh: getWalkingSpeedKmh(travelPreferences),
          overheadMinutes: 0,
        }
      : MODE_TRAVEL_PROFILES[mode];
  const isValidDistance =
    typeof distanceKm === 'number' &&
    Number.isFinite(distanceKm) &&
    distanceKm >= 0;

  if (!profile || !isValidDistance) {
    return fallbackMinutes;
  }

  const rawMinutes =
    (distanceKm / profile.speedKmh) * 60 +
    profile.overheadMinutes;
  return Math.min(
    MAX_ESTIMATE_MINUTES,
    Math.max(MIN_ESTIMATE_MINUTES, Math.round(rawMinutes)),
  );
};

export const TRANSPORT_ESTIMATE_STATUS = Object.freeze({
  PROVIDER_ESTIMATE: 'provider_estimate',
  ROUGH_ESTIMATE: 'rough_estimate',
  LIVE_CHECK_REQUIRED: 'live_check_required',
});

export const getTransportPlanningEstimate = ({
  mode,
  distanceKm,
  fallbackMinutes = null,
  providerDurationMinutes = null,
  travelPreferences = DEFAULT_TRAVEL_PREFERENCES,
} = {}) => {
  if (
    Number.isInteger(providerDurationMinutes) &&
    providerDurationMinutes > 0
  ) {
    return {
      minutes: providerDurationMinutes,
      status: TRANSPORT_ESTIMATE_STATUS.PROVIDER_ESTIMATE,
      liveCheckRecommended: true,
    };
  }

  // Pickup delay and road traffic make a fixed taxi speed actively
  // misleading. The route-specific Maps handoff is the primary evidence.
  if (mode === 'taxi') {
    return {
      minutes: null,
      status: TRANSPORT_ESTIMATE_STATUS.LIVE_CHECK_REQUIRED,
      liveCheckRecommended: true,
    };
  }

  const minutes = estimateTransportMinutes(
    mode,
    distanceKm,
    fallbackMinutes,
    travelPreferences,
  );
  return {
    minutes,
    status:
      minutes == null
        ? TRANSPORT_ESTIMATE_STATUS.LIVE_CHECK_REQUIRED
        : TRANSPORT_ESTIMATE_STATUS.ROUGH_ESTIMATE,
    liveCheckRecommended: true,
  };
};

export const selectTransportOptions = (
  transportOptions,
  distanceKm,
  travelPreferences = DEFAULT_TRAVEL_PREFERENCES,
) => {
  const preferences = normalizeTravelPreferences(travelPreferences);
  const walkingMinutes = estimateTransportMinutes(
    'walk',
    distanceKm,
    null,
    preferences,
  );

  return transportOptions.filter(
    option =>
      option.mode !== 'walk' ||
      walkingMinutes == null ||
      walkingMinutes <= preferences.maximumWalkingMinutes,
  );
};
