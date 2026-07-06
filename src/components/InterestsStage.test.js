import { render, screen, fireEvent } from '@testing-library/react';
import InterestsStage from './InterestsStage';

const t = (key) => key;

const baseProps = {
  interestCategories: [{ id: 'museums', icon: '🏛️', label: 'Museums' }],
  selectedInterests: [],
  toggleInterest: jest.fn(),
  cuisineCategories: [{ id: 'italian', icon: '🍕' }],
  selectedCuisines: [],
  toggleCuisine: jest.fn(),
  selectedPriceRange: null,
  setSelectedPriceRange: jest.fn(),
  availableTime: 4,
  setAvailableTime: jest.fn(),
  selectedDate: '2026-07-05',
  setSelectedDate: jest.fn(),
  startTime: 10,
  setStartTime: jest.fn(),
  hasChildren: false,
  setHasChildren: jest.fn(),
  startWith: 'activities',
  setStartWith: jest.fn(),
  goToNextSelectionStage: jest.fn(),
  t,
};

test('renders interests stage sections', () => {
  render(<InterestsStage {...baseProps} />);

  expect(screen.getByText('interests.title')).toBeInTheDocument();
  expect(screen.getByText('Museums')).toBeInTheDocument();
  expect(screen.getByText('cuisine.italian')).toBeInTheDocument();
});

test('clicking an interest calls toggleInterest with its id', () => {
  const toggleInterest = jest.fn();
  render(<InterestsStage {...baseProps} toggleInterest={toggleInterest} />);

  fireEvent.click(screen.getByText('Museums'));

  expect(toggleInterest).toHaveBeenCalledWith('museums');
});

test('next button is disabled until an interest is selected', () => {
  const { rerender } = render(<InterestsStage {...baseProps} />);
  expect(screen.getByText('interests.next')).toBeDisabled();

  rerender(<InterestsStage {...baseProps} selectedInterests={['museums']} />);
  expect(screen.getByText('interests.next')).toBeEnabled();
});
