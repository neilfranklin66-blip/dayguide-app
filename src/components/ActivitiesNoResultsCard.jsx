import React from 'react';

export default function ActivitiesNoResultsCard({
  hasSelectedInterests,
  onShowAll,
  onBackToInterests,
  isLiveDiscovery = false,
  t,
}) {
  const backLabel = isLiveDiscovery
    ? t('discovery.changeActivity')
    : t('interests.title');

  return (
    <div className="dayguide-container">
      <div className="card no-results-card">
        <div className="no-results-icon" aria-hidden="true">Explore</div>
        <h2>{t('activities.noResultsTitle')}</h2>
        <p className="no-results-msg">{t('activities.noResults')}</p>
        <div className="no-results-actions">
          {hasSelectedInterests && (
            <button onClick={() => onShowAll()} className="btn-primary">
              {t('activities.showAll')}
            </button>
          )}
          <button
            onClick={() => onBackToInterests()}
            className={isLiveDiscovery ? 'btn-primary' : 'btn-secondary'}
          >
            {backLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
