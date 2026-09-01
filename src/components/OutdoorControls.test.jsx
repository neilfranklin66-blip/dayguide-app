import { fireEvent, render, screen } from '@testing-library/react';
import DateSelector from './DateSelector';
import NearbyDiscoveryStage from './NearbyDiscoveryStage';
import StartTimeSelector from './StartTimeSelector';

const t = key => key;

test('date and time controls remain labelled, amendable inputs', () => {
  render(
    <>
      <DateSelector selectedDate="2026-08-09" onChange={jest.fn()} t={t} />
      <StartTimeSelector startTime={10.5} onChange={jest.fn()} t={t} />
    </>,
  );

  expect(screen.getByLabelText('interests.dateLabel')).toHaveClass('date-input');
  expect(screen.getByRole('heading', { name: 'interests.startTimeLabel' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'interests.timeNow' })).toHaveClass('start-time-option');
});

test('nearby mood choices use the approved photo-card controls', () => {
  const onChooseFood = jest.fn();
  const onChooseActivities = jest.fn();
  const onChooseBoth = jest.fn();

  render(
    <NearbyDiscoveryStage
      mode={null}
      onChooseFood={onChooseFood}
      onChooseActivities={onChooseActivities}
      onChooseBoth={onChooseBoth}
      t={t}
    />,
  );

  const food = screen.getByRole('button', { name: 'discovery.food' });
  const activities = screen.getByRole('button', { name: 'discovery.activities' });
  const both = screen.getByRole('button', { name: 'discovery.both' });

  expect(food).toHaveClass('nearby-mood-card');
  expect(activities).toHaveClass('nearby-mood-card');
  expect(both).toHaveClass('nearby-mood-both');

  fireEvent.click(food);
  fireEvent.click(activities);
  fireEvent.click(both);

  expect(onChooseFood).toHaveBeenCalledTimes(1);
  expect(onChooseActivities).toHaveBeenCalledTimes(1);
  expect(onChooseBoth).toHaveBeenCalledTimes(1);
});

test('Food & Drinks keeps all cuisine choices in a tap-first picker', () => {
  const onToggleCuisine = jest.fn();
  const onFindFood = jest.fn();
  const cuisineCategories = [
    { id: 'italian' }, { id: 'indian' }, { id: 'british' },
  ];

  render(
    <NearbyDiscoveryStage
      mode="food"
      cuisineCategories={cuisineCategories}
      selectedCuisines={['italian']}
      onToggleCuisine={onToggleCuisine}
      onFindFood={onFindFood}
      t={t}
    />,
  );

  const italian = screen.getByRole('button', { name: 'cuisine.italian' });
  expect(italian).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getAllByRole('button', { name: /cuisine\./ })).toHaveLength(3);

  fireEvent.click(italian);
  fireEvent.click(screen.getByRole('button', { name: 'discovery.showFood' }));

  expect(onToggleCuisine).toHaveBeenCalledWith('italian');
  expect(onFindFood).toHaveBeenCalledWith(['italian']);
});

test('Things to do keeps all activity choices in the same tap-first picker', () => {
  const onToggleInterest = jest.fn();
  const onFindActivities = jest.fn();
  const interestCategories = [
    { id: 'museums', label: 'Museums' },
    { id: 'galleries', label: 'Galleries' },
    { id: 'parks', label: 'Parks' },
  ];

  render(
    <NearbyDiscoveryStage
      mode="activities"
      interestCategories={interestCategories}
      selectedInterests={['museums']}
      onToggleInterest={onToggleInterest}
      onFindActivities={onFindActivities}
      t={t}
    />,
  );

  const museums = screen.getByRole('button', { name: 'Museums' });
  expect(museums).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getAllByRole('button', { name: /Museums|Galleries|Parks/ })).toHaveLength(3);

  fireEvent.click(museums);
  fireEvent.click(screen.getByRole('button', { name: 'discovery.showActivities' }));

  expect(onToggleInterest).toHaveBeenCalledWith('museums');
  expect(onFindActivities).toHaveBeenCalledWith(['museums']);
});
