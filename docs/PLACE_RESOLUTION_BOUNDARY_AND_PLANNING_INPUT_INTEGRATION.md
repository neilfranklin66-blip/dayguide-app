# DayGuide - Place Resolution Boundary and Planning-Input Integration

## 1. Record identity

- **Packet:** 150 - Place Resolution Boundary and Planning-Input Integration
- **Implementation date:** 26 July 2026
- **Implementation agent:** Codex
- **Product Owner:** Neil Franklin
- **Implementation branch:** `packet-150-place-resolution-planning-input-integration`
- **Baseline commit:** `fa29737984c18bce2bd2f7bdbd10e4aa71b5184d`
- **Production change:** none
- **Provider enablement, credential, and Netlify setting change:** none

The protected untracked `.claude/` and `Dayguide#2/` folders were not inspected,
listed, searched, opened, modified, moved, renamed, staged, or deleted. The
separate untracked `KNOWN_ISSUES` conflict copy was also left untouched.

## 2. Outcome

Packet 150 implements the smallest controlled resolution path between typed
places and the Packet 149 planning-input workflow:

1. a user deliberately submits a station, venue, hotel, or address search;
2. the browser sends that query to a same-origin Netlify function;
3. the function attaches the existing server-only Places credential;
4. Google returns candidate identity, address, and geometry;
5. the function returns a sanitized, provider-labelled response;
6. the client validates each candidate as a Packet 148 `PlaceRef`; and
7. the user deliberately adds the correct verified match to the Packet 149
   start, destination, or hard-anchor choices.

The boundary is integrated internally through
`PlanningInputWithPlaceResolution`, but it is not mounted in `DayGuide.jsx`.
Production and the location-enabled Private Alpha journey are unchanged.

## 3. Provider choice

The boundary uses Google Find Place (Legacy) through the existing
**Places API**:

`https://maps.googleapis.com/maps/api/place/findplacefromtext/json`

Only these fields are requested:

- `place_id`;
- `name`;
- `formatted_address`; and
- `geometry`.

This is intentionally narrower than Text Search and does not require enabling
**Places API (New)** or adding it to the credential. Google now identifies Text
Search (New) as the replacement for Find Place (Legacy), so migration is a
future provider decision rather than a hidden part of this packet.

Packet 150 does not:

- enable or disable any Google API;
- widen, rotate, reveal, or replace the API key;
- create a browser-visible key;
- change a Netlify environment variable;
- call a routing or travel-time API; or
- make a live provider request during automated tests.

## 4. Server-side boundary

`netlify/functions/places-resolve.js`:

- accepts only `POST`;
- reads the query from a JSON request body, not the browser-facing URL;
- trims repeated whitespace;
- requires 3 to 120 characters;
- reads only `GOOGLE_PLACES_API_KEY`;
- requests the four fields above;
- validates coordinate ranges;
- removes malformed candidates;
- caps the returned list at five;
- removes unrequested provider data and raw provider error details;
- never returns the key; and
- returns stable unavailable, denied, quota, zero-result, and upstream-failure
  states.

The function does not read `REACT_APP_GOOGLE_PLACES_API_KEY`. A client-prefixed
secret would be compiled into public browser code and remains prohibited.

## 5. Client-side boundary

`src/api/placeResolutionApi.js`:

- applies the same query limits before a request;
- calls only `/.netlify/functions/places-resolve`;
- sends no key and calls no Google host;
- converts sanitized candidates through `createPlaceRef`;
- requires `source: google_places`;
- rejects candidates that lack usable identity, provenance, or coordinates;
  and
- distinguishes configuration, provider-denial, quota, connectivity,
  resolver-unavailable, malformed-response, and generic failure states.

An empty list means only that the provider successfully returned
`ZERO_RESULTS`. Failures do not masquerade as "no matches".

## 6. Planning-input integration

`src/components/PlanningInputWithPlaceResolution.jsx` composes the new search
boundary with Packet 149's `PlanningInputStage`.

The component:

- does not search while the user types;
- makes one provider request only after Search is pressed;
- shows a real loading state;
- explains when no verified result exists;
- shows actionable unavailable, quota, provider, and network messages;
- displays place name and address, but not coordinates;
- visibly attributes returned place content to `Google Maps`;
- explains the principal ranking factors;
- requires the user to add a match deliberately;
- deduplicates repeated candidates and existing planning choices; and
- supplies only validated places to the existing start, destination, and
  fixed-anchor selectors.

