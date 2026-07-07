import {
  buildTimelineEntries,
  buildTimelineShareText,
  calculateTimelineDuration,
  formatDurationLabel,
  formatTimelineTime,
  getTimeBudgetStatus,
  getTimelineCategoryLabel,
  recalculateTimelineTimes,
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

test('formatDurationLabel formats whole hours', () => {
  expect(formatDurationLabel(4)).toBe('4h');
});

test('formatDurationLabel formats hours with minutes', () => {
  expect(formatDurationLabel(4.25)).toBe('4h 15m');
});

test('formatDurationLabel formats sub-hour durations as minutes only', () => {
  expect(formatDurationLabel(0.5)).toBe('30m');
});

test('getTimeBudgetStatus returns null for an empty timeline', () => {
  expect(getTimeBudgetStatus([], 4)).toBeNull();
});

test('getTimeBudgetStatus returns null without a positive available time', () => {
  expect(getTimeBudgetStatus([{ duration: 2 }], 0)).toBeNull();
  expect(getTimeBudgetStatus([{ duration: 2 }], undefined)).toBeNull();
});

test('getTimeBudgetStatus reports an over-budget plan with the overage', () => {
  const timeline = [
    { duration: 2 },
    { duration: 2 },
    { duration: 1 },
  ];

  expect(getTimeBudgetStatus(timeline, 4)).toEqual({
    plannedHours: 5.5,
    availableHours: 4,
    differenceHours: 1.5,
    isOverBudget: true,
    isExactFit: false,
  });
});

test('getTimeBudgetStatus reports a within-budget plan with the remaining time', () => {
  const timeline = [
    { duration: 1 },
    { duration: 2 },
  ];

  expect(getTimeBudgetStatus(timeline, 6)).toEqual({
    plannedHours: 3.25,
    availableHours: 6,
    differenceHours: 2.75,
    isOverBudget: false,
    isExactFit: false,
  });
});

test('getTimeBudgetStatus reports an exact fit', () => {
  const timeline = [
    { duration: 2 },
    { duration: 1.75 },
  ];

  expect(getTimeBudgetStatus(timeline, 4)).toEqual({
    plannedHours: 4,
    availableHours: 4,
    differenceHours: 0,
    isOverBudget: false,
    isExactFit: true,
  });
});

test('getTimeBudgetStatus supports a custom gap duration', () => {
  const timeline = [
    { duration: 1 },
    { duration: 1 },
  ];

  const status = getTimeBudgetStatus(timeline, 2, 0.5);

  expect(status.plannedHours).toBe(2.5);
  expect(status.isOverBudget).toBe(true);
  expect(status.differenceHours).toBe(0.5);
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

test('buildTimelineEntries combines activities before restaurants without rendering restaurant image URLs as icons', () => {
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
        type: 'food_drink',
        category: 'Food and Drinks',
        cuisine: ['cafe'],
        image: 'https://placehold.co/400x300/cafe',
        address: '2 Cafe Street',
        rating: 4.4,
      },
    ],
  });

  expect(entries.map(entry => entry.activity)).toEqual(['Museum', 'Cafe']);
  expect(entries[1].icon).toBe('food-icon');
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
        type: 'food_drink',
        category: 'Food and Drinks',
        cuisine: ['cafe'],
        image: 'https://placehold.co/400x300/cafe',
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
      category: 'Food and Drinks',
      icon: 'food-icon',
      address: '2 Cafe Street',
      rating: 4.4,
    },
  ]);
});

test('buildTimelineEntries preserves the restaurant mapsUrl on its timeline entry', () => {
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
        type: 'food_drink',
        category: 'Food and Drinks',
        cuisine: ['cafe'],
        image: 'https://placehold.co/400x300/cafe',
        address: '2 Cafe Street',
        rating: 4.4,
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cafe&query_place_id=abc123',
      },
    ],
  });

  // The live restaurant keeps its deep link; the sample-less activity has none.
  expect(entries[0].mapsUrl).toBeUndefined();
  expect(entries[1].mapsUrl).toBe(
    'https://www.google.com/maps/search/?api=1&query=Cafe&query_place_id=abc123',
  );
});

test('buildTimelineEntries omits mapsUrl for items that do not supply one', () => {
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
        isSample: true,
      },
    ],
  });

  expect(entries[0]).not.toHaveProperty('mapsUrl');
});

test('buildTimelineEntries supports food and drinks first ordering', () => {
  const entries = buildTimelineEntries({
    startTime: 9,
    getCuisineEmoji: () => 'food-icon',
    startWith: 'food_drinks',
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
        type: 'food_drink',
        category: 'Food and Drinks',
        cuisine: ['cafe'],
        image: 'https://placehold.co/400x300/cafe',
        address: '2 Cafe Street',
        rating: 4.4,
      },
    ],
  });

  expect(entries.map(entry => entry.activity)).toEqual(['Cafe', 'Museum']);
  expect(entries[0].time).toBe('9:00');
  expect(entries[1].time).toBe('9:45');
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

