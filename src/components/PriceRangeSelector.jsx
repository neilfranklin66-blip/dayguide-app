import React from 'react';
import { PRICE_OPTIONS } from '../config/dayGuideOptions';

export default function PriceRangeSelector({ selectedPriceRange, onChange, t }) {
  return (
    <>
      <h3 className="section-title">{t('interests.priceTitle')}</h3>
      <div className="price-options">
        {PRICE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`price-btn ${selectedPriceRange === opt.value ? 'selected' : ''}`}
            onClick={() => onChange(selectedPriceRange === opt.value ? null : opt.value)}
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>
    </>
  );
}
