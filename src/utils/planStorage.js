/**
 * planStorage
 * - Persists the finished timeline plan (and the settings needed to render it)
 *   to localStorage under a versioned key.
 * - Saved-plan v2 may include the minimum selected geographical-plan data.
 *   It never stores search queries, result lists, route evidence or transient
 *   UI state.
 * - Reads the legacy v1 key so an existing saved plan remains resumable.
 * - Storage failures (private mode, disabled storage, quota) degrade to
 *   null/no-op and never throw to the caller.
 * - A plan dated before the local calendar day it is loaded on is treated as
 *   expired: loadPlan discards it and clears storage rather than offering it
 *   for resume.
 */

import {
  restoreGeographicalPlanning,
  serializeGeographicalPlanning,
} from './geographicalPlanPersistence';

export const SAVED_PLAN_STORAGE_KEY = 'dayguide_saved_plan_v2';
export const LEGACY_SAVED_PLAN_STORAGE_KEY = 'dayguide_saved_plan_v1';

const STORAGE_VERSION = 2;
const LEGACY_STORAGE_VERSION = 1;

const SUPPORTED_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Local (not UTC) calendar date, matching the plain YYYY-MM-DD produced by
// <input type="date">, so lexicographic string comparison is safe and never
// shifts a day via UTC conversion.
const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// A date outside the supported YYYY-MM-DD shape is left for existing
// structural validation to handle, not speculatively treated as expired.
export function isPlanDateExpired(selectedDate, today = new Date()) {
  if (typeof selectedDate !== 'string' || !SUPPORTED_DATE_PATTERN.test(selectedDate)) {
    return false;
  }
  return selectedDate < toLocalDateString(today);
}

export function savePlan(plan) {
  try {
    const geographicalPlanning = serializeGeographicalPlanning(
      plan.geographicalPlanning,
    );
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
          geographicalPlanning,
        },
      }),
    );
    localStorage.removeItem(LEGACY_SAVED_PLAN_STORAGE_KEY);
  } catch (_) {}
}

const parseStoredPlan = (raw, expectedVersion) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== expectedVersion) return null;

    const plan = parsed.plan;
    if (!plan || typeof plan !== 'object') return null;
    if (!Array.isArray(plan.timeline) || plan.timeline.length === 0) {
      return null;
    }
    if (
      typeof plan.startTime !== 'number' ||
      !Number.isFinite(plan.startTime)
    ) {
      return null;
    }
    return plan;
  } catch (_) {
    return null;
  }
};

const normalizeV2Plan = plan => {
  if (!Object.prototype.hasOwnProperty.call(plan, 'geographicalPlanning')) {
    return null;
  }
  const geographicalPlanning = restoreGeographicalPlanning(
    plan.geographicalPlanning,
  );
  if (plan.geographicalPlanning != null && geographicalPlanning == null) {
    return null;
  }
  return {
    ...plan,
    geographicalPlanning,
  };
};

export function loadPlan(today = new Date()) {
  try {
    const current = parseStoredPlan(
      localStorage.getItem(SAVED_PLAN_STORAGE_KEY),
      STORAGE_VERSION,
    );
    const legacy =
      current == null
        ? parseStoredPlan(
            localStorage.getItem(LEGACY_SAVED_PLAN_STORAGE_KEY),
            LEGACY_STORAGE_VERSION,
          )
        : null;
    const plan = current ? normalizeV2Plan(current) : legacy;
    if (!plan) return null;

    if (isPlanDateExpired(plan.selectedDate, today)) {
      clearPlan();
      return null;
    }

    if (legacy) {
      const migrated = {
        ...legacy,
        geographicalPlanning: null,
      };
      savePlan(migrated);
      return migrated;
    }

    return plan;
  } catch (_) {
    return null;
  }
}

export function clearPlan() {
  try {
    localStorage.removeItem(SAVED_PLAN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_SAVED_PLAN_STORAGE_KEY);
  } catch (_) {}
}
