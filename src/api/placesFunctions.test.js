/**
 * Netlify function tests (Packet 118 — server-only Places key)
 * - The functions read GOOGLE_PLACES_API_KEY (never a REACT_APP_* name) at
 *   request time, so tests arrange process.env per test.
 * - CRA's jest only collects tests under src/, so this file lives here and
 *   requires the function handlers from netlify/functions/.
 */

const nearby = require('../../netlify/functions/places-nearby');
const photo = require('../../netlify/functions/places-photo');
const resolve = require('../../netlify/functions/places-resolve');

const ORIGINAL_SERVER_KEY = process.env.GOOGLE_PLACES_API_KEY;
const ORIGINAL_CLIENT_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
const ORIGINAL_FETCH = global.fetch;

const TEST_KEY = 'server-secret-key';

beforeEach(() => {
  delete process.env.GOOGLE_PLACES_API_KEY;
  delete process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
  global.fetch = jest.fn();
});

afterAll(() => {
  if (ORIGINAL_SERVER_KEY === undefined) {
    delete process.env.GOOGLE_PLACES_API_KEY;
  } else {
    process.env.GOOGLE_PLACES_API_KEY = ORIGINAL_SERVER_KEY;
  }
  if (ORIGINAL_CLIENT_KEY === undefined) {
    delete process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
  } else {
    process.env.REACT_APP_GOOGLE_PLACES_API_KEY = ORIGINAL_CLIENT_KEY;
  }
  global.fetch = ORIGINAL_FETCH;
});

describe('places-nearby function', () => {
  const event = { queryStringParameters: { location: '51.5,-0.1' } };

  it('returns the NO_API_KEY denial without calling Google when the key is unset', async () => {
    const res = await nearby.handler(event);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      status: 'REQUEST_DENIED',
      error_message: 'NO_API_KEY',
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('ignores the legacy REACT_APP_ variable — the key must be server-named', async () => {
    process.env.REACT_APP_GOOGLE_PLACES_API_KEY = 'legacy-client-key';

    const res = await nearby.handler(event);

    expect(JSON.parse(res.body).error_message).toBe('NO_API_KEY');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns only a safe upstream HTTP diagnostic when Places API rejects a request', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: { message: 'provider detail that must not reach the browser' },
      }),
    });

    const res = await nearby.handler(event);

    expect(JSON.parse(res.body)).toEqual({
      status: 'UNKNOWN_ERROR',
      error_message: 'UPSTREAM_HTTP_400',
    });
  });

  it('attaches GOOGLE_PLACES_API_KEY to the Google request but never echoes it to the client', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        places: [{
          id: 'p1',
          displayName: { text: 'Pizza Roma' },
          formattedAddress: 'Roma Road',
          location: { latitude: 51.5, longitude: -0.1 },
          types: ['restaurant'],
          priceLevel: 'PRICE_LEVEL_MODERATE',
        }],
      }),
    });

    const res = await nearby.handler({
      queryStringParameters: { location: '51.5,-0.1', keyword: 'Italian restaurant' },
    });

    const [googleUrl, request] = global.fetch.mock.calls[0];
    expect(googleUrl).toBe('https://places.googleapis.com/v1/places:searchText');
    expect(request.headers['X-Goog-Api-Key']).toBe(TEST_KEY);
    expect(request.headers['X-Goog-FieldMask']).toContain('places.displayName');
    expect(JSON.parse(request.body)).toMatchObject({
      textQuery: 'Italian restaurant',
      includedType: 'restaurant',
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      status: 'OK',
      results: [
        expect.objectContaining({
          place_id: 'p1',
          name: 'Pizza Roma',
          price_level: 2,
          geometry: { location: { lat: 51.5, lng: -0.1 } },
        }),
      ],
    });
    expect(res.body).not.toContain(TEST_KEY);
  });
});

describe('places-photo function', () => {
  it('redirects to a placeholder without calling Google when the key is unset', async () => {
    const res = await photo.handler({ queryStringParameters: { ref: 'ref-1' } });

    expect(res.statusCode).toBe(302);
    expect(res.headers.Location).toContain('placehold.co');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('redirects to a placeholder when no photo reference is supplied', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;

    const res = await photo.handler({ queryStringParameters: {} });

    expect(res.statusCode).toBe(302);
    expect(res.headers.Location).toContain('placehold.co');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('forwards Google\'s keyless CDN redirect and keeps the key out of the response', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;
    const cdnUrl = 'https://lh3.googleusercontent.com/places/photo-abc';
    global.fetch.mockResolvedValue({
      status: 302,
      headers: { get: (name) => (name.toLowerCase() === 'location' ? cdnUrl : null) },
    });

    const res = await photo.handler({
      queryStringParameters: { ref: 'places/p1/photos/photo-abc', maxwidth: '400' },
    });

    const googleUrl = global.fetch.mock.calls[0][0];
    expect(googleUrl).toContain('https://places.googleapis.com/v1/places/p1/photos/photo-abc/media');
    expect(googleUrl).toContain('maxWidthPx=400');
    expect(googleUrl).toContain(`key=${TEST_KEY}`);

    expect(res.statusCode).toBe(302);
    expect(res.headers.Location).toBe(cdnUrl);
    expect(res.headers['Cache-Control']).toBe('public, max-age=0');
    expect(JSON.stringify(res)).not.toContain(TEST_KEY);
  });

  it('falls back to the placeholder when Google does not answer with a redirect', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;
    global.fetch.mockResolvedValue({
      status: 403,
      headers: { get: () => null },
    });

    const res = await photo.handler({
      queryStringParameters: { ref: 'places/p1/photos/photo-abc' },
    });

    expect(res.statusCode).toBe(302);
    expect(res.headers.Location).toContain('placehold.co');
  });

  it('falls back to the placeholder when the upstream fetch throws', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;
    global.fetch.mockRejectedValue(new Error('network down'));

    const res = await photo.handler({
      queryStringParameters: { ref: 'places/p1/photos/photo-abc' },
    });

    expect(res.statusCode).toBe(302);
    expect(res.headers.Location).toContain('placehold.co');
  });
});

