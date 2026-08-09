import { fireEvent, render, screen } from '@testing-library/react';
import DirectTimeInput from './DirectTimeInput';

test('uses the same typed time control without a browser time wheel', () => {
  const onChange = jest.fn();
  render(
    <DirectTimeInput
      id="arrival-time"
      label="What time do you need to be there?"
      value=""
      onChange={onChange}
      allowEmpty
    />,
  );

  const input = screen.getByLabelText('What time do you need to be there?');
  expect(input).toHaveAttribute('type', 'text');
  fireEvent.change(input, { target: { value: '1830' } });
  fireEvent.blur(input);

  expect(onChange).toHaveBeenCalledWith('18:30');
});
