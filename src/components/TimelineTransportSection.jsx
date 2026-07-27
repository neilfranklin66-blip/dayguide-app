import React from 'react';
import {
  getTransportPlanningEstimate,
  selectTransportOptions,
} from '../engines/transportEngine';
import { TRANSPORT_OPTIONS } from '../config/dayGuideOptions';
import { buildGoogleMapsDirectionsUrl } from '../utils/mapsDirections';
import { DEFAULT_TRAVEL_PREFERENCES } from '../utils/travelPreferences';

export default function TimelineTransportSection({
  distance,
  origin,
  destination,
  travelPreferences = DEFAULT_TRAVEL_PREFERENCES,
  t,
}) {
  return (
    <div className="transport-section">
      <div className="transport-label">{t('timeline.howToGetThere')}</div>
      <p className="transport-estimate-basis">
        {t(
          'timeline.estimateBasis',
          'Planning estimates use nearby distance, not live traffic or a routed itinerary leg.',
        )}
      </p>
      <div className="transport-options">
        {selectTransportOptions(
          TRANSPORT_OPTIONS,
          distance,
          travelPreferences,
        ).map(option => {
          const estimate = getTransportPlanningEstimate({
            mode: option.mode,
            distanceKm: distance,
            fallbackMinutes: option.time,
            travelPreferences,
          });
          const liveUrl = buildGoogleMapsDirectionsUrl({
            origin,
            destination,
            mode: option.mode,
          });

          return (
            <div key={option.mode} className="transport-option">
              <div className="transport-emoji">{option.emoji}</div>
              <div className="transport-details">
                <div className="transport-mode">
                  {t(`transport.${option.mode}`)}
                </div>
                <div className="transport-time">
                  {estimate.minutes == null
                    ? t('timeline.liveTimeRequired', 'Check live traffic')
                    : t('timeline.estimatedMinutes', {
                        count: estimate.minutes,
                        defaultValue: `Estimated ${estimate.minutes} min`,
                      })}
                </div>
                <div className="transport-cost">
                  {t(`transport.cost.${option.costKey}`)}
                </div>
                {liveUrl && (
                  <a
                    className="live-route-link"
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t(
                      'timeline.checkLiveJourney',
                      'Check live journey',
                    )}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
