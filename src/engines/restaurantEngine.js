import { mapFromPlacesArray } from '../adapters/placeCardAdapter';
import { excludeAlreadySelected } from './filterEngine';
import { rankRecommendations } from '../utils/recommendationScore';

// Maps a thrown reason onto the source label the UI explains to the user.
// Anything absent falls through to 'error' — an unrecognised failure is
// reported as an unknown external failure, never guessed at.
const ERROR_MESSAGE_TO_SOURCE = {
  // DayGuide's own configuration: retrying the same search cannot help.
  // API_DENIED means the server-side key exists but is rejected (bad key or
  // referrer restriction) — from the user's seat that is still "not set up".
  NO_API_KEY: 'no_key',
  API_DENIED: 'no_key',
  QUOTA_EXCEEDED: 'quota',
  // DayGuide failed to form a complete request. An app bug.
  INCOMPLETE_REQUEST: 'bad_request',
  // The user can act on these.
  NO_LOCATION: 'no_location',
  LOCATION_DENIED: 'location_denied',
  // Outside DayGuide's control; a retry may succeed.
  NETWORK_ERROR: 'network',
};

export const getRestaurantSourceFromError = (error) =>
  ERROR_MESSAGE_TO_SOURCE[error?.message] ?? 'error';

/**
 * Decide the restaurant queue and source label for one search attempt. Pass
 * `results` on a successful live search or `error` on a failed one. When live
 * results are unavailable or empty after dedupe, the queue stays empty so the
 * UI shows an honest unavailable/no-results state — mock venues must never be
 * presented to users as real nearby recommendations.
 */
export const resolveRestaurantSearchOutcome = ({
  results = null,
  error = null,
  selectedRestaurants = [],
  cuisines = [],
  price = null,
  hasChildren = null,
}) => {
  if (!error) {
    const deduped = excludeAlreadySelected(
      mapFromPlacesArray(results),
      selectedRestaurants,
    );

    if (deduped.length > 0) {
      return {
        queue: rankRecommendations(deduped, {
          selectedCuisines: cuisines,
          selectedPriceRange: price,
          hasChildren,
        }),
        source: 'live',
      };
    }
  }

  return {
    queue: [],
    source: error ? getRestaurantSourceFromError(error) : 'no_results',
  };
};
