import { fireEvent, render, screen } from '@testing-library/react';
import ExperienceResetPrototype from './ExperienceResetPrototype';

const t = key => key;

test('lets a wanderer reach a chosen-interest day preview without a planning interrogation', () => {
  render(<ExperienceResetPrototype t={t} onExit={jest.fn()} />);

  fireEvent.click(screen.getByText('experienceReset.nearbyNow'));
  expect(screen.getByText('experienceReset.moodTitle')).toBeInTheDocument();

  fireEvent.click(screen.getByText('experienceReset.moods.food'));
  expect(screen.getByText('experienceReset.readyTitle')).toBeInTheDocument();
  expect(screen.getByText('experienceReset.acknowledgement')).toBeInTheDocument();
});

test('keeps the later-place explanation and branch optional for a planner', () => {
  render(<ExperienceResetPrototype t={t} onExit={jest.fn()} />);

  fireEvent.click(screen.getByText('experienceReset.planAhead'));
  fireEvent.click(screen.getByText('experienceReset.continue'));
  fireEvent.click(screen.getByText('experienceReset.now'));
  fireEvent.click(screen.getByText('experienceReset.currentLocation'));

  expect(screen.getByText('experienceReset.laterHelp')).toBeInTheDocument();
  fireEvent.click(screen.getByText('experienceReset.keepOpen'));
  fireEvent.click(screen.getByText('experienceReset.halfDay'));
  fireEvent.click(screen.getByText('experienceReset.moods.culture'));

  expect(screen.getByText('experienceReset.daySoFar')).toBeInTheDocument();
  expect(screen.queryByText('experienceReset.laterPlaceLabel')).not.toBeInTheDocument();
});

test('only leaves the prototype when the user chooses to return', () => {
  const onExit = jest.fn();
  render(<ExperienceResetPrototype t={t} onExit={onExit} />);

  fireEvent.click(screen.getByText('experienceReset.nearbyNow'));
  fireEvent.click(screen.getByText('experienceReset.moods.coffee'));
  fireEvent.click(screen.getByText('experienceReset.backToCurrent'));

  expect(onExit).toHaveBeenCalledTimes(1);
});

test('passes a food choice into the live-restaurant boundary only when requested', () => {
  const onBrowseRestaurants = jest.fn();
  render(
    <ExperienceResetPrototype
      t={t}
      onExit={jest.fn()}
      onBrowseRestaurants={onBrowseRestaurants}
    />,
  );

  fireEvent.click(screen.getByText('experienceReset.nearbyNow'));
  fireEvent.click(screen.getByText('experienceReset.moods.food'));
  expect(onBrowseRestaurants).not.toHaveBeenCalled();

  fireEvent.click(screen.getByText('experienceReset.showNearbyOptions'));

  expect(onBrowseRestaurants).toHaveBeenCalledWith(
    expect.objectContaining({ mood: 'food', mode: 'nearby' }),
  );
});

test('only searches for a chosen start place after the user submits a query', async () => {
  const searchPlaces = jest.fn().mockResolvedValue([]);
  render(
    <ExperienceResetPrototype
      t={t}
      onExit={jest.fn()}
      searchPlaces={searchPlaces}
    />,
  );

  fireEvent.click(screen.getByText('experienceReset.planAhead'));
  fireEvent.click(screen.getByText('experienceReset.continue'));
  fireEvent.click(screen.getByText('experienceReset.now'));
  fireEvent.click(screen.getByText('experienceReset.placeToChoose'));
  fireEvent.change(screen.getByLabelText('experienceReset.startSearchLabel'), {
    target: { value: 'London Euston' },
  });

  expect(searchPlaces).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('experienceReset.search'));

  expect(searchPlaces).toHaveBeenCalledWith('London Euston');
  expect(await screen.findByText('experienceReset.startSearchEmpty')).toBeInTheDocument();
});
