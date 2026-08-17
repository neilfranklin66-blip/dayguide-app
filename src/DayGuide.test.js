import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import DayGuide from './DayGuide';
import useGeolocation from './useGeolocation';
import { searchActivities, searchRestaurants, searchRestaurantPage } from './api/placesApi';
import {
  LEGACY_SAVED_PLAN_STORAGE_KEY,
  SAVED_PLAN_STORAGE_KEY,
} from './utils/planStorage';
import * as popupEngine from './engines/popupEngine';

jest.mock('./useGeolocation');
jest.mock('./api/placesApi');

var mockResolvePlaceQueryImpl = () => Promise.resolve([]);
jest.mock('./api/placeResolutionApi', () => {
  const actual = jest.requireActual('./api/placeResolutionApi');
  return {
    ...actual,
    resolvePlaceQuery: (...args) => mockResolvePlaceQueryImpl(...args),
  };
});

// Records logout invocations. A plain array + function rather than a jest.fn():
// the factory returns a fresh object per render, and CRA's resetMocks would
// clear a jest.fn()'s recorded calls. Named `mock*` so the factory may use it.
// `mockLogoutImpl` lets a test make signOut reject, as Firebase does on a
// network or token failure. It resolves by default.
var mockLogoutCalls = [];
var mockLogoutImpl = () => Promise.resolve();
jest.mock('./AuthContext', () => ({
  useAuth: () => ({
    currentUser: { email: 'test@example.com' },
    logout: (...args) => {
      mockLogoutCalls.push(args);
      return mockLogoutImpl(...args);
    },
  }),
}));

const defaultLiveActivity = {
  id: 'live-activity-1',
  name: 'Live Test Museum',
  category: 'museums',
  venueType: 'Museum',
  image: '🏛️',
  rating: 4.7,
  distance: 0.8,
  duration: 2,
  address: '1 Test Street',
  coordinates: { lat: 51.508, lng: -0.128 },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Live%20Test%20Museum',
  source: 'google_places',
};

