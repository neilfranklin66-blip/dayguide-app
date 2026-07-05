import React from 'react';

export default function TimelineHeaderSummary({ isOverTime, availableTime, dayNarrative, hasTimelineItems, selectedDate, t }) {
  return (
    <>
      <h2>{t('timeline.title')}</h2>
      {selectedDate && (
        <p className="timeline-date">📅 {selectedDate}</p>
      )}
      {isOverTime && (
        <p className="over-time-warning">
          {t('timeline.overTime', { hours: availableTime })}
        </p>
      )}
      {dayNarrative && hasTimelineItems && (
        <div className="guide-note">
          <p className="guide-note-label">{t('timeline.dayGuideLabel', 'Day guide')}</p>
          <p className="guide-note-text">{dayNarrative}</p>
        </div>
      )}
    </>
  );
}
