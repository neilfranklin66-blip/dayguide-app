import { fireEvent, render, screen } from '@testing-library/react';
import StartTimeSelector from './StartTimeSelector';

const t = (key, fallback) => fallback ?? key;

test('uses a direct text field rather than the browser time wheel', () => {
  const onChange = jest.fn();
  render(<StartTimeSelector startTime={10.5} onChange={onChange} t={t} />);

  const input = screen.getByLabelText('interests.startTimeLabel');
  expect(input).toHaveValue('10:30');
  expect(input).toHaveAttribute('type', 'text');
  expect(input).toHaveAttribute('inputmode', 'numeric');

  fireEvent.change(input, { target: { value: '16:00' } });
  fireEvent.blur(input);
  expect(onChange).toHaveBeenCalledWith(16);
});

test('accepts a compact typed time for phone number pads', () => {
  const onChange = jest.fn();
  render(<StartTimeSelector startTime={16.5} onChange={onChange} t={t} />);

  const input = screen.getByLabelText('interests.startTimeLabel');
  fireEvent.change(input, { target: { value: '1645' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.blur(input);
  expect(onChange).toHaveBeenCalledWith(16.75);
});
