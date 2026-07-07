import {
  fromMockRestaurant,
  fromPlacesParsed,
  mapFromMockArray,
  mapFromPlacesArray,
} from '../adapters/placeCardAdapter';
import mockRestaurantData from '../mockRestaurantData.json';

const mockRestaurant = {
  id: 1,
  name: 'Test Bistro',
  cuisine: ['italian'],
  priceRange: '$$',
  rating: 4.2,
  duration: 1.5,
  distance: 1.2,
  address: '123 Test St',
  image: 'https://placehold.co/400x300/test',
};

const mockPlacesItem = {
  id: 'abc123',
  name: 'Live Cafe',
  cuisine: ['cafe'],
  priceRange: '$',
  rating: 4.0,
  duration: 1,
  distance: 0.8,
  address: '456 Live Rd',
  image: 'https://placehold.co/400x300/live',
};

test('mock restaurant adapter preserves compatibility aliases and canonical fields', () => {
  const [card] = mapFromMockArray([mockRestaurant]);
  expect(card).toMatchObject({
    id: '1',
    name: 'Test Bistro',
    type: 'food_drink',
    category: 'Food and Drinks',
    subCategory: 'Restaurant',
    cuisine: ['italian'],
    priceRange: '$$',
    source: 'mock_restaurant_data',
    photoUrl: mockRestaurant.image,
    address: mockRestaurant.address,
    durationMinutes: 90,
    distanceMeters: 1200,
    distanceKm: 1.2,
    distance: 1.2,
    distanceMiles: expect.any(Number),
    walkingTimeMinutes: expect.any(Number),
    vendorData: { raw: mockRestaurant },
    metadata: expect.any(Object),
  });
});

test('places adapter preserves compatibility aliases and canonical fields', () => {
  const [card] = mapFromPlacesArray([mockPlacesItem]);
  expect(card).toMatchObject({
    id: 'abc123',
    name: 'Live Cafe',
    type: 'food_drink',
    category: 'Food and Drinks',
    subCategory: 'Restaurant',
    cuisine: ['cafe'],
    priceRange: '$',
    source: 'google_places',
    photoUrl: mockPlacesItem.image,
    address: mockPlacesItem.address,
    durationMinutes: 60,
    distanceMeters: 800,
    distanceKm: 0.8,
    distance: 0.8,
    distanceMiles: expect.any(Number),
    walkingTimeMinutes: expect.any(Number),
    vendorData: { raw: mockPlacesItem },
    metadata: expect.any(Object),
  });
});

test('mock restaurant adapter maps familyFriendly true to metadata.isFamilyFriendly true', () => {
  const card = fromMockRestaurant({ ...mockRestaurant, familyFriendly: true });
  expect(card.metadata.isFamilyFriendly).toBe(true);
});

test('mock restaurant adapter maps familyFriendly false to metadata.isFamilyFriendly false', () => {
  const card = fromMockRestaurant({ ...mockRestaurant, familyFriendly: false });
  expect(card.metadata.isFamilyFriendly).toBe(false);
});

test('mock restaurant adapter maps missing or non-boolean familyFriendly to null', () => {
  expect(fromMockRestaurant(mockRestaurant).metadata.isFamilyFriendly).toBeNull();
  expect(fromMockRestaurant({ ...mockRestaurant, familyFriendly: 'yes' }).metadata.isFamilyFriendly).toBeNull();
  expect(fromMockRestaurant({ ...mockRestaurant, familyFriendly: 1 }).metadata.isFamilyFriendly).toBeNull();
});

test('places adapter keeps metadata.isFamilyFriendly null (live data carries no family signal)', () => {
  const card = fromPlacesParsed({ ...mockPlacesItem, familyFriendly: true });
  expect(card.metadata.isFamilyFriendly).toBeNull();
});

test('places adapter normalises a sparse parsed result (id and name only) without crashing', () => {
  const card = fromPlacesParsed({ id: 'sparse-1', name: 'Sparse Bistro' });

  expect(card).toMatchObject({
    id: 'sparse-1',
    name: 'Sparse Bistro',
    type: 'food_drink',
    category: 'Food and Drinks',
    subCategory: 'Restaurant',
    source: 'google_places',
    cuisine: [],
    rating: null,
    priceRange: null,
    distanceMeters: null,
    distanceKm: null,
    distanceMiles: null,
    distance: null,
    walkingTimeMinutes: null,
    durationMinutes: null,
    duration: null,
    address: null,
    photoUrl: null,
    image: null,
  });
  expect(card.mapsUrl).toContain(encodeURIComponent('Sparse Bistro'));
  expect(card.metadata.isOpenNow).toBeNull();
});

test('places adapter omits mapsUrl when both name and address are missing', () => {
  const card = fromPlacesParsed({ id: 'anon-1' });

  expect(card.name).toBeNull();
  expect(card.mapsUrl).toBeNull();
});

test('places adapter builds a precise maps URL with query_place_id from a parsed live id', () => {
  const card = fromPlacesParsed(mockPlacesItem);

  expect(card.mapsUrl).toContain('query_place_id=abc123');
  expect(card.mapsUrl).toContain(`query=${encodeURIComponent('Live Cafe')}`);
});

test('places adapter prefers an explicit place_id over id for query_place_id', () => {
  const card = fromPlacesParsed({ ...mockPlacesItem, place_id: 'manual-pid' });

  expect(card.mapsUrl).toContain('query_place_id=manual-pid');
});

test('places adapter falls back to a plain name search when no id of any kind is present', () => {
  const { id, ...noId } = mockPlacesItem;
  const card = fromPlacesParsed(noId);

  expect(card.mapsUrl).toContain(encodeURIComponent('Live Cafe'));
  expect(card.mapsUrl).not.toContain('query_place_id');
});

test('places adapter nulls out a non-numeric rating instead of passing it through', () => {
  const card = fromPlacesParsed({ ...mockPlacesItem, rating: 'not-a-number' });

  expect(card.rating).toBeNull();
});

test('places batch helper returns [] for non-array input', () => {
  expect(mapFromPlacesArray(null)).toEqual([]);
  expect(mapFromPlacesArray(undefined)).toEqual([]);
});

test('every mock restaurant entry declares a boolean familyFriendly', () => {
  expect(mockRestaurantData.length).toBeGreaterThan(0);
  mockRestaurantData.forEach(entry => {
    expect(typeof entry.familyFriendly).toBe('boolean');
  });
});