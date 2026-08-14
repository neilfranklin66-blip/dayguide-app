import { fireEvent, render, screen } from '@testing-library/react';
import NearbyMixedStage from './NearbyMixedStage';

const t = (key, options = {}) => options.defaultValue ?? key;

const nearbyFood = {
  id: 'food-1',
  kind: 'food',
  name: 'A nearby cafe',
  venueType: 'Cafe',
  cuisine: [],
  rating: 4.5,
  distance: 1.2,
  address: '1 Example Street',
  mapsUrl: 'https://maps.google.com/?q=cafe',
  image: 'https://example.com/cafe.jpg',
};

test('mixed nearby cards expose two clear choices and retain a Maps action', () => {
  const onSwipe = jest.fn();
  render(
    <NearbyMixedStage
      places={[nearbyFood]}
      source="live"
      onSwipe={onSwipe}
      onChooseFood={jest.fn()}
      onChooseActivities={jest.fn()}
      t={t}
    />,
  );

  expect(screen.getByText('Live from Google Places')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Open in Maps' })).toHaveAttribute('href', nearbyFood.mapsUrl);
  fireEvent.click(screen.getByRole('button', { name: 'discovery.notForMe' }));
  fireEvent.click(screen.getByRole('button', { name: 'discovery.chooseThis' }));
  expect(onSwipe).toHaveBeenNthCalledWith(1, false);
  expect(onSwipe).toHaveBeenNthCalledWith(2, true);
});

test('mixed nearby completion offers a truthful category route rather than an empty itinerary', () => {
  render(
    <NearbyMixedStage
      places={[]}
      source="live"
      onSwipe={jest.fn()}
      onChooseFood={jest.fn()}
      onChooseActivities={jest.fn()}
      t={t}
    />,
  );

  expect(screen.getByText('discovery.mixedCompleteTitle')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'discovery.food' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'discovery.activities' })).toBeInTheDocument();
  expect(screen.queryByText(/itinerary is empty/i)).not.toBeInTheDocument();
});
