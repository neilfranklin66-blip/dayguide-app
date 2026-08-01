import React from 'react';
import { JOURNEY_INTENT } from '../utils/planningInputWorkflow';

export default function TravelEstimateNotice({
  hasHardAnchor = false,
  travelPreferences,
  journeyIntent = null,
  t,
}) {
  return (
    <aside className="travel-estimate-notice" aria-labelledby="travel-guidance-title">
      <h3 id="travel-guidance-title">
        {t('timeline.travelGuidance.title', 'Travel-time guidance')}
      </h3>
      <p>
        {t(
          'timeline.travelGuidance.general',
          'Travel times are estimates. Check live routes, traffic, services and conditions before setting off.',
        )}
      </p>
      <p>
        {t(
          'timeline.travelGuidance.accountability',
          'DayGuide helps organise your day; you decide when to leave and how much additional time to allow.',
        )}
      </p>
      {travelPreferences && (
        <p className="travel-preference-summary">
          {t('timeline.travelGuidance.walkingPreference', {
            pace: t(
              `interests.walkingPace${travelPreferences.walkingPace[0].toUpperCase()}${travelPreferences.walkingPace.slice(1)}`,
              travelPreferences.walkingPace,
            ),
            count: travelPreferences.maximumWalkingMinutes,
            defaultValue: `${travelPreferences.walkingPace} pace · normally no walks over ${travelPreferences.maximumWalkingMinutes} minutes`,
          })}
        </p>
      )}
      {hasHardAnchor && (
        <p className="hard-anchor-travel-warning">
          {t(
            'timeline.travelGuidance.hardAnchor',
            'A fixed-time booking is included. Check the live journey and allow additional time before leaving.',
          )}
        </p>
      )}
      {journeyIntent === JOURNEY_INTENT.FLEXIBLE && (
        <p>
          {t(
            'timeline.travelGuidance.flexibleJourney',
            'This journey is flexible. If a walk feels manageable for you, leave room for a pause; conditions, closures and accessibility can still change.',
          )}
        </p>
      )}
      {journeyIntent === JOURNEY_INTENT.COMFORTABLE_ARRIVAL && (
        <p>
          {t(
            'timeline.travelGuidance.comfortableArrival',
            'You prefer a comfortable arrival. Choose your own extra time and check live directions before leaving.',
          )}
        </p>
      )}
      {journeyIntent === JOURNEY_INTENT.TIME_SENSITIVE && (
        <p className="hard-anchor-travel-warning">
          {t(
            'timeline.travelGuidance.timeSensitiveJourney',
            'This journey is time-sensitive. DayGuide cannot confirm an arrival time; check live directions, conditions and access before setting off.',
          )}
        </p>
      )}
    </aside>
  );
}
