import {
  buildRestaurantQueue,
  excludeAlreadySelected,
  filterRestaurants,
  findNearestRestaurant,
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

const activitiesWithNightlife = {
  ...activities,
  nightlife: [
    { id: 'bar-1', name: 'Cocktail Bar', category: 'nightlife' },
  ],
};

test('getActivitiesForInterests excludes nightlife from the implicit pool when children are in the party', () => {
  const result = getActivitiesForInterests({
    activityData: activitiesWithNightlife,
    interests: [],
    hasChildren: true,
    shuffle: false,
  });

  expect(result.map(a => a.id)).not.toContain('bar-1');
  expect(result.map(a => a.id)).toEqual(['museum-1', 'gallery-1', 'park-1']);
});

test('getActivitiesForInterests keeps nightlife in the implicit pool when hasChildren is false or null', () => {
  [false, null].forEach(hasChildren => {
    const result = getActivitiesForInterests({
      activityData: activitiesWithNightlife,
      interests: [],
      hasChildren,
      shuffle: false,
    });

    expect(result.map(a => a.id)).toContain('bar-1');
  });
});

test('getActivitiesForInterests respects explicitly selected nightlife even when children are in the party', () => {
  const result = getActivitiesForInterests({
    activityData: activitiesWithNightlife,
    interests: ['nightlife'],
    hasChildren: true,
    shuffle: false,
  });

  expect(result).toEqual(activitiesWithNightlife.nightlife);
});

test('getActivitiesForInterests fallback pool still excludes nightlife when children are in the party', () => {
  const result = getActivitiesForInterests({
    activityData: activitiesWithNightlife,
    interests: [],
    hasChildren: true,
    selectedActivities: [
      { id: 'museum-1', name: 'Museum' },
      { id: 'gallery-1', name: 'Gallery' },
      { id: 'park-1', name: 'Park' },
    ],
    shuffle: false,
  });

  expect(result.length).toBeGreaterThan(0);
  expect(result.map(a => a.id)).not.toContain('bar-1');
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

test('findNearestRestaurant returns the closest restaurant by distanceKm', () => {
  const result = findNearestRestaurant([
    { name: 'Far Place', distanceKm: 3.4 },
    { name: 'Near Place', distanceKm: 0.6 },
    { name: 'Mid Place', distanceKm: 1.9 },
  ]);

  expect(result).toEqual({ name: 'Near Place', distance: 0.6 });
});

test('findNearestRestaurant keeps the first item on tied distances', () => {
  const result = findNearestRestaurant([
    { name: 'First Tied', distanceKm: 1.2 },
    { name: 'Second Tied', distanceKm: 1.2 },
  ]);

  expect(result).toEqual({ name: 'First Tied', distance: 1.2 });
});

test('findNearestRestaurant falls back to the legacy distance field when distanceKm is absent', () => {
  const result = findNearestRestaurant([
    { name: 'Legacy Far', distance: 2.5 },
    { name: 'Legacy Near', distance: 0.9 },
  ]);

  expect(result).toEqual({ name: 'Legacy Near', distance: 0.9 });
});

test('findNearestRestaurant returns null for an empty array', () => {
  expect(findNearestRestaurant([])).toBeNull();
});

test('findNearestRestaurant returns null for non-array input', () => {
  expect(findNearestRestaurant(null)).toBeNull();
  expect(findNearestRestaurant(undefined)).toBeNull();
  expect(findNearestRestaurant('not an array')).toBeNull();
});

test('findNearestRestaurant returns null when no card has a usable numeric distance', () => {
  const result = findNearestRestaurant([
    { name: 'No Distance' },
    { name: 'String Distance', distanceKm: '1.2' },
    { name: 'NaN Distance', distance: NaN },
  ]);

  expect(result).toBeNull();
});
