import {
  PACKET155_APPROVAL,
  PACKET155_APPROVED_CRITERIA,
  PACKET155_APPROVED_DAILY_QUOTA,
  PACKET155_CALIBRATION_PLAN,
} from './packet155Approval';
import {
  PACKET155_CANONICAL_PRODUCTION_ORIGIN,
  PACKET155_RUN_ACKNOWLEDGEMENT,
  PACKET155_RUN_ERROR,
  createPacket155RunSelection,
  runPacket155Calibration,
} from './packet155CalibrationRunner';

const previewOrigin =
  'https://packet-155-preview--ubiquitous-melomakarona-874d9c.netlify.app';

const response = ({
  status = 200,
  providerStatus = 'OK',
  evidence = [],
} = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue({
    status: providerStatus,
    evidence,
  }),
});

const selectionFor = batchIndexes =>
  createPacket155RunSelection({
    previewOrigin,
    acknowledgement: PACKET155_RUN_ACKNOWLEDGEMENT,
    batchIndexes,
  });

const evidenceForBatch = batch =>
  batch.requests.map((request, index) => ({
    requestId: request.id,
    evidenceClass: 'provider_route',
    travelMode: request.travelMode,
    durationMinutes: 10 + index,
    distanceMeters: 500 + index,
    evidenceSource: 'google_routes_compute_routes_essentials',
    observedAt: '2026-07-27T10:30:00Z',
  }));

test('records explicit Product Owner approval without changing the Packet 154 proposal', () => {
  expect(PACKET155_APPROVAL).toEqual(
    expect.objectContaining({
      packet: 155,
      approvedByProductOwner: true,
      approvalInstruction: 'Implement Packet 155',
      region: 'London, UK',
      modes: ['walking', 'transit'],
      weekdayDate: '2026-07-28',
      weekendDate: '2026-08-01',
    }),
  );
  expect(PACKET155_APPROVED_CRITERIA).toEqual(
    expect.objectContaining({
      approvedByProductOwner: true,
      approvedAt: PACKET155_APPROVAL.approvedAt,
      maximumSampleAgeDays: 7,
    }),
  );
  expect(PACKET155_APPROVED_DAILY_QUOTA).toEqual(
    expect.objectContaining({
      approvedByProductOwner: true,
      proposedHardDailyQuota: 150,
    }),
  );
  expect(PACKET155_CALIBRATION_PLAN).toEqual(
    expect.objectContaining({
      scenarioCount: 24,
      maximumBillableEvents: 24,
      automaticRetryCount: 0,
    }),
  );
});

test('requires the exact acknowledgement and a non-production Netlify preview origin', () => {
  expect(() =>
    createPacket155RunSelection({
      previewOrigin,
      acknowledgement: 'yes',
      batchIndexes: [0],
    }),
  ).toThrow(PACKET155_RUN_ERROR.INVALID_ACKNOWLEDGEMENT);

  [
    PACKET155_CANONICAL_PRODUCTION_ORIGIN,
    'http://preview.netlify.app',
    'https://example.com',
    'https://user:password@preview.netlify.app',
    'https://preview.netlify.app/path',
  ].forEach(origin => {
    expect(() =>
      createPacket155RunSelection({
        previewOrigin: origin,
        acknowledgement: PACKET155_RUN_ACKNOWLEDGEMENT,
        batchIndexes: [0],
      }),
    ).toThrow(PACKET155_RUN_ERROR.INVALID_PREVIEW_ORIGIN);
  });
});

test('allows no more than three unique valid batches in one invocation', () => {
  const selection = selectionFor('2,0,1');
  expect(selection.batchIndexes).toEqual([0, 1, 2]);
  expect(selection.batches).toHaveLength(3);
  expect(selection.providerRequestCount).toBeLessThanOrEqual(18);
  expect(selection.fullExerciseMaximumProviderRequests).toBe(24);
  expect(selection.automaticRetryCount).toBe(0);

  [[], [0, 1, 2, 3], [0, 0], [-1], [5], ['0']].forEach(
    batchIndexes => {
      expect(() =>
        createPacket155RunSelection({
          previewOrigin,
          acknowledgement: PACKET155_RUN_ACKNOWLEDGEMENT,
          batchIndexes,
        }),
      ).toThrow(PACKET155_RUN_ERROR.INVALID_BATCH_SELECTION);
    },
  );
});

