import { fireEvent, render, screen } from '@testing-library/react';
import StartTimeSelector from './StartTimeSelector';

const t = (key, fallback) => fallback ?? key;

test('offers a tap-first time picker with no typed field or wheel', () => {
  const onChange = jest.fn();
  render(<StartTimeSelector startTime={10.5} onChange={onChange} t={t} />);

  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'interests.timeNow' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'interests.timeIn1Hour' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'interests.timeIn2Hours' })).toBeInTheDocument();
  expect(screen.getByText('10:30 am')).toBeInTheDocument();
});

test('updates the selected hour, minutes and period by tapping', () => {
  const onChange = jest.fn();
  render(<StartTimeSelector startTime={10.5} onChange={onChange} t={t} />);

  fireEvent.click(screen.getByRole('button', { name: '2', pressed: false }));
  expect(onChange).toHaveBeenLastCalledWith(2.5);

  fireEvent.click(screen.getByRole('button', { name: ':45', pressed: false }));
  expect(onChange).toHaveBeenLastCalledWith(10.75);

  fireEvent.click(screen.getByRole('button', { name: 'interests.afternoonEvening', pressed: false }));
  expect(onChange).toHaveBeenLastCalledWith(22.5);
});
