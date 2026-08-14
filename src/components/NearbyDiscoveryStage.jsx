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
  onChooseBoth,
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
          <div className="discovery-options discovery-options--nearby">
            <button type="button" onClick={onChooseFood} className="discovery-option discovery-option--food" aria-label={t('discovery.food')}>
              <span aria-hidden="true">{'\u{1F37D}\uFE0F'}</span>
              <strong>{t('discovery.food')}</strong>
              <small>{t('discovery.foodOptionHint')}</small>
            </button>
            <button type="button" onClick={onChooseActivities} className="discovery-option discovery-option--activities" aria-label={t('discovery.activities')}>
              <span aria-hidden="true">{'\u2728'}</span>
              <strong>{t('discovery.activities')}</strong>
              <small>{t('discovery.activitiesOptionHint')}</small>
            </button>
            <button type="button" onClick={onChooseBoth} className="discovery-option discovery-option--both" aria-label={t('discovery.both')}>
              <span aria-hidden="true">{'\u2726'}</span>
              <strong>{t('discovery.both')}</strong>
              <small>{t('discovery.bothOptionHint')}</small>
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
