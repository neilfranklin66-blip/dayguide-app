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
| Activities | **Implemented — sample/demo-backed** | Sourced from `src/mockActivityData.json`, filtered in `src/engines/filterEngine.js`; every activity is flagged `isSample` in `DayGuide.jsx`. No live activity search exists. |
| Restaurants | **Implemented — External-service dependent (live-only)** | `src/api/placesApi.js` calls the Places nearby function; results ranked by `src/utils/recommendationScore.js`. Mock restaurant data is *not* in the live path — enforced by `src/engines/restaurantMockVisibility.test.js`. |
| Restaurant unavailable / no-results honesty | **Implemented** | `src/engines/restaurantEngine.js` + `RESTAURANT_UNAVAILABLE_REASONS` in `src/config/dayGuideOptions.js` distinguish no-key, quota, network, denied-location, no-location, bad-request, exhausted-unseen, and genuine no-results states. |
| Itinerary generation | **Implemented** | `src/engines/timelineEngine.js` `buildTimelineEntries` orders items by `startWith` and assigns times with a 0.25h inter-stop gap. |
| Timeline | **Implemented** | `TimelineStage`/`TimelineCard`: editable per-item durations, day narrative (`src/utils/dayNarrative.js`), time-budget status, date display. |
| Transport | **Implemented — approximate** | `src/engines/transportEngine.js` estimates minutes from venue distance via urban speed profiles; `distanceKm` is venue-to-user distance, not true leg-to-leg. Costs are fare *types*, not currency amounts (`TRANSPORT_OPTIONS`). |
| Maps / deep links | **Implemented** | Google Maps search URLs built in `src/adapters/placeCardAdapter.js`; live restaurants include `query_place_id`. Carried into the timeline row's "Open in Maps" link (`TimelineItemRow.jsx`). Sample activities have no maps link. |
| Plan persistence & resume | **Implemented** | `src/utils/planStorage.js` writes one versioned `localStorage` key (`dayguide_saved_plan_v1`); persists timeline + render settings only (no queues, selections, or geolocation). Resume restores a read-only plan view. A plan dated before the local calendar day is discarded on load and excluded from Resume (`isPlanDateExpired`/`loadPlan`, `planStorage.js`). |
| Sharing | **Implemented (QR text)** | `TimelineShareQRModal.jsx` encodes a plain-text itinerary summary (`buildTimelineShareText`) as a QR code. No server-side share link or export. |
| Localisation | **Implemented** | Five locales (`en`, `es`, `fr`, `zh`, `vi`) in `src/i18n.js`; language selector in header and login; choice persisted to `localStorage` and, for signed-up users, to Firestore. Key parity checked by `src/locales/localeConsistency.test.js`. |
| Deployment / API handling | **Manual launch requirement** | `GOOGLE_PLACES_API_KEY` is server-side only, read by `netlify/functions/*`; documented in `.env.local.example`. Live restaurants require this key set in the Netlify environment and the functions deployed. |
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
  `transportEngine`, `popupEngine`, `recommendation*` scoring. Pure logic,
  independently tested.
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
- **Live restaurants are unavailable until the Places key is configured and the
  Netlify functions are deployed.** Without `GOOGLE_PLACES_API_KEY` in the server
  environment, `places-nearby.js` returns a `REQUEST_DENIED`/`NO_API_KEY` state
  and the app shows the "live data unavailable" card — the restaurant stage has
  no working recommendations. (`netlify/functions/places-nearby.js`,
  `restaurantEngine.js`.)

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
  `places-photo.js`). `GOOGLE_PLACES_API_KEY` still requires manual
  configuration in the Netlify site's environment variables — it is not, and
  must not be, set in tracked configuration. Deploying the functions and
  maintaining the external services (Google Places, Firebase) remain
  operational requirements outside version control.
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

## 8. Maintenance rule

Update this document **only** when a completed packet materially changes a
capability, limitation, architecture boundary, or launch requirement. Do not use
it as a backlog, a roadmap, or a place to record future ideas; keep it a faithful
record of the application as it exists in tracked source.
