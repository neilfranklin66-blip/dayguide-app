import React from 'react';

export default function StartTimeSelector({ startTime, onChange, t }) {
  return (
    <div className="time-selector">
      <label>{t('interests.startTimeLabel')}</label>
      <input type="time" value={`${String(Math.floor(startTime)).padStart(2, '0')}:${String(Math.round((startTime % 1) * 60)).padStart(2, '0')}`}
        onChange={e => {
          const [hours, minutes] = e.target.value.split(':').map(Number);
          onChange(hours + minutes / 60);
        }} className="time-input" />
    </div>
  );
}
