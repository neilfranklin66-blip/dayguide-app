import React from 'react';

export default function AvailableTimeSelector({ availableTime, onChange, t }) {
  return (
    <div className="time-selector">
      <label>{t('interests.timeLabel')}</label>
      <input type="range" min="1" max="8" value={availableTime}
        onChange={e => onChange(parseInt(e.target.value))} className="slider" />
      <span>{t('interests.hours', { count: availableTime })}</span>
    </div>
  );
}
