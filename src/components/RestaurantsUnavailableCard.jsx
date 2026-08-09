import React from 'react';
import {
  RESTAURANT_UNAVAILABLE_REASONS,
  DEFAULT_UNAVAILABLE_SOURCE,
} from '../config/dayGuideOptions';

// Shown when the live restaurant search could not produce real nearby results.
// It names the actual cause and, where one exists, the next step the user can
// take — rather than passing off mock venues as recommendations or flattening
// every failure into one generic apology.
export default function RestaurantsUnavailableCard({
  restaurantSource,
  onRetry,
  onSetStart,
  onSkip,
  t,
}) {
  const reason =
    RESTAURANT_UNAVAILABLE_REASONS[restaurantSource] ??
    RESTAURANT_UNAVAILABLE_REASONS[DEFAULT_UNAVAILABLE_SOURCE];

  // Only offer a retry when re-running the same search could plausibly succeed
  // and the stage actually gave us a handler to run it with.
  const showRetry = reason.canRetry && typeof onRetry === 'function';
  const needsStartingPlace =
    (restaurantSource === 'location_denied' || restaurantSource === 'no_location') &&
    typeof onSetStart === 'function';

  return (
    <div className="dayguide-container">
      <div className="card no-results-card">
        <div className="no-results-icon">{reason.icon}</div>
        <h2>{t('restaurants.unavailableTitle')}</h2>
        <p className="no-results-msg">{t(`restaurants.${reason.messageKey}`)}</p>
        <p className="no-results-hint">{t(`restaurants.${reason.hintKey}`)}</p>
        <div className="no-results-guidance">
          <h3 className="no-results-guidance-title">
            {t('restaurants.whatCanITryTitle')}
          </h3>
          <p className="no-results-guidance-text">
            {t(`restaurants.${reason.guidanceKey}`)}
          </p>
        </div>
        <div className="no-results-actions">
          {needsStartingPlace && (
            <button onClick={() => onSetStart()} className="btn-primary">
              {t('restaurants.setStartingPlace')}
            </button>
          )}
          {showRetry && (
            <button onClick={() => onRetry()} className="btn-primary">
              {t('restaurants.tryAgain')}
            </button>
          )}
          <button
            onClick={() => onSkip()}
            className={showRetry || needsStartingPlace ? 'btn-secondary' : 'btn-primary'}
          >
            {t('restaurants.skipAndContinue')}
          </button>
        </div>
      </div>
    </div>
  );
}