test('sends authenticated batches sequentially and returns only sanitized evidence', async () => {
  const selection = selectionFor([0, 4]);
  const getIdToken = jest
    .fn()
    .mockResolvedValueOnce('firebase-token-one')
    .mockResolvedValueOnce('firebase-token-two');
  const fetchImpl = jest
    .fn()
    .mockResolvedValueOnce(
      response({
        evidence: evidenceForBatch(selection.batches[0]),
      }),
    )
    .mockResolvedValueOnce(
      response({
        evidence: evidenceForBatch(selection.batches[1]),
      }),
    );

  const result = await runPacket155Calibration({
    selection,
    getIdToken,
    fetchImpl,
  });

  expect(fetchImpl).toHaveBeenCalledTimes(2);
  expect(getIdToken).toHaveBeenCalledTimes(2);
  fetchImpl.mock.calls.forEach(([url, options], index) => {
    expect(url).toBe(
      `${previewOrigin}/.netlify/functions/routes-evidence`,
    );
    expect(options.headers.Authorization).toBe(
      `Bearer firebase-token-${index === 0 ? 'one' : 'two'}`,
    );
    expect(JSON.parse(options.body)).toEqual(selection.batches[index]);
  });
  expect(result).toEqual(
    expect.objectContaining({
      schemaVersion: 1,
      packet: 155,
      previewHost:
        'packet-155-preview--ubiquitous-melomakarona-874d9c.netlify.app',
      batchIndexes: [0, 4],
      providerRequestCount: selection.providerRequestCount,
      automaticRetryCount: 0,
    }),
  );
  expect(JSON.stringify(result)).not.toContain('firebase-token');
  expect(JSON.stringify(result)).not.toContain('Authorization');
  expect(JSON.stringify(result)).not.toContain('GOOGLE_ROUTES_API_KEY');
});

test('records absent partial results honestly without inventing duration evidence', async () => {
  const selection = selectionFor([0]);
  const evidence = evidenceForBatch(selection.batches[0]).slice(0, 1);
  const result = await runPacket155Calibration({
    selection,
    getIdToken: jest.fn().mockResolvedValue('token'),
    fetchImpl: jest.fn().mockResolvedValue(
      response({
        providerStatus: 'PARTIAL',
        evidence,
      }),
    ),
  });

  expect(result.batches[0].providerStatus).toBe('PARTIAL');
  expect(result.batches[0].results[0].providerRouteFound).toBe(true);
  expect(result.batches[0].results[1]).toEqual(
    expect.objectContaining({
      providerRouteFound: false,
      providerDurationMinutes: null,
      distanceMeters: null,
      observedAt: null,
    }),
  );
});

test('rejects duplicate evidence and recognizes a non-JSON edge rate limit', async () => {
  const selection = selectionFor([0]);
  const duplicate = evidenceForBatch(selection.batches[0])[0];
  await expect(
    runPacket155Calibration({
      selection,
      getIdToken: jest.fn().mockResolvedValue('token'),
      fetchImpl: jest.fn().mockResolvedValue(
        response({
          evidence: [duplicate, { ...duplicate }],
        }),
      ),
    }),
  ).rejects.toThrow(PACKET155_RUN_ERROR.INVALID_RESPONSE);

  await expect(
    runPacket155Calibration({
      selection,
      getIdToken: jest.fn().mockResolvedValue('token'),
      fetchImpl: jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: jest.fn().mockRejectedValue(new Error('not JSON')),
      }),
    }),
  ).rejects.toThrow(PACKET155_RUN_ERROR.PREVIEW_RATE_LIMITED);
});

test.each([
  [
    'missing token',
    () => ({
      getIdToken: jest.fn().mockResolvedValue(''),
      fetchImpl: jest.fn(),
    }),
    PACKET155_RUN_ERROR.AUTHENTICATION_FAILED,
  ],
  [
    'network failure',
    () => ({
      getIdToken: jest.fn().mockResolvedValue('token'),
      fetchImpl: jest.fn().mockRejectedValue(new Error('private detail')),
    }),
    PACKET155_RUN_ERROR.PREVIEW_UNAVAILABLE,
  ],
  [
    'Netlify rate limit',
    () => ({
      getIdToken: jest.fn().mockResolvedValue('token'),
      fetchImpl: jest.fn().mockResolvedValue(
        response({ status: 429, providerStatus: 'RATE_LIMITED' }),
      ),
    }),
    PACKET155_RUN_ERROR.PREVIEW_RATE_LIMITED,
  ],
  [
    'provider quota',
    () => ({
      getIdToken: jest.fn().mockResolvedValue('token'),
      fetchImpl: jest.fn().mockResolvedValue(
        response({ providerStatus: 'OVER_QUERY_LIMIT' }),
      ),
    }),
    PACKET155_RUN_ERROR.PREVIEW_RATE_LIMITED,
  ],
  [
    'disabled preview',
    () => ({
      getIdToken: jest.fn().mockResolvedValue('token'),
      fetchImpl: jest.fn().mockResolvedValue(
        response({ providerStatus: 'DISABLED' }),
      ),
    }),
    PACKET155_RUN_ERROR.PREVIEW_UNAVAILABLE,
  ],
])('fails closed for %s with a stable non-secret error', async (_, createTools, code) => {
  await expect(
    runPacket155Calibration({
      selection: selectionFor([0]),
      ...createTools(),
    }),
  ).rejects.toThrow(code);
});

test('does not retry after a rejected batch', async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(
      response({ status: 429, providerStatus: 'RATE_LIMITED' }),
    );

  await expect(
    runPacket155Calibration({
      selection: selectionFor([0, 1, 2]),
      getIdToken: jest.fn().mockResolvedValue('token'),
      fetchImpl,
    }),
  ).rejects.toThrow(PACKET155_RUN_ERROR.PREVIEW_RATE_LIMITED);
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});
