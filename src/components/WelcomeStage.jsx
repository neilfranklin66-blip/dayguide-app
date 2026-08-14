import React from 'react';
import welcomeHero from '../assets/welcome-seaside-restaurant.jpg';

function WelcomeStage({
  t,
  onStartPlanning,
  onFindNearby,
  savedPlanSummary,
  onResume,
}) {
  return (
    <div className="dayguide-container welcome">
      <main className="welcome-hero">
        <img className="welcome-hero-image" src={welcomeHero} alt="" />
        <div className="welcome-hero-shade" aria-hidden="true" />
        <div className="welcome-hero-content">
          <div className="welcome-intro">
            <h1>DayGuide</h1>
            <p className="welcome-tagline">{t('welcome.tagline')}</p>
            <p className="welcome-subtitle">{t('welcome.subtitle')}</p>
          </div>
          <div className="welcome-actions">
            <button onClick={onFindNearby} className="btn-discovery welcome-nearby-action">
              {t('welcome.findNearby')}
            </button>
            <button onClick={onStartPlanning} className="btn-primary welcome-plan-action">
              {t('welcome.startPlanning')}
            </button>
            {savedPlanSummary && (
              <button onClick={onResume} className="welcome-resume-link">
                {t('welcome.resumePlan')}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default WelcomeStage;
