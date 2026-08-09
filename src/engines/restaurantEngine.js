import { mapFromPlacesArray } from '../adapters/placeCardAdapter';
import { excludeAlreadySelected } from './filterEngine';
import { rankRecommendations } from '../utils/recommendationScore';
import {
  ERROR_MESSAGE_TO_SOURCE,
  getLiveSearchSourceFromError,
} from './liveSearchOutcome';

export { ERROR_MESSAGE_TO_SOURCE };

export const getRestaurantSourceFromError = getLiveSearchSourceFromError;

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
    // `candidates` are the suitable matches the live search returned, *before*
    // any seen/selected exclusion. `deduped` is what survives that exclusion.
    const candidates = mapFromPlacesArray(results);
    const deduped = excludeAlreadySelected(candidates, selectedRestaurants);

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

    // Suitable candidates existed but every one was already shown or selected:
    // that is "no more unseen options", not "no matches exist nearby". Telling
    // the user no restaurants were found would be untrue.
    if (candidates.length > 0) {
      return { queue: [], source: 'no_unseen_results' };
    }
  }

  return {
    queue: [],
    source: error ? getRestaurantSourceFromError(error) : 'no_results',
  };
};
