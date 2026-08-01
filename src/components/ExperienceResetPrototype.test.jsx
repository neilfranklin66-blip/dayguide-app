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
