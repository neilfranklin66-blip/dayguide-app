# DayGuide - Route-Evidence Boundary and Geographical-Planning Integration

## 1. Record identity

- **Packet:** 151 - Route-Evidence Boundary and Geographical-Planning Integration
- **Implementation date:** 26 July 2026
- **Implementation agent:** Codex
- **Product Owner:** Neil Franklin
- **Implementation branch:** `packet-151-route-evidence-geographical-planning-integration`
- **Baseline commit:** `9faf015b7f3fc7bd962c42bc74ddae29466cafd0`
- **Production change:** none
- **Routing provider, credential, and Netlify change:** none

The protected untracked `.claude/` and `Dayguide#2/` folders were not inspected,
listed, searched, opened, modified, moved, renamed, staged, or deleted. The
separate untracked `KNOWN_ISSUES` conflict copy was also left untouched.

## 2. Outcome

Packet 151 connects the exact finalized Packet 149 planning-input structure to
Packet 148's hard-anchor engine through a new provider-neutral route-evidence
boundary.

The internal sequence is now:

1. Packet 150 resolves places into route-capable place references.
2. Packet 149 finalizes the selected start, destination, and locked anchors.
3. Packet 151 builds the exact adjacent route legs around those fixed points.
4. An injected batch resolver may return trustworthy route evidence.
5. The boundary validates and associates every returned leg.
6. Packet 148 builds fixed planning windows from the accepted evidence.
7. Packet 151 reports ready, infeasible, directional, no-route-required, or
   evidence-required.

Missing, partial, malformed, mismatched, duplicate, or approximate evidence
cannot produce a claim that the plan fits.

This integration is internal. No route provider is selected or called by
tracked application code, and the new review component is not mounted in
`DayGuide.jsx`.

## 3. Dated route-planning context

`createRoutePlanningContext` requires:

- a real `YYYY-MM-DD` calendar date;
- a valid IANA timezone; and
- one supported travel mode:
  - walking;
  - cycling;
  - driving; or
  - transit.

This closes an important ambiguity between a local minute such as `18:30` and a
provider-ready request. The route boundary keeps the planning date, local
minute, local date-time, and timezone explicit instead of silently converting
them through the server's timezone.

Packet 151 assumes one calendar date and timezone for the plan. Cross-midnight,
multi-day, and cross-timezone itineraries remain outside the model.

## 4. Adjacent-leg request boundary

`buildRouteEvidenceRequests` first asks the existing hard-anchor engine to
validate and sort the points. It then creates only the required adjacent legs:

- start to first hard anchor;
- hard anchor to next hard anchor; and
- final hard anchor to destination, when present.

Each request contains:

- a stable `from->to` request identifier;
- copied origin and destination place references;
- travel mode;
- local departure minute and date-time;
- the next fixed arrival target, when one exists; and
- IANA timezone.

An anchor leg departs after the preceding anchor's fixed duration. Its arrival
target is the next anchor's fixed start time minus its arrival buffer. A
destination without a deadline has no fabricated arrival target.

The resolver is a single injected batch function. Packet 151 does not prescribe
whether a later provider adapter uses individual route calls, a matrix
operation, public-transport schedules, or another approved mechanism.

## 5. Trustworthy evidence contract

The boundary recognizes:

- `provider_route`;
- `operator_schedule`; and
- `approximate`.

Only `provider_route` and `operator_schedule` can prove feasibility.
`approximate` is deliberately rejected.

Accepted evidence must:

- identify the exact requested leg;
- match the requested travel mode;
- provide a non-negative whole-minute duration;
- provide a valid non-negative distance or no distance;
- name its evidence source; and
- include an absolute observation/retrieval timestamp with a timezone offset.

The current `transportEngine` heuristic is based on venue-to-user distance and
fixed urban-speed profiles. It remains useful as a visibly approximate display,
but Packet 151 will not use it to prove that the user can reach a theatre,
train, booking, or other hard anchor.

Provider exceptions are reduced to stable quota, access, network, or
unavailable problems. Raw provider and infrastructure messages are not
returned through the planning result.

## 6. Evidence collection states

`collectRouteEvidence` returns:

- **`complete`** - every requested leg has valid trusted evidence;
- **`partial`** - at least one, but not every, leg has valid evidence;
- **`unavailable`** - no requested leg has usable evidence; or
- **`not_required`** - there are no anchors or destination legs.

It also reports stable per-leg problems for:

- absent evidence;
- provider unavailability;
- quota;
- denied access;
- network failure;
- invalid evidence;
- approximate/untrusted evidence;
- duplicate evidence; and
- evidence for an unrequested leg.

No automatic retry is performed. A plan with no route legs does not call the
injected resolver.

## 7. Geographical-planning integration

