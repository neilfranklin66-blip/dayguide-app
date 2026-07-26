# DayGuide - Geographical Intelligence and Anchor Recovery Audit

## 1. Record identity

- **Packet:** 147 - Geographical Intelligence and Anchor Recovery Audit
- **Audit date:** 26 July 2026
- **Implementation agent:** Codex
- **Product Owner:** Neil Franklin
- **Audit branch:** `packet-147-geographical-intelligence-anchor-audit`
- **Baseline commit:** `4ae92cd9a288bb207cc5177cdc5a9065d55eacde`
- **Evidence scope:** tracked source, tests, documentation, and Git history only
- **Application changes:** none
- **Provider, credential, Netlify, and production changes:** none

The protected untracked `.claude/` and `Dayguide#2/` folders were not inspected,
listed, searched, opened, modified, moved, renamed, staged, or deleted. The
separate untracked `KNOWN_ISSUES` conflict copy was also left untouched.

## 2. Product Owner intent

DayGuide should become geographically intelligent rather than merely presenting
a sequence of selected cards. The intended experience is:

- plan for a future date and a place other than the device's current position;
- begin at a chosen starting place and time, such as arrival at Euston station;
- preserve fixed-time, fixed-place commitments such as a theatre performance;
- fit flexible activities, food, cafes, and breaks safely between those
  commitments;
- progress sensibly towards an optional final destination, such as a hotel in
  Southwark;
- avoid wasteful backtracking; and
- offer useful fill-time suggestions that are on the way to, or near, the next
  fixed destination.

The Product Owner considers this a central source of DayGuide's product value.
It is therefore classified as a **strategic product capability gap**, not as a
new production incident in the stable Private Alpha.

## 3. Audit conclusion

The tracked application contains useful foundations, but it does **not**
currently implement geographical itinerary planning or anchors.

What survives:

- one selected date;
- one editable start time;
- a browser-GPS location watcher;
- coordinate-based live restaurant discovery around the current device;
- a normalized `PlaceCard` boundary;
- fixed-duration timeline construction;
- approximate travel display;
- Maps deep links for live restaurants; and
- versioned local plan persistence.

What does not survive:

- manual or searched start location;
- a separate planning location for a future visit;
- end location or arrival deadline;
- functional hard anchors;
- candidate coordinates retained in the internal place model;
- leg-to-leg distance or travel time;
- spatial ordering or backtracking minimization;
- opening-hours-aware feasibility;
- route-aware fill-time suggestions;
- itinerary-local timezone handling; or
- persistence of places, anchors, route legs, or location provenance.

The earlier manual-location and anchor experience described by the Product
Owner is not present in the available tracked Git history. It may have existed
before this repository history or outside the permitted evidence scope, but it
cannot be recovered as tracked code from this audit. The capability must be
specified and rebuilt using the surviving foundations.

## 4. Tracked history findings

| Commit | Tracked evidence | Audit finding |
|---|---|---|
| `b9f00ad` | Initial DayGuide commit with GPS tracking, the UK tagline, available time, start time, and a sequential timeline. | The repository starts with current-device GPS. It does not contain manual start location, destination, or anchors. |
| `e898aab` | Added the single-date picker. | Future date selection survives, but it is not coupled to a planning-location timezone. |
| `1aa1b3b` | Introduced the normalized `PlaceCard` model and adapter. | The model contains `metadata.isAnchorCapable`, but its default and every current adapter value are `false`; no anchor action or rule was added. |
| `200242f` | Added `startWith`, choosing Activities or Food and Drinks first. | "Order" means category order, not geographic order. |
| `9c88282` | Extracted `itineraryRouteEngine`. | Despite its name, the engine only selects the next UI stage: activities, restaurants, meal prompt, or timeline. |
| `cd487da` | Added distance-derived transport estimates. | The implementation explicitly uses venue-to-user distance, not the distance between itinerary stops. |
| `7ba7574` | Extracted `LocationStage`. | The stage remains a loading interstitial and has no location-entry control. |

Repository-wide tracked-history searches found no implementation of a manual
start location, end location, hotel destination, hard anchor, or anchor
constraint solver.

## 5. Current capability inventory

