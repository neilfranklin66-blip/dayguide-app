export const calculateTimelineDuration = (timeline, gapHours = 0.25) => {
  const itemDuration = timeline.reduce((sum, item) => sum + item.duration, 0);
  const gapDuration = Math.max(0, timeline.length - 1) * gapHours;

  return itemDuration + gapDuration;
};

export const formatTimelineTime = (decimalHour) =>
  `${Math.floor(decimalHour)}:${String(Math.round((decimalHour % 1) * 60)).padStart(2, '0')}`;
