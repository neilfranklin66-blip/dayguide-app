# DayGuide — Production Private Alpha Verification

## 1. Record identity

- **Packet:** 144 — Production Private Alpha Verification
- **Verification date:** 26 July 2026
- **Implementation agent:** Codex
- **Product Owner:** Neil Franklin
- **Evidence branch:** `packet-144-production-private-alpha-verification`
- **Baseline commit:** `dcc40894dc1bc8824a40fa6bd5d06701602eacc0`
- **Canonical URL:** `https://ubiquitous-melomakarona-874d9c.netlify.app/`
- **Published application commit:** `5ef141bf903521dbb9b7c53ff5af682a920ef5be`
- **Published deploy ID:** `6a6602bd6c7609eabb08d744`
- **Publication state:** published and locked

Packet 142 evidence commit `dcc40894dc1bc8824a40fa6bd5d06701602eacc0`
was fast-forwarded to `master` and pushed before this verification. Its
`[skip netlify]` commit did not create a new Netlify build: the published deploy
and application commit remained unchanged and publication remained locked.

No secret value, browser credential, precise location, or recovery artifact was
read or recorded.

## 2. Verification method and boundaries

Codex ran one bounded English-language journey against the canonical production
site in a real browser. It used:

- anonymous Firebase guest authentication;
- the browser's existing denied-location state;
- Museums, Italian, and Moderate preferences;
- a four-hour plan for 26 July 2026;
- no children;
- the activities-first route;
- one accepted sample activity; and
- the restaurant path, timeline, persistence, reset, and logout controls.

The check deliberately did not:

- grant precise-location permission;
- test Google or email/password sign-in;
- claim representative mobile-device, accessibility, or cross-browser coverage;
- repeat the Packet 142 direct Places nearby/photo checks;
- inspect browser storage, cookies, credentials, or secret values; or
- change or unlock the published Netlify deployment.

Because location was denied, this journey verified the application's honest
no-location restaurant handling rather than a live restaurant card in the user
interface. Packet 142 separately verified the deployed nearby and photo
functions with the replacement server credential.

## 3. Journey evidence

| Check | Result | Evidence |
|---|---|---|
| Production entry | **Pass** | The DayGuide sign-in screen rendered at the canonical HTTPS URL. |
| Guest authentication | **Pass** | `Continue as guest` reached the authenticated welcome screen and exposed `Logout`. |
| Location-denied handling | **Pass** | The welcome screen clearly stated that location access was denied and offered `Refresh Location`; planning remained available. |
| Preference capture | **Pass** | The interests screen accepted the bounded activity, cuisine, price, time, date, and party choices and enabled `Next`. |
| Activity selection | **Pass** | The activities screen presented six museum ideas, clearly labelled each as a sample idea rather than a live nearby result, and accepted Science Museum. |
| Restaurant-unavailable handling | **Pass** | Choosing to add a restaurant produced `Live restaurant results unavailable`, explained that location permission was absent, and provided both retry and continue controls. |
| Continue without restaurant | **Pass** | `Skip restaurant and continue` reached the completed timeline. |
| Timeline | **Pass** | The one-stop plan showed the date, 2 hours planned within 4 hours available, the start time, Science Museum, rating, duration control, address, and sample-data disclosure. |
| Share action | **Observed issue** | Activating `Share` did not present the expected visible QR dialog during the journey. The timeline remained usable. |
| Persistence and resume | **Pass** | Reloading returned to the authenticated welcome screen with `Resume your plan` and `1 planned stops`; Resume restored the same timeline. |
| Start over | **Pass** | `Start Over` returned to the welcome screen and removed the Resume option. |
| Logout | **Pass** | Logout returned to the unauthenticated sign-in screen. |

No retry was used to turn a failed product check into a pass. The initial
post-navigation empty render was allowed to finish loading before the saved-plan
screen was assessed.

## 4. Findings and classification

### P144-001 — Share action did not expose the QR dialog

- **Type:** Product defect candidate
- **Severity recommendation:** Medium
- **Launch blocking recommendation:** No for a bounded guest Private Alpha
- **Observed behaviour:** On the completed production timeline, activating
  `Share` left the visible screen unchanged and no QR dialog appeared.
- **Expected behaviour:** Tracked source wires the action to
  `setShowQR(true)` and `TimelineShareQRModal` should render a close control,
  title, QR code, and explanatory hint.
- **Impact:** A participant may be unable to use the optional QR text-sharing
  feature. Core planning, persistence, reset, and logout remained usable.
- **Packet 144 decision:** Record only. Do not fix within this verification
  packet.
- **Recommended next action:** Reproduce under a focused authorised packet,
  identify the production-specific cause, implement the smallest verified fix,
  and rerun only the share/timeline checks plus proportionate regression tests.

### P144-002 — Authentication assurance is partial

- **Type:** Verification boundary
- **Classification:** Residual operational assurance gap
- **Launch blocking recommendation:** No for an invitation-only guest path
- **Evidence:** Anonymous Firebase authentication and logout passed in
  production. Google and email/password paths were not exercised.
- **Recommended next action:** Define which sign-in methods Private Alpha
  participants will actually use, then verify only those required paths.

### P144-003 — Live restaurant UI assurance is partial

- **Type:** Verification boundary
- **Classification:** Residual operational assurance gap
- **Launch blocking recommendation:** No for the denied-location fallback path;
  unresolved for a Private Alpha promise of live nearby restaurants
- **Evidence:** No-location handling passed. A live restaurant card was not
  exercised because precise location was not granted. Packet 142 separately
  proved the production nearby and photo functions.
- **Recommended next action:** With explicit permission from a tester, run one
  location-enabled UI journey when live nearby restaurants become a required
  Private Alpha acceptance condition.

## 5. Credential-hygiene action

Packet 144 authorises removal of one unused wrong-project credential:

- **Google project ID:** `dayguide1`
- **Project display name:** `My Project 46438`
- **Key name:** `Maps Platform API Key`
- **Creation date:** 26 July 2026
- **Observed restriction breadth:** 35 APIs

This is not the production project and is not the production
`DayGuide Netlify Places Key`.

The authenticated Product Owner confirmed the exact project and credential,
deleted that key, and then observed `No API keys to display` in project
`dayguide1`. The production credential was not shown in that project and was
not changed. No Google account details or key value were entered into Codex's
browser.

## 6. Private Alpha decision

The verified guest, denied-location path is suitable for a bounded,
invitation-only Private Alpha provided participants are told that:

- activity suggestions are sample ideas;
- live nearby restaurants require location permission;
- the QR sharing action has an unresolved non-blocking defect; and
- only guest authentication has been operationally verified by this packet.

This is not a claim of general launch readiness, mobile-device coverage,
accessibility compliance, every authentication provider, or a location-enabled
restaurant journey.

The separate wrong-project credential hygiene item is closed: the unused
35-API key in `dayguide1` has been deleted.

## 7. Repository and deployment handling

Packet 144 changes evidence documents only. It does not alter application code,
Netlify configuration, Firebase configuration, Google Places integration, or
the locked production deploy. The evidence commit must include `[skip netlify]`
and remain local for later review and integration unless a separate instruction
authorises a push.
