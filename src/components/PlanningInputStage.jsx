import React, { useState } from 'react';
import HardAnchorEditor from './HardAnchorEditor';
import ResolvedPlaceSelect from './ResolvedPlaceSelect';
import {
  PLANNING_INPUT_ERROR,
  JOURNEY_INTENT,
  createPlanningInputDraft,
  finalizePlanningInput,
  minutesToTimeInput,
  removeHardAnchor,
  setDepartureTime,
  setDestinationEnabled,
  setDestinationSelection,
  setDestinationTiming,
  setJourneyIntent,
  setStartSelection,
  timeInputToMinutes,
  upsertHardAnchor,
} from '../utils/planningInputWorkflow';

const fallbackT = (_key, options) => options?.defaultValue ?? _key;

const errorMessage = (error, t) =>
  ({
    [PLANNING_INPUT_ERROR.START_PLACE_REQUIRED]: t(
      'planning.errors.startPlaceRequired',
      { defaultValue: 'Choose a verified starting place.' },
    ),
    [PLANNING_INPUT_ERROR.START_TIME_INVALID]: t(
      'planning.errors.startTimeInvalid',
      { defaultValue: 'Choose a valid start time.' },
    ),
    [PLANNING_INPUT_ERROR.DESTINATION_PLACE_REQUIRED]: t(
      'planning.errors.destinationPlaceRequired',
      {
        defaultValue:
          'Choose a verified destination or remove the destination.',
      },
    ),
    [PLANNING_INPUT_ERROR.DESTINATION_DEADLINE_INVALID]: t(
      'planning.errors.destinationDeadlineInvalid',
      {
        defaultValue:
          'Check the destination deadline and arrival buffer.',
      },
    ),
    [PLANNING_INPUT_ERROR.ANCHOR_INVALID]: t(
      'planning.errors.anchorInvalid',
      { defaultValue: 'One or more fixed anchors is invalid.' },
    ),
    [PLANNING_INPUT_ERROR.ANCHOR_ID_RESERVED]: t(
      'planning.errors.anchorIdReserved',
      { defaultValue: 'A fixed anchor has an invalid identifier.' },
    ),
    [PLANNING_INPUT_ERROR.ANCHOR_ID_DUPLICATE]: t(
      'planning.errors.anchorIdDuplicate',
      { defaultValue: 'Two fixed anchors have the same identifier.' },
    ),
    [PLANNING_INPUT_ERROR.JOURNEY_INTENT_INVALID]: t(
      'planning.errors.journeyIntentInvalid',
      { defaultValue: 'Choose how fixed your next commitment is.' },
    ),
  }[error] ??
  t('planning.errors.general', {
    defaultValue: 'Check the geographical planning details.',
  }));

const nextAnchorId = anchors => {
  let ordinal = 1;
  const ids = new Set(anchors.map(anchor => anchor.id));
  while (ids.has(`anchor-${ordinal}`)) ordinal += 1;
  return `anchor-${ordinal}`;
};

