# DayGuide — Known Issues and Technical Debt Register

## 1. Purpose and verification status

This register records evidence-backed known issues, technical debt, architecture
risks, operational uncertainties, security and configuration gaps, test and
accessibility gaps, and explicitly accepted limitations for DayGuide.

- **Current verification date:** 26 July 2026
- **Register baseline:** Packet 134 corrective compliance review
- **Latest targeted update:** Packet 141 controlled traceable deployment
  preparation
- **Baseline evidence date:** 11 July 2026
- **Baseline verification point:** Packet 131
- **Evidence scope:** tracked repository evidence, operational evidence captured
  by the Product Owner and transcribed in Packets 139 and 140, and Packet 141
  provider-guidance review
- **Runtime scope:** Packet 141 test and production-build results are recorded
  in section 9

The untracked `.claude/` and `Dayguide#2/` folders are protected and were not
inspected, listed, searched, opened, modified, moved, renamed, staged, or
deleted.

`docs/CURRENT_STATE.md` is the factual Packet 133 capability snapshot and
contains the dated Packet 131 runtime baseline: 37 suites and 914 tests passing,
with a successful production build, on 11 July 2026. Those dated results are not
present-tense Packet 134 validation.

No tracked document equivalent to this issue and debt register existed before
Packet 134. Repository absence proves only that evidence is not tracked; it does
not prove that an external control, deployment setting, audit, or process does
not exist.

## 2. Status and severity definitions

### Status

Every entry uses exactly one of these statuses:

- **Verified open** — tracked or directly inspected evidence proves the current
  condition and it has not been resolved.
- **Partially verified** — part of the condition is proved, but material runtime,
  external, or product-decision evidence remains unavailable.
- **Unverified operational assumption** — the condition concerns deployed or
  operational state that cannot be established from tracked repository evidence.
- **Deferred** — the Product Owner has explicitly postponed action without
  accepting the condition as a permanent limitation.
- **Accepted limitation** — the Product Owner has accepted the bounded current
  limitation; it is not represented as a working defect.
- **Resolved pending archive** — resolution evidence exists, but Product Owner
  closure and archive approval are still pending.
- **Archived** — the Product Owner has accepted closure and the historical entry
  is retained.

### Severity

Every entry uses exactly one of these severities:

- **Critical** — if the evidenced condition is present, it prevents an essential
  launch journey or creates an unacceptable launch risk.
- **High** — materially impairs a core capability or creates significant
  security, privacy, or trust risk.
- **Medium** — creates a meaningful product, quality, operational, or
  maintainability risk without independently blocking launch.
- **Low** — creates contained impact or bounded technical debt.
- **Informational** — records scope or context without asserting a working
  defect.

Severity describes impact. **Launch blocking is a separate field and decision.**
A Critical entry is not automatically launch blocking, and a launch-blocking
decision must be supported by the launch rules and evidence.

## 3. Active known issues

### KI-001 — Cuisine filtering can retain unclassified restaurants

- **ID:** KI-001
- **Category:** Recommendation data quality
- **Severity:** Medium
- **Status:** Partially verified
- **Launch blocking:** No
- **Verification status:** The filtering behaviour is verified in tracked code;
  its frequency and user impact require representative live-result verification.
- **Factual evidence:** `src/api/placesApi.js` infers cuisine using
  `NAME_CUISINE_PATTERNS`. When cuisine filters are selected, results whose
  detected cuisine array is empty are retained.
- **Impact:** A restaurant that cannot be classified from its name or generic
  provider types may appear despite not being proved to match the selected
  cuisine.
- **Likely dependency:** Representative Google Places responses and an approved
  cuisine-classification policy.
- **Recommended next action:** Measure classification and filter precision using
  representative live results before deciding whether the fallback should
  change.
- **Verification date:** 13 July 2026

No additional active working defect was established from the permitted static
evidence. Entries elsewhere in this register are classified as debt, risk,
uncertainty, gap, or accepted limitation rather than duplicated as known issues.

## 4. Launch blockers

### Conditional launch blocker: OP-001

`OP-001` is the only launch-blocking entry. It is defined once in section 7
and referenced here without receiving another ID.

