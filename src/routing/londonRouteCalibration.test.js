import { ROUTE_TRAVEL_MODE } from './routeEvidenceBoundary';
import { ROUTE_QUALITY_STATUS } from './routeEvidenceQualityGate';
import {
  LONDON_CALIBRATION_DAY_TYPE,
  LONDON_CALIBRATION_REGION,
  LONDON_CALIBRATION_TIME_BAND,
  LONDON_CALIBRATION_TIMEZONE,
  LONDON_ROUTE_CALIBRATION_SCENARIOS,
  PROPOSED_LONDON_PRIVATE_ALPHA_CRITERIA,
  PROPOSED_PRIVATE_ALPHA_QUOTA_INPUTS,
  ROUTE_QUALITY_REFERENCE_CLASS,
  assessLondonPrivateAlphaCalibration,
  calculatePrivateAlphaDailyRouteQuota,
  createApprovedLondonPrivateAlphaCriteria,
  createLondonCalibrationPlan,
  createLondonCalibrationSample,
} from './londonRouteCalibration';

const evaluatedAt = '2026-08-03T18:00:00Z';

test('defines 24 unique public-place scenarios split equally between walking and transit', () => {
  expect(LONDON_ROUTE_CALIBRATION_SCENARIOS).toHaveLength(24);
  expect(
    new Set(LONDON_ROUTE_CALIBRATION_SCENARIOS.map(item => item.id)).size,
  ).toBe(24);

  const counts = LONDON_ROUTE_CALIBRATION_SCENARIOS.reduce(
    (result, item) => ({
      ...result,
      [item.travelMode]: (result[item.travelMode] ?? 0) + 1,
    }),
    {},
  );
  expect(counts).toEqual({
    [ROUTE_TRAVEL_MODE.WALKING]: 12,
    [ROUTE_TRAVEL_MODE.TRANSIT]: 12,
  });

  LONDON_ROUTE_CALIBRATION_SCENARIOS.forEach(item => {
    expect(Object.isFrozen(item)).toBe(true);
    [item.from, item.to].forEach(place => {
      expect(Object.isFrozen(place)).toBe(true);
      expect(Object.isFrozen(place.coordinates)).toBe(true);
      expect(place.label).toEqual(expect.any(String));
      expect(place.coordinates.lat).toBeGreaterThan(51);
      expect(place.coordinates.lat).toBeLessThan(52);
      expect(place.coordinates.lng).toBeGreaterThan(-1);
      expect(place.coordinates.lng).toBeLessThan(1);
    });
  });
});

test('covers station, activity, hotel, weekend, peak, off-peak, and hard-anchor cases', () => {
  const journeyClasses = LONDON_ROUTE_CALIBRATION_SCENARIOS.map(
    item => item.journeyClass,
  );
  expect(journeyClasses.some(value => value.includes('station'))).toBe(true);
  expect(journeyClasses.some(value => value.includes('activity'))).toBe(true);
  expect(journeyClasses.some(value => value.includes('hotel'))).toBe(true);
  expect(journeyClasses.some(value => value.includes('fixed'))).toBe(true);

  const timeBands = new Set(
    LONDON_ROUTE_CALIBRATION_SCENARIOS.map(item => item.timeBand),
  );
  expect(timeBands).toEqual(
    new Set([
      LONDON_CALIBRATION_TIME_BAND.PEAK,
      LONDON_CALIBRATION_TIME_BAND.OFF_PEAK,
      LONDON_CALIBRATION_TIME_BAND.WEEKEND,
    ]),
  );
  expect(
    LONDON_ROUTE_CALIBRATION_SCENARIOS.filter(
      item => item.dayType === LONDON_CALIBRATION_DAY_TYPE.WEEKEND,
    ),
  ).toHaveLength(2);
  expect(
    LONDON_ROUTE_CALIBRATION_SCENARIOS.filter(
      item => item.anchorCritical,
    ).length,
  ).toBeGreaterThanOrEqual(6);
});

test('creates five bounded one-shot batches with exactly 24 maximum billable events', () => {
  const plan = createLondonCalibrationPlan({
    weekdayDate: '2026-08-03',
    weekendDate: '2026-08-08',
  });

  expect(plan).toEqual(
    expect.objectContaining({
      schemaVersion: 1,
      region: LONDON_CALIBRATION_REGION,
      timezone: LONDON_CALIBRATION_TIMEZONE,
      scenarioCount: 24,
      providerRequestCount: 24,
      maximumBillableEvents: 24,
      automaticRetryCount: 0,
    }),
  );
  expect(plan.batches).toHaveLength(5);
  expect(plan.batches.every(batch => batch.requests.length <= 6)).toBe(true);
  expect(
    plan.batches.reduce(
      (count, batch) => count + batch.requests.length,
      0,
    ),
  ).toBe(24);
  expect(
    plan.batches.every(
      batch =>
        batch.costEnvelope.automaticRetryCount === 0 &&
        batch.costEnvelope.alternativesPerLeg === 0 &&
        batch.costEnvelope.matrixElementCount === 0,
    ),
  ).toBe(true);
});

