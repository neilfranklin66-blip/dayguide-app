import { render, screen } from '@testing-library/react';
import TravelEstimateNotice from './TravelEstimateNotice';
import { DEFAULT_TRAVEL_PREFERENCES } from '../utils/travelPreferences';

const t = (key, options) =>
  options?.defaultValue ?? (typeof options === 'string' ? options : key);

test('makes estimates and user live-checking accountability visible', () => {
  render(
    <TravelEstimateNotice
      travelPreferences={DEFAULT_TRAVEL_PREFERENCES}
      t={t}
    />,
  );

  expect(
    screen.getByText(
      'Travel times are estimates. Check live routes, traffic, services and conditions before setting off.',
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      'DayGuide helps organise your day; you decide when to leave and how much additional time to allow.',
    ),
  ).toBeInTheDocument();
  expect(screen.getByText(/45 minutes/)).toBeInTheDocument();
});

test('adds a stronger live-check warning when a hard anchor is present', () => {
  render(
    <TravelEstimateNotice
      hasHardAnchor
      travelPreferences={DEFAULT_TRAVEL_PREFERENCES}
      t={t}
    />,
  );

  expect(
    screen.getByText(
      'A fixed-time booking is included. Check the live journey and allow additional time before leaving.',
    ),
  ).toBeInTheDocument();
});
