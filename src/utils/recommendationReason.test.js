import { buildRecommendationReason } from './recommendationReason';

const baseCard = {
  id: '1',
  name: 'Test Bistro',
  cuisine: ['italian'],
  rating: 4.6,
  priceRange: '$$',
  walkingTimeMinutes: 10,
  distanceKm: 0.8,
  metadata: { isFamilyFriendly: null },
};

test('leads with cuisine match when card cuisine intersects selected cuisines', () => {
  const reason = buildRecommendationReason(baseCard, {
    selectedCuisines: ['italian', 'japanese'],
  });
  expect(reason).toMatch(/^Matches your Italian pick/);
});

test('formats multi-word cuisine ids for display', () => {
  const card = { ...baseCard, cuisine: ['middleEastern'] };
  const reason = buildRecommendationReason(card, {
    selectedCuisines: ['middleEastern'],
  });
  expect(reason).toContain('Middle Eastern');
});

test('includes budget fit when price range matches the user selection', () => {
  const reason = buildRecommendationReason(baseCard, {
    selectedCuisines: ['italian'],
    selectedPriceRange: '$$',
  });
  expect(reason).toBe('Matches your Italian pick - fits your $$ budget');
});

test('omits budget fragment when price range differs from selection', () => {
  const reason = buildRecommendationReason(baseCard, {
    selectedCuisines: [],
    selectedPriceRange: '$$$',
  });
  expect(reason).not.toContain('budget');
});

test('mentions children fit only when known family-friendly and children in party', () => {
  const familyCard = {
    ...baseCard,
    cuisine: [],
    rating: null,
    metadata: { isFamilyFriendly: true },
  };
  expect(buildRecommendationReason(familyCard, { hasChildren: true })).toMatch(/good with children/i);
  expect(buildRecommendationReason(familyCard, { hasChildren: false })).not.toContain('children');
  expect(buildRecommendationReason(baseCard, { hasChildren: true })).not.toContain('children');
});

test('falls back to rating and walking distance without personal matches', () => {
  const reason = buildRecommendationReason(baseCard, {
    selectedCuisines: [],
    selectedPriceRange: null,
  });
  expect(reason).toBe('Highly rated at 4.6 stars - just a 10-min walk away');
});

test('uses km distance when walk is too long but venue is nearby', () => {
  const card = { ...baseCard, cuisine: [], rating: null, walkingTimeMinutes: 25, distanceKm: 1.9 };
  const reason = buildRecommendationReason(card, {});
  expect(reason).toBe('Only 1.9 km from you');
});

test('caps the reason at two fragments', () => {
  const reason = buildRecommendationReason(baseCard, {
    selectedCuisines: ['italian'],
    selectedPriceRange: '$$',
    hasChildren: false,
  });
  expect(reason.split(' - ')).toHaveLength(2);
});

test('returns graceful fallback when no useful data is present', () => {
  const sparseCard = { id: '2', name: 'Mystery Place' };
  expect(buildRecommendationReason(sparseCard, {})).toBe('A well-regarded option near you');
  expect(buildRecommendationReason(null)).toBe('A well-regarded option near you');
  expect(buildRecommendationReason(baseCard)).toBeTruthy();
});
