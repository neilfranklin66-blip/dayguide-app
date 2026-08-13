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

const theatre = createPlaceRef({
  id: 'theatre-id',
  name: 'Royal Theatre',
  address: 'Guildhall Road, Northampton',
  coordinates: { lat: 52.237, lng: -0.895 },
  source: 'google_places',
});

const currentPlace = createPlaceRef({
  id: 'current-location',
  name: 'Current location',
  coordinates: { lat: 52.237, lng: -0.895 },
  source: 'current_gps',
});

test('does not search while the user is typing', () => {
  const searchPlaces = jest.fn();
  render(
    <PlanningInputWithPlaceResolution
      searchPlaces={searchPlaces}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(
    screen.getByLabelText('Place, address, postcode or ZIP code'),
    {
    target: { value: 'London Euston' },
    },
  );

  expect(searchPlaces).not.toHaveBeenCalled();
});

test('shows and holds an honest loading state until search completes', async () => {
  let finishSearch;
  const searchPlaces = jest.fn(
    () =>
      new Promise(resolve => {
        finishSearch = resolve;
      }),
  );
  render(
    <PlanningInputWithPlaceResolution
      searchPlaces={searchPlaces}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(
    screen.getByLabelText('Place, address, postcode or ZIP code'),
    {
    target: { value: 'London Euston' },
    },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  expect(
    screen.getByRole('button', { name: 'Searching...' }),
  ).toBeDisabled();
  fireEvent.submit(
    screen
      .getByLabelText('Place, address, postcode or ZIP code')
      .closest('form'),
  );
  expect(searchPlaces).toHaveBeenCalledTimes(1);

  finishSearch([]);
  expect(
    await screen.findByText(
      'No verified matches were found. Try a station name, venue, hotel or fuller address.',
    ),
  ).toBeInTheDocument();
});
test('rejects a short query locally without a provider call', () => {
  const searchPlaces = jest.fn();
  render(
    <PlanningInputWithPlaceResolution
      searchPlaces={searchPlaces}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(
    screen.getByLabelText('Place, address, postcode or ZIP code'),
    {
    target: { value: 'x' },
    },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  expect(searchPlaces).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Enter between 3 and 120 characters.',
  );
});

test('shows attributed verified matches without exposing coordinates', async () => {
  const searchPlaces = jest.fn().mockResolvedValue([euston]);
  render(
    <PlanningInputWithPlaceResolution
      searchPlaces={searchPlaces}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(
    screen.getByLabelText('Place, address, postcode or ZIP code'),
    {
    target: { value: 'London Euston' },
    },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  expect(await screen.findByText('London Euston')).toBeInTheDocument();
  expect(searchPlaces).toHaveBeenCalledWith('London Euston');
  expect(screen.getByLabelText('Google Maps')).toBeInTheDocument();
  expect(screen.getByText('Euston Road, London')).toBeInTheDocument();
  expect(screen.queryByText(/51\.5282|-0\.1337/)).not.toBeInTheDocument();
});

test('selects a searched start place directly and completes with it', async () => {
  const onComplete = jest.fn();
  render(
    <PlanningInputWithPlaceResolution
      searchPlaces={jest.fn().mockResolvedValue([euston])}
      onComplete={onComplete}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(
    screen.getByLabelText('Place, address, postcode or ZIP code'),
    {
    target: { value: 'London Euston' },
    },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  fireEvent.click(
    await screen.findByRole('button', { name: 'Start at London Euston' }),
  );

  expect(
    screen.getByText(
      'Your day will start at London Euston.',
    ),
  ).toBeInTheDocument();
  expect(
    screen.queryByLabelText('Where does your day start?'),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Continue with these fixed details',
    }),
  );

  expect(onComplete).toHaveBeenCalledWith(
    expect.objectContaining({
      start: expect.objectContaining({ place: euston }),
      anchors: [],
      end: null,
    }),
  );
});

test('uses the available current location only after the user explicitly chooses it', () => {
  render(
    <PlanningInputWithPlaceResolution
      currentPlace={currentPlace}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

  expect(screen.queryByText('Your day will start at Current location.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Use my current location — Current location' }));

  expect(screen.getByText('Your day will start at Current location.')).toBeInTheDocument();
});

test('sends a postcode unchanged to the place search', async () => {
  const searchPlaces = jest.fn().mockResolvedValue([]);
  render(
    <PlanningInputWithPlaceResolution
      searchPlaces={searchPlaces}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(
    screen.getByLabelText('Place, address, postcode or ZIP code'),
    { target: { value: 'NN1 1DP' } },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  await waitFor(() =>
    expect(searchPlaces).toHaveBeenCalledWith('NN1 1DP'),
  );
  await screen.findByText(
    'No verified matches were found. Try a station name, venue, hotel or fuller address.',
  );
});

test('selects a different searched destination without replacing the start', async () => {
  const onComplete = jest.fn();
  const searchPlaces = jest.fn(query =>
    Promise.resolve(query === 'London Euston' ? [euston] : [theatre]),
  );
  render(
    <PlanningInputWithPlaceResolution
      searchPlaces={searchPlaces}
      onComplete={onComplete}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(
    screen.getByLabelText('Place, address, postcode or ZIP code'),
    { target: { value: 'London Euston' } },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  fireEvent.click(
    await screen.findByRole('button', { name: 'Start at London Euston' }),
  );

  fireEvent.click(
    screen.getByRole('button', { name: 'Add a finish or one important time' }),
  );
  fireEvent.change(
    screen.getByLabelText(
      'Place, address, postcode or ZIP code for your destination',
    ),
    { target: { value: 'Royal Theatre' } },
  );
  fireEvent.click(screen.getAllByRole('button', { name: 'Search' }).at(-1));
  fireEvent.click(
    await screen.findByRole('button', { name: 'Finish at Royal Theatre' }),
  );

  expect(screen.getByText('Your day will start at London Euston.')).toBeInTheDocument();
  expect(screen.getByText('Your day will finish at Royal Theatre.')).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Continue with these fixed details',
    }),
  );

  expect(onComplete).toHaveBeenCalledWith(
    expect.objectContaining({
      start: expect.objectContaining({ place: euston }),
      end: expect.objectContaining({ place: theatre }),
    }),
  );
});

test('deduplicates repeated provider matches and keeps the chosen start place available', async () => {
  render(
    <PlanningInputWithPlaceResolution
      initialPlaces={[euston]}
      searchPlaces={jest.fn().mockResolvedValue([euston, euston])}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(
    screen.getByLabelText('Place, address, postcode or ZIP code'),
    {
    target: { value: 'London Euston' },
    },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  expect(
    await screen.findAllByRole('button', { name: 'Start at London Euston' }),
  ).toHaveLength(1);
  fireEvent.click(
    screen.getByRole('button', { name: 'Start at London Euston' }),
  );
  expect(
    screen.getByText('Your day will start at London Euston.'),
  ).toBeInTheDocument();
});

test('shows an honest zero-results state', async () => {
  render(
    <PlanningInputWithPlaceResolution
      searchPlaces={jest.fn().mockResolvedValue([])}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(
    screen.getByLabelText('Place, address, postcode or ZIP code'),
    {
    target: { value: 'Unknown station' },
    },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  expect(
    await screen.findByText(
      'No verified matches were found. Try a station name, venue, hotel or fuller address.',
    ),
  ).toBeInTheDocument();
  expect(
    screen.queryByLabelText('Verified place matches'),
  ).not.toBeInTheDocument();
});

test.each([
  [
    PLACE_RESOLUTION_ERROR.NO_API_KEY,
    'Verified place search is not available right now.',
  ],
  [
    PLACE_RESOLUTION_ERROR.QUOTA_EXCEEDED,
    'The place-search limit has been reached. Try again later.',
  ],
  [
    PLACE_RESOLUTION_ERROR.NETWORK_ERROR,
    'Check your connection, then try the place search again.',
  ],
])('reports %s honestly', async (code, expectedMessage) => {
  render(
    <PlanningInputWithPlaceResolution
      searchPlaces={jest.fn().mockRejectedValue(new Error(code))}
      onComplete={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(
    screen.getByLabelText('Place, address, postcode or ZIP code'),
    {
    target: { value: 'London Euston' },
    },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent(expectedMessage),
  );
});
