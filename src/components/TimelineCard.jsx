import React from 'react';
import TimelineHeaderSummary from './TimelineHeaderSummary';
import TimelineList from './TimelineList';
import TimelineActionButtons from './TimelineActionButtons';
import TravelEstimateNotice from './TravelEstimateNotice';
import GeographicalPlanSummary from './GeographicalPlanSummary';

export default function TimelineCard({
  timeBudget,
  dayNarrative,
  hasTimelineItems,
  selectedDate,
  timeline,
  onDurationChange,
  onRemoveItem,
  onStartOver,
  onShare,
  travelPreferences,
  hasHardAnchor = false,
  geographicalPlanning = null,
  geographicalAssessment = null,
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
        {timeline.length > 1 && (
          <TravelEstimateNotice
            hasHardAnchor={hasHardAnchor}
            travelPreferences={travelPreferences}
            t={t}
          />
        )}
        <GeographicalPlanSummary
          planningInput={geographicalPlanning}
          planningAssessment={geographicalAssessment}
          t={t}
        />
        <TimelineList
          timeline={timeline}
          onDurationChange={onDurationChange}
          onRemoveItem={onRemoveItem}
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
