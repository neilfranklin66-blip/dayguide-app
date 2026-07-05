import { render, screen, fireEvent } from '@testing-library/react';
import TimelineStage from './TimelineStage';

const t = (key) => key;

const timelineItem = {
  id: 1,
  time: '10:00',
  icon: '🏛️',
  category: 'museums',
  activity: 'City Museum',
  duration: 2,
  rating: 4.5,
  distance: 1.2,
  address: '1 Museum Street',
};

const baseProps = {
  timeline: [timelineItem],
  startTime: 10,
  availableTime: 6,
  hasChildren: false,
  selectedCuisines: [],
  selectedPriceRange: null,
  startWith: 'activities',
  updateActivityDuration: jest.fn(),
  resetState: jest.fn(),
  setShowQR: jest.fn(),
  t,
};

test('renders the timeline with its items', () => {
  render(<TimelineStage {...baseProps} />);

  expect(screen.getByText('timeline.title')).toBeInTheDocument();
  expect(screen.getByText('City Museum')).toBeInTheDocument();
  expect(screen.getByText('10:00')).toBeInTheDocument();
});

test('clicking share opens the QR modal', () => {
  const setShowQR = jest.fn();
  render(<TimelineStage {...baseProps} setShowQR={setShowQR} />);

  fireEvent.click(screen.getByText('timeline.share'));

  expect(setShowQR).toHaveBeenCalledWith(true);
});

test('renders the empty state when the timeline has no items', () => {
  render(<TimelineStage {...baseProps} timeline={[]} />);

  expect(screen.getByText('timeline.empty')).toBeInTheDocument();
});
