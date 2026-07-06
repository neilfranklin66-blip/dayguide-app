import { scoreRecommendation, rankRecommendations } from './recommendationScore';

const baseCard = {
  id: '1',
  name: 'Test Bistro',
  cuisine: ['italian'],
  rating: 3.5,
  priceRange: '$$',
  walkingTimeMinutes: 25,
  distanceKm: 3.2,
  metadata: { isFamilyFriendly: null },
};

test('cuisine match scores higher than no cuisine match', () => {
  const context = { selectedCuisines: ['italian'] };
  const match = scoreRecommendation(baseCard, context);
  const noMatch = scoreRecommendation({ ...baseCard, cuisine: ['japanese'] }, context);
  expect(match).toBeGreaterThan(noMatch);
});

test('matching the selected budget improves the score', () => {
  const context = { selectedPriceRange: '$$' };
  const match = scoreRecommendation(baseCard, context);
  const noMatch = scoreRecommendation({ ...baseCard, priceRange: '$$$' }, context);
  expect(match).toBeGreaterThan(noMatch);
});

test('a strong rating improves the score, with a smaller boost for a good rating', () => {
  const modest = scoreRecommendation({ ...baseCard, rating: 3.5 }, {});
  const good = scoreRecommendation({ ...baseCard, rating: 4.2 }, {});
  const high = scoreRecommendation({ ...baseCard, rating: 4.8 }, {});
  expect(good).toBeGreaterThan(modest);
  expect(high).toBeGreaterThan(good);
});

test('a nearby venue scores higher than a far one', () => {
  const shortWalk = scoreRecommendation({ ...baseCard, walkingTimeMinutes: 10 }, {});
  const closeKm = scoreRecommendation({ ...baseCard, distanceKm: 1.5 }, {});
  const far = scoreRecommendation(baseCard, {});
  expect(shortWalk).toBeGreaterThan(far);
  expect(closeKm).toBeGreaterThan(far);
});

test('family-friendly venue improves the score only when children are in the party', () => {
  const familyCard = { ...baseCard, metadata: { isFamilyFriendly: true } };
  const withChildren = scoreRecommendation(familyCard, { hasChildren: true });
  const withoutChildren = scoreRecommendation(familyCard, { hasChildren: false });
  const unknownVenue = scoreRecommendation(baseCard, { hasChildren: true });
  expect(withChildren).toBeGreaterThan(withoutChildren);
  expect(unknownVenue).toBe(withoutChildren);
});

test('invalid cards score 0', () => {
  expect(scoreRecommendation(null)).toBe(0);
  expect(scoreRecommendation(undefined, {})).toBe(0);
  expect(scoreRecommendation('not a card', {})).toBe(0);
});

test('rankRecommendations orders best-fit cards first without mutating the input', () => {
  const context = { selectedCuisines: ['italian'], selectedPriceRange: '$$' };
  const weak = { ...baseCard, id: 'weak', cuisine: ['japanese'], priceRange: '$', rating: 3.0 };
  const strong = { ...baseCard, id: 'strong', rating: 4.8, walkingTimeMinutes: 5 };
  const middling = { ...baseCard, id: 'middling', priceRange: '$' };
  const input = [weak, middling, strong];

  const ranked = rankRecommendations(input, context);

  expect(ranked.map(c => c.id)).toEqual(['strong', 'middling', 'weak']);
  expect(input.map(c => c.id)).toEqual(['weak', 'middling', 'strong']);
});

test('rankRecommendations keeps incoming order for tied scores', () => {
  const a = { ...baseCard, id: 'a' };
  const b = { ...baseCard, id: 'b' };
  const ranked = rankRecommendations([a, b], {});
  expect(ranked.map(c => c.id)).toEqual(['a', 'b']);
});

test('rankRecommendations returns an empty array for non-array input', () => {
  expect(rankRecommendations(null)).toEqual([]);
  expect(rankRecommendations(undefined, {})).toEqual([]);
});
