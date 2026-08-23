import React from 'react';

const fallbackT = (_key, options) => options?.defaultValue ?? _key;

export default function PlanMoodStage({ onChoose, onBack, t = fallbackT }) {
  const choices = [
    {
      id: 'food',
      title: t('planMood.foodTitle', { defaultValue: 'Food & Drinks' }),
    },
    {
      id: 'activities',
      title: t('planMood.activitiesTitle', { defaultValue: 'Things to do' }),
    },
    {
      id: 'both',
      title: t('planMood.bothTitle', { defaultValue: 'Show me both' }),
    },
  ];

  return (
    <div className="dayguide-container">
      <section className="card plan-mood-stage" aria-labelledby="plan-mood-title">
        <p className="stage-eyebrow">
          {t('planMood.eyebrow', { defaultValue: 'Your day takes shape' })}
        </p>
        <h2 id="plan-mood-title">
          {t('planMood.title', { defaultValue: 'What are you in the mood for?' })}
        </h2>
        <p>
          {t('planMood.subtitle', {
            defaultValue: 'Choose one. You can keep it simple or add another stop later.',
          })}
        </p>
        <div className="plan-mood-options">
          {choices.map(choice => (
            <button
              key={choice.id}
              type="button"
              className="plan-mood-option"
              onClick={() => onChoose(choice.id)}
            >
              <strong>{choice.title}</strong>
            </button>
          ))}
        </div>
        <button type="button" className="btn-secondary" onClick={onBack}>
          {t('planMood.back', { defaultValue: 'Back to your day details' })}
        </button>
      </section>
    </div>
  );
}
