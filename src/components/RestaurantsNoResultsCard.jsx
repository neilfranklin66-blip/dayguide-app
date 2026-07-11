import React from 'react';

export default function RestaurantsNoResultsCard({
  isExhaustedUnseen = false,
  hasCuisine,
  hasPrice,
  hasFilters,
  onShowAllNearby,
  onRemoveCuisineFilter,
  onRemovePriceFilter,
  onSkip,
  t,
}) {
  // Two distinct, truthful stories share this card: the search genuinely found
  // no suitable matches, or it found matches that were all already shown or
  // selected. Any surviving filter-loosening action still helps in both cases,
  // so only the icon, title and message change.
  const title = isExhaustedUnseen
    ? t('restaurants.noUnseenResultsTitle')
    : t('restaurants.noResultsTitle');
  const message = isExhaustedUnseen
    ? t('restaurants.noUnseenResults')
    : hasFilters
      ? t('restaurants.noResultsFiltered')
      : t('restaurants.noResultsArea');

  return (
    <div className="dayguide-container">
      <div className="card no-results-card">
        <div className="no-results-icon">{isExhaustedUnseen ? '👀' : '🍽️'}</div>
        <h2>{title}</h2>
        <p className="no-results-msg">{message}</p>
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
