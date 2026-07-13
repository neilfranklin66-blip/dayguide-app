# DayGuide — Known Issues and Technical Debt Register

## 1. Purpose and verification status

This register records evidence-backed known issues, technical debt, architecture
risks, operational uncertainties, security and configuration gaps, test and
accessibility gaps, and explicitly accepted limitations for DayGuide.

- **Current verification date:** 13 July 2026
- **Register baseline:** Packet 134 corrective compliance review
- **Latest targeted update:** Packet 136 deployment audit
- **Baseline evidence date:** 11 July 2026
- **Baseline verification point:** Packet 131
- **Evidence scope:** tracked repository files and the new Packet 134 document
  only
- **Runtime scope:** no application tests or production build were run for
  Packet 134

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
the Packet 133 launch blocker. Tracked evidence does **not** prove that the
condition is present in production, so the entry remains an **Unverified
operational assumption**, not a verified open production defect.

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
- **Status:** Unverified operational assumption
- **Launch blocking:** Yes, conditionally — only if the production key or
  required Netlify functions are unavailable
- **Verification status:** Failure behaviour is verified in tracked evidence;
  actual production configuration and live success are unverified.
- **Factual evidence:** `netlify/functions/places-nearby.js` returns
  `REQUEST_DENIED` with `NO_API_KEY` when `GOOGLE_PLACES_API_KEY` is absent.
  `src/api/placesApi.js` maps an undeployed function response (HTTP 404) to the
  same unavailable state. `docs/CURRENT_STATE.md` identifies the condition as
  the launch blocker because restaurant recommendations are live-only.
- **Impact:** If the condition is present, the core restaurant recommendation
  journey cannot provide live recommendations.
- **Likely dependency:** Netlify deployment state, production environment
  configuration, Google Places availability, billing, restrictions, and quota.
- **Recommended next action:** Perform an authorised production smoke check that
  confirms both functions are deployed and a nearby search succeeds without
  exposing the key.
- **Verification date:** 13 July 2026

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

### OP-003 — Deployment runtime is not pinned in tracked configuration

- **ID:** OP-003
- **Category:** Deployment reproducibility gap
- **Severity:** Medium
- **Status:** Verified open
- **Launch blocking:** No
- **Verification status:** The tracked configuration gap is verified; the
  runtime currently selected by any live hosting provider is unverified.
- **Factual evidence:** `package.json` has no root `engines` or
  `packageManager` field; no `.nvmrc`, `.node-version`, `.tool-versions`,
  or equivalent runtime file is tracked; and `netlify.toml` declares no Node
  version. The npm lockfile fixes dependencies but does not select the runtime.
- **Impact:** Local and hosted builds can use different provider-selected Node
  or npm versions, and a future default-runtime change can reduce build
  reproducibility.
- **Likely dependency:** An approved supported Node version, clean build
  verification, and the intended hosting configuration.
- **Recommended next action:** Select and pin the supported runtime in a
  separately authorised configuration packet, then verify a clean production
  build.
- **Verification date:** 13 July 2026

These entries do not assert that production is misconfigured. Netlify deployment,
Google key presence and controls, Firebase provider state, external-service
availability, billing, and quotas remain operational assumptions until verified
in the authorised environment.

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
- **Status:** Unverified operational assumption
- **Launch blocking:** No
- **Verification status:** Server-side key handling in code is verified;
  production restriction, ownership, rotation, billing alerts, and quota
  monitoring are unverified.
- **Factual evidence:** `.env.local.example` instructs operators to keep
  `GOOGLE_PLACES_API_KEY` server-side, and the Netlify functions consume it.
  Tracked files contain no evidence of production control settings.
- **Impact:** Weak or missing operational controls could create misuse, cost, or
  service-continuity risk; no such failure is asserted from repository absence.
- **Likely dependency:** Google Cloud and Netlify administrative configuration
  and operational ownership.
- **Recommended next action:** Record an authorised credential, restriction,
  billing-alert, quota, and rotation review outside this packet.
- **Verification date:** 13 July 2026

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
