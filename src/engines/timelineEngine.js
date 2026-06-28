export const calculateTimelineDuration = (timeline, gapHours = 0.25) => {
  const itemDuration = timeline.reduce((sum, item) => sum + item.duration, 0);
  const gapDuration = Math.max(0, timeline.length - 1) * gapHours;

  return itemDuration + gapDuration;
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
}) => {
  const lines = [`DayGuide \u2014 ${t('timeline.title')}`, ''];

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

export const updateTimelineItemDuration = (timeline, index, newDuration) => {
  const updated = [...timeline];
  updated[index] = { ...updated[index], duration: newDuration };

  return updated;
};
