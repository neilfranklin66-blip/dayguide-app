import { render, screen, fireEvent, act } from '@testing-library/react';
import DayGuide from './DayGuide';
import useGeolocation from './useGeolocation';
import { searchRestaurants } from './api/placesApi';
import { SAVED_PLAN_STORAGE_KEY } from './utils/planStorage';
import { INTEREST_CATEGORY_OPTIONS } from './config/dayGuideOptions';
import * as popupEngine from './engines/popupEngine';

jest.mock('./useGeolocation');
jest.mock('./api/placesApi');

jest.mock('./AuthContext', () => ({
  useAuth: () => ({
    currentUser: { email: 'test@example.com' },
    logout: jest.fn(),
  }),
}));

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

test('shows location loading copy when planning starts while geolocation is loading', () => {
  useGeolocation.mockReturnValue(loadingGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  expect(screen.getByText('welcome.findingLocation')).toBeInTheDocument();
});

test('advances to interests when geolocation finishes loading', () => {
  useGeolocation.mockReturnValue(loadingGeo);
  const { rerender } = render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  expect(screen.getByText('welcome.findingLocation')).toBeInTheDocument();

  useGeolocation.mockReturnValue(resolvedGeo);
  rerender(<DayGuide />);

  expect(screen.getByText('interests.title')).toBeInTheDocument();
  expect(screen.queryByText('welcome.findingLocation')).not.toBeInTheDocument();
});

test('advances to interests when loading ends with a geolocation error', () => {
  useGeolocation.mockReturnValue(loadingGeo);
  const { rerender } = render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  expect(screen.getByText('welcome.findingLocation')).toBeInTheDocument();

  useGeolocation.mockReturnValue(erroredGeo);
  rerender(<DayGuide />);

  expect(screen.getByText('interests.title')).toBeInTheDocument();
});

test('skips the location stage when geolocation is already resolved', () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  expect(screen.getByText('interests.title')).toBeInTheDocument();
  expect(screen.queryByText('welcome.findingLocation')).not.toBeInTheDocument();
});

// --- Saved-plan persistence ---

const savedPlanPayload = {
  version: 1,
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

test('resuming a seeded saved plan lands on the timeline with its content', () => {
  localStorage.setItem(SAVED_PLAN_STORAGE_KEY, JSON.stringify(savedPlanPayload));
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  expect(screen.getByText(/📅 2026-07-05/)).toBeInTheDocument();
  expect(screen.getByText(/welcome\.resumePlanDetails/)).toBeInTheDocument();

  fireEvent.click(screen.getByText('welcome.resumePlan'));

  expect(screen.getByText('timeline.title')).toBeInTheDocument();
  expect(screen.getByText('Borough Market')).toBeInTheDocument();
});

test('building a timeline saves the plan and start over clears it', () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  // Interests stage: pick the first interest and answer the children question.
  fireEvent.click(screen.getByText(`interests.${INTEREST_CATEGORY_OPTIONS[0].id}`));
  fireEvent.click(screen.getByRole('button', { name: 'interests.childrenNo' }));
  fireEvent.click(screen.getByText('interests.next'));

  // Like every activity in the queue until the flow moves on.
  for (let i = 0; i < 50 && screen.queryByText('activities.yes'); i += 1) {
    fireEvent.click(screen.getByText('activities.yes'));
  }

  // Decline the meal prompt so the timeline is built from activities alone.
  fireEvent.click(screen.getByText('mealPrompt.no'));
  expect(screen.getByText('timeline.title')).toBeInTheDocument();

  const stored = JSON.parse(localStorage.getItem(SAVED_PLAN_STORAGE_KEY));
  expect(stored.version).toBe(1);
  expect(stored.plan.timeline.length).toBeGreaterThan(0);

  fireEvent.click(screen.getByText('timeline.startOver'));

  expect(localStorage.getItem(SAVED_PLAN_STORAGE_KEY)).toBeNull();
  expect(screen.getByText('welcome.startPlanning')).toBeInTheDocument();
  expect(screen.queryByText('welcome.resumePlan')).not.toBeInTheDocument();
  expect(screen.queryByText(/welcome\.resumePlanDetails/)).not.toBeInTheDocument();
});

