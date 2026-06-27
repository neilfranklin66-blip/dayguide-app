export const getRestaurantSourceFromError = (error) => {
  const message = error?.message;

  if (message === 'NO_API_KEY') return 'no_key';
  if (message === 'QUOTA_EXCEEDED') return 'quota';
  if (message === 'NO_LOCATION') return 'no_location';

  return 'error';
};
