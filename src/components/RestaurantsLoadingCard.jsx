import React from 'react';

export default function RestaurantsLoadingCard({ t }) {
  return (
    <div className="dayguide-container">
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="restaurants-loading-icon">🔍</div>
        <h2>{t('restaurants.searching')}</h2>
      </div>
    </div>
  );
}