// --- Popup suppression for resumed plans ---

const popupTitlePattern = /^popups\.(nearbyRestaurant|coffeeBreak|activityBreak)\.title$/;

// Walks the planning flow from the welcome screen to an activities-only
// timeline, matching the steps in the persistence test above.
const buildPlanFromWelcome = () => {
  fireEvent.click(screen.getByText('welcome.startPlanning'));

  fireEvent.click(screen.getByText(`interests.${INTEREST_CATEGORY_OPTIONS[0].id}`));
  fireEvent.click(screen.getByRole('button', { name: 'interests.childrenNo' }));
  fireEvent.click(screen.getByText('interests.next'));

  for (let i = 0; i < 50 && screen.queryByText('activities.yes'); i += 1) {
    fireEvent.click(screen.getByText('activities.yes'));
  }

  fireEvent.click(screen.getByText('mealPrompt.no'));
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

  fireEvent.click(screen.getByText(`interests.${INTEREST_CATEGORY_OPTIONS[0].id}`));
  fireEvent.click(screen.getByRole('button', { name: 'interests.childrenNo' }));
  fireEvent.click(screen.getByText('interests.next'));

  for (let i = 0; i < 50 && screen.queryByText('activities.yes'); i += 1) {
    fireEvent.click(screen.getByText('activities.yes'));
  }

  fireEvent.click(screen.getByText('mealPrompt.yes'));
  await act(async () => {}); // flush the restaurant search promise

  for (let i = 0; i < 50 && screen.queryByText('restaurants.skip'); i += 1) {
    fireEvent.click(screen.getByText('restaurants.skip'));
  }

  expect(screen.getByText('timeline.title')).toBeInTheDocument();
};

