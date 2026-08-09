import { fireEvent, render, screen } from '@testing-library/react';
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

test('a selected start keeps the recovery route and hides the no-details escape', () => {
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
      onSkip={jest.fn()}
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
  fireEvent.click(screen.getByLabelText('Add an end destination'));
  fireEvent.change(screen.getByLabelText('Where should your day finish?'), {
    target: { value: 'resolved:hotel' },
  });
  fireEvent.change(screen.getByLabelText('Optional arrival deadline'), {
    target: { value: '22:30' },
  });
  fireEvent.change(
    screen.getByLabelText(
      'Arrive this many minutes before the deadline',
    ),
    { target: { value: '10' } },
  );
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
        arrivalBufferMinutes: 10,
      }),
    }),
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
  fireEvent.click(screen.getByRole('button', { name: 'Add fixed anchor' }));
  fireEvent.change(screen.getByLabelText('Commitment name'), {
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
  fireEvent.change(screen.getByLabelText('Fixed start time'), {
    target: { value: '18:30' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add anchor' }));

  expect(screen.getByText('Locked anchor')).toBeInTheDocument();
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

  fireEvent.click(screen.getByRole('button', { name: 'Add fixed anchor' }));
  fireEvent.change(screen.getByLabelText('Commitment name'), {
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
  fireEvent.click(screen.getByRole('button', { name: 'Add anchor' }));

  fireEvent.click(screen.getByRole('button', { name: 'Edit Theatre' }));
  fireEvent.change(screen.getByLabelText('Commitment name'), {
    target: { value: 'Updated theatre' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save anchor' }));

  expect(screen.getByText('Updated theatre')).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole('button', { name: 'Remove Updated theatre' }),
  );

  expect(screen.queryByText('Updated theatre')).not.toBeInTheDocument();
  expect(screen.getByText('No fixed anchors added.')).toBeInTheDocument();
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
  expect(screen.getByLabelText('What time does your day start?')).toHaveValue(
    '10:00',
  );
});
