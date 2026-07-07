import { render, screen } from '@testing-library/react';
import TimelineItemRow from './TimelineItemRow';
import en from '../locales/en.json';

// Minimal i18next-style t() backed by the real English locale, so these tests
// assert the copy and behaviour users actually see.
const t = (key, fallback) => {
  const template = key
    .split('.')
    .reduce((node, part) => (node == null ? undefined : node[part]), en);
  return typeof template === 'string' ? template : (fallback ?? key);
};

const baseItem = {
  time: '10:15',
  icon: 'food-icon',
  category: 'Food and Drinks',
  activity: 'Cafe',
  duration: 0.5,
  distance: 0.2,
  rating: 4.4,
  address: '2 Cafe Street',
};

const renderRow = (item) =>
  render(<TimelineItemRow item={item} index={0} onDurationChange={() => {}} t={t} />);

test('renders an Open in Maps link with the exact mapsUrl href when present', () => {
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Cafe&query_place_id=abc123';
  renderRow({ ...baseItem, mapsUrl });

  const link = screen.getByRole('link', { name: en.restaurants.openInMaps });
  expect(link).toHaveAttribute('href', mapsUrl);
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

test('renders no maps link when the item has no mapsUrl', () => {
  renderRow(baseItem);

  expect(screen.queryByRole('link', { name: en.restaurants.openInMaps })).toBeNull();
});

test('sample activity rows stay honest: sample note shown, no km distance, no maps link', () => {
  renderRow({ ...baseItem, category: 'museums', isSample: true });

  expect(screen.getByText(en.timeline.sampleActivity)).toBeInTheDocument();
  // No fabricated proximity claim for sample ideas.
  expect(screen.queryByText(/📍/)).toBeNull();
  expect(screen.queryByText(/km/)).toBeNull();
  // Sample activities never carry a mapsUrl, so no maps link appears.
  expect(screen.queryByRole('link', { name: en.restaurants.openInMaps })).toBeNull();
});
