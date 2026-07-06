import { render, screen, fireEvent, act } from '@testing-library/react';
import DayGuide from './DayGuide';
import useGeolocation from './useGeolocation';
import { searchRestaurants } from './api/placesApi';
import { SAVED_PLAN_STORAGE_KEY } from './utils/planStorage';
import { INTEREST_CATEGORY_OPTIONS } from './config/dayGuideOptions';

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
  fireEvent.click(screen.getByRole('button', { name: 'No' }));
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
  fireEvent.click(screen.getByRole('button', { name: 'No' }));
  fireEvent.click(screen.getByText('interests.next'));

  for (let i = 0; i < 50 && screen.queryByText('activities.yes'); i += 1) {
    fireEvent.click(screen.getByText('activities.yes'));
  }

  fireEvent.click(screen.getByText('mealPrompt.no'));
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

  test('a popup shown in one plan can appear again in a fresh plan after start over', () => {
    useGeolocation.mockReturnValue(resolvedGeo);
    render(<DayGuide />);

    buildPlanFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Assert the specific popup type: the generic pattern could pass with a
    // lower-priority popup even if nearbyRestaurant were still on cooldown.
    expect(screen.getByText('popups.nearbyRestaurant.title')).toBeInTheDocument();

    fireEvent.click(screen.getByText('timeline.startOver'));

    buildPlanFromWelcome();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText('popups.nearbyRestaurant.title')).toBeInTheDocument();
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
});

// --- Restaurant selection flow ---

describe('restaurant selection flow', () => {
  // Walks from the welcome screen to the meal prompt: pick the first interest,
  // answer the children question, and like every offered activity.
  const walkToMealPrompt = () => {
    fireEvent.click(screen.getByText('welcome.startPlanning'));

    fireEvent.click(screen.getByText(`interests.${INTEREST_CATEGORY_OPTIONS[0].id}`));
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
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