beforeEach(() => {
  mockLogoutCalls = [];
  mockLogoutImpl = () => Promise.resolve();
  mockResolvePlaceQueryImpl = () => Promise.resolve([]);
  searchActivities.mockResolvedValue([defaultLiveActivity]);
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

// Delegates to the real filter engine unless a test installs an override.
// Declared with `var` (hoisted, `mock` prefix) so the hoisted factory may
// reference it; plain functions keep CRA's resetMocks from clearing it.
var mockGetActivitiesOverride = null;
jest.mock('./engines/filterEngine', () => {
  const actual = jest.requireActual('./engines/filterEngine');
  return {
    ...actual,
    getActivitiesForInterests: (params) =>
      mockGetActivitiesOverride
        ? mockGetActivitiesOverride(params, actual.getActivitiesForInterests)
        : actual.getActivitiesForInterests(params),
  };
});

const loadingGeo = {
  position: null,
  error: null,
  isLoading: true,
  refresh: jest.fn(),
};

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

const continueFromPlanningEssentials = mood => {
  fireEvent.click(screen.getByText('planning.useCurrentStart'));
  fireEvent.click(screen.getByText('planning.continue'));
  fireEvent.click(screen.getByText(`planMood.${mood}Title`));
};

test('opens the planning essentials while geolocation is loading', () => {
  useGeolocation.mockReturnValue(loadingGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  expect(screen.getByText('planning.title')).toBeInTheDocument();
  expect(screen.getByText('planning.simpleIntro')).toBeInTheDocument();
});

test('keeps planning open when geolocation resolves', () => {
  useGeolocation.mockReturnValue(loadingGeo);
  const { rerender } = render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  expect(screen.getByText('planning.title')).toBeInTheDocument();

  useGeolocation.mockReturnValue(resolvedGeo);
  rerender(<DayGuide />);

  expect(screen.getByText('planning.title')).toBeInTheDocument();
  expect(screen.queryByText('interests.title')).not.toBeInTheDocument();
});

test('keeps planning open when geolocation ends with an error', () => {
  useGeolocation.mockReturnValue(loadingGeo);
  const { rerender } = render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  expect(screen.getByText('planning.title')).toBeInTheDocument();

  useGeolocation.mockReturnValue(erroredGeo);
  rerender(<DayGuide />);

  expect(screen.getByText('planning.title')).toBeInTheDocument();
});

test('opens planning essentials when geolocation is already resolved', () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  expect(screen.getByText('planning.title')).toBeInTheDocument();
  expect(screen.queryByText('interests.title')).not.toBeInTheDocument();
});

test('find nearby opens a live restaurant card without the preference questionnaire', async () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  searchRestaurantPage.mockResolvedValue({ results: [
    {
      id: 'live-restaurant-1',
      name: 'Live Restaurant',
      cuisine: ['italian'],
      priceRange: '$$',
      rating: 4.7,
      distance: 0.3,
      duration: 1.5,
      address: '1 Real Street',
      coordinates: { lat: 51.5075, lng: -0.1272 },
    },
  ], nextPageToken: null });
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.findNearby'));
  fireEvent.click(screen.getByText('discovery.food'));
  fireEvent.click(screen.getByText('discovery.showFood'));

  expect(await screen.findByText('Live Restaurant')).toBeInTheDocument();
  expect(screen.getByText('nearbyResult.liveSource')).toBeInTheDocument();
  expect(screen.queryByText('interests.title')).not.toBeInTheDocument();
  expect(searchRestaurantPage).toHaveBeenCalledWith(
    resolvedGeo.position.lat,
    resolvedGeo.position.lng,
    [],
    null,
  );
});

test('find nearby opens a live activity card after an activity category is chosen', async () => {
  useGeolocation.mockReturnValue(resolvedGeo);
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

test('a location-denied nearby activity search offers a clear return and fresh start', async () => {
  useGeolocation.mockReturnValue(erroredGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.findNearby'));
  fireEvent.click(screen.getByText('discovery.activities'));
  fireEvent.click(screen.getByText('discovery.showActivities'));

  expect(await screen.findByText('activities.nearbyLocationNeeded')).toBeInTheDocument();
  expect(screen.queryByText('activities.setStartingPlace')).not.toBeInTheDocument();
  expect(screen.queryByText('activities.skipAndContinue')).not.toBeInTheDocument();

  fireEvent.click(screen.getByText('discovery.backToNearby'));
  expect(screen.getByText('discovery.title')).toBeInTheDocument();

  fireEvent.click(screen.getByText('discovery.activities'));
  fireEvent.click(screen.getByText('discovery.showActivities'));
  expect(await screen.findByText('discovery.startOver')).toBeInTheDocument();
  fireEvent.click(screen.getByText('discovery.startOver'));
  expect(screen.getByText('welcome.startPlanning')).toBeInTheDocument();
});

test('mounts the concise geographical planning stage before selections', () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  expect(screen.getByText('planning.title')).toBeInTheDocument();
  expect(screen.queryByText('planning.privateAlphaNotice')).not.toBeInTheDocument();
  expect(screen.queryByText('planning.storageNotice')).not.toBeInTheDocument();
  expect(screen.queryByText('planning.startPlaceSelected')).not.toBeInTheDocument();
  expect(screen.getByText('planning.useCurrentStart')).toBeInTheDocument();
});

test('accepting the current start passes the geographical plan into the selection journey', async () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  expect(screen.queryByText('planning.startPlaceSelected')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('planning.useCurrentStart'));
  expect(screen.getByText('planning.startPlaceSelected')).toBeInTheDocument();
  fireEvent.click(screen.getByText('planning.continue'));
  expect(screen.getByText('planMood.title')).toBeInTheDocument();
  fireEvent.click(screen.getByText('planMood.activitiesTitle'));

  expect(await screen.findByText('Live Test Museum')).toBeInTheDocument();
});

test('a searched start location becomes the origin for a restaurant-first search', async () => {
  const euston = {
    id: 'euston',
    name: 'London Euston',
    address: 'Euston Road, London',
    coordinates: { lat: 51.5282, lng: -0.1337 },
    source: 'google_places',
    accuracyMeters: null,
    locality: 'London',
    countryCode: 'GB',
    timezone: null,
  };
  mockResolvePlaceQueryImpl = () => Promise.resolve([euston]);
  searchRestaurants.mockResolvedValue([]);
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  fireEvent.change(screen.getByLabelText('planning.startSearchLabel'), {
    target: { value: 'London Euston' },
  });
  fireEvent.click(screen.getByText('planning.searchAction'));
  expect(await screen.findByText('London Euston')).toBeInTheDocument();
  fireEvent.click(screen.getByText('planning.selectStartPlace'));
  fireEvent.click(screen.getByText('planning.continue'));
  fireEvent.click(screen.getByText('planMood.foodTitle'));

  expect(
    await screen.findByText('restaurants.noResultsTitle'),
  ).toBeInTheDocument();
  expect(searchRestaurants).toHaveBeenCalledWith(
    euston.coordinates.lat,
    euston.coordinates.lng,
    [],
    null,
  );
});

test('a searched start location enables live activities when location is denied', async () => {
  const euston = {
    id: 'euston',
    name: 'London Euston',
    address: 'Euston Road, London',
    coordinates: { lat: 51.5282, lng: -0.1337 },
    source: 'google_places',
    accuracyMeters: null,
    locality: 'London',
    countryCode: 'GB',
    timezone: null,
  };
  const theatre = {
    id: 'theatre',
    name: 'Royal Theatre',
    address: 'Guildhall Road, Northampton',
    coordinates: { lat: 52.237, lng: -0.895 },
    source: 'google_places',
    accuracyMeters: null,
    locality: 'Northampton',
    countryCode: 'GB',
    timezone: null,
  };
  mockResolvePlaceQueryImpl = query =>
    Promise.resolve(query === 'London Euston' ? [euston] : [theatre]);
  useGeolocation.mockReturnValue(erroredGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  fireEvent.change(screen.getByLabelText('planning.startSearchLabel'), {
    target: { value: 'London Euston' },
  });
  fireEvent.click(screen.getByText('planning.searchAction'));
  expect(await screen.findByText('London Euston')).toBeInTheDocument();
  fireEvent.click(screen.getByText('planning.selectStartPlace'));
  fireEvent.click(screen.getByText('planning.laterPlansPrompt'));
  fireEvent.change(screen.getByLabelText('planning.destinationSearchLabel'), {
    target: { value: 'Royal Theatre' },
  });
  fireEvent.click(
    screen.getAllByRole('button', { name: 'planning.searchAction' }).at(-1),
  );
  expect(await screen.findByText('Royal Theatre')).toBeInTheDocument();
  fireEvent.click(screen.getByText('planning.selectDestinationPlace'));
  fireEvent.click(screen.getByText('planning.continue'));
  fireEvent.click(screen.getByText('planMood.activitiesTitle'));

  expect(await screen.findByText('Live Test Museum')).toBeInTheDocument();
  expect(searchActivities).toHaveBeenCalledWith(
    euston.coordinates.lat,
    euston.coordinates.lng,
    [],
  );
});

test('a later destination offers a user-led next search area after a live pick', async () => {
  const euston = {
    id: 'euston', name: 'London Euston', address: 'Euston Road, London',
    coordinates: { lat: 51.5282, lng: -0.1337 }, source: 'google_places',
    accuracyMeters: null, locality: 'London', countryCode: 'GB', timezone: null,
  };
  const theatre = {
    id: 'theatre', name: 'Royal Theatre', address: 'Guildhall Road, Northampton',
    coordinates: { lat: 52.237, lng: -0.895 }, source: 'google_places',
    accuracyMeters: null, locality: 'Northampton', countryCode: 'GB', timezone: null,
  };
  mockResolvePlaceQueryImpl = query =>
    Promise.resolve(query === 'London Euston' ? [euston] : [theatre]);
  useGeolocation.mockReturnValue(erroredGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  fireEvent.change(screen.getByLabelText('planning.startSearchLabel'), {
    target: { value: 'London Euston' },
  });
  fireEvent.click(screen.getByText('planning.searchAction'));
  fireEvent.click(await screen.findByText('London Euston'));
  fireEvent.click(screen.getByText('planning.selectStartPlace'));
  fireEvent.click(screen.getByText('planning.laterPlansPrompt'));
  fireEvent.change(screen.getByLabelText('planning.destinationSearchLabel'), {
    target: { value: 'Royal Theatre' },
  });
  fireEvent.click(screen.getAllByRole('button', { name: 'planning.searchAction' }).at(-1));
  fireEvent.click(await screen.findByText('Royal Theatre'));
  fireEvent.click(screen.getByText('planning.selectDestinationPlace'));
  fireEvent.click(screen.getByText('planning.continue'));
  fireEvent.click(screen.getByText('planMood.activitiesTitle'));
  await screen.findByText('Live Test Museum');

  fireEvent.click(screen.getByText('activities.yes'));
  expect(screen.getByText('geography.title')).toBeInTheDocument();
  fireEvent.click(screen.getByText('geography.nearLater'));

  await waitFor(() => expect(searchActivities).toHaveBeenLastCalledWith(
    theatre.coordinates.lat,
    theatre.coordinates.lng,
    [],
  ));
});

// --- Header logout (Packet 124) ---

describe('header logout', () => {
  test('the header exposes an enabled logout button that calls the auth context logout once', () => {
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    const logoutButton = screen.getByRole('button', { name: 'header.logout' });
    expect(logoutButton).toBeEnabled();

    fireEvent.click(logoutButton);

    expect(mockLogoutCalls).toHaveLength(1);
  });

  test('the logout button is still reachable once the user is deep in the planning flow', async () => {
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    fireEvent.click(screen.getByText('welcome.startPlanning'));
    continueFromPlanningEssentials('activities');

    await screen.findByText('Live Test Museum');

  fireEvent.click(screen.getByRole('button', { name: 'header.logout' }));

    expect(mockLogoutCalls).toHaveLength(1);
  });
});

// --- Header logout failure (Packet 125) ---

describe('header logout failure', () => {
  const failingLogout = () => Promise.reject(new Error('auth/network-request-failed'));

  const clickLogout = () =>
    act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'header.logout' }));
    });

  beforeEach(() => {
    useGeolocation.mockReturnValue(resolvedGeo);
  });

  test('a rejected logout shows the failure notice instead of escaping unhandled', async () => {
    mockLogoutImpl = failingLogout;
    render(<DayGuide />);

    await clickLogout();

    // The message rendering is the observable proof the rejection was caught:
    // it is only set from the catch block around `await logout()`.
    expect(screen.getByRole('alert')).toHaveTextContent('header.logoutFailed');
  });

  test('a failed logout leaves the user signed in, still inside the app', async () => {
    mockLogoutImpl = failingLogout;
    render(<DayGuide />);

    await clickLogout();

    // The authenticated header and the planning flow are both still present;
    // nothing tore the session down optimistically.
    expect(screen.getByText('👤 test@example.com')).toBeInTheDocument();
    expect(screen.getByText('welcome.startPlanning')).toBeInTheDocument();
  });

  test('the logout button stays enabled after a failure and retries on the next click', async () => {
    mockLogoutImpl = failingLogout;
    render(<DayGuide />);

    await clickLogout();
    expect(screen.getByRole('button', { name: 'header.logout' })).toBeEnabled();

    await clickLogout();

    expect(mockLogoutCalls).toHaveLength(2);
  });

  test('a retry that succeeds clears the failure notice', async () => {
    mockLogoutImpl = failingLogout;
    render(<DayGuide />);

    await clickLogout();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    mockLogoutImpl = () => Promise.resolve();
    await clickLogout();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('a successful logout never shows the failure notice', async () => {
    render(<DayGuide />);

    await clickLogout();

    expect(mockLogoutCalls).toHaveLength(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('header.logoutFailed')).not.toBeInTheDocument();
  });
});

// --- Header logout pending state (Packet 126) ---

describe('header logout pending state', () => {
  // Holds logout in flight so the pending window can be observed rather than
  // raced past: the test decides when Firebase answers.
  function deferLogout() {
    let settle;
    const pending = new Promise((resolve, reject) => {
      settle = { resolve, reject };
    });
    mockLogoutImpl = () => pending;
    return {
      succeed: () => act(async () => settle.resolve(undefined)),
      fail: () => act(async () => {
        settle.reject(new Error('auth/network-request-failed'));
      }),
    };
  }

  const clickLogout = (name = 'header.logout') =>
    act(async () => {
      fireEvent.click(screen.getByRole('button', { name }));
    });

  beforeEach(() => {
    useGeolocation.mockReturnValue(resolvedGeo);
  });

  test('before any click the button is enabled and shows the idle label', () => {
    render(<DayGuide />);

    expect(screen.getByRole('button', { name: 'header.logout' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'header.loggingOut' })).not.toBeInTheDocument();
  });

  test('an in-flight logout disables the button and swaps in the pending label', async () => {
    deferLogout();
    render(<DayGuide />);

    await clickLogout();

    expect(screen.getByRole('button', { name: 'header.loggingOut' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'header.logout' })).not.toBeInTheDocument();
    expect(mockLogoutCalls).toHaveLength(1);
  });

  test('repeated clicks while logout is pending call logout only once', async () => {
    deferLogout();
    render(<DayGuide />);

    await clickLogout();
    await clickLogout('header.loggingOut');
    await clickLogout('header.loggingOut');

    expect(mockLogoutCalls).toHaveLength(1);
  });

  test('the pending state survives a resolved logout, so no second signOut can fire', async () => {
    const logoutCall = deferLogout();
    render(<DayGuide />);

    await clickLogout();
    await logoutCall.succeed();

    // The auth-state listener replaces this tree; until it does the button must
    // not flick back to a live "Logout".
    expect(screen.getByRole('button', { name: 'header.loggingOut' })).toBeDisabled();
    expect(mockLogoutCalls).toHaveLength(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('a failed logout clears the pending state and shows the failure notice', async () => {
    const logoutCall = deferLogout();
    render(<DayGuide />);

    await clickLogout();
    await logoutCall.fail();

    expect(screen.getByRole('button', { name: 'header.logout' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'header.loggingOut' })).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('header.logoutFailed');
    expect(screen.getByText('👤 test@example.com')).toBeInTheDocument();
  });

  test('a retry after a failure re-enters the pending state and clears the notice', async () => {
    const failedCall = deferLogout();
    render(<DayGuide />);

    await clickLogout();
    await failedCall.fail();

    deferLogout();
    await clickLogout();

    expect(screen.getByRole('button', { name: 'header.loggingOut' })).toBeDisabled();
    expect(mockLogoutCalls).toHaveLength(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

// --- Saved-plan persistence ---

const savedPlanPayload = {
  version: 2,
  savedAt: '2026-07-05T09:00:00.000Z',
  plan: {
    timeline: [
      {
        id: '0-42',
        time: '9:00',
        activity: 'Borough Market',
        duration: 1.5,
        distance: 1.2,
        category: 'museums',
        icon: '🏛️',
        address: '8 Southwark St',
        rating: 4.6,
      },
    ],
    startTime: 9,
    availableTime: 4,
    hasChildren: false,
    selectedCuisines: [],
    selectedPriceRange: null,
    selectedDate: '2026-07-05',
    startWith: 'activities',
    geographicalPlanning: null,
  },
};

afterEach(() => {
  localStorage.clear();
  mockGetActivitiesOverride = null;
});

test('resume button is hidden when no plan is saved', () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  expect(screen.queryByText('welcome.resumePlan')).not.toBeInTheDocument();
});

test('a legacy v1 saved plan is offered and migrated to saved-plan v2', () => {
  const legacyPayload = {
    version: 1,
    savedAt: savedPlanPayload.savedAt,
    plan: { ...savedPlanPayload.plan },
  };
  delete legacyPayload.plan.geographicalPlanning;

  jest.useFakeTimers().setSystemTime(new Date('2026-07-05T09:00:00'));
  localStorage.setItem(
    LEGACY_SAVED_PLAN_STORAGE_KEY,
    JSON.stringify(legacyPayload),
  );
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  expect(screen.getByText('welcome.resumePlan')).toBeInTheDocument();
  expect(localStorage.getItem(LEGACY_SAVED_PLAN_STORAGE_KEY)).toBeNull();
  expect(
    JSON.parse(localStorage.getItem(SAVED_PLAN_STORAGE_KEY)).version,
  ).toBe(2);

  jest.useRealTimers();
});

test('resuming a seeded saved plan lands on the timeline with its content', () => {
  // Pin "today" to the saved plan's own date so this test is deterministic
  // regardless of the real calendar day it runs on.
  jest.useFakeTimers().setSystemTime(new Date('2026-07-05T09:00:00'));
  localStorage.setItem(SAVED_PLAN_STORAGE_KEY, JSON.stringify(savedPlanPayload));
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  expect(screen.getByText('welcome.resumePlan')).toBeInTheDocument();
  expect(screen.queryByText(/welcome\.resumePlanDetails/)).not.toBeInTheDocument();

  fireEvent.click(screen.getByText('welcome.resumePlan'));

  expect(screen.getByText('timeline.title')).toBeInTheDocument();
  expect(screen.getByText('Borough Market')).toBeInTheDocument();

  jest.useRealTimers();
});

test('sharing a resumed plan opens and closes the QR dialog', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-07-05T09:00:00'));
  localStorage.setItem(SAVED_PLAN_STORAGE_KEY, JSON.stringify(savedPlanPayload));
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.resumePlan'));
  fireEvent.click(screen.getByText('timeline.share'));

  expect(screen.getByText('timeline.shareTitle')).toBeInTheDocument();
  expect(screen.getByText('timeline.shareHint')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Close' }));

  expect(screen.queryByText('timeline.shareTitle')).not.toBeInTheDocument();

  jest.useRealTimers();
});

test('an expired saved plan is not offered for resume', () => {
  const expiredPlanPayload = {
    ...savedPlanPayload,
    plan: { ...savedPlanPayload.plan, selectedDate: '2026-07-04' },
  };
  jest.useFakeTimers().setSystemTime(new Date('2026-07-05T09:00:00'));
  localStorage.setItem(SAVED_PLAN_STORAGE_KEY, JSON.stringify(expiredPlanPayload));
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  expect(screen.queryByText('welcome.resumePlan')).not.toBeInTheDocument();
  expect(screen.queryByText(/welcome\.resumePlanDetails/)).not.toBeInTheDocument();
  expect(localStorage.getItem(SAVED_PLAN_STORAGE_KEY)).toBeNull();

  jest.useRealTimers();
});

test('a plan dated today via the welcome journey remains resumable', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-07-05T09:00:00'));
  localStorage.setItem(SAVED_PLAN_STORAGE_KEY, JSON.stringify(savedPlanPayload));
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  expect(screen.getByText('welcome.resumePlan')).toBeInTheDocument();

  jest.useRealTimers();
});

test('a future-dated saved plan remains resumable', () => {
  const futurePlanPayload = {
    ...savedPlanPayload,
    plan: { ...savedPlanPayload.plan, selectedDate: '2026-07-06' },
  };
  jest.useFakeTimers().setSystemTime(new Date('2026-07-05T09:00:00'));
  localStorage.setItem(SAVED_PLAN_STORAGE_KEY, JSON.stringify(futurePlanPayload));
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  expect(screen.getByText('welcome.resumePlan')).toBeInTheDocument();

  jest.useRealTimers();
});

test('building a timeline saves the plan and start over clears it', async () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  continueFromPlanningEssentials('activities');

  // Like every activity in the queue until the flow moves on.
  await screen.findByText('Live Test Museum');
  for (let i = 0; i < 50 && screen.queryByText('activities.yes'); i += 1) {
    fireEvent.click(screen.getByText('activities.yes'));
  }

  expect(screen.getByText('timeline.title')).toBeInTheDocument();

  const stored = JSON.parse(localStorage.getItem(SAVED_PLAN_STORAGE_KEY));
  expect(stored.version).toBe(2);
  expect(stored.plan.timeline.length).toBeGreaterThan(0);

  fireEvent.click(screen.getByText('timeline.startOver'));

  expect(localStorage.getItem(SAVED_PLAN_STORAGE_KEY)).toBeNull();
  expect(screen.getByText('welcome.startPlanning')).toBeInTheDocument();
  expect(screen.queryByText('welcome.resumePlan')).not.toBeInTheDocument();
  expect(screen.queryByText(/welcome\.resumePlanDetails/)).not.toBeInTheDocument();
});

test('saved-plan v2 keeps the selected start locally without transient GPS metadata', async () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  continueFromPlanningEssentials('activities');

  await screen.findByText('Live Test Museum');
  for (let i = 0; i < 50 && screen.queryByText('activities.yes'); i += 1) {
    fireEvent.click(screen.getByText('activities.yes'));
  }
  const stored = JSON.parse(localStorage.getItem(SAVED_PLAN_STORAGE_KEY));
  expect(stored.version).toBe(2);
  expect(stored.plan.geographicalPlanning.start.place).toEqual({
    id: 'current-location',
    name: 'Current location',
    coordinates: {
      lat: resolvedGeo.position.lat,
      lng: resolvedGeo.position.lng,
    },
    source: 'current_gps',
  });
  expect(
    stored.plan.geographicalPlanning.start.place,
  ).not.toHaveProperty('accuracyMeters');
});

test('selecting live activities reaches the timeline with a real distance and Maps link', async () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  continueFromPlanningEssentials('activities');

  expect(await screen.findByText('Live Test Museum')).toBeInTheDocument();
  expect(screen.queryByText('activities.sampleBadge')).not.toBeInTheDocument();

  for (let i = 0; i < 50 && screen.queryByText('activities.yes'); i += 1) {
    fireEvent.click(screen.getByText('activities.yes'));
  }

  // The user still reaches the timeline...
  expect(screen.getByText('timeline.title')).toBeInTheDocument();
  expect(screen.queryByText('timeline.sampleActivity')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'restaurants.openInMaps' })).toBeInTheDocument();
});

// --- Popup suppression for resumed plans ---

const popupTitlePattern = /^popups\.(nearbyRestaurant|coffeeBreak|activityBreak)\.title$/;

// Walks the planning flow from the welcome screen to an activities-only
// timeline, matching the steps in the persistence test above.
const buildPlanFromWelcome = async () => {
  fireEvent.click(screen.getByText('welcome.startPlanning'));
  continueFromPlanningEssentials('activities');

  await screen.findByText('Live Test Museum');

  for (let i = 0; i < 50 && screen.queryByText('activities.yes'); i += 1) {
    fireEvent.click(screen.getByText('activities.yes'));
  }

  expect(screen.getByText('timeline.title')).toBeInTheDocument();
};

// A close, high-rated live result in the shape searchRestaurants resolves
// with; qualifies for the nearbyRestaurant popup once it reaches the queue.
const liveRestaurantResult = {
  id: 'live-1',
  place_id: 'live-1',
  name: 'Test Live Bistro',
  city: '',
  cuisine: [],
  priceRange: '$$',
  rating: 4.8,
  duration: 1.5,
  distance: 0.2,
  address: '1 Test Street',
  image: null,
};

// Same walk as buildPlanFromWelcome, but accepts the meal prompt and skips
// every restaurant card, so the queue and source stay populated without
// putting nearbyRestaurant on the liked-a-restaurant cooldown.
const buildPlanThroughRestaurantsFromWelcome = async () => {
  fireEvent.click(screen.getByText('welcome.startPlanning'));
  continueFromPlanningEssentials('both');

  await screen.findByText('Live Test Museum');
  for (let i = 0; i < 50 && screen.queryByText('activities.yes'); i += 1) {
    fireEvent.click(screen.getByText('activities.yes'));
  }

  fireEvent.click(screen.getByText('mealPrompt.yes'));
  await act(async () => {}); // flush the restaurant search promise

  for (let i = 0; i < 50 && screen.queryByText('restaurants.skip'); i += 1) {
    fireEvent.click(screen.getByText('restaurants.skip'));
  }

  // A failed live search leaves no cards to swipe, only the unavailable
  // card's skip-and-continue route to the timeline.
  const skipAndContinue = screen.queryByText('restaurants.skipAndContinue');
  if (skipAndContinue) fireEvent.click(skipAndContinue);

  expect(screen.getByText('timeline.title')).toBeInTheDocument();
};

describe('timeline popup suggestions', () => {
  beforeEach(() => {
    // Pinned so savedPlanPayload's fixed date is never seen as expired,
    // regardless of the real calendar day this suite runs on.
    jest.useFakeTimers().setSystemTime(new Date('2026-07-05T09:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('a resumed plan does not trigger a popup suggestion', () => {
    localStorage.setItem(SAVED_PLAN_STORAGE_KEY, JSON.stringify(savedPlanPayload));
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    fireEvent.click(screen.getByText('welcome.resumePlan'));
    expect(screen.getByText('timeline.title')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText(popupTitlePattern)).not.toBeInTheDocument();
  });

  test('a freshly built plan still triggers a popup suggestion', async () => {
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    await buildPlanFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText(popupTitlePattern)).toBeInTheDocument();
  });

  test('a skipped live restaurant result does not produce the nearby restaurant popup', async () => {
    useGeolocation.mockReturnValue(resolvedGeo);
    searchRestaurants.mockResolvedValue([liveRestaurantResult]);
    render(<DayGuide />);

    await buildPlanThroughRestaurantsFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('popups.nearbyRestaurant.title')).not.toBeInTheDocument();
  });

  test('a fallback restaurant source never produces the nearby restaurant popup', async () => {
    useGeolocation.mockReturnValue(resolvedGeo);
    // No API key: the restaurant queue stays empty, so nothing mock-backed
    // may be presented as a restaurant that is actually nearby.
    searchRestaurants.mockRejectedValue(new Error('NO_API_KEY'));
    render(<DayGuide />);

    await buildPlanThroughRestaurantsFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('popups.nearbyRestaurant.title')).not.toBeInTheDocument();
  });

  test('a popup shown in one plan can appear again in a fresh plan after start over', async () => {
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    await buildPlanFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText(popupTitlePattern)).toBeInTheDocument();

    fireEvent.click(screen.getByText('timeline.startOver'));

    await buildPlanFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText(popupTitlePattern)).toBeInTheDocument();
  });

  test('building a fresh plan after resume and start over re-enables popups', async () => {
    localStorage.setItem(SAVED_PLAN_STORAGE_KEY, JSON.stringify(savedPlanPayload));
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    fireEvent.click(screen.getByText('welcome.resumePlan'));
    fireEvent.click(screen.getByText('timeline.startOver'));

    await buildPlanFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText(popupTitlePattern)).toBeInTheDocument();
  });

  test('closing a nearby restaurant popup dismisses that restaurant across timeline updates', async () => {
    jest.spyOn(popupEngine, 'getTimelinePopupSuggestion').mockImplementation(({
      canShowPopup,
      dismissedRestaurantKeys,
    }) => {
      if (!canShowPopup('nearbyRestaurant')) return null;

      const restaurantKey = liveRestaurantResult.place_id;

      if (dismissedRestaurantKeys.has(restaurantKey)) return null;

      return {
        type: 'nearbyRestaurant',
        restaurant: liveRestaurantResult,
      };
    });

    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    await buildPlanFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText('popups.nearbyRestaurant.title')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'popups.nearbyRestaurant.no' }));

    expect(screen.queryByText('popups.nearbyRestaurant.title')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(7200001);
    });

    fireEvent.change(screen.getAllByRole('slider')[0], { target: { value: '2' } });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('popups.nearbyRestaurant.title')).not.toBeInTheDocument();
  });

});

