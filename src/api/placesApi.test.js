import { getRestaurantSourceFromError } from '../engines/restaurantEngine';

/**
 * placesApi tests
 * - The module reads REACT_APP_GOOGLE_PLACES_API_KEY at import time, so each
 *   test loads a fresh copy via loadModule() after arranging the environment.
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

const statusResponse = (status) => ({
  ok: true,
  json: async () => ({ status }),
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
  process.env.REACT_APP_GOOGLE_PLACES_API_KEY = 'test-key';
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
    expect(byId['with-ref'].image).toContain('photo_reference=ref-1');
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

  it('throws NO_API_KEY without calling fetch when the key is missing', async () => {
    delete process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
    loadModule();

    await expect(searchRestaurants(LAT, LNG, [])).rejects.toThrow('NO_API_KEY');
    expect(global.fetch).not.toHaveBeenCalled();
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
