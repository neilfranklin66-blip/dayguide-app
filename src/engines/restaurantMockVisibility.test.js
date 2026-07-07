import fs from 'fs';
import path from 'path';

// Structural regression guard for the product rule that mock restaurant data
// must never reach normal users as real nearby recommendations (Packet 111).
//
// The behavioural engine/stage tests exercise each module in isolation with
// injected inputs, so they would still pass if a mock fallback were wired back
// into the live data path (e.g. importing mockRestaurantData.json and returning
// mapFromMockArray(...) as the search results). This test locks the wiring
// layer itself: no production module in the restaurant flow may import the mock
// dataset or call the mock adapter helpers. Mock helpers remain exported for
// tests/dev — this only forbids the production flow from using them.

const SRC = path.resolve(__dirname, '..');

// Every production module on the path from "search restaurants" to "render a
// restaurant card". If a real fallback is added, it must live here.
const PRODUCTION_FLOW_FILES = [
  'DayGuide.jsx',
  'engines/restaurantEngine.js',
  'utils/restaurantSearchRequest.js',
  'api/placesApi.js',
  'components/RestaurantsStage.jsx',
  'components/RestaurantSwipeCard.jsx',
];

const read = (rel) => fs.readFileSync(path.join(SRC, rel), 'utf8');

// Matches an import/require of the mock dataset. A bare comment mention (e.g.
// "shaped like mockRestaurantData entries" in placesApi.js) is intentionally
// not matched — only an actual module reference would surface mock data.
const IMPORTS_MOCK_DATA = /(?:import[^;]*from\s*|require\(\s*)['"][^'"]*mockRestaurantData(?:\.json)?['"]/;

// Matches a call to either mock adapter helper.
const CALLS_MOCK_ADAPTER = /\b(?:fromMockRestaurant|mapFromMockArray)\s*\(/;

test.each(PRODUCTION_FLOW_FILES)(
  '%s does not import mock restaurant data',
  (rel) => {
    expect(read(rel)).not.toMatch(IMPORTS_MOCK_DATA);
  },
);

test.each(PRODUCTION_FLOW_FILES)(
  '%s does not call the mock restaurant adapter helpers',
  (rel) => {
    expect(read(rel)).not.toMatch(CALLS_MOCK_ADAPTER);
  },
);
