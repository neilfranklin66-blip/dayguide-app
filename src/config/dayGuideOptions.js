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

// Sources meaning the live restaurant search could not run or reach Google
// Places at all (as opposed to running and finding nothing). These get the
// "live results unavailable" card rather than the filter-tweaking card.
export const LIVE_SEARCH_FAILURE_SOURCES = new Set([
  'no_key', 'quota', 'no_location', 'error',
]);

// Costs are indicative starting fares, not exact prices — the app does not
// know the user's city or the actual route, so avoid implying precision.
export const TRANSPORT_OPTIONS = [
  { mode: 'walk', time: 15, cost: 'Free', emoji: '🚶' },
  { mode: 'taxi', time: 8, cost: 'from £7', emoji: '🚕' },
  { mode: 'tube', time: 5, cost: 'from £2.80', emoji: '🚇' },
  { mode: 'bus', time: 12, cost: 'from £1.75', emoji: '🚌' },
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
