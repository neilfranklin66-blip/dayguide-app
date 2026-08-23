import React from 'react';
import LivePlaceCard from './LivePlaceCard';

export default function NearbyMixedStage({
  places = [],
  currentIndex = 0,
  isLoading = false,
  source = null,
  onSwipe,
  onChooseFood,
  onChooseActivities,
  locale,
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

  return (
    <LivePlaceCard
      place={current}
      kind={current.kind}
      sectionTitle={t('discovery.both')}
      currentIndex={currentIndex}
      queueLength={places.length}
      source={source}
      onSwipe={onSwipe}
      locale={locale}
      t={t}
    />
  );
}
