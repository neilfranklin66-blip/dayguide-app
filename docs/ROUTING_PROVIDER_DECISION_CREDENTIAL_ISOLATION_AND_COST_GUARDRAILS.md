# DayGuide - Routing Provider Decision, Credential Isolation, and Cost Guardrails

## 1. Record identity

- **Packet:** 152 - Routing Provider Decision, Credential Isolation, and Cost
  Guardrails
- **Implementation date:** 26 July 2026
- **Implementation agent:** Codex
- **Product Owner:** Neil Franklin
- **Implementation branch:**
  `packet-152-routing-provider-credential-cost-guardrails`
- **Baseline commit:** `0b7838621bbd9819c77e075b8c88310859e5301e`
- **Production change:** none
- **Google Cloud, credential, Netlify-variable, push, or deployment change:** none

The protected untracked `.claude/` and `Dayguide#2/` folders were not inspected,
listed, searched, opened, modified, moved, renamed, staged, or deleted. The
separate untracked `KNOWN_ISSUES` conflict copy was also left untouched.

## 2. Decision

DayGuide's selected first routing mechanism is:

**Google Routes API - Compute Routes - Essentials boundary**

This is an implementation decision for a future controlled pilot. It is not
approval to enable the API, create or change a key, add Netlify variables,
mount the workflow, push, publish, or deploy.

The selected operation is one `computeRoutes` request for each adjacent
Packet 151 leg. The initial boundary supports:

- walking;
- cycling;
- driving without traffic-aware routing; and
- public transport where Google has data for the requested region and time.

Packet 152 does not claim universal public-transport coverage. Walking and
cycling results are also subject to Google's beta warning requirement. Both
must be handled honestly before user-visible activation.

Traffic-unaware driving uses average, time-independent conditions rather than
current road conditions and can include temporarily closed roads. The adapter
can request that bounded result, but it must not be activated as conclusive
hard-anchor evidence until the Product Owner either accepts that limitation
with a suitable buffer rule or separately approves a traffic-aware SKU and its
higher cost.

## 3. Why this provider and operation

Google Compute Routes fits Packet 151 without reshaping DayGuide's model:

- it accepts an origin, destination, mode, and dated departure or transit
  arrival time;
- it supports the four modes already recognized by Packet 151;
- it can return only duration and distance through a field mask;
- DayGuide already uses a separately protected Google Places server boundary;
  and
- each adjacent leg has a direct, auditable billing unit.

Compute Route Matrix is deliberately rejected for this stage. Packet 151 needs
only adjacent pairs, while a matrix calculates a cross-product and Google bills
matrix use per element. Matrix use would add cost and unused answers without
improving anchor feasibility.

The first boundary also excludes:

- route alternatives;
- waypoint optimization;
- polylines, steps, instructions, fares, and transit detail;
- toll calculation;
- traffic-aware and traffic-aware-optimal routing;
- automatic retry;
- background refresh, prefetch, or autocomplete-triggered routing; and
- automatic provider fallback.

## 4. Alternatives considered

### Mapbox Directions

Mapbox had an attractive published Directions/Matrix free allowance and paid
unit price at the decision date. Its documented Directions profiles covered
driving, traffic-aware driving, walking, and cycling, but not public transport.
It therefore cannot be DayGuide's sole first provider. It may be reconsidered
later for a deliberately split road-mode strategy, but Packet 152 does not
approve a multi-provider design.

### HERE

HERE is a credible reserve option. It offers road, walking, cycling, and
separate Public Transit routing, including arrival-time and departure-time
queries. That separation would require two provider surfaces, a new account and
credential model, fresh commercial verification, and a second adapter at a
point when DayGuide already has a suitable Google boundary. It is not rejected
on capability; it is deferred to avoid unnecessary operational expansion.

### openrouteservice / self-hosted open routing

The official hosted openrouteservice profile list covers road, cycling,
walking, hiking, wheelchair, and heavy-vehicle routing, but not hosted public
transport as a standard profile. Supplying public transport through
self-hosting would add GTFS acquisition, updates, infrastructure, monitoring,
and coverage responsibility. That is disproportionate for the Private Alpha
and is not selected.

## 5. Credential isolation

The future routing credential has one exact server-only name:

`GOOGLE_ROUTES_API_KEY`

It must be a new key restricted to the Google Routes API only. It must never:

