import React, { useState } from 'react';
import DirectPlaceSearch from './DirectPlaceSearch';
import PlanningInputStage from './PlanningInputStage';
import { isPlaceRef } from '../models/geographicalPlan';
import {
  PLACE_SELECTION_MODE,
  createPlaceSelection,
  createPlanningInputDraft,
  setStartSelection,
} from '../utils/planningInputWorkflow';
import { resolvePlaceQuery } from '../api/placeResolutionApi';

const placeKey = place => `${place.source}:${place.id}`;
const fallbackT = (_key, options) => options?.defaultValue ?? _key;

const mergePlaces = (...collections) => {
  const byKey = new Map();
  collections.flat().forEach(place => {
    if (!isPlaceRef(place) || place.id == null) return;
    const key = placeKey(place);
    if (!byKey.has(key)) byKey.set(key, place);
  });
  return [...byKey.values()];
};

export default function PlanningInputWithPlaceResolution({
  currentPlace = null,
  initialPlaces = [],
  initialDraft = null,
  onComplete,
  onCancel,
  onSkip,
  selectedDate,
  onSelectedDateChange,
  searchPlaces = resolvePlaceQuery,
  t = fallbackT,
}) {
  const [availablePlaces, setAvailablePlaces] = useState(() =>
    mergePlaces(initialPlaces),
  );
  const [draft, setDraft] = useState(() =>
    initialDraft ?? createPlanningInputDraft({ departureTimeMinutes: null }),
  );
  const [locationFeedback, setLocationFeedback] = useState('');

  const selectStartPlace = place => {
    setLocationFeedback('');
    setAvailablePlaces(current => mergePlaces(current, [place]));
    setDraft(current =>
      setStartSelection(
        current,
        createPlaceSelection({
          mode: PLACE_SELECTION_MODE.RESOLVED_PLACE,
          place,
        }),
      ),
    );
  };

  const useCurrentLocation = () => {
    if (!isPlaceRef(currentPlace) || currentPlace.source !== 'current_gps') {
      setLocationFeedback(
        "Location isn't available. Search for a place, address, postcode or ZIP code instead.",
      );
      return;
    }
    setLocationFeedback('');
    setDraft(current =>
      setStartSelection(
        current,
        createPlaceSelection({
          mode: PLACE_SELECTION_MODE.CURRENT_LOCATION,
          place: currentPlace,
        }),
      ),
    );
  };

  const startPlaceControl = (
    <DirectPlaceSearch
      id="planning-start-place"
      titleKey="planning.startSearchTitle"
      titleDefault="Where will you start?"
      hintKey="planning.startSearchHint"
      hintDefault="Search for a place, address, postcode or ZIP code."
      labelKey="planning.startSearchLabel"
      labelDefault="Place, address, postcode or ZIP code"
      placeholderKey="planning.startSearchPlaceholder"
      placeholderDefault="Search for a place, address, postcode or ZIP code"
      selectedPlace={draft.startSelection?.place}
      selectedKey="planning.startPlaceSelected"
      selectedDefault="Start area set: {{name}}"
      selectedSummaryText={
        draft.startSelection?.mode === PLACE_SELECTION_MODE.CURRENT_LOCATION
          ? 'Start area set: your current location'
          : draft.startSelection?.place
            ? `Start area set: ${[draft.startSelection.place.name, draft.startSelection.place.address]
                .filter(Boolean)
                .join(', ')}`
            : null
      }
      selectedSummaryPlacement={
        draft.startSelection?.mode === PLACE_SELECTION_MODE.CURRENT_LOCATION
          ? 'after-secondary'
          : 'after-search'
      }
      selectKey="planning.selectStartPlace"
      selectDefault="Start at {{name}}"
      onSelect={selectStartPlace}
      secondaryAction={{
        key: 'planning.useCurrentStart',
        defaultValue: 'Use my current location',
        onClick: useCurrentLocation,
      }}
      secondaryFeedback={locationFeedback}
      searchPlaces={searchPlaces}
      t={t}
    />
  );

  return (
    <PlanningInputStage
      currentPlace={currentPlace}
      availablePlaces={availablePlaces}
      draft={draft}
      onDraftChange={setDraft}
      startPlaceControl={startPlaceControl}
      onComplete={onComplete}
      onCancel={onCancel}
      onSkip={onSkip}
      selectedDate={selectedDate}
      onSelectedDateChange={onSelectedDateChange}
      t={t}
    />
  );
}
