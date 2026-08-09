import React, { useEffect, useState } from 'react';

const formatTime = startTime => {
  const totalMinutes = Math.round(startTime * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const parseTime = value => {
  const compact = value.replace(/\s/g, '');
  const match = compact.match(/^(\d{1,2}):(\d{2})$/);
  const digits = compact.match(/^\d{3,4}$/);
  const hours = match ? Number(match[1]) : digits ? Number(compact.slice(0, -2)) : null;
  const minutes = match ? Number(match[2]) : digits ? Number(compact.slice(-2)) : null;

  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours > 23 || minutes > 59) {
    return null;
  }

  return hours + minutes / 60;
};

export default function StartTimeSelector({ startTime, onChange, t }) {
  const formattedStartTime = formatTime(startTime);
  const [value, setValue] = useState(formattedStartTime);

  useEffect(() => {
    setValue(formattedStartTime);
  }, [formattedStartTime]);

  const applyTime = () => {
    const parsed = parseTime(value);
    if (parsed == null) {
      setValue(formattedStartTime);
      return;
    }
    onChange(parsed);
    setValue(formatTime(parsed));
  };

  return (
    <div className="time-selector start-time-selector">
      <label htmlFor="interests-start-time">{t('interests.startTimeLabel')}</label>
      <input
        id="interests-start-time"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength="5"
        placeholder="09:30"
        value={value}
        onChange={event => setValue(event.target.value)}
        onBlur={applyTime}
        onKeyDown={event => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
        className="time-input"
      />
    </div>
  );
}
