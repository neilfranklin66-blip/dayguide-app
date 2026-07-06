import React from 'react';
import ActivityInterestGrid from './ActivityInterestGrid';
import CuisineInterestGrid from './CuisineInterestGrid';
import PriceRangeSelector from './PriceRangeSelector';
import AvailableTimeSelector from './AvailableTimeSelector';
import DateSelector from './DateSelector';
import StartTimeSelector from './StartTimeSelector';
import ChildrenInPartySelector from './ChildrenInPartySelector';
import StartOrderSelector from './StartOrderSelector';
import InterestsNextButton from './InterestsNextButton';

function InterestsStage({
  interestCategories,
  selectedInterests,
  toggleInterest,
  cuisineCategories,
  selectedCuisines,
  toggleCuisine,
  selectedPriceRange,
  setSelectedPriceRange,
  availableTime,
  setAvailableTime,
  selectedDate,
  setSelectedDate,
  startTime,
  setStartTime,
  hasChildren,
  setHasChildren,
  startWith,
  setStartWith,
  goToNextSelectionStage,
  t,
}) {
  return (
    <div className="dayguide-container">
      <div className="card">
        <h2>{t('interests.title')}</h2>
        <p>{t('interests.subtitle')}</p>

        <ActivityInterestGrid
          interestCategories={interestCategories}
          selectedInterests={selectedInterests}
          onToggle={toggleInterest}
          t={t}
        />

        <CuisineInterestGrid
          cuisineCategories={cuisineCategories}
          selectedCuisines={selectedCuisines}
          onToggle={toggleCuisine}
          t={t}
        />

        <PriceRangeSelector
          selectedPriceRange={selectedPriceRange}
          onChange={setSelectedPriceRange}
          t={t}
        />

        <AvailableTimeSelector
          availableTime={availableTime}
          onChange={setAvailableTime}
          t={t}
        />
        <DateSelector
          selectedDate={selectedDate}
          onChange={setSelectedDate}
          t={t}
        />
        <StartTimeSelector
          startTime={startTime}
          onChange={setStartTime}
          t={t}
        />

        <ChildrenInPartySelector
          hasChildren={hasChildren}
          onChange={setHasChildren}
          t={t}
        />

        <StartOrderSelector
          startWith={startWith}
          onChange={setStartWith}
          t={t}
        />

        <InterestsNextButton
          onClick={goToNextSelectionStage}
          disabled={selectedInterests.length === 0 || hasChildren === null}
          t={t}
        />
      </div>
    </div>
  );
}

export default InterestsStage;
