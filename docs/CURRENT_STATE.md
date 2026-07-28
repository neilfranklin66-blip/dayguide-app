# DayGuide — Current-State and Launch-Gap Register

## 1. Purpose and verification status

This is a **factual current-state register** for DayGuide. It records what the
application actually does as implemented in tracked source code, configuration
and tests — not what is planned, hoped for, or described elsewhere.

- **Verification date:** 2026-07-11
- **Verification point:** Packet 133
- **Scope:** tracked files only. Untracked notes were not consulted.
- **Future ideas are excluded.** Anything not implemented is either omitted or
  explicitly marked *Not implemented*. No capability is described as present
  unless repository evidence supports it.

This document should be read as a snapshot at the Packet 133 verification point.
Test and suite counts in §7 are dated snapshots, not permanent facts.

**Repository implementation workflow:** Packet 135 added
[`docs/DEVELOPMENT_WORKFLOW.md`](DEVELOPMENT_WORKFLOW.md) as the repository-level
process for implementation authority, packet execution, verification,
integration separation, and new-chat handover. This process documentation does
not change the Packet 133 application-capability verification point above.

**Deployment reality audit:** Packet 136 added
[`docs/DEPLOYMENT_REALITY_AUDIT.md`](DEPLOYMENT_REALITY_AUDIT.md) as the
repository-versus-live evidence record. Packet 136 is the latest completed
documentation packet; it does not change the Packet 133 application-capability
verification point above.

**Project governance:** Packet 137 added
[`docs/PROJECT_GOVERNANCE.md`](PROJECT_GOVERNANCE.md) for permanent authority,
acceptance, definition-of-done, safety, evidence, and handover rules. Packet 137
is the latest completed documentation packet; it does not change the Packet 133
application-capability verification point above.

**Read-only Netlify evidence:** Packet 138 added
[`docs/NETLIFY_EVIDENCE_CAPTURE.md`](NETLIFY_EVIDENCE_CAPTURE.md). Its bounded
public check verified that the supplied Netlify URL returned `200` and rendered
DayGuide, while the expected `places-photo` function route returned `404`.
Provider linkage, deploy provenance, environment presence, and rollback remain
unresolved because authenticated Netlify access was unavailable. This evidence
does not change the Packet 133 application-capability verification point above.

**Authenticated Netlify evidence:** Packet 139 added
[`docs/NETLIFY_AUTHENTICATED_EVIDENCE.md`](NETLIFY_AUTHENTICATED_EVIDENCE.md)
from an authenticated browser session operated by the Product Owner. It confirms
that production is an unattributed CLI deploy with no Git linkage, only
`places-nearby` deployed, and a configured environment-variable name that does
not match tracked function requirements. Codex did not access Netlify, and the
evidence does not change the Packet 133 application-capability verification
point above.

**Recovery and secret-configuration evidence:** Packet 140 added
[`docs/NETLIFY_RECOVERY_AND_SECRET_CONFIGURATION.md`](NETLIFY_RECOVERY_AND_SECRET_CONFIGURATION.md).
The Product Owner preserved the current deploy archive outside the repository
and configured exact Production secret name `GOOGLE_PLACES_API_KEY`. No
deployment followed, the legacy client-prefixed variable remains, and runtime
behaviour is unverified. Codex did not access the archive, `.env.local`,
Netlify, or a secret value. This evidence does not change the Packet 133
application-capability verification point above.

**Controlled deployment preparation:** Packet 141 added
[`docs/CONTROLLED_TRACEABLE_DEPLOYMENT_PREPARATION.md`](CONTROLLED_TRACEABLE_DEPLOYMENT_PREPARATION.md).
It explains the missing production photo function from tracked chronology,
pins Node.js major version 24, verifies the current build and both function
handlers, decides to rotate the potentially exposed legacy credential, and
defines locked publication and rollback controls for Packet 142. No live
function, provider setting, secret value, archive, or deployment was accessed
or changed. This preparation does not change the Packet 133
application-capability verification point above.

**Traceable production deployment:** Packets 142 and 143 added
[`docs/TRACEABLE_PRODUCTION_DEPLOYMENT.md`](TRACEABLE_PRODUCTION_DEPLOYMENT.md)
and the tracked npm compatibility setting. Production now serves exact Git
commit `5ef141bf903521dbb9b7c53ff5af682a920ef5be` from a locked Netlify deploy
with both Places functions. The replacement Production secret is restricted to
Places API, the legacy client-prefixed Netlify variable is deleted, the public
bundle contains no Places credential, and the historical broad credential is
retired. This operational evidence updates deployment readiness but does not
change the Packet 133 application-capability verification point above.

