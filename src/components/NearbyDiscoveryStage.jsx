import React from 'react';
import CuisineInterestGrid from './CuisineInterestGrid';
import ActivityInterestGrid from './ActivityInterestGrid';

export default function NearbyDiscoveryStage({
  mode,
  cuisineCategories,
  selectedCuisines,
  onToggleCuisine,
  interestCategories,
  selectedInterests,
  onToggleInterest,
  onChooseFood,
  onChooseActivities,
  onFindFood,
  onFindActivities,
  t,
}) {
  if (!mode) {
    return (
      <div className="dayguide-container">
        <div className="card discovery-card">
          <h2>{t('discovery.title')}</h2>
          <p>{t('discovery.subtitle')}</p>
          <div className="discovery-options">
            <button onClick={onChooseFood} className="discovery-option">
              <span aria-hidden="true">🍽️</span>
              {t('discovery.food')}
            </button>
            <button onClick={onChooseActivities} className="discovery-option">
              <span aria-hidden="true">✨</span>
              {t('discovery.activities')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isFood = mode === 'food';
  return (
    <div className="dayguide-container">
      <div className="card discovery-card">
        <h2>{isFood ? t('discovery.foodTitle') : t('discovery.activitiesTitle')}</h2>
        <p>{isFood ? t('discovery.foodHint') : t('discovery.activitiesHint')}</p>
        {isFood ? (
          <>
            <button className="btn-secondary discovery-all" onClick={() => onFindFood([])}>
              {t('discovery.allFood')}
            </button>
            <CuisineInterestGrid
              cuisineCategories={cuisineCategories}
              selectedCuisines={selectedCuisines}
              onToggle={onToggleCuisine}
              t={t}
            />
            <button className="btn-primary" onClick={() => onFindFood(selectedCuisines)}>
              {t('discovery.showFood')}
            </button>
          </>
        ) : (
          <>
            <button className="btn-secondary discovery-all" onClick={() => onFindActivities([])}>
              {t('discovery.allActivities')}
            </button>
            <ActivityInterestGrid
              interestCategories={interestCategories}
              selectedInterests={selectedInterests}
              onToggle={onToggleInterest}
              t={t}
            />
            <button className="btn-primary" onClick={() => onFindActivities(selectedInterests)}>
              {t('discovery.showActivities')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
