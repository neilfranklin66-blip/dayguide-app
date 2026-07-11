import {
  SAVED_PLAN_STORAGE_KEY,
  savePlan,
  loadPlan,
  clearPlan,
  isPlanDateExpired,
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

  // validPlan.selectedDate is a fixed fixture date; pass a matching fixed
  // "today" so this structural round-trip test does not depend on expiry.
  expect(loadPlan(new Date('2026-07-05T12:00:00'))).toEqual(validPlan);
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

describe('isPlanDateExpired', () => {
  test('a date before today is expired', () => {
    expect(isPlanDateExpired('2026-07-04', new Date('2026-07-05T12:00:00'))).toBe(true);
  });

  test('a date equal to today is not expired', () => {
    expect(isPlanDateExpired('2026-07-05', new Date('2026-07-05T12:00:00'))).toBe(false);
  });

  test('a future date is not expired', () => {
    expect(isPlanDateExpired('2026-07-06', new Date('2026-07-05T12:00:00'))).toBe(false);
  });

  test('a same-day plan is not expired even after its start time has passed', () => {
    // "today" is late in the evening; the plan's own start time is irrelevant
    // to isPlanDateExpired, which only compares calendar dates.
    expect(isPlanDateExpired('2026-07-05', new Date('2026-07-05T23:45:00'))).toBe(false);
  });

  test('local calendar comparison does not shift with UTC midnight conversion', () => {
    // Local midnight-ish "today": a naive `new Date(selectedDate) < today`
    // comparison via toISOString()/UTC parsing could push this either side
    // of the boundary depending on the machine's timezone offset. Using the
    // local Date constructor (not toISOString) keeps this deterministic.
    const justAfterLocalMidnight = new Date(2026, 6, 5, 0, 30);

    expect(isPlanDateExpired('2026-07-05', justAfterLocalMidnight)).toBe(false);
    expect(isPlanDateExpired('2026-07-04', justAfterLocalMidnight)).toBe(true);
  });

  test('malformed or missing dates are not treated as expired', () => {
    expect(isPlanDateExpired(undefined, new Date('2026-07-05'))).toBe(false);
    expect(isPlanDateExpired(null, new Date('2026-07-05'))).toBe(false);
    expect(isPlanDateExpired('05/07/2026', new Date('2026-07-05'))).toBe(false);
    expect(isPlanDateExpired('not-a-date', new Date('2026-07-05'))).toBe(false);
  });
});

describe('loadPlan expiry', () => {
  test('a plan dated yesterday is not returned', () => {
    savePlan({ ...validPlan, selectedDate: '2026-07-04' });

    expect(loadPlan(new Date('2026-07-05T09:00:00'))).toBeNull();
  });

  test('an expired plan is cleared from storage', () => {
    savePlan({ ...validPlan, selectedDate: '2026-07-04' });

    loadPlan(new Date('2026-07-05T09:00:00'));

    expect(localStorage.getItem(SAVED_PLAN_STORAGE_KEY)).toBeNull();
  });

  test('a plan dated today is returned', () => {
    savePlan({ ...validPlan, selectedDate: '2026-07-05' });

    expect(loadPlan(new Date('2026-07-05T09:00:00'))).toEqual({
      ...validPlan,
      selectedDate: '2026-07-05',
    });
  });

  test('a future-dated plan is returned', () => {
    savePlan({ ...validPlan, selectedDate: '2026-07-06' });

    expect(loadPlan(new Date('2026-07-05T09:00:00'))).toEqual({
      ...validPlan,
      selectedDate: '2026-07-06',
    });
  });
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
