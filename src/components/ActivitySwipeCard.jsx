import React from 'react';

export default function ActivitySwipeCard({
  currentActivity,
  currentActivityIndex,
  activityQueueLength,
  onSwipe,
  selectedCount = 0,
  onBuild,
  t,
}) {
  return (
    <div className="dayguide-container">
      <div className="card swipe-card">
        <h2>{t('activities.title')}</h2>
        <p className="swipe-progress">{currentActivityIndex + 1} / {activityQueueLength}</p>
        <div className="swipe-item">
          <div className="item-icon">{currentActivity.image}</div>
          <p className="card-type-label">
            {currentActivity.venueType || t(`interests.${currentActivity.category}`)}
          </p>
          <h3>{currentActivity.name}</h3>
          {currentActivity.isSample && (
            <p className="sample-badge">{t('activities.sampleBadge')}</p>
          )}
          {!currentActivity.isSample && (
            <div className="api-source-banner api-source-banner--live">
              {t('restaurants.liveResults')}
            </div>
          )}
          <p className="rating">⭐ {currentActivity.rating}</p>
          {/* Sample activities are London demo venues, so we never claim a real
              nearby distance; live activity results (none yet) would show one. */}
          {currentActivity.isSample ? (
            <p className="details sample-note">{t('activities.sampleNote')}</p>
          ) : (
            <p className="details">{t('activities.kmAway', { distance: currentActivity.distance })}</p>
          )}
          <p className="details">{t('activities.duration', { duration: currentActivity.duration })}</p>
          <p className="address">{currentActivity.address}</p>
          {currentActivity.mapsUrl && (
            <a
              className="maps-link"
              href={currentActivity.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('restaurants.openInMaps', 'Open in Maps')}
            </a>
          )}
        </div>
        <div className="swipe-buttons">
          <button onClick={() => onSwipe(false)} className="btn-reject">{t('activities.skip')}</button>
          <button onClick={() => onSwipe(true)} className="btn-accept">{t('activities.yes')}</button>
        </div>
        {selectedCount > 0 && (
          <button onClick={onBuild} className="btn-secondary discovery-build">
            {t('discovery.buildPicks', { count: selectedCount })}
          </button>
        )}
      </div>
    </div>
  );
}
