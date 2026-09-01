import React, { useState } from 'react';
import DateSelector from './DateSelector';
import ResolvedPlaceSelect from './ResolvedPlaceSelect';
import StartTimeSelector from './StartTimeSelector';
import {
  createPlanningInputDraft,
  finalizePlanningInput,
  isResolvedPlaceSelection,
  setDepartureTime,
  setStartSelection,
} from '../utils/planningInputWorkflow';

const fallbackT = (_key, options) => options?.defaultValue ?? _key;
const isMinuteOfDay = value => Number.isInteger(value) && value >= 0 && value < 24 * 60;

function formatMinutes(totalMinutes) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'pm' : 'am'}`;
}

function formatStartDate(dateValue) {
  const [year, month, day] = String(dateValue).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date).replace(',', '');
}

export default function PlanningInputStage({
  currentPlace = null,
  availablePlaces = [],
  initialDraft = null,
  draft: controlledDraft = null,
  onDraftChange = null,
  startPlaceControl = null,
  onComplete,
  onCancel,
  selectedDate,
  onSelectedDateChange,
  t = fallbackT,
}) {
  const effectiveDate = selectedDate ?? new Date().toISOString().slice(0, 10);
  const [internalDraft, setInternalDraft] = useState(
    initialDraft ?? createPlanningInputDraft({ departureTimeMinutes: null }),
  );
  const draft = controlledDraft ?? internalDraft;
  const updateDraft = onDraftChange ?? setInternalDraft;
  const [errors, setErrors] = useState([]);
  const hasSelectedStart = isResolvedPlaceSelection(draft.startSelection);
  const hasSelectedTime = isMinuteOfDay(draft.departureTimeMinutes);
  const helper = !hasSelectedTime && !hasSelectedStart
    ? 'Choose a start time and a start area to continue'
    : !hasSelectedStart
      ? 'Choose a start area to continue'
      : !hasSelectedTime
        ? 'Choose a start time to continue'
        : '';
  const timeSummary = hasSelectedTime
    ? `Starting ${effectiveDate === new Date().toISOString().slice(0, 10) ? 'Today' : formatStartDate(effectiveDate)} at ${formatMinutes(draft.departureTimeMinutes)}`
    : 'No start time chosen yet';

  const complete = () => {
    const result = finalizePlanningInput(draft);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    onComplete(result.value);
  };

  return (
    <div className="dayguide-container">
      <main className="card planning-input-stage" aria-label="Plan your day">
        <header className="planning-page-header">
          <button type="button" className="plan-back-control" aria-label="Back" onClick={onCancel}>‹</button>
          <h2>Plan your day</h2>
        </header>

        <section className="plan-essentials-block" aria-labelledby="plan-when-heading">
          <h3 id="plan-when-heading">When would you like to start?</h3>
          <DateSelector
            selectedDate={effectiveDate}
            onChange={onSelectedDateChange ?? (() => {})}
            t={t}
            id="planning-date"
            labelKey="planning.date"
            labelDefault="Date"
          />
          <StartTimeSelector
            startTime={hasSelectedTime ? draft.departureTimeMinutes / 60 : null}
            onChange={value => updateDraft(current => setDepartureTime(current, Math.round(value * 60)))}
            summary={timeSummary}
            hideHeading
            showQuickLabel={false}
            t={t}
          />
        </section>

        <section className="plan-start-block" aria-label="Where will you start?">
          {startPlaceControl ?? (
            <>
              <h3>Where will you start?</h3>
              <ResolvedPlaceSelect
                id="planning-start-place"
                label="Where will you start?"
                selection={draft.startSelection}
                onChange={selection => updateDraft(current => setStartSelection(current, selection))}
                currentPlace={currentPlace}
                availablePlaces={availablePlaces}
                t={t}
              />
            </>
          )}
        </section>

        {errors.length > 0 && <div role="alert"><p>Choose a start time and a start area to continue</p></div>}
        <p className="planning-continue-helper" aria-live="polite">{helper}</p>
        <button type="button" onClick={complete} className="btn-primary planning-continue" disabled={!hasSelectedTime || !hasSelectedStart}>Continue</button>
      </main>
    </div>
  );
}
