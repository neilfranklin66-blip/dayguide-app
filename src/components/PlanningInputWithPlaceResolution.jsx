import React, { useRef, useState } from 'react';
import PlanningInputStage from './PlanningInputStage';
import { isPlaceRef } from '../models/geographicalPlan';
import {
  PLACE_QUERY_MAX_LENGTH,
  PLACE_QUERY_MIN_LENGTH,
  PLACE_RESOLUTION_ERROR,
  isValidPlaceQuery,
  resolvePlaceQuery,
} from '../api/placeResolutionApi';

const placeKey = place => `${place.source}:${place.id}`;

const mergePlaces = (...collections) => {
  const byKey = new Map();
  collections.flat().forEach(place => {
    if (!isPlaceRef(place) || place.id == null) return;
    const key = placeKey(place);
    if (!byKey.has(key)) byKey.set(key, place);
  });
  return [...byKey.values()];
};

const messageForError = error => {
  switch (error?.message) {
    case PLACE_RESOLUTION_ERROR.INVALID_QUERY:
      return `Enter between ${PLACE_QUERY_MIN_LENGTH} and ${PLACE_QUERY_MAX_LENGTH} characters.`;
    case PLACE_RESOLUTION_ERROR.NO_API_KEY:
    case PLACE_RESOLUTION_ERROR.RESOLVER_UNAVAILABLE:
      return 'Verified place search is not available right now.';
    case PLACE_RESOLUTION_ERROR.API_DENIED:
      return 'Verified place search was refused by the map provider.';
    case PLACE_RESOLUTION_ERROR.QUOTA_EXCEEDED:
      return 'The place-search limit has been reached. Try again later.';
    case PLACE_RESOLUTION_ERROR.NETWORK_ERROR:
      return 'Check your connection, then try the place search again.';
    default:
      return 'That place could not be verified. Try a more specific place name or address.';
  }
};

export default function PlanningInputWithPlaceResolution({
  currentPlace = null,
  initialPlaces = [],
  initialDraft = null,
  onComplete,
  onCancel,
  searchPlaces = resolvePlaceQuery,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [availablePlaces, setAvailablePlaces] = useState(() =>
    mergePlaces(initialPlaces),
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
        `Enter between ${PLACE_QUERY_MIN_LENGTH} and ${PLACE_QUERY_MAX_LENGTH} characters.`,
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
          'No verified matches were found. Try a station name, venue, hotel or fuller address.',
        );
      } else {
        setSearchState('success');
      }
    } catch (error) {
      setSearchState('error');
      setFeedback(messageForError(error));
    } finally {
      searchInFlight.current = false;
    }
  };

  const addPlace = place => {
    setAvailablePlaces(current => mergePlaces(current, [place]));
    setFeedback(`${place.name} is now available in the planning choices.`);
  };

  const hasPlace = place =>
    availablePlaces.some(item => placeKey(item) === placeKey(place));

  return (
    <>
      <div className="dayguide-container">
        <section
          className="card planning-place-resolution"
          aria-labelledby="place-resolution-title"
        >
          <h2 id="place-resolution-title">Find a verified planning place</h2>
          <p>
            Search for a station, venue, hotel or address, then add the correct
            match to your planning choices.
          </p>
          <p className="start-order-hint">
            A search is sent to Google Maps only when you press Search. DayGuide
            does not send searches while you type.
          </p>

          <form onSubmit={search}>
            <label htmlFor="planning-place-query">Place name or address</label>
            <input
              id="planning-place-query"
              type="search"
              value={query}
              minLength={PLACE_QUERY_MIN_LENGTH}
              maxLength={PLACE_QUERY_MAX_LENGTH}
              onChange={event => setQuery(event.target.value)}
              className="time-input"
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn-secondary"
              disabled={searchState === 'loading'}
            >
              {searchState === 'loading' ? 'Searching...' : 'Search'}
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
              aria-label="Verified place matches"
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
                Matches are ordered using factors including relevance,
                distance and prominence.
              </p>
              {results.map(place => (
                <article key={placeKey(place)} className="swipe-item">
                  <h3>{place.name}</h3>
                  {place.address && <p>{place.address}</p>}
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={hasPlace(place)}
                    onClick={() => addPlace(place)}
                  >
                    {hasPlace(place)
                      ? `${place.name} added`
                      : `Add ${place.name}`}
                  </button>
                </article>
              ))}
            </section>
          )}
        </section>
      </div>

      <PlanningInputStage
        currentPlace={currentPlace}
        availablePlaces={availablePlaces}
        initialDraft={initialDraft}
        onComplete={onComplete}
        onCancel={onCancel}
      />
    </>
  );
}
