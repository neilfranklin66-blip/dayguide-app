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

/**
 * Default English copy. A caller may override any of these via the optional
 * `copy` argument to buildDayNarrative. Sentence structure lives in
 * `templates`, which use single-brace placeholders like {time} — NOT
 * i18next-style {{time}}, so raw template strings survive a trip through
 * i18next untouched.
 */
const DEFAULT_COPY = {
  priceLabels: {
    $: 'budget-friendly',
    $$: 'moderate',
    $$$: 'higher-end',
  },
  foodFirst: 'begins with food before moving on to the rest of your day',
  activitiesFirst: 'starts with activities before any food stops',
  neutralOrder: 'moves through your picks one stop at a time',
  fitsTime: 'It should fit within your available time',
  tightTime: 'The schedule may feel tight for your available time, so treat the later stops as flexible',
  familyFriendlyPacing: 'family-friendly pacing',
  templates: {
    openerWithTime: 'Starting around {time}, this {stopLabel} plan {orderText}.',
    openerWithoutTime: 'This {stopLabel} plan {orderText}.',
    fitWithPreferences: '{fitText}, with {preferences} kept in mind.',
    fitOnly: '{fitText}.',
    preferencesOnly: 'It keeps {preferences} in mind along the way.',
    cuisinePreference: 'your {cuisines} preferences',
    budgetPreference: 'a {budgetLabel} budget',
  },
  stopLabelOne: '1-stop',
  stopLabelOther: '{count}-stop',
  listTwoSeparator: ' and ',
  listMiddleSeparator: ', ',
  listFinalSeparator: ', and ',
  /** Optional map of cuisine id -> display label, e.g. { italian: 'Italiano' }. */
  cuisineLabels: {},
};

const MAX_CUISINES_MENTIONED = 2;

/**
 * Replace known single-brace placeholders like {time} with values.
 * Unknown placeholders are left intact so template mistakes stay visible.
 */
function applyTemplate(template, values) {
  if (typeof template !== 'string') return '';
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match,
  );
}

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

/**
 * Join items using the copy-configurable separators, so lists read naturally
 * in every locale. Defaults: ['a','b'] -> 'a and b'; ['a','b','c'] ->
 * 'a, b, and c'.
 */
function joinList(items, text) {
  if (items.length <= 1) return items[0] || '';
  if (items.length === 2) return `${items[0]}${text.listTwoSeparator}${items[1]}`;
  return (
    items.slice(0, -1).join(text.listMiddleSeparator) +
    text.listFinalSeparator +
    items[items.length - 1]
  );
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
 * @param {object} [copy] - optional copy overrides, shallow-merged over
 *   DEFAULT_COPY (priceLabels, templates, and cuisineLabels merged one level
 *   deeper). Omitting it keeps the existing English output unchanged.
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
} = {}, copy = {}) {
  if (!Array.isArray(timeline) || timeline.length === 0) return '';

  const text = {
    ...DEFAULT_COPY,
    ...copy,
    priceLabels: { ...DEFAULT_COPY.priceLabels, ...(copy.priceLabels || {}) },
    templates: { ...DEFAULT_COPY.templates, ...(copy.templates || {}) },
    cuisineLabels: { ...DEFAULT_COPY.cuisineLabels, ...(copy.cuisineLabels || {}) },
  };

  const stopLabel = timeline.length === 1
    ? text.stopLabelOne
    : applyTemplate(text.stopLabelOther, { count: timeline.length });
  const timeText = formatApproxTime(startTime);

  let orderText;
  if (startWith === 'food_drinks') {
    orderText = text.foodFirst;
  } else if (startWith === 'activities') {
    orderText = text.activitiesFirst;
  } else {
    orderText = text.neutralOrder;
  }

  const firstSentence = timeText
    ? applyTemplate(text.templates.openerWithTime, { time: timeText, stopLabel, orderText })
    : applyTemplate(text.templates.openerWithoutTime, { stopLabel, orderText });

  // Time fit: only when both numbers are known.
  let fitText = null;
  if (typeof totalDuration === 'number' && typeof availableTime === 'number') {
    fitText = totalDuration > availableTime ? text.tightTime : text.fitsTime;
  }

  // Preferences woven in without repeating every card.
  const preferences = [];
  const cuisineLabels = (Array.isArray(selectedCuisines) ? selectedCuisines : [])
    .slice(0, MAX_CUISINES_MENTIONED)
    .map(cuisineId => text.cuisineLabels[cuisineId] || formatCuisineLabel(cuisineId))
    .filter(Boolean);
  if (cuisineLabels.length > 0) {
    preferences.push(
      applyTemplate(text.templates.cuisinePreference, { cuisines: joinList(cuisineLabels, text) }),
    );
  }
  if (selectedPriceRange && text.priceLabels[selectedPriceRange]) {
    preferences.push(
      applyTemplate(text.templates.budgetPreference, { budgetLabel: text.priceLabels[selectedPriceRange] }),
    );
  }
  if (hasChildren === true) {
    preferences.push(text.familyFriendlyPacing);
  }

  let secondSentence = '';
  if (fitText && preferences.length > 0) {
    secondSentence = applyTemplate(text.templates.fitWithPreferences, {
      fitText,
      preferences: joinList(preferences, text),
    });
  } else if (fitText) {
    secondSentence = applyTemplate(text.templates.fitOnly, { fitText });
  } else if (preferences.length > 0) {
    secondSentence = applyTemplate(text.templates.preferencesOnly, {
      preferences: joinList(preferences, text),
    });
  }

  return secondSentence ? `${firstSentence} ${secondSentence}` : firstSentence;
}

export default buildDayNarrative;
