import React, { useEffect, useState } from 'react';
import { timeInputToMinutes } from '../utils/planningInputWorkflow';

const normalizeTypedTime = value => {
  const compact = value.replace(/\s/g, '');
  if (/^\d{3,4}$/.test(compact)) {
    const hours = compact.slice(0, -2);
    const minutes = compact.slice(-2);
    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  const match = compact.match(/^(\d{1,2}):(\d{2})$/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : compact;
};

export default function DirectTimeInput({
  id,
  label,
  value,
  onChange,
  allowEmpty = false,
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const apply = () => {
    const normalized = normalizeTypedTime(draft);
    if (allowEmpty && normalized === '') {
      onChange('');
      return;
    }
    if (timeInputToMinutes(normalized) == null) {
      setDraft(value);
      return;
    }
    onChange(normalized);
    setDraft(normalized);
  };

  return (
    <div className="time-selector direct-time-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength="5"
        placeholder="09:30"
        value={draft}
        onChange={event => setDraft(event.target.value)}
        onBlur={apply}
        onKeyDown={event => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
        className="time-input"
      />
    </div>
  );
}
