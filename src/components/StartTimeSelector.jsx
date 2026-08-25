import React, { useEffect, useState } from 'react';

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = [0, 15, 30, 45];
const QUICK_OPTIONS = [
  { hoursAhead: 0, key: 'timeNow' },
  { hoursAhead: 1, key: 'timeIn1Hour' },
  { hoursAhead: 2, key: 'timeIn2Hours' },
];

const isValidTime = startTime => Number.isFinite(startTime) && startTime >= 0 && startTime < 24;

function getParts(startTime) {
  const totalMinutes = Math.round(startTime * 60) % (24 * 60);
  return { hour24: Math.floor(totalMinutes / 60), minute: totalMinutes % 60 };
}

function formatTime(startTime) {
  const { hour24, minute } = getParts(startTime);
  return `${hour24 % 12 || 12}:${String(minute).padStart(2, '0')} ${hour24 >= 12 ? 'pm' : 'am'}`;
}

function getQuarterHourFromNow(hoursAhead) {
  const next = new Date();
  next.setSeconds(0, 0);
  next.setHours(next.getHours() + hoursAhead);
  next.setMinutes(Math.ceil(next.getMinutes() / 15) * 15);
  return next.getHours() + next.getMinutes() / 60;
}

export default function StartTimeSelector({
  startTime,
  onChange,
  t,
  heading,
  hideHeading = false,
  showQuickLabel = true,
  summary = null,
}) {
  const hasTime = isValidTime(startTime);
  const parts = hasTime ? getParts(startTime) : null;
  const [period, setPeriod] = useState(parts?.hour24 >= 12 ? 'afternoon' : parts ? 'morning' : null);
  const [pendingHour, setPendingHour] = useState(parts?.hour24 ?? null);

  useEffect(() => {
    if (!hasTime) return;
    const next = getParts(startTime);
    setPeriod(next.hour24 >= 12 ? 'afternoon' : 'morning');
    setPendingHour(next.hour24);
  }, [hasTime, startTime]);

  const setQuickTime = hoursAhead => {
    const value = getQuarterHourFromNow(hoursAhead);
    const next = getParts(value);
    setPeriod(next.hour24 >= 12 ? 'afternoon' : 'morning');
    setPendingHour(next.hour24);
    onChange(value);
  };
  const choosePeriod = nextPeriod => {
    setPeriod(nextPeriod);
    setPendingHour(null);
  };
  const hourTo24 = hour12 => (period === 'afternoon' ? (hour12 % 12) + 12 : hour12 % 12);
  const hourEnabled = hour =>
    period && (period !== 'morning' || (hour >= 6 && hour <= 11));
  const chooseHour = hour => setPendingHour(hourTo24(hour));
  const chooseMinute = minute => {
    if (pendingHour == null) return;
    onChange(pendingHour + minute / 60);
  };
  const selectedHour = parts?.hour24 % 12 || 12;
  const selectedMinute = parts?.minute;
  const displayedSummary = summary ?? (hasTime ? formatTime(startTime) : 'No start time chosen yet');

  return (
    <section className="start-time-selector" aria-labelledby={hideHeading ? undefined : 'start-time-heading'}>
      {!hideHeading && <h3 id="start-time-heading">{heading ?? t('interests.startTimeLabel')}</h3>}
      <div className="start-time-section">
        {showQuickLabel && <p className="start-time-label">{t('interests.quickTimeLabel')}</p>}
        <div className="start-time-quick-actions">
          {QUICK_OPTIONS.map(({ hoursAhead, key }) => (
            <button key={key} type="button" className="start-time-option" onClick={() => setQuickTime(hoursAhead)}>{t(`interests.${key}`)}</button>
          ))}
        </div>
      </div>
      <div className="start-time-section">
        <p className="start-time-label">{t('interests.pickTime')}</p>
        <div className="start-time-periods" aria-label={t('interests.periodLabel')}>
          <button type="button" className="start-time-option" aria-pressed={period === 'morning'} onClick={() => choosePeriod('morning')}>{t('interests.morning')}</button>
          <button type="button" className="start-time-option" aria-pressed={period === 'afternoon'} onClick={() => choosePeriod('afternoon')}>{t('interests.afternoonEvening')}</button>
        </div>
      </div>
      <div className="start-time-section">
        <p className="start-time-label">{t('interests.hourLabel')}</p>
        <div className="start-time-hours">
          {HOURS.map(hour => (
            <button key={hour} type="button" className="start-time-option" aria-pressed={hasTime && selectedHour === hour} disabled={!hourEnabled(hour)} onClick={() => chooseHour(hour)}>{hour}</button>
          ))}
        </div>
      </div>
      <div className="start-time-section">
        <p className="start-time-label">{t('interests.minuteLabel')}</p>
        <div className="start-time-minutes">
          {MINUTES.map(minuteOption => (
            <button key={minuteOption} type="button" className="start-time-option" aria-pressed={hasTime && selectedMinute === minuteOption} disabled={pendingHour == null} onClick={() => chooseMinute(minuteOption)}>:{String(minuteOption).padStart(2, '0')}</button>
          ))}
        </div>
      </div>
      <output className="start-time-summary" aria-live="polite">
        <strong>{displayedSummary}</strong>
        {!summary && <span>{t('interests.leavingAtThisTime')}</span>}
      </output>
    </section>
  );
}
