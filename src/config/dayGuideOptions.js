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

export const TRANSPORT_OPTIONS = [
  { mode: 'walk', time: 15, cost: '£0', emoji: '🚶' },
  { mode: 'taxi', time: 8, cost: '£7', emoji: '🚕' },
  { mode: 'tube', time: 5, cost: '£2.80', emoji: '🚇' },
  { mode: 'bus', time: 12, cost: '£1.75', emoji: '🚌' },
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