**Production Private Alpha verification:** Packet 144 added
[`docs/PRODUCTION_PRIVATE_ALPHA_VERIFICATION.md`](PRODUCTION_PRIVATE_ALPHA_VERIFICATION.md).
One bounded production guest journey passed authentication, denied-location
handling, preferences, sample-activity selection, honest restaurant
unavailability, timeline generation, saved-plan resume, reset, and logout. The
initial automated Share action did not expose its expected QR dialog, but Packet
145 established that this was a browser-test interaction false negative: a
direct physical pointer click opened the complete QR dialog and Close dismissed
it. Google and email/password authentication, a location-enabled restaurant UI
journey, representative mobile-device coverage, and accessibility remain
outside the evidence. The separately authorised, unused 35-API key in Google
project `dayguide1` was deleted without changing the production credential.
This operational evidence does not change the Packet 133
application-capability verification point above.

**Location-enabled Private Alpha gate:** Packet 146 added
[`docs/LOCATION_ENABLED_PRIVATE_ALPHA_GATE.md`](LOCATION_ENABLED_PRIVATE_ALPHA_GATE.md).
One bounded guest production journey verified location acquisition, honest
filtered zero-results handling, explicitly authorised unfiltered broadening,
live Google Places restaurant cards and photographs, restaurant selection into
a mixed live/sample timeline, the exact Maps handoff, two-stop persistence and
resume, QR sharing, reset, and logout. No coordinate or returned restaurant
identity was recorded. The result is **GO for a bounded invitation-only guest
Private Alpha**, not general launch readiness. This operational evidence does
not change the Packet 133 application-capability verification point above.

**Geographical intelligence and anchor audit:** Packet 147 added
[`docs/GEOGRAPHICAL_INTELLIGENCE_AND_ANCHOR_RECOVERY_AUDIT.md`](GEOGRAPHICAL_INTELLIGENCE_AND_ANCHOR_RECOVERY_AUDIT.md).
Tracked source and history confirm that date, start time, current-device GPS,
nearby restaurant discovery, and approximate transport survive, but manual
start location, end destination, hard anchors, leg-to-leg travel, spatial
ordering, opening-time feasibility, and route-aware fill-time suggestions are
not implemented. The only anchor-related code is default
`isAnchorCapable: false` metadata. The Product Owner's geographical-intelligence
vision therefore requires a staged rebuild rather than recovery of a tracked
feature. This audit does not change application or production behaviour.

**Geographical planning foundation:** Packet 148 added
[`docs/GEOGRAPHICAL_PLANNING_FOUNDATION_AND_HARD_ANCHOR_ENGINE.md`](GEOGRAPHICAL_PLANNING_FOUNDATION_AND_HARD_ANCHOR_ENGINE.md).
Tracked code now has route-capable place, start, hard-anchor, end,
flexible-stop, and route-leg models plus a provider-independent engine that
builds fixed planning windows and rejects impossible or unproved fits without
moving anchors. Live restaurant coordinates are retained internally. This
foundation is not wired to the UI, current timeline, saved-plan version 1,
providers, or production, so it does not yet provide a user-visible
geographical-planning capability.

**Start, destination, and anchor input workflow:** Packet 149 added
[`docs/START_DESTINATION_AND_HARD_ANCHOR_INPUT_WORKFLOW.md`](START_DESTINATION_AND_HARD_ANCHOR_INPUT_WORKFLOW.md).
Provider-neutral workflow state and components can now distinguish current GPS
from another resolved place, collect an optional destination/deadline, and add,
edit, or deliberately remove planner-locked hard anchors. The workflow accepts
only validated route-capable places and rejects unresolved free text. Packet
150 now supplies an internal place-resolution boundary, and Packet 151 consumes
the finalized structure internally. The workflow remains unmounted in
`DayGuide.jsx`; current production behaviour is unchanged.

**Place resolution and planning-input integration:** Packet 150 added
[`docs/PLACE_RESOLUTION_BOUNDARY_AND_PLANNING_INPUT_INTEGRATION.md`](PLACE_RESOLUTION_BOUNDARY_AND_PLANNING_INPUT_INTEGRATION.md).
An explicit-search-only, server-keyed Google Places boundary now resolves typed
stations, venues, hotels, and addresses into validated Packet 148 place
references. `PlanningInputWithPlaceResolution` supplies deliberately added
matches to the Packet 149 selectors with attributed results and honest
loading, empty, unavailable, denied, quota, network, and malformed-response
states. It is not mounted in `DayGuide.jsx`: route evidence, planning-engine
integration, localization, compliant persistence, and activation were left as
separate work at that packet boundary. Packet 151 now provides the first two
internally, without selecting a live route provider. Current production
behaviour is unchanged.

