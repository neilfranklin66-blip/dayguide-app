# Packet 165 - Google Routes Premium-Trial Design and Safety Gate

**Date:** 31 July 2026

**Status:** Design complete; no live trial, provider activation, credential, or
production change authorised

## 1. Authority and boundary

The Product Owner authorised Packet 165 to design a future Google Routes
premium-trial and safety gate after the Packet 155 calibration failure. This is
a documentation-only decision-preparation packet.

It does **not** authorise a Google Routes request, API enablement, key creation
or restoration, quota or budget change, Netlify environment change, product-code
change, push, deployment, production publication, billing integration, or
premium sale.

Permitted Git scope is one local documentation commit only. Opening a pull
request, merging, pushing, or deleting branches requires later authority.

The protected untracked `.claude/`, `Dayguide#2/`, and
`docs/KNOWN_ISSUES (# Edit conflict 2026-07-26 1mdrfiC #).md` paths are outside
inspection and change scope.

## 2. Starting evidence and non-negotiable safety position

Packet 155 made exactly 24 controlled Google Routes requests and compared them
with independent TfL evidence. Both accepted modes failed:

| Mode | Approved maximum optimistic understatement | Observed maximum | Anchor-critical breach | Result |
|---|---:|---:|---:|---|
| Walking | 5 minutes | 11 minutes | Yes | FAIL |
| Public transport | 10 minutes | 16 minutes | No | FAIL |

Google Routes therefore remains disabled. It must not presently decide whether a
hard anchor is feasible, cause an itinerary to claim an arrival is safe, or
replace the existing honest unverified-route warning and key-free Maps handoff.

Packet 165 does not reinterpret successful route availability as a safety pass.
It preserves the Packet 155 result and treats a premium offering as a possible
future enhancement, not a current capability.

## 3. Product hypothesis and boundary

The possible premium enhancement is an opt-in **Route Confidence Preview**:
bounded, server-calculated travel evidence shown separately from core planning.
Its value proposition is clearer decision support around fixed commitments, not
a guarantee of arrival or a promise of perfect travel times.

Basic DayGuide planning must remain available without a paid route check. A
premium entitlement must be verified server-side before any provider request;
a client-side button, plan flag, or hidden interface alone is not an adequate
access or cost boundary.

No price, free allowance, payment provider, entitlement model, customer
eligibility, retention period, or commercial claim is approved by this packet.

## 4. Proposed staged trial - not yet approved for execution

### Stage A - closed, opt-in evidence trial

A later authority may permit a small named cohort, initially no more than ten
invited testers. They may explicitly request no more than two route-confidence
checks per tester per day, with no more than six adjacent legs per check.

This reuses the bounded operational envelope:

`10 testers x 2 checks x 6 legs = 120 Compute Routes requests/day`

A 25% operational headroom gives a proposed **150-request daily hard cap**.
The cap is a maximum, not a usage target. Compute Route Matrix, automatic
retries, alternatives, and background refreshes remain prohibited.

During Stage A, results may be observed and compared, but they must not alter
anchor feasibility, reorder the itinerary, or assert a safe arrival. Any
user-visible result must say it is experimental and route-unverified until a
separate safety decision permits stronger wording.

### Stage B - limited premium experience

Only after Stage A meets the gate in section 6 may a later packet propose a
larger opt-in premium experience. It must still use explicit user-triggered
checks, server-side entitlement enforcement, a per-user allowance, a project
daily cap, and a visible no-guarantee boundary.

Packet 165 does not approve Stage A or Stage B. Each stage needs its own Product
Owner authority, exact cohort/date/rate limits, operational credential plan,
and no-go rollback condition.

## 5. Cost model and cost controls

The current global Google Maps Platform list, checked on 31 July 2026, gives
Compute Routes Essentials 10,000 free monthly requests, then USD 5.00 per
1,000 requests through 100,000 monthly requests. It is billed per Compute
Routes request; DayGuide's one route-confidence check can use up to six such
requests.

Illustrative calculation only:

