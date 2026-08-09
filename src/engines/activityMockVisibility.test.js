import fs from 'fs';
import path from 'path';

// Current live-discovery paths must not wire mock activities back into the UI.
// Legacy renderers are deliberately not included: saved pre-173 plans may still
// carry isSample and must continue to identify that fact honestly.
const SRC = path.resolve(__dirname, '..');
const PRODUCTION_FLOW_FILES = [
  'DayGuide.jsx',
  'components/ActivitiesStage.jsx',
  'components/ActivitiesNoResultsCard.jsx',
  'components/ActivitiesUnavailableCard.jsx',
  'api/placesApi.js',
];
const read = (rel) => fs.readFileSync(path.join(SRC, rel), 'utf8');
const IMPORTS_MOCK_DATA = /(?:import[^;]*from\s*|require\(\s*)['"][^'"]*mockActivityData(?:\.json)?['"]/;

test.each(PRODUCTION_FLOW_FILES)(
  '%s does not import mock activity data into the current discovery flow',
  (rel) => {
    expect(read(rel)).not.toMatch(IMPORTS_MOCK_DATA);
  },
);
