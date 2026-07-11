import { getRestaurantSourceFromError } from '../engines/restaurantEngine';

/**
 * placesApi tests
 * - The private Google key lives server-side only (GOOGLE_PLACES_API_KEY in
 *   the Netlify functions). The client module must work with NO key in its
 *   environment, so every test here runs with REACT_APP_GOOGLE_PLACES_API_KEY
 *   deliberately unset.
 * - fetch is mocked globally; multi-cuisine tests route responses per keyword.
 */

const LAT = 51.5074;
const LNG = -0.1278;

const ORIGINAL_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
const ORIGINAL_FETCH = global.fetch;

let searchRestaurants;

const loadModule = () => {
  jest.resetModules();
  ({ searchRestaurants } = require('./placesApi'));
};

const okResponse = (results) => ({
  ok: true,
  json: async () => ({ status: 'OK', results }),
});

const statusResponse = (status, error_message) => ({
  ok: true,
  json: async () => ({ status, ...(error_message ? { error_message } : {}) }),
});

const httpErrorResponse = (status) => ({
  ok: false,
  status,
  json: async () => ({}),
});

const makePlace = (id, name, overrides = {}) => ({
  place_id: id,
  name,
  rating: 4.2,
  vicinity: '1 Test Street',
  types: ['restaurant'],
  geometry: { location: { lat: LAT, lng: LNG } },
  ...overrides,
});

// Route mocked responses by the keyword param of each nearby-search call.
// Handlers are keyed by keyword ('' for the no-keyword call) and return a
// promise, so individual batches can succeed or reject independently.
const mockFetchByKeyword = (handlers) => {
  global.fetch.mockImplementation((url) => {
    const keyword = new URL(url, 'http://localhost').searchParams.get('keyword') || '';
    const handler = handlers[keyword];
    if (!handler) return Promise.reject(new Error(`Unexpected keyword: ${keyword}`));
    return handler();
  });
};

beforeEach(() => {
  // Prove the client module never needs the old client-side key.
  delete process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
  global.fetch = jest.fn();
  loadModule();
});

afterAll(() => {
  if (ORIGINAL_KEY === undefined) {
    delete process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
  } else {
    process.env.REACT_APP_GOOGLE_PLACES_API_KEY = ORIGINAL_KEY;
  }
  global.fetch = ORIGINAL_FETCH;
});

describe('searchRestaurants multi-cuisine resilience', () => {
  it('returns surviving live results when one cuisine batch rejects', async () => {
    mockFetchByKeyword({
      'Italian restaurant': () => Promise.reject(new Error('network down')),
      'Indian restaurant': () => Promise.resolve(okResponse([makePlace('p1', 'Curry Palace')])),
    });

    const results = await searchRestaurants(LAT, LNG, ['italian', 'indian']);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('p1');
    expect(results[0].name).toBe('Curry Palace');
  });

  it('throws the most specific error when all batches reject, mapping through getRestaurantSourceFromError', async () => {
    mockFetchByKeyword({
      'Italian restaurant': () => Promise.reject(new Error('network down')),
      'Indian restaurant': () => Promise.resolve(statusResponse('OVER_QUERY_LIMIT')),
    });

    let thrown;
    await searchRestaurants(LAT, LNG, ['italian', 'indian']).catch(e => { thrown = e; });

    expect(thrown).toBeInstanceOf(Error);
    expect(thrown.message).toBe('QUOTA_EXCEEDED');
    expect(getRestaurantSourceFromError(thrown)).toBe('quota');
  });

  it('prefers API_DENIED over a generic failure when all batches reject', async () => {
    mockFetchByKeyword({
      'Italian restaurant': () => Promise.reject(new Error('network down')),
      'Indian restaurant': () => Promise.resolve(statusResponse('REQUEST_DENIED')),
    });

    await expect(searchRestaurants(LAT, LNG, ['italian', 'indian']))
      .rejects.toThrow('API_DENIED');
  });

  it('deduplicates by place_id across fulfilled batches', async () => {
    const shared = makePlace('dup', 'Pizza Roma');
    mockFetchByKeyword({
      'Italian restaurant': () => Promise.resolve(okResponse([shared, makePlace('p2', 'Trattoria Uno')])),
      'Indian restaurant': () => Promise.resolve(okResponse([shared, makePlace('p3', 'Curry Palace')])),
    });

    const results = await searchRestaurants(LAT, LNG, ['italian', 'indian']);

    expect(results.filter(r => r.id === 'dup')).toHaveLength(1);
    expect(results.map(r => r.id).sort()).toEqual(['dup', 'p2', 'p3']);
  });
});

