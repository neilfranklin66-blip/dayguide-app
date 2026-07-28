import {
  GEOGRAPHICAL_PLAN_SCHEMA_VERSION,
  createEndPoint,
  createHardAnchor,
  createPlaceRef,
  createStartPoint,
} from '../models/geographicalPlan';

const PERSISTED_GEOGRAPHICAL_PLAN_VERSION = 1;

const copyMinimumPlace = place => ({
  id: place.id == null ? null : String(place.id),
  name: place.name,
  coordinates: {
    lat: place.coordinates.lat,
    lng: place.coordinates.lng,
  },
  source: place.source,
});

const restorePlace = place =>
  createPlaceRef({
    id: place?.id,
    name: place?.name,
    coordinates: place?.coordinates,
    source: place?.source,
  });

/**
 * Saved-plan v2 keeps only the route-capable data selected for this plan.
 * Provider result lists, search queries, accuracy, locality, timezone and
 * addresses remain transient. The enclosing saved plan expires after its
 * selected local calendar day and is never sent to QR sharing.
 */
export function serializeGeographicalPlanning(planningInput) {
  if (!planningInput) return null;

  const start = createStartPoint({
    place: restorePlace(planningInput.start?.place),
    departureTimeMinutes: planningInput.start?.departureTimeMinutes,
  });
  const anchors = (planningInput.anchors ?? []).map(anchor =>
    createHardAnchor({
      id: anchor.id,
      title: anchor.title,
      place: restorePlace(anchor.place),
      startTimeMinutes: anchor.startTimeMinutes,
      durationMinutes: anchor.durationMinutes,
      arrivalBufferMinutes: anchor.arrivalBufferMinutes,
    }),
  );
  const end = planningInput.end
    ? createEndPoint({
        place: restorePlace(planningInput.end.place),
        arrivalDeadlineMinutes: planningInput.end.arrivalDeadlineMinutes,
        arrivalBufferMinutes: planningInput.end.arrivalBufferMinutes,
      })
    : null;

  return {
    version: PERSISTED_GEOGRAPHICAL_PLAN_VERSION,
    schemaVersion: GEOGRAPHICAL_PLAN_SCHEMA_VERSION,
    start: {
      ...start,
      place: copyMinimumPlace(start.place),
    },
    anchors: anchors.map(anchor => ({
      ...anchor,
      place: copyMinimumPlace(anchor.place),
    })),
    end:
      end == null
        ? null
        : {
            ...end,
            place: copyMinimumPlace(end.place),
          },
    locationProvenance: {
      start: planningInput.locationProvenance?.start ?? null,
      end: planningInput.locationProvenance?.end ?? null,
    },
  };
}

export function restoreGeographicalPlanning(stored) {
  if (stored == null) return null;
  if (
    stored.version !== PERSISTED_GEOGRAPHICAL_PLAN_VERSION ||
    stored.schemaVersion !== GEOGRAPHICAL_PLAN_SCHEMA_VERSION
  ) {
    return null;
  }

  try {
    const start = createStartPoint({
      place: restorePlace(stored.start?.place),
      departureTimeMinutes: stored.start?.departureTimeMinutes,
    });
    const anchors = Array.isArray(stored.anchors)
      ? stored.anchors.map(anchor =>
          createHardAnchor({
            id: anchor.id,
            title: anchor.title,
            place: restorePlace(anchor.place),
            startTimeMinutes: anchor.startTimeMinutes,
            durationMinutes: anchor.durationMinutes,
            arrivalBufferMinutes: anchor.arrivalBufferMinutes,
          }),
        )
      : null;
    if (anchors == null) return null;

    const end = stored.end
      ? createEndPoint({
          place: restorePlace(stored.end.place),
          arrivalDeadlineMinutes: stored.end.arrivalDeadlineMinutes,
          arrivalBufferMinutes: stored.end.arrivalBufferMinutes,
        })
      : null;

    return {
      schemaVersion: GEOGRAPHICAL_PLAN_SCHEMA_VERSION,
      start,
      anchors,
      end,
      locationProvenance: {
        start: stored.locationProvenance?.start ?? null,
        end: stored.locationProvenance?.end ?? null,
      },
    };
  } catch (_) {
    return null;
  }
}

const geographicalPlanPersistence = {
  restoreGeographicalPlanning,
  serializeGeographicalPlanning,
};

export default geographicalPlanPersistence;
