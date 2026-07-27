import { ROUTE_TRAVEL_MODE } from './routeEvidenceBoundary';
import {
  ROUTE_QUALITY_REFERENCE_CLASS,
  assessRouteEvidenceQuality,
} from './routeEvidenceQualityGate';
import {
  ROUTING_PROVIDER_POLICY,
  createProviderRouteBatch,
} from './routingProviderPolicy';

export const LONDON_CALIBRATION_REGION = 'London, UK';
export const LONDON_CALIBRATION_TIMEZONE = 'Europe/London';

export const LONDON_CALIBRATION_DAY_TYPE = {
  WEEKDAY: 'weekday',
  WEEKEND: 'weekend',
};

export const LONDON_CALIBRATION_TIME_BAND = {
  PEAK: 'weekday_peak',
  OFF_PEAK: 'weekday_off_peak',
  WEEKEND: 'weekend_daytime',
};

export const PROPOSED_LONDON_PRIVATE_ALPHA_CRITERIA = Object.freeze({
  approvedByProductOwner: false,
  approvedAt: null,
  maximumSampleAgeDays: 7,
  modes: Object.freeze({
    [ROUTE_TRAVEL_MODE.WALKING]: Object.freeze({
      minimumSamples: 12,
      minimumAvailabilityRate: 1,
      maximumUnderstatementMinutes: 5,
      maximumCriticalUnderstatements: 0,
    }),
    [ROUTE_TRAVEL_MODE.TRANSIT]: Object.freeze({
      minimumSamples: 12,
      minimumAvailabilityRate: 0.9,
      maximumUnderstatementMinutes: 10,
      maximumCriticalUnderstatements: 0,
    }),
  }),
});

export const PROPOSED_PRIVATE_ALPHA_QUOTA_INPUTS = Object.freeze({
  approvedByProductOwner: false,
  invitedTesters: 10,
  checksPerTesterPerDay: 2,
  headroomPercent: 25,
});

const PLACE = Object.freeze({
  BARBICAN_CENTRE: {
    label: 'Barbican Centre',
    coordinates: { lat: 51.5202, lng: -0.0936 },
  },
  BRITISH_LIBRARY: {
    label: 'British Library',
    coordinates: { lat: 51.5299, lng: -0.1276 },
  },
  BRITISH_MUSEUM: {
    label: 'British Museum',
    coordinates: { lat: 51.5194, lng: -0.127 },
  },
  EUSTON_STATION: {
    label: 'London Euston station',
    coordinates: { lat: 51.5282, lng: -0.1337 },
  },
  GLOBE: {
    label: "Shakespeare's Globe",
    coordinates: { lat: 51.5081, lng: -0.0972 },
  },
  LONDON_BRIDGE_STATION: {
    label: 'London Bridge station',
    coordinates: { lat: 51.5055, lng: -0.0865 },
  },
  NATIONAL_GALLERY: {
    label: 'National Gallery',
    coordinates: { lat: 51.5089, lng: -0.1283 },
  },
  NATIONAL_THEATRE: {
    label: 'National Theatre',
    coordinates: { lat: 51.5071, lng: -0.1141 },
  },
  NATURAL_HISTORY_MUSEUM: {
    label: 'Natural History Museum',
    coordinates: { lat: 51.4967, lng: -0.1764 },
  },
  ROYAL_OPERA_HOUSE: {
    label: 'Royal Opera House',
    coordinates: { lat: 51.513, lng: -0.122 },
  },
  SOUTHWARK_HOTEL: {
    label: 'Premier Inn London Southwark (Tate Modern)',
    coordinates: { lat: 51.505, lng: -0.1006 },
  },
  SOUTHWARK_STATION: {
    label: 'Southwark Underground station',
    coordinates: { lat: 51.5037, lng: -0.1052 },
  },
  ST_PANCRAS: {
    label: 'St Pancras International',
    coordinates: { lat: 51.5317, lng: -0.1262 },
  },
  ST_PAULS: {
    label: "St Paul's Cathedral",
    coordinates: { lat: 51.5138, lng: -0.0984 },
  },
  SOUTHBANK_CENTRE: {
    label: 'Southbank Centre',
    coordinates: { lat: 51.5055, lng: -0.116 },
  },
  TATE_MODERN: {
    label: 'Tate Modern',
    coordinates: { lat: 51.5076, lng: -0.0994 },
  },
  TOWER_OF_LONDON: {
    label: 'Tower of London',
    coordinates: { lat: 51.5081, lng: -0.0759 },
  },
  V_AND_A: {
    label: 'Victoria and Albert Museum',
    coordinates: { lat: 51.4966, lng: -0.1722 },
  },
  VICTORIA_STATION: {
    label: 'London Victoria station',
    coordinates: { lat: 51.4952, lng: -0.1441 },
  },
  WATERLOO_STATION: {
    label: 'London Waterloo station',
    coordinates: { lat: 51.5033, lng: -0.1147 },
  },
});