The Critical severity and launch-blocking classification are conditional on the
production key or Netlify functions being unavailable. Tracked evidence proves
the failure behaviour and `docs/CURRENT_STATE.md` identifies that condition as
the Packet 133 launch blocker. Packet 139 authenticated evidence confirmed a
variable-name mismatch and incomplete function deployment. Packet 140 records
that the exact Production secret name was later configured, but no deployment
or function invocation followed. The deployed nearby function still cannot be
tied to tracked source. The entry is therefore **Partially verified**, not a
conclusively verified production failure or resolution.

No other entry is classified as launch blocking.

## 5. Technical debt

### TD-001 — Saved-plan schema has no migration path

- **ID:** TD-001
- **Category:** Persistence technical debt
- **Severity:** Medium
- **Status:** Verified open
- **Launch blocking:** No
- **Verification status:** Verified in tracked implementation and comments.
- **Factual evidence:** `src/utils/planStorage.js` stores version 1 under
  `dayguide_saved_plan_v1` and explicitly states that there are no migrations;
  a future schema change is expected to use a new key.
- **Impact:** A future persisted-plan schema change requires an explicit
  compatibility, retirement, or reset decision and can otherwise strand or
  discard saved plans.
- **Likely dependency:** The next approved persisted-plan schema change.
- **Recommended next action:** Define and test a version-transition policy before
  changing the persisted payload.
- **Verification date:** 13 July 2026

## 6. Architecture and maintainability risks

### AR-001 — Timeline popup effect suppresses dependency linting

- **ID:** AR-001
- **Category:** React maintainability risk
- **Severity:** Low
- **Status:** Verified open
- **Launch blocking:** No
- **Verification status:** Verified in tracked source; no present runtime defect
  is asserted.
- **Factual evidence:** `src/DayGuide.jsx` disables
  `react-hooks/exhaustive-deps` for the timeline popup effect and declares
  `[stage, timeline]` while the effect reads additional values and callbacks.
- **Impact:** Later changes can introduce stale-closure behaviour without the
  normal lint warning.
- **Likely dependency:** Refactoring the popup trigger or documenting stable
  callback and ref dependencies.
- **Recommended next action:** Restore exhaustive dependency checking with
  focused popup regression coverage, or document why each omitted dependency is
  stable.
- **Verification date:** 13 July 2026

### AR-002 — DayGuide remains the central orchestration boundary

- **ID:** AR-002
- **Category:** Architecture concentration risk
- **Severity:** Medium
- **Status:** Partially verified
- **Launch blocking:** No
- **Verification status:** Responsibility concentration is verified; a concrete
  maintainability failure or refactor requirement is not.
- **Factual evidence:** `docs/CURRENT_STATE.md` and `src/DayGuide.jsx` show
  that one component owns stage progression, preference and selection state,
  restaurant-search wiring, popup coordination, persistence, resume, logout, and
  stage rendering.
- **Impact:** Changes spanning journey state can have a broad regression surface,
  even though presentation and pure logic have already been extracted.
- **Likely dependency:** Future journey changes that materially increase
  orchestration complexity.
- **Recommended next action:** Reassess the boundary when an approved change
  materially increases cross-stage state; do not refactor solely to satisfy this
  register.
- **Verification date:** 13 July 2026

## 7. Deployment and external-service uncertainties

### OP-001 — Production Google Places configuration and function deployment

- **ID:** OP-001
- **Category:** Deployment and external-service uncertainty
- **Severity:** Critical
- **Status:** Partially verified
- **Launch blocking:** Yes, conditionally — only if the production key or
  required Netlify functions are unavailable
- **Verification status:** Tracked failure behaviour, the later Production
  secret-name correction, and incomplete function deployment are verified
  through their stated evidence sources; deployment consumption, live
  nearby-search success, and deployed source remain unverified.
- **Factual evidence:** `netlify/functions/places-nearby.js` returns
  `REQUEST_DENIED` with `NO_API_KEY` when `GOOGLE_PLACES_API_KEY` is absent.
  `src/api/placesApi.js` maps an undeployed function response (HTTP 404) to the
  same unavailable state. `docs/CURRENT_STATE.md` identifies the condition as
  the launch blocker because restaurant recommendations are live-only.
  Product Owner-transcribed authenticated Netlify evidence dated 25 July 2026
  shows only `places-nearby` deployed, exact `GOOGLE_PLACES_API_KEY` absent, and
  only `REACT_APP_GOOGLE_PLACES_API_KEY` configured. Packet 138 public evidence
  shows the `places-photo` route returns `404`. Later Packet 140 evidence in
  [`NETLIFY_RECOVERY_AND_SECRET_CONFIGURATION.md`](NETLIFY_RECOVERY_AND_SECRET_CONFIGURATION.md)
  records exact `GOOGLE_PLACES_API_KEY` configured as a Production secret for
  Builds, Functions, and Runtime. No deployment or function request followed,
  and the legacy client-prefixed variable remains. Packet 141 verifies that both
  current handlers are tracked under the configured functions directory and
  pass their focused tests. It also establishes that `places-photo.js` was
  added on 7 July 2026, after the current 20 May deploy.
