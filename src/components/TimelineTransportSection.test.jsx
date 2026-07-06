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

test('paid fares render as indicative starting prices and walking stays free', () => {
  renderSection();

  expect(screen.getByText('from £7')).toBeInTheDocument();
  expect(screen.getByText('from £2.80')).toBeInTheDocument();
  expect(screen.getByText('from £1.75')).toBeInTheDocument();
  expect(screen.getByText('Free')).toBeInTheDocument();

  // No fare should render as an exact price.
  expect(screen.queryByText(/^£[\d.]+$/)).not.toBeInTheDocument();
});

test('the tube option uses the broader Train/Tube label', () => {
  renderSection();

  expect(screen.getByText('Train/Tube')).toBeInTheDocument();
  expect(screen.queryByText('Tube')).not.toBeInTheDocument();
});
