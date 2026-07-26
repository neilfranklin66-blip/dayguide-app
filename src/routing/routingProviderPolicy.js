import { ROUTE_TRAVEL_MODE } from './routeEvidenceBoundary';

export const ROUTING_PROVIDER_MODE = {
  DISABLED: 'disabled',
  GOOGLE_ROUTES_ESSENTIALS: 'google_routes_compute_routes_essentials',
};

export const ROUTING_PROVIDER_POLICY = Object.freeze({
  provider: 'google_routes',
  operation: 'compute_routes',
  skuClass: 'essentials',
  billingUnit: 'request_per_adjacent_leg',
  maxLegsPerCheck: 6,
  maxRoutesPerLeg: 1,
  maxAutomaticRetries: 0,
  maxChecksPerIpPerMinute: 3,
  computeAlternativeRoutes: false,
  useRouteMatrix: false,
  useTrafficAwareRouting: false,
  fieldMask: 'routes.duration,routes.distanceMeters',
  enabledProviderMode: ROUTING_PROVIDER_MODE.GOOGLE_ROUTES_ESSENTIALS,
});

export const ROUTING_POLICY_ERROR = {
  INVALID_BATCH: 'ROUTE_BATCH_INVALID',
  LEG_LIMIT_EXCEEDED: 'ROUTE_LEG_LIMIT_EXCEEDED',
  INVALID_LOCAL_TIME: 'ROUTE_LOCAL_TIME_INVALID',
  AMBIGUOUS_LOCAL_TIME: 'ROUTE_LOCAL_TIME_AMBIGUOUS',
};

const errorWithCode = code => new Error(code);

const isFiniteCoordinate = value =>
  typeof value === 'number' && Number.isFinite(value);

const isValidCoordinates = coordinates =>
  isFiniteCoordinate(coordinates?.lat) &&
  coordinates.lat >= -90 &&
  coordinates.lat <= 90 &&
  isFiniteCoordinate(coordinates?.lng) &&
  coordinates.lng >= -180 &&
  coordinates.lng <= 180;

const parseLocalDateTime = value => {
  const match =
    typeof value === 'string' &&
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)$/,
    );
  if (!match) return null;

  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: 0,
  };
  const calendarCheck = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day),
  );
  if (
    calendarCheck.getUTCFullYear() !== parts.year ||
    calendarCheck.getUTCMonth() !== parts.month - 1 ||
    calendarCheck.getUTCDate() !== parts.day
  ) {
    return null;
  }
  return parts;
};

const createZonedFormatter = timezone =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

const zonedParts = (instant, formatter) =>
  Object.fromEntries(
    formatter
      .formatToParts(instant)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, Number(part.value)]),
  );

const sameLocalMinute = (left, right) =>
  left.year === right.year &&
  left.month === right.month &&
  left.day === right.day &&
  left.hour === right.hour &&
  left.minute === right.minute &&
  left.second === right.second;

export function localDateTimeToInstant(localDateTime, timezone) {
  const target = parseLocalDateTime(localDateTime);
  if (!target || typeof timezone !== 'string' || timezone.trim() === '') {
    throw errorWithCode(ROUTING_POLICY_ERROR.INVALID_LOCAL_TIME);
  }

  let formatter;
  let initialZoned;
  try {
    formatter = createZonedFormatter(timezone.trim());
    initialZoned = zonedParts(
      new Date(
        Date.UTC(
          target.year,
          target.month - 1,
          target.day,
          target.hour,
          target.minute,
        ),
      ),
      formatter,
    );
  } catch (_) {
    throw errorWithCode(ROUTING_POLICY_ERROR.INVALID_LOCAL_TIME);
  }

  const targetAsUtc = Date.UTC(
    target.year,
    target.month - 1,
    target.day,
    target.hour,
    target.minute,
  );
  const initialWallAsUtc = Date.UTC(
    initialZoned.year,
    initialZoned.month - 1,
    initialZoned.day,
    initialZoned.hour,
    initialZoned.minute,
    initialZoned.second,
  );
  const approximateInstant =
    targetAsUtc - (initialWallAsUtc - targetAsUtc);

  const matches = [];
  for (let minuteOffset = -180; minuteOffset <= 180; minuteOffset += 1) {
    const candidate = new Date(
      approximateInstant + minuteOffset * 60 * 1000,
    );
    if (sameLocalMinute(zonedParts(candidate, formatter), target)) {
      matches.push(candidate);
    }
  }

  if (matches.length === 0) {
    throw errorWithCode(ROUTING_POLICY_ERROR.INVALID_LOCAL_TIME);
  }
  if (matches.length > 1) {
    throw errorWithCode(ROUTING_POLICY_ERROR.AMBIGUOUS_LOCAL_TIME);
  }
  return matches[0].toISOString();
}

