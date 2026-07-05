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
