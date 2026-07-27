import {
  ROUTE_QUALITY_PROBLEM,
  ROUTE_QUALITY_STATUS,
} from './routeEvidenceQualityGate';
import {
  PACKET155_LIVE_ROUTE_EVIDENCE,
  createPacket155LiveAssessment,
} from './packet155LiveCalibrationEvidence';

test('records exactly one successful provider event for every Packet 155 scenario', () => {
  expect(PACKET155_LIVE_ROUTE_EVIDENCE).toHaveLength(24);
  expect(
    new Set(PACKET155_LIVE_ROUTE_EVIDENCE.map(item => item.scenarioId))
      .size,
  ).toBe(24);
  expect(
    PACKET155_LIVE_ROUTE_EVIDENCE.every(
      item => item.providerRouteFound === true,
    ),
  ).toBe(true);
});

test('fails both modes against the approved Packet 155 safety thresholds', () => {
  const result = createPacket155LiveAssessment();

  expect(result.status).toBe(ROUTE_QUALITY_STATUS.FAILED);
  expect(result.criteriaApproved).toBe(true);
  expect(result.assessments).toEqual([
    {
      travelMode: 'walking',
      sampleCount: 12,
      routeFoundCount: 12,
      availabilityRate: 1,
      maximumUnderstatementMinutes: 11,
      criticalUnderstatementCount: 1,
      problems: [
        {
          code: ROUTE_QUALITY_PROBLEM.UNDERSTATEMENT_ABOVE_THRESHOLD,
          travelMode: 'walking',
          actual: 11,
          permitted: 5,
        },
        {
          code:
            ROUTE_QUALITY_PROBLEM.CRITICAL_UNDERSTATEMENTS_EXCEEDED,
          travelMode: 'walking',
          actual: 1,
          permitted: 0,
        },
      ],
    },
    {
      travelMode: 'transit',
      sampleCount: 12,
      routeFoundCount: 12,
      availabilityRate: 1,
      maximumUnderstatementMinutes: 16,
      criticalUnderstatementCount: 0,
      problems: [
        {
          code: ROUTE_QUALITY_PROBLEM.UNDERSTATEMENT_ABOVE_THRESHOLD,
          travelMode: 'transit',
          actual: 16,
          permitted: 10,
        },
      ],
    },
  ]);
});

