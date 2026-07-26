# DayGuide - Start, Destination, and Hard-Anchor Input Workflow

## 1. Record identity

- **Packet:** 149 - Start, Destination, and Hard-Anchor Input Workflow
- **Implementation date:** 26 July 2026
- **Implementation agent:** Codex
- **Product Owner:** Neil Franklin
- **Implementation branch:** `packet-149-start-destination-anchor-input-workflow`
- **Baseline commit:** `cbb0b9e20165240cc9f3c9a51e93504e2f2d1cd9`
- **Production change:** none
- **Provider, credential, and Netlify change:** none

The protected untracked `.claude/` and `Dayguide#2/` folders were not inspected,
listed, searched, opened, modified, moved, renamed, staged, or deleted. The
separate untracked `KNOWN_ISSUES` conflict copy was also left untouched.

## 2. Objective

Packet 148 established provider-independent geographical plan and hard-anchor
models. Packet 149 implements the next layer:

- choose current GPS or another resolved place as the intended start;
- choose a start time;
- add an optional destination;
- make that destination directional or give it an arrival deadline and buffer;
- add planner-locked, fixed-place, fixed-time anchors;
- deliberately edit or remove anchors; and
- finalize the input as validated geographical-plan version-2 data.

The workflow does not perform place search or geocoding. It accepts only
route-capable place references that already contain validated coordinates and
provenance.

## 3. Safe place-selection boundary

`src/components/ResolvedPlaceSelect.jsx` has no free-text place input.

It can offer:

1. a validated current-location place; and
2. validated resolved places injected by a future place-resolution boundary.

Invalid objects, labels without coordinates, duplicate option identities, and
unresolved free text are not presented as routable choices.

`createCurrentLocationSelection` safely converts the existing browser-position
shape into:

- a route-capable place reference;
- `source: current_gps`;
- retained accuracy when available; and
- `mode: current_location`.

Another supplied place uses `mode: resolved_place`. The finalized workflow
preserves that start/end provenance instead of treating all locations as the
device's current position.

This boundary is intentionally injected. Packet 149 does not:

- call Google or another provider;
- create a Netlify function;
- enable another API;
- widen the production credential;
- incur a new search or routing request; or
- claim that an address string has usable geography.

## 4. Planning-input workflow state

`src/utils/planningInputWorkflow.js` provides immutable operations for:

- creating a version-2 draft;
- selecting or clearing the start place;
- changing the start time;
- enabling or clearing the destination;
- selecting the destination;
- adding or clearing its deadline and buffer;
- inserting or updating a hard anchor;
- deliberately removing a hard anchor; and
- finalizing the complete input.

Finalization returns either:

- `{ ok: true, value }` with validated start, anchors, optional end point, and
  location provenance; or
- `{ ok: false, errors }` with stable error codes.

Validation prevents:

- missing or unresolved start places;
- invalid start times;
- enabled destinations without a resolved place;
- invalid destination deadlines or buffers;
- invalid hard-anchor structures or timing;
- reserved `start` or `end` anchor identifiers; and
- duplicate anchor identifiers in an imported draft.

Disabling a destination clears its place, deadline, and buffer. It cannot leave
hidden stale constraints in the finalized input.

## 5. Input components

### `ResolvedPlaceSelect`

- distinguishes `Use my current location` from another resolved place;
- includes a readable place name and address;
- can clear an optional destination;
- disables itself when no valid choices exist; and
- explains that only verified map locations can be used.

### `HardAnchorEditor`

Collects:

- commitment name;
- fixed resolved place;
- fixed start time;
- duration; and
- early-arrival buffer.

Saving creates a Packet 148 `HardAnchor` with `plannerLocked: true`. The editor
cannot save an unresolved place or invalid timing.

### `PlanningInputStage`

Coordinates:

- start place and time;
- optional destination and deadline;
- zero or more anchor summaries;
- explicit anchor Edit and Remove actions;
- validation messages; and
- finalization through one `onComplete` boundary.

The visible anchor summary identifies each item as a `Locked anchor` and states
its place, time, duration, and arrival buffer.

## 6. User authority and planner authority

The workflow preserves the product rule:

- **DayGuide's planner may not move an anchor.**
- **The user may deliberately edit or remove an anchor.**

Editing recreates a validated hard anchor with the same identifier. Removing
uses an explicit control labelled with the anchor title. Neither action occurs
as a side effect of itinerary recalculation.

## 7. Integration boundary

The new components are not mounted in `DayGuide.jsx`.

This is deliberate because the application currently has:

- current browser GPS;
- live nearby restaurants around that GPS; but
- no approved provider-neutral adapter that can resolve Euston, a theatre, a
  hotel, or another typed place into route-capable coordinates.

Mounting the workflow now would either restrict every place to the current
position or invite free text that the route engine cannot safely use. Both
would misrepresent geographical intelligence.

Before activation, a later packet must:

1. select and approve the place-resolution boundary;
2. define its request, result, cost, quota, privacy, and failure behaviour;
3. supply validated place references to the Packet 149 components;
4. add locale-backed copy for every supported language;
5. decide where the stage enters the existing journey;
6. connect finalized inputs to Packet 148 planning windows; and
7. decide version-2 persistence behaviour.

## 8. Validation

Focused Packet 149 validation covers:

- immutable workflow operations;
- current-GPS conversion and provenance;
- resolved-place-only selection;
- destination enable/clear and deadline handling;
- anchor add, replace, edit, and remove;
- reserved and duplicate anchor identifiers;
- final version-2 input;
- inaccessible free-text rejection;
- component-level start, destination, deadline, and anchor behaviour; and
- warning-free HTML structure.

The final focused run passed:

- **4 test suites**;
- **27 tests**;
- zero failed tests;
- zero snapshots; and
- no React or invalid-HTML warnings.

The complete regression run then passed **43 suites and 988 tests**, with zero
failures and zero snapshots.

The production build compiled successfully. The main JavaScript bundle remained
`229.38 kB` gzipped with the same `main.a1cd6b13.js` filename as Packet 148,
confirming that the disconnected Packet 149 workflow does not enter the current
production bundle.

## 9. Remaining product work

Packet 149 does not yet provide:

- a place search box;
- address or station resolution;
- a map picker;
- provider-backed route legs;
- opening-hours feasibility;
- geographic ordering;
- a current-journey screen;
- version-2 Resume or QR sharing;
- translated workflow copy; or
- production deployment.

The stable location-enabled Private Alpha journey remains unchanged.

## 10. Recommended next packet

The next step should be a controlled provider and integration decision:

**Packet 150 - Place Resolution Boundary and Planning-Input Integration**

It should determine the smallest safe mechanism for resolving typed places,
stations, venues, and hotels into Packet 148 place references, then connect the
Packet 149 stage only after cost, credential, privacy, failure, and test
controls are approved.

It must not be treated as implicit approval to widen an API key, enable a new
provider service, change Netlify, or deploy.

## 11. Repository and deployment handling

Packet 149 is an application-code, test, and documentation packet. Its local
commit must include `[skip netlify]`. It must not be pushed, deployed, or used
to change provider configuration without separate Product Owner authority.