| Capability | Current status | Evidence and implication |
|---|---|---|
| Opening proposition | UK-specific | `src/locales/en.json` says `Plan your perfect day in the UK`. |
| Date | Implemented | `DateSelector` accepts today through 90 days ahead. |
| Start time | Implemented | `StartTimeSelector` stores a decimal hour derived initially from the device clock. |
| Current device location | Implemented | `useGeolocation` continuously watches browser GPS and returns latitude, longitude, accuracy, and timestamp. |
| Manual planning location | Not implemented | `LocationStage` displays loading copy only; no address, place, station, postcode, map pin, or saved place can be entered. |
| Start-place choice | Not implemented | Restaurant search always uses the browser position supplied by `useGeolocation`. |
| End place or deadline | Not implemented | No corresponding state, component, timeline field, or persisted value exists. |
| Hard anchors | Not implemented | `isAnchorCapable: false` is metadata only. There is no anchor entity, lock, fixed time/place, duration, validation, or solver behaviour. |
| Candidate coordinates | Not retained | Nearby provider results contain geometry, but `parsePlaces` and the `PlaceCard` model retain only a distance from the search origin, not each place's coordinates. |
| Activities | London sample data | All current activity records are London demonstrations with addresses and static distances, but no coordinates or live availability. |
| Restaurant geography | Current-position radius only | Live nearby search uses the current coordinates, a 5 km radius, and at most 12 displayed results. |
| Itinerary ordering | Category blocks only | Timeline entries are all activities then restaurants, or the reverse, according to `startWith`. They are not spatially sorted. |
| Inter-stop time | Fixed approximation | Timeline construction adds a fixed 15-minute gap between stops, irrespective of their locations. |
| Transport | Display approximation only | `transportEngine` applies urban speed profiles to each venue's distance from the user. It cannot describe the actual leg from one stop to the next. |
| Opening-hour feasibility | Not implemented | Permanently closed provider results are excluded, but the plan does not test whether a place is open at its scheduled visit time. |
| Fill-time prompts | Not route-aware | Coffee/activity popups use timeline composition and current-origin distance; they do not know the next anchor or remaining travel window. |
| Maps | Restaurant handoff only | Live restaurants can open in Google Maps. Maps does not feed travel times or route ordering back into DayGuide. |
| Persistence | Version 1, route-unaware | The saved plan stores the timeline and display settings, but deliberately excludes geolocation and has no place, anchor, or route-leg schema. |
| International readiness | Unverified | Restaurant discovery is coordinate-driven, but activity data is London-only and address, timezone, transport, locality, and international behaviour have not been validated. |

## 6. Product contract

### 6.1 Planning entities

DayGuide should use explicit concepts rather than overloading "location" or
"route":

1. **Start point**
   - required place;
   - required start date and local time;
   - source: current position, searched place, saved place, or map selection;
   - may itself be fixed, for example a booked train arrival.

2. **Hard anchor**
   - a user-supplied commitment with a fixed place and fixed start time;
   - optional duration or fixed end time;
   - optional arrival buffer;
   - immutable to the planner;
   - editable or removable only through a deliberate user action.

3. **End point**
   - optional place where the day should finish;
   - may have a hard arrival deadline or may act as a softer direction of
     travel.

4. **Flexible stop**
   - an activity, meal, cafe, rest, or other recommendation that DayGuide may
     select, reorder, shorten within an allowed range, or remove.

5. **Route leg**
   - travel from the start point or one stop to the next;
   - records its origin, destination, travel mode, duration, distance, evidence
     source, and freshness.

6. **Planning window**
   - the feasible time between the start point, successive hard anchors, and
     the end point.

### 6.2 Non-negotiable anchor rule

The planner must never move a hard anchor to make an itinerary appear to fit.

For a theatre anchor at 18:30:

- DayGuide determines a target arrival time using the selected buffer;
- the preceding flexible stop must finish early enough for the travel leg and
  buffer;
- later recommendations may be removed or replaced;
- if nothing safely fits, DayGuide leaves free time or recommends travelling
  to the anchor;
- if the user is running late, DayGuide warns them and prioritizes the anchor;
  and
