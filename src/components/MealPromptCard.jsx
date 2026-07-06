import React from 'react';

export default function MealPromptCard({ onYes, onNo, t }) {
  return (
    <div className="dayguide-container">
      <div className="card meal-prompt-card">
        <div className="meal-prompt-icon">🍽️</div>
        <h2>{t('mealPrompt.title')}</h2>
        <p className="meal-prompt-subtitle">{t('mealPrompt.subtitle')}</p>
        <div className="meal-prompt-buttons">
          <button onClick={onYes} className="btn-primary">
            {t('mealPrompt.yes')}
          </button>
          <button onClick={onNo} className="btn-secondary">
            {t('mealPrompt.no')}
          </button>
        </div>
      </div>
    </div>
  );
}