// --- Live activities start broad, without a preference questionnaire ---

test('the default Things to do route makes a broad live activity search', async () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  searchActivities.mockResolvedValue([defaultLiveActivity]);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  continueFromPlanningEssentials('activities');

  expect(await screen.findByText('activities.yes')).toBeInTheDocument();
  expect(searchActivities).toHaveBeenLastCalledWith(
    resolvedGeo.position.lat,
    resolvedGeo.position.lng,
    [],
  );
});

test('a denied location shows an honest activity-unavailable card, never a sample card', async () => {
  useGeolocation.mockReturnValue(erroredGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  expect(screen.queryByText('activities.sampleBadge')).not.toBeInTheDocument();
  expect(screen.getByLabelText('planning.startSearchLabel')).toBeInTheDocument();
  expect(screen.getByText('planning.continue')).toBeDisabled();
  expect(searchActivities).not.toHaveBeenCalled();
});

// --- Restaurant selection flow ---

describe('restaurant selection flow', () => {
  // Walks from the welcome screen to the meal prompt by choosing the balanced
  // planning path and liking every offered activity.
  const walkToMealPrompt = async () => {
    fireEvent.click(screen.getByText('welcome.startPlanning'));
    continueFromPlanningEssentials('both');

    await screen.findByText('Live Test Museum');

    for (let i = 0; i < 50 && screen.queryByText('activities.yes'); i += 1) {
      fireEvent.click(screen.getByText('activities.yes'));
    }

    expect(screen.getByText('mealPrompt.title')).toBeInTheDocument();
  };

  // Declines restaurant cards until the queue is exhausted and the flow
  // moves on to the timeline. Bounded like the activity loop above.
  const skipRemainingRestaurants = () => {
    for (let i = 0; i < 50 && screen.queryByText('restaurants.skip'); i += 1) {
      fireEvent.click(screen.getByText('restaurants.skip'));
    }
  };

  // --- Honest behaviour when the live search cannot return results ---
  //
  // Mock venues must never be shown as real nearby recommendations. Every
  // failure mode must land the user on an honest unavailable/no-results state
  // that explains why and still offers a safe route to the timeline.

  test('a failed live search shows the unavailable notice with no restaurant cards and can be skipped to the timeline', async () => {
    searchRestaurants.mockRejectedValue(new Error('NO_API_KEY'));
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    await walkToMealPrompt();
    fireEvent.click(screen.getByText('mealPrompt.yes'));

    expect(await screen.findByText('restaurants.unavailableTitle')).toBeInTheDocument();
    expect(screen.getByText('restaurants.noKeyWarning')).toBeInTheDocument();

    // No mock venue may be offered for swiping as a recommendation. The only
    // level-3 heading permitted here is the unavailable card's "What can I try?"
    // guidance title — never a restaurant-name heading from a swipe card.
    expect(screen.queryByText('restaurants.yes')).not.toBeInTheDocument();
    const level3Headings = screen.queryAllByRole('heading', { level: 3 });
    expect(level3Headings).toHaveLength(1);
    expect(level3Headings[0]).toHaveTextContent('restaurants.whatCanITryTitle');

    fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

    expect(screen.getByText('timeline.title')).toBeInTheDocument();
  });

  test('hitting the API quota shows the unavailable notice with the quota reason and no restaurant cards', async () => {
    searchRestaurants.mockRejectedValue(new Error('QUOTA_EXCEEDED'));
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    await walkToMealPrompt();
    fireEvent.click(screen.getByText('mealPrompt.yes'));

    expect(await screen.findByText('restaurants.quotaWarning')).toBeInTheDocument();
    expect(screen.getByText('restaurants.unavailableTitle')).toBeInTheDocument();
    expect(screen.queryByText('restaurants.yes')).not.toBeInTheDocument();
  });

  test('an unexpected search failure shows the unavailable notice and still reaches the timeline', async () => {
    searchRestaurants.mockRejectedValue(new TypeError('Failed to fetch'));
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    await walkToMealPrompt();
    fireEvent.click(screen.getByText('mealPrompt.yes'));

    expect(await screen.findByText('restaurants.errorWarning')).toBeInTheDocument();
    expect(screen.queryByText('restaurants.yes')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

    expect(screen.getByText('timeline.title')).toBeInTheDocument();
  });

  test('an empty live search shows the no-results card with no mock restaurant cards and can be skipped', async () => {
    searchRestaurants.mockResolvedValue([]);
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    await walkToMealPrompt();
    fireEvent.click(screen.getByText('mealPrompt.yes'));

    expect(await screen.findByText('restaurants.noResultsTitle')).toBeInTheDocument();
    expect(screen.queryByText('restaurants.yes')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

    expect(screen.getByText('timeline.title')).toBeInTheDocument();
  });

  // Beyond reaching the timeline: the itinerary the user keeps must be a clean,
  // activities-only plan. The earlier activity selections survive, and no
  // restaurant — mock, placeholder, or stale — is written into the stored plan.
  test('skipping an empty live search lands on a timeline that keeps the activities and adds no restaurant', async () => {
    searchRestaurants.mockResolvedValue([]);
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    await walkToMealPrompt();
    fireEvent.click(screen.getByText('mealPrompt.yes'));

    expect(await screen.findByText('restaurants.noResultsTitle')).toBeInTheDocument();

    fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

    expect(screen.getByText('timeline.title')).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem(SAVED_PLAN_STORAGE_KEY));
    expect(stored.plan.timeline.length).toBeGreaterThan(0);
    // The activities chosen during walkToMealPrompt are all preserved: it likes
    // every offered activity for the first interest, so every venue in that
    // category's fixture should still be in the stored timeline.
    const storedActivityNames = stored.plan.timeline.map(item => item.activity);
    expect(storedActivityNames).toContain('Live Test Museum');
    // No restaurant was added: the skipped search contributes no food entry.
    expect(stored.plan.timeline.some(item => item.category === 'Food and Drinks')).toBe(false);
  });

  // --- Search request wiring (getRestaurantSearchRequestOutcome callsite) ---
  //
  // goToRestaurants delegates the API call to the extracted helper; these
  // tests pin the arguments crossing the searchRestaurants boundary rather
  // than asserting broadly on the rendered queue.
  describe('search request wiring', () => {
    // Chooses the dedicated Food & drink path, which performs one broad live
    // restaurant search without the retired preferences questionnaire.
    const walkToRestaurantsFirst = () => {
      fireEvent.click(screen.getByText('welcome.startPlanning'));
      continueFromPlanningEssentials('food');
    };

    const liveSearchResult = {
      id: 'live-wiring-1',
      place_id: 'live-wiring-1',
      name: 'Wired Bistro',
      city: '',
      cuisine: ['italian'],
      priceRange: '$$',
      rating: 4.5,
      duration: 1.5,
      distance: 0.4,
      address: '2 Test Street',
      image: null,
    };

    test('passes the geolocated position with no assumed cuisine or price to the live search', async () => {
      searchRestaurants.mockResolvedValue([liveSearchResult]);
      useGeolocation.mockReturnValue(resolvedGeo);
      render(<DayGuide />);

      walkToRestaurantsFirst();

      expect(await screen.findByText('restaurants.liveResults')).toBeInTheDocument();

      expect(searchRestaurants).toHaveBeenCalledTimes(1);
      expect(searchRestaurants).toHaveBeenCalledWith(
        resolvedGeo.position.lat,
        resolvedGeo.position.lng,
        [],
        null,
      );
    });

    test('searches with an empty cuisine list and no price when nothing is selected', async () => {
      searchRestaurants.mockResolvedValue([liveSearchResult]);
      useGeolocation.mockReturnValue(resolvedGeo);
      render(<DayGuide />);

      walkToRestaurantsFirst();

      expect(await screen.findByText('restaurants.liveResults')).toBeInTheDocument();

      expect(searchRestaurants).toHaveBeenCalledTimes(1);
      expect(searchRestaurants).toHaveBeenCalledWith(
        resolvedGeo.position.lat,
        resolvedGeo.position.lng,
        [],
        null,
      );
    });

    test('accepting the meal prompt searches with the cuisine defaults, not the click event', async () => {
      searchRestaurants.mockResolvedValue([liveSearchResult]);
      useGeolocation.mockReturnValue(resolvedGeo);
      render(<DayGuide />);

      await walkToMealPrompt();
      fireEvent.click(screen.getByText('mealPrompt.yes'));

      expect(await screen.findByText('restaurants.liveResults')).toBeInTheDocument();

      expect(searchRestaurants).toHaveBeenCalledTimes(1);
      expect(searchRestaurants).toHaveBeenCalledWith(
        resolvedGeo.position.lat,
        resolvedGeo.position.lng,
        [],
        null,
      );
    });

    // erroredGeo is a *denied* permission, which the user can fix in browser
    // settings — so it must not be reported as the generic "we couldn't get
    // your location".
    test('skips the live search and explains the denied location permission', async () => {
      searchRestaurants.mockResolvedValue([liveSearchResult]);
      useGeolocation.mockReturnValue(erroredGeo);
      render(<DayGuide />);

      fireEvent.click(screen.getByText('welcome.startPlanning'));

      expect(screen.getByLabelText('planning.startSearchLabel')).toBeInTheDocument();
      expect(screen.getByText('planning.continue')).toBeDisabled();

      expect(searchRestaurants).not.toHaveBeenCalled();
    });

    test('skips the live search and shows the generic notice when the position never arrives', async () => {
      searchRestaurants.mockResolvedValue([liveSearchResult]);
      useGeolocation.mockReturnValue({
        position: null,
        error: 'location.unavailable',
        isLoading: false,
        refresh: jest.fn(),
      });
      render(<DayGuide />);

      fireEvent.click(screen.getByText('welcome.startPlanning'));

      expect(screen.getByText('planning.continue')).toBeDisabled();

      expect(searchRestaurants).not.toHaveBeenCalled();
    });

    // The provider failing is outside DayGuide's control, so a retry is honest
    // and must re-issue the search rather than surface mock restaurants.
    test('a network failure explains the connection and retries the real search', async () => {
      searchRestaurants.mockRejectedValueOnce(new Error('NETWORK_ERROR'));
      useGeolocation.mockReturnValue(resolvedGeo);
      render(<DayGuide />);

      walkToRestaurantsFirst();

      expect(await screen.findByText('restaurants.networkWarning')).toBeInTheDocument();
      expect(screen.queryByText('Trattoria Roma')).not.toBeInTheDocument();

      searchRestaurants.mockResolvedValueOnce([liveSearchResult]);
      fireEvent.click(screen.getByText('restaurants.tryAgain'));

      expect(await screen.findByText('restaurants.liveResults')).toBeInTheDocument();
      expect(searchRestaurants).toHaveBeenCalledTimes(2);
    });

    // Retrying an unconfigured search would fail identically, so don't offer it.
    test('a missing live-search key explains an app-side fault and offers no retry', async () => {
      searchRestaurants.mockRejectedValue(new Error('NO_API_KEY'));
      useGeolocation.mockReturnValue(resolvedGeo);
      render(<DayGuide />);

      walkToRestaurantsFirst();

      expect(await screen.findByText('restaurants.noKeyWarning')).toBeInTheDocument();
      expect(screen.getByText('restaurants.noKeyHint')).toBeInTheDocument();
      expect(screen.queryByText('restaurants.tryAgain')).not.toBeInTheDocument();
    });
  });

  test('shows live results when the search succeeds and puts the liked one on the timeline', async () => {
    searchRestaurants.mockResolvedValue([
      {
        id: 'live-1',
        place_id: 'live-1',
        name: 'Live Bistro',
        cuisine: ['italian'],
        rating: 4.6,
        priceRange: '$$',
        distance: 0.6,
        duration: 1.5,
        address: '1 Test Street',
        image: 'https://example.com/live.jpg',
      },
    ]);
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    await walkToMealPrompt();
    fireEvent.click(screen.getByText('mealPrompt.yes'));

    expect(await screen.findByText('restaurants.liveResults')).toBeInTheDocument();
    expect(screen.getByText('Live Bistro')).toBeInTheDocument();

    fireEvent.click(screen.getByText('restaurants.yes'));
    skipRemainingRestaurants();

    expect(screen.getByText('timeline.title')).toBeInTheDocument();
    expect(screen.getByText('Live Bistro')).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem(SAVED_PLAN_STORAGE_KEY));
    expect(stored.plan.timeline.map(item => item.activity)).toContain('Live Bistro');
  });

  // --- Full-journey smoke test ---
  //
  // Higher-altitude than the per-source failure tests above: one end-to-end
  // walk proving the whole journey stays coherent when restaurants are
  // unavailable — no mock venue is passed off as a real nearby recommendation,
  // the honest notice is shown, and skipping still lands the user on a
  // populated activities timeline. A single failure source stands in for the
  // set; the per-source reason copy is asserted above and in RestaurantsStage.
  test('the full flow stays coherent when restaurants are unavailable: no mock card, honest notice, and a safe skip to a populated timeline', async () => {
    searchRestaurants.mockRejectedValue(new Error('NO_API_KEY'));
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    await walkToMealPrompt();
    fireEvent.click(screen.getByText('mealPrompt.yes'));

    // The honest unavailable notice, not a mock venue dressed up as real.
    expect(await screen.findByText('restaurants.unavailableTitle')).toBeInTheDocument();
    // No swipe card: no accept action and no restaurant-name heading. The only
    // level-3 heading allowed is the unavailable card's "What can I try?" title.
    expect(screen.queryByText('restaurants.yes')).not.toBeInTheDocument();
    const level3Headings = screen.queryAllByRole('heading', { level: 3 });
    expect(level3Headings).toHaveLength(1);
    expect(level3Headings[0]).toHaveTextContent('restaurants.whatCanITryTitle');
    // A known mock venue must never surface as a nearby recommendation.
    expect(screen.queryByText('Dishoom')).not.toBeInTheDocument();

    // The user can safely skip restaurants and continue.
    fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

    // The journey lands on a coherent, populated activities timeline.
    expect(screen.getByText('timeline.title')).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(SAVED_PLAN_STORAGE_KEY));
    expect(stored.plan.timeline.length).toBeGreaterThan(0);
  });
});
