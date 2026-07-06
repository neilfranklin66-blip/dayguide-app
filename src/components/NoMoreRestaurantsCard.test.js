import { render, screen, fireEvent } from '@testing-library/react';
import NoMoreRestaurantsCard from './NoMoreRestaurantsCard';

const t = (key) => key;

test('continue button calls onContinue with zero arguments, not the click event', () => {
  const onContinue = jest.fn();
  render(<NoMoreRestaurantsCard onContinue={onContinue} nextRoute="activities" t={t} />);

  fireEvent.click(screen.getByText('restaurants.continueToActivities'));

  expect(onContinue).toHaveBeenCalledTimes(1);
  expect(onContinue).toHaveBeenCalledWith();
});
