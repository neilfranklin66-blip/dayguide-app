import React from 'react';

export default function NoMoreRestaurantsCard({ onContinue, nextRoute, t }) {
  const continueLabel = nextRoute === 'activities'
    ? t('restaurants.continueToActivities')
    : t('restaurants.buildItinerary');

  return (
    <div className="dayguide-container">
      <div className="card">
        <h2>{t('restaurants.noMore')}</h2>
        <button onClick={onContinue} className="btn-primary">
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
