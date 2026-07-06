/**
 * planStorage
 * - Persists the finished timeline plan (and the settings needed to render it)
 *   to localStorage under a single versioned key.
 * - Deliberately narrow: no queues, no PlaceCard vendor data, no geolocation,
 *   no transient UI state, no migrations. A future schema change should use a
 *   new key rather than migrating v1 payloads.
 * - Storage failures (private mode, disabled storage, quota) degrade to
 *   null/no-op and never throw to the caller.
 */

export const SAVED_PLAN_STORAGE_KEY = 'dayguide_saved_plan_v1';

const STORAGE_VERSION = 1;

export function savePlan(plan) {
  try {
    localStorage.setItem(
      SAVED_PLAN_STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        plan: {
          timeline: plan.timeline,
          startTime: plan.startTime,
          availableTime: plan.availableTime,
          hasChildren: plan.hasChildren,
          selectedCuisines: plan.selectedCuisines,
          selectedPriceRange: plan.selectedPriceRange,
          selectedDate: plan.selectedDate,
          startWith: plan.startWith,
        },
      }),
    );
  } catch (_) {}
}

export function loadPlan() {
  try {
    const raw = localStorage.getItem(SAVED_PLAN_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION) return null;

    const plan = parsed.plan;
    if (!plan || typeof plan !== 'object') return null;
    if (!Array.isArray(plan.timeline) || plan.timeline.length === 0) return null;
    if (typeof plan.startTime !== 'number' || !Number.isFinite(plan.startTime)) return null;

    return plan;
  } catch (_) {
    return null;
  }
}

export function clearPlan() {
  try {
    localStorage.removeItem(SAVED_PLAN_STORAGE_KEY);
  } catch (_) {}
}
