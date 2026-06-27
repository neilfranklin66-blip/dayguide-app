import {
  hasLongActivityRun,
  shouldSuggestActivityBreak,
} from './popupEngine';

const activityCategories = new Set(['museums', 'parks']);

test('hasLongActivityRun returns true for consecutive activity duration meeting the threshold', () => {
  const timeline = [
    { category: 'museums', duration: 1 },
    { category: 'parks', duration: 1 },
  ];

  expect(hasLongActivityRun({
    timeline,
    activityCategories,
    thresholdHours: 2,
  })).toBe(true);
});

test('hasLongActivityRun resets consecutive duration after a non-activity item', () => {
  const timeline = [
    { category: 'museums', duration: 1.5 },
    { category: 'cafe', duration: 0.5 },
    { category: 'parks', duration: 0.75 },
  ];

  expect(hasLongActivityRun({
    timeline,
    activityCategories,
    thresholdHours: 2,
  })).toBe(false);
});

test('shouldSuggestActivityBreak returns true when a multi-item timeline has no activities', () => {
  const timeline = [
    { category: 'cafe', duration: 1 },
    { category: 'thai', duration: 1 },
  ];

  expect(shouldSuggestActivityBreak({
    timeline,
    activityCategories,
    minItems: 2,
  })).toBe(true);
});

test('shouldSuggestActivityBreak returns false for a single restaurant item', () => {
  const timeline = [
    { category: 'cafe', duration: 1 },
  ];

  expect(shouldSuggestActivityBreak({
    timeline,
    activityCategories,
    minItems: 2,
  })).toBe(false);
});

test('shouldSuggestActivityBreak returns false when the timeline includes an activity', () => {
  const timeline = [
    { category: 'cafe', duration: 1 },
    { category: 'museums', duration: 1 },
  ];

  expect(shouldSuggestActivityBreak({
    timeline,
    activityCategories,
    minItems: 2,
  })).toBe(false);
});