`src/engines/geographicalPlanningEngine.js` converts accepted route evidence
into Packet 148 route legs and supplies them to `buildHardAnchorPlan`.

Its product-facing statuses are:

- **`ready`** - every constrained window has trusted evidence and sufficient
  time;
- **`infeasible`** - trusted evidence proves at least one fixed commitment
  cannot be reached in time;
- **`evidence_required`** - one or more required legs cannot be proved;
- **`directional`** - an evidenced destination exists without an arrival
  deadline; or
- **`no_route_required`** - there is only a start point.

Continuation is allowed only for `ready`, `directional`, or
`no_route_required`. It is blocked for `infeasible` and `evidence_required`.

The assessment includes:

- copied planning points and route evidence;
- exact planning windows;
- direct route minutes;
- flexible minutes before each fixed target;
- exact shortfall minutes;
- route and engine problems; and
- counts of anchors, requested legs, evidenced legs, and constrained windows.

Hard anchors remain copied, fixed, and planner-locked. The engine never changes
their place, time, duration, or arrival buffer to make a failing result appear
successful.

## 8. Honest review stage

`src/components/GeographicalPlanningReview.jsx` provides an internal,
unmounted review stage.

It:

- makes no request before `Check route feasibility` is pressed;
- suppresses concurrent duplicate checks;
- shows a real checking state;
- states how many legs were verified;
- reports an exact shortfall when evidence proves infeasibility;
- says explicitly when DayGuide cannot prove the plan fits;
- confirms that fixed commitments were not moved;
- keeps Back available after invalid input or failure; and
- exposes Continue only for a safely continuable result.

If no resolver is injected, the component returns the honest
`evidence_required` state rather than using the existing approximation.

The component is not localized and is not imported by the current journey.

## 9. Provider and operational boundary

Packet 151 does not:

- select or call Google Routes, Directions, a transit operator, or another
  routing provider;
- add a Netlify function;
- read or create an environment variable;
- enable an API;
- widen the Places-only key;
- add a browser-visible key;
- define pricing or quota assumptions;
- persist route requests or evidence;
- change the current timeline; or
- deploy.

A future adapter must be separately reviewed for request cost, batch size,
rate limiting, mode and region coverage, transit-date behaviour, attribution,
licensing, caching, privacy, credentials, stale evidence, and provider failure.

## 10. Validation

Focused Packet 151 validation passed:

- **3 test suites**;
- **25 tests**;
- zero failed tests; and
- zero snapshots.

Coverage includes:

- real-date, timezone, and travel-mode validation;
- fixed-anchor sorting and adjacent-leg construction;
- local departure and arrival-target times;
- immutable place/request copies;
- one batch-resolver invocation;
- complete, partial, unavailable, and not-required evidence;
- quota, access, network, and generic provider failures;
- malformed, wrong-mode, duplicate, unexpected, and approximate evidence;
- the exact finalized Packet 149 output;
- ready, infeasible, evidence-required, directional, and no-route-required
  planning;
- exact shortfalls;
- hard-anchor preservation;
- explicit review action and loading state;
- duplicate-check suppression;
- safe continuation gating; and
- invalid-context recovery.

The complete regression suite passed **48 suites and 1,040 tests**, with zero
failures and zero snapshots.

The production build compiled successfully. The main JavaScript bundle remained
`main.a1cd6b13.js` at `229.38 kB` gzipped, confirming that Packet 151's route
boundary, integration engine, and review stage do not enter the active
application bundle.

## 11. Remaining work

Packet 151 does not yet provide:

- live route or transit evidence;
- routing-provider credentials or cost controls;
- route-aware ordering of flexible stops;
- backtracking or corridor scoring;
- route-aware restaurant/activity selection;
- opening-hours-at-arrival evidence;
- live delay or disruption handling;
- cross-midnight or multi-timezone planning;
- version-2 persistence and Resume;
- QR sharing of anchors/routes;
- five-language copy;
- current-journey entry; or
- production activation.

The stable Private Alpha journey remains unchanged.

## 12. Recommended next packet

The next controlled step should be:

**Packet 152 - Routing Provider Decision, Credential Isolation, and Cost
Guardrails**

It should compare viable provider mechanisms against Packet 151's exact
request/evidence contract and decide:

- supported travel modes and regions;
- date/time and public-transport requirements;
- route versus matrix operations;
- cost per user planning action;
- batch and rate limits;
- credential isolation;
- privacy and retention;
- attribution and licensing;
- stale-evidence policy; and
- failure and fallback behaviour.

It must be a decision gate, not implicit approval to enable an API, widen a
credential, modify Netlify, push, deploy, or activate the workflow.

## 13. Repository and deployment handling

Packet 151 is an application-code, test, and documentation packet. Its local
commit must include `[skip netlify]`. It must not be pushed, deployed,
published, or used to change provider configuration without separate Product
Owner authority.
