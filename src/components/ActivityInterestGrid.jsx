import React from 'react';

export default function ActivityInterestGrid({ interestCategories, selectedInterests, onToggle, t }) {
  return (
    <>
      <h3 className="section-title">{t('interests.activitiesTitle')}</h3>
      <div className="interest-grid activities-grid">
        {interestCategories.map(interest => (
          <button
            key={interest.id}
            className={`interest-btn ${selectedInterests.includes(interest.id) ? 'selected' : ''}`}
            onClick={() => onToggle(interest.id)}
          >
            <span className="icon">{interest.icon}</span>
            <span>{interest.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
