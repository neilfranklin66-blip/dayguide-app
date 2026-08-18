import React from 'react';

function PhotoCredit({ photoAttributions, photoMapsUrl, t }) {
  if (photoAttributions.length === 0 && !photoMapsUrl) return null;

  return (
    <figcaption className="live-place-card-photo-credit">
      {photoAttributions.length > 0 && (
        <span className="live-place-card-photo-authors">
          {t('restaurants.photoBy')}{' '}
          {photoAttributions.map((attribution, index) => (
            <React.Fragment key={`${attribution.name}-${index}`}>
              {index > 0 && ', '}
              {attribution.uri ? (
                <a href={attribution.uri} target="_blank" rel="noopener noreferrer">
                  {attribution.photoUri && (
                    <img src={attribution.photoUri} alt="" className="live-place-card-photo-author-avatar" />
                  )}
                  {attribution.name}
                </a>
              ) : attribution.name}
            </React.Fragment>
          ))}
        </span>
      )}
      {photoMapsUrl && (
        <a href={photoMapsUrl} target="_blank" rel="noopener noreferrer" className="live-place-card-photo-source">
          {t('restaurants.viewPhotoOnMaps')}
        </a>
      )}
    </figcaption>
  );
}

export default function LivePlaceCard({
  place,
  kind,
  sectionTitle,
  currentIndex,
  queueLength,
  source,
  onSwipe,
  selected = false,
  t,
}) {
  const isFood = kind === 'food';
  const photoUrl = place.photoUrl || (isFood ? place.image : null);
  const [photoFailed, setPhotoFailed] = React.useState(false);
  const photoAttributions = Array.isArray(place.photoAttributions) ? place.photoAttributions : [];
  const typeLabel = isFood
    ? [place.venueType, ...(place.cuisine || []).map(cuisine => t(`cuisine.${cuisine}`))]
      .filter(Boolean)
      .join(' / ')
    : place.venueType || t(`interests.${place.category}`);
  const fallbackLabel = typeLabel || sectionTitle;
  const facts = [
    typeof place.rating === 'number' ? `${place.rating} / 5` : null,
    !place.isSample && typeof place.distance === 'number'
      ? t('nearbyResult.distance', { distance: place.distance })
      : null,
  ].filter(Boolean);

  return (
    <main className="live-place-page">
      <section className="live-place-card" aria-labelledby="live-place-name">
        <header className="live-place-card-header">
          <p className="live-place-card-section">{sectionTitle}</p>
          {!selected && (
            <p className="live-place-card-progress">
              {t('discovery.cardProgress', { current: currentIndex + 1, total: queueLength })}
            </p>
          )}
        </header>

        {place.isSample ? (
          <p className="live-place-card-source live-place-card-source--sample">{t('activities.sampleBadge')}</p>
        ) : source === 'live' && (
          <p className="live-place-card-source">{t('nearbyResult.liveSource')}</p>
        )}

        {photoUrl && !photoFailed ? (
          <figure className="live-place-card-photo">
            <img
              src={photoUrl}
              alt={place.name}
              onError={() => setPhotoFailed(true)}
            />
            <PhotoCredit
              photoAttributions={photoAttributions}
              photoMapsUrl={place.photoMapsUrl}
              t={t}
            />
          </figure>
        ) : (
          <div className="live-place-card-photo-fallback" aria-hidden="true">
            <span>{fallbackLabel}</span>
          </div>
        )}

        <div className="live-place-card-content">
          {typeLabel && <p className="live-place-card-type">{typeLabel}</p>}
          <h1 id="live-place-name" className="live-place-card-name" title={place.name}>{place.name}</h1>

          {facts.length > 0 && (
            <div className="live-place-card-facts" aria-label={t('discovery.placeDetails')}>
              {facts.map(fact => <span key={fact}>{fact}</span>)}
            </div>
          )}

          {place.address && <p className="live-place-card-address">{place.address}</p>}
          {place.isSample && <p className="live-place-card-sample-note">{t('activities.sampleNote')}</p>}
          {place.mapsUrl && (
            <a className="live-place-card-maps" href={place.mapsUrl} target="_blank" rel="noopener noreferrer">
              {t('discovery.openInMaps')}
            </a>
          )}
        </div>

        {!selected && (
          <footer className="live-place-card-actions">
            <button type="button" className="live-place-card-skip" onClick={() => onSwipe(false)}>
              {t('discovery.skip')}
            </button>
            <button type="button" className="live-place-card-choose" onClick={() => onSwipe(true)}>
              {t('discovery.choose')}
            </button>
          </footer>
        )}
      </section>
    </main>
  );
}
