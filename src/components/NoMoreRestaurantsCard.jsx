import React from 'react';

export default function NoMoreRestaurantsCard({ onContinue, t }) {
  return (
    <div className="dayguide-container">
      <div className="card">
        <h2>{t('restaurants.noMore')}</h2>
        <button onClick={onContinue} className="btn-primary">
          {t('restaurants.buildItinerary')}
        </button>
      </div>
    </div>
  );
}
