import { render, screen, fireEvent } from '@testing-library/react';
import ActivitiesUnavailableCard from './ActivitiesUnavailableCard';

const t = (key) => key;

test('names a denied location and offers a retry', () => {
  const onRetry = jest.fn();
  render(
    <ActivitiesUnavailableCard
      activitySource="location_denied"
      onRetry={onRetry}
      onSkip={jest.fn()}
      t={t}
    />,
  );

  expect(screen.getByText('activities.locationDeniedWarning')).toBeInTheDocument();
  fireEvent.click(screen.getByText('activities.tryAgain'));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test('does not offer retry for a DayGuide setup failure', () => {
  render(
    <ActivitiesUnavailableCard
      activitySource="no_key"
      onRetry={jest.fn()}
      onSkip={jest.fn()}
      t={t}
    />,
  );

  expect(screen.queryByText('activities.tryAgain')).not.toBeInTheDocument();
  expect(screen.getByText('activities.noKeyWarning')).toBeInTheDocument();
});
