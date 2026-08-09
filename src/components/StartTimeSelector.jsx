import React from 'react';

export default function StartTimeSelector({ startTime, onChange, t }) {
  const hour = Math.floor(startTime);
  const minutes = Math.round((startTime % 1) * 60);
  const setMinutes = value => onChange(hour + value / 60);

  return (
    <div className="time-selector start-time-selector">
      <label htmlFor="interests-start-time">{t('interests.startTimeLabel')}</label>
      <input id="interests-start-time" type="time" step="900" value={`${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`}
        onChange={e => {
          const [hours, minutes] = e.target.value.split(':').map(Number);
          onChange(hours + minutes / 60);
        }} className="time-input" />
      <div className="minute-shortcuts" aria-label={t('interests.minuteShortcuts', 'Quick minutes')}>
        {[0, 15, 30, 45].map(value => (
          <button
            key={value}
            type="button"
            className={minutes === value ? 'minute-shortcut selected' : 'minute-shortcut'}
            onClick={() => setMinutes(value)}
          >
            :{String(value).padStart(2, '0')}
          </button>
        ))}
      </div>
    </div>
  );
}
