import React from 'react';

function WelcomeStage({ t, locationLoading, locationError, position, refreshLocation, onStartPlanning, onExploreExperienceReset, savedPlanSummary, onResume }) {
  return (
    <div className="dayguide-container welcome">
      <div className="welcome-card card">
        <div className="welcome-intro">
          <span className="welcome-mark" aria-hidden="true">🗺️</span>
          <h1>DayGuide</h1>
          <p className="welcome-tagline">{t('welcome.tagline')}</p>
          <p className="subtitle">{t('welcome.subtitle')}</p>
        </div>
        <div className={`location-panel ${locationError ? 'location-panel--error' : ''}`}>
          {locationLoading && <p className="location-status" role="status">{t('welcome.detectingLocation')}</p>}
          {!locationLoading && locationError && (
            <p className="location-status location-status--error" role="alert">
              <span aria-hidden="true">⚠️</span>
              <span>{t(locationError)}</span>
            </p>
          )}
          {!locationLoading && position && (
            <p className="location-status">
              📍 {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              <span className="location-accuracy"> ±{Math.round(position.accuracy)}m</span>
            </p>
          )}
          <button onClick={refreshLocation} className="btn-refresh">{t('welcome.refreshLocation')}</button>
        </div>
        <div className="welcome-actions">
          <button onClick={onStartPlanning} className="btn-primary">{t('welcome.startPlanning')}</button>
          {onExploreExperienceReset && (
            <button onClick={onExploreExperienceReset} className="btn-secondary welcome-experience-reset">
              {t('experienceReset.review')}
            </button>
          )}
          {savedPlanSummary && (
            <button onClick={onResume} className="btn-secondary">{t('welcome.resumePlan')}</button>
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
