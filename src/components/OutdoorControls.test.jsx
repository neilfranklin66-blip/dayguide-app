import { render, screen } from '@testing-library/react';
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
  expect(screen.getByLabelText('interests.startTimeLabel')).toHaveClass('time-input');
});

test('nearby mood choices use the same large-choice component', () => {
  render(
    <NearbyDiscoveryStage
      mode={null}
      onChooseFood={jest.fn()}
      onChooseActivities={jest.fn()}
      onChooseBoth={jest.fn()}
      t={t}
    />,
  );

  expect(screen.getByRole('button', { name: 'discovery.food' })).toHaveClass('discovery-option');
  expect(screen.getByRole('button', { name: 'discovery.activities' })).toHaveClass('discovery-option');
  expect(screen.getByRole('button', { name: 'discovery.both' })).toHaveClass('discovery-option');
});
