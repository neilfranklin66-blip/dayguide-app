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

  test('defaults cuisines to an empty list and price to null when omitted', async () => {
    const results = [{ name: 'Default Diner' }];
    const searchRestaurantsFn = jest.fn().mockResolvedValue(results);

    await expect(getRestaurantSearchRequestOutcome({
      position: { lat: 51.5, lng: -0.1 },
      searchRestaurantsFn,
    })).resolves.toEqual({ results });

    expect(searchRestaurantsFn).toHaveBeenCalledWith(51.5, -0.1, [], null);
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

  test('returns a NO_LOCATION error outcome when position has no lat property', async () => {
    const searchRestaurantsFn = jest.fn();

    const outcome = await getRestaurantSearchRequestOutcome({
      position: { lng: -0.1 },
      cuisines: [],
      price: null,
      searchRestaurantsFn,
    });

    expect(outcome.error).toBeInstanceOf(Error);
    expect(outcome.error.message).toBe('NO_LOCATION');
    expect(searchRestaurantsFn).not.toHaveBeenCalled();
  });

  // A half-populated position used to pass the old `!position?.lat` guard and
  // reach Google Places as "51.5,undefined". Never issue that request.
  test('a position with a latitude but no longitude is NO_LOCATION, and never searched', async () => {
    const searchRestaurantsFn = jest.fn();

    const outcome = await getRestaurantSearchRequestOutcome({
      position: { lat: 51.5 },
      searchRestaurantsFn,
    });

    expect(outcome.error.message).toBe('NO_LOCATION');
    expect(searchRestaurantsFn).not.toHaveBeenCalled();
  });

  test.each([
    ['a non-finite latitude', { lat: NaN, lng: -0.1 }],
    ['an infinite longitude', { lat: 51.5, lng: Infinity }],
    ['string coordinates', { lat: '51.5', lng: '-0.1' }],
  ])('%s is treated as no usable location', async (_label, position) => {
    const searchRestaurantsFn = jest.fn();

    const outcome = await getRestaurantSearchRequestOutcome({ position, searchRestaurantsFn });

    expect(outcome.error.message).toBe('NO_LOCATION');
    expect(searchRestaurantsFn).not.toHaveBeenCalled();
  });

  // Zero is a real coordinate: the equator, and the Greenwich meridian that
  // runs through London. The old truthiness guard rejected lat: 0 outright.
  test('a zero latitude and longitude are searched, not rejected as missing', async () => {
    const results = [{ name: 'Null Island Grill' }];
    const searchRestaurantsFn = jest.fn().mockResolvedValue(results);

    await expect(getRestaurantSearchRequestOutcome({
      position: { lat: 0, lng: 0 },
      searchRestaurantsFn,
    })).resolves.toEqual({ results });

    expect(searchRestaurantsFn).toHaveBeenCalledWith(0, 0, [], null);
  });

  // --- Distinguishing why the location is missing ---

  test('a denied browser permission produces LOCATION_DENIED, not a generic NO_LOCATION', async () => {
    const searchRestaurantsFn = jest.fn();

    const outcome = await getRestaurantSearchRequestOutcome({
      position: null,
      locationError: 'location.denied',
      searchRestaurantsFn,
    });

    expect(outcome.error.message).toBe('LOCATION_DENIED');
    expect(searchRestaurantsFn).not.toHaveBeenCalled();
  });

  test.each([
    ['location.unavailable'],
    ['location.notSupported'],
  ])('a %s location error stays NO_LOCATION', async (locationError) => {
    const outcome = await getRestaurantSearchRequestOutcome({
      position: null,
      locationError,
      searchRestaurantsFn: jest.fn(),
    });

    expect(outcome.error.message).toBe('NO_LOCATION');
  });

  // A stale-but-usable fix beats a later permission revocation: we can still
  // search, so we must not refuse and blame the user's browser settings.
  test('a usable position wins over a stale denied location error', async () => {
    const results = [{ name: 'Cached Cafe' }];
    const searchRestaurantsFn = jest.fn().mockResolvedValue(results);

    await expect(getRestaurantSearchRequestOutcome({
      position: { lat: 51.5, lng: -0.1 },
      locationError: 'location.denied',
      searchRestaurantsFn,
    })).resolves.toEqual({ results });
  });

  // --- Incomplete request: DayGuide's bug, not the user's or the provider's ---

  test.each([
    ['omitted', undefined],
    ['not a function', 'searchRestaurants'],
  ])('an %s search function produces INCOMPLETE_REQUEST', async (_label, searchRestaurantsFn) => {
    const outcome = await getRestaurantSearchRequestOutcome({
      position: { lat: 51.5, lng: -0.1 },
      searchRestaurantsFn,
    });

    expect(outcome.error.message).toBe('INCOMPLETE_REQUEST');
  });

  // Location is the more actionable of the two, and the one the user can fix.
  test('a missing location is reported ahead of a missing search function', async () => {
    const outcome = await getRestaurantSearchRequestOutcome({
      position: null,
      searchRestaurantsFn: undefined,
    });

    expect(outcome.error.message).toBe('NO_LOCATION');
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
