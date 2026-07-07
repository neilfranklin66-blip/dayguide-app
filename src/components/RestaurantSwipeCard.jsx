import React from 'react';
import { getCuisineEmoji, SOURCE_BANNER_KEY } from '../config/dayGuideOptions';

export default function RestaurantSwipeCard({
  currentRestaurant,
  currentRestaurantIndex,
  restaurantQueueLength,
  restaurantSource,
  recommendationReason,
  onSwipe,
  t,
}) {
  return (
    <div className="dayguide-container">
      <div className="card swipe-card">
        <h2>{t('restaurants.title')}</h2>
        <p className="swipe-progress">{currentRestaurantIndex + 1} / {restaurantQueueLength}</p>
        {restaurantSource && SOURCE_BANNER_KEY[restaurantSource] && (
          <div className={`api-source-banner api-source-banner--${restaurantSource === 'live' ? 'live' : 'warning'}`}>
            {t(`restaurants.${SOURCE_BANNER_KEY[restaurantSource]}`)}
          </div>
        )}
        <div className="swipe-item">
          <div className="restaurant-img-wrapper">
            <img
              src={currentRestaurant.image}
              alt={currentRestaurant.name}
              className="restaurant-img"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
          {currentRestaurant.cuisine.length > 0 && (
            <p className="card-type-label">
              {getCuisineEmoji(currentRestaurant.cuisine)}&nbsp;
              {currentRestaurant.cuisine.map(c => t(`cuisine.${c}`)).join(' · ')}
            </p>
          )}
          <h3>{currentRestaurant.name}</h3>
          {currentRestaurant.city && <p className="city-tag">📍 {currentRestaurant.city}</p>}
          <div className="guide-note">
            <p className="guide-note-label">{t('restaurants.whyThisFits', 'Why this fits')}</p>
            <p className="guide-note-text">{recommendationReason}</p>
          </div>
          <div className="place-facts">
            {typeof currentRestaurant.rating === 'number' && (
              <div className="place-fact">
                <span className="place-fact-label">{t('restaurants.ratingLabel', 'Rating')}</span>
                <span className="place-fact-value">⭐ {currentRestaurant.rating} / 5</span>
              </div>
            )}
            {currentRestaurant.priceRange && (
              <div className="place-fact">
                <span className="place-fact-label">{t('restaurants.priceLabel', 'Price level')}</span>
                <span className="place-fact-value">💷 {currentRestaurant.priceRange}</span>
              </div>
            )}
            {typeof currentRestaurant.distance === 'number' && (
              <div className="place-fact">
                <span className="place-fact-label">{t('restaurants.distanceLabel', 'Distance')}</span>
                <span className="place-fact-value">{t('restaurants.kmAway', { distance: currentRestaurant.distance })}</span>
              </div>
            )}
            {typeof currentRestaurant.duration === 'number' && (
              <div className="place-fact">
                <span className="place-fact-label">{t('restaurants.timeLabel', 'Time to allow')}</span>
                <span className="place-fact-value">{t('restaurants.duration', { duration: currentRestaurant.duration })}</span>
              </div>
            )}
          </div>
          <p className="address">{currentRestaurant.address}</p>
          {currentRestaurant.mapsUrl && (
            <a
              className="maps-link"
              href={currentRestaurant.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('restaurants.openInMaps', 'Open in Maps')}
            </a>
          )}
        </div>
        <div className="swipe-buttons">
          <button onClick={() => onSwipe(false)} className="btn-reject">{t('restaurants.skip')}</button>
          <button onClick={() => onSwipe(true)} className="btn-accept">{t('restaurants.yes')}</button>
        </div>
      </div>
    </div>
  );
}
