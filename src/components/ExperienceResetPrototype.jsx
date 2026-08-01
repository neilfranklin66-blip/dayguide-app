import React, { useMemo, useState } from 'react';
import {
  isValidPlaceQuery,
  resolvePlaceQuery,
} from '../api/placeResolutionApi';

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

const today = () => new Date().toISOString().slice(0, 10);

const MOODS = [
  ['food', '🍽️'],
  ['coffee', '☕'],
  ['thingsToDo', '✨'],
  ['explore', '🗺️'],
  ['culture', '🏛️'],
  ['outdoors', '🌳'],
  ['shopping', '🛍️'],
  ['family', '👨‍👩‍👧'],
];

function ChoiceButton({ children, selected, onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`experience-choice ${selected ? 'experience-choice--selected' : ''} ${className}`}
      aria-pressed={selected || undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/**
 * A contained, no-provider-call interaction prototype for the approved
 * DayGuide experience reset. It deliberately records only lightweight context
 * and never claims that it has found a real place or calculated a journey.
 */
export default function ExperienceResetPrototype({
  t,
  onExit,
  onBrowseRestaurants,
  searchPlaces = resolvePlaceQuery,
}) {
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState('entry');
  const [draft, setDraft] = useState({
    date: today(),
    startTime: 'now',
    startPlace: 'current',
    startPlaceDetails: null,
    laterPlace: '',
    duration: 'halfDay',
    mood: '',
  });
  const [startSearchQuery, setStartSearchQuery] = useState('');
  const [startSearchState, setStartSearchState] = useState('idle');
  const [startSearchResults, setStartSearchResults] = useState([]);
  const [startSearchMessage, setStartSearchMessage] = useState('');

  const plannerSteps = ['date', 'time', 'start', 'later', 'duration', 'mood', 'ready'];
  const currentStepIndex = plannerSteps.indexOf(step);
  const showProgress = mode === 'planner' && currentStepIndex >= 0 && step !== 'ready';
  const update = changes => setDraft(current => ({ ...current, ...changes }));

  const movePlanner = next => setStep(next);
  const selectMode = selectedMode => {
    setMode(selectedMode);
    setStep(selectedMode === 'planner' ? 'date' : 'mood');
  };

  const startSummary = useMemo(() => {
    if (draft.startPlace === 'current') return t('experienceReset.currentLocation');
    if (draft.startPlaceDetails?.name) return draft.startPlaceDetails.name;
    return t('experienceReset.placeToChoose');
  }, [draft.startPlace, draft.startPlaceDetails, t]);

  const finishChoice = mood => {
    update({ mood });
    setStep('ready');
  };

  const searchStartPlace = async event => {
    event.preventDefault();
    if (!isValidPlaceQuery(startSearchQuery)) {
      setStartSearchState('error');
      setStartSearchMessage(t('experienceReset.startSearchError'));
      return;
    }

    setStartSearchState('loading');
    setStartSearchMessage('');
    setStartSearchResults([]);
    try {
      const results = await searchPlaces(startSearchQuery);
      setStartSearchResults(results);
      if (results.length === 0) {
        setStartSearchState('empty');
        setStartSearchMessage(t('experienceReset.startSearchEmpty'));
      } else {
        setStartSearchState('success');
      }
    } catch (_) {
      setStartSearchState('error');
      setStartSearchMessage(t('experienceReset.startSearchError'));
    }
  };

  const reset = () => {
    setMode(null);
    setStep('entry');
    setDraft({
      date: today(),
      startTime: 'now',
      startPlace: 'current',
      startPlaceDetails: null,
      laterPlace: '',
      duration: 'halfDay',
      mood: '',
    });
    setStartSearchQuery('');
    setStartSearchState('idle');
    setStartSearchResults([]);
    setStartSearchMessage('');
  };

  const titleForMood = draft.mood ? t(`experienceReset.moods.${draft.mood}`) : '';

  return (
    <div className="dayguide-container experience-reset">
      <section className="card experience-card" aria-labelledby="experience-reset-title">
        {showProgress && (
          <p className="experience-progress" aria-label={t('experienceReset.progressLabel')}>
            <span className="experience-progress__dot experience-progress__dot--active" />
            <span className="experience-progress__dot" />
            <span className="experience-progress__dot" />
          </p>
        )}

        {step === 'entry' && (
          <>
            <p className="experience-eyebrow">DayGuide</p>
            <h1 id="experience-reset-title">{t('experienceReset.entryTitle')}</h1>
            <p className="experience-intro">{t('experienceReset.entryIntro')}</p>
            <div className="experience-choice-stack">
              <ChoiceButton onClick={() => selectMode('planner')} className="experience-choice--primary">
                <span aria-hidden="true">🗓️</span> {t('experienceReset.planAhead')}
              </ChoiceButton>
              <ChoiceButton onClick={() => selectMode('nearby')}>
                <span aria-hidden="true">📍</span> {t('experienceReset.nearbyNow')}
              </ChoiceButton>
            </div>
          </>
        )}

        {step === 'date' && (
          <>
            <h1 id="experience-reset-title">{t('experienceReset.dateTitle')}</h1>
            <div className="experience-choice-stack">
              <ChoiceButton selected={draft.date === today()} onClick={() => update({ date: today() })}>
                {t('experienceReset.today')}
              </ChoiceButton>
              <ChoiceButton selected={draft.date === tomorrow()} onClick={() => update({ date: tomorrow() })}>
                {t('experienceReset.tomorrow')}
              </ChoiceButton>
              <label className="experience-date-choice">
                {t('experienceReset.chooseDate')}
                <input
                  type="date"
                  value={draft.date}
                  min={today()}
                  onChange={event => update({ date: event.target.value })}
                />
              </label>
            </div>
            <button type="button" className="btn-primary experience-continue" onClick={() => movePlanner('time')}>
              {t('experienceReset.continue')}
            </button>
          </>
        )}

        {step === 'time' && (
          <>
            <h1 id="experience-reset-title">{t('experienceReset.timeTitle')}</h1>
            <div className="experience-choice-grid">
              {['now', 'morning', 'afternoon', 'evening'].map(option => (
                <ChoiceButton
                  key={option}
                  selected={draft.startTime === option}
                  onClick={() => {
                    update({ startTime: option });
                    movePlanner('start');
                  }}
                >
                  {t(`experienceReset.${option}`)}
                </ChoiceButton>
              ))}
            </div>
          </>
        )}

        {step === 'start' && (
          <>
            <h1 id="experience-reset-title">{t('experienceReset.startTitle')}</h1>
            <p className="experience-intro">{t('experienceReset.startHelp')}</p>
            <div className="experience-choice-stack">
              <ChoiceButton
                selected={draft.startPlace === 'current'}
                onClick={() => {
                  update({ startPlace: 'current' });
                  movePlanner('later');
                }}
              >
                {t('experienceReset.currentLocation')}
              </ChoiceButton>
              <ChoiceButton
                selected={draft.startPlace === 'search'}
                onClick={() => {
                  update({ startPlace: 'search', startPlaceDetails: null });
                }}
              >
                {t('experienceReset.placeToChoose')}
              </ChoiceButton>
            </div>
            {draft.startPlace === 'search' && (
              <form className="experience-place-search" onSubmit={searchStartPlace}>
                <label className="experience-text-field" htmlFor="experience-start-place">
                  {t('experienceReset.startSearchLabel')}
                </label>
                <input
                  id="experience-start-place"
                  type="search"
                  value={startSearchQuery}
                  onChange={event => setStartSearchQuery(event.target.value)}
                  autoComplete="off"
                />
                <button type="submit" className="btn-primary experience-continue" disabled={startSearchState === 'loading'}>
                  {startSearchState === 'loading'
                    ? t('experienceReset.searching')
                    : t('experienceReset.search')}
                </button>
                {startSearchMessage && <p role={startSearchState === 'error' ? 'alert' : 'status'}>{startSearchMessage}</p>}
                {startSearchState === 'success' && (
                  <div className="experience-search-results">
                    <p className="experience-search-attribution" translate="no">Google Maps</p>
                    {startSearchResults.map(place => (
                      <ChoiceButton
                        key={`${place.source}:${place.id}`}
                        onClick={() => {
                          update({ startPlace: 'selected', startPlaceDetails: place });
                          movePlanner('later');
                        }}
                      >
                        {t('experienceReset.chooseNamedPlace', { name: place.name })}
                      </ChoiceButton>
                    ))}
                  </div>
                )}
              </form>
            )}
          </>
        )}

        {step === 'later' && (
          <>
            <h1 id="experience-reset-title">{t('experienceReset.laterTitle')}</h1>
            <p className="experience-intro">{t('experienceReset.laterHelp')}</p>
            <div className="experience-choice-stack">
              <ChoiceButton onClick={() => movePlanner('duration')}>
                {t('experienceReset.keepOpen')}
              </ChoiceButton>
              <ChoiceButton selected={Boolean(draft.laterPlace)} onClick={() => update({ laterPlace: draft.laterPlace || ' ' })}>
                {t('experienceReset.addPlace')}
              </ChoiceButton>
            </div>
            {draft.laterPlace && (
              <>
                <label className="experience-text-field" htmlFor="experience-later-place">
                  {t('experienceReset.laterPlaceLabel')}
                </label>
                <input
                  id="experience-later-place"
                  type="text"
                  value={draft.laterPlace.trim()}
                  onChange={event => update({ laterPlace: event.target.value })}
                  autoComplete="off"
                />
                <button type="button" className="btn-primary experience-continue" onClick={() => movePlanner('duration')}>
                  {t('experienceReset.continue')}
                </button>
              </>
            )}
          </>
        )}

        {step === 'duration' && (
          <>
            <h1 id="experience-reset-title">{t('experienceReset.durationTitle')}</h1>
            <div className="experience-choice-grid">
              {['coupleHours', 'halfDay', 'mostDay'].map(option => (
                <ChoiceButton
                  key={option}
                  selected={draft.duration === option}
                  onClick={() => {
                    update({ duration: option });
                    movePlanner('mood');
                  }}
                >
                  {t(`experienceReset.${option}`)}
                </ChoiceButton>
              ))}
            </div>
          </>
        )}

        {step === 'mood' && (
          <>
            <h1 id="experience-reset-title">{t('experienceReset.moodTitle')}</h1>
            {mode === 'nearby' && <p className="experience-intro">{t('experienceReset.nearbyHelp')}</p>}
            <div className="experience-mood-grid">
              {MOODS.map(([mood, icon]) => (
                <ChoiceButton key={mood} onClick={() => finishChoice(mood)}>
                  <span aria-hidden="true">{icon}</span>
                  <span>{t(`experienceReset.moods.${mood}`)}</span>
                </ChoiceButton>
              ))}
            </div>
          </>
        )}

        {step === 'ready' && (
          <>
            <p className="experience-eyebrow">{titleForMood}</p>
            <h1 id="experience-reset-title">{t('experienceReset.readyTitle')}</h1>
            <p className="experience-intro">{t('experienceReset.acknowledgement')}</p>
            <section className="experience-day-preview" aria-label={t('experienceReset.daySoFar')}>
              <h2>{t('experienceReset.daySoFar')}</h2>
              {mode === 'planner' && (
                <>
                  <p><strong>{t('experienceReset.startLabel')}:</strong> {startSummary}</p>
                  {draft.laterPlace.trim() && <p><strong>{t('experienceReset.laterLabel')}:</strong> {draft.laterPlace.trim()}</p>}
                </>
              )}
              <p><strong>{t('experienceReset.nextLabel')}:</strong> {titleForMood}</p>
            </section>
            <div className="experience-choice-stack">
              {['food', 'coffee'].includes(draft.mood) && typeof onBrowseRestaurants === 'function' && (
                <ChoiceButton
                  className="experience-choice--primary"
                  onClick={() => onBrowseRestaurants({ ...draft, mode })}
                >
                  {t('experienceReset.showNearbyOptions')}
                </ChoiceButton>
              )}
              <ChoiceButton onClick={reset}>{t('experienceReset.startAgain')}</ChoiceButton>
              <ChoiceButton onClick={onExit}>{t('experienceReset.backToCurrent')}</ChoiceButton>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