- **Impact:** If the condition is present, the core restaurant recommendation
  journey cannot provide live recommendations; the missing photo function also
  prevents the tracked photo-proxy route from operating.
- **Likely dependency:** Netlify deployment state, production environment
  configuration, deployed function source, Google Places availability, billing,
  restrictions, and quota.
- **Recommended next action:** Execute only the approved Packet 142 locked-build
  sequence: rotate/remove the legacy credential configuration, confirm both
  hosted functions before publication, then run the bounded live checks. Do not
  claim the corrected variable is operational until those checks pass.
- **Verification date:** 26 July 2026

### OP-002 — Production Firebase authentication state is unverified

- **ID:** OP-002
- **Category:** Deployment and external-service uncertainty
- **Severity:** High
- **Status:** Unverified operational assumption
- **Launch blocking:** No
- **Verification status:** The authentication dependency is verified in tracked
  code; project availability, provider enablement, authorised domains, quota,
  and production connectivity are unverified.
- **Factual evidence:** `src/App.js` renders `DayGuide` only for an
  authenticated user. `src/AuthContext.jsx` uses Google, email/password, and
  anonymous Firebase Auth against the project configured in `src/firebase.js`.
- **Impact:** A production Firebase or provider configuration failure can
  prevent users from reaching the planning journey.
- **Likely dependency:** Firebase project provisioning, authentication-provider
  settings, authorised domains, service availability, and quota.
- **Recommended next action:** Verify every exposed sign-in path on the intended
  production domain through an authorised operational check.
- **Verification date:** 13 July 2026

### OP-003 — Deployment runtime is pinned in tracked configuration

- **ID:** OP-003
- **Category:** Deployment reproducibility gap
- **Severity:** Medium
- **Status:** Resolved pending archive
- **Launch blocking:** No
- **Verification status:** Packet 141 tracks `.node-version` with major version
  24 and verified a clean tracked-source production build under Node 24. Hosted
  Netlify consumption remains operationally unverified until Packet 142.
- **Factual evidence:** `.node-version` contains `24`; Netlify currently supports
  this file in the repository base and lists Node 24 as its default build
  version. Packet 141 built successfully under Node `v24.15.0` and npm
  `11.12.1`.
- **Impact:** The repository now selects a stable Node major instead of silently
  inheriting a future provider default-major change.
- **Likely dependency:** Packet 142 hosted build log must record the exact 24.x
  and npm versions selected by Netlify.
- **Recommended next action:** Confirm hosted consumption during the first
  locked traceable build; reopen only if Netlify does not honour the tracked
  pin.
- **Verification date:** 26 July 2026

### OP-004 — Production deployment lacks Git provenance

- **ID:** OP-004
- **Category:** Deployment provenance and recovery risk
- **Severity:** High
- **Status:** Verified open
- **Launch blocking:** No
- **Verification status:** Product Owner-transcribed evidence verifies the
  current delivery and retention configuration and the preserved archive's
  reported path, size, and SHA-256; artifact source, commit identity, archive
  contents, and recovery effectiveness remain unavailable.
- **Factual evidence:** On 25 July 2026, authenticated Netlify evidence showed
  `Current repository — Not linked`, `Last deployed from CLI`, and skipped build
  stages. No repository, branch, commit SHA, commit message, or deploy message
  was displayed. An earlier retained deploy offered `Publish deploy`, while
  automatic deploy deletion was set to 90 days. Packet 140 records the current
  published artifact preserved outside the repository as a 4,726,438-byte ZIP
  with Product Owner-supplied SHA-256 evidence. The archive was not opened or
  extracted and is not a source backup or Git-provenance record.
- **Impact:** Production cannot be mapped to reviewed source, and manual
  provider recovery points can expire. The preserved archive reduces loss risk
  but does not prove restore completeness or replace a tested rollback process.
