import React from 'react';

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = [0, 15, 30, 45];
const QUICK_OPTIONS = [
  { hoursAhead: 0, key: 'timeNow' },
  { hoursAhead: 1, key: 'timeIn1Hour' },
  { hoursAhead: 2, key: 'timeIn2Hours' },
];

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

export default function StartTimeSelector({ startTime, onChange, t, heading }) {
  const { hour24, minute } = getParts(startTime);
  const selectedHour = hour24 % 12 || 12;
  const isAfternoonEvening = hour24 >= 12;

  const selectHour = hour12 => {
    const nextHour = isAfternoonEvening ? (hour12 % 12) + 12 : hour12 % 12;
    onChange(nextHour + minute / 60);
  };
  const selectMinute = nextMinute => onChange(hour24 + nextMinute / 60);
  const selectPeriod = afternoonEvening => {
    const hour12 = hour24 % 12;
    onChange((afternoonEvening ? hour12 + 12 : hour12) + minute / 60);
  };

  return (
    <section className="start-time-selector" aria-labelledby="start-time-heading">
      <h3 id="start-time-heading">
        {heading ?? t('interests.startTimeLabel')}
      </h3>

      <div className="start-time-section">
        <p className="start-time-label">{t('interests.quickTimeLabel')}</p>
        <div className="start-time-quick-actions">
          {QUICK_OPTIONS.map(({ hoursAhead, key }) => (
            <button key={key} type="button" className="start-time-option" onClick={() => onChange(getQuarterHourFromNow(hoursAhead))}>
              {t(`interests.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="start-time-section">
        <p className="start-time-label">{t('interests.pickTime')}</p>
        <div className="start-time-periods" aria-label={t('interests.periodLabel')}>
          <button type="button" className="start-time-option" aria-pressed={!isAfternoonEvening} onClick={() => selectPeriod(false)}>
            {t('interests.morning')}
          </button>
          <button type="button" className="start-time-option" aria-pressed={isAfternoonEvening} onClick={() => selectPeriod(true)}>
            {t('interests.afternoonEvening')}
          </button>
        </div>
      </div>

      <div className="start-time-section">
        <p className="start-time-label">{t('interests.hourLabel')}</p>
        <div className="start-time-hours">
          {HOURS.map(hour => (
            <button key={hour} type="button" className="start-time-option" aria-pressed={selectedHour === hour} onClick={() => selectHour(hour)}>
              {hour}
            </button>
          ))}
        </div>
      </div>

      <div className="start-time-section">
        <p className="start-time-label">{t('interests.minuteLabel')}</p>
        <div className="start-time-minutes">
          {MINUTES.map(minuteOption => (
            <button key={minuteOption} type="button" className="start-time-option" aria-pressed={minute === minuteOption} onClick={() => selectMinute(minuteOption)}>
              :{String(minuteOption).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>

      <output className="start-time-summary" aria-live="polite">
        <strong>{formatTime(startTime)}</strong>
        <span>{t('interests.leavingAtThisTime')}</span>
      </output>
    </section>
  );
}
