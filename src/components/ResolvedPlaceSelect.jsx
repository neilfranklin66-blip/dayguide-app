import React from 'react';
import { isPlaceRef } from '../models/geographicalPlan';
import {
  PLACE_SELECTION_MODE,
  createPlaceSelection,
} from '../utils/planningInputWorkflow';

const resolvedOptionKey = place => `resolved:${place.id}`;

const formatPlaceLabel = place =>
  place.address ? `${place.name} — ${place.address}` : place.name;

function buildPlaceOptions(currentPlace, availablePlaces, selection) {
  const options = [];
  const seenKeys = new Set();

  if (isPlaceRef(currentPlace) && currentPlace.source === 'current_gps') {
    options.push({
      key: PLACE_SELECTION_MODE.CURRENT_LOCATION,
      label: `Use my current location — ${currentPlace.name}`,
      mode: PLACE_SELECTION_MODE.CURRENT_LOCATION,
      place: currentPlace,
    });
    seenKeys.add(PLACE_SELECTION_MODE.CURRENT_LOCATION);
  }

  const resolvedPlaces = [
    ...(Array.isArray(availablePlaces) ? availablePlaces : []),
    ...(selection?.mode === PLACE_SELECTION_MODE.RESOLVED_PLACE
      ? [selection.place]
      : []),
  ];

  resolvedPlaces.forEach(place => {
    if (
      !isPlaceRef(place) ||
      place.id == null ||
      String(place.id).trim().length === 0
    ) {
      return;
    }
    const key = resolvedOptionKey(place);
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    options.push({
      key,
      label: formatPlaceLabel(place),
      mode: PLACE_SELECTION_MODE.RESOLVED_PLACE,
      place,
    });
  });

  return options;
}

export default function ResolvedPlaceSelect({
  id,
  label,
  selection,
  onChange,
  currentPlace = null,
  availablePlaces = [],
  allowNone = false,
  noneLabel = 'No destination',
  helpText = 'Only verified map locations can be used for geographical planning.',
}) {
  const options = buildPlaceOptions(
    currentPlace,
    availablePlaces,
    selection,
  );
  const selectedValue =
    selection?.mode === PLACE_SELECTION_MODE.CURRENT_LOCATION
      ? PLACE_SELECTION_MODE.CURRENT_LOCATION
      : selection?.mode === PLACE_SELECTION_MODE.RESOLVED_PLACE &&
          selection.place?.id != null
        ? resolvedOptionKey(selection.place)
        : '';

  const handleChange = event => {
    const option = options.find(item => item.key === event.target.value);
    if (!option) {
      onChange(null);
      return;
    }
    onChange(
      createPlaceSelection({
        mode: option.mode,
        place: option.place,
      }),
    );
  };

  return (
    <div className="time-selector planning-place-selector">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={selectedValue}
        onChange={handleChange}
        className="time-input"
        disabled={options.length === 0 && !allowNone}
      >
        <option value="">
          {allowNone ? noneLabel : 'Select a verified place'}
        </option>
        {options.map(option => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="start-order-hint">{helpText}</p>
      {options.length === 0 && (
        <p role="status" className="start-order-hint">
          No verified places are available yet.
        </p>
      )}
    </div>
  );
}