- reuse `GOOGLE_PLACES_API_KEY`;
- reuse or recreate a `REACT_APP_*` key;
- widen the existing Places-only key;
- enter the React bundle, request body, response body, URL, or application log;
  or
- become sufficient by itself to activate routing.

Activation also requires this exact separate server mode:

`DAYGUIDE_ROUTES_PROVIDER_MODE=google_routes_compute_routes_essentials`

The function stays disabled when that variable is absent, misspelled, set to
`true`, or set to any other value. A routing key without the exact mode makes
zero provider calls. A Places key without the routing key also makes zero
provider calls.

The client adapter calls only
`/.netlify/functions/routes-evidence`. It contains no Google host, key value,
server key name, Places key name, or `REACT_APP_*` fallback.

## 6. Cost guardrails

Packet 152 enforces provider-unit limits in tracked code:

| Guardrail | Enforced value |
|---|---:|
| Adjacent legs in one explicit check | maximum 6 |
| Google requests per accepted leg | exactly 1 |
| Returned routes used per leg | maximum 1 |
| Automatic retries | 0 |
| Alternatives | off |
| Matrix elements | 0 |
| Traffic-priced option | off |
| Response fields | duration and distance only |
| Provider-call timeout | 8 seconds |
| Netlify checks per domain/IP | 3 per 60 seconds |

The Google pricing page dated 20 July 2026 listed Compute Routes Essentials as
free for the first 10,000 monthly billable events and USD 5 per 1,000 for the
next usage tier. On that dated price, one DayGuide check uses zero to six
events; six events have a USD 0.03 marginal price at the first paid tier,
excluding tax and currency conversion. This is a dated planning comparison,
not a permanent price promise.

The Netlify code rule limits one IP/domain pair to three checks per minute, or
at most 18 provider requests per minute from that pair. It is not an absolute
whole-site budget because distributed clients have different IP addresses.
Google daily quotas are therefore a mandatory activation gate, not an optional
monitor.

The daily quota must be chosen from the approved Private Alpha population:

`invited testers × approved checks per tester per day × 6 legs + agreed headroom`

The Product Owner must approve the tester/check assumptions and the hard daily
quota before activation. Budget alerts are useful monitoring but do not replace
the hard quota.

## 7. Request, privacy, and response boundary

After activation, an explicit feasibility check would send:

1. from the browser to DayGuide's same-origin Netlify function:
   - adjacent-leg coordinates;
   - travel mode;
   - absolute departure time, or a public-transport arrival target; and
   - a non-personal leg identifier;
2. from the function to Google:
   - only those route inputs; and
3. back to the browser:
   - whole-minute duration;
   - distance in metres;
   - requested mode and leg identifier;
   - provider-evidence label; and
   - retrieval timestamp.

The adapter does not send names, addresses, activity descriptions, restaurant
details, email addresses, user identifiers, the routing key, or the whole
itinerary. It does not request a polyline, turn-by-turn instructions, transit
details, or fares. Tracked code does not cache or persist the request or
evidence.

Platform and provider processing still occurs. Google's current policies,
attribution, privacy, retention, and regional terms must be reviewed for the
intended billing account and rollout region before activation.

## 8. Date, time, and evidence rules

Packet 152 converts Packet 151's local date-time plus IANA timezone into an
absolute instant. It refuses:

- malformed dates or times;
- nonexistent local times during a daylight-saving clock jump; and
- ambiguous local times during a daylight-saving repeated hour.

For a leg constrained by a fixed anchor, transit uses the fixed arrival target
and does not also send departure time. Other legs use their calculated
departure. This preserves Packet 151's fixed-target meaning.

Google currently limits transit request times to a documented historical and
future window. Out-of-window or regionally unavailable transit is an honest
evidence failure, never a reason to invent a duration.

Route evidence is valid only for the explicit assessment that retrieved it. A
changed date, time, place, anchor, mode, or itinerary requires another explicit
check. Packet 152 adds no persistence or silent reuse.

## 9. Failure and fallback behaviour

The boundaries reduce provider outcomes to stable disabled, denied, quota,
network, invalid-response, partial, zero-route, or success states. Raw provider
or infrastructure messages are not returned.

There is:

- no automatic retry;
- no automatic switch to a different provider;
- no substitution of the current heuristic transport estimate;
- no movement of a hard anchor;
- no claim that a partial or missing route proves feasibility; and
- no continuation around Packet 151's evidence-required gate.

