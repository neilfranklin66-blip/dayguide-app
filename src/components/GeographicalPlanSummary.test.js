import { render, screen } from '@testing-library/react';
import GeographicalPlanSummary from './GeographicalPlanSummary';
import {
  createHardAnchor,
  createPlaceRef,
  createStartPoint,
} from '../models/geographicalPlan';
import { assessGeographicalPlanningInput } from '../engines/geographicalPlanningEngine';

const startPlace = createPlaceRef({
  id: 'start-place',
  name: 'London Euston',
  address: 'Euston Road, London',
  coordinates: { lat: 51.5282, lng: -0.1337 },
  source: 'google_places',
});
const theatrePlace = createPlaceRef({
  id: 'theatre-place',
  name: 'West End Theatre',
  address: 'Shaftesbury Avenue, London',
  coordinates: { lat: 51.511, lng: -0.127 },
  source: 'google_places',
});
const planningInput = {
  schemaVersion: 2,
  journeyIntent: 'time_sensitive',
  start: createStartPoint({
    place: startPlace,
    departureTimeMinutes: 10 * 60,
  }),
  anchors: [
    createHardAnchor({
      id: 'anchor-1',
      title: 'Evening performance',
      place: theatrePlace,
      startTimeMinutes: 18 * 60 + 30,
      durationMinutes: 120,
      arrivalBufferMinutes: 20,
    }),
  ],
  end: null,
  locationProvenance: {
    start: 'resolved_place',
    end: null,
  },
};

test('shows locked fixed details and an honest unverified-route warning', () => {
  const assessment = assessGeographicalPlanningInput({
    planningInput,
    routeEvidence: null,
  });
  render(
    <GeographicalPlanSummary
      planningInput={planningInput}
      planningAssessment={assessment}
    />,
  );

  expect(screen.getByText('Your fixed route details')).toBeInTheDocument();
  expect(screen.getByText('Evening performance')).toBeInTheDocument();
  expect(screen.getByText('Locked anchor')).toBeInTheDocument();
  expect(
    screen.getByText(/travel times are not route-verified/i),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/cannot confirm that a target time can be met/i),
  ).toBeInTheDocument();
});

test('offers a key-free Google Maps handoff without exposing coordinates', () => {
  const assessment = assessGeographicalPlanningInput({
    planningInput,
    routeEvidence: null,
  });
  const { container } = render(
    <GeographicalPlanSummary
      planningInput={planningInput}
      planningAssessment={assessment}
    />,
  );

  const link = screen.getByRole('link', {
    name: /Check London Euston to West End Theatre/i,
  });
  const url = new URL(link.href);
  expect(url.origin).toBe('https://www.google.com');
  expect(url.searchParams.get('origin')).toContain('London Euston');
  expect(url.searchParams.get('destination')).toContain('West End Theatre');
  expect(url.searchParams.has('key')).toBe(false);
  expect(container).not.toHaveTextContent('51.5282');
  expect(container).not.toHaveTextContent('-0.1337');
});

test('comfortable-arrival context does not assert a buffer that was never set', () => {
  render(
    <GeographicalPlanSummary
      planningInput={{
        ...planningInput,
        journeyIntent: 'comfortable_arrival',
        anchors: [],
      }}
      planningAssessment={null}
    />,
  );

  expect(
    screen.getByText(/Review any deadline or buffer yourself/i),
  ).toBeInTheDocument();
  expect(screen.queryByText(/your chosen buffer/i)).not.toBeInTheDocument();
});

test('renders nothing when geographical planning was skipped', () => {
  const { container } = render(
    <GeographicalPlanSummary planningInput={null} />,
  );
  expect(container).toBeEmptyDOMElement();
});
