// Rough urban travel profiles. distanceKm is currently venue distance from the
// user, not true leg-to-leg distance, so these are ballpark figures only.
const MODE_TRAVEL_PROFILES = {
  walk: { speedKmh: 4.8, overheadMinutes: 0 },
  taxi: { speedKmh: 18, overheadMinutes: 3 },
  tube: { speedKmh: 30, overheadMinutes: 8 },
  bus: { speedKmh: 14, overheadMinutes: 6 },
};

const MIN_ESTIMATE_MINUTES = 1;
const MAX_ESTIMATE_MINUTES = 120;

export const estimateTransportMinutes = (mode, distanceKm, fallbackMinutes = null) => {
  const profile = MODE_TRAVEL_PROFILES[mode];
  const isValidDistance =
    typeof distanceKm === 'number' && Number.isFinite(distanceKm) && distanceKm >= 0;

  if (!profile || !isValidDistance) {
    return fallbackMinutes;
  }

  const rawMinutes = (distanceKm / profile.speedKmh) * 60 + profile.overheadMinutes;
  return Math.min(MAX_ESTIMATE_MINUTES, Math.max(MIN_ESTIMATE_MINUTES, Math.round(rawMinutes)));
};

export const selectTransportOptions = (transportOptions, distanceKm) => {
  if (distanceKm < 0.5) {
    return transportOptions.filter(option => ['walk', 'taxi'].includes(option.mode));
  }

  if (distanceKm > 1.5) {
    return transportOptions.filter(option => option.mode !== 'walk');
  }

  return transportOptions;
};
