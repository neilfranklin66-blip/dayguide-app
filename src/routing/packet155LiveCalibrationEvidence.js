import {
  ROUTE_QUALITY_REFERENCE_CLASS,
  assessLondonPrivateAlphaCalibration,
  createApprovedLondonPrivateAlphaCriteria,
  createLondonCalibrationSample,
} from './londonRouteCalibration';

export const PACKET155_LIVE_EVIDENCE_OBSERVED_AT =
  '2026-07-27T14:29:00Z';
export const PACKET155_LIVE_EVIDENCE_EVALUATED_AT =
  '2026-07-27T14:30:00Z';

const evidence = [
  ['walk-euston-british-museum', 22, 1547, 22],
  ['walk-british-museum-royal-opera', 12, 837, 15],
  ['walk-waterloo-southbank', 5, 313, 10],
  ['walk-southbank-tate-modern', 19, 1390, 18],
  ['walk-tate-globe', 6, 378, 5],
  ['walk-globe-london-bridge', 16, 1101, 16],
  ['walk-london-bridge-tower', 22, 1533, 20],
  ['walk-southwark-station-hotel', 8, 491, 8],
  ['walk-national-gallery-victoria', 31, 2177, 38],
  ['walk-st-pancras-british-library', 8, 538, 8],
  ['walk-barbican-st-pauls', 16, 1085, 17],
  ['walk-natural-history-v-and-a', 5, 362, 16],
  ['transit-euston-southwark', 20, 4341, 31],
  ['transit-st-pancras-london-bridge', 21, 5809, 31],
  ['transit-victoria-national-theatre', 22, 3116, 26],
  ['transit-london-bridge-royal-opera', 34, 3482, 29],
  ['transit-natural-history-barbican', 48, 10370, 53],
  ['transit-tower-euston', 32, 6630, 39],
  ['transit-euston-southwark-hotel', 28, 6839, 37],
  ['transit-british-museum-natural-history', 32, 5746, 48],
  ['transit-waterloo-barbican', 40, 4680, 32],
  ['transit-national-gallery-tower', 28, 4568, 35],
  ['transit-st-pancras-national-theatre-weekend', 26, 3649, 28],
  ['transit-victoria-tate-weekend', 23, 4471, 32],
];

export const PACKET155_LIVE_ROUTE_EVIDENCE = Object.freeze(
  evidence.map(
    ([
      scenarioId,
      providerDurationMinutes,
      providerDistanceMetres,
      referenceDurationMinutes,
    ]) =>
      Object.freeze({
        scenarioId,
        providerRouteFound: true,
        providerDurationMinutes,
        providerDistanceMetres,
        referenceDurationMinutes,
        referenceSource: 'Transport for London Journey Planner API',
      }),
  ),
);

export function createPacket155LiveAssessment() {
  const samples = PACKET155_LIVE_ROUTE_EVIDENCE.map(item =>
    createLondonCalibrationSample({
      scenarioId: item.scenarioId,
      testedAt: PACKET155_LIVE_EVIDENCE_OBSERVED_AT,
      providerRouteFound: item.providerRouteFound,
      providerDurationMinutes: item.providerDurationMinutes,
      referenceDurationMinutes: item.referenceDurationMinutes,
      referenceClass: item.scenarioId.startsWith('walk-')
        ? ROUTE_QUALITY_REFERENCE_CLASS.INDEPENDENT_ROUTE_REVIEW
        : ROUTE_QUALITY_REFERENCE_CLASS.OPERATOR_SCHEDULE,
      referenceSource: item.referenceSource,
    }),
  );
  const criteria = createApprovedLondonPrivateAlphaCriteria({
    approvedAt: '2026-07-27T09:54:09Z',
    approvedByProductOwner: true,
  });

  return assessLondonPrivateAlphaCalibration({
    samples,
    criteria,
    evaluatedAt: PACKET155_LIVE_EVIDENCE_EVALUATED_AT,
  });
}
