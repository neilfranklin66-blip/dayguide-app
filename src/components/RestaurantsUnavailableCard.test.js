import { render, screen, fireEvent } from '@testing-library/react';
import RestaurantsUnavailableCard from './RestaurantsUnavailableCard';
import {
  RESTAURANT_UNAVAILABLE_REASONS,
  UNAVAILABLE_CATEGORY,
} from '../config/dayGuideOptions';

const t = (key) => key;

const renderCard = (props = {}) =>
  render(
    <RestaurantsUnavailableCard
      restaurantSource="error"
      onRetry={jest.fn()}
      onSkip={jest.fn()}
      t={t}
      {...props}
    />
  );

const RETRYABLE = Object.entries(RESTAURANT_UNAVAILABLE_REASONS)
  .filter(([, reason]) => reason.canRetry)
  .map(([source]) => source);

const NOT_RETRYABLE = Object.entries(RESTAURANT_UNAVAILABLE_REASONS)
  .filter(([, reason]) => !reason.canRetry)
  .map(([source]) => source);

// --- Every reason renders its own message and hint ---

test.each(Object.keys(RESTAURANT_UNAVAILABLE_REASONS))(
  'the %s reason renders its own message and hint, not a generic failure',
  (source) => {
    const { messageKey, hintKey } = RESTAURANT_UNAVAILABLE_REASONS[source];
    renderCard({ restaurantSource: source });

    expect(screen.getByText('restaurants.unavailableTitle')).toBeInTheDocument();
    expect(screen.getByText(`restaurants.${messageKey}`)).toBeInTheDocument();
    expect(screen.getByText(`restaurants.${hintKey}`)).toBeInTheDocument();
  },
);

test('each reason maps to a distinct user-facing message', () => {
  const messages = Object.values(RESTAURANT_UNAVAILABLE_REASONS).map(r => r.messageKey);

  expect(new Set(messages).size).toBe(messages.length);
});

// The three user-actionable location/network reasons must not be flattened
// into the same copy as a DayGuide misconfiguration.
test('a denied location permission reads differently from a missing location', () => {
  expect(RESTAURANT_UNAVAILABLE_REASONS.location_denied.messageKey)
    .not.toBe(RESTAURANT_UNAVAILABLE_REASONS.no_location.messageKey);
});

test('user-fixable, app-side and external reasons are categorised apart', () => {
  expect(RESTAURANT_UNAVAILABLE_REASONS.location_denied.category).toBe(UNAVAILABLE_CATEGORY.USER);
  expect(RESTAURANT_UNAVAILABLE_REASONS.no_location.category).toBe(UNAVAILABLE_CATEGORY.USER);
  expect(RESTAURANT_UNAVAILABLE_REASONS.bad_request.category).toBe(UNAVAILABLE_CATEGORY.APP);
  expect(RESTAURANT_UNAVAILABLE_REASONS.no_key.category).toBe(UNAVAILABLE_CATEGORY.APP);
  expect(RESTAURANT_UNAVAILABLE_REASONS.network.category).toBe(UNAVAILABLE_CATEGORY.EXTERNAL);
  expect(RESTAURANT_UNAVAILABLE_REASONS.error.category).toBe(UNAVAILABLE_CATEGORY.EXTERNAL);
});

test.each([
  ['missing', undefined],
  ['unknown', 'not_a_real_source'],
])('a %s restaurantSource falls back to the generic error reason', (_label, source) => {
  renderCard({ restaurantSource: source });

  expect(screen.getByText('restaurants.unavailableTitle')).toBeInTheDocument();
  expect(screen.getByText('restaurants.errorWarning')).toBeInTheDocument();
  expect(screen.getByText('restaurants.errorHint')).toBeInTheDocument();
});

// --- Retry is only offered where it could honestly succeed ---

test.each(RETRYABLE)('the retryable %s reason offers a try-again button', (source) => {
  renderCard({ restaurantSource: source });

  expect(screen.getByText('restaurants.tryAgain')).toBeInTheDocument();
});

// Re-running an identical search against an unconfigured key or an exhausted
// quota fails identically. Offering "Try again" there would be a lie.
test.each(NOT_RETRYABLE)('the non-retryable %s reason hides the try-again button', (source) => {
  renderCard({ restaurantSource: source });

  expect(screen.queryByText('restaurants.tryAgain')).not.toBeInTheDocument();
  expect(screen.getByText('restaurants.skipAndContinue')).toBeInTheDocument();
});

test('a retryable reason still hides try-again when no onRetry handler is supplied', () => {
  renderCard({ restaurantSource: 'network', onRetry: undefined });

  expect(screen.queryByText('restaurants.tryAgain')).not.toBeInTheDocument();
  expect(screen.getByText('restaurants.skipAndContinue')).toBeInTheDocument();
});

test('clicking try again calls onRetry exactly once', () => {
  const onRetry = jest.fn();
  renderCard({ restaurantSource: 'network', onRetry });

  fireEvent.click(screen.getByText('restaurants.tryAgain'));

  expect(onRetry).toHaveBeenCalledTimes(1);
});

// Retry re-runs the search; if the click event leaked through as an argument it
// could be consumed as `cuisineOverride`, repeating the Packet 103 bug.
test('onRetry is called with zero arguments, never the click event', () => {
  const onRetry = jest.fn();
  renderCard({ restaurantSource: 'network', onRetry });

  fireEvent.click(screen.getByText('restaurants.tryAgain'));

  expect(onRetry).toHaveBeenCalledWith();
});

// --- Skipping always stays available ---

test('clicking skip and continue calls onSkip exactly once', () => {
  const onSkip = jest.fn();
  renderCard({ onSkip });

  fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

  expect(onSkip).toHaveBeenCalledTimes(1);
});

test('onSkip is called with zero arguments, never the click event', () => {
  const onSkip = jest.fn();
  renderCard({ onSkip });

  fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

  expect(onSkip).toHaveBeenCalledWith();
});

test('with the stage-style wrapper, the continue handler gets [] and never the click event', () => {
  const continueAfterRestaurants = jest.fn();
  renderCard({ onSkip: () => continueAfterRestaurants([]) });

  fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

  expect(continueAfterRestaurants).toHaveBeenCalledTimes(1);
  expect(continueAfterRestaurants).toHaveBeenCalledWith([]);
});

test.each(Object.keys(RESTAURANT_UNAVAILABLE_REASONS))(
  'the %s reason always lets the user carry on without a restaurant',
  (source) => {
    const onSkip = jest.fn();
    renderCard({ restaurantSource: source, onSkip });

    fireEvent.click(screen.getByText('restaurants.skipAndContinue'));

    expect(onSkip).toHaveBeenCalledTimes(1);
  },
);
