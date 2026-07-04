import React from 'react';
import TimelineItemRow from './TimelineItemRow';
import TimelineTransportSection from './TimelineTransportSection';

export default function TimelineList({ timeline, onDurationChange, t }) {
  return (
    <div className="timeline">
      {timeline.length === 0 ? (
        <p>{t('timeline.empty')}</p>
      ) : (
        timeline.map((item, index) => (
          <div key={item.id} className="timeline-group">
            <TimelineItemRow
              item={item}
              index={index}
              onDurationChange={onDurationChange}
              t={t}
            />
            {index < timeline.length - 1 && (
              <TimelineTransportSection
                distance={item.distance}
                t={t}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
