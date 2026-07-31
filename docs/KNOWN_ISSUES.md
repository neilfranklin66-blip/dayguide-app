# DayGuide — Known Issues and Technical Debt Register

## 1. Purpose and verification status

This register records evidence-backed known issues, technical debt, architecture
risks, operational uncertainties, security and configuration gaps, test and
accessibility gaps, and explicitly accepted limitations for DayGuide.

- **Current verification date:** 28 July 2026
- **Register baseline:** Packet 134 corrective compliance review
- **Latest targeted update:** Packet 160 unpublished geographical candidate
  and Deploy Preview evidence
- **Baseline evidence date:** 11 July 2026
- **Baseline verification point:** Packet 131
- **Evidence scope:** tracked repository evidence, Product Owner-operated
  authenticated provider evidence, bounded public checks, Packets 141–143 build
  and deployment evidence, and one Packet 144 production guest journey
- **Runtime scope:** Packet 143 clean-install, test, build, candidate, and
  production evidence is recorded in
  [`TRACEABLE_PRODUCTION_DEPLOYMENT.md`](TRACEABLE_PRODUCTION_DEPLOYMENT.md);
  Packet 144 browser evidence is recorded in
  [`PRODUCTION_PRIVATE_ALPHA_VERIFICATION.md`](PRODUCTION_PRIVATE_ALPHA_VERIFICATION.md);
  Packet 145 resolution evidence is recorded in
  [`QR_SHARE_VERIFICATION_AND_REPAIR.md`](QR_SHARE_VERIFICATION_AND_REPAIR.md)

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

### KI-002 — Automated Share check did not expose the QR dialog

- **ID:** KI-002
- **Category:** Test-interaction false negative
- **Severity:** Informational
- **Status:** Resolved pending archive
- **Launch blocking:** No
- **Verification status:** Packet 145 reproduced the locator-specific failure,
  then verified the working production feature through a direct physical pointer
  click and repository-level state-transition test.
- **Factual evidence:** On the completed production timeline, activating
  `Share` through the high-level locator left the visible screen unchanged.
  Packet 145's direct physical pointer click opened `Share Your Day`, a visible
  QR code, the explanatory hint, and Close; Close dismissed the dialog. The
  deployed public bundle contained the expected QR modal code. A new
  `DayGuide.test.js` regression check passed the complete resumed-plan Share
  open-and-close state transition.
- **Impact:** No product impact is established. The original verification method
  could incorrectly report a working control as failed.
- **Likely dependency:** Browser-automation interaction semantics, not DayGuide
  application behaviour.
- **Recommended next action:** Archive after Product Owner acceptance. Retain the
  regression test and use a physical pointer action when verifying this control
  in the current browser-testing surface.
- **Verification date:** 26 July 2026

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
- **Status:** Resolved pending archive
- **Launch blocking:** No
- **Verification status:** Resolution verified in tracked Packet 159 source and
  automated tests; Product Owner archive acceptance remains outstanding.
- **Factual evidence:** `src/utils/planStorage.js` now writes version 2 under
  `dayguide_saved_plan_v2`, reads valid `dayguide_saved_plan_v1` payloads,
  migrates them locally with no invented geographical data, and removes the
  legacy key. Invalid v2 geographical data is rejected.
- **Impact:** Existing valid v1 plans remain resumable while new plans can
  persist the bounded geographical schema.
- **Likely dependency:** Product Owner acceptance to archive this resolved
  entry.
- **Recommended next action:** Confirm Packet 159 acceptance, then archive
  TD-001 without deleting its history.
- **Verification date:** 28 July 2026

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
- **Status:** Resolved pending archive
- **Launch blocking:** No
- **Verification status:** Packet 142 verified the replacement Production
  credential through a locked candidate, deployed both functions from exact Git
  commit `5ef141b`, and published that candidate while retaining the lock.
- **Factual evidence:** One bounded nearby request returned `OK` with 20
  results. One dependent photo request returned `302` to
  `lh3.googleusercontent.com`. The canonical production record identifies
  deploy `6a6602bd6c7609eabb08d744`, commit `5ef141b`, and two deployed
  functions. The full record is in
  [`TRACEABLE_PRODUCTION_DEPLOYMENT.md`](TRACEABLE_PRODUCTION_DEPLOYMENT.md).
