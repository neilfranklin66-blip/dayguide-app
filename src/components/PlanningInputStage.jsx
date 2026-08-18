import React, { useState } from 'react';
import HardAnchorEditor from './HardAnchorEditor';
import DateSelector from './DateSelector';
import DirectTimeInput from './DirectTimeInput';
import ResolvedPlaceSelect from './ResolvedPlaceSelect';
import StartTimeSelector from './StartTimeSelector';
import {
  PLANNING_INPUT_ERROR,
  createPlanningInputDraft,
  finalizePlanningInput,
  isResolvedPlaceSelection,
  minutesToTimeInput,
  removeHardAnchor,
  setDestinationEnabled,
  setDestinationSelection,
  setDestinationTiming,
  setDepartureTime,
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
  draft: controlledDraft = null,
  onDraftChange = null,
  startPlaceControl = null,
  destinationPlaceControl = null,
  anchorSearchPlaces = undefined,
  onComplete,
  onCancel,
  selectedDate,
  onSelectedDateChange,
  t = fallbackT,
}) {
  const [internalDraft, setInternalDraft] = useState(
    initialDraft ?? createPlanningInputDraft(),
  );
  const draft = controlledDraft ?? internalDraft;
  const updateDraft = onDraftChange ?? setInternalDraft;
  const [editor, setEditor] = useState(null);
  const [errors, setErrors] = useState([]);
  const [laterPlansOpen, setLaterPlansOpen] = useState(
    () => draft.destination.enabled || draft.anchors.length > 0,
  );

  const updateDestinationDeadline = value => {
    const minutes = value === '' ? null : timeInputToMinutes(value);
    updateDraft(current =>
      setDestinationTiming(current, {
        arrivalDeadlineMinutes: minutes,
        arrivalBufferMinutes:
          minutes == null ? 0 : current.destination.arrivalBufferMinutes,
      }),
    );
  };

  const saveAnchor = anchor => {
    updateDraft(current => upsertHardAnchor(current, anchor));
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
  const hasSelectedStart = isResolvedPlaceSelection(draft.startSelection);
  const destinationNeedsPlace =
    draft.destination.enabled &&
    !isResolvedPlaceSelection(draft.destination.selection);

  return (
    <div className="dayguide-container">
      <div className="card planning-input-stage">
        <h2>{t('planning.title', { defaultValue: 'Plan a day' })}</h2>
        <p className="planning-stage-intro">
          {t('planning.simpleIntro', {
            defaultValue: 'Start with the essentials. You can add one important stop later.',
          })}
        </p>

        {selectedDate && onSelectedDateChange && (
          <DateSelector
            selectedDate={selectedDate}
            onChange={onSelectedDateChange}
            t={t}
            id="planning-date"
          />
        )}

        <StartTimeSelector
          startTime={draft.departureTimeMinutes / 60}
          onChange={value =>
            updateDraft(current =>
              setDepartureTime(current, Math.round(value * 60)),
            )
          }
          heading={t('planning.startTime', {
            defaultValue: 'What time would you like to start?',
          })}
          t={t}
        />

        {startPlaceControl ?? (
          <ResolvedPlaceSelect
            id="planning-start-place"
            label={t('planning.startPlace', {
              defaultValue: 'Where does your day start?',
            })}
            selection={draft.startSelection}
            onChange={selection =>
              updateDraft(current => setStartSelection(current, selection))
            }
            currentPlace={currentPlace}
            availablePlaces={availablePlaces}
            t={t}
          />
        )}

        <section className="later-plans-panel">
          <button
            type="button"
            className="later-plans-toggle"
            aria-expanded={laterPlansOpen}
            onClick={() => setLaterPlansOpen(current => !current)}
          >
            {t('planning.laterPlansPrompt', {
              defaultValue: 'Add a finish or one important time',
            })}
          </button>

          {laterPlansOpen && (
            <>
          {destinationPlaceControl ?? (
            <ResolvedPlaceSelect
              id="planning-end-place"
              label={t('planning.destinationPlace', {
                defaultValue: 'Where should your day finish?',
              })}
              selection={draft.destination.selection}
              onChange={selection =>
                updateDraft(current =>
                  setDestinationSelection(current, selection),
                )
              }
              currentPlace={currentPlace}
              availablePlaces={availablePlaces}
              t={t}
            />
          )}

          {destinationNeedsPlace && (
            <div className="destination-choice-notice" role="status">
              <p>
                {t('planning.destinationSelectionNeeded', {
                  defaultValue:
                    'Choose a verified finish, or remove the destination.',
                })}
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  updateDraft(current => setDestinationEnabled(current, false));
                  setErrors([]);
                }}
              >
                {t('planning.removeDestination', {
                  defaultValue: 'Remove end destination',
                })}
              </button>
            </div>
          )}

          {isResolvedPlaceSelection(draft.destination.selection) && (
            <div className="later-plan-timing">
            <DirectTimeInput
              id="planning-end-deadline"
              value={destinationDeadline}
              label={t('planning.destinationDeadline', {
                defaultValue: 'What time do you need to be there?',
              })}
              onChange={updateDestinationDeadline}
              allowEmpty
            />

            <button
              type="button"
              className="later-plan-option"
              aria-pressed={!destinationDeadline}
              onClick={() => updateDestinationDeadline('')}
            >
              {t('planning.noDeadline', { defaultValue: 'No fixed time' })}
            </button>
            </div>
          )}

          <section aria-label={t('planning.addAnchor', {
            defaultValue: 'Add one important time',
          })}>
          {draft.anchors.map(anchor => (
            <article key={anchor.id} className="later-plan-card">
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
                    updateDraft(current =>
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

          {!editor && draft.anchors.length === 0 && (
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
              {t('planning.addAnchorAction', {
                defaultValue: 'Add one important time',
              })}
            </button>
          )}
          </section>
            </>
          )}
        </section>

        {editor && (
          <HardAnchorEditor
            key={editor.anchor?.id ?? editor.anchorId}
            anchorId={editor.anchor?.id ?? editor.anchorId}
            initialAnchor={editor.anchor}
            currentPlace={currentPlace}
            availablePlaces={availablePlaces}
            searchPlaces={anchorSearchPlaces}
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
          <button
            type="button"
            onClick={complete}
            className="btn-primary"
            disabled={!hasSelectedStart}
          >
            {t('planning.continue', {
              defaultValue: 'Continue with these fixed details',
            })}
          </button>
        </div>
      </div>
    </div>
  );
}
