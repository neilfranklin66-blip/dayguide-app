import React from 'react';

export default function StartOrderSelector({ startWith, onChange, t }) {
  return (
    <div className="time-selector start-order-selector">
      <label>{t('interests.startWithTitle')}</label>
      <p className="start-order-hint">{t('interests.startWithHint')}</p>
      <div className="price-options start-order-options">
        <button
          className={startWith === 'activities' ? 'price-btn start-order-btn selected' : 'price-btn start-order-btn'}
          onClick={() => onChange('activities')}
        >
          <span className="start-order-icon">🎭</span>
          <span>{t('interests.startWithActivities')}</span>
        </button>
        <button
          className={startWith === 'food_drinks' ? 'price-btn start-order-btn selected' : 'price-btn start-order-btn'}
          onClick={() => onChange('food_drinks')}
        >
          <span className="start-order-icon">🍽️</span>
          <span>{t('interests.startWithFoodDrinks')}</span>
        </button>
      </div>
    </div>
  );
}
