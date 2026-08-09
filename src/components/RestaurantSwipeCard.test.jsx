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
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('shows a credited live photo with direct access to its Google Maps source', () => {
  render(
    <RestaurantSwipeCard
      currentRestaurant={{
        name: "Sophia's Italian Restaurant",
        cuisine: ['italian'],
        venueType: 'Italian Restaurant',
        image: '/.netlify/functions/places-photo?ref=places/sophias/photos/live',
        photoAttributions: [{
          name: 'A contributor',
          uri: 'https://www.google.com/maps/contrib/a-contributor',
          photoUri: 'https://lh3.googleusercontent.com/avatar',
        }],
        photoMapsUrl: 'https://www.google.com/maps/photo/source',
        address: 'Northampton',
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

  expect(screen.getByRole('img', { name: "Sophia's Italian Restaurant" })).toHaveAttribute(
    'src', '/.netlify/functions/places-photo?ref=places/sophias/photos/live',
  );
  expect(screen.getByText('restaurants.photoBy')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'A contributor' })).toHaveAttribute(
    'href', 'https://www.google.com/maps/contrib/a-contributor',
  );
  expect(screen.getByRole('link', { name: 'restaurants.viewPhotoOnMaps' })).toHaveAttribute(
    'href', 'https://www.google.com/maps/photo/source',
  );
});
