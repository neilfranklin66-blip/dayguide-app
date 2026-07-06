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

test('children selector renders via t keys and reports the choice', () => {
  const setHasChildren = jest.fn();
  render(<InterestsStage {...baseProps} hasChildren={null} setHasChildren={setHasChildren} />);

  expect(screen.getByText('interests.childrenLabel')).toBeInTheDocument();

  fireEvent.click(screen.getByText('interests.childrenYes'));
  expect(setHasChildren).toHaveBeenCalledWith(true);

  fireEvent.click(screen.getByText('interests.childrenNo'));
  expect(setHasChildren).toHaveBeenCalledWith(false);
});

test('next button is disabled until an interest is selected', () => {
  const { rerender } = render(<InterestsStage {...baseProps} />);
  expect(screen.getByText('interests.next')).toBeDisabled();

  rerender(<InterestsStage {...baseProps} selectedInterests={['museums']} />);
  expect(screen.getByText('interests.next')).toBeEnabled();
});
