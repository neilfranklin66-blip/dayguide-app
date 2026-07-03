/**
 * dayNarrative
 * - Builds a short assistant-style narrative (max 2 sentences) describing how
 *   the planned day fits together, from state already available on the
 *   timeline screen.
 * - Pure function: no i18n, no component state, no side effects.
 * - Deliberately avoids route-optimisation claims, distance totals, and exact
 *   transport times, because current distances are venue-to-user rather than
 *   leg-to-leg.
 */

const PRICE_LABELS = {
  $: 'budget-friendly',
  $$: 'moderate',
  $$$: 'higher-end',
};

const MAX_CUISINES_MENTIONED = 2;

/** 'middleEastern' -> 'Middle Eastern' */
function formatCuisineLabel(cuisineId) {
  if (typeof cuisineId !== 'string' || cuisineId.length === 0) return null;
  const spaced = cuisineId.replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** 9 -> '9:00', 9.5 -> '9:30'; null for anything unusable. */
function formatApproxTime(decimalHour) {
  if (typeof decimalHour !== 'number' || !Number.isFinite(decimalHour)) return null;
  if (decimalHour < 0 || decimalHour >= 24) return null;

  let hours = Math.floor(decimalHour);
  let minutes = Math.round((decimalHour % 1) * 60);
  if (minutes === 60) {
    hours += 1;
    minutes = 0;
  }
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}

/** ['a'] -> 'a'; ['a','b'] -> 'a and b'; ['a','b','c'] -> 'a, b, and c' */
function joinList(items) {
  if (items.length <= 1) return items[0] || '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * Build a concise day narrative for the timeline screen.
 *
 * @param {object} params
 * @param {Array} params.timeline - built timeline entries; empty/missing -> ''
 * @param {number} [params.startTime] - decimal start hour, e.g. 9.5
 * @param {number} [params.availableTime] - user's time budget in hours
 * @param {number} [params.totalDuration] - computed plan duration in hours
 * @param {boolean} [params.hasChildren]
 * @param {string[]} [params.selectedCuisines]
 * @param {string} [params.selectedPriceRange] - '$' | '$$' | '$$$'
 * @param {string} [params.startWith] - 'activities' | 'food_drinks'
 * @returns {string} at most two sentences, or '' when there is no plan
 */
export function buildDayNarrative({
  timeline,
  startTime,
  availableTime,
  totalDuration,
  hasChildren,
  selectedCuisines,
  selectedPriceRange,
  startWith,
} = {}) {
  if (!Array.isArray(timeline) || timeline.length === 0) return '';

  const stopLabel = timeline.length === 1 ? '1-stop' : `${timeline.length}-stop`;
  const timeText = formatApproxTime(startTime);
  const opener = timeText
    ? `Starting around ${timeText}, this ${stopLabel} plan`
    : `This ${stopLabel} plan`;

  let orderText;
  if (startWith === 'food_drinks') {
    orderText = 'begins with food before moving on to the rest of your day';
  } else if (startWith === 'activities') {
    orderText = 'starts with activities before any food stops';
  } else {
    orderText = 'moves through your picks one stop at a time';
  }

  const firstSentence = `${opener} ${orderText}.`;

  // Time fit: only when both numbers are known.
  let fitText = null;
  if (typeof totalDuration === 'number' && typeof availableTime === 'number') {
    fitText = totalDuration > availableTime
      ? 'The schedule may feel tight for your available time, so treat the later stops as flexible'
      : 'It should fit within your available time';
  }

  // Preferences woven in without repeating every card.
  const preferences = [];
  const cuisineLabels = (Array.isArray(selectedCuisines) ? selectedCuisines : [])
    .slice(0, MAX_CUISINES_MENTIONED)
    .map(formatCuisineLabel)
    .filter(Boolean);
  if (cuisineLabels.length > 0) {
    preferences.push(`your ${joinList(cuisineLabels)} preferences`);
  }
  if (selectedPriceRange && PRICE_LABELS[selectedPriceRange]) {
    preferences.push(`a ${PRICE_LABELS[selectedPriceRange]} budget`);
  }
  if (hasChildren === true) {
    preferences.push('family-friendly pacing');
  }

  let secondSentence = '';
  if (fitText && preferences.length > 0) {
    secondSentence = `${fitText}, with ${joinList(preferences)} kept in mind.`;
  } else if (fitText) {
    secondSentence = `${fitText}.`;
  } else if (preferences.length > 0) {
    secondSentence = `It keeps ${joinList(preferences)} in mind along the way.`;
  }

  return secondSentence ? `${firstSentence} ${secondSentence}` : firstSentence;
}

export default buildDayNarrative;