test('uses arrival targets only for anchor-critical transit scenarios that define them', () => {
  const plan = createLondonCalibrationPlan({
    weekdayDate: '2026-08-03',
    weekendDate: '2026-08-08',
  });
  const requests = plan.batches.flatMap(batch => batch.requests);
  const arrivalRequests = requests.filter(request => request.arrivalTime);

  expect(arrivalRequests.length).toBeGreaterThanOrEqual(4);
  expect(
    arrivalRequests.every(request => request.travelMode === 'transit'),
  ).toBe(true);
  expect(
    arrivalRequests.every(request => !request.departureTime),
  ).toBe(true);
});

test('rejects swapped, malformed, or missing weekday and weekend dates', () => {
  expect(() =>
    createLondonCalibrationPlan({
      weekdayDate: '2026-08-08',
      weekendDate: '2026-08-03',
    }),
  ).toThrow('weekdayDate must be a Monday-to-Friday date');
  expect(() =>
    createLondonCalibrationPlan({
      weekdayDate: '2026-08-03',
      weekendDate: 'not-a-date',
    }),
  ).toThrow('weekendDate must be a Saturday-or-Sunday date');
});

test('keeps proposed quality criteria visibly unapproved', () => {
  expect(PROPOSED_LONDON_PRIVATE_ALPHA_CRITERIA).toEqual({
    approvedByProductOwner: false,
    approvedAt: null,
    maximumSampleAgeDays: 7,
    modes: {
      walking: {
        minimumSamples: 12,
        minimumAvailabilityRate: 1,
        maximumUnderstatementMinutes: 5,
        maximumCriticalUnderstatements: 0,
      },
      transit: {
        minimumSamples: 12,
        minimumAvailabilityRate: 0.9,
        maximumUnderstatementMinutes: 10,
        maximumCriticalUnderstatements: 0,
      },
    },
  });

  const result = assessLondonPrivateAlphaCalibration({
    samples: [],
    evaluatedAt,
  });
  expect(result.status).toBe(ROUTE_QUALITY_STATUS.NOT_ASSESSED);
  expect(result.criteriaApproved).toBe(false);
});

test('requires explicit Product Owner approval to produce active criteria', () => {
  expect(() =>
    createApprovedLondonPrivateAlphaCriteria({
      approvedAt: '2026-08-03T17:00:00Z',
      approvedByProductOwner: false,
    }),
  ).toThrow('explicit Product Owner approval is required');

  const approved = createApprovedLondonPrivateAlphaCriteria({
    approvedAt: '2026-08-03T17:00:00Z',
    approvedByProductOwner: true,
  });
  expect(approved).toEqual({
    ...PROPOSED_LONDON_PRIVATE_ALPHA_CRITERIA,
    approvedByProductOwner: true,
    approvedAt: '2026-08-03T17:00:00Z',
    modes: {
      walking: { ...PROPOSED_LONDON_PRIVATE_ALPHA_CRITERIA.modes.walking },
      transit: { ...PROPOSED_LONDON_PRIVATE_ALPHA_CRITERIA.modes.transit },
    },
  });
});

test('creates a quality sample only from a named scenario and copies its safety classification', () => {
  const sample = createLondonCalibrationSample({
    scenarioId: 'transit-victoria-national-theatre',
    testedAt: '2026-08-03T17:15:00Z',
    providerRouteFound: true,
    providerDurationMinutes: 31,
    referenceDurationMinutes: 35,
    referenceClass: ROUTE_QUALITY_REFERENCE_CLASS.OPERATOR_SCHEDULE,
    referenceSource: 'published operator timetable checked by reviewer',
  });

  expect(sample).toEqual({
    id: 'transit-victoria-national-theatre',
    region: LONDON_CALIBRATION_REGION,
    travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
    testedAt: '2026-08-03T17:15:00Z',
    providerRouteFound: true,
    providerDurationMinutes: 31,
    referenceDurationMinutes: 35,
    referenceClass: ROUTE_QUALITY_REFERENCE_CLASS.OPERATOR_SCHEDULE,
    referenceSource: 'published operator timetable checked by reviewer',
    anchorCritical: true,
  });

  expect(() =>
    createLondonCalibrationSample({
      scenarioId: 'invented-private-location',
    }),
  ).toThrow('scenarioId must name a London calibration scenario');
});

