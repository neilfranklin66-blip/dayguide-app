import React from 'react';

function LocationStage({ t }) {
  return (
    <div className="dayguide-container">
      <div className="loading">
        <h2>{t('welcome.findingLocation')}</h2>
        <p>{t('welcome.gettingCoordinates')}</p>
      </div>
    </div>
  );
}

export default LocationStage;
