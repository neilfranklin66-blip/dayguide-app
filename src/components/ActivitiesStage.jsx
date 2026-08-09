import React from 'react';
import ActivitiesNoResultsCard from './ActivitiesNoResultsCard';
import ActivitiesUnavailableCard from './ActivitiesUnavailableCard';
import NoMoreActivitiesCard from './NoMoreActivitiesCard';
import ActivitySwipeCard from './ActivitySwipeCard';
import { getRouteAfterActivities } from '../engines/itineraryRouteEngine';
import { LIVE_ACTIVITY_FAILURE_SOURCES } from '../config/dayGuideOptions';

export default function ActivitiesStage({
  activityQueue,
  isActivitiesLoading = false,
  activitySource = null,
  currentActivityIndex,
  selectedInterests,
  goToActivities,
  setStage,
  continueAfterActivities,
  startWith,
  swipeActivity,
  selectedActivities = [],
  onBuild,
  isLiveDiscovery = false,
  onShowAllLive,
  onBackToDiscovery,
  onRetry,
  onSetStart,
  t,
}) {
  if (isActivitiesLoading) {
    return (
      <div className="dayguide-container">
        <div className="card loading"><h2>{t('discovery.searchingActivities')}</h2></div>
      </div>
    );
  }

  const currentActivity = activityQueue[currentActivityIndex];

  if (activityQueue.length === 0) {
    if (LIVE_ACTIVITY_FAILURE_SOURCES.has(activitySource)) {
      return (
        <ActivitiesUnavailableCard
          activitySource={activitySource}
          onRetry={onRetry}
          onSetStart={onSetStart}
          onSkip={() => continueAfterActivities([])}
          t={t}
        />
      );
    }
    if (isLiveDiscovery) {
      return (
        <ActivitiesNoResultsCard
          hasSelectedInterests={selectedInterests.length > 0}
          onShowAll={() => onShowAllLive?.()}
          onBackToInterests={() => onBackToDiscovery?.()}
          isLiveDiscovery
          t={t}
        />
      );
    }
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
        nextRoute={getRouteAfterActivities({ startWith })}
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
      selectedCount={selectedActivities.length}
      onBuild={onBuild}
      t={t}
    />
  );
}
