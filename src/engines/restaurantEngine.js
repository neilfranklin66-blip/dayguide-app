import { mapFromMockArray, mapFromPlacesArray } from '../adapters/placeCardAdapter';
import {
  buildRestaurantQueue,
  excludeAlreadySelected,
  findNearestRestaurant,
} from './filterEngine';
import { rankRecommendations } from '../utils/recommendationScore';

export const getRestaurantSourceFromError = (error) => {
  const message = error?.message;

  if (message === 'NO_API_KEY') return 'no_key';
  if (message === 'QUOTA_EXCEEDED') return 'quota';
  if (message === 'NO_LOCATION') return 'no_location';

  return 'error';
};

// Filtered + ranked queue from the mock data; when even that is empty, the
// nearest venue from the full unfiltered mock list is surfaced as a hint for
// the no-results card.
const buildMockFallbackOutcome = ({
  mockRestaurants,
  selectedRestaurants,
  cuisines,
  price,
  hasChildren,
  source,
}) => {
  const normalized = mapFromMockArray(mockRestaurants);
  const queue = rankRecommendations(
    buildRestaurantQueue({
      restaurants: normalized,
      cuisines,
      price,
      selectedRestaurants,
    }),
    { selectedCuisines: cuisines, selectedPriceRange: price, hasChildren },
  );

  return {
    queue,
    source,
    nearestHint: queue.length === 0 ? findNearestRestaurant(normalized) : null,
  };
};

/**
 * Decide the restaurant queue, source label, and no-results hint for one
 * search attempt. Pass `results` on a successful live search or `error` on a
 * failed one; the mock fallback covers errors and live searches that yield
 * nothing usable after dedupe.
 */
export const resolveRestaurantSearchOutcome = ({
  results = null,
  error = null,
  mockRestaurants = [],
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
        nearestHint: null,
      };
    }
  }

  return buildMockFallbackOutcome({
    mockRestaurants,
    selectedRestaurants,
    cuisines,
    price,
    hasChildren,
    source: error ? getRestaurantSourceFromError(error) : 'no_results',
  });
};
