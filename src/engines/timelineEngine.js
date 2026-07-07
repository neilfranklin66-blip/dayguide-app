export const calculateTimelineDuration = (timeline, gapHours = 0.25) => {
  const itemDuration = timeline.reduce((sum, item) => sum + item.duration, 0);
  const gapDuration = Math.max(0, timeline.length - 1) * gapHours;

  return itemDuration + gapDuration;
};

export const formatDurationLabel = (hours) => {
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (wholeHours === 0) return `${minutes}m`;
  return minutes === 0 ? `${wholeHours}h` : `${wholeHours}h ${minutes}m`;
};

export const getTimeBudgetStatus = (timeline, availableTime, gapHours = 0.25) => {
  if (timeline.length === 0 || typeof availableTime !== 'number' || availableTime <= 0) {
    return null;
  }

  const plannedHours = calculateTimelineDuration(timeline, gapHours);
  // Compare in whole minutes so summed quarter-hour durations never produce
  // a false over-budget verdict from floating-point noise.
  const differenceMinutes = Math.round((plannedHours - availableTime) * 60);

  return {
    plannedHours,
    availableHours: availableTime,
    differenceHours: Math.abs(differenceMinutes) / 60,
    isOverBudget: differenceMinutes > 0,
    isExactFit: differenceMinutes === 0,
  };
};

export const formatTimelineTime = (decimalHour) =>
  `${Math.floor(decimalHour)}:${String(Math.round((decimalHour % 1) * 60)).padStart(2, '0')}`;

export const buildTimelineEntries = ({
  restaurants = [],
  activities = [],
  startTime,
  getCuisineEmoji,
  gapHours = 0.25,
  startWith = 'activities',
}) => {
  let currentTime = startTime;
  const allItems = startWith === 'food_drinks'
    ? [...restaurants, ...activities]
    : [...activities, ...restaurants];

  return allItems.map((item, index) => {
    const entry = {
      id: `${index}-${item.id}`,
      time: formatTimelineTime(currentTime),
      activity: item.name,
      duration: item.duration,
      distance: item.distance,
      category: item.category || (Array.isArray(item.cuisine) ? item.cuisine[0] : item.cuisine),
      icon: item.type === 'food_drink' || item.category === 'Food and Drinks'
        ? getCuisineEmoji(item.cuisine)
        : item.image,
      address: item.address,
      rating: item.rating,
      // Carry the Google Maps deep link through to the plan screen so the
      // timeline row can offer an Open in Maps action; only live items
      // (restaurants) supply one, sample activities never do.
      ...(item.mapsUrl ? { mapsUrl: item.mapsUrl } : {}),
      // Sample activities carry this flag so the timeline row can withhold the
      // fabricated nearby distance; live items (restaurants) never set it.
      ...(item.isSample ? { isSample: true } : {}),
    };

    currentTime += item.duration + gapHours;
    return entry;
  });
};

export const getTimelineCategoryLabel = ({
  category,
  t,
  activityCategories = new Set(),
}) =>
  activityCategories.has(category)
    ? t(`interests.${category}`)
    : t(`cuisine.${category}`, category);

export const buildTimelineShareText = ({
  timeline = [],
  t,
  activityCategories = new Set(),
  selectedDate,
}) => {
  const lines = [`DayGuide \u2014 ${t('timeline.title')}`];

  if (selectedDate) {
    lines.push(`\u{1F4C5} ${selectedDate}`);
  }

  lines.push('');

  timeline.forEach(item => {
    const catLabel = getTimelineCategoryLabel({
      category: item.category,
      t,
      activityCategories,
    });

    lines.push(`${item.time}  ${item.icon} ${catLabel}: ${item.activity} (${item.duration}h)`);
  });

  return lines.join('\n');
};

export const recalculateTimelineTimes = (timeline, startTime, gapHours = 0.25) => {
  let currentTime = startTime;

  return timeline.map(item => {
    const entry = { ...item, time: formatTimelineTime(currentTime) };
    currentTime += item.duration + gapHours;
    return entry;
  });
};

export const updateTimelineItemDuration = (timeline, index, newDuration, startTime, gapHours = 0.25) => {
  const updated = [...timeline];
  updated[index] = { ...updated[index], duration: newDuration };

  return startTime == null
    ? updated
    : recalculateTimelineTimes(updated, startTime, gapHours);
};
