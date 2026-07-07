import { mapFromPlacesArray } from '../adapters/placeCardAdapter';
import { excludeAlreadySelected } from './filterEngine';
import { rankRecommendations } from '../utils/recommendationScore';

export const getRestaurantSourceFromError = (error) => {
  const message = error?.message;

  if (message === 'NO_API_KEY') return 'no_key';
  if (message === 'QUOTA_EXCEEDED') return 'quota';
  if (message === 'NO_LOCATION') return 'no_location';

  return 'error';
};

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
