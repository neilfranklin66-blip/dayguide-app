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
  expect(screen.getByText('activities.noMore')).toBeInTheDocument();
});

test('no-more card uses the activities continue label and continues the flow', () => {
  const continueAfterActivities = jest.fn();
  render(
    <ActivitiesStage
      {...baseProps}
      currentActivityIndex={1}
      continueAfterActivities={continueAfterActivities}
    />,
  );

  expect(screen.queryByText('interests.next')).not.toBeInTheDocument();

  fireEvent.click(screen.getByText('activities.continueLabel'));

  expect(continueAfterActivities).toHaveBeenCalled();
});

test('renders the no-results card when the queue is empty', () => {
  render(<ActivitiesStage {...baseProps} activityQueue={[]} />);

  expect(screen.getByText('activities.noResultsTitle')).toBeInTheDocument();
});

test('show-all button broadens the search by calling goToActivities with no interests', () => {
  const goToActivities = jest.fn();
  render(<ActivitiesStage {...baseProps} activityQueue={[]} goToActivities={goToActivities} />);

  fireEvent.click(screen.getByText('activities.showAll'));

  expect(goToActivities).toHaveBeenCalledWith([]);
});

test('no-results back button returns to the interests stage', () => {
  const setStage = jest.fn();
  render(<ActivitiesStage {...baseProps} activityQueue={[]} setStage={setStage} />);

  fireEvent.click(screen.getByText(/interests\.title/));

  expect(setStage).toHaveBeenCalledWith('interests');
});

test('hides the show-all button when no interests are selected', () => {
  render(<ActivitiesStage {...baseProps} activityQueue={[]} selectedInterests={[]} />);

  expect(screen.queryByText('activities.showAll')).not.toBeInTheDocument();
});