Object.values(PLACE).forEach(place => {
  Object.freeze(place.coordinates);
  Object.freeze(place);
});

const scenario = ({
  id,
  travelMode,
  from,
  to,
  dayType = LONDON_CALIBRATION_DAY_TYPE.WEEKDAY,
  timeBand,
  departureTime,
  arrivalTargetTime = null,
  anchorCritical = false,
  journeyClass,
}) => Object.freeze({
  id,
  travelMode,
  from,
  to,
  dayType,
  timeBand,
  departureTime,
  arrivalTargetTime,
  anchorCritical,
  journeyClass,
});

export const LONDON_ROUTE_CALIBRATION_SCENARIOS = Object.freeze([
  scenario({
    id: 'walk-euston-british-museum',
    travelMode: ROUTE_TRAVEL_MODE.WALKING,
    from: PLACE.EUSTON_STATION,
    to: PLACE.BRITISH_MUSEUM,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '10:00',
    journeyClass: 'arrival_station_to_activity',
  }),
  scenario({
    id: 'walk-british-museum-royal-opera',
    travelMode: ROUTE_TRAVEL_MODE.WALKING,
    from: PLACE.BRITISH_MUSEUM,
    to: PLACE.ROYAL_OPERA_HOUSE,
    timeBand: LONDON_CALIBRATION_TIME_BAND.PEAK,
    departureTime: '17:30',
    anchorCritical: true,
    journeyClass: 'activity_to_fixed_venue',
  }),
  scenario({
    id: 'walk-waterloo-southbank',
    travelMode: ROUTE_TRAVEL_MODE.WALKING,
    from: PLACE.WATERLOO_STATION,
    to: PLACE.SOUTHBANK_CENTRE,
    timeBand: LONDON_CALIBRATION_TIME_BAND.PEAK,
    departureTime: '17:15',
    anchorCritical: true,
    journeyClass: 'arrival_station_to_fixed_venue',
  }),
  scenario({
    id: 'walk-southbank-tate-modern',
    travelMode: ROUTE_TRAVEL_MODE.WALKING,
    from: PLACE.SOUTHBANK_CENTRE,
    to: PLACE.TATE_MODERN,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '14:00',
    journeyClass: 'activity_to_activity',
  }),
  scenario({
    id: 'walk-tate-globe',
    travelMode: ROUTE_TRAVEL_MODE.WALKING,
    from: PLACE.TATE_MODERN,
    to: PLACE.GLOBE,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '15:00',
    journeyClass: 'short_activity_to_activity',
  }),
  scenario({
    id: 'walk-globe-london-bridge',
    travelMode: ROUTE_TRAVEL_MODE.WALKING,
    from: PLACE.GLOBE,
    to: PLACE.LONDON_BRIDGE_STATION,
    timeBand: LONDON_CALIBRATION_TIME_BAND.PEAK,
    departureTime: '17:45',
    anchorCritical: true,
    journeyClass: 'activity_to_departure_station',
  }),
  scenario({
    id: 'walk-london-bridge-tower',
    travelMode: ROUTE_TRAVEL_MODE.WALKING,
    from: PLACE.LONDON_BRIDGE_STATION,
    to: PLACE.TOWER_OF_LONDON,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '11:00',
    journeyClass: 'arrival_station_to_activity',
  }),
  scenario({
    id: 'walk-southwark-station-hotel',
    travelMode: ROUTE_TRAVEL_MODE.WALKING,
    from: PLACE.SOUTHWARK_STATION,
    to: PLACE.SOUTHWARK_HOTEL,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '16:00',
    journeyClass: 'station_to_destination_hotel',
  }),
  scenario({
    id: 'walk-national-gallery-victoria',
    travelMode: ROUTE_TRAVEL_MODE.WALKING,
    from: PLACE.NATIONAL_GALLERY,
    to: PLACE.VICTORIA_STATION,
    timeBand: LONDON_CALIBRATION_TIME_BAND.PEAK,
    departureTime: '17:00',
    anchorCritical: true,
    journeyClass: 'activity_to_departure_station',
  }),
  scenario({
    id: 'walk-st-pancras-british-library',
    travelMode: ROUTE_TRAVEL_MODE.WALKING,
    from: PLACE.ST_PANCRAS,
    to: PLACE.BRITISH_LIBRARY,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '10:30',
    journeyClass: 'short_station_to_activity',
  }),
  scenario({
    id: 'walk-barbican-st-pauls',
    travelMode: ROUTE_TRAVEL_MODE.WALKING,
    from: PLACE.BARBICAN_CENTRE,
    to: PLACE.ST_PAULS,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '13:30',
    journeyClass: 'activity_to_activity',
  }),
  scenario({
    id: 'walk-natural-history-v-and-a',
    travelMode: ROUTE_TRAVEL_MODE.WALKING,
    from: PLACE.NATURAL_HISTORY_MUSEUM,
    to: PLACE.V_AND_A,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '12:30',
    journeyClass: 'short_activity_to_activity',
  }),
  scenario({
    id: 'transit-euston-southwark',
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    from: PLACE.EUSTON_STATION,
    to: PLACE.SOUTHWARK_STATION,
    timeBand: LONDON_CALIBRATION_TIME_BAND.PEAK,
    departureTime: '08:15',
    journeyClass: 'arrival_station_to_district',
  }),
  scenario({
    id: 'transit-st-pancras-london-bridge',
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    from: PLACE.ST_PANCRAS,
    to: PLACE.LONDON_BRIDGE_STATION,
    timeBand: LONDON_CALIBRATION_TIME_BAND.PEAK,
    departureTime: '08:30',
    journeyClass: 'station_to_station',
  }),
  scenario({
    id: 'transit-victoria-national-theatre',
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    from: PLACE.VICTORIA_STATION,
    to: PLACE.NATIONAL_THEATRE,
    timeBand: LONDON_CALIBRATION_TIME_BAND.PEAK,
    departureTime: '17:15',
    arrivalTargetTime: '18:15',
    anchorCritical: true,
    journeyClass: 'arrival_station_to_fixed_venue',
  }),
  scenario({
    id: 'transit-london-bridge-royal-opera',
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    from: PLACE.LONDON_BRIDGE_STATION,
    to: PLACE.ROYAL_OPERA_HOUSE,
    timeBand: LONDON_CALIBRATION_TIME_BAND.PEAK,
    departureTime: '17:30',
    arrivalTargetTime: '18:30',
    anchorCritical: true,
    journeyClass: 'station_to_fixed_venue',
  }),
  scenario({
    id: 'transit-natural-history-barbican',
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    from: PLACE.NATURAL_HISTORY_MUSEUM,
    to: PLACE.BARBICAN_CENTRE,
    timeBand: LONDON_CALIBRATION_TIME_BAND.PEAK,
    departureTime: '17:00',
    arrivalTargetTime: '18:30',
    anchorCritical: true,
    journeyClass: 'activity_to_fixed_venue',
  }),
  scenario({
    id: 'transit-tower-euston',
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    from: PLACE.TOWER_OF_LONDON,
    to: PLACE.EUSTON_STATION,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '13:00',
    journeyClass: 'activity_to_departure_station',
  }),
  scenario({
    id: 'transit-euston-southwark-hotel',
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    from: PLACE.EUSTON_STATION,
    to: PLACE.SOUTHWARK_HOTEL,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '11:00',
    journeyClass: 'arrival_station_to_destination_hotel',
  }),
  scenario({
    id: 'transit-british-museum-natural-history',
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    from: PLACE.BRITISH_MUSEUM,
    to: PLACE.NATURAL_HISTORY_MUSEUM,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '14:00',
    journeyClass: 'activity_to_activity',
  }),
  scenario({
    id: 'transit-waterloo-barbican',
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    from: PLACE.WATERLOO_STATION,
    to: PLACE.BARBICAN_CENTRE,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '12:00',
    journeyClass: 'station_to_activity',
  }),
  scenario({
    id: 'transit-national-gallery-tower',
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    from: PLACE.NATIONAL_GALLERY,
    to: PLACE.TOWER_OF_LONDON,
    timeBand: LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
    departureTime: '15:00',
    journeyClass: 'activity_to_activity',
  }),
  scenario({
    id: 'transit-st-pancras-national-theatre-weekend',
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    from: PLACE.ST_PANCRAS,
    to: PLACE.NATIONAL_THEATRE,
    dayType: LONDON_CALIBRATION_DAY_TYPE.WEEKEND,
    timeBand: LONDON_CALIBRATION_TIME_BAND.WEEKEND,
    departureTime: '11:00',
    journeyClass: 'weekend_station_to_activity',
  }),
  scenario({
    id: 'transit-victoria-tate-weekend',
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    from: PLACE.VICTORIA_STATION,
    to: PLACE.TATE_MODERN,
    dayType: LONDON_CALIBRATION_DAY_TYPE.WEEKEND,
    timeBand: LONDON_CALIBRATION_TIME_BAND.WEEKEND,
    departureTime: '17:00',
    arrivalTargetTime: '18:00',
    anchorCritical: true,
    journeyClass: 'weekend_station_to_fixed_activity',
  }),
]);

const isCalendarDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
};

const dateDayType = date => {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  return day === 0 || day === 6
    ? LONDON_CALIBRATION_DAY_TYPE.WEEKEND
    : LONDON_CALIBRATION_DAY_TYPE.WEEKDAY;
};

const placeForRequest = (scenarioId, role, place) => ({
  id: `${scenarioId}-${role}`,
  label: place.label,
  provider: 'public_calibration_fixture',
  providerPlaceId: null,
  coordinates: { ...place.coordinates },
});

const requestForScenario = (item, date) => ({
  id: item.id,
  fromPointId: `${item.id}-from`,
  toPointId: `${item.id}-to`,
  fromPlace: placeForRequest(item.id, 'from', item.from),
  toPlace: placeForRequest(item.id, 'to', item.to),
  travelMode: item.travelMode,
  departureLocalDateTime: `${date}T${item.departureTime}`,
  arrivalTargetLocalDateTime: item.arrivalTargetTime
    ? `${date}T${item.arrivalTargetTime}`
    : null,
  timezone: LONDON_CALIBRATION_TIMEZONE,
});

const groupIntoBatches = (items, size) => {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
};

export function createLondonCalibrationPlan({
  weekdayDate,
  weekendDate,
} = {}) {
  if (
    !isCalendarDate(weekdayDate) ||
    dateDayType(weekdayDate) !== LONDON_CALIBRATION_DAY_TYPE.WEEKDAY
  ) {
    throw new TypeError('weekdayDate must be a Monday-to-Friday date');
  }
  if (
    !isCalendarDate(weekendDate) ||
    dateDayType(weekendDate) !== LONDON_CALIBRATION_DAY_TYPE.WEEKEND
  ) {
    throw new TypeError('weekendDate must be a Saturday-or-Sunday date');
  }

  const grouped = new Map();
  LONDON_ROUTE_CALIBRATION_SCENARIOS.forEach(item => {
    const date =
      item.dayType === LONDON_CALIBRATION_DAY_TYPE.WEEKEND
        ? weekendDate
        : weekdayDate;
    const key = `${date}|${item.travelMode}`;
    const existing = grouped.get(key) ?? {
      date,
      travelMode: item.travelMode,
      requests: [],
    };
    existing.requests.push(requestForScenario(item, date));
    grouped.set(key, existing);
  });

  const batches = [...grouped.values()].flatMap(group =>
    groupIntoBatches(
      group.requests,
      ROUTING_PROVIDER_POLICY.maxLegsPerCheck,
    ).map(requests =>
      createProviderRouteBatch({
        context: {
          date: group.date,
          timezone: LONDON_CALIBRATION_TIMEZONE,
          travelMode: group.travelMode,
        },
        requests,
      }),
    ),
  );
  const providerRequestCount = batches.reduce(
    (total, batch) => total + batch.requests.length,
    0,
  );

  return {
    schemaVersion: 1,
    region: LONDON_CALIBRATION_REGION,
    timezone: LONDON_CALIBRATION_TIMEZONE,
    weekdayDate,
    weekendDate,
    scenarioCount: LONDON_ROUTE_CALIBRATION_SCENARIOS.length,
    providerRequestCount,
    maximumBillableEvents: providerRequestCount,
    automaticRetryCount: 0,
    batches,
  };
}