**Route evidence and geographical-planning integration:** Packet 151 added
[`docs/ROUTE_EVIDENCE_BOUNDARY_AND_GEOGRAPHICAL_PLANNING_INTEGRATION.md`](ROUTE_EVIDENCE_BOUNDARY_AND_GEOGRAPHICAL_PLANNING_INTEGRATION.md).
A dated, timezone-aware, provider-neutral batch boundary now constructs the
adjacent travel legs around Packet 149 start/destination/anchor input. Only
validated provider-route or operator-schedule evidence can prove feasibility;
the existing approximate transport heuristic is rejected. The integration
returns ready, infeasible, evidence-required, directional, or
no-route-required, preserves fixed anchors, and exposes an honest unmounted
review stage. No live routing provider or current-journey activation exists.

**Routing provider decision and guarded adapter:** Packet 152 added
[`docs/ROUTING_PROVIDER_DECISION_CREDENTIAL_ISOLATION_AND_COST_GUARDRAILS.md`](ROUTING_PROVIDER_DECISION_CREDENTIAL_ISOLATION_AND_COST_GUARDRAILS.md).
Google Compute Routes Essentials is the selected future adjacent-leg mechanism.
A same-origin client boundary and server adapter enforce a distinct routing
key, exact disabled-by-default provider mode, six-leg maximum, one request and
one route per leg, no retries, no alternatives, no matrix, traffic-unaware
driving, minimal response fields, timeout, and a three-checks-per-minute
IP/domain rule. The adapter is not mounted, no routing key or provider mode is
configured, and no provider, Netlify, production, push, or deployment change
has occurred.

**Routing pre-activation security and evidence-quality gate:** Packet 153 added
[`docs/ROUTING_PREACTIVATION_SECURITY_AND_EVIDENCE_QUALITY_GATE.md`](ROUTING_PREACTIVATION_SECURITY_AND_EVIDENCE_QUALITY_GATE.md).
The same-origin routing boundary now requires and cryptographically verifies a
current Firebase ID token before request validation, routing-key access, or a
paid provider call, and fails closed if verification is unavailable. A
provider-independent quality gate now requires Product-Owner-approved
freshness, sample, availability, optimistic-understatement, and
anchor-critical thresholds before any assessed mode can pass. The hard daily
quota/stop procedure, Legacy Places migration trigger, and routing-specific
deployment checks are recorded. Routing remains disabled and unmounted; no
external configuration or production behaviour changed.

**London route calibration and Private Alpha criteria:** Packet 154 added
[`docs/LONDON_ROUTE_CALIBRATION_AND_PRIVATE_ALPHA_ACCEPTANCE_CRITERIA.md`](LONDON_ROUTE_CALIBRATION_AND_PRIVATE_ALPHA_ACCEPTANCE_CRITERIA.md).
A non-network London framework now defines 24 named public-place scenarios:
12 walking and 12 public-transport cases across peak, off-peak, weekend,
station, activity, hotel, fixed-venue, and hard-anchor conditions. It produces
five bounded batches with a 24-event one-off ceiling, proposes explicit
mode-specific quality thresholds, and calculates an unapproved 150-request
daily Private Alpha quota from 10 testers, two checks, six legs, and 25%
headroom. The criteria and quota remain visibly unapproved, no live evidence
exists, and routing remains disabled and unmounted.

**Controlled Routes live-calibration preparation:** Packet 155 records Neil's
instruction to implement the live exercise as acceptance of Packet 154's exact
walking/transit thresholds, dates, and 150-request Private Alpha envelope.
[`docs/PACKET155_CONTROLLED_ROUTES_LIVE_CALIBRATION.md`](PACKET155_CONTROLLED_ROUTES_LIVE_CALIBRATION.md)
defines a temporary Routes-only credential lifecycle, hard quota, monitoring
budget, deploy-preview-only draft, two-phase 24-event run, independent
references, assessment, and mandatory shutdown. A local operator runner rejects
production, requires an exact acknowledgement, authenticates through a
temporary Firebase guest, makes no retries, and returns only sanitised evidence.
At this preparation point no external setting, provider call, draft deploy, or
production behaviour has changed.

## 2. Current user journey

DayGuide is a single-page React (Create React App) application. There is no
router; a single `stage` value in `src/DayGuide.jsx` drives the screen shown.

Authentication gate (`src/App.js`): while unauthenticated the user sees the
`Login` screen; once Firebase reports a signed-in user, the `DayGuide`
experience renders.

Verified stage flow (`src/DayGuide.jsx`, `src/engines/itineraryRouteEngine.js`):

