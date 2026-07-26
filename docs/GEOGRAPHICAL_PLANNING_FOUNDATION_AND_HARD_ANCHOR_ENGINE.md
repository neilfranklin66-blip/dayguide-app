# DayGuide - Geographical Planning Foundation and Hard-Anchor Engine

## 1. Record identity

- **Packet:** 148 - Geographical Planning Foundation and Hard-Anchor Engine
- **Implementation date:** 26 July 2026
- **Implementation agent:** Codex
- **Product Owner:** Neil Franklin
- **Implementation branch:** `packet-148-geographical-planning-hard-anchor-engine`
- **Baseline commit:** `64b56b0ac2a1154f3a6b2543f355e5a7a15e74f9`
- **Production change:** none
- **Provider, credential, and Netlify change:** none

The protected untracked `.claude/` and `Dayguide#2/` folders were not inspected,
listed, searched, opened, modified, moved, renamed, staged, or deleted. The
separate untracked `KNOWN_ISSUES` conflict copy was also left untouched.

## 2. Objective

Packet 147 established that DayGuide's intended geographical intelligence and
hard-anchor behaviour did not survive in tracked code. Packet 148 implements
the first provider-independent foundation:

- route-capable place references;
- explicit start, hard-anchor, end, flexible-stop, and route-leg models;
- a pure constraint engine that builds planning windows around fixed anchors;
- deterministic fit checks for optional stops;
- preservation of live restaurant coordinates; and
- tests proving that the planner never moves a hard anchor or guesses missing
  travel evidence.

The foundation is deliberately disconnected from the visible DayGuide journey.
It cannot yet be selected through the UI, persisted, or used to reorder the
current timeline.

## 3. Route-capable planning model

`src/models/geographicalPlan.js` introduces schema version `2` for the future
geographical plan. It does not replace or migrate the existing saved-plan
version `1`.

### Place reference

A route-capable place reference requires:

- a non-empty user-facing name;
- finite latitude and longitude within valid ranges;
- a source describing how the place was obtained; and
- optional identifier, address, accuracy, locality, country code, and timezone.

The coordinate validator accepts `0` latitude and `0` longitude, so neither the
equator nor the Greenwich meridian is mistaken for a missing coordinate.

### Start point

A start point has:

- a route-capable place; and
- a whole local minute from `00:00` through `23:59`.

The model is provider-independent and does not assume the place is the device's
current GPS position.

### Hard anchor

A hard anchor has:

- a stable identifier and title;
- a route-capable place;
- a fixed start minute;
- a non-negative duration;
- a non-negative arrival buffer; and
- `plannerLocked: true`.

The model rejects anchors that finish after the selected day or whose arrival
buffer would begin before it. The lock means the planning engine may not move
the place or time. A future UI may still let the user deliberately edit or
remove an anchor.

### End point

An end point has a route-capable place and may have:

- a hard arrival deadline and buffer; or
- no deadline, in which case it expresses a direction of travel without
  fabricating a time constraint.

### Flexible stop

A flexible stop has:

- a route-capable place;
- a preferred duration;
- an optional shorter allowed duration; and
- `plannerLocked: false`.

This distinction lets a future planner remove, shorten, or reorder a suggestion
while leaving hard anchors unchanged.

### Route leg

A route leg records:

- origin and destination planning-point identifiers;
- travel mode;
- whole-minute duration;
- optional distance;
- evidence source; and
- optional evidence timestamp.

It contains no provider-specific response object or API dependency.

## 4. Hard-anchor constraint engine

`src/engines/hardAnchorEngine.js` exports two pure functions.

### `buildHardAnchorPlan`

Inputs:

- one start point;
- zero or more hard anchors;
- an optional end point; and
- an injected `getTravelMinutes` function.

Behaviour:

1. Validate the planning points and the hard-anchor lock.
2. Sort hard anchors by fixed time without mutating the caller's array.
3. Preserve every hard anchor's place, start time, duration, buffer, and lock.
4. Build a planning window from the start to the first anchor, between anchors,
   and optionally from the last anchor to the end point.
5. Subtract the anchor arrival buffer from its fixed start time.
6. Apply injected direct travel evidence.
7. Calculate time available for flexible stops.
8. Return an explicit status and evidence rather than changing a fixed
   commitment.

Plan statuses:

