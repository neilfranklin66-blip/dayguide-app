# Packet 159 — Private Alpha Geographical Planning Workflow and Saved-Plan v2 Activation

**Date:** 28 July 2026

**Status:** Implemented locally; not pushed, deployed, published, or production-verified

**Branch:** `packet-159-private-alpha-geographical-planning-saved-plan-v2`

**Baseline:** local `master` at `6c2f6dee6780f164197b0e8d0d1b9b38020d8a07`

## 1. Authority and boundary

The Product Owner explicitly authorised Packet 159 implementation.

This authority covers local tracked source, tests, and documentation only. It
does not authorise a GitHub push or pull request; a Netlify build, preview,
publish, unlock, or production deployment; any Google Cloud, Firebase, billing,
quota, key, or environment-variable change; enabling
`DAYGUIDE_ROUTES_PROVIDER_MODE`; restoring `GOOGLE_ROUTES_API_KEY`; or making a
live Google Routes request.

The existing Places-only server credential boundary is unchanged.

## 2. Activated journey

`DayGuide.jsx` now mounts the Packet 149/150 workflow after interests and before
activity/restaurant selection.

The Private Alpha user can:

- use the current browser location as the start;
- explicitly search for and select another verified station, venue, hotel, or
  address;
- set the start time;
- add an optional end destination and optional arrival deadline/buffer;
- add, edit, and deliberately remove planner-locked fixed anchors; or
- continue without fixed geographical details.

A searched start location becomes the origin of a restaurant-first Places
search. This is the first active journey behaviour that lets a future location,
rather than only current-device GPS, drive nearby restaurant discovery.

Search remains explicit. No request is sent while the user types. Provider
results retain visible Google Maps attribution and the existing honest
unavailable, denied, quota, network, empty, and malformed-result states.

## 3. Hard-anchor and evidence treatment

Finalized input is assessed through `assessGeographicalPlanningInput`, which
connects it to the Packet 148 fixed-window engine.

The activation preserves these invariants:

- anchors retain their exact user-set place, time, duration, buffer, identifier,
  and `plannerLocked: true` value;
- automatic planning cannot move an anchor;
- the user can edit or remove an anchor deliberately;
- missing route evidence remains missing;
- no heuristic or proximity value is promoted into trusted route evidence; and
- Google Routes remains disabled.

The timeline displays the selected start, destination, locked anchors, and
key-free Google Maps handoffs for each fixed leg. When a fixed leg exists, the
timeline states that its travel time is not route-verified and requires a live
check plus user-chosen additional time.

Packet 159 does not interleave sample activities around fixed windows, perform
spatial sorting, prove feasibility, or promise on-time arrival. It activates
the planning-input and fixed-window boundary without claiming those later
capabilities.

## 4. Saved-plan v2

The current storage key is `dayguide_saved_plan_v2`.

The v2 payload adds the finalized geographical planning input to the existing
timeline and render settings. It stores only the selected plan's minimum
route-capable place data:

- place identifier;
- display name;
- latitude and longitude; and
- provenance/source.

It does not store search queries or result lists; unselected provider results;
address; GPS accuracy; locality, country, or timezone metadata; route requests,
route evidence, or provider responses; activity/restaurant selection queues;
or transient UI state.

The plan remains browser-local. The visible workflow explains that selected
place names and coordinates remain in that browser only until the plan expires
or Start Over is used. `clearPlan` removes both v2 and legacy keys, and expired
plans clear both keys.

## 5. v1 compatibility

`loadPlan` checks v2 first and can still read a valid
`dayguide_saved_plan_v1` payload. A valid v1 plan is migrated locally to v2 with
`geographicalPlanning: null`, then the legacy key is removed.

Invalid current geographical data is rejected rather than partially trusted.
A saved v1 plan therefore remains resumable without inventing geographical
details it never contained.

## 6. Sharing and privacy boundary

QR sharing remains a plain timeline/date text summary.

The geographical planning object is not passed to
`TimelineShareQRModal` or serialized by `buildTimelineShareText`. Tests
explicitly verify that names and coordinates supplied as extra geographical
input do not enter the QR text.

Google Maps handoffs use human-readable place labels, contain no API key, and
do not expose raw coordinates in the visible timeline.

This is a bounded Private Alpha data treatment, not a general-release legal
approval. Wider release still requires Product Owner acceptance of the final
privacy notice, terms, provider-content retention policy, and deletion
language.

## 7. Localisation

All mounted Packet 159 controls, validation messages, privacy/evidence
warnings, saved-data notice, and timeline summaries are present in English,
Spanish, French, Chinese, and Vietnamese.

`localeConsistency.test.js` derives every `planning` leaf key from English,
requires it in all five locales, and verifies identical i18next placeholders.

## 8. Validation

Validation must include focused planning workflow, persistence, localisation,
Maps handoff, sharing, and orchestration tests; the complete automated suite; a
production build; `git diff --check`; tracked-secret and forbidden-client-key
searches; and confirmation that routing provider mode remains disabled.

Validation completed successfully:

- **61 test suites and 1,862 tests passed**;
- zero failed tests and zero snapshots;
- the production build compiled successfully;
- main JavaScript: `main.8be1c3d1.js`, **249.85 kB gzipped**;
- main CSS: `main.48c0e225.css`, **4.7 kB gzipped**;
- asynchronous JavaScript chunk: `453.b4e0f767.chunk.js`,
  **1.76 kB gzipped**; and
- `git diff --check` passed.

The first build surfaced a dormant `globalThis` lint error in the previously
unmounted place-resolution client. Packet 159 changed its default dependency to
the browser `fetch` function and then reran the complete suite and build
successfully. The build repeated the existing Node `DEP0176` deprecation
warning for `fs.F_OK`; it did not fail the build.

Tracked audits found no new Google-key literal, no environment file, no
production-client Places key use, and no enabled routing-provider assignment.
The repository's existing Firebase web configuration remains unchanged.

## 9. Acceptance conditions

Packet 159 is locally acceptable when:

1. the new stage appears after interests and before selections;
2. current or explicitly searched start places can be finalized;
3. a searched start drives restaurant discovery;
4. destination/deadline and hard-anchor controls remain validated;
5. anchors remain planner-locked and are visible on the final plan;
6. the fixed-window engine receives finalized input without fabricated route
   evidence;
7. all fixed legs carry an honest unverified/live-check warning;
8. v2 saves and restores minimum geographical data;
9. valid v1 plans migrate locally and remain resumable;
10. Start Over and expiry clear both saved-plan keys;
11. QR text excludes all geographical names and coordinates;
12. all five locales pass parity and placeholder checks;
13. no key, provider, external setting, deployment, or production state
    changes; and
14. all required validation passes.

## 10. Remaining work

The next controlled decision should be based on manual Private Alpha evidence,
not assumed from automated tests. A later packet may define an unpublished
candidate and manual acceptance journey covering mobile layout, typed place
search, anchor editing, v1 migration, resume, QR privacy, and Google Maps
handoffs.

That later work must separately decide whether to keep the provider route
disabled and rely on user accountability/live handoffs; introduce route
estimates under the Packet 156 policy; or pursue route-aware flexible-stop
ordering and fill-time suggestions.

No later packet may infer push, deploy, provider, key, or publication authority
from Packet 159.
