# Packet 153 — Routing Pre-Activation Security and Evidence-Quality Gate

## 1. Authority, boundary, and result

- **Product Owner:** Neil Franklin
- **Implementation agent:** Codex
- **Date:** 27 July 2026
- **Branch:** `packet-153-routing-preactivation-security-evidence-quality-gate`
- **Baseline commit:** `272d3f9e6a06fcf147f5ab66f6d3b044676da0f2`
- **Production, provider, credential, quota, Netlify, push, or deployment
  change:** none

Packet 153 closes the repository-side authenticated-caller gap identified by
Packet 152 and adds a measurable route-evidence quality gate. It also defines
the hard quota/stop procedure, the current Legacy Places migration trigger, and
the routing-specific checks that must extend the established Packet 141
deployment controls.

This is still a **NO-GO for routing activation**. The routing workflow remains
unmounted, the provider mode remains disabled by default, and no routing key,
API, environment variable, daily quota, billing alert, or live evidence
exercise has been created or changed.

The protected untracked `.claude/` and `Dayguide#2/` folders were not inspected,
listed, searched, opened, modified, moved, renamed, staged, or deleted. The
separate untracked `KNOWN_ISSUES` conflict copy was also left untouched.

## 2. Authenticated routing boundary

The future call sequence is now:

1. an already signed-in Firebase user explicitly requests a route check;
2. the browser obtains that user's current Firebase ID token;
3. the client sends the token only in the HTTPS `Authorization: Bearer` header
   to DayGuide's same-origin `routes-evidence` function;
4. the function verifies the token against Google's published Firebase signing
   certificates for exact project `dayguide-541ee`; and
5. only after successful authentication and request validation can the function
   read the separate routing key and call Google Routes.

The server verifies the required Firebase token properties:

- RSA-SHA256 algorithm and a named Google signing-certificate key;
- cryptographic signature;
- audience `dayguide-541ee`;
- issuer `https://securetoken.google.com/dayguide-541ee`;
- non-empty Firebase user ID with the documented maximum length;
- unexpired token, non-future issue time, and non-future authentication time;
  and
- a non-empty Firebase sign-in provider.

Google's public certificates are cached only for their published cache lifetime.
A missing, malformed, expired, forged, wrong-project, or wrong-issuer token is
rejected before routing-key access or a billable call. If the public
certificates cannot be retrieved or parsed, the function fails closed with
`AUTH_UNAVAILABLE`; it does not fall back to unauthenticated operation.

No Firebase service-account private key is introduced. The user ID and sign-in
provider are used only as the verified in-memory caller result; neither is
returned in route evidence. The ID token is not placed in the request body,
URL, application persistence, or response. Firebase ID-token revocation is not
checked by this boundary; its remaining exposure is limited by the token's
signed expiry. A future requirement for immediate server-side revocation would
need a separately approved Firebase Admin/service-account design.

When the exact provider mode is absent, the function returns `DISABLED` before
token-certificate retrieval, routing-key access, or provider access. The
repository default therefore still makes no authentication-network or billable
routing call.

## 3. Evidence-quality gate

`src/routing/routeEvidenceQualityGate.js` creates a provider-independent,
testable decision boundary. It cannot report `passed` unless the Product Owner
has first approved:

- the modes being assessed;
- a maximum evidence age;
- a minimum sample count for each mode;
- a minimum provider-route availability rate for each mode;
- the greatest permitted optimistic duration understatement; and
- the number of permitted anchor-critical understatements.

No threshold is silently supplied by the application. Missing, malformed,
future-approved, stale, future-dated, contradictory, or duplicate evidence
cannot make the gate pass.

For each approved travel mode, the gate reports the fresh sample count,
route-found count, availability rate, maximum optimistic understatement, and
anchor-critical understatement count. Optimistic understatement means:

`independent reference duration − provider duration`

This is the safety-relevant direction for a hard anchor: a route prediction
that is longer than the reference is inconvenient, while a prediction that is
too short can make DayGuide falsely claim that a fixed commitment is feasible.

The four possible results are:

| Result | Meaning |
|---|---|
| `not_assessed` | Product-Owner-approved criteria do not yet exist |
| `insufficient_evidence` | Approved criteria exist but fresh sample coverage is incomplete |
| `failed` | Enough evidence exists and at least one approved quality threshold fails |
| `passed` | Every approved mode satisfies every approved threshold |

