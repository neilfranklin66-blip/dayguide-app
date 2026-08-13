import React, { useState } from 'react';
import DirectPlaceSearch from './DirectPlaceSearch';
import PlanningInputStage from './PlanningInputStage';
import { isPlaceRef } from '../models/geographicalPlan';
import {
  PLACE_SELECTION_MODE,
  createPlaceSelection,
  createPlanningInputDraft,
  setDestinationEnabled,
  setDestinationSelection,
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
    initialDraft ?? createPlanningInputDraft(),
  );

  const selectStartPlace = place => {
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

  const selectDestinationPlace = place => {
    setAvailablePlaces(current => mergePlaces(current, [place]));
    setDraft(current =>
      setDestinationSelection(
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
      return;
    }
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

  const removeDestination = () => {
    setDraft(current => setDestinationEnabled(current, false));
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
      placeholderDefault="For example: Northampton Museum or NN1 1DP"
      selectedPlace={draft.startSelection?.place}
      selectedKey="planning.startPlaceSelected"
      selectedDefault="Your day will start at {{name}}."
      selectKey="planning.selectStartPlace"
      selectDefault="Start at {{name}}"
      onSelect={selectStartPlace}
      secondaryAction={
        isPlaceRef(currentPlace) && currentPlace.source === 'current_gps'
          ? {
              key: 'planning.useCurrentStart',
              name: currentPlace.name,
              defaultValue: `Use my current location — ${currentPlace.name}`,
              onClick: useCurrentLocation,
            }
          : null
      }
      searchPlaces={searchPlaces}
      t={t}
    />
  );

  const destinationPlaceControl = (
    <DirectPlaceSearch
      id="planning-destination-place"
      titleKey="planning.destinationSearchTitle"
      titleDefault="Where will you finish?"
      hintKey="planning.destinationSearchHint"
      hintDefault="Search for a place, address, postcode or ZIP code."
      labelKey="planning.destinationSearchLabel"
      labelDefault="Place, address, postcode or ZIP code for your destination"
      placeholderKey="planning.destinationSearchPlaceholder"
      placeholderDefault="For example: your hotel or SW1A 1AA"
      selectedPlace={draft.destination.selection?.place}
      selectedKey="planning.destinationPlaceSelected"
      selectedDefault="Your day will finish at {{name}}."
      selectKey="planning.selectDestinationPlace"
      selectDefault="Finish at {{name}}"
      onSelect={selectDestinationPlace}
      selectedAction={
        draft.destination.selection
          ? {
              key: 'planning.removeDestination',
              defaultValue: 'Remove end destination',
              onClick: removeDestination,
            }
          : null
      }
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
      destinationPlaceControl={destinationPlaceControl}
      onComplete={onComplete}
      onCancel={onCancel}
      onSkip={onSkip}
      selectedDate={selectedDate}
      onSelectedDateChange={onSelectedDateChange}
      t={t}
    />
  );
}
