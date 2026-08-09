import React from 'react';

export default function NoMoreRestaurantsCard({ onContinue, onShowMore, hasMore = false, nextRoute, t }) {
  const continueLabel = nextRoute === 'activities'
    ? t('restaurants.continueToActivities')
    : t('restaurants.buildItinerary');

  return (
    <div className="dayguide-container">
      <div className="card">
        <h2>{t('restaurants.noMore')}</h2>
        {hasMore && (
          <button onClick={onShowMore} className="btn-secondary discovery-build">
            {t('restaurants.showMore')}
          </button>
        )}
        <button onClick={() => onContinue()} className="btn-primary">
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
