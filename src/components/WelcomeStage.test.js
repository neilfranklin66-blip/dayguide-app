import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeStage from './WelcomeStage';

const t = (key) => key;

const baseProps = {
  t,
  locationLoading: false,
  locationError: null,
  position: { lat: 51.50722, lng: -0.1275, accuracy: 12 },
  refreshLocation: jest.fn(),
  onStartPlanning: jest.fn(),
};

test('renders welcome copy and detected location', () => {
  render(<WelcomeStage {...baseProps} />);

  expect(screen.getByText('welcome.tagline')).toBeInTheDocument();
  expect(screen.getByText(/51\.50722, -0\.12750/)).toBeInTheDocument();
});

test('clicking start planning calls onStartPlanning', () => {
  const onStartPlanning = jest.fn();
  render(<WelcomeStage {...baseProps} onStartPlanning={onStartPlanning} />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  expect(onStartPlanning).toHaveBeenCalledTimes(1);
});

test('resume button is hidden without a saved plan', () => {
  render(<WelcomeStage {...baseProps} hasSavedPlan={false} onResume={jest.fn()} />);

  expect(screen.queryByText('welcome.resumePlan')).not.toBeInTheDocument();
});

test('clicking resume calls onResume when a saved plan exists', () => {
  const onResume = jest.fn();
  render(<WelcomeStage {...baseProps} hasSavedPlan={true} onResume={onResume} />);

  fireEvent.click(screen.getByText('welcome.resumePlan'));

  expect(onResume).toHaveBeenCalledTimes(1);
});
