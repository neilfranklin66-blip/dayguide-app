import { fireEvent, render, screen } from '@testing-library/react';
import ResolvedPlaceSelect from './ResolvedPlaceSelect';
import { createPlaceRef } from '../models/geographicalPlan';
import { PLACE_SELECTION_MODE } from '../utils/planningInputWorkflow';

const currentPlace = createPlaceRef({
  id: 'current',
  name: 'Current location',
  coordinates: { lat: 51.5, lng: -0.1 },
  source: 'current_gps',
});

const euston = createPlaceRef({
  id: 'euston',
  name: 'London Euston',
  address: 'Euston Road',
  coordinates: { lat: 51.5282, lng: -0.1337 },
  source: 'resolved_place',
});

test('place selector distinguishes current location from another resolved place', () => {
  const onChange = jest.fn();
  render(
    <ResolvedPlaceSelect
      id="start-place"
      label="Where does your day start?"
      selection={null}
      onChange={onChange}
      currentPlace={currentPlace}
      availablePlaces={[euston]}
    />,
  );

  expect(
    screen.getByRole('option', { name: /Use my current location/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('option', { name: 'London Euston — Euston Road' }),
  ).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Where does your day start?'), {
    target: { value: 'resolved:euston' },
  });

  expect(onChange).toHaveBeenCalledWith({
    mode: PLACE_SELECTION_MODE.RESOLVED_PLACE,
    place: euston,
  });
});

test('place selector never offers unresolved free text as a routable place', () => {
  render(
    <ResolvedPlaceSelect
      id="start-place"
      label="Start"
      selection={null}
      onChange={jest.fn()}
      availablePlaces={[{ id: 'text', name: 'Free text only' }]}
    />,
  );

  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByRole('combobox')).toBeDisabled();
  expect(
    screen.getByText('No verified places are available yet.'),
  ).toBeInTheDocument();
});

test('place selector can clear an optional destination', () => {
  const onChange = jest.fn();
  render(
    <ResolvedPlaceSelect
      id="end-place"
      label="End"
      selection={{
        mode: PLACE_SELECTION_MODE.RESOLVED_PLACE,
        place: euston,
      }}
      onChange={onChange}
      availablePlaces={[euston]}
      allowNone
    />,
  );

  fireEvent.change(screen.getByLabelText('End'), {
    target: { value: '' },
  });

  expect(onChange).toHaveBeenCalledWith(null);
});

test('a restored current-location selection remains available without fresh GPS', () => {
  render(
    <ResolvedPlaceSelect
      id="restored-start"
      label="Start"
      selection={{
        mode: PLACE_SELECTION_MODE.CURRENT_LOCATION,
        place: currentPlace,
      }}
      onChange={jest.fn()}
      currentPlace={null}
      availablePlaces={[currentPlace]}
    />,
  );

  expect(screen.getByRole('combobox')).toHaveValue('current_location');
  expect(
    screen.getAllByRole('option', { name: /Use my current location/ }),
  ).toHaveLength(1);
});
