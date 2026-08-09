import React from 'react';
import {
  ACTIVITY_UNAVAILABLE_REASONS,
  DEFAULT_UNAVAILABLE_SOURCE,
} from '../config/dayGuideOptions';

// A provider or location failure is different from searching successfully and
// finding no matches. This card tells the truth and never fills the gap with
// sample venues.
export default function ActivitiesUnavailableCard({ activitySource, onRetry, onSkip, t }) {
  const reason =
    ACTIVITY_UNAVAILABLE_REASONS[activitySource] ??
    ACTIVITY_UNAVAILABLE_REASONS[DEFAULT_UNAVAILABLE_SOURCE];
  const showRetry = reason.canRetry && typeof onRetry === 'function';

  return (
    <div className="dayguide-container">
      <div className="card no-results-card">
        <div className="no-results-icon">{reason.icon}</div>
        <h2>{t('activities.unavailableTitle')}</h2>
        <p className="no-results-msg">{t(`activities.${reason.messageKey}`)}</p>
        <p className="no-results-hint">{t(`activities.${reason.hintKey}`)}</p>
        <div className="no-results-guidance">
          <p className="no-results-guidance-text">
            {t(`activities.${reason.guidanceKey}`)}
          </p>
        </div>
        <div className="no-results-actions">
          {showRetry && (
            <button onClick={() => onRetry()} className="btn-primary">
              {t('activities.tryAgain')}
            </button>
          )}
          <button
            onClick={() => onSkip()}
            className={showRetry ? 'btn-secondary' : 'btn-primary'}
          >
            {t('activities.skipAndContinue')}
          </button>
        </div>
      </div>
    </div>
  );
}
