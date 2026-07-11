/**
 * Locale consistency guardrail.
 * - Imports the five real locale files explicitly.
 *   This avoids accidentally including stale conflict files if they reappear.
 * - REQUIRED_KEYS covers the day narrative subtree plus the important
 *   flow-label keys every locale must translate.
 * - Placeholder and brace checks stay scoped to timeline.dayNarrative;
 *   other sections legitimately use i18next {{...}} placeholders.
 */
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import zh from './zh.json';
import vi from './vi.json';
import { RESTAURANT_UNAVAILABLE_REASONS } from '../config/dayGuideOptions';

const LOCALES = { en, es, fr, zh, vi };
const LOCALE_CODES = Object.keys(LOCALES);

// Derived, not hand-listed: adding a new restaurant-unavailable reason without
// translating its message, hint and "What can I try?" guidance must fail this
// suite rather than ship a raw key like "restaurants.networkHint" to a
// non-English user.
const UNAVAILABLE_REASON_KEYS = Object.values(RESTAURANT_UNAVAILABLE_REASONS)
  .flatMap(({ messageKey, hintKey, guidanceKey }) => [
    `restaurants.${messageKey}`,
    `restaurants.${hintKey}`,
    `restaurants.${guidanceKey}`,
  ]);

const REQUIRED_KEYS = [
  // Header controls, the in-progress label, and the failure notice shown when
  // signing out breaks.
  'header.logout',
  'header.loggingOut',
  'header.logoutFailed',
  // Flow labels shown along the planning journey.
  'interests.startWithTitle',
  'interests.startWithHint',
  'interests.startWithActivities',
  'interests.startWithFoodDrinks',
  'interests.childrenLabel',
  'interests.childrenYes',
  'interests.childrenNo',
  'activities.continueLabel',
  // Honest sample-data copy shown on activity cards and timeline rows.
  'activities.sampleBadge',
  'activities.sampleNote',
  'timeline.sampleActivity',
  'restaurants.continueToActivities',
  'restaurants.whyThisFits',
  'restaurants.ratingLabel',
  'restaurants.priceLabel',
  'restaurants.distanceLabel',
  'restaurants.timeLabel',
  'restaurants.openInMaps',
  // Honest unavailable-state copy shown when the live search fails. The
  // per-reason message/hint pairs are appended from the reason table below.
  'restaurants.unavailableTitle',
  'restaurants.skipAndContinue',
  'restaurants.tryAgain',
  'restaurants.whatCanITryTitle',
  // The search ran and found matches, but all had already been shown/selected —
  // a distinct, honest message from "nothing found nearby".
  'restaurants.noUnseenResultsTitle',
  'restaurants.noUnseenResults',
  ...UNAVAILABLE_REASON_KEYS,
  'timeline.empty',
  'timeline.shareHint',
  'timeline.howToGetThere',
  // Currency-free transport fare labels (no city-specific prices).
  'transport.cost.free',
  'transport.cost.transit',
  'transport.cost.taxi',
  // Day narrative subtree.
  'timeline.dayGuideLabel',
  'timeline.dayNarrative.foodFirst',
  'timeline.dayNarrative.activitiesFirst',
  'timeline.dayNarrative.neutralOrder',
  'timeline.dayNarrative.fitsTime',
  'timeline.dayNarrative.tightTime',
  'timeline.dayNarrative.familyFriendlyPacing',
  'timeline.dayNarrative.priceLabels.budget',
  'timeline.dayNarrative.priceLabels.moderate',
  'timeline.dayNarrative.priceLabels.higherEnd',
  'timeline.dayNarrative.templates.openerWithTime',
  'timeline.dayNarrative.templates.openerWithoutTime',
  'timeline.dayNarrative.templates.fitWithPreferences',
  'timeline.dayNarrative.templates.fitOnly',
  'timeline.dayNarrative.templates.preferencesOnly',
  'timeline.dayNarrative.templates.cuisinePreference',
  'timeline.dayNarrative.templates.budgetPreference',
  'timeline.dayNarrative.stopLabelOne',
  'timeline.dayNarrative.stopLabelOther',
  'timeline.dayNarrative.listTwoSeparator',
  'timeline.dayNarrative.listMiddleSeparator',
  'timeline.dayNarrative.listFinalSeparator',
];

// Keys whose single-brace placeholders must match English exactly.
const PLACEHOLDER_KEYS = [
  'timeline.dayNarrative.templates.openerWithTime',
  'timeline.dayNarrative.templates.openerWithoutTime',
  'timeline.dayNarrative.templates.fitWithPreferences',
  'timeline.dayNarrative.templates.fitOnly',
  'timeline.dayNarrative.templates.preferencesOnly',
  'timeline.dayNarrative.templates.cuisinePreference',
  'timeline.dayNarrative.templates.budgetPreference',
  'timeline.dayNarrative.stopLabelOther',
];

function getPath(object, dotPath) {
  return dotPath
    .split('.')
    .reduce((value, key) => (value == null ? undefined : value[key]), object);
}

function extractPlaceholders(template) {
  const names = [];
  const pattern = /\{(\w+)\}/g;
  let match;
  while ((match = pattern.exec(template)) !== null) {
    names.push(match[1]);
  }
  return names.sort();
}

function collectStrings(node, path, out = []) {
  if (typeof node === 'string') {
    out.push({ path, value: node });
  } else if (node && typeof node === 'object') {
    Object.entries(node).forEach(([key, child]) => {
      collectStrings(child, `${path}.${key}`, out);
    });
  }
  return out;
}

describe.each(LOCALE_CODES)('locale %s', code => {
  const locale = LOCALES[code];

  test.each(REQUIRED_KEYS)('has a non-empty string at %s', key => {
    const value = getPath(locale, key);
    expect(typeof value).toBe('string');
    // Separators intentionally include spaces, so no trim() here.
    expect(value.length).toBeGreaterThan(0);
  });

  test.each(PLACEHOLDER_KEYS)('placeholders in %s match English', key => {
    expect(extractPlaceholders(getPath(locale, key))).toEqual(
      extractPlaceholders(getPath(en, key)),
    );
  });

  test('dayNarrative strings use single braces, never i18next {{...}}', () => {
    const strings = collectStrings(
      getPath(locale, 'timeline.dayNarrative'),
      'timeline.dayNarrative',
    );
    expect(strings.length).toBeGreaterThan(0);
    strings.forEach(({ path, value }) => {
      if (value.includes('{{')) {
        throw new Error(`${code}: ${path} contains an i18next-style "{{" placeholder: ${value}`);
      }
    });
  });

  test('removed key preferencesKeptInMind stays absent', () => {
    expect(getPath(locale, 'timeline.dayNarrative.preferencesKeptInMind')).toBeUndefined();
    expect(getPath(locale, 'timeline.dayNarrative.templates.preferencesKeptInMind')).toBeUndefined();
  });
});