describe('searchRestaurants malformed record handling', () => {
  it('skips records without usable numeric geometry but keeps valid ones', async () => {
    mockFetchByKeyword({
      '': () => Promise.resolve(okResponse([
        makePlace('good', 'The Corner Spot'),
        { place_id: 'no-geo', name: 'Ghost Venue', rating: 4.5 },
        makePlace('bad-geo', 'String Coords', { geometry: { location: { lat: 'x', lng: 'y' } } }),
      ])),
    });

    const results = await searchRestaurants(LAT, LNG, []);

    expect(results.map(r => r.id)).toEqual(['good']);
  });

  it('does not crash on a record missing name', async () => {
    mockFetchByKeyword({
      '': () => Promise.resolve(okResponse([
        makePlace('unnamed', undefined),
        makePlace('named', 'The Corner Spot'),
      ])),
    });

    const results = await searchRestaurants(LAT, LNG, []);

    expect(results.map(r => r.id).sort()).toEqual(['named', 'unnamed']);
    const unnamed = results.find(r => r.id === 'unnamed');
    expect(unnamed.name).toBe('');
    expect(unnamed.cuisine).toEqual([]);
  });
});

describe('searchRestaurants incomplete result normalisation', () => {
  it('normalises a minimal valid record missing all optional fields with safe fallbacks', async () => {
    // Only place_id, name, and geometry — no rating, price_level, photos,
    // vicinity, types, opening_hours, website, or user_ratings_total.
    mockFetchByKeyword({
      '': () => Promise.resolve(okResponse([
        {
          place_id: 'bare',
          name: 'Bare Minimum',
          geometry: { location: { lat: LAT, lng: LNG } },
        },
      ])),
    });

    const results = await searchRestaurants(LAT, LNG, []);

    expect(results).toHaveLength(1);
    const bare = results[0];
    expect(bare.id).toBe('bare');
    expect(bare.name).toBe('Bare Minimum');
    expect(bare.rating).toBe(4.0); // default keeps it above the 3.5 rating filter
    expect(bare.priceRange).toBe('$$');
    expect(bare.duration).toBe(1.5);
    expect(bare.distance).toBe(0);
    expect(bare.address).toBeUndefined();
    expect(bare.cuisine).toEqual([]);
    expect(bare.image).toContain('placehold.co');
    expect(bare.image).toContain(encodeURIComponent('Bare Minimum'));
  });

  it('falls back to the placeholder image when photos are empty or lack a photo_reference', async () => {
    mockFetchByKeyword({
      '': () => Promise.resolve(okResponse([
        makePlace('empty-photos', 'Empty Photos', { photos: [] }),
        makePlace('no-ref', 'No Reference', { photos: [{ width: 400 }] }),
        makePlace('with-ref', 'With Reference', { photos: [{ photo_reference: 'ref-1' }] }),
      ])),
    });

    const results = await searchRestaurants(LAT, LNG, []);
    const byId = Object.fromEntries(results.map(r => [r.id, r]));

    expect(byId['empty-photos'].image).toContain('placehold.co');
    expect(byId['no-ref'].image).toContain('placehold.co');
    expect(byId['with-ref'].image).toContain('/.netlify/functions/places-photo?ref=ref-1');
  });

  it('maps the valid-but-falsy price_level 0 to $ rather than the missing-value default', async () => {
    mockFetchByKeyword({
      '': () => Promise.resolve(okResponse([
        makePlace('free-tier', 'Cheap Eats', { price_level: 0 }),
      ])),
    });

    const results = await searchRestaurants(LAT, LNG, []);

    expect(results[0].priceRange).toBe('$');
    expect(results[0].duration).toBe(1);
  });

  it('applies the 4.0 default rating to unrated (rating 0) places', async () => {
    mockFetchByKeyword({
      '': () => Promise.resolve(okResponse([
        makePlace('unrated', 'New Opening', { rating: 0 }),
      ])),
    });

    const results = await searchRestaurants(LAT, LNG, []);

    expect(results.map(r => r.id)).toEqual(['unrated']);
    expect(results[0].rating).toBe(4.0);
  });
});

