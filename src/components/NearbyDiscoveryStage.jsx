import React from 'react';
import nearbyFoodImage from '../assets/nearby-food-restaurant.jpg';
import nearbyThingsImage from '../assets/nearby-things-tower-bridge.jpg';

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
      <main className="nearby-mood-page">
        <section className="nearby-mood-content" aria-labelledby="nearby-mood-title">
          <h2 id="nearby-mood-title">{t('discovery.title')}</h2>
          <div className="nearby-mood-cards">
            <button type="button" onClick={onChooseFood} className="nearby-mood-card">
              <img src={nearbyFoodImage} alt="" />
              <strong>{t('discovery.food')}</strong>
            </button>
            <button type="button" onClick={onChooseActivities} className="nearby-mood-card">
              <img src={nearbyThingsImage} alt="" />
              <strong>{t('discovery.activities')}</strong>
            </button>
          </div>
          <button type="button" onClick={onChooseBoth} className="nearby-mood-both">
            {t('discovery.both')}
          </button>
        </section>
      </main>
    );
  }

  const isFood = mode === 'food';
  if (isFood) {
    return (
      <main className="nearby-category-page">
        <section className="nearby-category-content" aria-labelledby="nearby-category-title">
          <h2 id="nearby-category-title">{t('discovery.foodTitle')}</h2>
          <div className="nearby-category-grid" aria-label={t('discovery.foodTitle')}>
            {cuisineCategories.map(cuisine => {
              const selected = selectedCuisines.includes(cuisine.id);
              return (
                <button
                  type="button"
                  key={cuisine.id}
                  aria-pressed={selected}
                  className={`nearby-category-tile${selected ? ' selected' : ''}`}
                  onClick={() => onToggleCuisine(cuisine.id)}
                >
                  {t(`cuisine.${cuisine.id}`)}
                </button>
              );
            })}
          </div>
          <button type="button" className="nearby-category-cta" onClick={() => onFindFood(selectedCuisines)}>
            {t('discovery.showFood')}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="nearby-category-page">
      <section className="nearby-category-content" aria-labelledby="nearby-category-title">
        <h2 id="nearby-category-title">{t('discovery.activitiesTitle')}</h2>
        <div className="nearby-category-grid" aria-label={t('discovery.activitiesTitle')}>
          {interestCategories.map(interest => {
            const selected = selectedInterests.includes(interest.id);
            return (
              <button
                type="button"
                key={interest.id}
                aria-pressed={selected}
                className={`nearby-category-tile${selected ? ' selected' : ''}`}
                onClick={() => onToggleInterest(interest.id)}
              >
                {interest.label || t(`interests.${interest.id}`)}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="nearby-category-cta"
          onClick={() => onFindActivities(selectedInterests)}
        >
          {t('discovery.showActivities')}
        </button>
      </section>
    </main>
  );
}
