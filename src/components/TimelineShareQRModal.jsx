import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { buildTimelineShareText } from '../engines/timelineEngine';
import { ACTIVITY_CATEGORIES } from '../config/dayGuideOptions';

const TimelineShareQRModal = ({ showQR, onClose, timeline, t }) => {
  if (!showQR) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card qr-modal" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="popup-icon">📲</div>
        <h3 className="popup-title">{t('timeline.shareTitle')}</h3>
        <div className="qr-wrapper">
          <QRCodeSVG value={buildTimelineShareText({ timeline, t, activityCategories: ACTIVITY_CATEGORIES })} size={200} />
        </div>
        <p className="popup-message qr-hint">{t('timeline.shareHint')}</p>
      </div>
    </div>
  );
};

export default TimelineShareQRModal;
