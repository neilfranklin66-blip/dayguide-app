# Packet 154 — London Route Calibration and Private Alpha Acceptance Criteria

## 1. Authority, boundary, and result

- **Product Owner:** Neil Franklin
- **Implementation agent:** Codex
- **Date:** 27 July 2026
- **Branch:** `packet-154-london-route-calibration-private-alpha-criteria`
- **Baseline commit:** `9dd2e464529ec44d5cca821150350c2268026645`
- **Production, provider, credential, quota, Netlify, push, or deployment
  change:** none

Packet 154 implements a repeatable, non-billable London calibration framework
for the Packet 153 evidence-quality gate. It defines public-place scenarios,
proposes measurable walking and public-transport criteria, calculates a
proposed Private Alpha daily quota, and provides safe structures for a later
bounded evidence exercise.

It does not approve its own proposals. It does not call Google Routes, enable
an API, create or inspect a credential, configure a quota or billing alert,
change Netlify, mount the planning workflow, push, deploy, publish, or alter
production.

The protected untracked `.claude/` and `Dayguide#2/` folders were not inspected,
listed, searched, opened, modified, moved, renamed, staged, or deleted. The
separate untracked `KNOWN_ISSUES` conflict copy was also left untouched.

## 2. First calibration boundary

The proposed first region is **London, UK**, using timezone `Europe/London`.
Only these modes are included:

- **walking**, because it is important between stations, activities, venues,
  and hotels; and
- **public transport**, because it is central to longer London journeys and
  must be tested independently for timetable and coverage quality.

These modes are excluded:

- **driving**, because Packet 152's current adapter uses traffic-unaware results
  and those remain non-conclusive for hard anchors; and
- **cycling**, because it is not required for the first Private Alpha decision
  and would require its own quality, warning, and presentation review.

Exclusion does not mean permanent rejection. Neither mode can be activated from
Packet 154.

## 3. Scenario set

`src/routing/londonRouteCalibration.js` contains 24 fixed scenarios: 12 walking
and 12 public-transport journeys. Every endpoint is a named public station,
venue, attraction, or hotel. There is no home address, live GPS trail, tester
identity, or private destination.

The set covers:

- London Euston, St Pancras, Waterloo, Victoria, London Bridge, and Southwark
  stations;
- the British Museum, British Library, National Gallery, Natural History
  Museum, V&A, Tate Modern, Tower of London, St Paul's, Barbican, Southbank
  Centre, Shakespeare's Globe, National Theatre, and Royal Opera House;
- a public Southwark hotel destination;
- station-to-activity, station-to-station, activity-to-activity,
  station-to-hotel, activity-to-departure-station, and fixed-venue journeys;
- short and longer legs;
- weekday peak, weekday off-peak, and weekend daytime cases; and
- at least six anchor-critical journeys, including theatre/venue arrival and
  departure-station commitments.

Coordinates are calibration fixtures for those public places. A later live
exercise must confirm the intended public entrances before making any provider
call; it must not silently replace them with personal locations.

## 4. Bounded calibration plan

The framework requires:

- one real Monday-to-Friday date;
- one real Saturday-or-Sunday date; and
- all dates to be supplied deliberately for the later run.

It then creates five provider-compatible batches:

| Boundary | Limit |
|---|---:|
| Walking scenarios | 12 |
| Public-transport scenarios | 12 |
| Total scenarios/provider requests | 24 |
| Maximum requests in one batch | 6 |
| Maximum billable events for one complete exercise | 24 |
| Automatic retries | 0 |
| Alternative routes | 0 |
| Matrix elements | 0 |

Arrival-target requests are used only for the public-transport cases that
represent a fixed commitment. All other cases use departure time.

The framework creates data only. It contains no network client, API key name,
environment-variable access, provider-mode activation, or import of the live
route client. Packet 155 would require separate authority to execute any
provider call.

## 5. Proposed acceptance criteria

The following values are **Codex recommendations for Neil's explicit review**.
They are stored with `approvedByProductOwner: false` and `approvedAt: null`.
Packet 154 therefore produces `not_assessed`, never `passed`, unless a later
explicit Product Owner decision supplies a real approval timestamp.

| Criterion | Walking proposal | Public-transport proposal |
|---|---:|---:|
| Fresh samples required | 12 | 12 |
| Maximum sample age | 7 days | 7 days |
| Minimum route availability | 100% (12/12) | 90% (at least 11/12) |
| Greatest permitted optimistic understatement | 5 minutes | 10 minutes |
| Permitted anchor-critical understatements beyond that limit | 0 | 0 |

The recommendations are deliberately stricter for walking availability because
all walking pairs are ordinary public central-London locations. Public
transport permits one unavailable result so one coverage exception does not
hide the quality of the other representative journeys.

