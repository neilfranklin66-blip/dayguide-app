export const summarizeSavedPlan = (plan) =>
  plan ? { selectedDate: plan.selectedDate, itemCount: plan.timeline.length } : null;

export const createPlanPayload = ({
  timeline,
  startTime,
  availableTime,
  hasChildren,
  selectedCuisines,
  selectedPriceRange,
  selectedDate,
  startWith,
}) => ({
  timeline,
  startTime,
  availableTime,
  hasChildren,
  selectedCuisines,
  selectedPriceRange,
  selectedDate,
  startWith,
});

export const getRestoredPlanState = (plan) =>
  plan
    ? {
        summary: summarizeSavedPlan(plan),
        timeline: plan.timeline,
        startTime: plan.startTime,
        availableTime: plan.availableTime,
        hasChildren: typeof plan.hasChildren === 'boolean' ? plan.hasChildren : null,
        selectedCuisines: Array.isArray(plan.selectedCuisines) ? plan.selectedCuisines : [],
        selectedPriceRange: plan.selectedPriceRange ?? null,
        selectedDate: plan.selectedDate,
        startWith: plan.startWith,
      }
    : null;
