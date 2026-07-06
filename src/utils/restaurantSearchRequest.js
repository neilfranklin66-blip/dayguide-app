export const getRestaurantSearchRequestOutcome = async ({
  position,
  cuisines = [],
  price = null,
  searchRestaurantsFn,
}) => {
  try {
    if (!position?.lat) throw new Error('NO_LOCATION');

    const results = await searchRestaurantsFn(position.lat, position.lng, cuisines, price);

    return { results };
  } catch (error) {
    return { error };
  }
};
