import {
  CUISINE_EMOJI,
  getCuisineEmoji,
  ACTIVITY_CATEGORIES,
  SOURCE_BANNER_KEY,
  TRANSPORT_OPTIONS,
  PRICE_OPTIONS,
  INTEREST_CATEGORY_OPTIONS,
} from './dayGuideOptions';

test('CUISINE_EMOJI has at least one cuisine and includes cafe', () => {
  expect(Object.keys(CUISINE_EMOJI).length).toBeGreaterThan(0);
  expect(CUISINE_EMOJI).toHaveProperty('cafe');
});

test('getCuisineEmoji returns the matching emoji for a known cuisine', () => {
  expect(getCuisineEmoji('italian')).toBe(CUISINE_EMOJI.italian);
  expect(getCuisineEmoji(['unknown', 'cafe'])).toBe(CUISINE_EMOJI.cafe);
});

test('getCuisineEmoji falls back for unknown cuisines', () => {
  expect(getCuisineEmoji('notACuisine')).toBe('🍽️');
});

test('ACTIVITY_CATEGORIES includes museums and comedy', () => {
  expect(ACTIVITY_CATEGORIES.has('museums')).toBe(true);
  expect(ACTIVITY_CATEGORIES.has('comedy')).toBe(true);
});

test('SOURCE_BANNER_KEY maps live to liveResults', () => {
  expect(SOURCE_BANNER_KEY.live).toBe('liveResults');
});

test('TRANSPORT_OPTIONS is non-empty', () => {
  expect(TRANSPORT_OPTIONS.length).toBeGreaterThan(0);
});

test('PRICE_OPTIONS contains $, $$ and $$$', () => {
  const values = PRICE_OPTIONS.map(opt => opt.value);
  expect(values).toEqual(expect.arrayContaining(['$', '$$', '$$$']));
});

test('INTEREST_CATEGORY_OPTIONS has unique ids', () => {
  const ids = INTEREST_CATEGORY_OPTIONS.map(opt => opt.id);
  expect(new Set(ids).size).toBe(ids.length);
});