1. **welcome** — tagline, live geolocation status, "Start planning", and — when a
   saved plan exists in `localStorage` — a "Resume" option.
2. **location** — a brief interstitial shown only while geolocation is still
   loading; it auto-advances to interests once location resolves (success or
   error).
3. **interests** — preference capture on one screen: activity interests, cuisines,
   price range, available time, date, start time, children-in-party, and whether
   to start with activities or food & drink.
4. **activities** — swipe through sample activity ideas filtered by the chosen
   interests (and children filter).
5. **meal-prompt** — offered only on the activities-first route, asking whether to
   add food.
6. **restaurants** — live nearby-restaurant search with swipe selection, or an
   honest loading / unavailable / no-results state.
7. **timeline** — the assembled plan: ordered stops with times, editable
   durations, a day narrative, a time-budget check, "Open in Maps" links on live
   items, QR share, and "Start over".

Order between activities and restaurants is determined by the `startWith`
setting; the timeline stage is the terminal screen of the main journey.

## 3. Capability status matrix

| Capability | Status | Evidence |
|---|---|---|
| Authentication (Google, email/password, guest) | **Implemented — External-service dependent** | `src/AuthContext.jsx` wires Firebase `signInWithPopup`, `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signInAnonymously`, `signOut`; `src/Login.jsx` exposes all three paths with per-action pending/error handling. Requires a working Firebase project. |
| Guest access | **Implemented** | Anonymous Firebase sign-in (`signInAsGuest` → `signInAnonymously`); guest users have no email and are handled explicitly (`AuthContext` removes the stored email string). |
| Onboarding / preferences | **Implemented** | `InterestsStage` collects interests, cuisines, price, available time, date, start time, children, start order, and user-owned walking pace/maximum. Travel preferences persist locally under a separate versioned key; DayGuide does not infer pace from age or weight. |
| Manual start place / future planning location | **Place resolution and input integration implemented — not active** | `placeResolutionApi` and `places-resolve` resolve an explicitly submitted station, venue, hotel, or address into validated provider-labelled places; `PlanningInputWithPlaceResolution` supplies deliberately added matches to Packet 149. The component is not mounted in the current journey and no provider or Netlify setting has changed. |
| End place / arrival deadline | **Input workflow implemented — not active** | Packet 149 can collect a resolved destination with an optional deadline and buffer, or a soft directional destination. It is not connected to the current timeline or persistence. |
| Hard anchors | **Input workflow implemented — not active** | `HardAnchorEditor` creates planner-locked fixed commitments and `PlanningInputStage` provides deliberate Edit/Remove actions. Packet 148 preserves their fixed place/time. No current-journey or persistence integration exists. |
| Activities | **Implemented — sample/demo-backed** | Sourced from `src/mockActivityData.json`, filtered in `src/engines/filterEngine.js`; every activity is flagged `isSample` in `DayGuide.jsx`. No live activity search exists. |
| Restaurants | **Implemented — External-service dependent (live-only)** | `src/api/placesApi.js` calls the Places nearby function; results ranked by `src/utils/recommendationScore.js`. Mock restaurant data is *not* in the live path — enforced by `src/engines/restaurantMockVisibility.test.js`. |
| Restaurant unavailable / no-results honesty | **Implemented** | `src/engines/restaurantEngine.js` + `RESTAURANT_UNAVAILABLE_REASONS` in `src/config/dayGuideOptions.js` distinguish no-key, quota, network, denied-location, no-location, bad-request, exhausted-unseen, and genuine no-results states. |
| Itinerary generation | **Implemented** | `src/engines/timelineEngine.js` `buildTimelineEntries` orders items by `startWith` and assigns times with a 0.25h inter-stop gap. |
| Fixed-plan route feasibility | **Controlled live calibration complete — provider disabled and not active** | Packets 151–155 provide the adapter, security boundary, quality gate, and 24-scenario London evidence. All 24 Google and TfL checks returned routes; raw-duration criteria failed for both walking and transit. Packet 156 interprets provider duration as an estimate rather than a guaranteed commitment. The review stage remains unmounted and no routing credential/mode is active. |
| Geographic ordering / backtracking control | **Foundation only — not active** | Live restaurant coordinates are now retained in `PlaceCard`, and the hard-anchor engine accepts injected leg evidence. The current journey still groups activities and restaurants by `startWith`; no spatial sort, route corridor, or backtracking scoring is active. |
| Route-aware fill time | **Foundation only — not active** | `assessFlexibleStopFit` can deterministically require both travel legs and the visit duration inside a fixed planning window. Current timeline popups remain composition/current-origin based and do not call it. |
| Timeline | **Implemented** | `TimelineStage`/`TimelineCard`: editable per-item durations, day narrative (`src/utils/dayNarrative.js`), time-budget status, date display. |
| Transport | **Implemented — universal estimate policy, approximate evidence** | Packet 156 adds user-controlled walking pace and maximum-walk preferences, a 45-minute default, aggregate experience-learning foundation, explicit estimate/accountability copy, and a live-check-required taxi boundary. Current `distanceKm` remains venue-to-user proximity, not true leg-to-leg evidence, and is labelled accordingly. |
| Maps / deep links | **Implemented** | Place links remain available for live restaurants. Packet 156 also builds key-free Google Maps directions handoffs between adjacent itinerary stops for walking, driving, and transit; these are live-checking exits, not data returned to DayGuide. |
| Plan persistence & resume | **Implemented** | `src/utils/planStorage.js` writes one versioned `localStorage` key (`dayguide_saved_plan_v1`); persists timeline + render settings only (no queues, selections, or geolocation). Resume restores a read-only plan view. A plan dated before the local calendar day is discarded on load and excluded from Resume (`isPlanDateExpired`/`loadPlan`, `planStorage.js`). |
| Sharing | **Implemented (QR text)** | `TimelineShareQRModal.jsx` encodes a plain-text itinerary summary (`buildTimelineShareText`) as a QR code. No server-side share link or export. |
| Localisation | **Implemented** | Five locales (`en`, `es`, `fr`, `zh`, `vi`) in `src/i18n.js`; language selector in header and login; choice persisted to `localStorage` and, for signed-up users, to Firestore. Key parity checked by `src/locales/localeConsistency.test.js`. |
| Deployment / API handling | **Implemented — traceable production, manually locked** | Packets 142 and 143 link the existing Netlify site to GitHub `master`, publish exact commit `5ef141b`, deploy both Places functions, verify nearby and photo requests through the replacement server credential, remove the legacy client variable, and retain manual publication locking. |
| Multi-day planning | **Not implemented** | No multi-day state, tabs, or routes exist in tracked `DayGuide.jsx`; planning is single-day, single-date. |
| Favourites / booking | **Not implemented** | No favourites store or booking action is present in tracked source. |

