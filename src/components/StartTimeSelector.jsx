import React from 'react';
import DirectTimeInput from './DirectTimeInput';

export default function StartTimeSelector({ startTime, onChange, t }) {
  const totalMinutes = Math.round(startTime * 60);
  const value = `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;

  return (
    <div className="start-time-selector">
      <DirectTimeInput
        id="interests-start-time"
        label={t('interests.startTimeLabel')}
        value={value}
        onChange={time => {
          const [hours, minutes] = time.split(':').map(Number);
          onChange(hours + minutes / 60);
        }}
      />
    </div>
  );
}
