import React, { useEffect, useRef, useState } from 'react';

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = [0, 15, 30, 45];

const fromMinutes = value => {
  if (!Number.isInteger(value) || value < 0 || value >= 24 * 60) {
    return { period: null, hour: null, minute: null };
  }

  const hour24 = Math.floor(value / 60);
  return {
    period: hour24 >= 12 ? 'pm' : 'am',
    hour: hour24 % 12 || 12,
    minute: value % 60,
  };
};

const toMinutes = ({ period, hour, minute }) => {
  if (!period || !hour || minute == null) return null;
  const hour24 = period === 'pm' ? (hour % 12) + 12 : hour % 12;
  return hour24 * 60 + minute;
};

const formatTime = value => {
  const { period, hour, minute } = fromMinutes(value);
  if (!period) return null;
  return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
};

const fallbackT = (_key, options) => options?.defaultValue ?? _key;

export default function TapTimePicker({
  value = null,
  onChange,
  onClear,
  heading,
  summaryLabel,
  t = fallbackT,
}) {
  const externalValue = Number.isInteger(value) ? value : null;
  const [selection, setSelection] = useState(() => fromMinutes(externalValue));
  const lastExternalValue = useRef(externalValue);

  useEffect(() => {
    if (lastExternalValue.current !== externalValue) {
      lastExternalValue.current = externalValue;
      setSelection(fromMinutes(externalValue));
    }
  }, [externalValue]);

  const updateSelection = change => {
    const next = { ...selection, ...change };
    setSelection(next);
    const minutes = toMinutes(next);
    if (minutes != null) onChange(minutes);
  };

  const clear = () => {
    setSelection({ period: null, hour: null, minute: null });
    onClear?.();
  };

  const formattedTime = formatTime(toMinutes(selection));

  return (
    <section className="tap-time-picker" aria-labelledby="tap-time-heading">
      <h3 id="tap-time-heading">{heading}</h3>

      <div className="start-time-section">
        <p className="start-time-label">
          {t('interests.pickTime', { defaultValue: 'Pick a time' })}
        </p>
        <div className="start-time-periods" aria-label={t('interests.periodLabel', { defaultValue: 'Morning or afternoon' })}>
          <button
            type="button"
            className="start-time-option"
            aria-pressed={selection.period === 'am'}
            onClick={() => updateSelection({ period: 'am' })}
          >
            {t('interests.morning', { defaultValue: 'Morning' })}
          </button>
          <button
            type="button"
            className="start-time-option"
            aria-pressed={selection.period === 'pm'}
            onClick={() => updateSelection({ period: 'pm' })}
          >
            {t('interests.afternoonEvening', { defaultValue: 'Afternoon / evening' })}
          </button>
        </div>
      </div>

      <div className="start-time-section">
        <p className="start-time-label">
          {t('interests.hourLabel', { defaultValue: 'Hour' })}
        </p>
        <div className="start-time-hours">
          {HOURS.map(hour => (
            <button
              key={hour}
              type="button"
              className="start-time-option"
              aria-pressed={selection.hour === hour}
              onClick={() => updateSelection({ hour })}
            >
              {hour}
            </button>
          ))}
        </div>
      </div>

      <div className="start-time-section">
        <p className="start-time-label">
          {t('interests.minuteLabel', { defaultValue: 'Minutes' })}
        </p>
        <div className="start-time-minutes">
          {MINUTES.map(minute => (
            <button
              key={minute}
              type="button"
              className="start-time-option"
              aria-pressed={selection.minute === minute}
              onClick={() => updateSelection({ minute })}
            >
              :{String(minute).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>

      <output className="start-time-summary" aria-live="polite">
        <strong>{formattedTime ?? t('planning.noDeadline', { defaultValue: 'No fixed time' })}</strong>
        <span>
          {formattedTime
            ? summaryLabel
            : t('planning.timePickerHint', {
                defaultValue: 'Choose morning or afternoon, an hour and minutes.',
              })}
        </span>
      </output>

      <button
        type="button"
        className="later-plan-option"
        aria-pressed={!formattedTime}
        onClick={clear}
      >
        {t('planning.noDeadline', { defaultValue: 'No fixed time' })}
      </button>
    </section>
  );
}
