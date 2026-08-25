import React, { useRef, useState } from 'react';
import { isPlaceRef } from '../models/geographicalPlan';
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
        defaultValue: 'Verified place search was refused by the map provider.',
      });
    case PLACE_RESOLUTION_ERROR.QUOTA_EXCEEDED:
      return t('planning.searchQuota', {
        defaultValue: 'The place-search limit has been reached. Try again later.',
      });
    case PLACE_RESOLUTION_ERROR.NETWORK_ERROR:
      return t('planning.searchNetwork', {
        defaultValue: 'Check your connection, then try the place search again.',
      });
    default:
      return t('planning.searchError', {
        defaultValue:
          'That place could not be verified. Try a more specific place name or address.',
      });
  }
};

export default function DirectPlaceSearch({
  id,
  titleKey,
  titleDefault,
  hintKey,
  hintDefault,
  labelKey,
  labelDefault,
  placeholderKey,
  placeholderDefault,
  selectedPlace = null,
  selectedKey,
  selectedDefault,
  selectKey,
  selectDefault,
  onSelect,
  secondaryAction = null,
  secondaryFeedback = '',
  selectedSummaryText = null,
  selectedSummaryPlacement = 'after-secondary',
  selectedAction = null,
  embedded = false,
  searchPlaces = resolvePlaceQuery,
  t = fallbackT,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchState, setSearchState] = useState('idle');
  const [feedback, setFeedback] = useState('');
  const searchInFlight = useRef(false);
  const titleId = `${id}-title`;
  const inputId = `${id}-query`;

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

  const select = place => {
    onSelect(place);
    setResults([]);
    setSearchState('idle');
    setFeedback('');
  };

  const SearchContainer = embedded ? 'div' : 'form';
  const selectedSummary = selectedPlace && (
    <div className="selected-place-summary" role="status">
      <p>
        {selectedSummaryText ?? t(selectedKey, {
          name: selectedPlace.name,
          defaultValue: selectedDefault.replace('{{name}}', selectedPlace.name),
        })}
      </p>
      {selectedAction && (
        <button
          type="button"
          className="btn-secondary"
          onClick={selectedAction.onClick}
        >
          {t(selectedAction.key, {
            defaultValue: selectedAction.defaultValue,
          })}
        </button>
      )}
    </div>
  );

  return (
    <section className="planning-place-search" aria-labelledby={titleId}>
      <h3 id={titleId}>{t(titleKey, { defaultValue: titleDefault })}</h3>
      <p className="start-order-hint">
        {t(hintKey, { defaultValue: hintDefault })}
      </p>

      {secondaryAction && (
        <button
          type="button"
          className="btn-secondary"
          onClick={secondaryAction.onClick}
        >
          {t(secondaryAction.key, {
            name: secondaryAction.name,
            defaultValue: secondaryAction.defaultValue,
          })}
        </button>
      )}

      {selectedSummaryPlacement === 'after-secondary' && selectedSummary}

      {secondaryFeedback && (
        <p role="status" className="start-order-hint">
          {secondaryFeedback}
        </p>
      )}

      <SearchContainer
        className={embedded ? 'place-search-form' : undefined}
        onSubmit={embedded ? undefined : search}
      >
        <label htmlFor={inputId}>{t(labelKey, { defaultValue: labelDefault })}</label>
        <input
          id={inputId}
          type="search"
          value={query}
          minLength={PLACE_QUERY_MIN_LENGTH}
          maxLength={PLACE_QUERY_MAX_LENGTH}
          placeholder={t(placeholderKey, { defaultValue: placeholderDefault })}
          onChange={event => setQuery(event.target.value)}
          className="time-input"
          autoComplete="postal-code"
        />
        <button
          type={embedded ? 'button' : 'submit'}
          className="btn-secondary"
          disabled={searchState === 'loading'}
          onClick={embedded ? search : undefined}
        >
          {searchState === 'loading'
            ? t('planning.searching', { defaultValue: 'Searching...' })
            : t('planning.searchAction', { defaultValue: 'Search' })}
        </button>
      </SearchContainer>

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
          {results.map(place => (
            <article key={placeKey(place)} className="swipe-item">
              <h4>{place.name}</h4>
              {place.address && <p>{place.address}</p>}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => select(place)}
              >
                {t(selectKey, {
                  name: place.name,
                  defaultValue: selectDefault.replace('{{name}}', place.name),
                })}
              </button>
            </article>
          ))}
        </section>
      )}

      {selectedSummaryPlacement === 'after-search' && selectedSummary}
    </section>
  );
}
