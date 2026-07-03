import { buildDayNarrative } from './dayNarrative';

const makeTimeline = (count = 3) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${i}-item${i}`,
    time: '10:00',
    activity: `Stop ${i + 1}`,
    duration: 1,
    distance: 1.2,
    category: 'museums',
    icon: '🏛️',
    address: `${i + 1} Test Street`,
    rating: 4.5,
  }));

const baseParams = {
  timeline: makeTimeline(3),
  startTime: 10,
  availableTime: 6,
  totalDuration: 3.5,
  hasChildren: false,
  selectedCuisines: [],
  selectedPriceRange: null,
  startWith: 'activities',
};

test('returns an empty string when timeline is missing', () => {
  expect(buildDayNarrative()).toBe('');
  expect(buildDayNarrative({ startTime: 10, startWith: 'activities' })).toBe('');
});

test('returns an empty string when timeline is empty', () => {
  expect(buildDayNarrative({ ...baseParams, timeline: [] })).toBe('');
});

test('food-first plan mentions starting with food', () => {
  const narrative = buildDayNarrative({ ...baseParams, startWith: 'food_drinks' });
  expect(narrative).toMatch(/begins with food/i);
});

test('activity-first plan mentions starting with activities', () => {
  const narrative = buildDayNarrative({ ...baseParams, startWith: 'activities' });
  expect(narrative).toMatch(/starts with activities/i);
});

test('mentions the number of stops', () => {
  const narrative = buildDayNarrative(baseParams);
  expect(narrative).toContain('3-stop');
});

test('plan within available time is described as fitting', () => {
  const narrative = buildDayNarrative({ ...baseParams, totalDuration: 3, availableTime: 6 });
  expect(narrative).toMatch(/fit within your available time/i);
  expect(narrative).not.toMatch(/tight/i);
});

test('over-time plan mentions the schedule may feel tight', () => {
  const narrative = buildDayNarrative({ ...baseParams, totalDuration: 7, availableTime: 4 });
  expect(narrative).toMatch(/tight/i);
});

test('children in the party adds family-friendly wording', () => {
  const withChildren = buildDayNarrative({ ...baseParams, hasChildren: true });
  const withoutChildren = buildDayNarrative({ ...baseParams, hasChildren: false });
  expect(withChildren).toMatch(/family-friendly/i);
  expect(withoutChildren).not.toMatch(/family-friendly/i);
});

test('cuisine preference appears with a readable label', () => {
  const narrative = buildDayNarrative({
    ...baseParams,
    selectedCuisines: ['middleEastern'],
  });
  expect(narrative).toContain('Middle Eastern');
});

test('budget preference appears when a price range is supplied', () => {
  const narrative = buildDayNarrative({ ...baseParams, selectedPriceRange: '$$' });
  expect(narrative).toMatch(/moderate budget/i);
});

test('whole start hour is formatted readably', () => {
  const narrative = buildDayNarrative({ ...baseParams, startTime: 9 });
  expect(narrative).toContain('9:00');
});

test('decimal start time is formatted readably', () => {
  const narrative = buildDayNarrative({ ...baseParams, startTime: 9.5 });
  expect(narrative).toContain('9:30');
});

test('unusable start time still produces a narrative without a clock time', () => {
  const narrative = buildDayNarrative({ ...baseParams, startTime: undefined });
  expect(narrative).toMatch(/^This 3-stop plan/);
});

test('default wording is unchanged when no copy override is passed', () => {
  const narrative = buildDayNarrative({
    ...baseParams,
    startWith: 'food_drinks',
    selectedPriceRange: '$$',
    totalDuration: 3,
    availableTime: 6,
  });
  expect(narrative).toContain('begins with food before moving on to the rest of your day');
  expect(narrative).toMatch(/It should fit within your available time/);
  expect(narrative).toMatch(/moderate budget/);
  expect(narrative).toMatch(/kept in mind/);
});

test('empty copy object behaves the same as no copy argument', () => {
  expect(buildDayNarrative(baseParams, {})).toBe(buildDayNarrative(baseParams));
});

test('copy override can replace the food-first phrase', () => {
  const narrative = buildDayNarrative(
    { ...baseParams, startWith: 'food_drinks' },
    { foodFirst: 'kicks off with a bite to eat' },
  );
  expect(narrative).toContain('kicks off with a bite to eat');
  expect(narrative).not.toContain('begins with food');
});

test('copy override can replace the fits-time phrase', () => {
  const narrative = buildDayNarrative(
    { ...baseParams, totalDuration: 3, availableTime: 6 },
    { fitsTime: 'There is comfortable room in your schedule' },
  );
  expect(narrative).toContain('There is comfortable room in your schedule');
  expect(narrative).not.toContain('It should fit within your available time');
});

test('copy override can replace one price label without losing the others', () => {
  const overridden = buildDayNarrative(
    { ...baseParams, selectedPriceRange: '$$' },
    { priceLabels: { $$: 'mid-range' } },
  );
  expect(overridden).toMatch(/mid-range budget/);
  expect(overridden).not.toMatch(/moderate budget/);

  const untouched = buildDayNarrative(
    { ...baseParams, selectedPriceRange: '$' },
    { priceLabels: { $$: 'mid-range' } },
  );
  expect(untouched).toMatch(/budget-friendly budget/);
});

test('narrative never exceeds two sentences', () => {
  const narrative = buildDayNarrative({
    ...baseParams,
    startWith: 'food_drinks',
    hasChildren: true,
    selectedCuisines: ['italian', 'japanese'],
    selectedPriceRange: '$$$',
    totalDuration: 8,
    availableTime: 4,
  });
  const sentences = narrative.match(/[^.!?]+[.!?]/g) || [];
  expect(sentences.length).toBeLessThanOrEqual(2);
});
