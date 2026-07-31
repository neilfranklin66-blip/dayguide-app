# Packet 160 — Unpublished Private Alpha Geographical Candidate

**Date:** 28 July 2026

**Status:** Conditional — safe unpublished candidate created; Places-dependent
manual checks blocked by absent Deploy Preview secret

**Branch:** `packet-160-private-alpha-geographical-candidate`

**Base:** `origin/master` at `f3de53628c20995d37ea87f9693565eefd93ed3d`
**Product commit:** `daa13a2de444966e14d0f6140fa6716b36b3480c`

## 1. Purpose

Packet 160 creates an unpublished review candidate for the exact Packet 159
geographical-planning and saved-plan v2 implementation. Its purpose is to
collect manual Private Alpha evidence before any integration or production
decision.

The candidate includes the local Packet 158 evidence record at `6c2f6de` and
the Packet 159 product implementation at `daa13a2`. It does not expand the
Packet 159 product scope.

## 2. Explicit authority

Packet 160 authorises:

- one temporary public GitHub review branch;
- one draft pull request targeting `master`;
- a Netlify Deploy Preview created automatically from that branch or pull
  request;
- read-only inspection of GitHub, Netlify build evidence, and the unpublished
  preview; and
- manual Private Alpha verification against that preview.

Packet 160 does **not** authorise:

- merging or fast-forwarding any commit into `master`;
- publishing or promoting a Netlify deploy;
- unlocking or changing the locked production deployment;
- changing a Netlify environment variable, secret, scope, or deploy context;
- creating, restoring, rotating, exposing, or deleting an API key;
- enabling Google Routes or any other routing provider;
- changing Google Cloud, Firebase, billing, quota, or provider configuration;
  or
- claiming that an unpublished preview has passed checks that were not
  observed.

## 3. Candidate identity and isolation

The candidate must be traceable by Git commit, GitHub branch, pull-request
number, and Netlify deploy identity. Production must remain the separately
locked deployment identified before Packet 160 as `master@5ef141b`.

The branch commit that requests the candidate must not contain `[skip netlify]`
in its commit message. Later evidence-only commits may use `[skip netlify]` and
remain local unless separately authorised.

The three pre-existing untracked paths are outside Packet 160 and must not be
inspected, staged, committed, modified, or removed:

- `.claude/`;
- `Dayguide#2/`; and
- `docs/KNOWN_ISSUES (# Edit conflict 2026-07-26 1mdrfiC #).md`.

## 4. Automated entry gate

Before pushing the candidate branch:

1. the complete automated test suite must pass;
2. the production build must compile;
3. `git diff --check` must pass;
4. only intended tracked files may be staged;
5. no environment file or Google API-key literal may be added;
6. no production-client Places key path may be introduced; and
7. Google Routes must remain disabled.

Failure of any entry condition blocks the push.

## 5. Netlify evidence gate

The candidate is acceptable for manual review only if:

1. Netlify associates the build with the Packet 160 branch commit;
2. build, deploy, cleanup, and post-processing complete successfully;
3. the preview is explicitly separate from the locked production deploy;
4. the expected static application and server-side functions are present;
5. secrets scanning reports no exposed credential;
6. no Publish action is taken; and
7. production remains `master@5ef141b`.

A failed or absent preview is recorded honestly and must not be treated as an
application acceptance failure unless the application itself was actually
exercised.

## 6. Manual Private Alpha journey

The unpublished candidate must be checked at a mobile-sized viewport and, where
useful, at a desktop viewport.

### 6.1 Planning input

- complete the normal sign-in or guest entry journey;
- select interests;
- confirm that geographical planning appears before venue selections;
- use an explicitly searched London start place;
- add a destination and deadline;
- add, edit, and remove a hard anchor;
- confirm that invalid or incomplete anchors cannot be finalised; and
- confirm that the finalised start drives restaurant discovery.

### 6.2 Itinerary and evidence honesty

- accept a live restaurant card and confirm its real photograph and
  `Live from Google Places` label;
- accept an activity and confirm that sample activity data remains honestly
  labelled rather than presented as live;
- confirm that the timeline preserves the restaurant, activity, and hard
  anchor;
- confirm that fixed-window travel legs carry the unverified/live-check
  warning;
- confirm that no Google Routes result or claimed live route estimate appears;
  and
- confirm that the key-free Maps handoff opens the intended live venue.

### 6.3 Persistence, migration, and privacy

- save or leave the itinerary, return, and resume saved-plan v2;
- confirm that minimum start, destination, deadline, and anchor data restores;
- exercise the supported v1-to-v2 migration fixture or controlled browser
  state and confirm that the legacy plan remains resumable;
- open Share and confirm that the QR code appears;
- confirm that QR text contains no place name, address, coordinate, deadline,
  or anchor detail; and
- confirm that Start Over clears both v1 and v2 saved-plan keys.

## 7. Decision rule

Packet 160 can conclude:

- **PASS** — the exact unpublished candidate passes automated, Netlify, and
  manual acceptance evidence;
