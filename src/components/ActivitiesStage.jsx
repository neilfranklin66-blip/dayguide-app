import React from 'react';
import ActivitiesNoResultsCard from './ActivitiesNoResultsCard';
import NoMoreActivitiesCard from './NoMoreActivitiesCard';
import ActivitySwipeCard from './ActivitySwipeCard';

export default function ActivitiesStage({
  activityQueue,
  currentActivityIndex,
  selectedInterests,
  goToActivities,
  setStage,
  continueAfterActivities,
  swipeActivity,
  t,
}) {
  const currentActivity = activityQueue[currentActivityIndex];

  if (activityQueue.length === 0) {
    return (
      <ActivitiesNoResultsCard
        hasSelectedInterests={selectedInterests.length > 0}
        onShowAll={() => goToActivities([])}
        onBackToInterests={() => setStage('interests')}
        t={t}
      />
    );
  }

  if (!currentActivity) {
    return (
      <NoMoreActivitiesCard
        onContinue={continueAfterActivities}
        t={t}
      />
    );
  }

  return (
    <ActivitySwipeCard
      currentActivity={currentActivity}
      currentActivityIndex={currentActivityIndex}
      activityQueueLength={activityQueue.length}
      onSwipe={swipeActivity}
      t={t}
    />
  );
}
