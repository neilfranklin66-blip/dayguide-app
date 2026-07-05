import React from 'react';
import TimelineHeaderSummary from './TimelineHeaderSummary';
import TimelineList from './TimelineList';
import TimelineActionButtons from './TimelineActionButtons';

export default function TimelineCard({
  isOverTime,
  availableTime,
  dayNarrative,
  hasTimelineItems,
  selectedDate,
  timeline,
  onDurationChange,
  onStartOver,
  onShare,
  t,
}) {
  return (
    <div className="dayguide-container">
      <div className="card timeline-card">
        <TimelineHeaderSummary
          isOverTime={isOverTime}
          availableTime={availableTime}
          dayNarrative={dayNarrative}
          hasTimelineItems={hasTimelineItems}
          selectedDate={selectedDate}
          t={t}
        />
        <TimelineList
          timeline={timeline}
          onDurationChange={onDurationChange}
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
