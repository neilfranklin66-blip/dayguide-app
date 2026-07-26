import { fireEvent, render, screen } from '@testing-library/react';
import HardAnchorEditor from './HardAnchorEditor';
import { createHardAnchor, createPlaceRef } from '../models/geographicalPlan';

const theatrePlace = createPlaceRef({
  id: 'theatre-place',
  name: 'Theatre',
  coordinates: { lat: 51.511, lng: -0.127 },
  source: 'resolved_place',
});

test('hard anchor editor creates a planner-locked fixed commitment', () => {
  const onSave = jest.fn();
  render(
    <HardAnchorEditor
      anchorId="anchor-1"
      availablePlaces={[theatrePlace]}
      onSave={onSave}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(screen.getByLabelText('Commitment name'), {
    target: { value: 'Evening theatre' },
  });
  fireEvent.change(screen.getByLabelText('Fixed place'), {
    target: { value: 'resolved:theatre-place' },
  });
  fireEvent.change(screen.getByLabelText('Fixed start time'), {
    target: { value: '18:30' },
  });
  fireEvent.change(screen.getByLabelText('Duration in minutes'), {
    target: { value: '150' },
  });
  fireEvent.change(
    screen.getByLabelText('Arrive this many minutes early'),
    { target: { value: '20' } },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Add anchor' }));

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 'anchor-1',
      title: 'Evening theatre',
      place: theatrePlace,
      startTimeMinutes: 1110,
      durationMinutes: 150,
      arrivalBufferMinutes: 20,
      plannerLocked: true,
    }),
  );
});

test('hard anchor editor reports unresolved place instead of saving free text', () => {
  const onSave = jest.fn();
  render(
    <HardAnchorEditor
      anchorId="anchor-1"
      onSave={onSave}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(screen.getByLabelText('Commitment name'), {
    target: { value: 'Theatre' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add anchor' }));

  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Choose a verified place',
  );
});

test('hard anchor editor updates an existing anchor without changing its id', () => {
  const initialAnchor = createHardAnchor({
    id: 'anchor-7',
    title: 'Theatre',
    place: theatrePlace,
    startTimeMinutes: 1110,
    durationMinutes: 120,
    arrivalBufferMinutes: 15,
  });
  const onSave = jest.fn();
  render(
    <HardAnchorEditor
      anchorId="anchor-7"
      initialAnchor={initialAnchor}
      availablePlaces={[theatrePlace]}
      onSave={onSave}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(screen.getByLabelText('Commitment name'), {
    target: { value: 'Updated theatre' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save anchor' }));

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 'anchor-7',
      title: 'Updated theatre',
      plannerLocked: true,
    }),
  );
});
