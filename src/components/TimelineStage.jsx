import React from 'react';
import TimelineCard from './TimelineCard';
import { buildDayNarrative } from '../utils/dayNarrative';
import { calculateTimelineDuration, getTimeBudgetStatus } from '../engines/timelineEngine';

export default function TimelineStage({
  timeline,
  startTime,
  availableTime,
  hasChildren,
  selectedCuisines,
  selectedPriceRange,
  selectedDate,
  startWith,
  updateActivityDuration,
  resetState,
  setShowQR,
  t,
}) {
  const totalDuration = calculateTimelineDuration(timeline);
  const timeBudget = getTimeBudgetStatus(timeline, availableTime);
  const narrativeCopy = {
      foodFirst: t('timeline.dayNarrative.foodFirst', 'begins with food before moving on to the rest of your day'),
    activitiesFirst: t('timeline.dayNarrative.activitiesFirst', 'starts with activities before any food stops'),
    neutralOrder: t('timeline.dayNarrative.neutralOrder', 'moves through your picks one stop at a time'),
    fitsTime: t('timeline.dayNarrative.fitsTime', 'It should fit within your available time'),
    tightTime: t('timeline.dayNarrative.tightTime', 'The schedule may feel tight for your available time, so treat the later stops as flexible'),
    familyFriendlyPacing: t('timeline.dayNarrative.familyFriendlyPacing', 'family-friendly pacing'),
    priceLabels: {
      $: t('timeline.dayNarrative.priceLabels.budget', 'budget-friendly'),
      $$: t('timeline.dayNarrative.priceLabels.moderate', 'moderate'),
      $$$: t('timeline.dayNarrative.priceLabels.higherEnd', 'higher-end'),
    },
    templates: {
      openerWithTime: t('timeline.dayNarrative.templates.openerWithTime', 'Starting around {time}, this {stopLabel} plan {orderText}.'),
      openerWithoutTime: t('timeline.dayNarrative.templates.openerWithoutTime', 'This {stopLabel} plan {orderText}.'),
      fitWithPreferences: t('timeline.dayNarrative.templates.fitWithPreferences', '{fitText}, with {preferences} kept in mind.'),
      fitOnly: t('timeline.dayNarrative.templates.fitOnly', '{fitText}.'),
      preferencesOnly: t('timeline.dayNarrative.templates.preferencesOnly', 'It keeps {preferences} in mind along the way.'),
      cuisinePreference: t('timeline.dayNarrative.templates.cuisinePreference', 'your {cuisines} preferences'),
      budgetPreference: t('timeline.dayNarrative.templates.budgetPreference', 'a {budgetLabel} budget'),
    },
    stopLabelOne: t('timeline.dayNarrative.stopLabelOne', '1-stop'),
    stopLabelOther: t('timeline.dayNarrative.stopLabelOther', '{count}-stop'),
    listTwoSeparator: t('timeline.dayNarrative.listTwoSeparator', ' and '),
    listMiddleSeparator: t('timeline.dayNarrative.listMiddleSeparator', ', '),
    listFinalSeparator: t('timeline.dayNarrative.listFinalSeparator', ', and '),
    cuisineLabels: {
      italian: t('cuisine.italian', 'Italian'),
      indian: t('cuisine.indian', 'Indian'),
      british: t('cuisine.british', 'British'),
      japanese: t('cuisine.japanese', 'Japanese'),
      mexican: t('cuisine.mexican', 'Mexican'),
      mediterranean: t('cuisine.mediterranean', 'Mediterranean'),
      spanish: t('cuisine.spanish', 'Spanish'),
      french: t('cuisine.french', 'French'),
      chinese: t('cuisine.chinese', 'Chinese'),
      asian: t('cuisine.asian', 'Asian'),
      american: t('cuisine.american', 'American'),
      middleEastern: t('cuisine.middleEastern', 'Middle Eastern'),
      cafe: t('cuisine.cafe', 'Cafe'),
    },
  };
  const dayNarrative = buildDayNarrative(
    {
      timeline,
      startTime,
      availableTime,
      totalDuration,
      hasChildren,
      selectedCuisines,
      selectedPriceRange,
      startWith,
    },
    narrativeCopy,
  );

  return (
    <TimelineCard
      timeBudget={timeBudget}
      dayNarrative={dayNarrative}
      hasTimelineItems={timeline.length > 0}
      selectedDate={selectedDate}
      timeline={timeline}
      onDurationChange={updateActivityDuration}
      onStartOver={resetState}
      onShare={() => setShowQR(true)}
      t={t}
    />
  );
}

