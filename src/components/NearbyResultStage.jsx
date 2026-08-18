import React from 'react';
import LivePlaceCard from './LivePlaceCard';

const fallbackTranslations = {
  'discovery.activities': 'Things to do',
  'discovery.openInMaps': 'Open in Maps',
  'discovery.startOver': 'Start over',
  'nearbyResult.eyebrow': 'Your nearby pick',
  'nearbyResult.liveSource': 'Live from Google Places',
  'nearbyResult.findAnother': 'Find another',
  'restaurants.photoBy': 'Photo by',
  'restaurants.viewPhotoOnMaps': 'View photo',
};

const fallbackT = (key, options) => options?.defaultValue ?? fallbackTranslations[key] ?? key;

export default function NearbyResultStage({
  result,
  onStartOver,
  onFindAnother,
  t = fallbackT,
}) {
  const place = result?.place;
  if (!place) return null;

  return (
    <LivePlaceCard
      place={place}
      kind={result.type === 'food' ? 'food' : 'activity'}
      sectionTitle={t('nearbyResult.eyebrow', { defaultValue: 'Your nearby pick' })}
      currentIndex={0}
      queueLength={1}
      source="live"
      selected
      onFindAnother={onFindAnother}
      onStartOver={onStartOver}
      t={t}
    />
  );
}
