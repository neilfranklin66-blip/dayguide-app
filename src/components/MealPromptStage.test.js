import { render, screen, fireEvent } from '@testing-library/react';
import MealPromptStage from './MealPromptStage';

const t = (key) => key;

const baseProps = {
  goToRestaurants: jest.fn(),
  continueAfterRestaurants: jest.fn(),
  t,
};

test('renders the meal prompt copy', () => {
  render(<MealPromptStage {...baseProps} />);

  expect(screen.getByText('mealPrompt.title')).toBeInTheDocument();
  expect(screen.getByText('mealPrompt.subtitle')).toBeInTheDocument();
});

test('choosing yes calls goToRestaurants', () => {
  const goToRestaurants = jest.fn();
  render(<MealPromptStage {...baseProps} goToRestaurants={goToRestaurants} />);

  fireEvent.click(screen.getByText('mealPrompt.yes'));

  expect(goToRestaurants).toHaveBeenCalled();
});

test('choosing no calls continueAfterRestaurants with no restaurants', () => {
  const continueAfterRestaurants = jest.fn();
  render(
    <MealPromptStage
      {...baseProps}
      continueAfterRestaurants={continueAfterRestaurants}
    />
  );

  fireEvent.click(screen.getByText('mealPrompt.no'));

  expect(continueAfterRestaurants).toHaveBeenCalledWith([]);
});
