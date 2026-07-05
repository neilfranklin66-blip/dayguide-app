import { render, screen, fireEvent } from '@testing-library/react';
import ActivitiesStage from './ActivitiesStage';

const t = (key) => key;

const activity = {
  id: 1,
  name: 'City Museum',
  image: '🏛️',
  category: 'museums',
  rating: 4.5,
  distance: 1.2,
  duration: 2,
  address: '1 Museum Street',
};

const baseProps = {
  activityQueue: [activity],
  currentActivityIndex: 0,
  selectedInterests: ['museums'],
  goToActivities: jest.fn(),
  setStage: jest.fn(),
  continueAfterActivities: jest.fn(),
  swipeActivity: jest.fn(),
  t,
};

test('renders the current activity card', () => {
  render(<ActivitiesStage {...baseProps} />);

  expect(screen.getByText('City Museum')).toBeInTheDocument();
  expect(screen.getByText('1 / 1')).toBeInTheDocument();
});

test('accepting an activity calls swipeActivity(true)', () => {
  const swipeActivity = jest.fn();
  render(<ActivitiesStage {...baseProps} swipeActivity={swipeActivity} />);

  fireEvent.click(screen.getByText('activities.yes'));

  expect(swipeActivity).toHaveBeenCalledWith(true);
});

test('shows the no-more card when the queue is exhausted', () => {
  render(<ActivitiesStage {...baseProps} currentActivityIndex={1} />);

  expect(screen.queryByText('City Museum')).not.toBeInTheDocument();
});