- **Impact:** The previously conditional core restaurant blocker is not present
  in the verified deployment. Later provider, billing, quota, or credential
  failures remain ordinary operational dependencies.
- **Likely dependency:** Continued Google Places, Netlify, billing, quota, and
  credential availability.
- **Recommended next action:** Archive after Product Owner acceptance; reopen
  only on new production evidence of unavailable nearby or photo functions.
- **Verification date:** 26 July 2026

### OP-002 — Production Firebase authentication state is unverified

- **ID:** OP-002
- **Category:** Deployment and external-service uncertainty
- **Severity:** High
- **Status:** Partially verified
- **Launch blocking:** No
- **Verification status:** Packet 144 verified anonymous guest sign-in and
  logout on the production domain. Google and email/password provider paths,
  provider governance, authorised-domain configuration, and quota remain
  unverified.
- **Factual evidence:** `src/App.js` renders `DayGuide` only for an
  authenticated user. `src/AuthContext.jsx` uses Google, email/password, and
  anonymous Firebase Auth against the project configured in `src/firebase.js`.
  In Packet 144, `Continue as guest` reached the authenticated welcome screen,
  the planning journey completed, and Logout returned to the sign-in screen.
- **Impact:** A production Firebase or provider configuration failure can
  prevent users from reaching the planning journey.
- **Likely dependency:** Firebase project provisioning, authentication-provider
  settings, authorised domains, service availability, and quota.
- **Recommended next action:** Decide which sign-in methods Private Alpha
  participants require, then verify only those paths through an authorised
  operational check.
- **Verification date:** 26 July 2026

### OP-003 — Deployment runtime is pinned in tracked configuration

- **ID:** OP-003
- **Category:** Deployment reproducibility gap
- **Severity:** Medium
- **Status:** Resolved pending archive
- **Launch blocking:** No
- **Verification status:** Packet 141 tracks `.node-version` with major version
  24 and verified a clean tracked-source production build under Node 24.
  Packets 142 and 143 then completed the Git-connected Netlify build and
  publication. The exact hosted patch version was not captured in the retained
  build evidence.
- **Factual evidence:** `.node-version` contains `24`; Netlify currently supports
  this file in the repository base and lists Node 24 as its default build
  version. Packet 141 built successfully under Node `v24.15.0` and npm
  `11.12.1`.
- **Impact:** The repository now selects a stable Node major instead of silently
  inheriting a future provider default-major change.
- **Likely dependency:** Future Netlify build logs and the tracked Node-major
  pin.
- **Recommended next action:** Archive after Product Owner acceptance; retain
  `.node-version` and record the exact hosted patch version if a later runtime
  diagnosis requires it.
- **Verification date:** 26 July 2026

### OP-004 — Production deployment lacks Git provenance

- **ID:** OP-004
- **Category:** Deployment provenance and recovery risk
- **Severity:** High
- **Status:** Resolved pending archive
- **Launch blocking:** No
- **Verification status:** The existing Netlify project is linked to the
  established GitHub repository and production branch. Public Netlify metadata
  maps canonical production to exact commit `5ef141b` and deploy
  `6a6602bd6c7609eabb08d744`.
- **Factual evidence:** Packet 142 retained the existing site, configured
  repository `neilfranklin66-blip/dayguide-app`, branch `master`, tracked build
  settings, and manual publication locking. The Git-connected Netlify build
  completed and the exact candidate was deliberately published. The May 18
  deploy remains `ready`, and Packet 140's external archive remains historical
  recovery evidence.
- **Impact:** Current production can now be mapped to reviewed source and a
  repeatable build. Historical rollback artifacts can still age out and may not
  restore Places after old-key retirement.
- **Likely dependency:** Netlify history retention, continued GitHub linkage,
  and deliberate locked publication.
- **Recommended next action:** Archive after Product Owner acceptance; retain
  the publication lock and document any future release against an exact commit.
- **Verification date:** 26 July 2026

### OP-005 — Legacy dependency resolution remains required

