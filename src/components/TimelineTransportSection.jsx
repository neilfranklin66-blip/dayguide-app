import React from 'react';
import { estimateTransportMinutes, selectTransportOptions } from '../engines/transportEngine';
import { TRANSPORT_OPTIONS } from '../config/dayGuideOptions';

export default function TimelineTransportSection({ distance, t }) {
  return (
    <div className="transport-section">
      <div className="transport-label">{t('timeline.howToGetThere')}</div>
      <div className="transport-options">
        {selectTransportOptions(TRANSPORT_OPTIONS, distance).map((option, i) => (
          <div key={i} className="transport-option">
            <div className="transport-emoji">{option.emoji}</div>
            <div className="transport-details">
              <div className="transport-mode">{t(`transport.${option.mode}`)}</div>
              <div className="transport-time">
                {t('timeline.minutes', {
                  count: estimateTransportMinutes(option.mode, distance, option.time),
                })}
              </div>
              <div className="transport-cost">{option.cost}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
