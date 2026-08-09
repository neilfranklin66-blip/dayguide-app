import React from 'react';
import TimelineCard from './TimelineCard';
import { buildDayNarrative } from '../utils/dayNarrative';
import { getTimeBudgetStatus } from '../engines/timelineEngine';

export default function TimelineStage({
  timeline,
  availableTime,
  selectedDate,
  updateActivityDuration,
  removeTimelineItem,
  resetState,
  setShowQR,
  travelPreferences,
  hasHardAnchor = false,
  geographicalPlanning = null,
  geographicalAssessment = null,
  t,
}) {
  const timeBudget = getTimeBudgetStatus(timeline, availableTime);
  const narrativeCopy = {
    foodStop: t('timeline.dayNarrative.foodStop', 'food'),
    activityStop: t('timeline.dayNarrative.activityStop', 'activity'),
    otherStop: t('timeline.dayNarrative.otherStop', 'stop'),
    template: t('timeline.dayNarrative.template', '{count}-stop plan: {sequence}.'),
    listTwoSeparator: t('timeline.dayNarrative.listTwoSeparator', ', then '),
    listMiddleSeparator: t('timeline.dayNarrative.listMiddleSeparator', ', '),
    listFinalSeparator: t('timeline.dayNarrative.listFinalSeparator', ', then '),
  };
  const dayNarrative = buildDayNarrative(
    { timeline },
    narrativeCopy,
  );

  return (
    <TimelineCard
      timeBudget={timeBudget}
      dayNarrative={dayNarrative}
      hasTimelineItems={timeline.length > 0}
      selectedDate={selectedDate}
      timeline={timeline}
      onDurationChange={updateActivityDuration}
      onRemoveItem={removeTimelineItem}
      onStartOver={resetState}
      onShare={() => setShowQR(true)}
      travelPreferences={travelPreferences}
      hasHardAnchor={hasHardAnchor}
      geographicalPlanning={geographicalPlanning}
      geographicalAssessment={geographicalAssessment}
      t={t}
    />
  );
}

