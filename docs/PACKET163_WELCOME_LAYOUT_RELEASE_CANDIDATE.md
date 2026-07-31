# Packet 163 — Welcome Layout Release Candidate

**Date:** 31 July 2026

**Status:** Local candidate verified; fresh unpublished-preview verification
pending

**Baseline:** Packet 162 commit
`0c3f5b0844592fc50504e1239bb7856e11c41323`

## 1. Authority and boundary

Packet 163 prepares and verifies a fresh unpublished release candidate for the
welcome layout and KI-003. It may create a candidate branch, commit, GitHub
branch/pull-request state, and Netlify Deploy Preview. It does not authorise a
merge, movement of `master`, production publication or promotion, publication
unlock, provider activation, credential change, secret expansion, or Google
Routes request.

The protected untracked `.claude/`, `Dayguide#2/`, and
`docs/KNOWN_ISSUES (# Edit conflict 2026-07-26 1mdrfiC #).md` paths remain
outside inspection and change scope.

## 2. Welcome-layout outcome

The release candidate preserves the approved universal wording and all existing
Start Planning, Resume, refresh-location, and saved-plan behaviour. It:

- separates the map mark, product name, proposition, and supporting copy into
  a clearer responsive introduction;
- makes Start Planning and the conditional Resume action a consistent
  full-width action group;
- retains saved-plan date and stop-count evidence beneath those actions;
- gives location state and refresh control a distinct panel; and
- keeps the existing localized strings and application-flow callbacks.

## 3. KI-003 repair

The tracked cause was `.location-status { word-break: break-all; }`, which
allowed the English location error to leave `again.` as an orphaned line.

Packet 163 restores natural word boundaries with `word-break: normal`, retains
safe overflow handling for genuinely long unbroken content, and separates the
warning icon from the translatable message. The error is exposed as an alert;
the detecting state remains a status message.

## 4. Automated release gate

Local validation on 31 July 2026 completed successfully:

- focused WelcomeStage suite: **1 suite, 7 tests passed**;
- complete suite: **61 suites, 1,863 tests passed**;
- snapshots: **0**;
- production build: **compiled successfully**;
- main JavaScript: `main.e5e1091d.js`, **249.93 kB gzipped**;
- main CSS: `main.5ec880fd.css`, **4.85 kB gzipped**; and
- asynchronous JavaScript chunk: `453.b4e0f767.chunk.js`,
  **1.76 kB gzipped**.

The build repeated the existing Node `DEP0176` warning for `fs.F_OK`; it did not
fail the build and is not caused by Packet 163.

## 5. Fresh unpublished-preview gate

The exact candidate must be associated with a fresh unpublished Netlify Deploy
Preview. Verification requires:

1. successful build, deploy, cleanup, post-processing, and secret scanning;
2. exact candidate commit and preview identity;
3. Production still locked at `master@5ef141b`, deploy
   `6a6602bd6c7609eabb08d744`;
4. universal wording visible with Start Planning and the correct conditional
   Resume state;
5. location-error text naturally wrapped at representative desktop and phone
   widths without an orphaned `again.` line;
6. usable refresh and Start Planning controls; and
7. no claim that preview evidence is production-live.

Live Places-dependent acceptance is not required to close this UI packet. The
Places key remains Production-only, and a newly built preview is expected to
show the existing honest unavailable boundary. Google Routes remains off.

## 6. Current boundary

The local candidate has passed its automated gate. Preview evidence, exact
candidate identity, KI-003 closure, and final Packet 163 decision will be added
only after the fresh unpublished preview exists and is inspected.
