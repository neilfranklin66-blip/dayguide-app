import { buildDayNarrative } from './dayNarrative';

const food = { selectionType: 'food' };
const activity = { selectionType: 'activity' };

test('returns no narrative for missing, empty, or one-stop itineraries', () => {
  expect(buildDayNarrative()).toBe('');
  expect(buildDayNarrative({ timeline: [] })).toBe('');
  expect(buildDayNarrative({ timeline: [food] })).toBe('');
  expect(buildDayNarrative({ timeline: [activity] })).toBe('');
});

test('describes two selected stop types in their actual order', () => {
  expect(buildDayNarrative({ timeline: [food, activity] })).toBe(
    '2-stop plan: food, then activity.',
  );
});

test('uses the actual selected order rather than next-stage routing or preferences', () => {
  const narrative = buildDayNarrative({
    timeline: [activity, food],
    startWith: 'food_drinks',
    selectedCuisines: ['italian', 'indian'],
    selectedPriceRange: '$$',
    availableTime: 6,
  });

  expect(narrative).toBe('2-stop plan: activity, then food.');
  expect(narrative).not.toMatch(/Italian|Indian|available time|fit|budget/i);
});

test('uses a compact sequence for three or more stops', () => {
  expect(buildDayNarrative({ timeline: [activity, food, activity] })).toBe(
    '3-stop plan: activity, food, then activity.',
  );
});

test('supports locale-specific labels, separators, and punctuation', () => {
  expect(
    buildDayNarrative(
      { timeline: [food, activity] },
      {
        foodStop: '用餐',
        activityStop: '活动',
        template: '{count}站计划：{sequence}。',
        listTwoSeparator: '，然后',
      },
    ),
  ).toBe('2站计划：用餐，然后活动。');
});
