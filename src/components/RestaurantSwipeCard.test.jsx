import { render, screen } from '@testing-library/react';
import RestaurantSwipeCard from './RestaurantSwipeCard';

const t = key => key;

test('keeps a long live venue name intact and available as the heading title', () => {
  const name = 'YO! Daventry Tesco Kiosk — Sushi Restaurant and Takeaway';
  render(
    <RestaurantSwipeCard
      currentRestaurant={{
        name,
        cuisine: ['japanese'],
        venueType: 'Sushi Restaurant',
        image: null,
        address: 'Tesco, Daventry',
      }}
      currentRestaurantIndex={0}
      restaurantQueueLength={1}
      restaurantSource="live"
      recommendationReason="A live nearby option."
      onSwipe={jest.fn()}
      onBuild={jest.fn()}
      t={t}
    />,
  );

  expect(screen.getByRole('heading', { name })).toHaveAttribute('title', name);
});
