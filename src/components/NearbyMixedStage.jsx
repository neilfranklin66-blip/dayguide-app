import React from 'react';

export default function NearbyMixedStage({
  places = [],
  currentIndex = 0,
  isLoading = false,
  source = null,
  onSwipe,
  onChooseFood,
  onChooseActivities,
  t,
}) {
  if (isLoading) {
    return <div className="dayguide-container"><div className="card loading"><h2>{t('discovery.searchingBoth')}</h2></div></div>;
  }

  const current = places[currentIndex];
  if (!current) {
    const unavailable = source && source !== 'live' && source !== 'no_results';
    const noResults = source === 'no_results';
    return (
      <div className="dayguide-container">
        <section className="card nearby-mixed-complete">
          <h2>{unavailable ? t('discovery.bothUnavailableTitle') : noResults ? t('discovery.mixedEmptyTitle') : t('discovery.mixedCompleteTitle')}</h2>
          <p>{unavailable ? t('discovery.bothUnavailableHint') : noResults ? t('discovery.mixedEmptyHint') : t('discovery.mixedCompleteHint')}</p>
          <div className="nearby-mixed-next-actions">
            <button className="btn-secondary" type="button" onClick={onChooseFood}>{t('discovery.food')}</button>
            <button className="btn-secondary" type="button" onClick={onChooseActivities}>{t('discovery.activities')}</button>
          </div>
        </section>
      </div>
    );
  }

  const isFood = current.kind === 'food';
  const typeLabel = isFood
    ? [current.venueType, ...(current.cuisine || []).map(cuisine => t(`cuisine.${cuisine}`))].filter(Boolean).join(' / ')
    : current.venueType || t(`interests.${current.category}`);

  return (
    <div className="dayguide-container">
      <section className="card swipe-card nearby-mixed-card">
        <p className="stage-eyebrow">{t('discovery.both')}</p>
        <p className="swipe-progress">{currentIndex + 1} / {places.length}</p>
        {source === 'live' && <p className="api-source-banner api-source-banner--live">{t('nearbyResult.liveSource', { defaultValue: 'Live from Google Places' })}</p>}
        <div className="swipe-item">
          {isFood && current.image && <img src={current.image} alt={current.name} className="restaurant-img" />}
          {!isFood && <div className="item-icon">{current.image}</div>}
          {typeLabel && <p className="card-type-label">{typeLabel}</p>}
          <h2 className="place-name" title={current.name}>{current.name}</h2>
          {typeof current.rating === 'number' && <p className="rating">{'\u2605 '}{current.rating}</p>}
          {typeof current.distance === 'number' && <p className="details">{t('nearbyResult.distance', { distance: current.distance, defaultValue: `${current.distance} km away` })}</p>}
          {current.address && <p className="address">{current.address}</p>}
          {current.mapsUrl && <a className="maps-link" href={current.mapsUrl} target="_blank" rel="noopener noreferrer">{t('restaurants.openInMaps', { defaultValue: 'Open in Maps' })}</a>}
        </div>
        <div className="swipe-buttons">
          <button type="button" onClick={() => onSwipe(false)} className="btn-reject">{t('discovery.notForMe')}</button>
          <button type="button" onClick={() => onSwipe(true)} className="btn-accept">{t('discovery.chooseThis')}</button>
        </div>
      </section>
    </div>
  );
}
