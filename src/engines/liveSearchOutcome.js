// Maps a machine-readable live-search failure onto the source label the UI
// explains. An unfamiliar error remains an honest generic failure: it is never
// treated as a successful search and never causes a sample fallback.
export const ERROR_MESSAGE_TO_SOURCE = {
  NO_API_KEY: 'no_key',
  API_DENIED: 'no_key',
  QUOTA_EXCEEDED: 'quota',
  INCOMPLETE_REQUEST: 'bad_request',
  NO_LOCATION: 'no_location',
  LOCATION_DENIED: 'location_denied',
  NETWORK_ERROR: 'network',
};

export const getLiveSearchSourceFromError = (error) =>
  ERROR_MESSAGE_TO_SOURCE[error?.message] ?? 'error';
