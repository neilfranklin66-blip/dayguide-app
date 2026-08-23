import React from 'react';
import LivePlaceCard from './LivePlaceCard';

export default function ActivitySwipeCard({
  currentActivity,
  currentActivityIndex,
  activityQueueLength,
  activitySource,
  onSwipe,
  locale,
  t,
}) {
  return (
    <LivePlaceCard
      place={currentActivity}
      kind="activity"
      sectionTitle={t('discovery.activities')}
      currentIndex={currentActivityIndex}
      queueLength={activityQueueLength}
      source={activitySource}
      onSwipe={onSwipe}
      locale={locale}
      t={t}
    />
  );
}