export function createLondonCalibrationSample({
  scenarioId,
  testedAt,
  providerRouteFound,
  providerDurationMinutes = null,
  referenceDurationMinutes,
  referenceClass,
  referenceSource,
} = {}) {
  const item = LONDON_ROUTE_CALIBRATION_SCENARIOS.find(
    candidate => candidate.id === scenarioId,
  );
  if (!item) {
    throw new TypeError('scenarioId must name a London calibration scenario');
  }
  return {
    id: item.id,
    region: LONDON_CALIBRATION_REGION,
    travelMode: item.travelMode,
    testedAt,
    providerRouteFound,
    providerDurationMinutes,
    referenceDurationMinutes,
    referenceClass,
    referenceSource,
    anchorCritical: item.anchorCritical,
  };
}

export function createApprovedLondonPrivateAlphaCriteria({
  approvedAt,
  approvedByProductOwner,
} = {}) {
  if (approvedByProductOwner !== true) {
    throw new TypeError('explicit Product Owner approval is required');
  }
  return {
    ...PROPOSED_LONDON_PRIVATE_ALPHA_CRITERIA,
    approvedByProductOwner: true,
    approvedAt,
    modes: {
      [ROUTE_TRAVEL_MODE.WALKING]: {
        ...PROPOSED_LONDON_PRIVATE_ALPHA_CRITERIA.modes.walking,
      },
      [ROUTE_TRAVEL_MODE.TRANSIT]: {
        ...PROPOSED_LONDON_PRIVATE_ALPHA_CRITERIA.modes.transit,
      },
    },
  };
}