- **ID:** OP-005
- **Category:** Deployment reproducibility and dependency debt
- **Severity:** Medium
- **Status:** Verified open
- **Launch blocking:** No
- **Verification status:** Packet 143 reproduced the current npm resolution
  failure and verified the tracked compatibility setting in an isolated
  tracked-source copy and in Netlify.
- **Factual evidence:** Without legacy peer resolution, current npm reports a
  lockfile/optional TypeScript peer conflict and Netlify produced
  `Environment key "jest/globals" is unknown`. `.npmrc` now records
  `legacy-peer-deps=true`. Clean `npm ci`, 37 suites, 927 tests, and a CI
  production build pass; Netlify then built and deployed successfully. The
  dated clean install also reported 43 audit findings: 11 low, 9 moderate, 21
  high, and 2 critical across the installed legacy dependency tree.
- **Impact:** Deployment is reproducible, but the Create React App 5 toolchain
  remains old and should not be represented as modern dependency hygiene.
- **Likely dependency:** A separately designed build-stack modernisation that
  preserves application behaviour and test coverage.
- **Recommended next action:** Do not run `npm audit fix --force` or unbounded
  upgrades. Define a separate audited modernisation packet when prioritised.
- **Verification date:** 26 July 2026

### OP-006 — Place resolution depends on Find Place Legacy

- **ID:** OP-006
- **Category:** External-service lifecycle and migration risk
- **Severity:** Medium
- **Status:** Verified open
- **Launch blocking:** No for the current bounded Private Alpha; conditional
  before a wider release
- **Verification status:** The tracked endpoint and Google's current lifecycle
  position are verified. No current outage or credential failure is evidenced.
- **Factual evidence:** `netlify/functions/places-resolve.js` calls the Find
  Place Legacy endpoint. Google's lifecycle material says existing projects
  can continue to use Legacy Places services, gives no shutdown date, promises
  at least twelve months' notice before discontinuation, and identifies Text
  Search (New) as the replacement for Find Place Legacy. Packet 153 records
  migration triggers without changing the endpoint, API, key, or production.
- **Impact:** The unmounted place-resolution foundation is not on a modern
  long-term endpoint. A rushed provider migration could alter matching,
  attribution, billing, quotas, and key restrictions; ignoring a future notice
  could eventually make typed-place resolution unavailable.
- **Likely dependency:** Google Places lifecycle notices, DayGuide's rollout
  boundary, response-field comparison, and a separately authorised migration.
- **Recommended next action:** Monitor the official lifecycle. Open a bounded
  migration packet at the first applicable official notice, verified recurring
  endpoint failure, security/policy/capability need, inability to restore the
  API, or before wider-than-Private-Alpha release. Do not combine the migration
  casually with routing activation or widen/reuse the routing key.
- **Verification date:** 27 July 2026

### OP-007 — Deploy Previews do not receive the Production Places secret

- **ID:** OP-007
- **Category:** Review-environment configuration boundary
- **Severity:** Medium
- **Status:** Mitigated and procedurally closed by Packet 161
- **Launch blocking:** No
- **Verification status:** Packet 160 directly verified the safe absent-secret
  state. Packet 161 directly verified the bounded temporary-preview procedure
  and subsequent configuration rollback.
- **Factual evidence:** The candidate built and deployed successfully, but its
  server-side `places-resolve` endpoint returned
  `REQUEST_DENIED / NO_API_KEY`. The rendered application showed the expected
  honest unavailable state. Public Netlify history continued to identify
  production as `master@5ef141b`, deploy `6a6602bd6c7609eabb08d744`.
- **Impact:** Deploy Previews deliberately remain key-free by default. Live
  Places acceptance is possible through the Packet 161 procedure: temporarily
  add the existing Places-only server credential to the Deploy Previews
  context, rebuild the exact candidate, perform bounded acceptance, and remove
  the preview value. Packet 161 successfully exercised that procedure with
  deploy `6a68a3a3f9034449c8f4bf7e` and then restored the narrow baseline.
