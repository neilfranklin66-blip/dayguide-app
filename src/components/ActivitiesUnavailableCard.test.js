import { render, screen, fireEvent } from '@testing-library/react';
import ActivitiesUnavailableCard from './ActivitiesUnavailableCard';

const t = (key) => key;

test('names a denied location and sends the user directly to set a starting place', () => {
  const onSetStart = jest.fn();
  render(
    <ActivitiesUnavailableCard
      activitySource="location_denied"
      onRetry={jest.fn()}
      onSetStart={onSetStart}
      onSkip={jest.fn()}
      t={t}
    />,
  );

  expect(screen.getByText('activities.locationDeniedWarning')).toBeInTheDocument();
  expect(screen.queryByText('activities.tryAgain')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('activities.setStartingPlace'));
  expect(onSetStart).toHaveBeenCalledTimes(1);
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

test('nearby location denial returns to nearby choices instead of the planning form', () => {
  const onBackToDiscovery = jest.fn();
  const onStartOver = jest.fn();
  render(
    <ActivitiesUnavailableCard
      activitySource="location_denied"
      isLiveDiscovery
      onSetStart={jest.fn()}
      onSkip={jest.fn()}
      onBackToDiscovery={onBackToDiscovery}
      onStartOver={onStartOver}
      t={t}
    />,
  );

  expect(screen.getByText('activities.nearbyLocationNeeded')).toBeInTheDocument();
  expect(screen.queryByText('activities.setStartingPlace')).not.toBeInTheDocument();
  expect(screen.queryByText('activities.skipAndContinue')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('discovery.backToNearby'));
  fireEvent.click(screen.getByText('discovery.startOver'));
  expect(onBackToDiscovery).toHaveBeenCalledTimes(1);
  expect(onStartOver).toHaveBeenCalledTimes(1);
});
