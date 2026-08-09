import React, { useRef, useState } from 'react';
import PlanningInputStage from './PlanningInputStage';
import { isPlaceRef } from '../models/geographicalPlan';
import {
  PLACE_SELECTION_MODE,
  createPlaceSelection,
  createPlanningInputDraft,
  setStartSelection,
} from '../utils/planningInputWorkflow';
import {
  PLACE_QUERY_MAX_LENGTH,
  PLACE_QUERY_MIN_LENGTH,
  PLACE_RESOLUTION_ERROR,
  isValidPlaceQuery,
  resolvePlaceQuery,
} from '../api/placeResolutionApi';

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

const messageForError = (error, t) => {
  switch (error?.message) {
    case PLACE_RESOLUTION_ERROR.INVALID_QUERY:
      return t('planning.searchLength', {
        min: PLACE_QUERY_MIN_LENGTH,
        max: PLACE_QUERY_MAX_LENGTH,
        defaultValue: `Enter between ${PLACE_QUERY_MIN_LENGTH} and ${PLACE_QUERY_MAX_LENGTH} characters.`,
      });
    case PLACE_RESOLUTION_ERROR.NO_API_KEY:
    case PLACE_RESOLUTION_ERROR.RESOLVER_UNAVAILABLE:
      return t('planning.searchUnavailable', {
        defaultValue: 'Verified place search is not available right now.',
      });
    case PLACE_RESOLUTION_ERROR.API_DENIED:
      return t('planning.searchDenied', {
        defaultValue:
          'Verified place search was refused by the map provider.',
      });
    case PLACE_RESOLUTION_ERROR.QUOTA_EXCEEDED:
      return t('planning.searchQuota', {
        defaultValue:
          'The place-search limit has been reached. Try again later.',
      });
    case PLACE_RESOLUTION_ERROR.NETWORK_ERROR:
      return t('planning.searchNetwork', {
        defaultValue:
          'Check your connection, then try the place search again.',
      });
    default:
      return t('planning.searchError', {
        defaultValue:
          'That place could not be verified. Try a more specific place name or address.',
      });
  }
};

export default function PlanningInputWithPlaceResolution({
  currentPlace = null,
  initialPlaces = [],
  initialDraft = null,
  onComplete,
  onCancel,
  onSkip,
  searchPlaces = resolvePlaceQuery,
  t = fallbackT,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [availablePlaces, setAvailablePlaces] = useState(() =>
    mergePlaces(initialPlaces),
  );
  const [draft, setDraft] = useState(() =>
    initialDraft ?? createPlanningInputDraft(),
  );
  const [searchState, setSearchState] = useState('idle');
  const [feedback, setFeedback] = useState('');
  const searchInFlight = useRef(false);

  const search = async event => {
    event.preventDefault();
    if (searchInFlight.current) return;
    if (!isValidPlaceQuery(query)) {
      setResults([]);
      setSearchState('error');
      setFeedback(
        t('planning.searchLength', {
          min: PLACE_QUERY_MIN_LENGTH,
          max: PLACE_QUERY_MAX_LENGTH,
          defaultValue: `Enter between ${PLACE_QUERY_MIN_LENGTH} and ${PLACE_QUERY_MAX_LENGTH} characters.`,
        }),
      );
      return;
    }

    searchInFlight.current = true;
    setSearchState('loading');
    setFeedback('');
    setResults([]);

    try {
      const places = await searchPlaces(query);
      setResults(mergePlaces(places));
      if (places.length === 0) {
        setSearchState('empty');
        setFeedback(
          t('planning.searchNoResults', {
            defaultValue:
              'No verified matches were found. Try a station name, venue, hotel or fuller address.',
          }),
        );
      } else {
        setSearchState('success');
      }
    } catch (error) {
      setSearchState('error');
      setFeedback(messageForError(error, t));
    } finally {
      searchInFlight.current = false;
    }
  };

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
    setResults([]);
    setSearchState('idle');
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
    setFeedback('');
  };

  const startPlaceControl = (
    <section className="planning-start-place-search" aria-labelledby="planning-start-place-title">
      <h3 id="planning-start-place-title">
        {t('planning.startSearchTitle', {
          defaultValue: 'Where will you start?',
        })}
      </h3>
      <p className="start-order-hint">
        {t('planning.startSearchHint', {
          defaultValue: 'Search for a place, address, postcode or ZIP code.',
        })}
      </p>

      {draft.startSelection?.place && (
        <p role="status" className="start-order-hint">
          {t('planning.startPlaceSelected', {
            name: draft.startSelection.place.name,
            defaultValue: `Your day will start at ${draft.startSelection.place.name}.`,
          })}
        </p>
      )}

      {isPlaceRef(currentPlace) && currentPlace.source === 'current_gps' && (
        <button type="button" className="btn-secondary" onClick={useCurrentLocation}>
          {t('planning.useCurrentStart', {
            name: currentPlace.name,
            defaultValue: `Use my current location — ${currentPlace.name}`,
          })}
        </button>
      )}

      <form onSubmit={search}>
        <label htmlFor="planning-place-query">
          {t('planning.startSearchLabel', {
            defaultValue: 'Place, address, postcode or ZIP code',
          })}
        </label>
        <input
          id="planning-place-query"
          type="search"
          value={query}
          minLength={PLACE_QUERY_MIN_LENGTH}
          maxLength={PLACE_QUERY_MAX_LENGTH}
          placeholder={t('planning.startSearchPlaceholder', {
            defaultValue: 'For example: Northampton Museum or NN1 1DP',
          })}
          onChange={event => setQuery(event.target.value)}
          className="time-input"
          autoComplete="postal-code"
        />
        <button
          type="submit"
          className="btn-secondary"
          disabled={searchState === 'loading'}
        >
          {searchState === 'loading'
            ? t('planning.searching', { defaultValue: 'Searching...' })
            : t('planning.searchAction', { defaultValue: 'Search' })}
        </button>
      </form>

      {feedback && (
        <p
          role={searchState === 'error' ? 'alert' : 'status'}
          className="start-order-hint"
        >
          {feedback}
        </p>
      )}

      {searchState === 'success' && (
        <section
          aria-label={t('planning.searchResultsLabel', {
            defaultValue: 'Place matches',
          })}
          className="planning-place-results"
        >
          <p
            translate="no"
            aria-label="Google Maps"
            style={{
              color: '#5e5e5e',
              fontFamily: 'Roboto, Sans-Serif',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 400,
              letterSpacing: 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            Google Maps
          </p>
          <p className="start-order-hint">
            {t('planning.searchOrdering', {
              defaultValue:
                'Matches are ordered using factors including relevance, distance and prominence.',
            })}
          </p>
          {results.map(place => (
            <article key={placeKey(place)} className="swipe-item">
              <h4>{place.name}</h4>
              {place.address && <p>{place.address}</p>}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => selectStartPlace(place)}
              >
                {t('planning.selectStartPlace', {
                  name: place.name,
                  defaultValue: `Start at ${place.name}`,
                })}
              </button>
            </article>
          ))}
        </section>
      )}
    </section>
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
      t={t}
    />
  );
}