The understatement limits are calibration gates, not recommended itinerary
buffers. A later planning policy must still decide what additional safety
buffer a hard anchor needs. The quality gate fails the whole proposed mode if
any route understates the independent reference beyond its limit. It also
records anchor-critical breaches separately.

Approval of these numbers would not approve a live run, a credential, or
activation. If Neil prefers different numbers, they must be changed and tested
in a separately reviewed commit rather than altered during evidence collection.

## 6. Evidence record

Each recorded sample must name one of the 24 scenario IDs and receives its mode
and anchor-critical classification from the immutable scenario definition. A
sample records only:

- scenario ID and `London, UK` region;
- walking or public-transport mode;
- absolute test timestamp;
- whether the provider found a route;
- provider duration in whole minutes when found;
- independent reference duration in whole minutes;
- reference class;
- a short non-secret reference description; and
- the scenario's fixed anchor-critical flag.

Permitted independent reference classes remain:

- published operator schedule;
- observed journey; or
- documented independent route review.

Unknown scenario IDs and substituted region, mode, or anchor classification are
rejected before assessment. The later evidence set must retain every
unavailable or unfavourable result and must not replace a failed scenario with
an easier journey.

No raw provider response, credential, token, personal coordinate, tester name,
or personal journey should enter the repository.

## 7. Proposed Private Alpha quota envelope

The first operating-envelope proposal is:

| Input | Proposal |
|---|---:|
| Invited testers | 10 |
| Explicit route checks per tester per day | 2 |
| Maximum adjacent legs per check | 6 |
| Base maximum provider requests | 120/day |
| Headroom | 25% = 30 requests/day |
| Proposed hard Google daily quota | **150 requests/day** |

The calculation is:

`10 testers × 2 checks × 6 legs = 120`

`120 + ceil(120 × 25%) = 150`

The framework rejects zero, fractional, negative, non-finite, or more-than-100%
headroom assumptions and always rounds fractional headroom upward.

This proposal is stored with `approvedByProductOwner: false`. No quota has been
configured. The separate one-off calibration exercise has a lower exact maximum
of 24 events and must not be treated as authority for a 150-request operating
quota.

## 8. Required later calibration procedure

A separately authorised Packet 155 must, before any call:

1. obtain Neil's explicit acceptance or amendment of the criteria and quota
   proposals;
2. name the exact weekday and weekend dates inside the provider's supported
   window;
3. confirm the public-place endpoints and entrances without substituting
   personal coordinates;
4. name the intended Google project and billing account;
5. configure the separate Routes-only key, hard quota, and billing alerts under
   the Packet 153 security controls;
6. keep the provider mode and candidate deploy unpublished until all
   preconditions are confirmed;
7. record the maximum of 24 one-shot provider events before starting;
8. collect the independent reference for the same scenario/date/time/mode;
9. retain failures, no-route results, and optimistic understatements; and
10. disable the provider mode immediately after the bounded exercise unless a
    separate authority explicitly requires it to remain available.

The quality assessment must use all 24 samples. It may report `passed`,
`failed`, or `insufficient_evidence`; it must not reinterpret a failed mode as
approved.

## 9. Decision states

Packet 154 produces three distinct decisions:

1. **Calibration design:** implemented and locally verified.
2. **Criteria and quota proposal:** awaiting explicit Product Owner acceptance.
3. **Live evidence and route activation:** NO-GO and not authorised.

Even if Neil accepts the proposals, live provider quality remains unknown until
the bounded evidence exercise occurs. Even if both modes later pass, mounting
the workflow and exposing it to Private Alpha users requires a further
mode-by-mode activation decision.

## 10. Verification coverage

Focused tests verify:

- 24 unique public-place scenarios split 12 walking/12 public transport;
- station, activity, hotel, fixed-venue, peak, off-peak, weekend, short-leg,
  and anchor-critical coverage;
- real weekday/weekend date validation;
- five batches, six-request maximum, 24-event ceiling, and no retry,
  alternatives, or matrix;
- arrival targets only on applicable public-transport scenarios;
- visibly unapproved criteria and quota proposals;
- explicit Product Owner approval required before criteria can become active;
- scenario-derived sample safety metadata and rejection of substitutions;
- all-scenario quality-gate assessment;
- exact quota calculation and rejection of unbounded inputs; and
- absence of network, credential, environment, or activation surfaces.

Full-suite and production-build results are recorded in `CURRENT_STATE.md`.

## 11. Repository handling

Packet 154 is a local code, test, and documentation packet. Its local commit
must include `[skip netlify]`. It must not be pushed, deployed, published, or
used to change Google Cloud, Firebase, credentials, Netlify variables, quotas,
billing, or the active journey without separate Product Owner authority.
