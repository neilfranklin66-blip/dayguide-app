import { fireEvent, render, screen } from '@testing-library/react';
import TapTimePicker from './TapTimePicker';

const t = (key, options) => options?.defaultValue ?? key;

test('uses taps only and leaves an optional time unset until all parts are chosen', () => {
  const onChange = jest.fn();
  render(
    <TapTimePicker
      heading="What time do you need to be there?"
      summaryLabel="Arrive by this time"
      onChange={onChange}
      t={t}
    />,
  );

  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  expect(screen.getAllByText('No fixed time')).toHaveLength(2);

  fireEvent.click(screen.getByRole('button', { name: 'Afternoon / evening' }));
  fireEvent.click(screen.getByRole('button', { name: '10' }));
  expect(onChange).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: ':30' }));
  expect(onChange).toHaveBeenCalledWith(22 * 60 + 30);
  expect(screen.getByText('10:30 pm')).toBeInTheDocument();
});

test('clears an optional time deliberately', () => {
  const onClear = jest.fn();
  render(
    <TapTimePicker
      value={22 * 60 + 30}
      heading="What time do you need to be there?"
      summaryLabel="Arrive by this time"
      onChange={jest.fn()}
      onClear={onClear}
      t={t}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'No fixed time' }));
  expect(onClear).toHaveBeenCalledTimes(1);
  expect(screen.getAllByText('No fixed time')).toHaveLength(2);
});
