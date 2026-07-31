import { ROUTE_TRAVEL_MODE } from './routeEvidenceBoundary';
import {
  PROPOSED_PRIVATE_ALPHA_QUOTA_INPUTS,
  calculatePrivateAlphaDailyRouteQuota,
  createLondonCalibrationPlan,
} from './londonRouteCalibration';

// This approval is limited to a closed evidence exercise.  It is not a
// user-facing routing, feasibility, premium, or production activation.
export const PACKET166_APPROVAL = Object.freeze({
  packet: 166,
  approvedByProductOwner: true,
  approvedAt: '2026-07-31T00:00:00+01:00',
  approvalInstruction:
    'Authorise Packet 166 external trial setup and bounded Google Routes calls under the Packet 165 limits.',
  region: 'London, UK',
  modes: Object.freeze([
    ROUTE_TRAVEL_MODE.WALKING,
    ROUTE_TRAVEL_MODE.TRANSIT,
  ]),
  weekdayDate: '2026-08-03',
  weekendDate: '2026-08-08',
  maximumProviderEvents: 24,
  automaticRetryCount: 0,
  userFacingOutputPermitted: false,
  productionPermitted: false,
});

export const PACKET166_APPROVED_DAILY_QUOTA = Object.freeze(
  calculatePrivateAlphaDailyRouteQuota({
    ...PROPOSED_PRIVATE_ALPHA_QUOTA_INPUTS,
    approvedByProductOwner: true,
  }),
);

export const PACKET166_CALIBRATION_PLAN = Object.freeze(
  createLondonCalibrationPlan({
    weekdayDate: PACKET166_APPROVAL.weekdayDate,
    weekendDate: PACKET166_APPROVAL.weekendDate,
  }),
);

const packet166Approval = {
  PACKET166_APPROVAL,
  PACKET166_APPROVED_DAILY_QUOTA,
  PACKET166_CALIBRATION_PLAN,
};

export default packet166Approval;
