# DayGuide — Location-Enabled Private Alpha Gate

## 1. Record identity

- **Packet:** 146 — Location-Enabled Private Alpha Gate
- **Verification date:** 26 July 2026
- **Implementation agent:** Codex
- **Authenticated browser operator:** Neil Franklin, Product Owner
- **Evidence branch:** `packet-146-location-enabled-private-alpha-gate`
- **Baseline commit:** `17fbceb091c51b234bc30afbb881f8b8a0858254`
- **Canonical URL:** `https://ubiquitous-melomakarona-874d9c.netlify.app/`
- **Published application commit:** `5ef141bf903521dbb9b7c53ff5af682a920ef5be`
- **Published deploy ID:** `6a6602bd6c7609eabb08d744`
- **Publication state:** published and locked

Packet 145 was reviewed, fast-forwarded to `master`, and pushed before this
gate. Its `[skip netlify]` commit created no Netlify build. A read-only Netlify
check confirmed that the latest deploy remained
`6a6602bd6c7609eabb08d744`, locked, and attributable to application commit
`5ef141bf903521dbb9b7c53ff5af682a920ef5be`.

No secret, API key, precise coordinate, browser credential, or recovery
artifact was supplied to Codex or recorded in repository evidence.

## 2. Objective and controls

The gate was designed to verify the remaining live, location-enabled guest
journey without changing production:

1. allow location in the Product Owner's normal browser;
2. enter through anonymous guest authentication;
3. obtain a real Google Places restaurant card and photograph;
4. select the restaurant into a mixed restaurant/activity timeline;
5. verify the live Maps handoff;
6. verify saved-plan resume and QR sharing; and
7. clear the test plan and log out.

The intended budget was one filtered Places search. That search returned no
Italian restaurants at the selected Moderate price near the test location. The
Product Owner then explicitly authorised exactly one additional unfiltered
search so the live-card acceptance checks could finish. No retry was used.

## 3. Privacy boundary

The Product Owner changed location permission in their own normal browser and
confirmed only that DayGuide displayed its location indicator. They did not
paste or disclose the coordinates to Codex.

To perform the feature, the browser necessarily supplied location to DayGuide,
which sent the bounded nearby-search parameters through the deployed Netlify
function to Google Places. This packet records only behaviour and outcomes, not
the location or returned restaurant identity.

## 4. Journey evidence

| Check | Result | Evidence |
|---|---|---|
| Guest authentication | **Pass** | The Product Owner reached the authenticated DayGuide welcome screen. |
| Location permission | **Pass** | After browser permission was allowed and the page reloaded, DayGuide displayed its location indicator. Coordinates were not disclosed to Codex. |
| Preferences and route | **Pass** | Museums, Italian, Moderate, no children, and Food and Drinks first were selected. |
| Filtered live search | **Pass — zero matching results** | The first search returned the honest `No restaurants found` filtered state, with controls to broaden or skip. It did not report a credential, quota, network, or location failure. |
| Broadened live search | **Pass** | After explicit approval for one additional search, `Show all nearby restaurants` produced restaurant cards labelled `Live from Google Places`. |
| Live photograph | **Pass** | The first live restaurant card displayed an actual photograph rather than a blank or placeholder area. |
| Restaurant selection | **Pass** | The first live restaurant was accepted; remaining restaurant cards were skipped without selecting a second venue. |
| Activity disclosure and selection | **Pass** | The activity card was labelled `Sample Idea`; the first was accepted and remaining activity cards were skipped. |
| Optional break popup | **Pass** | `Time for a Break?` appeared after itinerary construction and was safely dismissed with `I'm fine`, without another search. |
| Mixed timeline | **Pass** | The timeline contained both the selected live restaurant and selected sample activity. |
| Maps-link scope | **Pass** | `Open in Maps` appeared for the live restaurant and not for the sample activity, matching the intended live/sample distinction. |
| Maps destination | **Pass** | The link opened Google Maps for the same restaurant, with a place overview and map location. No restaurant identity was recorded. |
| Persistence | **Pass** | Refresh returned to the welcome screen with `Resume your plan` and `2 planned stops`; Resume restored both items. |
| QR sharing | **Pass** | Share opened `Share Your Day` and displayed a QR code. |
| Cleanup | **Pass** | The QR dialog was closed, Start Over cleared the test plan, and Logout returned to the DayGuide sign-in screen. |

## 5. Search and cost scope

Two user-initiated nearby searches were made:

1. Italian plus Moderate price; and
2. one explicitly authorised unfiltered search.

No `Try again` action or repeated search was used. Displaying live restaurant
cards can also request their available photographs through the deployed photo
function; this packet does not claim an exact image-request count.

## 6. Gate decision

**GO — bounded guest Private Alpha.**

The principal guest journey is operational on the locked production deployment:

- anonymous authentication works;
- location is acquired when permission is granted;
- filtered zero-results handling is honest and recoverable;
- broadening produces real nearby Google Places cards and photographs;
- a live restaurant can be selected alongside a disclosed sample activity;
- the Maps handoff targets the same restaurant;
- the completed plan persists and resumes;
- QR sharing works; and
- reset and logout return the app to a clean state.

This decision is limited to an invitation-only guest Private Alpha. It is not a
claim of:

- Google or email/password sign-in readiness;
- live activity data;
- physical-phone or representative-device layout;
- physical-keyboard, screen-reader, or accessibility conformance;
- multi-day, booking, or favourites capability;
- formal load, quota, billing-alert, or rollback assurance; or
- general public-launch readiness.

## 7. Participant disclosures

Private Alpha participants should be told:

- guest access is the verified entry path;
- location permission is required for live nearby restaurants;
- a narrow cuisine/price combination may have no nearby matches, in which case
  `Show all nearby restaurants` broadens the search;
- activity suggestions are sample ideas, not live local results;
- transport information is approximate;
- Maps opens in Google Maps, whose desktop and phone layouts are controlled by
  Google; and
- QR sharing encodes the existing text summary rather than a hosted plan link.

## 8. Repository and deployment handling

Packet 146 changes evidence documents only. It does not alter application code,
Netlify configuration, Firebase configuration, Google Places configuration,
credentials, or the locked production deploy. The evidence commit must include
`[skip netlify]` and remain local for later review and integration unless a
separate instruction authorises a push.
