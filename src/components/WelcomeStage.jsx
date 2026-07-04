import React from 'react';

function WelcomeStage({ t, locationLoading, locationError, position, refreshLocation, onStartPlanning }) {
  return (
    <div className="dayguide-container welcome">
      <div className="welcome-card card">
        <h1>🗺️ DayGuide</h1>
        <p>{t('welcome.tagline')}</p>
        <p className="subtitle">{t('welcome.subtitle')}</p>
        <div className={`location-panel ${locationError ? 'location-panel--error' : ''}`}>
          {locationLoading && <p className="location-status">{t('welcome.detectingLocation')}</p>}
          {!locationLoading && locationError && (
            <p className="location-status location-status--error">⚠️ {t(locationError)}</p>
          )}
          {!locationLoading && position && (
            <p className="location-status">
              📍 {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              <span className="location-accuracy"> ±{Math.round(position.accuracy)}m</span>
            </p>
          )}
          <button onClick={refreshLocation} className="btn-refresh">{t('welcome.refreshLocation')}</button>
        </div>
        <button onClick={onStartPlanning} className="btn-primary">{t('welcome.startPlanning')}</button>
      </div>
    </div>
  );
}

export default WelcomeStage;
