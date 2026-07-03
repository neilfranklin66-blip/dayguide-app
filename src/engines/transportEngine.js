export const selectTransportOptions = (transportOptions, distanceKm) => {
  if (distanceKm < 0.5) {
    return transportOptions.filter(option => ['walk', 'taxi'].includes(option.mode));
  }

  if (distanceKm > 1.5) {
    return transportOptions.filter(option => option.mode !== 'walk');
  }

  return transportOptions;
};
