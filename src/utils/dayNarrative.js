/**
 * Builds the optional, factual itinerary summary shown above a multi-stop plan.
 * It deliberately reads only the entries that were actually selected; filters,
 * route-flow state, time budgets, and preference state are not itinerary facts.
 */

const DEFAULT_COPY = {
  foodStop: 'food',
  activityStop: 'activity',
  otherStop: 'stop',
  template: '{count}-stop plan: {sequence}.',
  listTwoSeparator: ', then ',
  listMiddleSeparator: ', ',
  listFinalSeparator: ', then ',
};

function applyTemplate(template, values) {
  if (typeof template !== 'string') return '';
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match,
  );
}

function joinInOrder(items, text) {
  if (items.length === 2) return `${items[0]}${text.listTwoSeparator}${items[1]}`;
  return (
    items.slice(0, -1).join(text.listMiddleSeparator) +
    text.listFinalSeparator +
    items[items.length - 1]
  );
}

function labelForEntry(entry, text) {
  if (entry?.selectionType === 'food') return text.foodStop;
  if (entry?.selectionType === 'activity') return text.activityStop;
  return text.otherStop;
}

/**
 * A one-place itinerary is self-explanatory on its card, so it receives no
 * narrative. Multi-stop wording is a compact sequence of the real card types.
 */
export function buildDayNarrative({ timeline } = {}, copy = {}) {
  if (!Array.isArray(timeline) || timeline.length < 2) return '';

  const text = { ...DEFAULT_COPY, ...copy };
  return applyTemplate(text.template, {
    count: timeline.length,
    sequence: joinInOrder(timeline.map(entry => labelForEntry(entry, text)), text),
  });
}

export default buildDayNarrative;
