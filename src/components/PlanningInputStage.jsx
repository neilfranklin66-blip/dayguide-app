import React, { useState } from 'react';
import HardAnchorEditor from './HardAnchorEditor';
import ResolvedPlaceSelect from './ResolvedPlaceSelect';
import {
  PLANNING_INPUT_ERROR,
  createPlanningInputDraft,
  finalizePlanningInput,
  minutesToTimeInput,
  removeHardAnchor,
  setDepartureTime,
  setDestinationEnabled,
  setDestinationSelection,
  setDestinationTiming,
  setStartSelection,
  timeInputToMinutes,
  upsertHardAnchor,
} from '../utils/planningInputWorkflow';

const errorMessage = error => ({
  [PLANNING_INPUT_ERROR.START_PLACE_REQUIRED]:
    'Choose a verified starting place.',
  [PLANNING_INPUT_ERROR.START_TIME_INVALID]:
    'Choose a valid start time.',
  [PLANNING_INPUT_ERROR.DESTINATION_PLACE_REQUIRED]:
    'Choose a verified destination or remove the destination.',
  [PLANNING_INPUT_ERROR.DESTINATION_DEADLINE_INVALID]:
    'Check the destination deadline and arrival buffer.',
  [PLANNING_INPUT_ERROR.ANCHOR_INVALID]:
    'One or more fixed anchors is invalid.',
  [PLANNING_INPUT_ERROR.ANCHOR_ID_RESERVED]:
    'A fixed anchor has an invalid identifier.',
  [PLANNING_INPUT_ERROR.ANCHOR_ID_DUPLICATE]:
    'Two fixed anchors have the same identifier.',
}[error] ?? 'Check the geographical planning details.');

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
        <h2>Where should your day flow?</h2>
        <p>
          Set a starting place, an optional destination, and any commitments
          that DayGuide must never move.
        </p>

        <ResolvedPlaceSelect
          id="planning-start-place"
          label="Where does your day start?"
          selection={draft.startSelection}
          onChange={selection =>
            setDraft(current => setStartSelection(current, selection))
          }
          currentPlace={currentPlace}
          availablePlaces={availablePlaces}
        />

        <div className="time-selector">
          <label htmlFor="planning-start-time">What time does your day start?</label>
          <input
            id="planning-start-time"
            type="time"
            value={minutesToTimeInput(draft.departureTimeMinutes)}
            onChange={event => updateStartTime(event.target.value)}
            className="time-input"
          />
        </div>

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
            Add an end destination
          </label>
        </div>

        {draft.destination.enabled && (
          <>
            <ResolvedPlaceSelect
              id="planning-end-place"
              label="Where should your day finish?"
              selection={draft.destination.selection}
              onChange={selection =>
                setDraft(current =>
                  setDestinationSelection(current, selection),
                )
              }
              currentPlace={currentPlace}
              availablePlaces={availablePlaces}
            />

            <div className="time-selector">
              <label htmlFor="planning-end-deadline">
                Optional arrival deadline
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
                  Arrive this many minutes before the deadline
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
          <h3 id="hard-anchors-title">Fixed anchors</h3>
          <p className="start-order-hint">
            These commitments are locked against automatic replanning.
          </p>

          {draft.anchors.length === 0 && <p>No fixed anchors added.</p>}
          {draft.anchors.map(anchor => (
            <article key={anchor.id} className="swipe-item">
              <p className="card-type-label">Locked anchor</p>
              <h4>{anchor.title}</h4>
              <p>{anchor.place.name}</p>
              <p>
                {minutesToTimeInput(anchor.startTimeMinutes)} ·{' '}
                {anchor.durationMinutes} minutes · arrive{' '}
                {anchor.arrivalBufferMinutes} minutes early
              </p>
              <div className="swipe-buttons">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditor({ anchor })}
                >
                  Edit {anchor.title}
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
                  Remove {anchor.title}
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
              Add fixed anchor
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
          />
        )}

        {errors.length > 0 && (
          <div role="alert">
            {errors.map(error => (
              <p key={error}>{errorMessage(error)}</p>
            ))}
          </div>
        )}

        <div className="swipe-buttons">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Back
          </button>
          <button type="button" onClick={complete} className="btn-primary">
            Continue with these fixed details
          </button>
        </div>
      </div>
    </div>
  );
}
