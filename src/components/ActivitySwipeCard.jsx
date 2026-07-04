import React from 'react';

export default function ActivitySwipeCard({
  currentActivity,
  currentActivityIndex,
  activityQueueLength,
  onSwipe,
  t,
}) {
  return (
    <div className="dayguide-container">
      <div className="card swipe-card">
        <h2>{t('activities.title')}</h2>
        <p className="swipe-progress">{currentActivityIndex + 1} / {activityQueueLength}</p>
        <div className="swipe-item">
          <div className="item-icon">{currentActivity.image}</div>
          <p className="card-type-label">{t(`interests.${currentActivity.category}`)}</p>
          <h3>{currentActivity.name}</h3>
          <p className="rating">⭐ {currentActivity.rating}</p>
          <p className="details">{t('activities.kmAway', { distance: currentActivity.distance })}</p>
          <p className="details">{t('activities.duration', { duration: currentActivity.duration })}</p>
          <p className="address">{currentActivity.address}</p>
        </div>
        <div className="swipe-buttons">
          <button onClick={() => onSwipe(false)} className="btn-reject">{t('activities.skip')}</button>
          <button onClick={() => onSwipe(true)} className="btn-accept">{t('activities.yes')}</button>
        </div>
      </div>
    </div>
  );
}
