export const CUISINE_EMOJI = {
  italian: '🍝', indian: '🍛', british: '🍖', japanese: '🍣',
  mexican: '🌮', mediterranean: '🥗', spanish: '🥘', french: '🥐',
  chinese: '🥢', asian: '🍜', american: '🍔', middleEastern: '🧆',
  cafe: '☕',
};

export const getCuisineEmoji = (cuisines) => {
  const arr = Array.isArray(cuisines) ? cuisines : [cuisines];
  for (const c of arr) {
    if (CUISINE_EMOJI[c]) return CUISINE_EMOJI[c];
  }
  return '🍽️';
};

export const ACTIVITY_CATEGORIES = new Set([
  'museums', 'galleries', 'parks', 'shopping', 'theater', 'liveMusic',
  'sportsEvents', 'nightlife', 'historicalSites', 'foodMarkets', 'cinema', 'comedy',
]);

// Excluded from the implicit all-categories activity pool when children are in
// the party. An explicitly selected interest is still respected.
export const ADULT_ONLY_CATEGORIES = ['nightlife'];

export const SOURCE_BANNER_KEY = {
  live: 'liveResults',
  no_key: 'noKeyWarning',
  quota: 'quotaWarning',
  no_location: 'noLocationWarning',
  no_results: 'noResultsWarning',
  error: 'errorWarning',
};

// Who can act on a failed live restaurant search. The unavailable card uses
// this to pick an icon and to decide whether offering a retry is honest:
//   user     — the user can fix it (grant location permission, move, retry)
//   app      — DayGuide is misconfigured or built a bad request; retrying the
//              same search cannot help, so no retry is offered
//   external — the network or Google Places failed; a retry may well succeed
export const UNAVAILABLE_CATEGORY = {
  USER: 'user',
  APP: 'app',
  EXTERNAL: 'external',
};

// Every way the live restaurant search can fail to produce results, and how the
// UI should explain it. `messageKey`/`hintKey` resolve under the `restaurants.`
// locale namespace. `canRetry` gates the "Try again" button: it is false where
// re-running the identical search is guaranteed to fail again.
//
// Deliberately excluded: `no_results` (the search ran and found nothing — that
// is the filter-tweaking card, not this one) and `live` (success).
export const RESTAURANT_UNAVAILABLE_REASONS = {
  location_denied: {
    category: UNAVAILABLE_CATEGORY.USER,
    messageKey: 'locationDeniedWarning',
    hintKey: 'locationDeniedHint',
    icon: '📍',
    canRetry: true,
  },
  no_location: {
    category: UNAVAILABLE_CATEGORY.USER,
    messageKey: 'noLocationWarning',
    hintKey: 'noLocationHint',
    icon: '📍',
    canRetry: true,
  },
  bad_request: {
    category: UNAVAILABLE_CATEGORY.APP,
    messageKey: 'badRequestWarning',
    hintKey: 'badRequestHint',
    icon: '🛠️',
    canRetry: false,
  },
  no_key: {
    category: UNAVAILABLE_CATEGORY.APP,
    messageKey: 'noKeyWarning',
    hintKey: 'noKeyHint',
    icon: '🛠️',
    canRetry: false,
  },
  quota: {
    category: UNAVAILABLE_CATEGORY.APP,
    messageKey: 'quotaWarning',
    hintKey: 'quotaHint',
    icon: '🛠️',
    canRetry: false,
  },
  network: {
    category: UNAVAILABLE_CATEGORY.EXTERNAL,
    messageKey: 'networkWarning',
    hintKey: 'networkHint',
    icon: '📡',
    canRetry: true,
  },
  error: {
    category: UNAVAILABLE_CATEGORY.EXTERNAL,
    messageKey: 'errorWarning',
    hintKey: 'errorHint',
    icon: '📡',
    canRetry: true,
  },
};

// The reason used when a source is missing or unrecognised: an unknown failure
// is an unknown failure, never a silent success and never mock data.
export const DEFAULT_UNAVAILABLE_SOURCE = 'error';

// Sources meaning the live restaurant search could not run or reach Google
// Places at all (as opposed to running and finding nothing). These get the
// "live results unavailable" card rather than the filter-tweaking card.
export const LIVE_SEARCH_FAILURE_SOURCES = new Set(
  Object.keys(RESTAURANT_UNAVAILABLE_REASONS),
);

// Costs are shown as a fare *type*, not a price. The app does not know the
// user's city, currency, or the actual route, so it must not quote specific
// London fares (e.g. "from £2.80") as if they applied everywhere. costKey maps
// to a locale-backed, currency-free label under transport.cost.
export const TRANSPORT_OPTIONS = [
  { mode: 'walk', time: 15, costKey: 'free', emoji: '🚶' },
  { mode: 'taxi', time: 8, costKey: 'taxi', emoji: '🚕' },
  { mode: 'tube', time: 5, costKey: 'transit', emoji: '🚇' },
  { mode: 'bus', time: 12, costKey: 'transit', emoji: '🚌' },
];

export const PRICE_OPTIONS = [
  { value: '$', labelKey: 'priceRange.budget' },
  { value: '$$', labelKey: 'priceRange.moderate' },
  { value: '$$$', labelKey: 'priceRange.expensive' },
];

// Translated labels are built in DayGuide.jsx via t(`interests.${id}`).
export const INTEREST_CATEGORY_OPTIONS = [
  { id: 'museums', icon: '🏛️' },
  { id: 'galleries', icon: '🎨' },
  { id: 'parks', icon: '🌳' },
  { id: 'shopping', icon: '🛍️' },
  { id: 'theater', icon: '🎭' },
  { id: 'liveMusic', icon: '🎵' },
  { id: 'sportsEvents', icon: '🏟️' },
  { id: 'nightlife', icon: '🍸' },
  { id: 'historicalSites', icon: '🏰' },
  { id: 'foodMarkets', icon: '🥕' },
  { id: 'cinema', icon: '🎬' },
  { id: 'comedy', icon: '😂' },
];
