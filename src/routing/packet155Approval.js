import { ROUTE_TRAVEL_MODE } from './routeEvidenceBoundary';
import {
  PROPOSED_PRIVATE_ALPHA_QUOTA_INPUTS,
  calculatePrivateAlphaDailyRouteQuota,
  createApprovedLondonPrivateAlphaCriteria,
  createLondonCalibrationPlan,
} from './londonRouteCalibration';

export const PACKET155_APPROVAL = Object.freeze({
  packet: 155,
  approvedByProductOwner: true,
  approvedAt: '2026-07-27T10:54:09+01:00',
  approvalInstruction: 'Implement Packet 155',
  region: 'London, UK',
  modes: Object.freeze([
    ROUTE_TRAVEL_MODE.WALKING,
    ROUTE_TRAVEL_MODE.TRANSIT,
  ]),
  weekdayDate: '2026-07-28',
  weekendDate: '2026-08-01',
});

export const PACKET155_APPROVED_CRITERIA = Object.freeze(
  createApprovedLondonPrivateAlphaCriteria({
    approvedAt: PACKET155_APPROVAL.approvedAt,
    approvedByProductOwner: true,
  }),
);

export const PACKET155_APPROVED_DAILY_QUOTA = Object.freeze(
  calculatePrivateAlphaDailyRouteQuota({
    ...PROPOSED_PRIVATE_ALPHA_QUOTA_INPUTS,
    approvedByProductOwner: true,
  }),
);

export const PACKET155_CALIBRATION_PLAN = Object.freeze(
  createLondonCalibrationPlan({
    weekdayDate: PACKET155_APPROVAL.weekdayDate,
    weekendDate: PACKET155_APPROVAL.weekendDate,
  }),
);

const packet155Approval = {
  PACKET155_APPROVAL,
  PACKET155_APPROVED_CRITERIA,
  PACKET155_APPROVED_DAILY_QUOTA,
  PACKET155_CALIBRATION_PLAN,
};

export default packet155Approval;
