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

test('an empty live search shows the no-results card, never a mock restaurant card', () => {
  render(<RestaurantsStage {...baseProps} restaurantQueue={[]} restaurantSource="no_results" />);

  expect(screen.getByText('restaurants.noResultsTitle')).toBeInTheDocument();
  expect(screen.queryByText('restaurants.yes')).not.toBeInTheDocument();
  expect(screen.queryByText('Trattoria Roma')).not.toBeInTheDocument();
});

// --- Honest unavailable state after a live search failure ---

test.each([
  ['no_key', 'restaurants.noKeyWarning'],
  ['quota', 'restaurants.quotaWarning'],
  ['no_location', 'restaurants.noLocationWarning'],
  ['location_denied', 'restaurants.locationDeniedWarning'],
  ['bad_request', 'restaurants.badRequestWarning'],
  ['network', 'restaurants.networkWarning'],
  ['error', 'restaurants.errorWarning'],
])('a failed live search (%s) shows the unavailable card with its reason, not a restaurant card', (source, reasonKey) => {
  render(<RestaurantsStage {...baseProps} restaurantQueue={[]} restaurantSource={source} />);

  expect(screen.getByText('restaurants.unavailableTitle')).toBeInTheDocument();
  expect(screen.getByText(reasonKey)).toBeInTheDocument();
  expect(screen.queryByText('restaurants.yes')).not.toBeInTheDocument();
  expect(screen.queryByText('restaurants.noResultsTitle')).not.toBeInTheDocument();
  expect(screen.queryByText('Trattoria Roma')).not.toBeInTheDocument();
});

test('the unavailable card lets the user continue without selecting a restaurant', () => {
  const continueAfterRestaurants = jest.fn();
  render(
    <RestaurantsStage
      {...baseProps}
      restaurantQueue={[]}
      restaurantSource="error"
      continueAfterRestaurants={continueAfterRestaurants}
    />
  );

  fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

  expect(continueAfterRestaurants).toHaveBeenCalledWith([]);
});

// Retry repeats the same search with the same filters. Passing the arguments
// explicitly keeps the click event out of `cuisineOverride` (Packet 103).
test('retrying a network failure re-runs the search with the current filters', () => {
  const goToRestaurants = jest.fn();
  render(
    <RestaurantsStage
      {...baseProps}
      restaurantQueue={[]}
      restaurantSource="network"
      goToRestaurants={goToRestaurants}
    />
  );

  fireEvent.click(screen.getByText('restaurants.tryAgain'));

  expect(goToRestaurants).toHaveBeenCalledTimes(1);
  expect(goToRestaurants).toHaveBeenCalledWith(['italian'], '$$');
});

test('a misconfigured live search offers no retry, only a way to continue', () => {
  const goToRestaurants = jest.fn();
  render(
    <RestaurantsStage
      {...baseProps}
      restaurantQueue={[]}
      restaurantSource="no_key"
      goToRestaurants={goToRestaurants}
    />
  );

  expect(screen.queryByText('restaurants.tryAgain')).not.toBeInTheDocument();
  expect(screen.getByText('restaurants.skipAndContinue')).toBeInTheDocument();
  expect(goToRestaurants).not.toHaveBeenCalled();
});

// no_results means the search ran and found nothing: that is the filter card,
// which offers filter-loosening actions the unavailable card must not.
test('no_results shows the filter card, never the unavailable card', () => {
  render(<RestaurantsStage {...baseProps} restaurantQueue={[]} restaurantSource="no_results" />);

  expect(screen.getByText('restaurants.noResultsTitle')).toBeInTheDocument();
  expect(screen.queryByText('restaurants.unavailableTitle')).not.toBeInTheDocument();
  expect(screen.getByText('restaurants.showAllNearby')).toBeInTheDocument();
});

// no_unseen_results means matches existed but were all already shown/selected:
// the filter card again, but with its own honest copy — never "none found" and
// never the unavailable card.
test('no_unseen_results shows the exhausted-unseen filter card with distinct copy', () => {
  render(<RestaurantsStage {...baseProps} restaurantQueue={[]} restaurantSource="no_unseen_results" />);

  expect(screen.getByText('restaurants.noUnseenResultsTitle')).toBeInTheDocument();
  expect(screen.getByText('restaurants.noUnseenResults')).toBeInTheDocument();
  expect(screen.queryByText('restaurants.noResultsTitle')).not.toBeInTheDocument();
  expect(screen.queryByText('restaurants.unavailableTitle')).not.toBeInTheDocument();
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
