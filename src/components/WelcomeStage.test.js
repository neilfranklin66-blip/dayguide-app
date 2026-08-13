import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeStage from './WelcomeStage';

const t = (key) => key;

const baseProps = {
  t,
  onStartPlanning: jest.fn(),
  onFindNearby: jest.fn(),
};

test('renders the two welcome choices without a location prompt', () => {
  render(<WelcomeStage {...baseProps} />);

  expect(screen.getByText('welcome.tagline')).toBeInTheDocument();
  expect(screen.getByText('welcome.findNearby')).toBeInTheDocument();
  expect(screen.getByText('welcome.startPlanning')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('clicking start planning calls onStartPlanning', () => {
  const onStartPlanning = jest.fn();
  render(<WelcomeStage {...baseProps} onStartPlanning={onStartPlanning} />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  expect(onStartPlanning).toHaveBeenCalledTimes(1);
});

test('clicking find nearby calls onFindNearby without starting the planning form', () => {
  const onFindNearby = jest.fn();
  render(<WelcomeStage {...baseProps} onFindNearby={onFindNearby} />);

  fireEvent.click(screen.getByText('welcome.findNearby'));

  expect(onFindNearby).toHaveBeenCalledTimes(1);
});

test('resume button is hidden without a saved plan', () => {
  render(<WelcomeStage {...baseProps} savedPlanSummary={null} onResume={jest.fn()} />);

  expect(screen.queryByText('welcome.resumePlan')).not.toBeInTheDocument();
  expect(screen.queryByText(/welcome\.resumePlanDetails/)).not.toBeInTheDocument();
});

test('clicking resume calls onResume when a saved plan exists', () => {
  const onResume = jest.fn();
  render(
    <WelcomeStage
      {...baseProps}
      savedPlanSummary={{ selectedDate: '2026-07-05', itemCount: 3 }}
      onResume={onResume}
    />,
  );

  fireEvent.click(screen.getByText('welcome.resumePlan'));

  expect(onResume).toHaveBeenCalledTimes(1);
});

test('resume details line shows the plan date and stop count', () => {
  const paramAwareT = (key, params) => (params ? `${key} count=${params.count}` : key);
  render(
    <WelcomeStage
      {...baseProps}
      t={paramAwareT}
      savedPlanSummary={{ selectedDate: '2026-07-05', itemCount: 3 }}
      onResume={jest.fn()}
    />,
  );

  expect(screen.getByText(/📅 2026-07-05/)).toBeInTheDocument();
  expect(screen.getByText(/welcome\.resumePlanDetails count=3/)).toBeInTheDocument();
});

test('resume details line omits the date when selectedDate is absent', () => {
  const paramAwareT = (key, params) => (params ? `${key} count=${params.count}` : key);
  render(
    <WelcomeStage
      {...baseProps}
      t={paramAwareT}
      savedPlanSummary={{ itemCount: 2 }}
      onResume={jest.fn()}
    />,
  );

  expect(screen.getByText(/welcome\.resumePlanDetails count=2/)).toBeInTheDocument();
  expect(screen.queryByText(/📅/)).not.toBeInTheDocument();
});
