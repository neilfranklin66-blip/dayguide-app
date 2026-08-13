import React from 'react';

function WelcomeStage({
  t,
  locationLoading,
  locationError,
  position,
  refreshLocation,
  onStartPlanning,
  onFindNearby,
  savedPlanSummary,
  onResume,
}) {
  return (
    <div className="dayguide-container welcome">
      <div className="welcome-card card">
        <div className="welcome-intro">
          <h1>DayGuide</h1>
          <p className="welcome-tagline">{t('welcome.tagline')}</p>
          <p className="subtitle">{t('welcome.subtitle')}</p>
        </div>
        <div className="welcome-actions">
          <button onClick={onFindNearby} className="btn-discovery">
            {t('welcome.findNearby')}
          </button>
          <p className="welcome-discovery-hint">{t('welcome.findNearbyHint')}</p>
          <button onClick={onStartPlanning} className="btn-primary">{t('welcome.startPlanning')}</button>
          {savedPlanSummary && (
            <button onClick={onResume} className="btn-secondary">{t('welcome.resumePlan')}</button>
          )}
        </div>
        <div className="welcome-location-status" aria-live="polite">
          {locationLoading && <p>{t('welcome.detectingLocation')}</p>}
          {!locationLoading && locationError && (
            <>
              <p role="alert" className="location-status-error">
                <span aria-hidden="true">!</span>
                <span>{t(locationError)}</span>
              </p>
              <button onClick={refreshLocation} className="btn-refresh">
                {t('welcome.refreshLocation')}
              </button>
            </>
          )}
          {!locationLoading && position && (
            <p>{t('welcome.locationReady', { defaultValue: 'Location ready when you need it.' })}</p>
          )}
        </div>
        {savedPlanSummary && (
          <div className="welcome-resume-summary">
            <p className="subtitle">
              {savedPlanSummary.selectedDate ? `📅 ${savedPlanSummary.selectedDate} · ` : ''}
              {t('welcome.resumePlanDetails', { count: savedPlanSummary.itemCount })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeStage;
