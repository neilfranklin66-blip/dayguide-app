import {
  CUISINE_EMOJI,
  getCuisineEmoji,
  ACTIVITY_CATEGORIES,
  SOURCE_BANNER_KEY,
  TRANSPORT_OPTIONS,
  PRICE_OPTIONS,
  INTEREST_CATEGORY_OPTIONS,
  RESTAURANT_UNAVAILABLE_REASONS,
  LIVE_SEARCH_FAILURE_SOURCES,
  DEFAULT_UNAVAILABLE_SOURCE,
  UNAVAILABLE_CATEGORY,
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

// --- Restaurant-unavailable reason taxonomy ---

test('every unavailable reason is fully specified', () => {
  const categories = Object.values(UNAVAILABLE_CATEGORY);

  Object.entries(RESTAURANT_UNAVAILABLE_REASONS).forEach(([source, reason]) => {
    expect(categories).toContain(reason.category);
    expect(typeof reason.messageKey).toBe('string');
    expect(typeof reason.hintKey).toBe('string');
    expect(typeof reason.icon).toBe('string');
    expect(typeof reason.canRetry).toBe('boolean');
    expect(source).not.toBe('');
  });
});

test('the default unavailable source is itself a known reason', () => {
  expect(RESTAURANT_UNAVAILABLE_REASONS).toHaveProperty(DEFAULT_UNAVAILABLE_SOURCE);
});

// The stage routes on this set, so it must stay in step with the reason table.
test('LIVE_SEARCH_FAILURE_SOURCES is exactly the set of unavailable reasons', () => {
  expect([...LIVE_SEARCH_FAILURE_SOURCES].sort())
    .toEqual(Object.keys(RESTAURANT_UNAVAILABLE_REASONS).sort());
});

// no_results means "searched, found nothing" — the filter card handles it, and
// live is a success. Neither may be pulled into the unavailable card.
test.each(['no_results', 'live'])('%s is not an unavailable reason', (source) => {
  expect(RESTAURANT_UNAVAILABLE_REASONS).not.toHaveProperty(source);
  expect(LIVE_SEARCH_FAILURE_SOURCES.has(source)).toBe(false);
});

// Retrying a search that failed for a DayGuide-side reason fails identically.
test('no app-side reason offers a retry', () => {
  Object.values(RESTAURANT_UNAVAILABLE_REASONS)
    .filter(reason => reason.category === UNAVAILABLE_CATEGORY.APP)
    .forEach(reason => expect(reason.canRetry).toBe(false));
});

test('every external reason offers a retry', () => {
  Object.values(RESTAURANT_UNAVAILABLE_REASONS)
    .filter(reason => reason.category === UNAVAILABLE_CATEGORY.EXTERNAL)
    .forEach(reason => expect(reason.canRetry).toBe(true));
});

test('all three cause categories are represented', () => {
  const present = new Set(
    Object.values(RESTAURANT_UNAVAILABLE_REASONS).map(reason => reason.category),
  );

  expect([...present].sort()).toEqual(['app', 'external', 'user']);
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
