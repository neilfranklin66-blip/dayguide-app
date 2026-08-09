import React from 'react';

const roundedDistance = distance =>
  Number.isFinite(distance) ? Math.max(0.1, Math.round(distance * 10) / 10) : null;

export default function GeographicChoiceCard({ guidance, onChoose, t }) {
  const fromStart = roundedDistance(guidance.distanceFromStartKm);
  const toLater = roundedDistance(guidance.distanceToLaterKm);
  const laterName = guidance.later.name;

  return (
    <div className="dayguide-container">
      <div className="card geographic-choice-card">
        <p className="geographic-choice-eyebrow">{t('geography.eyebrow')}</p>
        <h2>{t('geography.title')}</h2>
        <p className="geographic-choice-intro">
          {guidance.later.kind === 'anchor'
            ? t('geography.anchorIntro', { name: laterName })
            : t('geography.finishIntro', { name: laterName })}
        </p>
        {(fromStart != null || toLater != null) && (
          <p className="geographic-choice-distance">
            {fromStart != null && t('geography.fromStart', { distance: fromStart })}
            {fromStart != null && toLater != null && ' · '}
            {toLater != null && t('geography.toLater', { distance: toLater, name: laterName })}
          </p>
        )}
        {guidance.remainingMinutes != null && (
          <p className="geographic-choice-time">
            {t('geography.remainingTime', { count: guidance.remainingMinutes })}
          </p>
        )}
        <h3>{t('geography.question')}</h3>
        <div className="geographic-choice-options">
          <button className="btn-primary" onClick={() => onChoose('start')}>
            {t('geography.nearStart')}
          </button>
          <button className="btn-primary" onClick={() => onChoose('later', laterName)}>
            {t('geography.nearLater', { name: laterName })}
          </button>
          <button className="btn-secondary" onClick={() => onChoose('between')}>
            {t('geography.between')}
          </button>
        </div>
        <p className="geographic-choice-note">{t('geography.note')}</p>
      </div>
    </div>
  );
}