## 4. Data and recommendation honesty

The application takes deliberate care not to present demonstration data as real
local recommendations. Verified distinctions:

- **Sample activity ideas vs live/local results.** Activities come from
  `mockActivityData.json` and are flagged `isSample`. The timeline row
  (`TimelineItemRow.jsx`) withholds the fabricated "km" proximity claim for
  sample items and shows a "sample activity" note instead. There is **no live
  activity search**; activity ideas are demonstration content only.
- **Live restaurant results vs unavailable / no-results states.** Restaurants are
  live-only via Google Places. When live results cannot be produced, the queue
  stays empty and the UI shows an honest unavailable or no-results card
  (`RestaurantsStage.jsx`, `restaurantEngine.js`). Mock venues are never
  substituted — a regression guard (`restaurantMockVisibility.test.js`) fails the
  build if the live path imports mock restaurant data. "No more unseen options"
  is distinguished from "no matches found nearby".
- **Approximate transport vs live routing.** Transport times are heuristic
  estimates from venue-to-user distance and fixed urban speed profiles, not live
  routing; costs are currency-free fare *types* (`transportEngine.js`,
  `TRANSPORT_OPTIONS`). No live directions or fares are fetched.
- **Persisted vs transient information.** Only the finished timeline plus its
  render settings are persisted (`planStorage.js`). Queues, individual
  selections, geolocation, and transient UI state are intentionally not saved. A
  resumed plan is a view of saved data and does not rebuild selections.

## 5. Architecture boundaries

- **`src/DayGuide.jsx` — orchestration.** Owns stage/state, wires stages to
  engines and the Places API, manages popups, persistence calls, and logout. It
  delegates presentation to stage components and logic to engines/utilities.
- **Extracted stages** (`src/components/*Stage.jsx`): `WelcomeStage`,
  `LocationStage`, `InterestsStage`, `ActivitiesStage`, `MealPromptStage`,
  `RestaurantsStage`, `TimelineStage`, each rendered by `DayGuide.renderStage`.
- **Engines** (`src/engines/`): `filterEngine`, `selectionEngine`,
  `itineraryRouteEngine`, `timelineEngine`, `restaurantEngine`,
  `transportEngine`, `popupEngine`, `hardAnchorEngine`,
  `geographicalPlanningEngine`, and `recommendation*` scoring. Pure logic,
  independently tested. The hard-anchor and geographical-planning engines are
  internal foundations and are not called by the current journey.
