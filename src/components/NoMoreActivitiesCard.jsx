import React from 'react';

export default function NoMoreActivitiesCard({ onContinue, nextRoute, t }) {
  const continueLabel = nextRoute === 'timeline'
    ? t('restaurants.buildItinerary')
    : t('activities.continueToRestaurants');

  return (
    <div className="dayguide-container">
      <div className="card">
        <h2>{t('activities.noMore')}</h2>
        <button onClick={() => onContinue()} className="btn-primary">
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
