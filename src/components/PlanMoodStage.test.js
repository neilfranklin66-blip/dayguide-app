import { fireEvent, render, screen } from '@testing-library/react';
import PlanMoodStage from './PlanMoodStage';

test('offers the three short planning routes without asking for more form detail', () => {
  const onChoose = jest.fn();
  render(<PlanMoodStage onChoose={onChoose} onBack={jest.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: /Food & drink/i }));
  fireEvent.click(screen.getByRole('button', { name: /Things to do/i }));
  fireEvent.click(screen.getByRole('button', { name: /Show me both/i }));

  expect(onChoose).toHaveBeenNthCalledWith(1, 'food');
  expect(onChoose).toHaveBeenNthCalledWith(2, 'activities');
  expect(onChoose).toHaveBeenNthCalledWith(3, 'both');
  expect(screen.queryByLabelText(/postcode/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/^Food$/)).not.toBeInTheDocument();
  expect(screen.queryByText(/^Explore$/)).not.toBeInTheDocument();
  expect(screen.queryByText(/^Both$/)).not.toBeInTheDocument();
});

test('keeps a clear route back to the essential day details', () => {
  const onBack = jest.fn();
  render(<PlanMoodStage onChoose={jest.fn()} onBack={onBack} />);

  fireEvent.click(screen.getByRole('button', { name: /Back to your day details/i }));

  expect(onBack).toHaveBeenCalledTimes(1);
});