describe('timeline popup suggestions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
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

  test('a freshly built plan still triggers a popup suggestion', () => {
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    buildPlanFromWelcome();

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
    // No API key: the queue the user swipes is built from mock data, which
    // must not be presented as a restaurant that is actually nearby.
    searchRestaurants.mockRejectedValue(new Error('NO_API_KEY'));
    render(<DayGuide />);

    await buildPlanThroughRestaurantsFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('popups.nearbyRestaurant.title')).not.toBeInTheDocument();
  });

  test('a popup shown in one plan can appear again in a fresh plan after start over', () => {
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    buildPlanFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText(popupTitlePattern)).toBeInTheDocument();

    fireEvent.click(screen.getByText('timeline.startOver'));

    buildPlanFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText(popupTitlePattern)).toBeInTheDocument();
  });

  test('building a fresh plan after resume and start over re-enables popups', () => {
    localStorage.setItem(SAVED_PLAN_STORAGE_KEY, JSON.stringify(savedPlanPayload));
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    fireEvent.click(screen.getByText('welcome.resumePlan'));
    fireEvent.click(screen.getByText('timeline.startOver'));

    buildPlanFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText(popupTitlePattern)).toBeInTheDocument();
  });

  test('closing a nearby restaurant popup dismisses that restaurant across timeline updates', () => {
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

    buildPlanFromWelcome();

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

// --- Activities no-results "show all" ---

test('show all broadens an empty filtered activity queue to all activity types', () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  // Return no activities while interests are selected, but delegate to the
  // real engine for the broadened empty-interests query, so this fails if
  // the show-all override is ignored and the same filtered query re-runs.
  mockGetActivitiesOverride = (params, actualFn) =>
    params.interests.length > 0 ? [] : actualFn(params);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  fireEvent.click(screen.getByText(`interests.${INTEREST_CATEGORY_OPTIONS[0].id}`));
  fireEvent.click(screen.getByRole('button', { name: 'interests.childrenNo' }));
  fireEvent.click(screen.getByText('interests.next'));

  expect(screen.getByText('activities.noResultsTitle')).toBeInTheDocument();

  fireEvent.click(screen.getByText('activities.showAll'));

  expect(screen.queryByText('activities.noResultsTitle')).not.toBeInTheDocument();
  expect(screen.getByText('activities.yes')).toBeInTheDocument();
});

// --- Restaurant selection flow ---

describe('restaurant selection flow', () => {
  // Walks from the welcome screen to the meal prompt: pick the first interest,
  // answer the children question, and like every offered activity.
  const walkToMealPrompt = () => {
    fireEvent.click(screen.getByText('welcome.startPlanning'));

    fireEvent.click(screen.getByText(`interests.${INTEREST_CATEGORY_OPTIONS[0].id}`));
    fireEvent.click(screen.getByRole('button', { name: 'interests.childrenNo' }));
    fireEvent.click(screen.getByText('interests.next'));

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

  test('falls back to mock restaurants when the live search fails and puts the liked one on the timeline', async () => {
    searchRestaurants.mockRejectedValue(new Error('NO_API_KEY'));
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    walkToMealPrompt();
    fireEvent.click(screen.getByText('mealPrompt.yes'));

    expect(await screen.findByText('restaurants.noKeyWarning')).toBeInTheDocument();

    // The fallback queue is shuffled, so capture whichever restaurant is
    // showing rather than asserting a hard-coded venue name.
    const likedName = screen.getByRole('heading', { level: 3 }).textContent;
    expect(likedName).not.toBe('');

    fireEvent.click(screen.getByText('restaurants.yes'));
    skipRemainingRestaurants();

    expect(screen.getByText('timeline.title')).toBeInTheDocument();
    expect(screen.getByText(likedName)).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem(SAVED_PLAN_STORAGE_KEY));
    expect(stored.plan.timeline.map(item => item.activity)).toContain(likedName);
  });

  // --- Search request wiring (getRestaurantSearchRequestOutcome callsite) ---
  //
  // goToRestaurants delegates the API call to the extracted helper; these
  // tests pin the arguments crossing the searchRestaurants boundary rather
  // than asserting broadly on the rendered queue.
  describe('search request wiring', () => {
    // Fills in the interests stage with the start order flipped to food &
    // drinks, so interests.next routes straight into the restaurant search
    // with the state-held cuisine/price defaults (no override arguments).
    const walkToInterestsRestaurantsFirst = () => {
      fireEvent.click(screen.getByText('welcome.startPlanning'));

      fireEvent.click(screen.getByText(`interests.${INTEREST_CATEGORY_OPTIONS[0].id}`));
      fireEvent.click(screen.getByRole('button', { name: 'interests.childrenNo' }));
      fireEvent.click(screen.getByText('interests.startWithFoodDrinks'));
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

    test('passes the geolocated position and selected cuisine and price to the live search', async () => {
      searchRestaurants.mockResolvedValue([liveSearchResult]);
      useGeolocation.mockReturnValue(resolvedGeo);
      render(<DayGuide />);

      walkToInterestsRestaurantsFirst();
      fireEvent.click(screen.getByText('cuisine.italian'));
      fireEvent.click(screen.getByText('priceRange.moderate'));
      fireEvent.click(screen.getByText('interests.next'));

      expect(await screen.findByText('restaurants.liveResults')).toBeInTheDocument();

      expect(searchRestaurants).toHaveBeenCalledTimes(1);
      expect(searchRestaurants).toHaveBeenCalledWith(
        resolvedGeo.position.lat,
        resolvedGeo.position.lng,
        ['italian'],
        '$$',
      );
    });

    test('searches with an empty cuisine list and no price when nothing is selected', async () => {
      searchRestaurants.mockResolvedValue([liveSearchResult]);
      useGeolocation.mockReturnValue(resolvedGeo);
      render(<DayGuide />);

      walkToInterestsRestaurantsFirst();
      fireEvent.click(screen.getByText('interests.next'));

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

      walkToMealPrompt();
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

    test('skips the live search and falls back to mocks when no position is available', async () => {
      searchRestaurants.mockResolvedValue([liveSearchResult]);
      useGeolocation.mockReturnValue(erroredGeo);
      render(<DayGuide />);

      walkToInterestsRestaurantsFirst();
      fireEvent.click(screen.getByText('interests.next'));

      expect(await screen.findByText('restaurants.noLocationWarning')).toBeInTheDocument();

      expect(searchRestaurants).not.toHaveBeenCalled();
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

    walkToMealPrompt();
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
});
