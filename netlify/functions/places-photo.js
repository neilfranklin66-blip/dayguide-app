// Photo proxy: the client asks for /.netlify/functions/places-photo?ref=…
// and this function attaches the private key server-side, then forwards the
// browser to Google's keyless googleusercontent CDN URL. The key never
// appears in any URL the client sees.
const PLACEHOLDER_URL = 'https://placehold.co/400x300/667eea/ffffff?text=Restaurant';

const redirect = (location, maxAge) => ({
  statusCode: 302,
  headers: {
    Location: location,
    'Cache-Control': `public, max-age=${maxAge}`,
  },
  body: '',
});

exports.handler = async (event) => {
  // Server-side only — must NOT use a REACT_APP_* name, or CRA would embed
  // the key into the client bundle.
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  const { ref, maxwidth } = event.queryStringParameters || {};

  // Short cache on the placeholder so images recover quickly once configured.
  if (!API_KEY || !ref) return redirect(PLACEHOLDER_URL, 300);

  const params = new URLSearchParams({
    maxwidth: maxwidth || '400',
    photo_reference: ref,
    key: API_KEY,
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/photo?${params}`,
      { redirect: 'manual' },
    );
    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
      return redirect(location, 86400);
    }
    return redirect(PLACEHOLDER_URL, 300);
  } catch (err) {
    return redirect(PLACEHOLDER_URL, 300);
  }
};
