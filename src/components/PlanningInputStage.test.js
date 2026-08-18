import { fireEvent, render, screen, within } from '@testing-library/react';
import PlanningInputStage from './PlanningInputStage';
import { createPlaceRef } from '../models/geographicalPlan';
import {
  PLACE_SELECTION_MODE,
  createPlaceSelection,
  createPlanningInputDraft,
  setStartSelection,
} from '../utils/planningInputWorkflow';

const currentPlace = createPlaceRef({
  id: 'current',
  name: 'Current location',
  coordinates: { lat: 51.5, lng: -0.1 },
  source: 'current_gps',
  timezone: 'Europe/London',
});

const euston = createPlaceRef({
  id: 'euston',
  name: 'London Euston',
  coordinates: { lat: 51.5282, lng: -0.1337 },
  source: 'resolved_place',
  timezone: 'Europe/London',
});

const theatre = createPlaceRef({
  id: 'theatre',
  name: 'Theatre',
  coordinates: { lat: 51.511, lng: -0.127 },
  source: 'resolved_place',
  timezone: 'Europe/London',
});

const hotel = createPlaceRef({
  id: 'hotel',
  name: 'Southwark Hotel',
  coordinates: { lat: 51.503, lng: -0.09 },
  source: 'resolved_place',
  timezone: 'Europe/London',
});

const availablePlaces = [euston, theatre, hotel];

test('planning input stage disables fixed-details continuation until a verified start is selected', () => {
  const onComplete = jest.fn();
  render(
    <PlanningInputStage
      availablePlaces={availablePlaces}
      onComplete={onComplete}
      onCancel={jest.fn()}
    />,
  );

  expect(
    screen.getByRole('button', {
      name: 'Continue with these fixed details',
    }),
  ).toBeDisabled();
  expect(onComplete).not.toHaveBeenCalled();
});