- **`feasible`** - every constrained window has enough time for its direct leg;
- **`infeasible`** - at least one direct leg cannot reach the next fixed
  commitment in time; or
- **`indeterminate`** - required travel evidence is unavailable or invalid.

A destination without an arrival deadline creates an `unconstrained` terminal
window. The engine retains the direct travel leg but does not invent available
time.

### `assessFlexibleStopFit`

This function evaluates one optional stop inside a constrained window. It
requires:

- travel from the window origin to the stop;
- the full or explicitly allowed minimum visit duration; and
- travel onward to the next hard commitment.

It returns:

- `fits: true` when the complete visit and both legs fit;
- `fits: false` when they would risk the next anchor; or
- `fits: null` when the window or travel evidence cannot support a safe claim.

It never substitutes the current approximate transport profile for missing
leg-to-leg evidence.

## 5. Coordinate retention

The existing nearby Places response already contained each restaurant's
geometry, but the client reduced it to distance from the search origin.
Packet 148 now:

- retains `{ lat, lng }` on the parsed live restaurant result;
- validates and copies it into the normalized `PlaceCard`;
- adds `coordinates: null` to the canonical default for sources without trusted
  geometry; and
- safely drops malformed coordinates without discarding the rest of a card.

This is an internal additive field. Current restaurant ranking, cards, timeline,
Maps handoff, search radius, and user-visible distance remain unchanged.

## 6. Safety invariants

Automated tests establish that:

- hard anchors remain planner-locked;
- anchor inputs are copied, not mutated;
- anchors are sorted deterministically without changing their fixed time;
- insufficient travel produces an explicit shortfall;
- overlapping hard commitments are infeasible;
- missing travel evidence produces `indeterminate`, not guessed feasibility;
- structured route evidence remains provider-independent;
- a soft destination does not fabricate slack;
- optional-stop fit includes both travel legs;
- an already impossible window rejects further suggestions;
- invalid coordinates, times, durations, and buffers are rejected; and
- live place coordinates survive parsing and normalization.

## 7. Persistence decision

The existing `dayguide_saved_plan_v1` payload is deliberately unchanged.
Packet 148 defines a future geographical schema version `2`, but does not:

- write it to `localStorage`;
- migrate or delete a version-1 plan;
- change Resume;
- expose anchors in QR sharing; or
- claim compatibility that has not been implemented.

A later packet must choose and test a version-transition policy before wiring
the geographical plan into persistence.

## 8. Boundaries and residual work

Packet 148 does not implement:

- start, destination, or anchor controls;
- place search or manual-location resolution;
- live activity discovery;
- route or travel-time provider integration;
- opening-hours-at-visit-time evidence;
- geographic candidate ranking;
- automatic itinerary recalculation;
- route-aware popups in the current UI;
- international validation;
- tagline changes; or
- deployment.

The current stable timeline continues to use category order, fixed 15-minute
gaps, and approximate venue-to-user transport displays.

## 9. Validation

Focused Packet 148 validation covered:

- the geographical planning model;
- the hard-anchor constraint engine;
- the PlaceCard adapter; and
- the Places client parser.

The final focused run passed **4 suites and 74 tests** with no snapshots.

The complete regression run then passed:

- **39 test suites**;
- **961 tests**;
- zero failed tests; and
- zero snapshots.

The production build compiled successfully. Its main JavaScript bundle was
`229.38 kB` gzipped. The small increase from the Packet 145 snapshot is expected:
the existing live-place adapter now validates and retains route coordinates.
The hard-anchor engine itself remains outside the current UI entry path.

## 10. Recommended next packet

The next bounded implementation should add planning inputs without yet
activating live route optimization:

**Packet 149 - Start, Destination, and Hard-Anchor Input Workflow**

That packet should:

- define a safe place-selection boundary;
- let the user distinguish current GPS from another starting place;
- collect an optional destination and deadline;
- add, edit, and intentionally remove planner-locked anchors;
- preserve the existing stable journey until the new workflow is complete; and
- avoid provider or credential expansion until its exact requirements are
  separately approved.

## 11. Repository and deployment handling

Packet 148 is an application-code, test, and documentation packet. Its local
commit must include `[skip netlify]`. It must not be pushed, deployed, or used
to change provider configuration without separate Product Owner authority.
