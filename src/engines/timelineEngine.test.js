import {
  calculateTimelineDuration,
  formatTimelineTime,
} from './timelineEngine';

test('calculateTimelineDuration returns zero for an empty timeline', () => {
  expect(calculateTimelineDuration([])).toBe(0);
});

test('calculateTimelineDuration returns item duration for one item with no gap', () => {
  expect(calculateTimelineDuration([{ duration: 1.5 }])).toBe(1.5);
});

test('calculateTimelineDuration adds default quarter-hour gaps between items', () => {
  const timeline = [
    { duration: 1 },
    { duration: 2 },
    { duration: 0.5 },
  ];

  expect(calculateTimelineDuration(timeline)).toBe(4);
});

test('calculateTimelineDuration supports a custom gap duration', () => {
  const timeline = [
    { duration: 1 },
    { duration: 1 },
  ];

  expect(calculateTimelineDuration(timeline, 0.5)).toBe(2.5);
});

test('formatTimelineTime formats whole hours', () => {
  expect(formatTimelineTime(9)).toBe('9:00');
});

test('formatTimelineTime formats quarter hours', () => {
  expect(formatTimelineTime(9.25)).toBe('9:15');
});

test('formatTimelineTime formats half hours', () => {
  expect(formatTimelineTime(14.5)).toBe('14:30');
});
