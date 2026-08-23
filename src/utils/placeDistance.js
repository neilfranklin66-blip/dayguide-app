const MILES_PER_KILOMETRE = 0.621371;

// Nearby cards always measure from the active search origin. The presentation
// unit follows the user's selected app language, rather than device location.
export function formatNearbyDistance(distanceKilometres, locale = 'en') {
  if (!Number.isFinite(distanceKilometres) || distanceKilometres < 0) return null;

  const usesMiles = String(locale).toLowerCase().startsWith('en');
  const distance = usesMiles
    ? distanceKilometres * MILES_PER_KILOMETRE
    : distanceKilometres;

  // Round once before choosing the display form so an exact ten-mile value
  // cannot become "10.0" through floating-point precision.
  const displayedAtOneDecimal = Math.round(distance * 10) / 10;
  return displayedAtOneDecimal < 10
    ? displayedAtOneDecimal.toFixed(1)
    : String(Math.round(distance));
}