The quality gate is an internal foundation and is not mounted in the current
journey.

## 4. Required evidence exercise

Before any travel mode can be activated, a separately authorised, bounded
exercise must:

1. name the target region and intended Private Alpha population;
2. use public places rather than a tester's home, live GPS trail, or other
   personal location;
3. cover representative station, venue, hotel, and address pairs;
4. include short and longer legs, peak and off-peak times, available and
   unavailable routes, and anchor-critical cases;
5. record the provider result at the same mode, date, time, and place pair as
   an independent reference;
6. use an operator schedule, observed journey, or documented independent route
   review as the reference class;
7. record the reference source without copying a credential, personal
   coordinate, or raw provider response into the repository;
8. evaluate only evidence inside the Product-Owner-approved freshness window;
   and
9. retain failures and no-route results rather than sampling only successes.

Transit must receive its own quality spike because coverage and timetable
behaviour vary by place and date. Walking, cycling, and driving must also be
assessed separately before they can prove a hard anchor. Packet 152's
traffic-unaware driving result remains non-conclusive for hard anchors until
the Product Owner explicitly accepts that limitation or a separately approved
traffic-aware design replaces it.

The exercise has not occurred in Packet 153, and Packet 153 makes no claim about
provider quality in London or any other region.

## 5. Hard daily quota and stop procedure

Packet 152's approved cost-envelope formula remains:

`invited testers × approved checks per tester per day × 6 legs + agreed headroom`

Before activation, the Product Owner must approve each input and the resulting
whole-number Google daily quota. The quota must be configured as a hard daily
service limit. A Cloud Billing budget or alert is monitoring only: Google
documents that budgets do not cap usage or spending. It cannot substitute for
the service quota.

Reaching the provider quota must produce an honest unavailable/quota state. It
must not trigger retries, another provider, a matrix, an approximation presented
as live evidence, or removal of hard-anchor protection.

The named stop procedure is:

1. **Stop:** remove or change the exact
   `DAYGUIDE_ROUTES_PROVIDER_MODE` value so the function returns `DISABLED`.
2. **Contain:** keep publishing locked and do not publish another candidate
   while the incident is unresolved.
3. **Restrict:** if misuse or unexpected spend is suspected, reduce the Routes
   API quota or disable/restrict the separate routing key without changing the
   Places-only key.
4. **Inspect safely:** review counts, response classes, dates, and deployment
   provenance without displaying or copying any credential or personal
   coordinate.
5. **Record:** document the trigger, action time, affected commit/deploy, and
   recovery decision.
6. **Restart only by authority:** restore the exact provider mode only after a
   separately authorised review confirms the cause, hard quota, evidence
   quality, and deployment state.

This procedure is defined but has not been exercised against live routing.

## 6. Legacy Places status and migration trigger

The existing `places-resolve` function uses Google's Find Place Legacy endpoint.
Google's current lifecycle documentation says existing projects can continue
using Legacy Places services, gives no shutdown date, and promises at least
twelve months' notice before discontinuation. Text Search (New) is the stated
replacement for Find Place Legacy.

This is a monitored dependency risk, not evidence of a current credential or
production failure. Migration becomes a separately authorised requirement at
the earliest of:

- an official deprecation or shutdown notice applicable to the endpoint;
- the API becoming unavailable or impossible to restore in DayGuide's project;
- repeated verified provider failure attributable to the Legacy endpoint;
- a security, terms, policy, or required-capability change that the Legacy
  endpoint cannot satisfy; or
- preparation for a wider-than-Private-Alpha release, when the migration cost
  and response differences must be reviewed deliberately.

Migration must compare request/response fields, result ranking, attribution,
billing category, quotas, key restrictions, tests, and rollback. It must not be
combined casually with routing activation, and it must not widen or reuse the
future routing key.

## 7. Routing-specific deployment checklist

This checklist extends rather than replaces
`CONTROLLED_TRACEABLE_DEPLOYMENT_PREPARATION.md` and the repository's normal
review and handover controls.

### Before a candidate build

