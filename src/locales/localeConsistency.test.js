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

const LOCALES = { en, es, fr, zh, vi };
const LOCALE_CODES = Object.keys(LOCALES);

const REQUIRED_KEYS = [
  // Flow labels shown along the planning journey.
  'interests.startWithTitle',
  'interests.startWithHint',
  'interests.startWithActivities',
  'interests.startWithFoodDrinks',
  'interests.childrenLabel',
  'interests.childrenYes',
  'interests.childrenNo',
  'activities.continueLabel',
  'restaurants.continueToActivities',
  'restaurants.whyThisFits',
  'restaurants.ratingLabel',
  'restaurants.priceLabel',
  'restaurants.distanceLabel',
  'restaurants.timeLabel',
  'timeline.empty',
  'timeline.shareHint',
  'timeline.howToGetThere',
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