- **Operational rule:** Do not broaden the secret to Branch deploys, Preview
  Server and Agent Runners, Local development, browser-prefixed variables, or
  Routes. A rebuilt preview after rollback should return the safe `NO_API_KEY`
  state; Packet 160 already proves that behaviour.
- **Recommended next action:** None while the default key-free preview boundary
  is retained. Reuse the separately authorised Packet 161 procedure only when
  another live Places acceptance exercise is necessary.
- **Verification date:** 28 July 2026

The Packet 139 variable-name absence, incomplete function deployment, missing
Git linkage, and production provenance gaps are resolved by Packets 140–143.
Firebase provider state, billing alerts, quotas, and the complete authenticated
journey remain outside the bounded deployment verification.

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
- **Verification status:** The production migration and public-bundle outcome
  are verified. Packet 144 also removed the unused key from the separate Google
  project. Functions-only Netlify scope, billing alerts, and quota controls
  remain unresolved.
- **Factual evidence:** Packet 142 created `DayGuide Netlify Places Key` in the
  confirmed Google project, limited it to `Places API`, stored it as a
  Production Netlify secret, verified it through both functions, deleted
  `REACT_APP_GOOGLE_PLACES_API_KEY` from every Netlify context, verified the
  clean public bundle contains no Places key or secret-variable name, and
  deleted the old 33-API credential. Netlify requires a paid upgrade to reduce
  the secret's scope from Builds, Functions, and Runtime to Functions only; no
  upgrade was authorised. An unused key dated 26 July 2026 had been generated
  in separate project `dayguide1` during project identification. Packet 144
  confirmed the exact project and key, deleted it, and observed `No API keys to
  display` in that project. The production key was in a different project and
  was not changed.
- **Impact:** The production key is no longer exposed through the CRA client
  path and has narrow API access. Broad Netlify process scope and the unrelated
  billing and quota governance remain residual configuration risks, not current
  production blockers. The wrong-project unused-key risk is closed.
- **Likely dependency:** Netlify plan capabilities and Google billing/quota
  governance.
- **Recommended next action:** Keep the current production secret and
  publication lock unchanged; consider Functions-only scope only if the benefit
  justifies a plan change.
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
  suite. Packet 144 supplied one manual browser journey as dated operational
  evidence, not a repeatable tracked test layer.
- **Factual evidence:** `package.json` exposes Create React App test and build
  scripts. Tracked tests are colocated `*.test.js` and `*.test.jsx` files;
  no tracked Playwright, Cypress, or equivalent end-to-end configuration exists.
- **Impact:** Repository tests do not by themselves demonstrate that the
  complete deployed authentication, geolocation, function, swipe, persistence,
  sharing, and external-link journey works in a real browser. Packet 144 reduced
  uncertainty for one guest denied-location path and identified an unresolved
  Share-action finding.
- **Likely dependency:** An approved browser test strategy and authorised test
  environments for external services.
- **Recommended next action:** Define the minimum critical-path browser checks
  needed for launch assurance before selecting tooling.
- **Verification date:** 26 July 2026

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

Packet 143 validation on 26 July 2026 ran clean `npm ci`, the full automated
suite (37 suites, 927 tests), and a Netlify-style CI production build from an
isolated tracked-source export; all passed. Netlify then built exact commit
`5ef141b`, deployed both functions, and Packet 142 published the verified,
locked candidate.

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
- **Factual evidence:** Packet 156 adds a universal estimate policy and
  user-controlled walking pace/maximum, but the current timeline still passes
  venue-to-user proximity rather than true adjacent-leg route evidence. Taxi
  no longer uses its old fixed-speed time and instead requires a live check.
- **Impact:** Displayed travel time and fare information must not be interpreted
  as guaranteed routing, traffic, or pricing. The itinerary visibly states the
  limitation and offers key-free Google Maps directions handoffs.
- **Likely dependency:** Mounting true Packet 151 adjacent-leg evidence and,
  if approved, a live provider duration.
- **Recommended next action:** Preserve the Packet 156 disclosure and live
  handoff until true route-leg evidence replaces proximity calculations.
- **Verification date:** 27 July 2026

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

TD-001 is **Resolved pending archive** at this verification point. There are no
archived entries.

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