- **Likely dependency:** Archive integrity and restoration planning, controlled
  function/deployment preparation, an approved Git connection, and a deployment
  and rollback runbook.
- **Recommended next action:** Packet 141 has prepared exact Git connection,
  locked candidate-build, verification, publication, and rollback steps.
  Execute them only through an explicitly authorised Packet 142.
- **Verification date:** 26 July 2026

The Packet 139 variable-name absence was corrected in Packet 140, but incomplete
function deployment and missing Git linkage remain confirmed. Live
nearby-search behaviour, deployment consumption of the corrected secret,
credential controls, Firebase provider state, external-service availability,
billing, and quotas remain operationally unverified.

## 8. Security, privacy and configuration gaps

### SP-001 — Firestore security-rule evidence is not tracked

- **ID:** SP-001
- **Category:** Security assurance and configuration documentation gap
- **Severity:** High
- **Status:** Partially verified
- **Launch blocking:** No
- **Verification status:** The repository absence is verified; deployed rule
  content and effectiveness are unknown.
- **Factual evidence:** `src/AuthContext.jsx` reads and writes
  `users/{uid}` preference documents. The tracked inventory contains no
  Firestore rules or Firebase deployment configuration, and
  `docs/CURRENT_STATE.md` requires a separate rules audit.
- **Impact:** Repository review cannot establish whether deployed access controls
  appropriately isolate user preference documents.
- **Likely dependency:** The deployed Firebase project and the organisation's
  rules-management process.
- **Recommended next action:** Obtain an authorised review of the deployed rules;
  manage them as tracked code only through a separately approved change.
- **Verification date:** 13 July 2026

### SP-002 — Production credential controls are unverified

- **ID:** SP-002
- **Category:** Security and operational configuration uncertainty
- **Severity:** Medium
- **Status:** Partially verified
- **Launch blocking:** No
- **Verification status:** Server-side key handling in tracked code, the
  historical Netlify variable-name mismatch, and the later exact Production
  secret-name correction are verified through their stated evidence sources;
  values, deployment consumption, deployed-bundle exposure, restriction,
  ownership, rotation, billing alerts, and quota monitoring are unverified.
- **Factual evidence:** `.env.local.example` instructs operators to keep
  `GOOGLE_PLACES_API_KEY` server-side, and the Netlify functions consume it.
  Product Owner-transcribed authenticated evidence dated 25 July 2026 showed
  exact `GOOGLE_PLACES_API_KEY` absent at that capture point and
  `REACT_APP_GOOGLE_PLACES_API_KEY` configured for Builds, Functions, and
  Runtime in four deploy contexts. No value was accessed. A `REACT_APP_` name
  can enter CRA browser output during a frontend build. Packet 141 Git history
  review proves the May client source read that name; whether the May build
  supplied a value and whether the current artifact contains it remain
  unproved. Packet 140 later records exact
  `GOOGLE_PLACES_API_KEY` created as a Production-only secret scoped to Builds,
  Functions, and Runtime, with no subsequent deployment. The legacy
  client-prefixed variable remains unchanged.
- **Impact:** Weak or missing operational controls could create misuse, cost, or
  service-continuity risk. The old credential must be treated as potentially
  public because the historical browser source read the client-prefixed name.
- **Likely dependency:** Google Cloud and Netlify administrative configuration
  and operational ownership.
- **Recommended next action:** Before the first Packet 142 build, provision a
  replacement credential, update only exact Production
  `GOOGLE_PLACES_API_KEY`, remove the client-prefixed variable from every
  Netlify context, and confirm restrictions and cost controls without exposing
  a value. Keep the old credential only through initial verification, then
  disable it and record the resulting rollback limitation.
- **Verification date:** 26 July 2026

The concrete Firebase web configuration in `src/firebase.js` and its
“Replace these values” comment are ambiguous: static evidence cannot establish
whether the comment is stale or the configured project is production-ready.
Firebase web configuration being public does not verify deployed security rules
or provider governance.

## 9. Test, accessibility and usability gaps

### TA-001 — No tracked end-to-end browser test layer

- **ID:** TA-001
- **Category:** Test evidence gap
- **Severity:** Medium
- **Status:** Partially verified
- **Launch blocking:** No
- **Verification status:** The tracked inventory contains extensive Jest and
  React Testing Library coverage but no tracked browser end-to-end framework or
  suite; testing outside the repository is unknown.
