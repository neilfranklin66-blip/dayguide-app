// Photo proxy for Places API (New). The browser supplies a short-lived photo
// resource name; this function adds the private key and follows no redirect.
const PLACEHOLDER_URL = 'https://placehold.co/400x300/667eea/ffffff?text=Restaurant';

const redirect = (location, maxAge) => ({
  statusCode: 302,
  headers: { Location: location, 'Cache-Control': `public, max-age=${maxAge}` },
  body: '',
});

const validPhotoReference = ref =>
  typeof ref === 'string' && /^places\/[^/]+\/photos\/[^/]+$/.test(ref);

exports.handler = async event => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const { ref, maxwidth } = event.queryStringParameters || {};
  if (!apiKey || !validPhotoReference(ref)) return redirect(PLACEHOLDER_URL, 300);

  const encodedReference = ref.split('/').map(encodeURIComponent).join('/');
  const width = Number(maxwidth);
  const maxWidthPx = Number.isFinite(width) ? Math.min(Math.max(width, 1), 4800) : 400;
  const params = new URLSearchParams({ maxWidthPx: String(maxWidthPx), key: apiKey });

  try {
    const upstream = await fetch(
      `https://places.googleapis.com/v1/${encodedReference}/media?${params}`,
      { redirect: 'manual' },
    );
    const location = upstream.headers.get('location');
    if (upstream.status >= 300 && upstream.status < 400 && location) {
      // Places API (New) photo resource names are short-lived.  Do not cache
      // the redirect beyond this response.
      return redirect(location, 0);
    }
    return redirect(PLACEHOLDER_URL, 300);
  } catch (_) {
    return redirect(PLACEHOLDER_URL, 300);
  }
};