describe('searchRestaurants existing behaviour', () => {
  it('returns [] on ZERO_RESULTS', async () => {
    mockFetchByKeyword({ '': () => Promise.resolve(statusResponse('ZERO_RESULTS')) });

    await expect(searchRestaurants(LAT, LNG, [])).resolves.toEqual([]);
  });

  it('throws API_DENIED on REQUEST_DENIED for a single call', async () => {
    mockFetchByKeyword({ '': () => Promise.resolve(statusResponse('REQUEST_DENIED')) });

    await expect(searchRestaurants(LAT, LNG, [])).rejects.toThrow('API_DENIED');
  });

  it('throws QUOTA_EXCEEDED on OVER_QUERY_LIMIT for a single call', async () => {
    mockFetchByKeyword({ '': () => Promise.resolve(statusResponse('OVER_QUERY_LIMIT')) });

    await expect(searchRestaurants(LAT, LNG, [])).rejects.toThrow('QUOTA_EXCEEDED');
  });

  it('maps the proxy\'s missing-server-key response to NO_API_KEY → no_key', async () => {
    mockFetchByKeyword({
      '': () => Promise.resolve(statusResponse('REQUEST_DENIED', 'NO_API_KEY')),
    });

    let thrown;
    await searchRestaurants(LAT, LNG, []).catch(e => { thrown = e; });

    expect(thrown.message).toBe('NO_API_KEY');
    expect(getRestaurantSourceFromError(thrown)).toBe('no_key');
  });

  it('maps a missing Netlify function (HTTP 404) to NO_API_KEY → no_key', async () => {
    mockFetchByKeyword({ '': () => Promise.resolve(httpErrorResponse(404)) });

    let thrown;
    await searchRestaurants(LAT, LNG, []).catch(e => { thrown = e; });

    expect(thrown.message).toBe('NO_API_KEY');
    expect(getRestaurantSourceFromError(thrown)).toBe('no_key');
  });

  it('maps other HTTP failures to a generic error source', async () => {
    mockFetchByKeyword({ '': () => Promise.resolve(httpErrorResponse(500)) });

    let thrown;
    await searchRestaurants(LAT, LNG, []).catch(e => { thrown = e; });

    expect(thrown.message).toBe('HTTP_500');
    expect(getRestaurantSourceFromError(thrown)).toBe('error');
  });

  // fetch itself rejecting means the request never reached the server: offline,
  // DNS failure, connection reset. That is a connectivity problem the user can
  // act on, not the same as the provider answering with a failure status.
  it('maps a rejected fetch to NETWORK_ERROR → network', async () => {
    mockFetchByKeyword({ '': () => Promise.reject(new TypeError('Failed to fetch')) });

    let thrown;
    await searchRestaurants(LAT, LNG, []).catch(e => { thrown = e; });

    expect(thrown.message).toBe('NETWORK_ERROR');
    expect(getRestaurantSourceFromError(thrown)).toBe('network');
  });

  // A server that answers 500 is reachable, so it must not be reported as an
  // offline device.
  it('does not report a reachable server returning 500 as a network failure', async () => {
    mockFetchByKeyword({ '': () => Promise.resolve(httpErrorResponse(500)) });

    let thrown;
    await searchRestaurants(LAT, LNG, []).catch(e => { thrown = e; });

    expect(getRestaurantSourceFromError(thrown)).not.toBe('network');
  });

  it('reports NETWORK_ERROR when every cuisine batch fails to connect', async () => {
    mockFetchByKeyword({
      'Italian restaurant': () => Promise.reject(new TypeError('Failed to fetch')),
      'Indian restaurant': () => Promise.reject(new TypeError('Failed to fetch')),
    });

    let thrown;
    await searchRestaurants(LAT, LNG, ['italian', 'indian']).catch(e => { thrown = e; });

    expect(thrown.message).toBe('NETWORK_ERROR');
    expect(getRestaurantSourceFromError(thrown)).toBe('network');
  });

  // A concrete configuration fault is more actionable than "you may be offline".
  it('prefers NO_API_KEY over NETWORK_ERROR when batches fail differently', async () => {
    mockFetchByKeyword({
      'Italian restaurant': () => Promise.reject(new TypeError('Failed to fetch')),
      'Indian restaurant': () => Promise.resolve(httpErrorResponse(404)),
    });

    await expect(searchRestaurants(LAT, LNG, ['italian', 'indian']))
      .rejects.toThrow('NO_API_KEY');
  });

  // NETWORK_ERROR is named, an opaque STATUS_ string is not.
  it('prefers NETWORK_ERROR over an opaque provider status when batches fail differently', async () => {
    mockFetchByKeyword({
      'Italian restaurant': () => Promise.resolve(statusResponse('INVALID_REQUEST')),
      'Indian restaurant': () => Promise.reject(new TypeError('Failed to fetch')),
    });

    await expect(searchRestaurants(LAT, LNG, ['italian', 'indian']))
      .rejects.toThrow('NETWORK_ERROR');
  });

  it('prefers NO_API_KEY over other failures when all cuisine batches reject', async () => {
    mockFetchByKeyword({
      'Italian restaurant': () => Promise.reject(new Error('network down')),
      'Indian restaurant': () => Promise.resolve(statusResponse('REQUEST_DENIED', 'NO_API_KEY')),
    });

    await expect(searchRestaurants(LAT, LNG, ['italian', 'indian']))
      .rejects.toThrow('NO_API_KEY');
  });

  it('filters out low ratings and far-away places', async () => {
    mockFetchByKeyword({
      '': () => Promise.resolve(okResponse([
        makePlace('good', 'The Corner Spot'),
        makePlace('low-rating', 'Meh Diner', { rating: 3.0 }),
        makePlace('too-far', 'Distant Diner', { geometry: { location: { lat: LAT + 0.1, lng: LNG } } }),
      ])),
    });

    const results = await searchRestaurants(LAT, LNG, []);

    expect(results.map(r => r.id)).toEqual(['good']);
  });

  it('drops known non-matching cuisines but keeps undetected ones', async () => {
    mockFetchByKeyword({
      'Italian restaurant': () => Promise.resolve(okResponse([
        makePlace('match', 'Pizza Roma'),
        makePlace('mismatch', 'Curry Palace'),
        makePlace('unknown', 'The Corner Spot'),
      ])),
    });

    const results = await searchRestaurants(LAT, LNG, ['italian']);

    expect(results.map(r => r.id).sort()).toEqual(['match', 'unknown']);
  });

  it('caps results at 12', async () => {
    const many = Array.from({ length: 15 }, (_, i) => makePlace(`p${i}`, `Venue ${i}`));
    mockFetchByKeyword({ '': () => Promise.resolve(okResponse(many)) });

    const results = await searchRestaurants(LAT, LNG, []);

    expect(results).toHaveLength(12);
  });
});

