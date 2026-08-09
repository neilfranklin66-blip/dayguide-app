import { fireEvent, render, screen } from '@testing-library/react';
import StartTimeSelector from './StartTimeSelector';

const t = (key, fallback) => fallback ?? key;

test('keeps a direct time input for keyboard entry', () => {
  const onChange = jest.fn();
  render(<StartTimeSelector startTime={10.5} onChange={onChange} t={t} />);

  const input = screen.getByLabelText('interests.startTimeLabel');
  expect(input).toHaveValue('10:30');
  expect(input).toHaveAttribute('step', '900');

  fireEvent.change(input, { target: { value: '16:00' } });
  expect(onChange).toHaveBeenCalledWith(16);
});

test('offers large one-tap quarter-hour minute choices', () => {
  const onChange = jest.fn();
  render(<StartTimeSelector startTime={16.5} onChange={onChange} t={t} />);

  fireEvent.click(screen.getByRole('button', { name: ':00' }));
  expect(onChange).toHaveBeenCalledWith(16);

  fireEvent.click(screen.getByRole('button', { name: ':45' }));
  expect(onChange).toHaveBeenCalledWith(16.75);
});
