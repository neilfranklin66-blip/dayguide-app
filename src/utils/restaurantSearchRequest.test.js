import { getRestaurantSearchRequestOutcome } from './restaurantSearchRequest';

describe('restaurantSearchRequest', () => {
  test('returns live search results when position is available', async () => {
    const results = [{ name: 'Live Cafe' }];
    const searchRestaurantsFn = jest.fn().mockResolvedValue(results);

    await expect(getRestaurantSearchRequestOutcome({
      position: { lat: 51.5, lng: -0.1 },
      cuisines: ['italian'],
      price: 'moderate',
      searchRestaurantsFn,
    })).resolves.toEqual({ results });

    expect(searchRestaurantsFn).toHaveBeenCalledWith(
      51.5,
      -0.1,
      ['italian'],
      'moderate',
    );
  });

  test('returns a NO_LOCATION error outcome when latitude is missing', async () => {
    const searchRestaurantsFn = jest.fn();

    const outcome = await getRestaurantSearchRequestOutcome({
      position: null,
      cuisines: ['indian'],
      price: null,
      searchRestaurantsFn,
    });

    expect(outcome.error).toBeInstanceOf(Error);
    expect(outcome.error.message).toBe('NO_LOCATION');
    expect(searchRestaurantsFn).not.toHaveBeenCalled();
  });

  test('returns an error outcome when the live search rejects', async () => {
    const error = new Error('NO_API_KEY');
    const searchRestaurantsFn = jest.fn().mockRejectedValue(error);

    await expect(getRestaurantSearchRequestOutcome({
      position: { lat: 51.5, lng: -0.1 },
      cuisines: [],
      price: null,
      searchRestaurantsFn,
    })).resolves.toEqual({ error });
  });
});
