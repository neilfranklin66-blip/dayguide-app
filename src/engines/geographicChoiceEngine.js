const EARTH_RADIUS_KM = 6371;

// A short walk between two locations does not need another question. This is
// deliberately a planning nudge for places that are meaningfully apart.
export const MIN_GEOGRAPHIC_CHOICE_DISTANCE_KM = 1.5;
const MIN_USEFUL_REMAINING_MINUTES = 30;
const DEFAULT_GAP_MINUTES = 15;

export const hasCoordinates = coordinates =>
  Number.isFinite(coordinates?.lat) && Number.isFinite(coordinates?.lng);

export const distanceBetweenKm = (from, to) => {
  if (!hasCoordinates(from) || !hasCoordinates(to)) return null;

  const latitudeDelta = ((to.lat - from.lat) * Math.PI) / 180;
  const longitudeDelta = ((to.lng - from.lng) * Math.PI) / 180;
  const latitudeOne = (from.lat * Math.PI) / 180;
  const latitudeTwo = (to.lat * Math.PI) / 180;
  const arc =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeOne) * Math.cos(latitudeTwo) *
      Math.sin(longitudeDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
};

const getLaterPlace = planning => {
  const anchors = Array.isArray(planning?.anchors) ? planning.anchors : [];
  const nextAnchor = [...anchors]
    .filter(anchor =>
      anchor?.place &&
      Number.isInteger(anchor?.startTimeMinutes) &&
      anchor.startTimeMinutes >= planning?.start?.departureTimeMinutes,
    )
    .sort((left, right) => left.startTimeMinutes - right.startTimeMinutes)[0];

  if (nextAnchor) {
    return {
      kind: 'anchor',
      name: nextAnchor.title || nextAnchor.place.name,
      place: nextAnchor.place,
      timeMinutes: nextAnchor.startTimeMinutes,
    };
  }

  if (planning?.end?.place) {
    return {
      kind: 'finish',
      name: planning.end.place.name,
      place: planning.end.place,
      timeMinutes: planning.end.arrivalDeadlineMinutes,
    };
  }

  return null;
};

const remainingMinutesFor = ({ selectedItems, availableTimeHours }) => {
  if (!Number.isFinite(availableTimeHours) || availableTimeHours <= 0) return null;
  const items = Array.isArray(selectedItems) ? selectedItems : [];
  const selectedMinutes = items.reduce(
    (total, item) =>
      total + (Number.isFinite(item?.duration) ? item.duration * 60 : 0),
    0,
  );
  const gapMinutes = Math.max(0, items.length - 1) * DEFAULT_GAP_MINUTES;
  const remaining = Math.round(availableTimeHours * 60 - selectedMinutes - gapMinutes);
  return remaining >= MIN_USEFUL_REMAINING_MINUTES ? remaining : null;
};

/**
 * Create one optional, user-led choice of where the next live cards should
 * come from. It is deliberately directional: it uses only straight-line
 * geography and the time the person set aside, never claims a routed journey
 * is feasible.
 */
export const getGeographicChoiceGuidance = ({
  planning,
  selectedPlace,
  selectedItems = [],
  availableTimeHours = null,
} = {}) => {
  const startPlace = planning?.start?.place;
  const later = getLaterPlace(planning);
  if (!startPlace || !later?.place || !hasCoordinates(startPlace.coordinates) || !hasCoordinates(later.place.coordinates)) {
    return null;
  }

  const startToLaterKm = distanceBetweenKm(
    startPlace.coordinates,
    later.place.coordinates,
  );
  if (startToLaterKm == null || startToLaterKm < MIN_GEOGRAPHIC_CHOICE_DISTANCE_KM) {
    return null;
  }

  const selectedCoordinates = selectedPlace?.coordinates;
  return {
    start: {
      name: startPlace.name,
      coordinates: { ...startPlace.coordinates },
    },
    later: {
      ...later,
      place: {
        ...later.place,
        coordinates: { ...later.place.coordinates },
      },
    },
    selectedPlaceName: selectedPlace?.name ?? null,
    distanceFromStartKm: distanceBetweenKm(startPlace.coordinates, selectedCoordinates),
    distanceToLaterKm: distanceBetweenKm(selectedCoordinates, later.place.coordinates),
    remainingMinutes: remainingMinutesFor({ selectedItems, availableTimeHours }),
  };
};

export const getGeographicSearchAreas = guidance => {
  if (!guidance || !hasCoordinates(guidance.start?.coordinates) || !hasCoordinates(guidance.later?.place?.coordinates)) {
    return [];
  }

  const start = guidance.start.coordinates;
  const later = guidance.later.place.coordinates;
  return [
    { id: 'start', coordinates: { ...start } },
    { id: 'later', coordinates: { ...later } },
    {
      id: 'between',
      coordinates: {
        lat: (start.lat + later.lat) / 2,
        lng: (start.lng + later.lng) / 2,
      },
    },
  ];
};