- the user may deliberately edit or unlock the anchor, but an automatic
  recalculation may not do so.

### 6.3 Feasibility before preference

Candidate evaluation must occur in this order:

1. fixed time and place constraints;
2. place opening and availability at the planned visit time;
3. travel time plus arrival buffer;
4. user accessibility and travel-mode constraints;
5. remaining usable duration;
6. route progression and detour;
7. interests, cuisine, price, family suitability, rating, and variety.

A highly rated recommendation that risks a fixed commitment is not a valid
recommendation.

### 6.4 Geographic progression

The engine should minimize unnecessary travel without claiming that the
shortest route is always the best day. Its scoring can balance:

- total travel minutes;
- avoidable backtracking;
- deviation from the corridor towards the next hard anchor or end point;
- waiting time;
- opening-time fit;
- user interests and meal timing;
- cost and preferred travel mode; and
- a configurable safety buffer.

Hard feasibility is a gate. These softer qualities can rank only candidates
that pass it.

### 6.5 Fill-time suggestions

A fill-time suggestion is valid only when DayGuide can account for:

- the user's current or last confirmed position;
- the next hard anchor and its arrival target;
- travel to the suggestion;
- the suggestion's realistic duration;
- travel onward to the anchor; and
- the safety buffer.

The UI should explain why the suggestion fits, for example:

> You have 40 minutes before you need to leave for the theatre. Would you like
> a cafe near the venue?

If route or opening evidence is unavailable, DayGuide must say that the option
is approximate and must not promise punctuality.

### 6.6 Time and international handling

- Plan times belong to the itinerary location's timezone, not automatically to
  the device's current timezone.
- Addresses and place labels must not assume UK postcodes or London transport.
- Currency-specific prices and city-specific transport claims require local
  evidence.
- A single plan remains single-day unless multi-day planning is separately
  approved.
- Crossing timezones within one day is outside the first recovery slice.

### 6.7 Privacy and persistence

- Current GPS and a manually selected planning place are distinct inputs.
- Precise coordinates should not be displayed more widely than necessary.
- Location provenance and accuracy should be recorded so the planner can
  distinguish current GPS from a searched place.
- A shared QR summary must not include precise coordinates by default.
- Persisting start, end, and anchor places requires an explicit version-2 saved
  plan decision because the current version-1 schema has no migration path.
- Provider requests, retention, disclosure, and deletion expectations must be
  documented before a broader rollout.

## 7. Required technical foundations

The product contract cannot be implemented safely by adding one location text
box. The following foundations are required:

1. **Route-capable place reference**
   - stable identifier where available;
   - user-facing name and address;
   - latitude and longitude;
   - source and accuracy/provenance;
   - locality, country, and timezone when known.

2. **Planner-owned anchor model**
   - fixed local date/time and place;
   - duration or end time;
   - arrival buffer;
   - planner lock and explicit user-edit semantics.

3. **Versioned itinerary model**
   - start, anchors, optional end, flexible stops, and route legs;
   - deterministic validation;
   - a deliberate compatibility decision for existing saved plans.

4. **Constraint engine**
   - pure, provider-independent planning logic;
   - injected travel-time and place-availability evidence;
   - deterministic tests for feasible and impossible windows;
   - no silent anchor movement.

5. **Geographic candidate data**
   - preserve provider coordinates instead of reducing them to current-origin
     distance;
   - replace or supplement coordinate-free London sample activities before
     claiming live route-aware activity recommendations.

6. **Travel evidence boundary**
   - a separately approved route or travel-time source for dependable
     leg-to-leg estimates;
   - explicit fallback and disclosure when the source is unavailable;
   - cost, quota, credential, and server-side access controls before activation.

7. **Clear engine naming**
   - the current `itineraryRouteEngine` is a selection-stage flow engine;
   - a future geographic planner should not reuse that name ambiguously.

## 8. Provider and operational boundary

The current production credential is deliberately restricted to the existing
Places use. Packet 147 does not widen it.

Manual place resolution, live activity discovery, future opening-hour evidence,
and leg-to-leg travel times may require additional or differently configured
provider capabilities. Those choices affect cost, quota, terms, privacy,
credential restrictions, failure handling, and test strategy. They require a
separate Product Owner decision and a provider-specific packet before any
external configuration changes.

