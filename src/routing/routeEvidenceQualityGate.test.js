import {
  ROUTE_QUALITY_PROBLEM,
  ROUTE_QUALITY_REFERENCE_CLASS,
  ROUTE_QUALITY_STATUS,
  assessRouteEvidenceQuality,
} from './routeEvidenceQualityGate';

const evaluatedAt = '2026-07-27T10:00:00Z';

const criteria = {
  approvedByProductOwner: true,
  approvedAt: '2026-07-27T09:00:00Z',
  maximumSampleAgeDays: 14,
  modes: {
    transit: {
      minimumSamples: 3,
      minimumAvailabilityRate: 2 / 3,
      maximumUnderstatementMinutes: 5,
      maximumCriticalUnderstatements: 0,
    },
  },
};

const sample = ({
  id,
  providerDurationMinutes = 25,
  referenceDurationMinutes = 27,
  providerRouteFound = true,
  anchorCritical = false,
  testedAt = '2026-07-26T12:00:00Z',
} = {}) => ({
  id,
  region: 'London',
  travelMode: 'transit',
  testedAt,
  providerRouteFound,
  providerDurationMinutes: providerRouteFound
    ? providerDurationMinutes
    : null,
  referenceDurationMinutes,
  referenceClass: ROUTE_QUALITY_REFERENCE_CLASS.OPERATOR_SCHEDULE,
  referenceSource: 'published operator journey evidence',
  anchorCritical,
});

test('cannot pass until the Product Owner has approved explicit criteria', () => {
  const result = assessRouteEvidenceQuality({
    samples: [],
    criteria: {
      ...criteria,
      approvedByProductOwner: false,
    },
    evaluatedAt,
  });

  expect(result).toEqual({
    status: ROUTE_QUALITY_STATUS.NOT_ASSESSED,
    criteriaApproved: false,
    evaluatedAt,
    assessments: [],
    problems: [
      {
        code: ROUTE_QUALITY_PROBLEM.CRITERIA_NOT_APPROVED,
        travelMode: null,
      },
    ],
  });

  const futureApproval = assessRouteEvidenceQuality({
    samples: [],
    criteria: {
      ...criteria,
      approvedAt: '2026-07-28T09:00:00Z',
    },
    evaluatedAt,
  });
  expect(futureApproval.status).toBe(
    ROUTE_QUALITY_STATUS.NOT_ASSESSED,
  );
  expect(futureApproval.criteriaApproved).toBe(false);
});

test('reports insufficient fresh evidence without silently lowering the sample requirement', () => {
  const result = assessRouteEvidenceQuality({
    samples: [
      sample({ id: 'fresh' }),
      sample({
        id: 'stale',
        testedAt: '2026-06-01T12:00:00Z',
      }),
    ],
    criteria,
    evaluatedAt,
  });

  expect(result.status).toBe(
    ROUTE_QUALITY_STATUS.INSUFFICIENT,
  );
  expect(result.assessments[0]).toEqual(
    expect.objectContaining({
      sampleCount: 1,
      routeFoundCount: 1,
    }),
  );
  expect(result.problems).toContainEqual({
    code: ROUTE_QUALITY_PROBLEM.INSUFFICIENT_SAMPLES,
    travelMode: 'transit',
    actual: 1,
    required: 3,
  });
});

test('fails when provider availability is below the approved threshold', () => {
  const result = assessRouteEvidenceQuality({
    samples: [
      sample({ id: 'found' }),
      sample({ id: 'missing-1', providerRouteFound: false }),
      sample({ id: 'missing-2', providerRouteFound: false }),
    ],
    criteria,
    evaluatedAt,
  });

  expect(result.status).toBe(ROUTE_QUALITY_STATUS.FAILED);
  expect(result.assessments[0].availabilityRate).toBe(1 / 3);
  expect(result.problems).toContainEqual({
    code: ROUTE_QUALITY_PROBLEM.AVAILABILITY_BELOW_THRESHOLD,
    travelMode: 'transit',
    actual: 1 / 3,
    required: 2 / 3,
  });
});

test('treats optimistic duration understatement as the safety risk', () => {
  const result = assessRouteEvidenceQuality({
    samples: [
      sample({
        id: 'critical-understatement',
        providerDurationMinutes: 20,
        referenceDurationMinutes: 32,
        anchorCritical: true,
      }),
      sample({ id: 'ordinary-1' }),
      sample({ id: 'ordinary-2' }),
    ],
    criteria,
    evaluatedAt,
  });

  expect(result.status).toBe(ROUTE_QUALITY_STATUS.FAILED);
  expect(result.assessments[0]).toEqual(
    expect.objectContaining({
      maximumUnderstatementMinutes: 12,
      criticalUnderstatementCount: 1,
    }),
  );
  expect(result.problems.map(item => item.code)).toEqual(
    expect.arrayContaining([
      ROUTE_QUALITY_PROBLEM.UNDERSTATEMENT_ABOVE_THRESHOLD,
      ROUTE_QUALITY_PROBLEM.CRITICAL_UNDERSTATEMENTS_EXCEEDED,
    ]),
  );
});

test('passes only when every approved mode threshold is satisfied', () => {
  const result = assessRouteEvidenceQuality({
    samples: [
      sample({ id: 'one', referenceDurationMinutes: 28 }),
      sample({ id: 'two', referenceDurationMinutes: 25 }),
      sample({
        id: 'three',
        providerRouteFound: false,
      }),
    ],
    criteria,
    evaluatedAt,
  });

  expect(result.status).toBe(ROUTE_QUALITY_STATUS.PASSED);
  expect(result.criteriaApproved).toBe(true);
  expect(result.problems).toEqual([]);
  expect(result.assessments[0]).toEqual(
    expect.objectContaining({
      sampleCount: 3,
      routeFoundCount: 2,
      availabilityRate: 2 / 3,
      maximumUnderstatementMinutes: 3,
      criticalUnderstatementCount: 0,
    }),
  );
});

test('rejects malformed, contradictory, duplicate, or future-dated evidence', () => {
  expect(() =>
    assessRouteEvidenceQuality({
      samples: [
        {
          ...sample({
            id: 'bad',
            providerRouteFound: false,
          }),
          providerDurationMinutes: 12,
        },
      ],
      criteria,
      evaluatedAt,
    }),
  ).toThrow('an unavailable provider route cannot have a duration');

  expect(() =>
    assessRouteEvidenceQuality({
      samples: [sample({ id: 'same' }), sample({ id: 'same' })],
      criteria,
      evaluatedAt,
    }),
  ).toThrow('route-quality sample ids must be unique');

  const futureOnly = assessRouteEvidenceQuality({
    samples: [
      sample({
        id: 'future',
        testedAt: '2026-07-28T12:00:00Z',
      }),
    ],
    criteria,
    evaluatedAt,
  });
  expect(futureOnly.status).toBe(
    ROUTE_QUALITY_STATUS.INSUFFICIENT,
  );
  expect(futureOnly.assessments[0].sampleCount).toBe(0);
});
