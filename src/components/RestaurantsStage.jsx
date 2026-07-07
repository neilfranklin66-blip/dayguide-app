import React from 'react';
import RestaurantsLoadingCard from './RestaurantsLoadingCard';
import RestaurantsNoResultsCard from './RestaurantsNoResultsCard';
import RestaurantsUnavailableCard from './RestaurantsUnavailableCard';
import NoMoreRestaurantsCard from './NoMoreRestaurantsCard';
import RestaurantSwipeCard from './RestaurantSwipeCard';
import { buildRecommendationReason } from '../utils/recommendationReason';
import { getRouteAfterRestaurants } from '../engines/itineraryRouteEngine';
import { LIVE_SEARCH_FAILURE_SOURCES } from '../config/dayGuideOptions';

export default function RestaurantsStage({
  isRestaurantsLoading,
  restaurantQueue,
  selectedCuisines,
  selectedPriceRange,
  setSelectedCuisines,
  setSelectedPriceRange,
  goToRestaurants,
  continueAfterRestaurants,
  selectedRestaurants,
  currentRestaurantIndex,
  restaurantSource,
  hasChildren,
  startWith,
  swipeRestaurant,
  t,
}) {
  if (isRestaurantsLoading) {
    return <RestaurantsLoadingCard t={t} />;
  }

  if (restaurantQueue !== null && restaurantQueue.length === 0) {
    // The live search failed outright: say why and let the user move on.
    // Retrying with looser filters would just fail the same way, and mock
    // venues must not stand in as real recommendations.
    if (LIVE_SEARCH_FAILURE_SOURCES.has(restaurantSource)) {
      return (
        <RestaurantsUnavailableCard
          restaurantSource={restaurantSource}
          onSkip={() => continueAfterRestaurants([])}
          t={t}
        />
      );
    }

    const hasCuisine = selectedCuisines.length > 0;
    const hasPrice = !!selectedPriceRange;
    const hasFilters = hasCuisine || hasPrice;
    return (
      <RestaurantsNoResultsCard
        hasCuisine={hasCuisine}
        hasPrice={hasPrice}
        hasFilters={hasFilters}
        onShowAllNearby={() => {
          setSelectedCuisines([]);
          setSelectedPriceRange(null);
          goToRestaurants([], null);
        }}
        onRemoveCuisineFilter={() => {
          setSelectedCuisines([]);
          goToRestaurants([], selectedPriceRange);
        }}
        onRemovePriceFilter={() => {
          setSelectedPriceRange(null);
          goToRestaurants(selectedCuisines, null);
        }}
        onSkip={() => continueAfterRestaurants([])}
        t={t}
      />
    );
  }

  const currentRestaurant = restaurantQueue ? restaurantQueue[currentRestaurantIndex] : null;

  if (!currentRestaurant) {
    return (
      <NoMoreRestaurantsCard
        onContinue={() => continueAfterRestaurants(selectedRestaurants)}
        nextRoute={getRouteAfterRestaurants({ startWith })}
        t={t}
      />
    );
  }

  const recommendationReason = buildRecommendationReason(currentRestaurant, {
    selectedCuisines,
    selectedPriceRange,
    hasChildren,
  });

  return (
    <RestaurantSwipeCard
      currentRestaurant={currentRestaurant}
      currentRestaurantIndex={currentRestaurantIndex}
      restaurantQueueLength={restaurantQueue.length}
      restaurantSource={restaurantSource}
      recommendationReason={recommendationReason}
      onSwipe={swipeRestaurant}
      t={t}
    />
  );
}
