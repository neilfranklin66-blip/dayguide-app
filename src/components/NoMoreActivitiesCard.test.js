import { render, screen, fireEvent } from '@testing-library/react';
import NoMoreActivitiesCard from './NoMoreActivitiesCard';

const t = (key) => key;

test('continue button calls onContinue with zero arguments, not the click event', () => {
  const onContinue = jest.fn();
  render(<NoMoreActivitiesCard onContinue={onContinue} nextRoute="restaurants" t={t} />);

  fireEvent.click(screen.getByText('activities.continueToRestaurants'));

  expect(onContinue).toHaveBeenCalledTimes(1);
  expect(onContinue).toHaveBeenCalledWith();
});