describe('places-resolve function', () => {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ query: 'London Euston' }),
  };

  it('rejects an invalid query before making a provider request', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;

    const res = await resolve.handler({
      httpMethod: 'POST',
      body: JSON.stringify({ query: ' x ' }),
    });

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({
      status: 'INVALID_REQUEST',
      error_message: 'INVALID_QUERY',
      candidates: [],
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON without making a provider request', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;

    const res = await resolve.handler({
      httpMethod: 'POST',
      body: '{not-json',
    });

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({
      status: 'INVALID_REQUEST',
      error_message: 'INVALID_JSON',
      candidates: [],
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects non-POST requests without making a provider request', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;

    const res = await resolve.handler({
      httpMethod: 'GET',
      body: JSON.stringify({ query: 'London Euston' }),
    });

    expect(res.statusCode).toBe(405);
    expect(JSON.parse(res.body).error_message).toBe('METHOD_NOT_ALLOWED');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns the NO_API_KEY denial without calling Google when the key is unset', async () => {
    const res = await resolve.handler(event);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      status: 'REQUEST_DENIED',
      error_message: 'NO_API_KEY',
      candidates: [],
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('uses the existing server key and returns only route-capable planning fields', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        places: [
          {
            id: 'euston-id',
            displayName: { text: 'London Euston' },
            formattedAddress: 'Euston Road, London',
            location: { latitude: 51.5282, longitude: -0.1337 },
          },
        ],
      }),
    });

    const res = await resolve.handler(event);
    const [googleUrl, request] = global.fetch.mock.calls[0];
    expect(googleUrl).toBe('https://places.googleapis.com/v1/places:searchText');
    expect(request.headers['X-Goog-Api-Key']).toBe(TEST_KEY);
    expect(request.headers['X-Goog-FieldMask']).toContain('places.location');
    expect(JSON.parse(request.body)).toEqual({ textQuery: 'London Euston', maxResultCount: 5 });

    expect(JSON.parse(res.body)).toEqual({
      status: 'OK',
      candidates: [
        {
          id: 'euston-id',
          name: 'London Euston',
          address: 'Euston Road, London',
          coordinates: { lat: 51.5282, lng: -0.1337 },
          source: 'google_places',
        },
      ],
    });
    expect(res.body).not.toContain(TEST_KEY);
    expect(res.body).not.toContain('rating');
    expect(res.body).not.toContain('viewport');
  });

  it('drops malformed candidates rather than claiming they are routable', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        places: [
          { id: 'missing-geometry', displayName: { text: 'Unresolved' } },
          {
            id: 'valid',
            displayName: { text: 'Valid station' },
            location: { latitude: 51.5, longitude: -0.1 },
          },
        ],
      }),
    });

    const res = await resolve.handler(event);

    expect(JSON.parse(res.body)).toEqual({
      status: 'OK',
      candidates: [
        {
          id: 'valid',
          name: 'Valid station',
          address: null,
          coordinates: { lat: 51.5, lng: -0.1 },
          source: 'google_places',
        },
      ],
    });
  });

  it('returns an honest empty result without echoing the search text', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ places: [] }),
    });

    const res = await resolve.handler(event);

    expect(JSON.parse(res.body)).toEqual({
      status: 'ZERO_RESULTS',
      candidates: [],
    });
    expect(res.body).not.toContain('London Euston');
  });

  it('does not forward provider error details to the client', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;
    global.fetch.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: { message: 'provider account detail' } }),
    });

    const res = await resolve.handler(event);

    expect(JSON.parse(res.body)).toEqual({
      status: 'REQUEST_DENIED',
      candidates: [],
    });
    expect(res.body).not.toContain('provider account detail');
  });

  it('reports an upstream connection failure without exposing its raw message', async () => {
    process.env.GOOGLE_PLACES_API_KEY = TEST_KEY;
    global.fetch.mockRejectedValue(new Error('private network detail'));

    const res = await resolve.handler(event);

    expect(res.statusCode).toBe(502);
    expect(JSON.parse(res.body)).toEqual({
      status: 'FETCH_ERROR',
      error_message: 'NETWORK_ERROR',
      candidates: [],
    });
    expect(res.body).not.toContain('private network detail');
  });
});
