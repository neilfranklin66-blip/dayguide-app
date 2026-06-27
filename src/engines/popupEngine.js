export const hasLongActivityRun = ({
  timeline = [],
  activityCategories = new Set(),
  thresholdHours = 2,
}) => {
  let consecutive = 0;

  for (const item of timeline) {
    if (activityCategories.has(item.category)) {
      consecutive += item.duration;

      if (consecutive >= thresholdHours) {
        return true;
      }
    } else {
      consecutive = 0;
    }
  }

  return false;
};

export const shouldSuggestActivityBreak = ({
  timeline = [],
  activityCategories = new Set(),
  minItems = 2,
}) =>
  timeline.length >= minItems &&
  !timeline.some(item => activityCategories.has(item.category));
