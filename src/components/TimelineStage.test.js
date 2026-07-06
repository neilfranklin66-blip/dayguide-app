import { render, screen, fireEvent } from '@testing-library/react';
import TimelineStage from './TimelineStage';

const t = (key) => key;

const timelineItem = {
  id: 1,
  time: '10:00',
  icon: '🏛️',
  category: 'museums',
  activity: 'City Museum',
  duration: 2,
  rating: 4.5,
  distance: 1.2,
  address: '1 Museum Street',
};

const baseProps = {
  timeline: [timelineItem],
  startTime: 10,
  availableTime: 6,
  hasChildren: false,
  selectedCuisines: [],
  selectedPriceRange: null,
  selectedDate: '2026-07-05',
  startWith: 'activities',
  updateActivityDuration: jest.fn(),
  resetState: jest.fn(),
  setShowQR: jest.fn(),
  t,
};

test('renders the timeline with its items', () => {
  render(<TimelineStage {...baseProps} />);

  expect(screen.getByText('timeline.title')).toBeInTheDocument();
  expect(screen.getByText('City Museum')).toBeInTheDocument();
  expect(screen.getByText('10:00')).toBeInTheDocument();
});

test('renders the selected date in the header summary', () => {
  render(<TimelineStage {...baseProps} />);

  expect(screen.getByText('📅 2026-07-05')).toBeInTheDocument();
});

test('does not render a date line when no date is selected', () => {
  render(<TimelineStage {...baseProps} selectedDate={undefined} />);

  expect(screen.queryByText(/📅/)).not.toBeInTheDocument();
});

test('clicking share opens the QR modal', () => {
  const setShowQR = jest.fn();
  render(<TimelineStage {...baseProps} setShowQR={setShowQR} />);

  fireEvent.click(screen.getByText('timeline.share'));

  expect(setShowQR).toHaveBeenCalledWith(true);
});

test('renders the empty state when the timeline has no items', () => {
  render(<TimelineStage {...baseProps} timeline={[]} />);

  expect(screen.getByText('timeline.empty')).toBeInTheDocument();
});

const budgetStrings = {
  'timeline.budget.planned': 'Planned: {{planned}} · Available: {{available}}',
  'timeline.budget.over': 'Over by {{amount}}',
  'timeline.budget.within': '{{amount}} to spare',
  'timeline.budget.exact': 'Fits exactly',
};

const tWithBudgetValues = (key, options) => {
  const template = budgetStrings[key] ?? key;
  if (typeof options !== 'object' || options === null) return template;
  return Object.entries(options).reduce(
    (text, [name, value]) => text.replace(`{{${name}}}`, value),
    template,
  );
};

test('timeline header shows planned and available time', () => {
  render(<TimelineStage {...baseProps} t={tWithBudgetValues} />);

  expect(screen.getByText('Planned: 2h · Available: 6h')).toBeInTheDocument();
});

test('within-budget plan shows the remaining time', () => {
  render(<TimelineStage {...baseProps} t={tWithBudgetValues} />);

  expect(screen.getByText('4h to spare')).toBeInTheDocument();
  expect(screen.queryByText(/Over by/)).not.toBeInTheDocument();
});

test('over-budget plan shows the overage', () => {
  render(<TimelineStage {...baseProps} availableTime={1} t={tWithBudgetValues} />);

  expect(screen.getByText('Planned: 2h · Available: 1h')).toBeInTheDocument();
  expect(screen.getByText('Over by 1h')).toBeInTheDocument();
  expect(screen.queryByText(/to spare/)).not.toBeInTheDocument();
});

test('plan that exactly matches the budget says it fits', () => {
  render(
    <TimelineStage
      {...baseProps}
      timeline={[{ ...timelineItem, duration: 6 }]}
      t={tWithBudgetValues}
    />,
  );

  expect(screen.getByText('Fits exactly')).toBeInTheDocument();
});

test('empty timeline shows no time-budget text', () => {
  render(<TimelineStage {...baseProps} timeline={[]} t={tWithBudgetValues} />);

  expect(screen.queryByText(/Planned:/)).not.toBeInTheDocument();
  expect(screen.queryByText(/to spare|Over by|Fits exactly/)).not.toBeInTheDocument();
});
