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

test('default English output for a representative full case is unchanged', () => {
  const narrative = buildDayNarrative({
    ...baseParams,
    startWith: 'food_drinks',
    hasChildren: true,
    selectedCuisines: ['italian'],
    selectedPriceRange: '$$',
    totalDuration: 3,
    availableTime: 6,
  });
  expect(narrative).toBe(
    'Starting around 10:00, this 3-stop plan begins with food before moving on to the rest of your day. ' +
    'It should fit within your available time, with your Italian preferences, a moderate budget, and family-friendly pacing kept in mind.',
  );
});

test('template override can reshape the first sentence', () => {
  const narrative = buildDayNarrative(baseParams, {
    templates: { openerWithTime: '{orderText} — a {stopLabel} outing from {time}.' },
  });
  expect(narrative).toContain('starts with activities before any food stops — a 3-stop outing from 10:00.');
});

test('a ZH-like template produces output without inserted whitespace', () => {
  const narrative = buildDayNarrative(
    { timeline: makeTimeline(3), startWith: 'food_drinks' },
    {
      foodFirst: '先安排用餐',
      stopLabelOther: '{count}站',
      templates: { openerWithoutTime: '这个{stopLabel}行程{orderText}。' },
    },
  );
  expect(narrative).toBe('这个3站行程先安排用餐。');
});

test('stopLabelOne and stopLabelOther overrides are used', () => {
  const single = buildDayNarrative(
    { ...baseParams, timeline: makeTimeline(1) },
    { stopLabelOne: 'single-stop' },
  );
  expect(single).toContain('single-stop plan');

  const multi = buildDayNarrative(baseParams, { stopLabelOther: '{count} etapas' });
  expect(multi).toContain('3 etapas plan');
});

test('list separator overrides are used for two and three items', () => {
  const two = buildDayNarrative(
    { ...baseParams, selectedCuisines: ['italian', 'japanese'] },
    { listTwoSeparator: '和' },
  );
  expect(two).toContain('Italian和Japanese');

  const three = buildDayNarrative(
    {
      ...baseParams,
      selectedCuisines: ['italian'],
      selectedPriceRange: '$$',
      hasChildren: true,
    },
    { listMiddleSeparator: '；', listFinalSeparator: '；以及' },
  );
  expect(three).toContain('your Italian preferences；a moderate budget；以及family-friendly pacing');
});

test('unknown placeholders are left visible in the output', () => {
  const narrative = buildDayNarrative(baseParams, {
    templates: { openerWithTime: 'Starting around {time}, this {stopLabel} plan {orderText} {mystery}.' },
  });
  expect(narrative).toContain('{mystery}');
});

test('partial template override keeps the other default templates', () => {
  const narrative = buildDayNarrative(
    {
      ...baseParams,
      selectedCuisines: ['italian'],
      totalDuration: 3,
      availableTime: 6,
    },
    { templates: { cuisinePreference: 'a taste for {cuisines}' } },
  );
  expect(narrative).toContain('a taste for Italian');
  expect(narrative).toMatch(/^Starting around 10:00, this 3-stop plan/);
  expect(narrative).toMatch(/kept in mind\.$/);
});

test('cuisineLabels override replaces the derived English cuisine label', () => {
  const narrative = buildDayNarrative(
    { ...baseParams, selectedCuisines: ['middleEastern'] },
    { cuisineLabels: { middleEastern: '中东' } },
  );
  expect(narrative).toContain('中东');
  expect(narrative).not.toContain('Middle Eastern');
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
