import {
  buildRestaurantQueue,
  excludeAlreadySelected,
  filterRestaurants,
  getActivitiesForInterests,
} from './filterEngine';

const activities = {
  culture: [
    { id: 'museum-1', name: 'Museum', category: 'culture' },
    { id: 'gallery-1', name: 'Gallery', category: 'culture' },
  ],
  outdoors: [
    { id: 'park-1', name: 'Park', category: 'outdoors' },
    { id: 'museum-1', name: 'Museum Duplicate', category: 'outdoors' },
  ],
};

const restaurants = [
  {
    id: 'r1',
    name: 'Italian Near',
    cuisine: ['italian'],
    priceRange: '$$',
    distance: 1.2,
  },
  {
    id: 'r2',
    name: 'Cafe Near',
    cuisine: ['cafe'],
    priceRange: '$',
    distance: 0.8,
  },
  {
    id: 'r3',
    name: 'Italian Far',
    cuisine: ['italian'],
    priceRange: '$$',
    distance: 8,
  },
  {
    id: 'r4',
    name: 'Italian Expensive',
    cuisine: ['italian'],
    priceRange: '$$$',
    distance: 2,
  },
];

test('excludeAlreadySelected removes items with matching id or name', () => {
  const result = excludeAlreadySelected(
    [
      { id: '1', name: 'Keep Me' },
      { id: '2', name: 'Remove By Id' },
      { id: '3', name: 'Remove By Name' },
    ],
    [
      { id: '2', name: 'Different Name' },
      { id: 'x', name: 'Remove By Name' },
    ]
  );

  expect(result).toEqual([{ id: '1', name: 'Keep Me' }]);
});

test('getActivitiesForInterests filters by selected interests and excludes selected activities', () => {
  const result = getActivitiesForInterests({
    activityData: activities,
    interests: ['culture'],
    selectedActivities: [{ id: 'museum-1', name: 'Museum' }],
    shuffle: false,
  });

  expect(result).toEqual([
    { id: 'gallery-1', name: 'Gallery', category: 'culture' },
  ]);
});

test('getActivitiesForInterests falls back to all matching activities when all are already selected', () => {
  const result = getActivitiesForInterests({
    activityData: activities,
    interests: ['culture'],
    selectedActivities: [
      { id: 'museum-1', name: 'Museum' },
      { id: 'gallery-1', name: 'Gallery' },
    ],
    shuffle: false,
  });

  expect(result).toEqual(activities.culture);
});

test('filterRestaurants applies distance, cuisine, price, and selected filters', () => {
  const result = filterRestaurants({
    restaurants,
    cuisines: ['italian'],
    price: '$$',
    selectedRestaurants: [],
    maxDistanceKm: 5,
  });

  expect(result).toEqual([
    {
      id: 'r1',
      name: 'Italian Near',
      cuisine: ['italian'],
      priceRange: '$$',
      distance: 1.2,
    },
  ]);
});

test('buildRestaurantQueue limits restaurant results without shuffling in tests', () => {
  const result = buildRestaurantQueue({
    restaurants,
    cuisines: [],
    price: null,
    selectedRestaurants: [],
    maxDistanceKm: 5,
    limit: 2,
    shuffle: false,
  });

  expect(result).toEqual([restaurants[0], restaurants[1]]);
});