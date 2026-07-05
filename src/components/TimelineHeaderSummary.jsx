import React from 'react';
import { formatDurationLabel } from '../engines/timelineEngine';

export default function TimelineHeaderSummary({ timeBudget, dayNarrative, hasTimelineItems, selectedDate, t }) {
  return (
    <>
      <h2>{t('timeline.title')}</h2>
      {selectedDate && (
        <p className="timeline-date">📅 {selectedDate}</p>
      )}
      {timeBudget && (
        <>
          <p className="time-budget-summary">
            {t('timeline.budget.planned', {
              planned: formatDurationLabel(timeBudget.plannedHours),
              available: formatDurationLabel(timeBudget.availableHours),
            })}
          </p>
          {timeBudget.isOverBudget ? (
            <p className="over-time-warning">
              {t('timeline.budget.over', { amount: formatDurationLabel(timeBudget.differenceHours) })}
            </p>
          ) : (
            <p className="time-budget-within">
              {timeBudget.isExactFit
                ? t('timeline.budget.exact')
                : t('timeline.budget.within', { amount: formatDurationLabel(timeBudget.differenceHours) })}
            </p>
          )}
        </>
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