export function assessLondonPrivateAlphaCalibration({
  samples = [],
  criteria = PROPOSED_LONDON_PRIVATE_ALPHA_CRITERIA,
  evaluatedAt,
} = {}) {
  if (!Array.isArray(samples)) {
    throw new TypeError('samples must be an array');
  }
  const scenariosById = new Map(
    LONDON_ROUTE_CALIBRATION_SCENARIOS.map(item => [item.id, item]),
  );
  samples.forEach(sample => {
    const item = scenariosById.get(sample?.id);
    if (
      !item ||
      sample.region !== LONDON_CALIBRATION_REGION ||
      sample.travelMode !== item.travelMode ||
      sample.anchorCritical !== item.anchorCritical
    ) {
      throw new TypeError(
        'sample must match a defined London calibration scenario',
      );
    }
  });

  return assessRouteEvidenceQuality({
    samples,
    criteria,
    evaluatedAt,
  });
}

const isPositiveWholeNumber = value =>
  Number.isInteger(value) && value > 0;

export function calculatePrivateAlphaDailyRouteQuota({
  invitedTesters,
  checksPerTesterPerDay,
  headroomPercent,
  approvedByProductOwner = false,
} = {}) {
  if (
    !isPositiveWholeNumber(invitedTesters) ||
    !isPositiveWholeNumber(checksPerTesterPerDay) ||
    typeof headroomPercent !== 'number' ||
    !Number.isFinite(headroomPercent) ||
    headroomPercent < 0 ||
    headroomPercent > 100
  ) {
    throw new TypeError('quota inputs are invalid');
  }
  const baseDailyProviderRequests =
    invitedTesters *
    checksPerTesterPerDay *
    ROUTING_PROVIDER_POLICY.maxLegsPerCheck;
  const headroomProviderRequests = Math.ceil(
    baseDailyProviderRequests * (headroomPercent / 100),
  );

  return {
    approvedByProductOwner: approvedByProductOwner === true,
    invitedTesters,
    checksPerTesterPerDay,
    maximumLegsPerCheck: ROUTING_PROVIDER_POLICY.maxLegsPerCheck,
    headroomPercent,
    baseDailyProviderRequests,
    headroomProviderRequests,
    proposedHardDailyQuota:
      baseDailyProviderRequests + headroomProviderRequests,
  };
}

export {
  ROUTE_QUALITY_REFERENCE_CLASS,
};

const londonRouteCalibration = {
  LONDON_CALIBRATION_DAY_TYPE,
  LONDON_CALIBRATION_REGION,
  LONDON_CALIBRATION_TIMEZONE,
  LONDON_ROUTE_CALIBRATION_SCENARIOS,
  PROPOSED_LONDON_PRIVATE_ALPHA_CRITERIA,
  PROPOSED_PRIVATE_ALPHA_QUOTA_INPUTS,
  assessLondonPrivateAlphaCalibration,
  calculatePrivateAlphaDailyRouteQuota,
  createApprovedLondonPrivateAlphaCriteria,
  createLondonCalibrationPlan,
  createLondonCalibrationSample,
};

export default londonRouteCalibration;
