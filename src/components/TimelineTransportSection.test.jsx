import { render, screen } from '@testing-library/react';
import TimelineTransportSection from './TimelineTransportSection';
import en from '../locales/en.json';
import { WALKING_PACE } from '../utils/travelPreferences';

const t = (key, vars = {}) => {
  const template = key
    .split('.')
    .reduce((node, part) => (node == null ? undefined : node[part]), en);
  if (typeof template !== 'string') {
    return vars.defaultValue ?? key;
  }
  return Object.entries(vars).reduce(
    (out, [name, value]) =>
      out.split(`{{${name}}}`).join(String(value)),
    template,
  );
};

const origin = {
  activity: 'British Museum',
  address: 'Great Russell Street, London',
};
const destination = {
  activity: 'Royal Opera House',
  address: 'Bow Street, London',
};

const renderSection = (props = {}) =>
  render(
    <TimelineTransportSection
      distance={1}
      origin={origin}
      destination={destination}
      t={t}
      {...props}
    />,
  );

test('labels the current calculations as planning estimates with a visible evidence limitation', () => {
  renderSection();

  expect(screen.getByText(en.timeline.howToGetThere)).toBeInTheDocument();
  expect(screen.getByText(en.timeline.estimateBasis)).toBeInTheDocument();
  expect(screen.getAllByText(/^Estimated \d+ min$/)).toHaveLength(3);
});
test('taxi requires a live traffic check instead of displaying a fixed-speed time', () => {
  renderSection();

  expect(screen.getByText(en.timeline.liveTimeRequired)).toBeInTheDocument();
  expect(screen.queryByText('Estimated 6 min')).not.toBeInTheDocument();
});

test('every displayed mode has a key-free live Google Maps handoff for the itinerary leg', () => {
  renderSection();

  const links = screen.getAllByRole('link', {
    name: en.timeline.checkLiveJourney,
  });
  expect(links).toHaveLength(4);
  links.forEach(link => {
    const url = new URL(link.getAttribute('href'));
    expect(url.pathname).toBe('/maps/dir/');
    expect(url.searchParams.get('origin')).toContain('British Museum');
    expect(url.searchParams.get('destination')).toContain(
      'Royal Opera House',
    );
    expect(url.search).not.toMatch(/key=/i);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

test('fares describe the fare type, not a hardcoded city price', () => {
  renderSection();

  expect(screen.getByText('Free')).toBeInTheDocument();
  expect(screen.getByText('Metered fare')).toBeInTheDocument();
  expect(screen.getAllByText('Transit fare')).toHaveLength(2);
  expect(screen.queryByText(/£/)).not.toBeInTheDocument();
});

test('walking availability follows the user pace and maximum preference', () => {
  renderSection({
    distance: 4,
    travelPreferences: {
      walkingPace: WALKING_PACE.RELAXED,
      maximumWalkingMinutes: 45,
    },
  });

  expect(screen.queryByText('Walk')).not.toBeInTheDocument();
  expect(screen.getByText('Taxi/Uber')).toBeInTheDocument();
  expect(screen.getByText('Train/Tube')).toBeInTheDocument();
  expect(screen.getByText('Bus')).toBeInTheDocument();
});