- **Planning models** (`src/models/geographicalPlan.js`): provider-independent
  route-capable places, start/end points, planner-locked hard anchors, flexible
  stops, and route legs. Schema version 2 is defined but not persisted.
- **Planning-input boundary** (`src/utils/planningInputWorkflow.js`,
  `ResolvedPlaceSelect`, `HardAnchorEditor`, `PlanningInputStage`,
  `PlanningInputWithPlaceResolution`): immutable draft/finalization logic,
  resolved-place-only controls, and an explicit-search resolution wrapper.
  Packet 150 connects verified results to Packet 149 internally. Packet 151
  adds provider-neutral route assessment, while the combined workflow remains
  disconnected from `DayGuide.jsx` pending a live route provider, localization,
  persistence, and activation.
- **Route-evidence boundary** (`src/routing/routeEvidenceBoundary.js`,
  `geographicalPlanningEngine`, `GeographicalPlanningReview`): creates dated
  adjacent-leg requests, validates trusted evidence, integrates Packet 149 with
  Packet 148, and gates continuation. Packet 152 adds
  `routingProviderPolicy`, `routeEvidenceApi`, and the disabled
  `routes-evidence` server adapter. Packet 153 adds verified Firebase caller
  enforcement and `routeEvidenceQualityGate`. Packet 154 adds the non-network
  `londonRouteCalibration` scenario, evidence-record, acceptance, and quota
  boundary. Packet 155 adds an approved-plan record and a separate operator
  runner that is not imported by the application. The whole workflow remains
  disconnected from `DayGuide.jsx`.
- **Utilities** (`src/utils/`): `planStorage`, `planLifecycle`,
  `restaurantSearchRequest`, `dayNarrative`, `recommendationReason`,
  `recommendationScore`.
- **API / Netlify boundary.** All Google Places access goes through
  `src/api/placesApi.js` → `netlify/functions/places-nearby.js` and
  `places-photo.js`, plus `src/api/placeResolutionApi.js` →
  `netlify/functions/places-resolve.js`. The functions attach the private key
  server-side. Packet 152 separately adds an unmounted routing client and
  disabled server function. Its future `GOOGLE_ROUTES_API_KEY` cannot fall back
  to the Places or browser variable, and a credential alone cannot activate it.
  Packet 153 requires a cryptographically verified Firebase ID token before
  request validation, routing-key access, or a provider call. No
  `REACT_APP_*` key is read on the client.
- **Persistence boundary.** `localStorage` for the saved plan (`planStorage.js`)
  and language preference; Firestore (`AuthContext.jsx`) stores only the user's
  language preference. Firebase Auth manages the session.
- **Test structure.** Co-located `*.test.js(x)` unit tests per engine, utility,
  adapter, and component, plus integration coverage in `src/DayGuide.test.js` and
  a cross-locale consistency test.

*(This section documents boundaries as they exist; it does not propose a
refactor.)*

## 6. Launch-gap register

Only gaps supported by repository evidence are listed.

### Launch blockers

No Packet 142 deployment blocker remains. The exact Production server secret is
consumed by the published functions; one bounded nearby request returned `OK`
with 20 results and its dependent photo request reached Google's image host.
Packet 144 verified anonymous Firebase guest authentication and the main
denied-location production journey. Packet 145 separately verified the
production QR Share dialog by direct physical pointer activation. Packet 146
verified the location-enabled live restaurant, photograph, mixed timeline,
Maps, persistence, QR, reset, and logout path. Google and email/password
sign-in remain outside these checks.

### Launch limitations that can be disclosed
- **Activities are sample/demo data, not real local recommendations.** No live
  activity source exists (`mockActivityData.json`, `isSample` flag).
- **Transport information is approximate**, derived from venue distance and fixed
  speed profiles, with fare *types* rather than real prices (`transportEngine.js`).
- **Planning is single-day only.** No multi-day capability in tracked code.
- **Sharing is a QR-encoded text summary**, not a hosted/shareable plan link.

### Operational / manual requirements
- **The selected routing provider is intentionally not configured.** There is
  no `GOOGLE_ROUTES_API_KEY` or approved routing-provider mode in the recorded
  environment. Authenticated proxy caller verification is implemented in
  tracked source, and Packet 155 records Product Owner acceptance of Packet
  154's walking/transit thresholds and 150-request quota envelope. Activation
  still requires the temporary controlled evidence exercise, passing fresh
  evidence for each enabled mode, an actually configured hard Google daily
  quota, billing monitoring, an exercised stop procedure,
  attribution/privacy/warning work, and deploy-log proof of the Netlify rate
  rule. The Places key must remain Places-only.
