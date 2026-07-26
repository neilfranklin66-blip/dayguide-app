import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GeographicalPlanningReview from './GeographicalPlanningReview';
import {
  ROUTE_EVIDENCE_CLASS,
  ROUTE_TRAVEL_MODE,
} from '../routing/routeEvidenceBoundary';
import {
  createHardAnchor,
  createPlaceRef,
  createStartPoint,
} from '../models/geographicalPlan';

const place = (id, lat, lng) =>
  createPlaceRef({
    id,
    name: id,
    coordinates: { lat, lng },
    source: 'test_fixture',
  });

const start = createStartPoint({
  place: place('Euston', 51.5282, -0.1337),
  departureTimeMinutes: 17 * 60,
});
const theatre = createHardAnchor({
  id: 'theatre',
  title: 'Theatre',
  place: place('Theatre place', 51.511, -0.127),
  startTimeMinutes: 18 * 60 + 30,
  durationMinutes: 150,
  arrivalBufferMinutes: 15,
});
const planningInput = { start, anchors: [theatre], end: null };
const routeContext = {
  date: '2026-08-04',
  timezone: 'Europe/London',
  travelMode: ROUTE_TRAVEL_MODE.TRANSIT,
};

const evidenceFor = (request, durationMinutes) => ({
  requestId: request.id,
  evidenceClass: ROUTE_EVIDENCE_CLASS.PROVIDER_ROUTE,
  travelMode: request.travelMode,
  durationMinutes,
  distanceMeters: 2000,
  evidenceSource: 'route_provider_fixture',
  observedAt: '2026-08-04T15:00:00Z',
});

test('does not request route evidence until the user deliberately checks', () => {
  const resolveRouteEvidence = jest.fn();
  render(
    <GeographicalPlanningReview
      planningInput={planningInput}
      routeContext={routeContext}
      resolveRouteEvidence={resolveRouteEvidence}
      onContinue={jest.fn()}
      onBack={jest.fn()}
    />,
  );

  expect(
    screen.getByText(
      'No route check has run. Your fixed places and times remain unchanged.',
    ),
  ).toBeInTheDocument();
  expect(resolveRouteEvidence).not.toHaveBeenCalled();
});

test('holds a loading state and suppresses duplicate checks', async () => {
  let finish;
  const resolveRouteEvidence = jest.fn(
    ({ requests }) =>
      new Promise(resolve => {
        finish = () => resolve([evidenceFor(requests[0], 30)]);
      }),
  );
  render(
    <GeographicalPlanningReview
      planningInput={planningInput}
      routeContext={routeContext}
      resolveRouteEvidence={resolveRouteEvidence}
      onContinue={jest.fn()}
      onBack={jest.fn()}
    />,
  );

  fireEvent.click(
    screen.getByRole('button', { name: 'Check route feasibility' }),
  );
  expect(
    screen.getByRole('button', { name: 'Checking route...' }),
  ).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Checking route...' }));
  expect(resolveRouteEvidence).toHaveBeenCalledTimes(1);

  finish();
  expect(
    await screen.findByText(
      'Route evidence confirms that the fixed commitments are reachable within their current times.',
    ),
  ).toBeInTheDocument();
});

test('allows continuation only after a feasible route check', async () => {
  const onContinue = jest.fn();
  render(
    <GeographicalPlanningReview
      planningInput={planningInput}
      routeContext={routeContext}
      resolveRouteEvidence={({ requests }) => [
        evidenceFor(requests[0], 30),
      ]}
      onContinue={onContinue}
      onBack={jest.fn()}
    />,
  );

  fireEvent.click(
    screen.getByRole('button', { name: 'Check route feasibility' }),
  );
  fireEvent.click(
    await screen.findByRole('button', {
      name: 'Continue with checked plan',
    }),
  );

  expect(onContinue).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'ready',
      canContinue: true,
      fixedConstraintsPreserved: true,
    }),
  );
});

test('missing evidence produces an honest cannot-prove state', async () => {
  render(
    <GeographicalPlanningReview
      planningInput={planningInput}
      routeContext={routeContext}
      resolveRouteEvidence={async () => []}
      onContinue={jest.fn()}
      onBack={jest.fn()}
    />,
  );

  fireEvent.click(
    screen.getByRole('button', { name: 'Check route feasibility' }),
  );

  expect(
    await screen.findByRole('alert'),
  ).toHaveTextContent(
    'DayGuide cannot prove that this plan fits because one or more travel legs have no trustworthy route evidence.',
  );
  expect(
    screen.queryByRole('button', { name: 'Continue with checked plan' }),
  ).not.toBeInTheDocument();
});

test('infeasible evidence reports the exact shortfall and preserves the anchor', async () => {
  render(
    <GeographicalPlanningReview
      planningInput={planningInput}
      routeContext={routeContext}
      resolveRouteEvidence={({ requests }) => [
        evidenceFor(requests[0], 100),
      ]}
      onContinue={jest.fn()}
      onBack={jest.fn()}
    />,
  );

  fireEvent.click(
    screen.getByRole('button', { name: 'Check route feasibility' }),
  );

  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent(
    'DayGuide has not moved any fixed commitment.',
  );
  expect(alert).toHaveTextContent('start to theatre needs 25 more minutes.');
  expect(theatre.startTimeMinutes).toBe(1110);
  expect(
    screen.queryByRole('button', { name: 'Continue with checked plan' }),
  ).not.toBeInTheDocument();
});

test('invalid planning context fails safely and Back remains available', async () => {
  const onBack = jest.fn();
  render(
    <GeographicalPlanningReview
      planningInput={planningInput}
      routeContext={{ ...routeContext, date: 'not-a-date' }}
      resolveRouteEvidence={jest.fn()}
      onContinue={jest.fn()}
      onBack={onBack}
    />,
  );

  fireEvent.click(
    screen.getByRole('button', { name: 'Check route feasibility' }),
  );
  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The planning details could not be checked. No fixed commitment was changed.',
    ),
  );

  fireEvent.click(
    screen.getByRole('button', { name: 'Back to fixed details' }),
  );
  expect(onBack).toHaveBeenCalledTimes(1);
});