The constraint engine should therefore be provider-independent. Provider calls
should supply evidence to it rather than contain the planning rules.

## 9. Recovery sequence

### Phase A - Data and constraint foundation

- introduce route-capable place, anchor, planning-window, and route-leg models;
- retain coordinates from normalized live places;
- create a provider-independent hard-constraint engine;
- test anchor immutability, travel buffers, impossible windows, and stable
  ordering;
- decide the version-2 persistence boundary; and
- keep the new capability outside the production user journey.

### Phase B - Planning inputs

- allow "Use my current location" or "Choose another place";
- keep the existing date and start-time controls;
- add an optional end place and deadline;
- add, edit, lock, and intentionally remove hard anchors; and
- show the plan's locality and timezone clearly.

### Phase C - Geographic itinerary

- obtain approved leg-to-leg travel evidence;
- route flexible stops through the windows between hard anchors;
- expose travel legs and buffers in the timeline;
- detect impossible plans and explain the conflict;
- preserve anchors during all recalculation.

### Phase D - Route-aware discovery

- provide live or otherwise location-trustworthy activity candidates;
- search around the start, route corridor, next anchor, and destination rather
  than only the device;
- implement safe fill-time suggestions;
- re-plan after skip, delay, or user movement without moving anchors.

### Phase E - Rollout and proposition

- validate representative London scenarios;
- expand to selected UK cities;
- test selected international cities, address formats, timezones, transport
  assumptions, and provider coverage;
- retain honest market limitations; and
- change the opening proposition only after the broader capability is proven.

The target proposition is:

> **Plan your perfect day, wherever you're going.**

Recommended supporting text:

> Choose where and when your day starts, tell us where you need to finish, and
> DayGuide creates a day that flows.

The present UK wording should not be generalized in production merely because
the product direction is international. Current live restaurant discovery has
not been validated internationally and current activity ideas remain London
sample data.

## 10. Acceptance scenarios for later implementation

The following scenarios should become permanent tests and manual acceptance
journeys:

1. **Euston to Southwark**
   - start at Euston at a chosen future time;
   - select flexible activities and food;
   - finish at a Southwark hotel by a stated deadline;
   - avoid material backtracking.

2. **Fixed theatre anchor**
   - add a theatre at 18:30 with an arrival buffer;
   - confirm all earlier flexible stops finish in time;
   - confirm automatic replanning never changes 18:30 or the venue.

3. **Impossible window**
   - create two anchors that cannot be connected in time;
   - receive an explicit conflict rather than a fabricated itinerary.

4. **Fill time near the next anchor**
   - leave a small window before the theatre;
   - receive a suggestion whose visit and onward travel both fit;
   - reject candidates that would risk lateness.

5. **Plan somewhere else**
   - plan for a city the device is not currently in;
   - search around the chosen start place rather than current GPS.

6. **Resume and share**
   - restore start, anchors, destination, route legs, and local times;
   - keep anchor locks intact;
   - omit precise coordinates from the default QR summary.

7. **Provider degradation**
   - make travel evidence unavailable;
   - preserve anchors, explain the limitation, and avoid exact routing claims.

8. **International locality**
   - plan in a selected non-UK city;
   - display the correct local date/time and non-UK address format;
   - avoid London-specific transport or currency assumptions.

## 11. Recommended next packet

The next implementation packet should be:

**Packet 148 - Geographical Planning Foundation and Hard-Anchor Engine**

Its bounded objective should be to add provider-independent data models and a
pure, deterministic constraint engine with tests, while leaving the current
production journey and external provider configuration unchanged.

Packet 148 should not yet:

- change the opening tagline;
- add provider APIs or widen credentials;
- expose incomplete anchor controls in production;
- replace the current stable itinerary;
- claim live routing or international readiness; or
- deploy.

## 12. Audit handling

Packet 147 is documentation-only. It makes no application, test, dependency,
provider, credential, Netlify, or production change. Its commit must include
`[skip netlify]` and remain local unless integration, push, or deployment is
separately authorised.
