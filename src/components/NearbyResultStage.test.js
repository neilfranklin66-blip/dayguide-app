import { fireEvent, render, screen } from '@testing-library/react';
import NearbyResultStage from './NearbyResultStage';

const result = {
  type: 'food',
  place: {
    name: 'Live Test Bistro',
    venueType: 'Restaurant',
    rating: 4.7,
    distance: 0.3,
    address: '1 Test Street',
    mapsUrl: 'https://maps.example.test/live-test-bistro',
  },
};

test('shows one chosen nearby live place with its Maps action, not an itinerary', () => {
  render(<NearbyResultStage result={result} onStartOver={jest.fn()} onFindAnother={jest.fn()} />);

  expect(screen.getByRole('heading', { name: 'Live Test Bistro' })).toBeInTheDocument();
  expect(screen.getByText('Live from Google Places')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Open in Maps' })).toHaveAttribute(
    'href',
    result.place.mapsUrl,
  );
  expect(screen.queryByText(/Travel-time guidance/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Itinerary/i)).not.toBeInTheDocument();
});

test('lets the user find another result or start again', () => {
  const onFindAnother = jest.fn();
  const onStartOver = jest.fn();
  render(
    <NearbyResultStage
      result={result}
      onFindAnother={onFindAnother}
      onStartOver={onStartOver}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Find another' }));
  fireEvent.click(screen.getByRole('button', { name: 'Start over' }));

  expect(onFindAnother).toHaveBeenCalledTimes(1);
  expect(onStartOver).toHaveBeenCalledTimes(1);
});
