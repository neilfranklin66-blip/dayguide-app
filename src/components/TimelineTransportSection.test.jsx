import { render, screen } from '@testing-library/react';
import TimelineTransportSection from './TimelineTransportSection';
import en from '../locales/en.json';

// Minimal i18next-style t() backed by the real English locale, so these tests
// assert the copy users actually see.
const t = (key, vars = {}) => {
  const template = key
    .split('.')
    .reduce((node, part) => (node == null ? undefined : node[part]), en);
  if (typeof template !== 'string') return key;
  return Object.entries(vars).reduce(
    (out, [name, value]) => out.split(`{{${name}}}`).join(String(value)),
    template,
  );
};

// 1 km keeps all four transport options visible.
const renderSection = () => render(<TimelineTransportSection distance={1} t={t} />);

test('heading offers nearby travel options as rough estimates, not exact routing', () => {
  renderSection();

  expect(
    screen.getByText('↓ Travel options nearby (rough estimates)'),
  ).toBeInTheDocument();
  expect(screen.queryByText(/How to get to your next stop/)).not.toBeInTheDocument();
});

test('travel times render as approximate minutes', () => {
  renderSection();

  expect(screen.getAllByText(/^~\d+ min$/)).toHaveLength(4);
  expect(screen.queryByText(/^\d+ min$/)).not.toBeInTheDocument();
});

test('fares describe the fare type, not a hardcoded London price', () => {
  renderSection();

  // Walking is genuinely free; paid modes describe their fare type only.
  expect(screen.getByText('Free')).toBeInTheDocument();
  expect(screen.getByText('Metered fare')).toBeInTheDocument();
  expect(screen.getAllByText('Transit fare')).toHaveLength(2); // tube + bus

  // No option may present a specific London GBP fare as a universal fact.
  // (Digits still legitimately appear in the ~N min time labels.)
  expect(screen.queryByText(/£/)).not.toBeInTheDocument();
  expect(screen.queryByText(/from £2\.80/)).not.toBeInTheDocument();
});

test('all four transport options still render with mode, time, and cost', () => {
  renderSection();

  // Structure preserved: four options each with a mode label, a ~min time,
  // and a fare label.
  expect(screen.getByText('Walk')).toBeInTheDocument();
  expect(screen.getByText('Taxi/Uber')).toBeInTheDocument();
  expect(screen.getByText('Train/Tube')).toBeInTheDocument();
  expect(screen.getByText('Bus')).toBeInTheDocument();
  expect(screen.getAllByText(/^~\d+ min$/)).toHaveLength(4);
});

test('the tube option uses the broader Train/Tube label', () => {
  renderSection();

  expect(screen.getByText('Train/Tube')).toBeInTheDocument();
  expect(screen.queryByText('Tube')).not.toBeInTheDocument();
});