- **Place resolution has a monitored Legacy Places dependency.**
  `places-resolve` currently uses Find Place Legacy. Google's current lifecycle
  material supports existing projects and gives no shutdown date; Packet 153
  records explicit migration triggers and requires a separate migration before
  wider-than-Private-Alpha release rather than treating this as a current
  provider failure.
- **`netlify.toml` tracks build, publish and functions configuration.** The
  root `netlify.toml` sets `command = "npm run build"`, `publish = "build"`,
  and `functions = "netlify/functions"`, matching `package.json`'s build
  script, Create React App's default output directory, and the tracked
  function files (`netlify/functions/places-nearby.js`,
  `places-photo.js`). `GOOGLE_PLACES_API_KEY` is configured manually as a
  Production Netlify secret and is not tracked. Maintaining Google Places and
  Firebase remains an operational requirement outside version control.
- **Current production follows a traceable, manually locked repository
  deployment.** The existing Netlify project is linked to GitHub
  `neilfranklin66-blip/dayguide-app`, production branch `master`, and exact
  commit `5ef141b`. Auto publishing remains locked; a future release requires a
  deliberate publish action.
- **The Netlify plan does not permit Functions-only secret scope without an
  upgrade.** The Production secret remains scoped to Builds, Functions, and
  Runtime. It is marked secret, limited by Google to Places API, not read by
  browser code, and absent from the verified public bundle.
- **Firebase project configuration is committed** in `src/firebase.js` (web app
  config, which Firebase treats as public). A live deployment depends on that
  Firebase project remaining provisioned.

### Areas requiring a separate audit
- **Firestore / Firebase security rules are not present in the repository**, so
  data-access security cannot be verified from tracked files and needs its own
  review.
- **Key management and rotation** for external services (Google Places, Firebase)
  are operational concerns outside this repository's tracked evidence.
- **Legal, commercial, privacy and accessibility readiness** are not verifiable
  from source and are out of scope for this register.

## 7. Verification commands

Run from the repository root:

```powershell
$env:CI = 'true'; npm test -- --watchAll=false
npm run build
git diff --check
git status -sb
git --no-pager diff -- README.md docs/CURRENT_STATE.md
```

**Packet 131 snapshot (2026-07-11):** `npm test` reported **37 test suites, 914
tests passing**; `npm run build` compiled successfully (production bundle
≈229 kB gzipped main chunk). These figures are a dated snapshot for this
verification point, not permanent documentation.

**Packet 143 snapshot (2026-07-26):** an isolated tracked-source copy with
`.npmrc` compatibility mode completed clean `npm ci`, **37 test suites and 927
tests**, and a Netlify-style CI production build under Node `v24.15.0` and npm
`11.12.1`. The main JavaScript bundle was 229.26 kB gzipped.

**Packet 145 snapshot (2026-07-26):** the QR Share regression addition passed
the focused DayGuide suite (47 tests), the full suite (**37 test suites and 928
tests**), and the production build. The rebuilt `main.3e20a375.js` was 229.26
kB gzipped and its SHA-256 matched the public production bundle exactly.

**Packet 148 snapshot (2026-07-26):** the geographical planning foundation
passed its focused model, engine, adapter, and Places-client validation
(4 suites, 74 tests), the full suite (**39 test suites and 961 tests**), and the
production build. The main JavaScript bundle was 229.38 kB gzipped. No
deployment followed.

**Packet 149 snapshot (2026-07-26):** the provider-neutral planning-input
workflow passed its focused workflow/component validation (4 suites, 27 tests)
without React or invalid-HTML warnings, the full suite (**43 test suites and
988 tests**), and the production build. The main bundle remained
`main.a1cd6b13.js` at 229.38 kB gzipped because the workflow is not mounted in
the current application. No deployment followed.

**Packet 150 snapshot (2026-07-26):** the explicit-search place-resolution
function, client boundary, attribution, failure states, and Packet 149
integration passed focused validation (3 suites, 35 tests), the full suite
(**45 test suites and 1,015 tests**), and the production build. The main bundle
remained `main.a1cd6b13.js` at 229.38 kB gzipped because the combined workflow
is not mounted in the current application. No provider setting, credential,
Netlify setting, push, or deployment followed.

**Packet 151 snapshot (2026-07-26):** the dated route-request contract,
trustworthy-evidence validation, Packet 149-to-148 integration, exact
shortfalls, anchor preservation, and honest review states passed focused
validation (3 suites, 25 tests), the full suite (**48 test suites and 1,040
tests**), and the production build. The main bundle remained
`main.a1cd6b13.js` at 229.38 kB gzipped because Packet 151 is not mounted in the
current application. No route provider, API, credential, Netlify setting,
push, or deployment followed.