- [ ] A separate packet explicitly authorises the exact activation scope.
- [ ] The approved commit and retained rollback deploy are named.
- [ ] Full tests, production build, and diff checks pass.
- [ ] The intended Google project and billing account are confirmed.
- [ ] A new Routes-only `GOOGLE_ROUTES_API_KEY` exists; the Places key is
      unchanged and remains Places-only.
- [ ] The Product Owner has approved tester/check/headroom assumptions and the
      calculated hard daily quota.
- [ ] The hard daily quota and billing alerts are visibly configured.
- [ ] The evidence-quality gate reports `passed` for every mode to be enabled.
- [ ] Attribution, privacy/terms links, and required walking/cycling warnings
      are implemented for the intended surface.
- [ ] The exact provider mode is still absent while the candidate is prepared.

### Candidate inspection while unpublished and locked

- [ ] Netlify identifies the approved Git commit and Node major.
- [ ] `routes-evidence` is packaged with the existing Places functions.
- [ ] The deploy log confirms the three-checks-per-minute IP/domain rule.
- [ ] No route key name/value or Firebase ID token appears in the public bundle,
      URL, response, logs, or captured evidence.
- [ ] Disabled, missing-token, expired/forged-token, certificate-outage,
      malformed-request, rate-limit, and provider-quota paths fail closed and
      make no unintended paid call.
- [ ] One explicitly authorised public-coordinate proof uses no more provider
      calls than its pre-recorded maximum and returns only sanitised evidence.
- [ ] Changed date, time, mode, place, anchor, or itinerary invalidates prior
      route evidence.

### Publication and rollback

- [ ] The candidate remains unpublished until the Product Owner reviews all
      evidence and explicitly says to publish.
- [ ] Publication remains locked to the deliberately selected deploy.
- [ ] The stop procedure and named operator are available during the check.
- [ ] Any failed check is NO-GO; disable the mode and retain the prior
      production deploy.

## 8. Activation status

Repository-side authenticated caller verification is now **implemented and
locally tested**, closing item 5 of Packet 152's activation gate at source level.
The overall activation decision remains **NO-GO** because at least these items
remain external or incomplete:

- no Routes API/key/provider mode is configured;
- no Product-Owner-approved daily envelope or hard quota exists;
- no billing alert or exercised stop procedure exists;
- no Product-Owner-approved quality criteria or live evidence set exists;
- no mode has passed the evidence-quality gate;
- no user-visible attribution/privacy/warning work is mounted;
- no routing-specific candidate deploy has been inspected; and
- the planning workflow remains disconnected from `DayGuide.jsx`.

Packet 153 does not authorise completing any of those items.

## 9. Verification coverage

Focused tests cover:

- token acquisition and same-origin authorised client requests;
- no-token and token-acquisition failure before a network call;
- disabled mode before certificate or provider access;
- signed Firebase token audience, issuer, expiry, issue time, algorithm,
  sign-in provider, and signature rejection;
- public-certificate failure and cache behaviour;
- authentication before request, key, and paid-provider processing;
- retained six-leg, separate-key, rate, timeout, minimal-field, no-retry,
  no-alternative, no-matrix, and traffic-unaware-driving controls;
- stable access, quota, network, no-route, partial, and invalid-response states;
  and
- evidence criteria approval, freshness, sample sufficiency, availability,
  optimistic understatement, anchor-critical failures, and all-mode pass
  behaviour.

Full-suite and production-build results are recorded in `CURRENT_STATE.md`.

## 10. Official sources

Sources checked on 27 July 2026:

- Firebase ID-token verification:
  https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Google Routes usage, billing, and quotas:
  https://developers.google.com/maps/documentation/routes/usage-and-billing
- Google Cloud Billing budgets:
  https://docs.cloud.google.com/billing/docs/how-to/budgets
- Google Maps Platform Legacy lifecycle:
  https://developers.google.com/maps/legacy
- Places API Legacy overview and migrations:
  https://developers.google.com/maps/documentation/places/web-service/legacy/overview-legacy

Provider terms, quotas, lifecycle, and product behaviour can change. They must
be rechecked at activation.

## 11. Repository handling

Packet 153 is a local code, test, and documentation packet. Its local commit
must include `[skip netlify]`. It must not be pushed, deployed, published, or
used to change Google Cloud, Firebase, credentials, Netlify variables, quotas,
billing, or the active journey without separate Product Owner authority.