describe('API-key safety (launch blocker guard, Packet 118)', () => {
  it('produces no request or image URL containing a key parameter', async () => {
    mockFetchByKeyword({
      'Italian restaurant': () => Promise.resolve(okResponse([
        makePlace('photo', 'Pizza Roma', { photos: [{ photo_reference: 'ref-9' }] }),
      ])),
    });

    const results = await searchRestaurants(LAT, LNG, ['italian'], '$$');

    // Every outgoing request targets the proxy, never Google directly.
    for (const [url] of global.fetch.mock.calls) {
      expect(url).toMatch(/^\/\.netlify\/functions\/places-nearby\?/);
      expect(url).not.toMatch(/[?&]key=/);
    }

    // Photo URLs point at the proxy and carry no key either.
    const photo = results.find(r => r.id === 'photo');
    expect(photo.image).toMatch(/^\/\.netlify\/functions\/places-photo\?/);
    expect(photo.image).not.toMatch(/[?&]key=/);
  });

  it('placesApi.js source references neither REACT_APP key nor Google hosts directly', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(path.join(__dirname, 'placesApi.js'), 'utf8');

    expect(source).not.toContain('REACT_APP_GOOGLE_PLACES_API_KEY');
    expect(source).not.toContain('maps.googleapis.com');
  });
});
