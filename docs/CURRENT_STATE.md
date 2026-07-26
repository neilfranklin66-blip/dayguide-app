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
| Onboarding / preferences | **Implemented** | `InterestsStage` collects interests, cuisines, price, available time, date, start time, children, and start order; held in `DayGuide.jsx` component state. |
| Manual start place / future planning location | **Not implemented** | Location is browser GPS only. `LocationStage` is a loading interstitial and no address, station, postcode, map pin, or other planning place can be entered. Restaurant search always uses the current browser position. |
| End place / arrival deadline | **Not implemented** | No end-location or deadline state, control, timeline field, or persisted value exists. |
| Hard anchors | **Foundation implemented — not user-facing** | `src/models/geographicalPlan.js` defines planner-locked hard anchors and `src/engines/hardAnchorEngine.js` preserves their fixed place/time while reporting infeasible or indeterminate windows. No anchor UI, current-plan integration, or persistence exists. |
| Activities | **Implemented — sample/demo-backed** | Sourced from `src/mockActivityData.json`, filtered in `src/engines/filterEngine.js`; every activity is flagged `isSample` in `DayGuide.jsx`. No live activity search exists. |
| Restaurants | **Implemented — External-service dependent (live-only)** | `src/api/placesApi.js` calls the Places nearby function; results ranked by `src/utils/recommendationScore.js`. Mock restaurant data is *not* in the live path — enforced by `src/engines/restaurantMockVisibility.test.js`. |
| Restaurant unavailable / no-results honesty | **Implemented** | `src/engines/restaurantEngine.js` + `RESTAURANT_UNAVAILABLE_REASONS` in `src/config/dayGuideOptions.js` distinguish no-key, quota, network, denied-location, no-location, bad-request, exhausted-unseen, and genuine no-results states. |
| Itinerary generation | **Implemented** | `src/engines/timelineEngine.js` `buildTimelineEntries` orders items by `startWith` and assigns times with a 0.25h inter-stop gap. |
| Geographic ordering / backtracking control | **Foundation only — not active** | Live restaurant coordinates are now retained in `PlaceCard`, and the hard-anchor engine accepts injected leg evidence. The current journey still groups activities and restaurants by `startWith`; no spatial sort, route corridor, or backtracking scoring is active. |
| Route-aware fill time | **Foundation only — not active** | `assessFlexibleStopFit` can deterministically require both travel legs and the visit duration inside a fixed planning window. Current timeline popups remain composition/current-origin based and do not call it. |
| Timeline | **Implemented** | `TimelineStage`/`TimelineCard`: editable per-item durations, day narrative (`src/utils/dayNarrative.js`), time-budget status, date display. |
| Transport | **Implemented — approximate** | `src/engines/transportEngine.js` estimates minutes from venue distance via urban speed profiles; `distanceKm` is venue-to-user distance, not true leg-to-leg. Costs are fare *types*, not currency amounts (`TRANSPORT_OPTIONS`). |
| Maps / deep links | **Implemented** | Google Maps search URLs built in `src/adapters/placeCardAdapter.js`; live restaurants include `query_place_id`. Carried into the timeline row's "Open in Maps" link (`TimelineItemRow.jsx`). Sample activities have no maps link. |
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
  `transportEngine`, `popupEngine`, `hardAnchorEngine`, and `recommendation*`
  scoring. Pure logic, independently tested. `hardAnchorEngine` is an internal
  Packet 148 foundation and is not called by the current journey.
- **Planning models** (`src/models/geographicalPlan.js`): provider-independent
  route-capable places, start/end points, planner-locked hard anchors, flexible
  stops, and route legs. Schema version 2 is defined but not persisted.
- **Utilities** (`src/utils/`): `planStorage`, `planLifecycle`,
  `restaurantSearchRequest`, `dayNarrative`, `recommendationReason`,
  `recommendationScore`.
- **API / Netlify boundary.** All Google Places access goes through
  `src/api/placesApi.js` → `netlify/functions/places-nearby.js` and
  `places-photo.js`, which hold the private key server-side. No `REACT_APP_*`
  key is read on the client.
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

## 8. Maintenance rule

Update this document **only** when a completed packet materially changes a
capability, limitation, architecture boundary, or launch requirement. Do not use
it as a backlog, a roadmap, or a place to record future ideas; keep it a faithful
record of the application as it exists in tracked source.
