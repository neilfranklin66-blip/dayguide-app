import React from 'react';
import LivePlaceCard from './LivePlaceCard';

export default function RestaurantSwipeCard({
  currentRestaurant,
  currentRestaurantIndex,
  restaurantQueueLength,
  restaurantSource,
  onSwipe,
  locale,
  t,
}) {
  return (
    <LivePlaceCard
      place={currentRestaurant}
      kind="food"
      sectionTitle={t('discovery.food')}
      currentIndex={currentRestaurantIndex}
      queueLength={restaurantQueueLength}
      source={restaurantSource}
      onSwipe={onSwipe}
      locale={locale}
      t={t}
    />
  );
}