The search result is not automatically treated as the intended start,
destination, or anchor. Verification and planning selection remain two
separate user decisions.

## 7. Cost, privacy, storage, and attribution controls

### Cost

- no autocomplete or per-keystroke requests;
- no prefetch;
- no automatic retry;
- concurrent duplicate submissions are suppressed;
- one Find Place request per explicit Search action; and
- only the minimum planning fields are requested.

### Privacy and storage

- the query travels in the same-origin request body rather than its URL;
- no current GPS coordinate is added as an automatic location bias;
- Packet 150 adds no application logging;
- queries and result lists remain temporary component state; and
- no Packet 150 place content is written to `localStorage`, Firestore, or a
  DayGuide database.

The query and response are still processed by Netlify and Google to provide the
service. Provider and infrastructure handling is not equivalent to "no data
leaves the device".

### Attribution and later persistence

The result container includes visible `Google Maps` text attribution using
Google's prescribed capitalization, non-translation marker, readable size,
colour, and proximity to the returned content.

Google Maps Platform content has storage and attribution conditions. Packet 150
keeps names, addresses, and coordinates transient. A later version-2
persistence packet must review those conditions before storing provider
content; a Place ID has a different caching exception and must not be taken as
permission to persist every returned field.

## 8. Failure-state contract

| Condition | User-facing result |
|---|---|
| query too short or too long | correct the query before any request |
| resolver function missing | verified place search is unavailable |
| server key absent | verified place search is unavailable |
| provider refuses the request | provider access was refused |
| provider quota reached | place-search limit reached |
| device/network request fails | check the connection and retry |
| successful `ZERO_RESULTS` | try a fuller place name or address |
| malformed candidate/response | the place cannot be claimed as verified |

Raw provider messages and server exception details are not forwarded to the
browser.

## 9. Activation boundary

The integrated component is deliberately not imported by the active
application. Activating it now would collect geographical constraints that the
current timeline still ignores.

A later authorised packet must first:

1. supply route-leg or travel-time evidence between the selected points;
2. connect the finalized Packet 149 input to Packet 148 planning windows;
3. define how route infeasibility is explained and repaired;
4. localize the new workflow in all five supported languages;
5. decide a compliant version-2 persistence model;
6. provide the required public terms/privacy treatment; and
7. select the point at which the workflow enters the existing journey.

Until those controls exist, the current production claim remains unchanged:
DayGuide does not yet provide active route-aware geographical planning.

## 10. Validation

Focused Packet 150 validation passed:

- **3 test suites**;
- **35 tests**;
- zero failed tests; and
- zero snapshots.

Coverage includes:

- server-only credential handling;
- method, JSON, and query validation;
- minimum-field provider requests;
- response sanitization;
- malformed-coordinate rejection;
- raw-error and key non-disclosure;
- same-origin client requests;
- route-capable `PlaceRef` conversion;
- explicit-search-only behaviour;
- loading, zero-results, quota, denied, unavailable, and network states;
- Google Maps attribution;
- hidden coordinates;
- deduplication; and
- completed handoff into Packet 149.

The complete regression suite passed **45 suites and 1,015 tests**, with zero
failures and zero snapshots.

The production build compiled successfully. The main JavaScript bundle remained
`main.a1cd6b13.js` at `229.38 kB` gzipped, confirming that the disconnected
Packet 150 workflow does not enter the current application bundle.

## 11. Recommended next packet

The next controlled step should be:

**Packet 151 - Route-Evidence Boundary and Geographical-Planning Integration**

It should define how trustworthy leg-to-leg travel times reach the Packet 148
engine, connect Packet 150's finalized start/destination/anchor data to that
engine, and preserve an honest "cannot prove this fits" result when route
evidence is absent.

It must not be treated as implicit approval to enable a routing API, widen the
Places credential, change Netlify, push, deploy, or activate the workflow.

## 12. Repository and deployment handling

Packet 150 is an application-code, function-code, test, and documentation
packet. Its local commit must include `[skip netlify]`. It must not be pushed,
deployed, published, or used to change provider configuration without separate
Product Owner authority.
