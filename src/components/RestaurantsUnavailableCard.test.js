import { render, screen, fireEvent } from '@testing-library/react';
import RestaurantsUnavailableCard from './RestaurantsUnavailableCard';

const t = (key) => key;

const renderCard = (props = {}) =>
  render(
    <RestaurantsUnavailableCard
      restaurantSource="error"
      onSkip={jest.fn()}
      t={t}
      {...props}
    />
  );

test.each([
  ['no_key', 'restaurants.noKeyWarning'],
  ['quota', 'restaurants.quotaWarning'],
  ['no_location', 'restaurants.noLocationWarning'],
  ['error', 'restaurants.errorWarning'],
])('renders the unavailable title and the %s reason', (source, reasonKey) => {
  renderCard({ restaurantSource: source });

  expect(screen.getByText('restaurants.unavailableTitle')).toBeInTheDocument();
  expect(screen.getByText(reasonKey)).toBeInTheDocument();
});

test.each([
  ['missing', undefined],
  ['unknown', 'not_a_real_source'],
])('a %s restaurantSource falls back to the generic error reason', (_label, source) => {
  renderCard({ restaurantSource: source });

  expect(screen.getByText('restaurants.unavailableTitle')).toBeInTheDocument();
  expect(screen.getByText('restaurants.errorWarning')).toBeInTheDocument();
});

test('clicking skip and continue calls onSkip exactly once', () => {
  const onSkip = jest.fn();
  renderCard({ onSkip });

  fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

  expect(onSkip).toHaveBeenCalledTimes(1);
});

// onSkip is wired straight to onClick, so it receives the raw click event.
// Callers must therefore supply a zero-argument wrapper — plugging a
// data-taking handler in directly would repeat the Packet 103 bug where a
// click event was consumed as cuisines.
test('onSkip receives the click event, so callers must wrap data-taking handlers', () => {
  const onSkip = jest.fn();
  renderCard({ onSkip });

  fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

  expect(onSkip.mock.calls[0][0]).toHaveProperty('type', 'click');
});

test('with the stage-style wrapper, the continue handler gets [] and never the click event', () => {
  const continueAfterRestaurants = jest.fn();
  renderCard({ onSkip: () => continueAfterRestaurants([]) });

  fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

  expect(continueAfterRestaurants).toHaveBeenCalledTimes(1);
  expect(continueAfterRestaurants).toHaveBeenCalledWith([]);
});
