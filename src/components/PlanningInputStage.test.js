import { fireEvent, render, screen } from '@testing-library/react';
import PlanningInputStage from './PlanningInputStage';
import { createPlaceRef } from '../models/geographicalPlan';
import {
  PLACE_SELECTION_MODE,
  createPlaceSelection,
  createPlanningInputDraft,
  setStartSelection,
} from '../utils/planningInputWorkflow';

const euston = createPlaceRef({
  id: 'euston',
  name: 'London Euston',
  address: 'Euston Road, London',
  coordinates: { lat: 51.5282, lng: -0.1337 },
  source: 'google_places',
  timezone: 'Europe/London',
});

const copy = {
  'interests.timeNow': 'Now',
  'interests.timeIn1Hour': 'In 1 hour',
  'interests.timeIn2Hours': 'In 2 hours',
  'interests.pickTime': 'Or pick a time',
  'interests.morning': 'Morning',
  'interests.afternoonEvening': 'Afternoon / evening',
  'interests.hourLabel': 'Hour',
  'interests.minuteLabel': 'Minutes',
};
const t = (key, options) => copy[key] ?? options?.defaultValue ?? key;
const today = new Date().toISOString().slice(0, 10);

function draftWithStart() {
  return setStartSelection(
    createPlanningInputDraft({ departureTimeMinutes: null }),
    createPlaceSelection({
      mode: PLACE_SELECTION_MODE.RESOLVED_PLACE,
      place: euston,
    }),
  );
}

test('shows only the approved start time and start area essentials', () => {
  render(
    <PlanningInputStage
      initialDraft={createPlanningInputDraft({ departureTimeMinutes: null })}
      selectedDate={today}
      onSelectedDateChange={jest.fn()}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
      t={t}
    />,
  );

  expect(screen.getByRole('heading', { name: 'Plan your day' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'When would you like to start?' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Where will you start?' })).toBeInTheDocument();
  expect(screen.getByText('No start time chosen yet')).toBeInTheDocument();
  expect(screen.getByText('Choose a start time and a start area to continue')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  expect(screen.queryByText('Need to be somewhere later?')).not.toBeInTheDocument();
  expect(screen.queryByText('Add one important time')).not.toBeInTheDocument();
});

test('enables continuation only after a tap-selected time and start area', () => {
  const onComplete = jest.fn();
  render(
    <PlanningInputStage
      initialDraft={draftWithStart()}
      selectedDate={today}
      onSelectedDateChange={jest.fn()}
      onComplete={onComplete}
      onCancel={jest.fn()}
      t={t}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Morning' }));
  fireEvent.click(screen.getByRole('button', { name: '10' }));
  fireEvent.click(screen.getByRole('button', { name: ':30' }));

  expect(screen.getByText('Starting Today at 10:30 am')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

  expect(onComplete).toHaveBeenCalledWith(
    expect.objectContaining({
      start: expect.objectContaining({
        place: euston,
        departureTimeMinutes: 10 * 60 + 30,
      }),
      anchors: [],
      end: null,
    }),
  );
});

test('uses the chosen date in the start-time confirmation', () => {
  render(
    <PlanningInputStage
      initialDraft={draftWithStart()}
      selectedDate="2026-08-29"
      onSelectedDateChange={jest.fn()}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
      t={t}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Afternoon / evening' }));
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  fireEvent.click(screen.getByRole('button', { name: ':00' }));

  expect(screen.getByText('Starting Sat 29 Aug at 2:00 pm')).toBeInTheDocument();
});
