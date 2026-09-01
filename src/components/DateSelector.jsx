import React from 'react';

export default function DateSelector({
  selectedDate,
  onChange,
  t,
  id = 'interests-date',
  labelKey = 'interests.dateLabel',
  labelDefault = 'What date do you want to plan?',
}) {
  return (
    <div className="time-selector">
      <label htmlFor={id}>
        {t(labelKey, { defaultValue: labelDefault })}
      </label>
      <input
        id={id}
        type="date"
        value={selectedDate}
        onChange={e => onChange(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        max={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
        className="date-input"
      />
    </div>
  );
}