export default function PlanningInputStage({
  currentPlace = null,
  availablePlaces = [],
  initialDraft = null,
  onComplete,
  onCancel,
  onSkip,
  t = fallbackT,
}) {
  const [draft, setDraft] = useState(
    initialDraft ?? createPlanningInputDraft(),
  );
  const [editor, setEditor] = useState(null);
  const [errors, setErrors] = useState([]);

  const updateStartTime = value => {
    const minutes = timeInputToMinutes(value);
    setDraft(current => setDepartureTime(current, minutes));
  };

  const updateDestinationDeadline = value => {
    const minutes = value === '' ? null : timeInputToMinutes(value);
    setDraft(current =>
      setDestinationTiming(current, {
        arrivalDeadlineMinutes: minutes,
        arrivalBufferMinutes:
          minutes == null ? 0 : current.destination.arrivalBufferMinutes,
      }),
    );
  };

  const saveAnchor = anchor => {
    setDraft(current => upsertHardAnchor(current, anchor));
    setEditor(null);
    setErrors([]);
  };

  const complete = () => {
    const result = finalizePlanningInput(draft);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    onComplete(result.value);
  };

  const destinationDeadline = minutesToTimeInput(
    draft.destination.arrivalDeadlineMinutes,
  );

  return (
    <div className="dayguide-container">
      <div className="card planning-input-stage">
        <h2>
          {t('planning.title', {
            defaultValue: 'Where should your day flow?',
          })}
        </h2>
        <p>
          {t('planning.subtitle', {
            defaultValue:
              'Set a starting place, an optional destination, and any commitments that DayGuide must never move.',
          })}
        </p>
        <p className="planning-private-alpha-notice">
          {t('planning.privateAlphaNotice', {
            defaultValue:
              'Private alpha: fixed places and times guide your plan, but travel legs are not route-verified. Check live journeys before leaving.',
          })}
        </p>

        <ResolvedPlaceSelect
          id="planning-start-place"
          label={t('planning.startPlace', {
            defaultValue: 'Where does your day start?',
          })}
          selection={draft.startSelection}
          onChange={selection =>
            setDraft(current => setStartSelection(current, selection))
          }
          currentPlace={currentPlace}
          availablePlaces={availablePlaces}
          t={t}
        />

        <div className="time-selector">
          <label htmlFor="planning-start-time">
            {t('planning.startTime', {
              defaultValue: 'What time does your day start?',
            })}
          </label>
          <input
            id="planning-start-time"
            type="time"
            value={minutesToTimeInput(draft.departureTimeMinutes)}
            onChange={event => updateStartTime(event.target.value)}
            className="time-input"
          />
        </div>

        <fieldset
          className="journey-intent-selector"
          aria-describedby="journey-intent-guidance"
        >
          <legend>
            {t('planning.journeyIntentTitle', {
              defaultValue: 'How fixed is your next commitment?',
            })}
          </legend>
          <p id="journey-intent-guidance" className="start-order-hint">
            {t('planning.journeyIntentHint', {
              defaultValue:
                'This changes DayGuide\'s planning guidance only. It cannot confirm that any journey is open, accessible or on time.',
            })}
          </p>
          <label>
            <input
              type="radio"
              name="journey-intent"
              value={JOURNEY_INTENT.FLEXIBLE}
              aria-describedby="journey-intent-guidance journey-intent-flexible-hint"
              checked={draft.journeyIntent === JOURNEY_INTENT.FLEXIBLE}
              onChange={event =>
                setDraft(current => setJourneyIntent(current, event.target.value))
              }
            />
            {t('planning.journeyIntentFlexible', {
              defaultValue: 'Flexible — a stop may move or be skipped',
            })}
          </label>
          <p id="journey-intent-flexible-hint" className="start-order-hint">
            {t('planning.journeyIntentFlexibleHint', {
              defaultValue:
                'Leave room for a pause, shopping or coffee if that suits your day.',
            })}
          </p>
          <label>
            <input
              type="radio"
              name="journey-intent"
              value={JOURNEY_INTENT.COMFORTABLE_ARRIVAL}
              aria-describedby="journey-intent-guidance journey-intent-comfortable-arrival-hint"
              checked={
                draft.journeyIntent === JOURNEY_INTENT.COMFORTABLE_ARRIVAL
              }
              onChange={event =>
                setDraft(current => setJourneyIntent(current, event.target.value))
              }
            />
            {t('planning.journeyIntentComfortableArrival', {
              defaultValue: 'Prefer to allow extra time',
            })}
          </label>
          <p
            id="journey-intent-comfortable-arrival-hint"
            className="start-order-hint"
          >
            {t('planning.journeyIntentComfortableArrivalHint', {
              defaultValue:
                'Choose your own extra time before anything important to you. This does not change routes, step-free access, or walking preferences.',
            })}
          </p>
          <label>
            <input
              type="radio"
              name="journey-intent"
              value={JOURNEY_INTENT.TIME_SENSITIVE}
              aria-describedby="journey-intent-guidance journey-intent-time-sensitive-hint"
              checked={draft.journeyIntent === JOURNEY_INTENT.TIME_SENSITIVE}
              onChange={event =>
                setDraft(current => setJourneyIntent(current, event.target.value))
              }
            />
            {t('planning.journeyIntentTimeSensitive', {
              defaultValue: 'Time-sensitive — a delay matters',
            })}
          </label>
          <p
            id="journey-intent-time-sensitive-hint"
            className="start-order-hint"
          >
            {t('planning.journeyIntentTimeSensitiveHint', {
              defaultValue:
                'Add a deadline or fixed anchor, choose your own buffer, and check live directions before setting off.',
            })}
          </p>
          <div
            id="journey-intent-time-sensitive-action-region"
            aria-live="polite"
          >
            {draft.journeyIntent === JOURNEY_INTENT.COMFORTABLE_ARRIVAL &&
              draft.anchors.length === 0 &&
              draft.destination.arrivalDeadlineMinutes == null && (
                <p className="hard-anchor-travel-warning">
                  {t('planning.journeyIntentComfortableArrivalAction', {
                    defaultValue:
                      'Add a fixed anchor or arrival deadline if you want to record a target. Review any buffer yourself; DayGuide cannot confirm an arrival.',
                  })}
                </p>
              )}
            {draft.journeyIntent === JOURNEY_INTENT.TIME_SENSITIVE &&
              draft.anchors.length === 0 &&
              draft.destination.arrivalDeadlineMinutes == null && (
                <p className="hard-anchor-travel-warning">
                  {t('planning.journeyIntentTimeSensitiveAction', {
                    defaultValue:
                      'Add a fixed anchor or arrival deadline if you want to record a target time. DayGuide will not calculate whether it can be met.',
                  })}
                </p>
              )}
          </div>
        </fieldset>

        <div className="time-selector">
          <label htmlFor="planning-add-destination">
            <input
              id="planning-add-destination"
              type="checkbox"
              checked={draft.destination.enabled}
              onChange={event =>
                setDraft(current =>
                  setDestinationEnabled(current, event.target.checked),
                )
              }
            />
            {t('planning.addDestination', {
              defaultValue: 'Add an end destination',
            })}
          </label>
        </div>

        {draft.destination.enabled && (
          <>
            <ResolvedPlaceSelect
              id="planning-end-place"
              label={t('planning.destinationPlace', {
                defaultValue: 'Where should your day finish?',
              })}
              selection={draft.destination.selection}
              onChange={selection =>
                setDraft(current =>
                  setDestinationSelection(current, selection),
                )
              }
              currentPlace={currentPlace}
              availablePlaces={availablePlaces}
              t={t}
            />

            <div className="time-selector">
              <label htmlFor="planning-end-deadline">
                {t('planning.destinationDeadline', {
                  defaultValue: 'Optional arrival deadline',
                })}
              </label>
              <input
                id="planning-end-deadline"
                type="time"
                value={destinationDeadline}
                onChange={event =>
                  updateDestinationDeadline(event.target.value)
                }
                className="time-input"
              />
            </div>

            {destinationDeadline && (
              <div className="time-selector">
                <label htmlFor="planning-end-buffer">
                  {t('planning.destinationBuffer', {
                    defaultValue:
                      'Arrive this many minutes before the deadline',
                  })}
                </label>
                <input
                  id="planning-end-buffer"
                  type="number"
                  min="0"
                  step="5"
                  value={draft.destination.arrivalBufferMinutes}
                  onChange={event =>
                    setDraft(current =>
                      setDestinationTiming(current, {
                        arrivalDeadlineMinutes:
                          current.destination.arrivalDeadlineMinutes,
                        arrivalBufferMinutes: Number(event.target.value),
                      }),
                    )
                  }
                  className="time-input"
                />
              </div>
            )}
          </>
        )}

        <section aria-labelledby="hard-anchors-title">
          <h3 id="hard-anchors-title">
            {t('planning.anchorsTitle', {
              defaultValue: 'Fixed anchors',
            })}
          </h3>
          <p className="start-order-hint">
            {t('planning.anchorsHint', {
              defaultValue:
                'These commitments are locked against automatic replanning.',
            })}
          </p>

          {draft.anchors.length === 0 && (
            <p>
              {t('planning.noAnchors', {
                defaultValue: 'No fixed anchors added.',
              })}
            </p>
          )}
          {draft.anchors.map(anchor => (
            <article key={anchor.id} className="swipe-item">
              <p className="card-type-label">
                {t('planning.lockedAnchor', {
                  defaultValue: 'Locked anchor',
                })}
              </p>
              <h4>{anchor.title}</h4>
              <p>{anchor.place.name}</p>
              <p>
                {t('planning.summaryAnchorTiming', {
                  time: minutesToTimeInput(anchor.startTimeMinutes),
                  duration: anchor.durationMinutes,
                  buffer: anchor.arrivalBufferMinutes,
                  defaultValue: `${minutesToTimeInput(
                    anchor.startTimeMinutes,
                  )} · ${anchor.durationMinutes} minutes · arrive ${anchor.arrivalBufferMinutes} minutes early`,
                })}
              </p>
              <div className="swipe-buttons">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditor({ anchor })}
                >
                  {t('planning.editNamedAnchor', {
                    title: anchor.title,
                    defaultValue: `Edit ${anchor.title}`,
                  })}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setDraft(current =>
                      removeHardAnchor(current, anchor.id),
                    )
                  }
                >
                  {t('planning.removeNamedAnchor', {
                    title: anchor.title,
                    defaultValue: `Remove ${anchor.title}`,
                  })}
                </button>
              </div>
            </article>
          ))}

          {!editor && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                setEditor({
                  anchor: null,
                  anchorId: nextAnchorId(draft.anchors),
                })
              }
            >
              {t('planning.addAnchor', {
                defaultValue: 'Add fixed anchor',
              })}
            </button>
          )}
        </section>

        {editor && (
          <HardAnchorEditor
            key={editor.anchor?.id ?? editor.anchorId}
            anchorId={editor.anchor?.id ?? editor.anchorId}
            initialAnchor={editor.anchor}
            currentPlace={currentPlace}
            availablePlaces={availablePlaces}
            onSave={saveAnchor}
            onCancel={() => setEditor(null)}
            t={t}
          />
        )}

        {errors.length > 0 && (
          <div role="alert">
            {errors.map(error => (
              <p key={error}>{errorMessage(error, t)}</p>
            ))}
          </div>
        )}

        <div className="swipe-buttons">
          <button type="button" onClick={onCancel} className="btn-secondary">
            {t('planning.back', { defaultValue: 'Back' })}
          </button>
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="btn-secondary"
            >
              {t('planning.skip', {
                defaultValue: 'Continue without fixed route details',
              })}
            </button>
          )}
          <button type="button" onClick={complete} className="btn-primary">
            {t('planning.continue', {
              defaultValue: 'Continue with these fixed details',
            })}
          </button>
        </div>
        <p className="planning-storage-notice">
          {t('planning.storageNotice', {
            defaultValue:
              'If you save this plan, its selected place names and coordinates stay only in this browser until the plan expires or you press Start Over. They are not included in the share QR code.',
          })}
        </p>
      </div>
    </div>
  );
}