One absent leg therefore blocks a provable fixed plan rather than hiding a
failure.

## 10. Activation gate

Routing must remain disabled until a separately authorized packet completes
and verifies all of the following:

1. the intended Google Cloud project and billing account are named;
2. Routes API is enabled without changing the Places-only key;
3. a new `GOOGLE_ROUTES_API_KEY` exists and is restricted to Routes API only;
4. the key is stored server-side and absent from browser assets and logs;
5. authenticated-app caller verification is added to the proxy;
6. the Product Owner approves invited-tester and checks-per-day assumptions;
7. a hard Google daily quota is applied from that approved envelope;
8. billing alerts and a named monitoring/stop procedure exist;
9. Netlify confirms the three-per-minute code rate rule in the deploy log;
10. attribution, public terms/privacy links, regional terms, and mandatory
    walking/cycling warnings are implemented where applicable;
11. transit coverage and date-window behaviour are tested in the first target
    region;
12. driving hard-anchor treatment is explicitly decided: accepted
    traffic-unaware evidence plus a buffer rule, or a separately costed
    traffic-aware design;
13. provider mode is set last, only in the approved deploy context;
14. a bounded real request proves duration/distance and no key exposure; and
15. publishing remains deliberate and rollback remains the previously locked
    production deploy.

Until then, the correct provider status is **selected, scaffolded, and
disabled**.

## 11. Implementation

Packet 152 adds:

- `src/routing/routingProviderPolicy.js` - dated-time conversion, request
  validation, six-leg cost envelope, and explicit Essentials policy;
- `src/api/routeEvidenceApi.js` - same-origin client adapter with stable failure
  mapping;
- `netlify/functions/routes-evidence.js` - disabled-by-default server adapter,
  distinct credential, minimal Google request, one-shot fan-out, sanitized
  evidence, timeout, and Netlify per-IP/domain rate limit; and
- focused policy, client, server, credential, cost, time, and failure tests.

The adapter is not imported by `DayGuide.jsx` or mounted in the current
journey. No billable call is possible in the repository's current default
configuration.

## 12. Validation

Focused Packet 152 validation passed:

- **4 test suites**;
- **37 tests**;
- zero failed tests; and
- zero snapshots.

The complete regression suite passed **51 suites and 1,066 tests**, with zero
failures and zero snapshots.

The production build compiled successfully. The active main bundle remained
`main.a1cd6b13.js` at `229.38 kB` gzipped, confirming that the unmounted client
policy and adapter do not enter the current application bundle. The Netlify
function will not exist in production unless a later authorized push and
deployment occurs, and it remains disabled without the exact provider mode
even after such a deployment.

## 13. Official decision sources

Sources were checked on 26 July 2026:

- Google Routes API overview:
  https://developers.google.com/maps/documentation/routes
- Google Compute Routes request/reference:
  https://developers.google.com/maps/documentation/routes/compute_route_directions
  and
  https://developers.google.com/maps/documentation/routes/reference/rest/v2/TopLevel/computeRoutes
- Google Routes usage and billing:
  https://developers.google.com/maps/documentation/routes/usage-and-billing
- Google Maps Platform pricing:
  https://developers.google.com/maps/billing-and-pricing/pricing
- Google API security guidance:
  https://developers.google.com/maps/api-security-best-practices
- Google transit routes, vehicle modes, and limitations:
  https://developers.google.com/maps/documentation/routes/transit-route and
  https://developers.google.com/maps/documentation/routes/vehicles
- Google Routes policies and attribution:
  https://developers.google.com/maps/documentation/routes/policies
- Netlify code-based rate limiting:
  https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/
- Mapbox Directions profiles and pricing:
  https://docs.mapbox.com/api/navigation/directions/ and
  https://www.mapbox.com/pricing
- HERE road and Public Transit routing:
  https://docs.here.com/routing/docs/routing-v8-intro and
  https://docs.here.com/transit/docs/readme-public-transit-api-v8
- openrouteservice hosted services:
  https://openrouteservice.org/services/

Provider terms, features, coverage, and prices change. They must be rechecked
at activation, not assumed from this dated decision.

## 14. Repository and deployment handling

Packet 152 is a local code, test, and documentation packet. Its local commit
must include `[skip netlify]`. It must not be pushed, deployed, published, or
used to change Google Cloud, credentials, Netlify variables, quotas, billing,
or the active journey without separate Product Owner authority.