- **CONDITIONAL** — the candidate is available and safe, but one or more manual
  checks remain incomplete or a known non-critical limitation is recorded; or
- **FAIL** — the candidate cannot be built safely, exposes a credential,
  changes production, or fails a material Packet 159 acceptance condition.

No result authorises merge or production publication. Those remain separate,
explicitly controlled decisions.

## 8. Automated entry evidence

The pre-publication entry gate passed on 28 July 2026:

- **61 of 61 test suites passed**;
- **1,862 of 1,862 tests passed**;
- zero snapshots and zero test failures;
- the production build compiled successfully;
- main JavaScript: `main.8be1c3d1.js`, **249.85 kB gzipped**;
- main CSS: `main.48c0e225.css`, **4.7 kB gzipped**;
- asynchronous JavaScript chunk: `453.b4e0f767.chunk.js`,
  **1.76 kB gzipped**; and
- `git diff --check` passed.

The first local build invocation could not overwrite an existing build artifact
because the restricted execution sandbox denied filesystem access. The same
build command then ran with normal repository permissions and compiled
successfully. This was an execution-environment restriction, not an application
or dependency failure.

## 9. GitHub and Netlify candidate evidence

The controlled candidate was created successfully:

- GitHub branch:
  `packet-160-private-alpha-geographical-candidate`;
- candidate-trigger commit:
  `afd053a49bf86dac03797a169a3a1c0d1d13f541`;
- draft pull request:
  `https://github.com/neilfranklin66-blip/dayguide-app/pull/8`;
- Netlify deploy:
  `6a68979af6debb00083c6aed`;
- unpublished preview:
  `https://deploy-preview-8--ubiquitous-melomakarona-874d9c.netlify.app`;
- Netlify build status: successful; and
- initializing, building, deploying, cleanup, and post-processing: complete.

The public Netlify deploy history associated the preview with PR 8, the Packet
160 branch, and exact commit `afd053a`. The same history continued to identify
the published production state as `master@5ef141b`, deploy
`6a6602bd6c7609eabb08d744`. Packet 160 did not publish, promote, unlock, merge,
or move `master`.

Successful deployment and the green GitHub Netlify check establish that secrets
scanning did not reject the candidate. No credential value appeared in the
repository, build output, browser bundle, or recorded evidence.

## 10. Manual Private Alpha evidence

The unpublished preview rendered successfully at a mobile-sized viewport and
accepted Firebase guest entry. The observed journey confirmed:

- the global opening copy is `Plan your perfect day, wherever you are`;
- interests and walking preferences render and permit progression;
- geographical planning appears after interests and before venue selection;
- explicit search is user-triggered rather than sent while typing;
- the start, optional destination, and fixed-anchor controls render;
- an incomplete hard anchor is rejected with
  `Choose a verified place and valid time for this anchor.`;
- the safe `Continue without fixed route details` path remains available;
- the travel-time estimate and user-accountability notice renders on the
  timeline;
- the selected activity is explicitly labelled
  `Sample idea — example location, not a live nearby result`;
- the Share action opens `Share Your Day` and renders one QR SVG when exercised
  through the direct visible-control interaction established by KI-002;
- reload presents `Resume your plan` with the correct one-stop count;
- resume restores the selected activity; and
- Start Over removes the resume option for the test plan.

The browser environment denied location permission, so a GPS-origin restaurant
journey was not available. More importantly, a direct call to the preview's own
`places-resolve` function returned:

```text
status: REQUEST_DENIED
error_message: NO_API_KEY
```

This proves that `GOOGLE_PLACES_API_KEY` is not available to the Deploy Preview
context. The failure is server-side and safe: the credential was not exposed,
and the application displayed the expected honest unavailable state. It also
means the following checks could not be completed in Packet 160:

- live typed-place results;
- choosing a searched start;
- a searched start driving live restaurant discovery;
- a complete verified destination and hard anchor;
- saved-plan v2 restoration of real selected geographical data;
- live restaurant photograph and `Live from Google Places` label; and
- the place-specific Google Maps handoff.

QR geographical-data exclusion remains covered by the passing automated tests,
but could not be re-proved manually with a real geographical plan because no
verified place could be created in the preview.

## 11. Decision

Packet 160 concludes **CONDITIONAL**.

The exact Packet 159 source builds and deploys safely, the review candidate is
isolated from production, the mounted workflow and fallback states work, and
no credential is exposed. The candidate cannot yet supply complete
Places-dependent Private Alpha acceptance evidence because the existing
Production secret is intentionally absent from Deploy Previews.

The next controlled decision is whether to authorise a Deploy-Preview-only
value for the existing Places-only server credential, or to create a separately
bounded preview credential. That decision must preserve server-only use,
Places-only Google API restriction, preview-only Netlify scope, secret
masking, and production isolation. Packet 160 itself does not grant that
authority.

No merge, `master` movement, production publication, provider activation, or
credential/configuration change follows from this conditional result.
