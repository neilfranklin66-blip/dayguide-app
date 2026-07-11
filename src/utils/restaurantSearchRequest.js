// A coordinate is usable only if it is a real finite number. `!position.lat`
// would reject a latitude of exactly 0 (the equator) and a longitude of 0
// (the Greenwich meridian, i.e. much of London), so test finiteness instead.
const isUsableCoordinate = (value) => typeof value === 'number' && Number.isFinite(value);

const hasUsablePosition = (position) =>
  isUsableCoordinate(position?.lat) && isUsableCoordinate(position?.lng);

/**
 * Classify why we cannot search, given no usable position. `locationError` is
 * the key produced by useGeolocation, and it is the only thing that can tell a
 * denied browser permission apart from a location we simply never received.
 */
const getLocationErrorMessage = (locationError) =>
  locationError === 'location.denied' ? 'LOCATION_DENIED' : 'NO_LOCATION';

/**
 * Build and run one live restaurant search, returning `{ results }` or
 * `{ error }`. The error's message is the machine-readable reason, which
 * restaurantEngine maps onto a user-facing source label.
 *
 * Reasons raised here:
 *   'LOCATION_DENIED'    — the browser refused location permission (user-fixable)
 *   'NO_LOCATION'        — no usable coordinates for any other reason
 *   'INCOMPLETE_REQUEST' — DayGuide never supplied a search function; the
 *                          request could not be formed. An app bug, not the
 *                          user's problem and not the provider's.
 */
export const getRestaurantSearchRequestOutcome = async ({
  position,
  locationError = null,
  cuisines = [],
  price = null,
  searchRestaurantsFn,
}) => {
  try {
    if (!hasUsablePosition(position)) {
      throw new Error(getLocationErrorMessage(locationError));
    }

    if (typeof searchRestaurantsFn !== 'function') {
      throw new Error('INCOMPLETE_REQUEST');
    }

    const results = await searchRestaurantsFn(position.lat, position.lng, cuisines, price);

    return { results };
  } catch (error) {
    return { error };
  }
};
