import { fireEvent, render, screen } from '@testing-library/react';
import StartTimeSelector from './StartTimeSelector';

const copy = {
  'interests.timeNow': 'Now',
  'interests.timeIn1Hour': 'In 1 hour',
  'interests.timeIn2Hours': 'In 2 hours',
  'interests.pickTime': 'Or pick a time',
  'interests.morning': 'Morning',
  'interests.afternoonEvening': 'Afternoon / evening',
  'interests.hourLabel': 'Hour',
  'interests.minuteLabel': 'Minutes',
};
const t = (key, options) => copy[key] ?? options?.defaultValue ?? key;

test('offers only tap-first time controls when no time has been chosen', () => {
  render(<StartTimeSelector startTime={null} onChange={jest.fn()} t={t} />);

  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Now' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'In 1 hour' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'In 2 hours' })).toBeInTheDocument();
  expect(screen.getByText('No start time chosen yet')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '6' })).toBeDisabled();
});

test('requires a day part and hour before minute selection', () => {
  const onChange = jest.fn();
  render(<StartTimeSelector startTime={null} onChange={onChange} t={t} />);

  fireEvent.click(screen.getByRole('button', { name: 'Morning' }));
  expect(screen.getByRole('button', { name: '5' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '6' })).toBeEnabled();
  expect(screen.getByRole('button', { name: ':30' })).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: '10' }));
  fireEvent.click(screen.getByRole('button', { name: ':30' }));

  expect(onChange).toHaveBeenLastCalledWith(10.5);
});

test('uses afternoon and evening hours as pm values', () => {
  const onChange = jest.fn();
  render(<StartTimeSelector startTime={null} onChange={onChange} t={t} />);

  fireEvent.click(screen.getByRole('button', { name: 'Afternoon / evening' }));
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  fireEvent.click(screen.getByRole('button', { name: ':00' }));

  expect(onChange).toHaveBeenLastCalledWith(14);
});