- **Factual evidence:** `package.json` exposes Create React App test and build
  scripts. Tracked tests are colocated `*.test.js` and `*.test.jsx` files;
  no tracked Playwright, Cypress, or equivalent end-to-end configuration exists.
- **Impact:** Repository tests do not by themselves demonstrate that the complete
  deployed authentication, geolocation, function, swipe, persistence, sharing,
  and external-link journey works in a real browser.
- **Likely dependency:** An approved browser test strategy and authorised test
  environments for external services.
- **Recommended next action:** Define the minimum critical-path browser checks
  needed for launch assurance before selecting tooling.
- **Verification date:** 13 July 2026

### TA-002 — Accessibility and representative-device usability are unaudited

- **ID:** TA-002
- **Category:** Accessibility and usability assurance gap
- **Severity:** Medium
- **Status:** Partially verified
- **Launch blocking:** No
- **Verification status:** The absence of tracked audit evidence is verified;
  actual accessibility conformance and device usability are unverified.
- **Factual evidence:** `docs/CURRENT_STATE.md` states that accessibility
  readiness is not verifiable from source and requires a separate audit. The
  tracked inventory contains component tests but no accessibility audit report
  or representative-device usability report.
- **Impact:** Keyboard, screen-reader, contrast, focus, touch, responsive-layout,
  and other conformance or usability defects may remain undiscovered; none is
  asserted without direct evidence.
- **Likely dependency:** An approved accessibility standard, assistive-technology
  testing, and representative-device review.
- **Recommended next action:** Commission a separate authorised audit and record
  concrete findings individually rather than inferring defects from absence.
- **Verification date:** 13 July 2026

Packet 134 did not rerun application tests or the production build. The Packet
131 baseline of 37 passing suites, 914 passing tests, and a successful build is
dated 11 July 2026 and is not presented as current validation.

Packet 139 documentation validation on 25 July 2026 ran the full automated
suite: 37 suites and 927 tests passed, with no failures or snapshots. No
production build was required or run because Packet 139 changed documentation
only.

Packet 140 documentation validation on 25 July 2026 also ran the full automated
suite: 37 suites and 927 tests passed, with no failures or snapshots. No
production build was required or run because Packet 140 changed documentation
only.

Packet 141 validation on 26 July 2026 ran the focused function suite (1 suite,
8 tests), the full automated suite (37 suites, 927 tests), and a clean
tracked-source production build under Node `v24.15.0`; all passed. The build
compiled a 229.26 kB gzipped main JavaScript bundle.

## 10. Deferred or accepted limitations

These are current scope or product limitations, not duplicated as working
defects. No entry is marked Deferred because no separate Product Owner deferral
decision was evidenced during this review.

### AL-001 — Activity suggestions are sample data

- **ID:** AL-001
- **Category:** Accepted product/data limitation
- **Severity:** High
- **Status:** Accepted limitation
- **Launch blocking:** No
- **Verification status:** Verified in tracked source and disclosure components.
- **Factual evidence:** `src/DayGuide.jsx` imports
  `src/mockActivityData.json` and marks activities `isSample: true`.
  `ActivitySwipeCard.jsx` and `TimelineItemRow.jsx` disclose the sample state.
- **Impact:** Activity suggestions are not verified live local recommendations.
- **Likely dependency:** A future approved live activity-data requirement and
  provider, if product scope changes.
- **Recommended next action:** Preserve honest sample disclosure unless the
  Product Owner separately approves live activity integration.
- **Verification date:** 13 July 2026

### AL-002 — Transport estimates are approximate

- **ID:** AL-002
- **Category:** Accepted data-quality limitation
- **Severity:** Medium
- **Status:** Accepted limitation
- **Launch blocking:** No
- **Verification status:** Verified in tracked source.
- **Factual evidence:** `src/engines/transportEngine.js` applies fixed urban
  speed and overhead profiles to venue-to-user distance, not true leg-to-leg
  routing; fare labels are types rather than live prices.
- **Impact:** Displayed travel time and fare information must not be interpreted
  as live routing, traffic, or pricing.
- **Likely dependency:** A future approved live-routing requirement and provider.
- **Recommended next action:** Retain clear approximation disclosure unless live
  routing is separately approved.
- **Verification date:** 13 July 2026

### AL-003 — Planning is single-day

- **ID:** AL-003
- **Category:** Accepted product-scope limitation
- **Severity:** Medium
- **Status:** Accepted limitation
- **Launch blocking:** No
- **Verification status:** Verified in tracked source and current-state
  documentation.
