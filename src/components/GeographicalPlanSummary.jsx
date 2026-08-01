import React from 'react';
import {
  JOURNEY_INTENT,
  minutesToTimeInput,
} from '../utils/planningInputWorkflow';
import { buildGoogleMapsPlanningRouteUrl } from '../utils/mapsDirections';

const fallbackT = (_key, options) => options?.defaultValue ?? _key;

const placeLabel = place =>
  [place?.name, place?.address]
    .filter(value => typeof value === 'string' && value.trim())
    .join(', ');

const planningPoints = planningInput => [
  planningInput.start,
  ...(planningInput.anchors ?? []),
  ...(planningInput.end ? [planningInput.end] : []),
];

export default function GeographicalPlanSummary({
  planningInput,
  planningAssessment,
  t = fallbackT,
}) {
  if (!planningInput) return null;

  const points = planningPoints(planningInput);
  const routeLegCount = planningAssessment?.summary?.routeLegCount ?? 0;

  return (
    <section
      className="geographical-plan-summary"
      aria-labelledby="geographical-plan-summary-title"
    >
      <h3 id="geographical-plan-summary-title">
        {t('planning.summaryTitle', {
          defaultValue: 'Your fixed route details',
        })}
      </h3>
      <p>
        {t('planning.summaryStart', {
          name: placeLabel(planningInput.start.place),
          time: minutesToTimeInput(
            planningInput.start.departureTimeMinutes,
          ),
          defaultValue: `Start: ${placeLabel(
            planningInput.start.place,
          )} at ${minutesToTimeInput(
            planningInput.start.departureTimeMinutes,
          )}`,
        })}
      </p>

      {planningInput.journeyIntent === JOURNEY_INTENT.FLEXIBLE && (
        <p>
          {t('planning.summaryJourneyFlexible', {
            defaultValue:
              'Journey context: Flexible. Keep later stops optional if you want room for a pause. DayGuide does not confirm a route\'s condition or accessibility.',
          })}
        </p>
      )}
      {planningInput.journeyIntent === JOURNEY_INTENT.COMFORTABLE_ARRIVAL && (
        <p>
          {t('planning.summaryJourneyComfortableArrival', {
            defaultValue:
              'Journey context: Prefer a comfortable arrival. Your chosen buffer is a personal planning choice, not an arrival confirmation.',
          })}
        </p>
      )}
      {planningInput.journeyIntent === JOURNEY_INTENT.TIME_SENSITIVE && (
        <p className="hard-anchor-travel-warning">
          {t('planning.summaryJourneyTimeSensitive', {
            defaultValue:
              'Journey context: Time-sensitive. Check every live journey and decide your own buffer; DayGuide cannot confirm that a target time can be met.',
          })}
        </p>
      )}

      {(planningInput.anchors ?? []).map(anchor => (
        <article key={anchor.id} className="geographical-plan-point">
          <p className="card-type-label">
            {t('planning.lockedAnchor', {
              defaultValue: 'Locked anchor',
            })}
          </p>
          <h4>{anchor.title}</h4>
          <p>{placeLabel(anchor.place)}</p>
          <p>
            {t('planning.summaryAnchorTiming', {
              time: minutesToTimeInput(anchor.startTimeMinutes),
              duration: anchor.durationMinutes,
              buffer: anchor.arrivalBufferMinutes,
              defaultValue: `${minutesToTimeInput(
                anchor.startTimeMinutes,
              )} · ${anchor.durationMinutes} minutes · arrive ${anchor.arrivalBufferMinutes} minutes early`,
            })}
          </p>
        </article>
      ))}

      {planningInput.end && (
        <p>
          {planningInput.end.arrivalDeadlineMinutes == null
            ? t('planning.summaryDestinationWithoutDeadline', {
                name: placeLabel(planningInput.end.place),
                defaultValue: `Finish: ${placeLabel(
                  planningInput.end.place,
                )}`,
              })
            : t('planning.summaryDestinationWithDeadline', {
                name: placeLabel(planningInput.end.place),
                time: minutesToTimeInput(
                  planningInput.end.arrivalDeadlineMinutes,
                ),
                defaultValue: `Finish: ${placeLabel(
                  planningInput.end.place,
                )} by ${minutesToTimeInput(
                  planningInput.end.arrivalDeadlineMinutes,
                )}`,
              })}
        </p>
      )}

      {routeLegCount > 0 && (
        <p className="hard-anchor-travel-warning">
          {t('planning.routeNotVerified', {
            defaultValue:
              'These fixed planning windows are recorded, but their travel times are not route-verified. Check each live journey and allow additional time.',
          })}
        </p>
      )}

      {points.slice(1).map((point, index) => {
        const previous = points[index];
        const href = buildGoogleMapsPlanningRouteUrl({
          origin: placeLabel(previous.place),
          destination: placeLabel(point.place),
        });
        if (!href) return null;

        return (
          <a
            key={`${previous.id}->${point.id}`}
            className="live-route-link planning-route-link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('planning.checkLegInMaps', {
              from: previous.place.name,
              to: point.place.name,
              defaultValue: `Check ${previous.place.name} to ${point.place.name} in Google Maps`,
            })}
          </a>
        );
      })}
    </section>
  );
}