test('refuses substituted scenario metadata before quality assessment', () => {
  const sample = createLondonCalibrationSample({
    scenarioId: 'walk-euston-british-museum',
    testedAt: '2026-08-03T10:00:00Z',
    providerRouteFound: true,
    providerDurationMinutes: 15,
    referenceDurationMinutes: 16,
    referenceClass:
      ROUTE_QUALITY_REFERENCE_CLASS.INDEPENDENT_ROUTE_REVIEW,
    referenceSource: 'documented independent review',
  });

  expect(() =>
    assessLondonPrivateAlphaCalibration({
      samples: [{ ...sample, travelMode: ROUTE_TRAVEL_MODE.DRIVING }],
      evaluatedAt,
    }),
  ).toThrow('sample must match a defined London calibration scenario');
});

test('can pass only after explicit criteria approval and one valid result for every scenario', () => {
  const criteria = createApprovedLondonPrivateAlphaCriteria({
    approvedAt: '2026-08-03T08:00:00Z',
    approvedByProductOwner: true,
  });
  const samples = LONDON_ROUTE_CALIBRATION_SCENARIOS.map(item =>
    createLondonCalibrationSample({
      scenarioId: item.id,
      testedAt: '2026-08-03T12:00:00Z',
      providerRouteFound: true,
      providerDurationMinutes: 20,
      referenceDurationMinutes:
        item.travelMode === ROUTE_TRAVEL_MODE.WALKING ? 24 : 29,
      referenceClass:
        item.travelMode === ROUTE_TRAVEL_MODE.TRANSIT
          ? ROUTE_QUALITY_REFERENCE_CLASS.OPERATOR_SCHEDULE
          : ROUTE_QUALITY_REFERENCE_CLASS.INDEPENDENT_ROUTE_REVIEW,
      referenceSource: 'bounded public-place calibration reference',
    }),
  );

  const result = assessLondonPrivateAlphaCalibration({
    samples,
    criteria,
    evaluatedAt,
  });
  expect(result.status).toBe(ROUTE_QUALITY_STATUS.PASSED);
  expect(result.assessments).toEqual([
    expect.objectContaining({
      travelMode: ROUTE_TRAVEL_MODE.WALKING,
      sampleCount: 12,
    }),
    expect.objectContaining({
      travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
      sampleCount: 12,
    }),
  ]);
});

test('calculates the proposed hard daily quota from the maximum six-leg envelope', () => {
  expect(PROPOSED_PRIVATE_ALPHA_QUOTA_INPUTS).toEqual({
    approvedByProductOwner: false,
    invitedTesters: 10,
    checksPerTesterPerDay: 2,
    headroomPercent: 25,
  });

  expect(
    calculatePrivateAlphaDailyRouteQuota(
      PROPOSED_PRIVATE_ALPHA_QUOTA_INPUTS,
    ),
  ).toEqual({
    approvedByProductOwner: false,
    invitedTesters: 10,
    checksPerTesterPerDay: 2,
    maximumLegsPerCheck: 6,
    headroomPercent: 25,
    baseDailyProviderRequests: 120,
    headroomProviderRequests: 30,
    proposedHardDailyQuota: 150,
  });
});

test('rounds quota headroom upward and rejects unbounded assumptions', () => {
  expect(
    calculatePrivateAlphaDailyRouteQuota({
      invitedTesters: 1,
      checksPerTesterPerDay: 1,
      headroomPercent: 10,
      approvedByProductOwner: true,
    }),
  ).toEqual(
    expect.objectContaining({
      approvedByProductOwner: true,
      baseDailyProviderRequests: 6,
      headroomProviderRequests: 1,
      proposedHardDailyQuota: 7,
    }),
  );

  [
    { invitedTesters: 0, checksPerTesterPerDay: 1, headroomPercent: 10 },
    { invitedTesters: 1, checksPerTesterPerDay: 0, headroomPercent: 10 },
    { invitedTesters: 1, checksPerTesterPerDay: 1, headroomPercent: 101 },
  ].forEach(inputs => {
    expect(() =>
      calculatePrivateAlphaDailyRouteQuota(inputs),
    ).toThrow('quota inputs are invalid');
  });
});

test('contains no network client, credential, environment, or activation surface', () => {
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(
    path.join(__dirname, 'londonRouteCalibration.js'),
    'utf8',
  );

  expect(source).not.toContain('fetch(');
  expect(source).not.toContain('GOOGLE_ROUTES_API_KEY');
  expect(source).not.toContain('process.env');
  expect(source).not.toContain('resolveGoogleRouteEvidence');
  expect(source).not.toContain('DAYGUIDE_ROUTES_PROVIDER_MODE=');
});
