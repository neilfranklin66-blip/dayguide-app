import {
  buildTimelineEntries,
  buildTimelineShareText,
  calculateTimelineDuration,
  formatTimelineTime,
  getTimelineCategoryLabel,
  updateTimelineItemDuration,
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

test('buildTimelineEntries combines activities before restaurants', () => {
  const entries = buildTimelineEntries({
    startTime: 9,
    getCuisineEmoji: () => 'food-icon',
    activities: [
      {
        id: 'museum-1',
        name: 'Museum',
        duration: 1,
        distance: 0.4,
        category: 'museums',
        image: 'museum-icon',
        address: '1 Museum Street',
        rating: 4.7,
      },
    ],
    restaurants: [
      {
        id: 'cafe-1',
        name: 'Cafe',
        duration: 0.5,
        distance: 0.2,
        cuisine: ['cafe'],
        address: '2 Cafe Street',
        rating: 4.4,
      },
    ],
  });

  expect(entries.map(entry => entry.activity)).toEqual(['Museum', 'Cafe']);
});

test('buildTimelineEntries creates timeline fields and times', () => {
  const entries = buildTimelineEntries({
    startTime: 9,
    getCuisineEmoji: () => 'food-icon',
    activities: [
      {
        id: 'museum-1',
        name: 'Museum',
        duration: 1,
        distance: 0.4,
        category: 'museums',
        image: 'museum-icon',
        address: '1 Museum Street',
        rating: 4.7,
      },
    ],
    restaurants: [
      {
        id: 'cafe-1',
        name: 'Cafe',
        duration: 0.5,
        distance: 0.2,
        cuisine: ['cafe'],
        address: '2 Cafe Street',
        rating: 4.4,
      },
    ],
  });

  expect(entries).toEqual([
    {
      id: '0-museum-1',
      time: '9:00',
      activity: 'Museum',
      duration: 1,
      distance: 0.4,
      category: 'museums',
      icon: 'museum-icon',
      address: '1 Museum Street',
      rating: 4.7,
    },
    {
      id: '1-cafe-1',
      time: '10:15',
      activity: 'Cafe',
      duration: 0.5,
      distance: 0.2,
      category: 'cafe',
      icon: 'food-icon',
      address: '2 Cafe Street',
      rating: 4.4,
    },
  ]);
});

test('updateTimelineItemDuration updates only the selected item duration', () => {
  const timeline = [
    { id: 'first', duration: 1, activity: 'Museum' },
    { id: 'second', duration: 2, activity: 'Cafe' },
  ];

  const updated = updateTimelineItemDuration(timeline, 1, 1.5);

  expect(updated).toEqual([
    { id: 'first', duration: 1, activity: 'Museum' },
    { id: 'second', duration: 1.5, activity: 'Cafe' },
  ]);
});

test('updateTimelineItemDuration does not mutate the original timeline', () => {
  const timeline = [
    { id: 'first', duration: 1, activity: 'Museum' },
    { id: 'second', duration: 2, activity: 'Cafe' },
  ];

  const updated = updateTimelineItemDuration(timeline, 1, 1.5);

  expect(timeline[1].duration).toBe(2);
  expect(updated).not.toBe(timeline);
  expect(updated[0]).toBe(timeline[0]);
  expect(updated[1]).not.toBe(timeline[1]);
});

test('buildTimelineShareText formats activity and cuisine timeline lines', () => {
  const t = (key, fallback) => ({
    'timeline.title': 'Your Plan',
    'interests.museums': 'Museums',
    'cuisine.cafe': 'Cafe',
  }[key] ?? fallback ?? key);

  const text = buildTimelineShareText({
    activityCategories: new Set(['museums']),
    t,
    timeline: [
      {
        time: '9:00',
        icon: 'museum-icon',
        category: 'museums',
        activity: 'Museum Visit',
        duration: 1,
      },
      {
        time: '10:15',
        icon: 'cafe-icon',
        category: 'cafe',
        activity: 'Coffee Stop',
        duration: 0.5,
      },
    ],
  });

  expect(text).toBe([
    'DayGuide \u2014 Your Plan',
    '',
    '9:00  museum-icon Museums: Museum Visit (1h)',
    '10:15  cafe-icon Cafe: Coffee Stop (0.5h)',
  ].join('\n'));
});

test('buildTimelineShareText falls back to the category for untranslated cuisine', () => {
  const t = (key, fallback) => fallback ?? key;

  const text = buildTimelineShareText({
    activityCategories: new Set(['museums']),
    t,
    timeline: [
      {
        time: '12:00',
        icon: 'food-icon',
        category: 'thai',
        activity: 'Lunch',
        duration: 1,
      },
    ],
  });

  expect(text).toBe([
    'DayGuide \u2014 timeline.title',
    '',
    '12:00  food-icon thai: Lunch (1h)',
  ].join('\n'));
});

test('getTimelineCategoryLabel returns an interest label for activity categories', () => {
  const t = (key, fallback) => ({
    'interests.museums': 'Museums',
  }[key] ?? fallback ?? key);

  expect(getTimelineCategoryLabel({
    category: 'museums',
    activityCategories: new Set(['museums']),
    t,
  })).toBe('Museums');
});

test('getTimelineCategoryLabel returns a cuisine label with category fallback', () => {
  const t = (key, fallback) => fallback ?? key;

  expect(getTimelineCategoryLabel({
    category: 'thai',
    activityCategories: new Set(['museums']),
    t,
  })).toBe('thai');
});
