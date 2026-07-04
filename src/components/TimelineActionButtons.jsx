import React from 'react';

export default function TimelineActionButtons({ onStartOver, onShare, t }) {
  return (
    <div className="action-buttons">
      <button onClick={onStartOver} className="btn-secondary">{t('timeline.startOver')}</button>
      <button onClick={onShare} className="btn-secondary share-btn">{t('timeline.share')}</button>
      <button className="btn-primary book-btn">{t('timeline.bookNow')}</button>
    </div>
  );
}
