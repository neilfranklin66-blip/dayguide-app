const TRAVEL_MODE = Object.freeze({
  walk: 'walking',
  taxi: 'driving',
  tube: 'transit',
  bus: 'transit',
});

const routePointLabel = item => {
  if (!item || typeof item !== 'object') return null;
  const parts = [item.activity ?? item.name, item.address]
    .filter(value => typeof value === 'string' && value.trim())
    .map(value => value.trim());
  return parts.length > 0 ? parts.join(', ') : null;
};

export function buildGoogleMapsDirectionsUrl({
  origin,
  destination,
  mode,
} = {}) {
  const originLabel =
    typeof origin === 'string' ? origin.trim() : routePointLabel(origin);
  const destinationLabel =
    typeof destination === 'string'
      ? destination.trim()
      : routePointLabel(destination);
  const travelMode = TRAVEL_MODE[mode];

  if (!originLabel || !destinationLabel || !travelMode) return null;

  const params = new URLSearchParams({
    api: '1',
    origin: originLabel,
    destination: destinationLabel,
    travelmode: travelMode,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export { routePointLabel };
