import { render, screen, fireEvent } from '@testing-library/react';
import TimelineActionButtons from './TimelineActionButtons';

const t = (key) => key;

const baseProps = {
  onStartOver: jest.fn(),
  onShare: jest.fn(),
  t,
};

test('renders the start-over and share buttons', () => {
  render(<TimelineActionButtons {...baseProps} />);

  expect(screen.getByText('timeline.startOver')).toBeInTheDocument();
  expect(screen.getByText('timeline.share')).toBeInTheDocument();
});

test('does not render a Book Now button', () => {
  render(<TimelineActionButtons {...baseProps} />);

  expect(screen.queryByText('timeline.bookNow')).not.toBeInTheDocument();
  expect(screen.getAllByRole('button')).toHaveLength(2);
});

test('clicking start over calls onStartOver', () => {
  const onStartOver = jest.fn();
  render(<TimelineActionButtons {...baseProps} onStartOver={onStartOver} />);

  fireEvent.click(screen.getByText('timeline.startOver'));

  expect(onStartOver).toHaveBeenCalled();
});

test('clicking share calls onShare', () => {
  const onShare = jest.fn();
  render(<TimelineActionButtons {...baseProps} onShare={onShare} />);

  fireEvent.click(screen.getByText('timeline.share'));

  expect(onShare).toHaveBeenCalled();
});
