import { render, screen, fireEvent } from '@testing-library/react';
import RestaurantsStage from './RestaurantsStage';

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