| Monthly pattern for 1,000 users | Requests | Illustrative Essentials charge |
|---|---:|---:|
| One six-leg check each | 6,000 | USD 0 |
| Two six-leg checks each | 12,000 | USD 10 |
| Ten six-leg checks each | 60,000 | USD 250 |
| Two six-leg checks each day for 30 days | 360,000 | about USD 1,490 |

The final example applies the published global graduated prices: 10,000 free,
90,000 at USD 5.00 per thousand, and 260,000 at USD 4.00 per thousand. These
are route-service charges only; they exclude Places, Firebase, hosting,
payments, support, taxes, exchange rates, and higher-tier Routes features.

The initial ten-tester 150-request daily maximum would be at most 4,500
requests in a 30-day month, below the current free monthly cap if the project
has no other billable Essentials Routes usage. A Google Cloud budget remains
alerting only; it is not a spend cap. A future execution packet must therefore
combine a separate Routes-only credential, hard Google quota, server-side
per-user limit, no-retry rule, and usage monitoring.

## 6. Mandatory gate before any user-facing premium claim

A later trial cannot proceed merely because it is technically deployable or
because a price point appears viable. Before even a limited user-facing premium
claim, the Product Owner must receive and explicitly accept evidence for all of
the following:

1. a redesigned route-estimate policy, including conservative padding and
   wording for each mode;
2. a fresh independent calibration with representative anchor-critical
   walking and public-transport scenarios;
3. a mode-by-mode pass against pre-approved availability, understatement, and
   anchor-critical thresholds;
4. server-side entitlement and cost enforcement design;
5. an opt-in, consent, privacy, retention, support, and incident-response plan;
6. a separate Routes-only credential, quota, budget-monitoring, and shutdown
   plan; and
7. explicit limits on cohort size, checks, legs, dates, and total provider
   events.

A safety pass may permit only the exact mode, locale, and wording evidenced. It
does not automatically approve new modes, route matrices, traffic-aware
features, other countries, or general availability.

## 7. Trial stop conditions and rollback

Any future live exercise must stop immediately and retain honest evidence if it
encounters a provider/authentication/quota/rate failure, a route that exceeds
the approved optimistic-understatement boundary, an anchor-critical breach, a
cost-control failure, a privacy/entitlement failure, or customer confusion
about the experimental status.

Shutdown must remove the provider mode and trial credential from every
non-production context, revoke the separate key, confirm production has no
Routes key or provider mode, and retain only sanitised aggregate evidence.
Existing production must remain locked unless another specific promotion is
authorised.

## 8. Product Owner decisions still required

Packet 165 deliberately leaves these decisions unresolved:

- whether a revised padding policy can make either failed mode safe enough to
  trial;
- the independent evidence method, cohort, geography, and test dates;
- premium price, allowance, payment and entitlement architecture;
- consumer wording, support, accessibility, privacy, tax, and legal readiness;
- whether the trial should ever show user-visible results before a full safety
  pass; and
- any external key, quota, budget, provider, Netlify, or production action.

## 9. Validation and sources

This packet was validated as a documentation-only change: cross-references,
packet numbers, status terminology, cost arithmetic, changed-path scope, and
Markdown whitespace must be checked before commit. Application tests and a
production build are not evidence-generating requirements for this design-only
packet.

Current official sources checked on 31 July 2026:

- Google Maps Platform core-services pricing:
  https://developers.google.com/maps/billing-and-pricing/pricing
- Google Maps Platform SKU details:
  https://developers.google.com/maps/billing-and-pricing/sku-details
- Google Maps Platform cost-management guidance:
  https://developers.google.com/maps/billing-and-pricing/manage-costs
- Packet 155 controlled live calibration:
  [`PACKET155_CONTROLLED_ROUTES_LIVE_CALIBRATION.md`](PACKET155_CONTROLLED_ROUTES_LIVE_CALIBRATION.md)
- Packet 152 routing decision and guardrails:
  [`ROUTING_PROVIDER_DECISION_CREDENTIAL_ISOLATION_AND_COST_GUARDRAILS.md`](ROUTING_PROVIDER_DECISION_CREDENTIAL_ISOLATION_AND_COST_GUARDRAILS.md)
