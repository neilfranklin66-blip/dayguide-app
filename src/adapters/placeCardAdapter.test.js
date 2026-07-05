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

test('every mock restaurant entry declares a boolean familyFriendly', () => {
  expect(mockRestaurantData.length).toBeGreaterThan(0);
  mockRestaurantData.forEach(entry => {
    expect(typeof entry.familyFriendly).toBe('boolean');
  });
});