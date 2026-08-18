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
    photoUrl: 'https://images.example.test/live-test-bistro.jpg',
    photoAttributions: [{ name: 'Test photographer' }],
    photoMapsUrl: 'https://maps.example.test/live-test-bistro-photo',
  },
};

test('shows one chosen nearby live place with its Maps action and a quiet start-over action, not an itinerary', () => {
  const onStartOver = jest.fn();
  render(<NearbyResultStage result={result} onStartOver={onStartOver} />);

  expect(screen.getByRole('heading', { name: 'Live Test Bistro' })).toBeInTheDocument();
  expect(screen.getByText('Live from Google Places')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Live Test Bistro' })).toHaveAttribute(
    'src',
    result.place.photoUrl,
  );
  expect(screen.getByText('Photo by Test photographer')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View photo' })).toHaveAttribute(
    'href',
    result.place.photoMapsUrl,
  );
  expect(screen.getByRole('link', { name: 'Open in Maps' })).toHaveAttribute(
    'href',
    result.place.mapsUrl,
  );
  expect(screen.queryByText(/Travel-time guidance/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Itinerary/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Skip' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Choose' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Find another' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
  expect(onStartOver).toHaveBeenCalledTimes(1);
});