test('updateTimelineItemDuration recomputes later times when increasing the first item duration', () => {
  const timeline = [
    { id: '0-museum-1', time: '9:00', activity: 'Museum', duration: 1, distance: 0.4, category: 'museums' },
    { id: '1-cafe-1', time: '10:15', activity: 'Cafe', duration: 0.5, distance: 0.2, category: 'Food and Drinks' },
    { id: '2-park-1', time: '11:00', activity: 'Park', duration: 1, distance: 0.6, category: 'parks' },
  ];

  const updated = updateTimelineItemDuration(timeline, 0, 3, 9);

  expect(updated[0].duration).toBe(3);
  expect(updated.map(item => item.time)).toEqual(['9:00', '12:15', '13:00']);
});

test('updateTimelineItemDuration recomputes later times when decreasing a middle item duration', () => {
  const timeline = [
    { id: '0-museum-1', time: '9:00', activity: 'Museum', duration: 1, distance: 0.4, category: 'museums' },
    { id: '1-cafe-1', time: '10:15', activity: 'Cafe', duration: 2, distance: 0.2, category: 'Food and Drinks' },
    { id: '2-park-1', time: '12:30', activity: 'Park', duration: 1, distance: 0.6, category: 'parks' },
  ];

  const updated = updateTimelineItemDuration(timeline, 1, 0.5, 9);

  expect(updated[1].duration).toBe(0.5);
  expect(updated.map(item => item.time)).toEqual(['9:00', '10:15', '11:00']);
  expect(updated[0].time).toBe(timeline[0].time);
});

test('updateTimelineItemDuration preserves item order, ids, and other fields when recomputing times', () => {
  const timeline = [
    { id: '0-museum-1', time: '9:00', activity: 'Museum', duration: 1, distance: 0.4, category: 'museums', icon: 'museum-icon', address: '1 Museum Street', rating: 4.7 },
    { id: '1-cafe-1', time: '10:15', activity: 'Cafe', duration: 0.5, distance: 0.2, category: 'Food and Drinks', icon: 'food-icon', address: '2 Cafe Street', rating: 4.4 },
  ];

  const updated = updateTimelineItemDuration(timeline, 0, 2, 9);

  expect(updated.map(item => item.id)).toEqual(['0-museum-1', '1-cafe-1']);
  expect(updated[1]).toEqual({ ...timeline[1], time: '11:15' });
  expect(timeline[0].duration).toBe(1);
  expect(timeline[1].time).toBe('10:15');
});

test('updateTimelineItemDuration recomputes a single-item timeline from the start time', () => {
  const timeline = [
    { id: '0-museum-1', time: '9:00', activity: 'Museum', duration: 1, category: 'museums' },
  ];

  const updated = updateTimelineItemDuration(timeline, 0, 2.5, 9);

  expect(updated).toEqual([
    { id: '0-museum-1', time: '9:00', activity: 'Museum', duration: 2.5, category: 'museums' },
  ]);
});

test('recalculateTimelineTimes matches buildTimelineEntries gap behaviour after a duration change', () => {
  const activities = [
    { id: 'museum-1', name: 'Museum', duration: 1, distance: 0.4, category: 'museums', image: 'museum-icon', address: '1 Museum Street', rating: 4.7 },
    { id: 'park-1', name: 'Park', duration: 0.5, distance: 0.6, category: 'parks', image: 'park-icon', address: '3 Park Street', rating: 4.5 },
  ];

  const original = buildTimelineEntries({
    startTime: 9,
    getCuisineEmoji: () => 'food-icon',
    activities,
  });

  const updated = updateTimelineItemDuration(original, 0, 3, 9);

  const rebuilt = buildTimelineEntries({
    startTime: 9,
    getCuisineEmoji: () => 'food-icon',
    activities: [{ ...activities[0], duration: 3 }, activities[1]],
  });

  expect(updated).toEqual(rebuilt);
});

test('recalculateTimelineTimes supports a custom gap duration', () => {
  const timeline = [
    { id: 'first', duration: 1 },
    { id: 'second', duration: 1 },
  ];

  const recalculated = recalculateTimelineTimes(timeline, 9, 0.5);

  expect(recalculated.map(item => item.time)).toEqual(['9:00', '10:30']);
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

test('buildTimelineShareText includes the selected date when provided', () => {
  const t = (key, fallback) => ({
    'timeline.title': 'Your Plan',
    'interests.museums': 'Museums',
  }[key] ?? fallback ?? key);

  const text = buildTimelineShareText({
    activityCategories: new Set(['museums']),
    t,
    selectedDate: '2026-07-05',
    timeline: [
      {
        time: '9:00',
        icon: 'museum-icon',
        category: 'museums',
        activity: 'Museum Visit',
        duration: 1,
      },
    ],
  });

  expect(text).toBe([
    'DayGuide — Your Plan',
    '\u{1F4C5} 2026-07-05',
    '',
    '9:00  museum-icon Museums: Museum Visit (1h)',
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
