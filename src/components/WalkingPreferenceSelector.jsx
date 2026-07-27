import React from 'react';
import {
  ALLOWED_MAXIMUM_WALKING_MINUTES,
  WALKING_PACE,
} from '../utils/travelPreferences';

export default function WalkingPreferenceSelector({
  preferences,
  onChange,
  t,
}) {
  return (
    <section className="walking-preferences" aria-labelledby="walking-pace-title">
      <h3 id="walking-pace-title">
        {t('interests.walkingPaceTitle', 'Walking preferences')}
      </h3>
      <p>
        {t(
          'interests.walkingPaceHint',
          'Typical is the starting estimate. Choose what feels right for you.',
        )}
      </p>
      <label htmlFor="walking-pace">
        {t('interests.walkingPaceLabel', 'Walking pace')}
      </label>
      <select
        id="walking-pace"
        value={preferences.walkingPace}
        onChange={event =>
          onChange({ walkingPace: event.target.value })
        }
      >
        <option value={WALKING_PACE.RELAXED}>
          {t('interests.walkingPaceRelaxed', 'Relaxed')}
        </option>
        <option value={WALKING_PACE.TYPICAL}>
          {t('interests.walkingPaceTypical', 'Typical')}
        </option>
        <option value={WALKING_PACE.BRISK}>
          {t('interests.walkingPaceBrisk', 'Brisk')}
        </option>
      </select>

      <label htmlFor="maximum-walking-minutes">
        {t(
          'interests.maximumWalkingLabel',
          'Longest walk DayGuide should normally plan',
        )}
      </label>
      <select
        id="maximum-walking-minutes"
        value={preferences.maximumWalkingMinutes}
        onChange={event =>
          onChange({
            maximumWalkingMinutes: Number(event.target.value),
          })
        }
      >
        {ALLOWED_MAXIMUM_WALKING_MINUTES.map(minutes => (
          <option key={minutes} value={minutes}>
            {t('interests.maximumWalkingMinutes', {
              count: minutes,
              defaultValue: `${minutes} minutes`,
            })}
          </option>
        ))}
      </select>
      <p className="preference-note">
        {t(
          'interests.walkingPreferencePrivacy',
          'You control this preference. DayGuide does not infer it from age or weight.',
        )}
      </p>
    </section>
  );
}
