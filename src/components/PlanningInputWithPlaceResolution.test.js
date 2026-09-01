import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PlanningInputWithPlaceResolution from './PlanningInputWithPlaceResolution';
import { createPlaceRef } from '../models/geographicalPlan';
import { PLACE_RESOLUTION_ERROR } from '../api/placeResolutionApi';

const euston = createPlaceRef({
  id: 'euston-id',
  name: 'London Euston',
  address: 'Euston Road, London',
  coordinates: { lat: 51.5282, lng: -0.1337 },
  source: 'google_places',
});

const currentPlace = createPlaceRef({
  id: 'current-location',
  name: 'Current location',
  coordinates: { lat: 52.237, lng: -0.895 },
  source: 'current_gps',
});

const baseProps = () => ({
  onComplete: jest.fn(),
  onCancel: jest.fn(),
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

function chooseTenThirty() {
  fireEvent.click(screen.getByRole('button', { name: 'Morning' }));
  fireEvent.click(screen.getByRole('button', { name: '10' }));
  fireEvent.click(screen.getByRole('button', { name: ':30' }));
}

test('does not search while the user is typing', () => {
  const searchPlaces = jest.fn();
  render(<PlanningInputWithPlaceResolution {...baseProps()} searchPlaces={searchPlaces} t={t} />);

  fireEvent.change(screen.getByLabelText('Place, address, postcode or ZIP code'), {
    target: { value: 'London Euston' },
  });

  expect(searchPlaces).not.toHaveBeenCalled();
});

test('shows attributed verified matches without coordinates', async () => {
  const searchPlaces = jest.fn().mockResolvedValue([euston]);
  render(<PlanningInputWithPlaceResolution {...baseProps()} searchPlaces={searchPlaces} t={t} />);

  fireEvent.change(screen.getByLabelText('Place, address, postcode or ZIP code'), {
    target: { value: 'London Euston' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  expect(await screen.findByText('London Euston')).toBeInTheDocument();
  expect(searchPlaces).toHaveBeenCalledWith('London Euston');
  expect(screen.getByLabelText('Google Maps')).toBeInTheDocument();
  expect(screen.queryByText(/51\.5282|-0\.1337/)).not.toBeInTheDocument();
});

test('confirms a searched start area below its own search control', async () => {
  const { onComplete } = baseProps();
  render(
    <PlanningInputWithPlaceResolution
      {...baseProps()}
      onComplete={onComplete}
      searchPlaces={jest.fn().mockResolvedValue([euston])}
      t={t}
    />,
  );

  fireEvent.change(screen.getByLabelText('Place, address, postcode or ZIP code'), {
    target: { value: 'London Euston' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Start at London Euston' }));

  expect(screen.getByText('Start area set: London Euston, Euston Road, London')).toBeInTheDocument();
  expect(screen.getByText('Choose a start time to continue')).toBeInTheDocument();

  chooseTenThirty();
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(onComplete).toHaveBeenCalledWith(
    expect.objectContaining({ start: expect.objectContaining({ place: euston }) }),
  );
});

test('uses current location only after the user explicitly chooses it', () => {
  render(
    <PlanningInputWithPlaceResolution
      {...baseProps()}
      currentPlace={currentPlace}
      t={t}
    />,
  );

  expect(screen.queryByText('Start area set: your current location')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Use my current location' }));
  expect(screen.getByText('Start area set: your current location')).toBeInTheDocument();
});

test('explains unavailable current location without touching the search field', () => {
  render(<PlanningInputWithPlaceResolution {...baseProps()} t={t} />);

  fireEvent.click(screen.getByRole('button', { name: 'Use my current location' }));

  expect(screen.getByText("Location isn't available. Search for a place, address, postcode or ZIP code instead.")).toBeInTheDocument();
  expect(screen.getByLabelText('Place, address, postcode or ZIP code')).toHaveValue('');
});

test('sends a postcode unchanged to the place search', async () => {
  const searchPlaces = jest.fn().mockResolvedValue([]);
  render(<PlanningInputWithPlaceResolution {...baseProps()} searchPlaces={searchPlaces} t={t} />);

  fireEvent.change(screen.getByLabelText('Place, address, postcode or ZIP code'), {
    target: { value: 'NN1 1DP' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  await waitFor(() => expect(searchPlaces).toHaveBeenCalledWith('NN1 1DP'));
});

test('reports an unavailable place search honestly', async () => {
  render(
    <PlanningInputWithPlaceResolution
      {...baseProps()}
      searchPlaces={jest.fn().mockRejectedValue(new Error(PLACE_RESOLUTION_ERROR.NO_API_KEY))}
      t={t}
    />,
  );

  fireEvent.change(screen.getByLabelText('Place, address, postcode or ZIP code'), {
    target: { value: 'London Euston' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Verified place search is not available right now.',
    ),
  );
});