test('keeps optional later plans together and closed until wanted', () => {
  render(
    <PlanningInputStage
      availablePlaces={availablePlaces}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

  expect(
    screen.getByRole('button', { name: 'Need to be somewhere later?' }),
  ).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByLabelText('Where should your day finish?')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Need to be somewhere later?' }));
  expect(screen.getByLabelText('Where should your day finish?')).toBeInTheDocument();
});

test('a selected start enables continuation without an old no-details escape', () => {
  const draft = setStartSelection(
    createPlanningInputDraft(),
    createPlaceSelection({
      mode: PLACE_SELECTION_MODE.RESOLVED_PLACE,
      place: euston,
    }),
  );

  render(
    <PlanningInputStage
      availablePlaces={availablePlaces}
      initialDraft={draft}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

  expect(screen.queryByText('Continue without fixed route details')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue with these fixed details' })).toBeEnabled();
});

test('planning input stage distinguishes current GPS from another start place', () => {
  const onComplete = jest.fn();
  render(
    <PlanningInputStage
      currentPlace={currentPlace}
      availablePlaces={availablePlaces}
      onComplete={onComplete}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(screen.getByLabelText('Where does your day start?'), {
    target: { value: 'current_location' },
  });
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Continue with these fixed details',
    }),
  );

  expect(onComplete).toHaveBeenCalledWith(
    expect.objectContaining({
      start: expect.objectContaining({
        place: currentPlace,
      }),
      locationProvenance: {
        start: PLACE_SELECTION_MODE.CURRENT_LOCATION,
        end: null,
      },
    }),
  );
});

test('planning input stage collects a destination and optional deadline', () => {
  const onComplete = jest.fn();
  render(
    <PlanningInputStage
      currentPlace={currentPlace}
      availablePlaces={availablePlaces}
      onComplete={onComplete}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(screen.getByLabelText('Where does your day start?'), {
    target: { value: 'resolved:euston' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Need to be somewhere later?' }));
  fireEvent.change(screen.getByLabelText('Where should your day finish?'), {
    target: { value: 'resolved:hotel' },
  });
  const deadlinePicker = screen
    .getByRole('heading', { name: 'What time do you need to be there?' })
    .closest('section');
  fireEvent.click(
    within(deadlinePicker).getByRole('button', {
      name: 'Afternoon / evening',
    }),
  );
  fireEvent.click(within(deadlinePicker).getByRole('button', { name: '10' }));
  fireEvent.click(within(deadlinePicker).getByRole('button', { name: ':30' }));
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Continue with these fixed details',
    }),
  );

  expect(onComplete).toHaveBeenCalledWith(
    expect.objectContaining({
      start: expect.objectContaining({ place: euston }),
      end: expect.objectContaining({
        place: hotel,
        arrivalDeadlineMinutes: 1350,
        arrivalBufferMinutes: 0,
      }),
    }),
  );
});

test('a later-plan section can be opened and left unused', () => {
  const onComplete = jest.fn();
  render(
    <PlanningInputStage
      availablePlaces={availablePlaces}
      onComplete={onComplete}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(screen.getByLabelText('Where does your day start?'), {
    target: { value: 'resolved:euston' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Need to be somewhere later?' }));
  expect(screen.getByLabelText('Where should your day finish?')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Continue with these fixed details' }));
  expect(onComplete).toHaveBeenCalledWith(
    expect.objectContaining({ end: null }),
  );
});

test('planning input stage adds and completes with a planner-locked anchor', async () => {
  const onComplete = jest.fn();
  const anchorSearchPlaces = jest.fn().mockResolvedValue([theatre]);
  render(
    <PlanningInputStage
      currentPlace={currentPlace}
      availablePlaces={availablePlaces}
      onComplete={onComplete}
      onCancel={jest.fn()}
      anchorSearchPlaces={anchorSearchPlaces}
    />,
  );

  fireEvent.change(screen.getByLabelText('Where does your day start?'), {
    target: { value: 'resolved:euston' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Need to be somewhere later?' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add one important time' }));
  fireEvent.change(screen.getByLabelText('What is it?'), {
    target: { value: 'Evening theatre' },
  });
  fireEvent.change(screen.getByLabelText('Place, address, postcode or ZIP code'), {
    target: { value: 'Theatre' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  fireEvent.click(
    await screen.findByRole('button', {
      name: 'Use Theatre for this commitment',
    }),
  );
  fireEvent.change(screen.getByLabelText('What time do you need to be there?'), {
    target: { value: '18:30' },
  });
  fireEvent.blur(screen.getByLabelText('What time do you need to be there?'));
  fireEvent.click(screen.getByRole('button', { name: 'Add a time' }));

  expect(screen.getByText('Evening theatre')).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Continue with these fixed details',
    }),
  );

  expect(onComplete).toHaveBeenCalledWith(
    expect.objectContaining({
      anchors: [
        expect.objectContaining({
          title: 'Evening theatre',
          startTimeMinutes: 1110,
          plannerLocked: true,
        }),
      ],
    }),
  );
});

test('planning input stage edits and removes a fixed anchor deliberately', async () => {
  const anchorSearchPlaces = jest.fn().mockResolvedValue([theatre]);
  render(
    <PlanningInputStage
      currentPlace={currentPlace}
      availablePlaces={availablePlaces}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
      anchorSearchPlaces={anchorSearchPlaces}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Need to be somewhere later?' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add one important time' }));
  fireEvent.change(screen.getByLabelText('What is it?'), {
    target: { value: 'Theatre' },
  });
  fireEvent.change(screen.getByLabelText('Place, address, postcode or ZIP code'), {
    target: { value: 'Theatre' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  fireEvent.click(
    await screen.findByRole('button', {
      name: 'Use Theatre for this commitment',
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Add a time' }));

  fireEvent.click(screen.getByRole('button', { name: 'Edit Theatre' }));
  fireEvent.change(screen.getByLabelText('What is it?'), {
    target: { value: 'Updated theatre' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save important time' }));

  expect(screen.getByText('Updated theatre')).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole('button', { name: 'Remove Updated theatre' }),
  );

  expect(screen.queryByText('Updated theatre')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add one important time' })).toBeInTheDocument();
});

test('planning input stage can begin from a preselected draft', () => {
  const initialDraft = setStartSelection(
    createPlanningInputDraft({ departureTimeMinutes: 10 * 60 }),
    createPlaceSelection({
      mode: PLACE_SELECTION_MODE.RESOLVED_PLACE,
      place: euston,
    }),
  );

  render(
    <PlanningInputStage
      initialDraft={initialDraft}
      availablePlaces={availablePlaces}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

  expect(screen.getByLabelText('Where does your day start?')).toHaveValue(
    'resolved:euston',
  );
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByText('10:00 am')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '2', pressed: false }));
  fireEvent.click(screen.getByRole('button', { name: ':30', pressed: false }));

  expect(screen.getByText('2:30 am')).toBeInTheDocument();
});
