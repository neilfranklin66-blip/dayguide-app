import {
  PACKET166_APPROVAL,
  PACKET166_APPROVED_DAILY_QUOTA,
  PACKET166_CALIBRATION_PLAN,
} from './packet166Approval';
import {
  PACKET166_CANONICAL_PRODUCTION_ORIGIN,
  PACKET166_RUN_ACKNOWLEDGEMENT,
  PACKET166_RUN_ERROR,
  createPacket166RunSelection,
  runPacket166Calibration,
} from './packet166CalibrationRunner';

const previewOrigin =
  'https://packet-166-preview--ubiquitous-melomakarona-874d9c.netlify.app';

const response = ({ status = 200, providerStatus = 'OK', evidence = [] } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue({ status: providerStatus, evidence }),
});

const selectionFor = batchIndexes =>
  createPacket166RunSelection({
    previewOrigin,
    acknowledgement: PACKET166_RUN_ACKNOWLEDGEMENT,
    batchIndexes,
  });

const evidenceForBatch = batch =>
  batch.requests.map((request, index) => ({
    requestId: request.id,
    travelMode: request.travelMode,
    durationMinutes: 10 + index,
    distanceMeters: 500 + index,
    observedAt: '2026-07-31T10:30:00Z',
  }));

test('records the closed, future-dated calibration authority and daily cap', () => {
  expect(PACKET166_APPROVAL).toEqual(
    expect.objectContaining({
      packet: 166,
      approvedByProductOwner: true,
      weekdayDate: '2026-08-03',
      weekendDate: '2026-08-08',
      maximumProviderEvents: 24,
      automaticRetryCount: 0,
      userFacingOutputPermitted: false,
      productionPermitted: false,
    }),
  );
  expect(PACKET166_APPROVED_DAILY_QUOTA).toEqual(
    expect.objectContaining({ proposedHardDailyQuota: 150 }),
  );
  expect(PACKET166_CALIBRATION_PLAN).toEqual(
    expect.objectContaining({
      scenarioCount: 24,
      maximumBillableEvents: 24,
      automaticRetryCount: 0,
    }),
  );
});

test('requires explicit authority and refuses production or malformed origins', () => {
  expect(() =>
    createPacket166RunSelection({
      previewOrigin,
      acknowledgement: 'yes',
      batchIndexes: [0],
    }),
  ).toThrow(PACKET166_RUN_ERROR.INVALID_ACKNOWLEDGEMENT);

  [
    PACKET166_CANONICAL_PRODUCTION_ORIGIN,
    'http://preview.netlify.app',
    'https://example.com',
    'https://preview.netlify.app/path',
  ].forEach(origin => {
    expect(() =>
      createPacket166RunSelection({
        previewOrigin: origin,
        acknowledgement: PACKET166_RUN_ACKNOWLEDGEMENT,
        batchIndexes: [0],
      }),
    ).toThrow(PACKET166_RUN_ERROR.INVALID_PREVIEW_ORIGIN);
  });
});

test('allows at most three sequential preview batches without retries', async () => {
  const selection = selectionFor('2,0,1');
  expect(selection.batchIndexes).toEqual([0, 1, 2]);
  expect(selection.providerRequestCount).toBeLessThanOrEqual(18);
  expect(selection.fullExerciseMaximumProviderRequests).toBe(24);

  [[], [0, 1, 2, 3], [0, 0], [-1], [5]].forEach(batchIndexes => {
    expect(() => selectionFor(batchIndexes)).toThrow(
      PACKET166_RUN_ERROR.INVALID_BATCH_SELECTION,
    );
  });

  const fetchImpl = jest.fn().mockResolvedValue(
    response({ evidence: evidenceForBatch(selection.batches[0]) }),
  );
  await expect(
    runPacket166Calibration({
      selection: selectionFor([0]),
      getIdToken: jest.fn().mockResolvedValue('firebase-token'),
      fetchImpl,
    }),
  ).resolves.toEqual(
    expect.objectContaining({
      packet: 166,
      providerRequestCount: selectionFor([0]).providerRequestCount,
      automaticRetryCount: 0,
    }),
  );
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});

test.each([
  ['provider denial', 'REQUEST_DENIED', 'PACKET166_PROVIDER_REJECTED'],
  ['preview rate limit', 'OVER_QUERY_LIMIT', 'PACKET166_PREVIEW_RATE_LIMITED'],
  ['disabled provider', 'DISABLED', 'PACKET166_PREVIEW_UNAVAILABLE'],
])('fails closed for %s without a retry', async (_, providerStatus, code) => {
  const fetchImpl = jest.fn().mockResolvedValue(
    response({ providerStatus }),
  );
  await expect(
    runPacket166Calibration({
      selection: selectionFor([0, 1]),
      getIdToken: jest.fn().mockResolvedValue('token'),
      fetchImpl,
    }),
  ).rejects.toThrow(code);
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});
