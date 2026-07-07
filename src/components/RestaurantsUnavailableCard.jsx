import React from 'react';
import { SOURCE_BANNER_KEY } from '../config/dayGuideOptions';

// Shown when the live restaurant search failed outright (no key, quota,
// no location, network error). Tells the user why real nearby restaurants
// can't be shown instead of passing off mock venues as recommendations.
export default function RestaurantsUnavailableCard({ restaurantSource, onSkip, t }) {
  const reasonKey = SOURCE_BANNER_KEY[restaurantSource] || SOURCE_BANNER_KEY.error;

  return (
    <div className="dayguide-container">
      <div className="card no-results-card">
        <div className="no-results-icon">📡</div>
        <h2>{t('restaurants.unavailableTitle')}</h2>
        <p className="no-results-msg">{t(`restaurants.${reasonKey}`)}</p>
        <div className="no-results-actions">
          <button onClick={onSkip} className="btn-primary">
            {t('restaurants.skipAndContinue')}
          </button>
        </div>
      </div>
    </div>
  );
}
