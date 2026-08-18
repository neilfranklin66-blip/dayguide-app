import { fireEvent, render, screen } from '@testing-library/react';
import DayGuide from './DayGuide';
import useGeolocation from './useGeolocation';
import { searchActivities, searchRestaurantPage } from './api/placesApi';

jest.mock('./useGeolocation');
jest.mock('./api/placesApi');

jest.mock('./AuthContext', () => ({
  useAuth: () => ({ currentUser: { email: 'test@example.com' }, logout: jest.fn() }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

const resolvedGeo = {
  position: { lat: 51.50722, lng: -0.1275, accuracy: 12 },
  error: null,
  isLoading: false,
  refresh: jest.fn(),
};

const erroredGeo = {
  position: null,
  error: 'location.denied',
  isLoading: false,
  refresh: jest.fn(),
};

const liveRestaurant = {
  id: 'live-restaurant-1',
  name: 'Live Restaurant',
  cuisine: ['italian'],
  priceRange: '$$',
  rating: 4.7,
  distance: 0.3,
  address: '1 Real Street',
  coordinates: { lat: 51.5075, lng: -0.1272 },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Live%20Restaurant',
};

const liveActivity = {
  id: 'live-activity-1',
  name: 'Live Test Museum',
  category: 'museums',
  venueType: 'Museum',
  rating: 4.7,
  distance: 0.8,
  address: '1 Test Street',
  coordinates: { lat: 51.508, lng: -0.128 },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Live%20Test%20Museum',
  source: 'google_places',
};

const openNearbyFood = () => {
  fireEvent.click(screen.getByText('welcome.findNearby'));
  fireEvent.click(screen.getByText('discovery.food'));
};

beforeEach(() => {
  jest.clearAllMocks();
  useGeolocation.mockReturnValue(resolvedGeo);
  searchActivities.mockResolvedValue([liveActivity]);
  searchRestaurantPage.mockResolvedValue({ results: [liveRestaurant], nextPageToken: null });
});

test('opens the agreed welcome: two choices before any location or form request', () => {
  render(<DayGuide />);

  expect(screen.getByRole('heading', { name: 'DayGuide' })).toBeInTheDocument();
  expect(screen.getByText('welcome.findNearby')).toBeInTheDocument();
  expect(screen.getByText('welcome.startPlanning')).toBeInTheDocument();
  expect(screen.queryByText(/location unavailable/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/latitude|longitude/i)).not.toBeInTheDocument();
});

test('find something nearby opens the short Food & Drinks / Things to do choice', () => {
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.findNearby'));

  expect(screen.getByText('discovery.food')).toBeInTheDocument();
  expect(screen.getByText('discovery.activities')).toBeInTheDocument();
  expect(screen.getByText('discovery.both')).toBeInTheDocument();
  expect(screen.queryByText('planning.title')).not.toBeInTheDocument();
});

test('Food & Drinks offers the approved category-first route and an explicit result action', () => {
  render(<DayGuide />);

  openNearbyFood();

  expect(screen.getByText('cuisine.italian')).toBeInTheDocument();
  expect(screen.getByText('cuisine.cafe')).toBeInTheDocument();
  expect(screen.getByText('discovery.showFood')).toBeInTheDocument();
});

test('an unfiltered Food & Drinks search reaches a live card without an old questionnaire', async () => {
  render(<DayGuide />);

  openNearbyFood();
  fireEvent.click(screen.getByText('discovery.showFood'));

  expect(await screen.findByText('Live Restaurant')).toBeInTheDocument();
  expect(screen.getByText('nearbyResult.liveSource')).toBeInTheDocument();
  expect(screen.getByText('discovery.skip')).toBeInTheDocument();
  expect(screen.getByText('discovery.choose')).toBeInTheDocument();
  expect(searchRestaurantPage).toHaveBeenCalledWith(
    resolvedGeo.position.lat,
    resolvedGeo.position.lng,
    [],
    null,
  );
  expect(screen.queryByText('interests.title')).not.toBeInTheDocument();
});

test('a chosen Food & Drinks category is passed into the live search', async () => {
  render(<DayGuide />);

  openNearbyFood();
  fireEvent.click(screen.getByText('cuisine.italian'));
  fireEvent.click(screen.getByText('discovery.showFood'));

  await screen.findByText('Live Restaurant');
  expect(searchRestaurantPage).toHaveBeenCalledWith(
    resolvedGeo.position.lat,
    resolvedGeo.position.lng,
    ['italian'],
    null,
  );
});

test('Things to do reaches a live card using the selected activity category', async () => {
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.findNearby'));
  fireEvent.click(screen.getByText('discovery.activities'));
  fireEvent.click(screen.getByText('interests.museums'));
  fireEvent.click(screen.getByText('discovery.showActivities'));

  expect(await screen.findByText('Live Test Museum')).toBeInTheDocument();
  expect(searchActivities).toHaveBeenCalledWith(
    resolvedGeo.position.lat,
    resolvedGeo.position.lng,
    ['museums'],
  );
});

test('skipping a nearby card continues to the next live option', async () => {
  const secondRestaurant = {
    ...liveRestaurant,
    id: 'live-restaurant-2',
    name: 'Second Live Restaurant',
  };
  searchRestaurantPage.mockResolvedValue({
    results: [liveRestaurant, secondRestaurant],
    nextPageToken: null,
  });
  render(<DayGuide />);

  openNearbyFood();
  fireEvent.click(screen.getByText('discovery.showFood'));
  expect(await screen.findByText('Live Restaurant')).toBeInTheDocument();
  fireEvent.click(screen.getByText('discovery.skip'));

  expect(await screen.findByText('Second Live Restaurant')).toBeInTheDocument();
});

test('choosing a nearby card gives a calm result with a Maps action', async () => {
  render(<DayGuide />);

  openNearbyFood();
  fireEvent.click(screen.getByText('discovery.showFood'));
  await screen.findByText('Live Restaurant');
  fireEvent.click(screen.getByText('discovery.choose'));

  expect(await screen.findByText('nearbyResult.eyebrow')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'restaurants.openInMaps' }).getAttribute('href')).toContain(
      'query=Live%20Restaurant',
    );
});

test('a denied-location nearby activity search has recovery actions and never shows sample cards', async () => {
  useGeolocation.mockReturnValue(erroredGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.findNearby'));
  fireEvent.click(screen.getByText('discovery.activities'));
  fireEvent.click(screen.getByText('discovery.showActivities'));

  expect(await screen.findByText('activities.nearbyLocationNeeded')).toBeInTheDocument();
  expect(screen.getByText('discovery.backToNearby')).toBeInTheDocument();
  expect(screen.getByText('discovery.startOver')).toBeInTheDocument();
  expect(screen.queryByText('activities.sampleBadge')).not.toBeInTheDocument();
});

test('Plan a day opens only the essential planning screen and tap-first time choice', () => {
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  expect(screen.getByText('planning.title')).toBeInTheDocument();
  expect(screen.getByText('planning.startSearchTitle')).toBeInTheDocument();
  expect(screen.getByText('planning.startTime')).toBeInTheDocument();
  expect(screen.getByText('interests.timeNow')).toBeInTheDocument();
  expect(screen.getByText('interests.timeIn1Hour')).toBeInTheDocument();
  expect(screen.getByText('interests.timeIn2Hours')).toBeInTheDocument();
  expect(screen.queryByText('interests.title')).not.toBeInTheDocument();
});

test('a current starting location leads into the concise planning choice without decorative overlap labels', () => {
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  fireEvent.click(screen.getByText('planning.useCurrentStart'));
  fireEvent.click(screen.getByText('planning.continue'));

  expect(screen.getByText('planMood.foodTitle')).toBeInTheDocument();
  expect(screen.getByText('planMood.activitiesTitle')).toBeInTheDocument();
  expect(screen.getByText('planMood.bothTitle')).toBeInTheDocument();
  expect(screen.queryByText(/^Food$/)).not.toBeInTheDocument();
  expect(screen.queryByText(/^Explore$/)).not.toBeInTheDocument();
  expect(screen.queryByText(/^Both$/)).not.toBeInTheDocument();
});
