import { fireEvent, render, screen } from '@testing-library/react';
import PlanMoodStage from './PlanMoodStage';
import nearbyFoodImage from '../assets/nearby-food-restaurant.jpg';
import nearbyThingsImage from '../assets/nearby-things-tower-bridge.jpg';

test('offers the three short planning routes without asking for more form detail', () => {
  const onChoose = jest.fn();
  const { container } = render(<PlanMoodStage onChoose={onChoose} onBack={jest.fn()} />);

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
  expect(screen.queryByText('Find somewhere good to eat or have a coffee.')).not.toBeInTheDocument();
  expect(screen.queryByText('Find a place worth seeing, doing or exploring.')).not.toBeInTheDocument();
  expect(screen.queryByText('Start with something to do, then add food if you want it.')).not.toBeInTheDocument();
  expect(container.querySelector('.plan-mood-option--food img')).toHaveAttribute('src', nearbyFoodImage);
  expect(container.querySelector('.plan-mood-option--activities img')).toHaveAttribute('src', nearbyThingsImage);
});

test('keeps a clear route back to the essential day details', () => {
  const onBack = jest.fn();
  render(<PlanMoodStage onChoose={jest.fn()} onBack={onBack} />);

  fireEvent.click(screen.getByRole('button', { name: /Back to your day details/i }));

  expect(onBack).toHaveBeenCalledTimes(1);
});
