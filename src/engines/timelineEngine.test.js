import {
  buildTimelineEntries,
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
