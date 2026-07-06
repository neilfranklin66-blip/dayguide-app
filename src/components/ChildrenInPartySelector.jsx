import React from 'react';

export default function ChildrenInPartySelector({ hasChildren, onChange, t }) {
  return (
    <div className="time-selector">
      <label>{t('interests.childrenLabel')}</label>
      <div className="price-options">
        <button
          className={`price-btn ${hasChildren === true ? 'selected' : ''}`}
          onClick={() => onChange(true)}
        >
          {t('interests.childrenYes')}
        </button>
        <button
          className={`price-btn ${hasChildren === false ? 'selected' : ''}`}
          onClick={() => onChange(false)}
        >
          {t('interests.childrenNo')}
        </button>
      </div>
    </div>
  );
}
