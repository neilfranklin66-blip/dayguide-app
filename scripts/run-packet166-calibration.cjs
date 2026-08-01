#!/usr/bin/env node

process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';

const path = require('path');
const Module = require('module');
const babel = require('@babel/core');

const repositoryRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(repositoryRoot, 'src');
const defaultJavaScriptLoader = Module._extensions['.js'];

Module._extensions['.js'] = (module, filename) => {
  if (!filename.startsWith(sourceRoot)) {
    return defaultJavaScriptLoader(module, filename);
  }
  const transformed = babel.transformFileSync(filename, {
    babelrc: false,
    configFile: false,
    presets: [[require.resolve('babel-preset-react-app'), { runtime: 'automatic' }]],
    sourceMaps: false,
  });
  return module._compile(transformed.code, filename);
};

const stableFailure = code => {
  process.stderr.write(`${code}\n`);
  process.exitCode = 1;
};

const main = async () => {
  const {
    createPacket166RunSelection,
    runPacket166Calibration,
  } = require('../src/routing/packet166CalibrationRunner');
  const { auth } = require('../src/firebase');
  const { deleteUser, signInAnonymously } = require('firebase/auth');

  let anonymousUser = null;
  try {
    const selection = createPacket166RunSelection({
      previewOrigin: process.env.PACKET166_PREVIEW_ORIGIN,
      acknowledgement: process.env.PACKET166_RUN_ACKNOWLEDGEMENT,
      batchIndexes: process.env.PACKET166_BATCH_INDEXES,
    });
    const credential = await signInAnonymously(auth);
    anonymousUser = credential.user;
    const output = await runPacket166Calibration({
      selection,
      getIdToken: () => anonymousUser.getIdToken(),
      fetchImpl: globalThis.fetch,
    });
    process.stdout.write(
      `PACKET166_SANITIZED_EVIDENCE_BEGIN\n${JSON.stringify(output, null, 2)}\nPACKET166_SANITIZED_EVIDENCE_END\n`,
    );
  } finally {
    if (anonymousUser) {
      try {
        await deleteUser(anonymousUser);
      } catch (_) {
        // A temporary test identity must never obscure the run outcome.
      }
    }
  }
};

main().catch(error => {
  const code =
    typeof error?.message === 'string' &&
    /^PACKET166_[A-Z0-9_]+$/.test(error.message)
      ? error.message
      : 'PACKET166_RUN_FAILED';
  stableFailure(code);
});
