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
  const searchPlaces = jest.fn().mockResolvedValue([theatrePlace]);
  render(
    <HardAnchorEditor
      anchorId="anchor-1"
      onSave={onSave}
      onCancel={jest.fn()}
      searchPlaces={searchPlaces}
    />,
  );

  fireEvent.change(screen.getByLabelText('What is it?'), {
    target: { value: 'Evening theatre' },
  });
  fireEvent.change(screen.getByLabelText('Place, address, postcode or ZIP code'), {
    target: { value: 'Theatre' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  return screen.findByRole('button', { name: 'Use Theatre for this commitment' }).then(selectButton => {
    fireEvent.click(selectButton);
    fireEvent.change(screen.getByLabelText('What time do you need to be there?'), {
    target: { value: '18:30' },
    });
    fireEvent.blur(screen.getByLabelText('What time do you need to be there?'));
    fireEvent.change(screen.getByLabelText('How long will it take?'), {
      target: { value: '150' },
    });
    fireEvent.change(
      screen.getByLabelText('Allow extra time before'),
      { target: { value: '20' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add a time' }));

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

  fireEvent.change(screen.getByLabelText('What is it?'), {
    target: { value: 'Theatre' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add a time' }));

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

  fireEvent.change(screen.getByLabelText('What is it?'), {
    target: { value: 'Updated theatre' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save time' }));

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 'anchor-7',
      title: 'Updated theatre',
      plannerLocked: true,
    }),
  );
});
