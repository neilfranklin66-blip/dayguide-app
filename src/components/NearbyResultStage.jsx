import React from 'react';

const fallbackT = (_key, options) => options?.defaultValue ?? _key;

export default function NearbyResultStage({
  result,
  onStartOver,
  onFindAnother,
  t = fallbackT,
}) {
  const place = result?.place;
  if (!place) return null;

  const fallbackType =
    result.type === 'food'
      ? t('planMood.foodTitle', { defaultValue: 'Food & Drinks' })
      : t('planMood.activitiesTitle', { defaultValue: 'Things to do' });

  return (
    <div className="dayguide-container">
      <section className="card nearby-result-stage" aria-labelledby="nearby-result-title">
        <p className="stage-eyebrow">
          {t('nearbyResult.eyebrow', { defaultValue: 'Your nearby pick' })}
        </p>
        <h2 id="nearby-result-title">{place.name}</h2>
        <p className="nearby-result-type">{place.venueType || fallbackType}</p>
        <p className="api-source-banner api-source-banner--live">
          {t('nearbyResult.liveSource', { defaultValue: 'Live from Google Places' })}
        </p>
        {typeof place.rating === 'number' && <p>Rating: {place.rating} / 5</p>}
        {typeof place.distance === 'number' && (
          <p>
            {t('nearbyResult.distance', {
              distance: place.distance,
              defaultValue: `${place.distance} km away`,
            })}
          </p>
        )}
        {place.address && <p>{place.address}</p>}
        {place.mapsUrl && (
          <a
            className="maps-link nearby-result-maps"
            href={place.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('restaurants.openInMaps', { defaultValue: 'Open in Maps' })}
          </a>
        )}
        <div className="nearby-result-actions">
          <button type="button" className="btn-secondary" onClick={onFindAnother}>
            {t('nearbyResult.findAnother', { defaultValue: 'Find another' })}
          </button>
          <button type="button" className="btn-primary" onClick={onStartOver}>
            {t('discovery.startOver', { defaultValue: 'Start over' })}
          </button>
        </div>
      </section>
    </div>
  );
}
