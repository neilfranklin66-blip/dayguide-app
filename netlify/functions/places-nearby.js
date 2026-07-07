exports.handler = async (event) => {
  // Server-side only — must NOT use a REACT_APP_* name, or CRA would embed
  // the key into the client bundle.
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REQUEST_DENIED', error_message: 'NO_API_KEY' }),
    };
  }

  const { location, radius, type, keyword, maxprice } = event.queryStringParameters || {};

  const params = new URLSearchParams({
    location,
    radius: radius || '5000',
    type: type || 'restaurant',
    key: API_KEY,
  });
  if (keyword) params.set('keyword', keyword);
  if (maxprice != null && maxprice !== 'null') params.set('maxprice', maxprice);

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`,
    );
    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'FETCH_ERROR', error_message: err.message }),
    };
  }
};
