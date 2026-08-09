import React, { useState } from 'react';
import { createHardAnchor } from '../models/geographicalPlan';
import {
  PLACE_SELECTION_MODE,
  createPlaceSelection,
  minutesToTimeInput,
  timeInputToMinutes,
} from '../utils/planningInputWorkflow';
import DirectPlaceSearch from './DirectPlaceSearch';
import { resolvePlaceQuery } from '../api/placeResolutionApi';

const fallbackT = (_key, options) => options?.defaultValue ?? _key;

const selectionForAnchor = (anchor, currentPlace) => {
  if (!anchor) return null;
  const isCurrent =
    currentPlace?.id != null &&
    anchor.place?.id != null &&
    String(currentPlace.id) === String(anchor.place.id);

  return createPlaceSelection({
    mode: isCurrent
      ? PLACE_SELECTION_MODE.CURRENT_LOCATION
      : PLACE_SELECTION_MODE.RESOLVED_PLACE,
    place: anchor.place,
  });
};

export default function HardAnchorEditor({
  anchorId,
  initialAnchor = null,
  currentPlace = null,
  onSave,
  onCancel,
  searchPlaces = resolvePlaceQuery,
  t = fallbackT,
}) {
  const [title, setTitle] = useState(initialAnchor?.title ?? '');
  const [selection, setSelection] = useState(() =>
    selectionForAnchor(initialAnchor, currentPlace),
  );
  const [startTime, setStartTime] = useState(() =>
    minutesToTimeInput(initialAnchor?.startTimeMinutes ?? 18 * 60 + 30),
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialAnchor?.durationMinutes ?? 120,
  );
  const [arrivalBufferMinutes, setArrivalBufferMinutes] = useState(
    initialAnchor?.arrivalBufferMinutes ?? 15,
  );
  const [error, setError] = useState(null);

  const selectAnchorPlace = place => {
    setSelection(
      createPlaceSelection({
        mode: PLACE_SELECTION_MODE.RESOLVED_PLACE,
        place,
      }),
    );
    setError(null);
  };

  const useCurrentLocation = () => {
    if (currentPlace?.source !== 'current_gps') return;
    setSelection(
      createPlaceSelection({
        mode: PLACE_SELECTION_MODE.CURRENT_LOCATION,
        place: currentPlace,
      }),
    );
    setError(null);
  };

  const handleSubmit = event => {
    event.preventDefault();
    const startTimeMinutes = timeInputToMinutes(startTime);

    if (!selection || startTimeMinutes == null) {
      setError(
        t('planning.anchorPlaceTimeError', {
          defaultValue:
            'Choose a verified place and valid time for this anchor.',
        }),
      );
      return;
    }

    try {
      const anchor = createHardAnchor({
        id: initialAnchor?.id ?? anchorId,
        title,
        place: selection.place,
        startTimeMinutes,
        durationMinutes: Number(durationMinutes),
        arrivalBufferMinutes: Number(arrivalBufferMinutes),
      });
      setError(null);
      onSave(anchor);
    } catch (_) {
      setError(
        t('planning.anchorValidationError', {
          defaultValue:
            'Check the anchor title, time, duration, arrival buffer, and place.',
        }),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card hard-anchor-editor">
      <h3>
        {initialAnchor
          ? t('planning.editAnchor', { defaultValue: 'Edit fixed anchor' })
          : t('planning.addAnchor', { defaultValue: 'Add fixed anchor' })}
      </h3>
      <p className="start-order-hint">
        {t('planning.anchorLockExplanation', {
          defaultValue:
            'DayGuide may plan around this commitment but may never move it.',
        })}
      </p>

      <div className="time-selector">
        <label htmlFor={`${anchorId}-title`}>
          {t('planning.commitmentName', {
            defaultValue: 'Commitment name',
          })}
        </label>
        <input
          id={`${anchorId}-title`}
          value={title}
          onChange={event => setTitle(event.target.value)}
          className="time-input"
        />
      </div>

      <DirectPlaceSearch
        id={`${anchorId}-place`}
        titleKey="planning.anchorSearchTitle"
        titleDefault="Where do you need to be?"
        hintKey="planning.anchorSearchHint"
        hintDefault="Search for a place, address, postcode or ZIP code."
        labelKey="planning.anchorSearchLabel"
        labelDefault="Place, address, postcode or ZIP code"
        placeholderKey="planning.anchorSearchPlaceholder"
        placeholderDefault="For example: Northampton Museum or NN1 1DP"
        selectedPlace={selection?.place ?? null}
        selectedKey="planning.anchorPlaceSelected"
        selectedDefault="This commitment is at {{name}}."
        selectKey="planning.selectAnchorPlace"
        selectDefault="Use {{name}} for this commitment"
        onSelect={selectAnchorPlace}
        secondaryAction={
          currentPlace?.source === 'current_gps'
            ? {
                key: 'planning.useCurrentAnchor',
                name: currentPlace.name,
                defaultValue: `Use my current location — ${currentPlace.name}`,
                onClick: useCurrentLocation,
              }
            : null
        }
        embedded
        searchPlaces={searchPlaces}
        t={t}
      />

      <div className="time-selector">
        <label htmlFor={`${anchorId}-time`}>
          {t('planning.fixedStartTime', {
            defaultValue: 'Fixed start time',
          })}
        </label>
        <input
          id={`${anchorId}-time`}
          type="time"
          value={startTime}
          onChange={event => setStartTime(event.target.value)}
          className="time-input"
        />
      </div>

      <div className="time-selector">
        <label htmlFor={`${anchorId}-duration`}>
          {t('planning.durationMinutes', {
            defaultValue: 'Duration in minutes',
          })}
        </label>
        <input
          id={`${anchorId}-duration`}
          type="number"
          min="0"
          step="15"
          value={durationMinutes}
          onChange={event => setDurationMinutes(event.target.value)}
          className="time-input"
        />
      </div>

      <div className="time-selector">
        <label htmlFor={`${anchorId}-buffer`}>
          {t('planning.arriveMinutesEarly', {
            defaultValue: 'Arrive this many minutes early',
          })}
        </label>
        <input
          id={`${anchorId}-buffer`}
          type="number"
          min="0"
          step="5"
          value={arrivalBufferMinutes}
          onChange={event => setArrivalBufferMinutes(event.target.value)}
          className="time-input"
        />
      </div>

      {error && <p role="alert">{error}</p>}

      <div className="swipe-buttons">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t('planning.cancel', { defaultValue: 'Cancel' })}
        </button>
        <button type="submit" className="btn-primary">
          {initialAnchor
            ? t('planning.saveAnchor', { defaultValue: 'Save anchor' })
            : t('planning.addAnchorAction', { defaultValue: 'Add anchor' })}
        </button>
      </div>
    </form>
  );
}
