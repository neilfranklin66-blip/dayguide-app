import React from 'react';
import { formatDurationLabel, getTimelineCategoryLabel } from '../engines/timelineEngine';
import { ACTIVITY_CATEGORIES } from '../config/dayGuideOptions';

export default function TimelineItemRow({ item, index, onDurationChange, t }) {
  return (
    <div className="timeline-item">
      <div className="timeline-time">{item.time}</div>
      <div className="timeline-content">
        <span className="timeline-icon">{item.icon}</span>
        <div className="activity-details">
          <p className="card-type-label timeline-category">
            {getTimelineCategoryLabel({
              category: item.category,
              t,
              activityCategories: ACTIVITY_CATEGORIES,
            })}
          </p>
          <h4>{item.activity}</h4>
          <div className="duration-section">
            <input type="range" min="0.25" max="4" step="0.25" value={item.duration}
              onChange={e => onDurationChange(index, parseFloat(e.target.value))}
              className="duration-slider" />
            <div className="duration-display">{formatDurationLabel(item.duration)}</div>
          </div>
          <p className="duration-hint">{t('timeline.slideToAdjust')}</p>
          {/* Sample activities carry London demo distances, so we drop the
              "km" proximity claim and flag them; restaurants (live results)
              keep their real distance. */}
          {item.isSample ? (
            <>
              <p className="activity-info">⭐ {item.rating}</p>
              <p className="sample-note">{t('timeline.sampleActivity')}</p>
            </>
          ) : (
            <p className="activity-info">⭐ {item.rating} | 📍 {item.distance}km</p>
          )}
          <p className="address">{item.address}</p>
        </div>
      </div>
    </div>
  );
}
