import { render, screen, fireEvent } from '@testing-library/react';
import RestaurantsStage from './RestaurantsStage';
import { fromPlacesParsed } from '../adapters/placeCardAdapter';

const t = (key) => key;

const restaurant = {
  id: 'r1',
  name: 'Trattoria Roma',
  image: 'https://example.com/trattoria.jpg',
  cuisine: ['italian'],
  city: 'London',
  rating: 4.5,
  priceRange: '$$',
  distance: 0.8,
  duration: 1.5,
  address: '2 Pasta Lane',
};

const baseProps = {
  isRestaurantsLoading: false,
  restaurantQueue: [restaurant],
  selectedCuisines: ['italian'],
  selectedPriceRange: '$$',
  nearestHint: null,
  setSelectedCuisines: jest.fn(),
  setSelectedPriceRange: jest.fn(),
  goToRestaurants: jest.fn(),
  continueAfterRestaurants: jest.fn(),
  selectedRestaurants: [],
  currentRestaurantIndex: 0,
  restaurantSource: null,
  hasChildren: false,
  startWith: 'activities',
  swipeRestaurant: jest.fn(),
  t,
};

test('renders the current restaurant card', () => {
  render(<RestaurantsStage {...baseProps} />);

  expect(screen.getByText('Trattoria Roma')).toBeInTheDocument();
  expect(screen.getByText('1 / 1')).toBeInTheDocument();
});

test('accepting a restaurant calls swipeRestaurant(true)', () => {
  const swipeRestaurant = jest.fn();
  render(<RestaurantsStage {...baseProps} swipeRestaurant={swipeRestaurant} />);

  fireEvent.click(screen.getByText('restaurants.yes'));

  expect(swipeRestaurant).toHaveBeenCalledWith(true);
});

test('shows the loading card while restaurants load', () => {
  render(<RestaurantsStage {...baseProps} isRestaurantsLoading={true} restaurantQueue={null} />);

  expect(screen.queryByText('Trattoria Roma')).not.toBeInTheDocument();
});

test('exhausted queue in activity-first order offers to build the itinerary', () => {
  render(
    <RestaurantsStage
      {...baseProps}
      currentRestaurantIndex={1}
      startWith="activities"
    />
  );

  expect(screen.getByText('restaurants.noMore')).toBeInTheDocument();
  expect(screen.getByText('restaurants.buildItinerary')).toBeInTheDocument();
  expect(screen.queryByText('restaurants.continueToActivities')).not.toBeInTheDocument();
});

test('exhausted queue in food-first order offers to continue to activities', () => {
  const continueAfterRestaurants = jest.fn();
  const selectedRestaurants = [restaurant];
  render(
    <RestaurantsStage
      {...baseProps}
      currentRestaurantIndex={1}
      startWith="food_drinks"
      selectedRestaurants={selectedRestaurants}
      continueAfterRestaurants={continueAfterRestaurants}
    />
  );

  expect(screen.queryByText('restaurants.buildItinerary')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('restaurants.continueToActivities'));

  expect(continueAfterRestaurants).toHaveBeenCalledWith(selectedRestaurants);
});

test('shows the nearest hint on the no-results card when provided', () => {
  render(
    <RestaurantsStage
      {...baseProps}
      restaurantQueue={[]}
      nearestHint={{ name: 'Dishoom', distance: 1.2 }}
    />
  );

  expect(screen.getByText('restaurants.noResultsTitle')).toBeInTheDocument();
  expect(screen.getByText('restaurants.nearestHint')).toBeInTheDocument();
});

test('omits the nearest hint on the no-results card when it is null', () => {
  render(<RestaurantsStage {...baseProps} restaurantQueue={[]} nearestHint={null} />);

  expect(screen.getByText('restaurants.noResultsTitle')).toBeInTheDocument();
  expect(screen.queryByText('restaurants.nearestHint')).not.toBeInTheDocument();
});

test('a live places card keeps its exact query_place_id maps URL through the stage render', () => {
  const liveCard = fromPlacesParsed({
    id: 'ChIJlive123',
    name: 'Live Cafe',
    cuisine: ['cafe'],
    priceRange: '$',
    rating: 4.0,
    duration: 1,
    distance: 0.8,
    address: '456 Live Rd',
    image: 'https://placehold.co/400x300/live',
  });
  const restaurantQueue = [liveCard];

  render(
    <RestaurantsStage
      {...baseProps}
      restaurantQueue={restaurantQueue}
      restaurantSource="live"
      selectedCuisines={[]}
      selectedPriceRange={null}
    />
  );

  expect(screen.getByText('Live Cafe')).toBeInTheDocument();
  expect(screen.getByText('456 Live Rd')).toBeInTheDocument();
  expect(restaurantQueue[0].mapsUrl).toBe(
    'https://www.google.com/maps/search/?api=1&query=Live%20Cafe&query_place_id=ChIJlive123'
  );
});

test('the swipe card renders the maps URL as an open-in-maps link', () => {
  const liveCard = fromPlacesParsed({
    id: 'ChIJlive123',
    name: 'Live Cafe',
    address: '456 Live Rd',
  });

  render(<RestaurantsStage {...baseProps} restaurantQueue={[liveCard]} selectedCuisines={[]} selectedPriceRange={null} />);

  const link = screen.getByRole('link', { name: 'restaurants.openInMaps' });
  expect(link).toHaveAttribute(
    'href',
    'https://www.google.com/maps/search/?api=1&query=Live%20Cafe&query_place_id=ChIJlive123'
  );
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

test('no maps link renders when the restaurant has no mapsUrl', () => {
  render(<RestaurantsStage {...baseProps} />);

  expect(screen.getByText('Trattoria Roma')).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