const providerRequestFor = (request, context) => {
  if (
    !request ||
    typeof request.id !== 'string' ||
    request.id.trim() === '' ||
    request.travelMode !== context.travelMode ||
    request.timezone !== context.timezone ||
    !Object.values(ROUTE_TRAVEL_MODE).includes(request.travelMode) ||
    !isValidCoordinates(request.fromPlace?.coordinates) ||
    !isValidCoordinates(request.toPlace?.coordinates) ||
    typeof request.departureLocalDateTime !== 'string' ||
    !request.departureLocalDateTime.startsWith(`${context.date}T`)
  ) {
    throw errorWithCode(ROUTING_POLICY_ERROR.INVALID_BATCH);
  }

  const providerRequest = {
    id: request.id,
    origin: { ...request.fromPlace.coordinates },
    destination: { ...request.toPlace.coordinates },
    travelMode: request.travelMode,
  };

  if (
    request.travelMode === ROUTE_TRAVEL_MODE.TRANSIT &&
    request.arrivalTargetLocalDateTime != null
  ) {
    if (
      typeof request.arrivalTargetLocalDateTime !== 'string' ||
      !request.arrivalTargetLocalDateTime.startsWith(`${context.date}T`)
    ) {
      throw errorWithCode(ROUTING_POLICY_ERROR.INVALID_BATCH);
    }
    providerRequest.arrivalTime = localDateTimeToInstant(
      request.arrivalTargetLocalDateTime,
      context.timezone,
    );
  } else {
    providerRequest.departureTime = localDateTimeToInstant(
      request.departureLocalDateTime,
      context.timezone,
    );
  }

  return providerRequest;
};

export function createProviderRouteBatch({ context, requests } = {}) {
  if (
    !context ||
    typeof context.date !== 'string' ||
    typeof context.timezone !== 'string' ||
    !Object.values(ROUTE_TRAVEL_MODE).includes(context.travelMode) ||
    !Array.isArray(requests)
  ) {
    throw errorWithCode(ROUTING_POLICY_ERROR.INVALID_BATCH);
  }
  if (requests.length > ROUTING_PROVIDER_POLICY.maxLegsPerCheck) {
    throw errorWithCode(ROUTING_POLICY_ERROR.LEG_LIMIT_EXCEEDED);
  }

  const providerRequests = requests.map(request =>
    providerRequestFor(request, context),
  );
  if (new Set(providerRequests.map(request => request.id)).size !== requests.length) {
    throw errorWithCode(ROUTING_POLICY_ERROR.INVALID_BATCH);
  }

  return {
    schemaVersion: 1,
    providerMode: ROUTING_PROVIDER_POLICY.enabledProviderMode,
    requests: providerRequests,
    costEnvelope: {
      providerRequestCount: providerRequests.length,
      maximumProviderRequestCount:
        ROUTING_PROVIDER_POLICY.maxLegsPerCheck,
      billingUnit: ROUTING_PROVIDER_POLICY.billingUnit,
      automaticRetryCount: 0,
      alternativesPerLeg: 0,
      matrixElementCount: 0,
    },
  };
}

const routingProviderPolicy = {
  ROUTING_POLICY_ERROR,
  ROUTING_PROVIDER_MODE,
  ROUTING_PROVIDER_POLICY,
  createProviderRouteBatch,
  localDateTimeToInstant,
};

export default routingProviderPolicy;