**Packet 152 snapshot (2026-07-26):** the Google Compute Routes Essentials
decision, separate disabled-by-default credential boundary, six-leg cost
envelope, no-retry/no-matrix/no-alternatives rules, minimal field mask,
daylight-saving refusal, same-origin client, sanitized server evidence, and
per-IP/domain rate rule passed focused validation (4 suites, 37 tests), the full
suite (**51 test suites and 1,066 tests**), and the production build. The main
bundle remained `main.a1cd6b13.js` at 229.38 kB gzipped because the adapter is
not mounted. No routing API, credential, environment variable, Netlify setting,
push, deployment, publication, or production behaviour changed.

**Packet 153 snapshot (2026-07-27):** Firebase ID-token acquisition and
cryptographic server verification, fail-closed certificate handling,
authentication before routing-key/provider access, and the
Product-Owner-controlled route-evidence quality gate passed focused validation
(5 suites, 57 tests), the full suite (**52 test suites and 1,086 tests**), and
the production build. The main bundle remained `main.a1cd6b13.js` at 229.38 kB
gzipped because the routing and quality boundaries are not mounted. No routing
API, credential, quota, billing alert, environment variable, Netlify setting,
push, deployment, publication, or production behaviour changed.

**Packet 154 snapshot (2026-07-27):** the 24-scenario London walking/transit
catalogue, five bounded batches, 24-event one-off ceiling, safe evidence
records, visibly unapproved quality thresholds, and exact Private Alpha quota
calculator passed focused validation (3 suites, 26 tests), the full suite
(**53 test suites and 1,099 tests**), and the production build. The main bundle
remained `main.a1cd6b13.js` at 229.38 kB gzipped because the calibration
framework is not mounted. No provider call, API, credential, quota, billing
alert, environment variable, Netlify setting, push, deployment, publication,
or production behaviour changed.

**Packet 155 preparation snapshot (2026-07-27):** the explicit criteria/quota
approval record, fixed calibration dates, production-rejecting preview
selection, three-batch invocation ceiling, temporary Firebase authentication,
no-retry fail-closed execution, sanitised output, and stable failure states
passed focused validation (4 suites, 51 tests), the full suite (**54 test suites
and 1,111 tests**), and the production build. Deliberate dry runs stopped before
network access when authority was absent and rejected the canonical production
origin even when authority was present. The main bundle remained
`main.a1cd6b13.js` at 229.38 kB gzipped because the runner is outside the
application. No provider call, API, credential, quota, billing alert,
environment variable, Netlify setting, draft deploy, push, publication, or
production behaviour changed at this preparation point.

**Packet 156 snapshot (2026-07-27):** the universal estimate policy,
user-controlled walking pace and maximum, 45-minute default, privacy-conscious
aggregate pace-learning foundation, visible user-accountability guidance,
fixed-time warning boundary, removal of the fabricated fixed-speed taxi time,
and key-free Google Maps directions handoffs passed the full suite (**59 test
suites and 1,134 tests**) and production build. The main bundle was
`main.badc4dab.js` at 231.83 kB gzipped. The current timeline still labels its
proximity-based figures honestly rather than claiming true adjacent-leg
routing. No API key, provider mode, Netlify variable, push, preview,
publication, or production deployment followed.

**Packet 157 integration-readiness snapshot (2026-07-28):** all 85 tracked
paths and 14 commits in the cumulative Packet 146–156 chain were reconciled
against Packet 145 `master`. No Google API-key literal, environment file,
provider activation, Netlify configuration change, or unrelated tracked path
was found. Two trailing blank lines were removed without behaviour change. The
complete suite again passed (**59 test suites and 1,134 tests**) and the
production build again produced `main.badc4dab.js` at 231.83 kB gzipped. The
chain is ready for separately authorised local fast-forward integration only;
no merge, push, provider change, Netlify action, publication, or deployment was
performed or authorised.

**Packet 158 GitHub-integration snapshot (2026-07-28):** exact reviewed commit
`f3de53628c20995d37ea87f9693565eefd93ed3d` was fast-forwarded to GitHub
`master` and independently verified through GitHub's API and remote ref.
Netlify created no observable build or candidate, consistent with the tip
commit's `[skip netlify]` marker. Public deploy history remained unchanged:
production is still published at `master@5ef141b`, deploy
`6a6602bd6c7609eabb08d744`. No provider request, credential, environment
variable, Netlify setting, publication, or production deployment changed.

## 8. Maintenance rule

Update this document **only** when a completed packet materially changes a
capability, limitation, architecture boundary, or launch requirement. Do not use
it as a backlog, a roadmap, or a place to record future ideas; keep it a faithful
record of the application as it exists in tracked source.
