import React from 'react';

export default function CuisineInterestGrid({ cuisineCategories, selectedCuisines, onToggle, t }) {
  return (
    <>
      <h3 className="section-title">{t('interests.cuisineTitle')}</h3>
      <div className="interest-grid cuisine-grid">
        {cuisineCategories.map(c => (
          <button
            key={c.id}
            className={`interest-btn ${selectedCuisines.includes(c.id) ? 'selected' : ''}`}
            onClick={() => onToggle(c.id)}
          >
            <span className="icon">{c.icon}</span>
            <span>{t(`cuisine.${c.id}`)}</span>
          </button>
        ))}
      </div>
    </>
  );
}
