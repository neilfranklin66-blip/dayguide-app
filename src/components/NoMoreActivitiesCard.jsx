import React from 'react';

export default function NoMoreActivitiesCard({ onContinue, t }) {
  return (
    <div className="dayguide-container">
      <div className="card">
        <h2>{t('activities.noMore')}</h2>
        <button onClick={() => onContinue()} className="btn-primary">
          {t('interests.next')}
        </button>
      </div>
    </div>
  );
}