- **Factual evidence:** `src/DayGuide.jsx` owns one `selectedDate`;
  `DateSelector.jsx` edits one date; `planStorage.js` persists one timeline
  and date. `docs/CURRENT_STATE.md` records multi-day planning as not
  implemented.
- **Impact:** The application cannot create or manage a multi-day itinerary.
- **Likely dependency:** A future Product Owner-approved multi-day requirement.
- **Recommended next action:** Do not represent multi-day planning as a defect;
  reassess only if product scope changes.
- **Verification date:** 13 July 2026

### AL-004 — Sharing is a QR-encoded text summary

- **ID:** AL-004
- **Category:** Accepted product-scope limitation
- **Severity:** Low
- **Status:** Accepted limitation
- **Launch blocking:** No
- **Verification status:** Verified in tracked source.
- **Factual evidence:** `TimelineShareQRModal.jsx` passes
  `buildTimelineShareText(...)` to `QRCodeSVG`. No tracked hosted-share
  endpoint, public plan identifier, or export workflow exists.
- **Impact:** Sharing does not create a durable hosted plan link or file export.
- **Likely dependency:** A future Product Owner-approved durable-sharing or
  export requirement.
- **Recommended next action:** Preserve accurate text-QR wording unless product
  scope changes.
- **Verification date:** 13 July 2026

### AL-005 — Favourites and booking are outside implemented scope

- **ID:** AL-005
- **Category:** Accepted scope boundary
- **Severity:** Informational
- **Status:** Accepted limitation
- **Launch blocking:** No
- **Verification status:** Their absence from tracked implementation is verified;
  no evidence establishes them as required or defective.
- **Factual evidence:** `docs/CURRENT_STATE.md` records favourites and booking
  as not implemented, and tracked source contains no corresponding workflow.
- **Impact:** Users cannot favourite or book through DayGuide.
- **Likely dependency:** A future explicit Product Owner requirement.
- **Recommended next action:** Keep these capabilities out of the defect register
  unless tracked requirements establish different expected behaviour.
- **Verification date:** 13 July 2026

## 11. Resolved and archive policy

There are no entries with status **Resolved pending archive** or **Archived** at
this verification point.

1. An entry may move to **Resolved pending archive** only when factual resolution
   evidence and the relevant validation result are recorded in the entry.
2. Only the Product Owner may accept closure and change **Resolved pending
   archive** to **Archived**.
3. Archived entries remain in this document with their original ID, final
   evidence, verification date, and closure decision. They are not deleted,
   renumbered, reassigned, or reused.
4. If an archived condition recurs, reopen the same entry when it is the same
   issue; create a new ID only for a materially distinct condition.
5. Moving an entry to **Deferred** or **Accepted limitation** requires an explicit
   Product Owner decision. Lack of repository evidence is not acceptance.

## 12. Update and ownership rules

1. The **Product Owner** owns prioritisation, severity acceptance,
   launch-blocking decisions, deferral, acceptance of limitations, closure, and
   archive approval.
2. The **implementing or reviewing engineer** owns accurate factual evidence,
   verification status, impact, dependencies, recommended next action,
   verification date, and validation results. Engineering recommendations do not
   substitute for Product Owner decisions.
3. The relevant **operational or security owner** supplies evidence for deployed
   configuration, external-service, credential, quota, billing, privacy, and
   security-rule assumptions.
4. Update an entry when new tracked evidence, authorised operational evidence, or
   a Product Owner decision changes its facts, status, severity, launch-blocking
   classification, ownership, or closure state.
5. Use only the stable ID families `KI-###`, `TD-###`, `AR-###`, `OP-###`,
   `SP-###`, `TA-###`, and `AL-###`. Allocate the next unused number within
   the appropriate family. Never reuse, renumber, or silently reclassify an ID.
6. Record one condition under one ID. Cross-reference it from another section
   rather than duplicating it.
7. Do not classify future functionality as a defect without tracked evidence of
   required behaviour. Record an approved scope decision as **Deferred** or
   **Accepted limitation**.
8. Classify repository absences and external-state questions as documentation
   gaps, partial verification, or operational assumptions unless direct evidence
   proves a working defect.
9. Keep evidence factual and dated. Use **11 July 2026** for Packet 131 baseline
   evidence and the actual inspection date for later verification.
