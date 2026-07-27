import React from 'react';
import TimelineHeaderSummary from './TimelineHeaderSummary';
import TimelineList from './TimelineList';
import TimelineActionButtons from './TimelineActionButtons';
import TravelEstimateNotice from './TravelEstimateNotice';

export default function TimelineCard({
  timeBudget,
  dayNarrative,
  hasTimelineItems,
  selectedDate,
  timeline,
  onDurationChange,
  onStartOver,
  onShare,
  travelPreferences,
  hasHardAnchor = false,
  t,
}) {
  return (
    <div className="dayguide-container">
      <div className="card timeline-card">
        <TimelineHeaderSummary
          timeBudget={timeBudget}
          dayNarrative={dayNarrative}
          hasTimelineItems={hasTimelineItems}
          selectedDate={selectedDate}
          t={t}
        />
        {hasTimelineItems && (
          <TravelEstimateNotice
            hasHardAnchor={hasHardAnchor}
            travelPreferences={travelPreferences}
            t={t}
          />
        )}
        <TimelineList
          timeline={timeline}
          onDurationChange={onDurationChange}
          travelPreferences={travelPreferences}
          t={t}
        />
        <TimelineActionButtons
          onStartOver={onStartOver}
          onShare={onShare}
          t={t}
        />
      </div>
    </div>
  );
}
