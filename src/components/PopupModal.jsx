import React from 'react';
import { getPopupMessage } from '../engines/popupEngine';

function PopupModal({ activePopup, onClose, onYes, onSkip = onClose, t }) {
  if (!activePopup) return null;

  const icons = {
    nearbyRestaurant: '🍽️',
    activityBreak: '🎭',
    coffeeBreak: '☕',
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="popup-icon">{icons[activePopup.type]}</div>
        <h3 className="popup-title">{t(`popups.${activePopup.type}.title`)}</h3>
        <p className="popup-message">{getPopupMessage({ popup: activePopup, t })}</p>
        <div className="popup-buttons">
          <button className="popup-btn popup-btn-yes" onClick={() => onYes(activePopup)}>
            {t(`popups.${activePopup.type}.yes`)}
          </button>
          <button className="popup-btn popup-btn-no" onClick={onClose}>
            {t(`popups.${activePopup.type}.no`)}
          </button>
          {activePopup.type === 'nearbyRestaurant' && (
            <button className="popup-btn popup-btn-skip" onClick={() => onSkip(activePopup)}>
              {t('popups.nearbyRestaurant.skip')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PopupModal;
