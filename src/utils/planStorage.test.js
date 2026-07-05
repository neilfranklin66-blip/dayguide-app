import {
  SAVED_PLAN_STORAGE_KEY,
  savePlan,
  loadPlan,
  clearPlan,
} from './planStorage';

const validPlan = {
  timeline: [
    {
      id: '0-1',
      time: '9:00',
      activity: 'Borough Market',
      duration: 1.5,
      distance: 1.2,
      category: 'italian',
      icon: '🍝',
      address: '8 Southwark St',
      rating: 4.6,
    },
  ],
  startTime: 9,
  availableTime: 4,
  hasChildren: false,
  selectedCuisines: ['italian'],
  selectedPriceRange: '$$',
  selectedDate: '2026-07-05',
  startWith: 'activities',
};

afterEach(() => {
  localStorage.clear();
});

test('save/load round trip returns the persisted plan fields', () => {
  savePlan(validPlan);

  expect(loadPlan()).toEqual(validPlan);
});

test('saved payload is versioned with a savedAt timestamp', () => {
  savePlan(validPlan);

  const stored = JSON.parse(localStorage.getItem(SAVED_PLAN_STORAGE_KEY));
  expect(stored.version).toBe(1);
  expect(typeof stored.savedAt).toBe('string');
  expect(stored.plan).toEqual(validPlan);
});

test('loadPlan returns null when no plan is saved', () => {
  expect(loadPlan()).toBeNull();
});

test('loadPlan returns null for corrupt JSON', () => {
  localStorage.setItem(SAVED_PLAN_STORAGE_KEY, '{not json');

  expect(loadPlan()).toBeNull();
});

test('loadPlan returns null for a wrong version', () => {
  localStorage.setItem(
    SAVED_PLAN_STORAGE_KEY,
    JSON.stringify({ version: 2, savedAt: new Date().toISOString(), plan: validPlan }),
  );

  expect(loadPlan()).toBeNull();
});

test('loadPlan returns null when the plan object is missing', () => {
  localStorage.setItem(
    SAVED_PLAN_STORAGE_KEY,
    JSON.stringify({ version: 1, savedAt: new Date().toISOString() }),
  );

  expect(loadPlan()).toBeNull();
});

test('loadPlan returns null for an empty timeline', () => {
  savePlan({ ...validPlan, timeline: [] });

  expect(loadPlan()).toBeNull();
});

test('loadPlan returns null when startTime is not a finite number', () => {
  savePlan({ ...validPlan, startTime: null });

  expect(loadPlan()).toBeNull();
});

test('clearPlan removes the key', () => {
  savePlan(validPlan);
  clearPlan();

  expect(localStorage.getItem(SAVED_PLAN_STORAGE_KEY)).toBeNull();
});

describe('when localStorage throws', () => {
  const throwing = () => {
    throw new Error('storage unavailable');
  };

  test('savePlan does not throw', () => {
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(throwing);

    expect(() => savePlan(validPlan)).not.toThrow();

    spy.mockRestore();
  });

  test('loadPlan returns null instead of throwing', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(throwing);

    expect(loadPlan()).toBeNull();

    spy.mockRestore();
  });

  test('clearPlan does not throw', () => {
    const spy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(throwing);

    expect(() => clearPlan()).not.toThrow();

    spy.mockRestore();
  });
});
