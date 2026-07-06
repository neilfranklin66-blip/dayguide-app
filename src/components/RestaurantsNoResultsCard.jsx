import React from 'react';

export default function RestaurantsNoResultsCard({
  hasCuisine,
  hasPrice,
  hasFilters,
  nearestHint,
  onShowAllNearby,
  onRemoveCuisineFilter,
  onRemovePriceFilter,
  onSkip,
  t,
}) {
  return (
    <div className="dayguide-container">
      <div className="card no-results-card">
        <div className="no-results-icon">🍽️</div>
        <h2>{t('restaurants.noResultsTitle')}</h2>
        <p className="no-results-msg">
          {hasFilters ? t('restaurants.noResultsFiltered') : t('restaurants.noResultsArea')}
        </p>
        {nearestHint && (
          <div className="no-results-hint">
            {t('restaurants.nearestHint', { name: nearestHint.name, distance: nearestHint.distance })}
          </div>
        )}
        <div className="no-results-actions">
          {hasFilters && (
            <button onClick={onShowAllNearby} className="btn-primary">
              {t('restaurants.showAllNearby')}
            </button>
          )}
          {hasCuisine && hasPrice && (
            <button onClick={onRemoveCuisineFilter} className="btn-secondary">
              {t('restaurants.removeCuisineFilter')}
            </button>
          )}
          {hasPrice && (
            <button onClick={onRemovePriceFilter} className="btn-secondary">
              {t('restaurants.removePriceFilter')}
            </button>
          )}
          <button onClick={onSkip} className="btn-secondary">
            {t('restaurants.skipAndContinue')}
          </button>
        </div>
      </div>
    </div>
  );
}
