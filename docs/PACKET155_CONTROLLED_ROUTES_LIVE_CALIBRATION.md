# Packet 155 — Controlled Routes Credential, Quota, and Live Calibration

## 1. Authority and interpretation

- **Product Owner:** Neil Franklin
- **Implementation agent:** Codex
- **Authority received:** `Implement Packet 155`
- **Approval recorded:** 27 July 2026 at 10:54:09 Europe/London
- **Branch:** `packet-155-controlled-routes-credential-quota-live-evidence`
- **Baseline commit:** `ef2b4944d39e2156461b8053cdaec60b2c6d9474`
- **Production publication:** prohibited

Neil reviewed the detailed explanation of Packet 154's scenario set, quality
thresholds, and quota calculation, described it as thorough and interesting,
and then instructed Codex to implement Packet 155. Packet 155 records that
instruction as explicit acceptance of the Packet 154 walking/public-transport
criteria and the 150-request Private Alpha daily envelope.

This approval authorises the controlled Packet 155 setup and evidence exercise.
It does not authorise production publication or mounting the geographical
workflow for users.

The protected untracked `.claude/` and `Dayguide#2/` folders must not be
inspected, listed, searched, opened, modified, moved, renamed, staged, or
deleted. The separate untracked `KNOWN_ISSUES` conflict copy must remain
untouched.

## 2. Approved criteria and dates

The approved criteria are:

| Criterion | Walking | Public transport |
|---|---:|---:|
| Samples | 12 | 12 |
| Maximum evidence age | 7 days | 7 days |
| Minimum availability | 100% | 90% (at least 11/12) |
| Maximum optimistic understatement | 5 minutes | 10 minutes |
| Anchor-critical breaches beyond the limit | 0 | 0 |

The approved calibration journey dates are:

- **weekday:** Tuesday 28 July 2026; and
- **weekend:** Saturday 1 August 2026.

Both are inside Google's currently documented transit window of seven days in
the past through 100 days in the future.

Driving and cycling remain excluded. A pass for walking does not approve public
transport, and a pass for public transport does not approve walking.

## 3. Approved cost boundaries

The one-off calibration ceiling is:

- 24 named scenarios;
- exactly one Compute Routes request per scenario;
- five batches;
- maximum six requests per batch;
- zero automatic retries;
- zero alternatives; and
- zero matrix elements.

The approved later Private Alpha envelope is:

`10 testers × 2 explicit checks × 6 legs + 25% headroom = 150 requests/day`

The 150-request daily value is a hard service quota proposal, not permission to
make 150 requests during calibration. Packet 155's evidence exercise remains
limited to 24.

## 4. Current official control position

Google's Routes documentation checked on 27 July 2026 confirms:

- Compute Routes Essentials is billed per request;
- Compute Route Matrix is billed per element and remains excluded;
- the normal provider rate limit is much higher than DayGuide's own controls;
- when a project reaches a configured quota, the service stops responding; and
- daily quota values can be changed in Google Maps Platform > Quotas.

Google Cloud Billing documentation confirms that a budget generates alerts but
does not cap usage or spending. Packet 155 therefore requires both:

1. the 150-request hard Routes quota; and
2. a project-scoped monitoring budget.

The first monitoring proposal is a **GBP 5 monthly project budget** with actual
spend alerts at 50%, 90%, and 100%. If the linked billing account is not in GBP,
the operation must stop before creating the budget so Neil can approve the
displayed-currency equivalent. The budget is monitoring only.

Google's key-security guidance recommends separate keys, API restrictions, and
IP restrictions for server-side web services. The Netlify Functions boundary
does not have a verified fixed outbound IP in this packet. The calibration key
must therefore be:

- separate from the Places key;
- restricted to Routes API only;
- stored as a secret only in the deploy-preview context;
- protected by Firebase caller verification, Netlify rate limiting, and the
  hard Google daily quota;
- used only for this short evidence exercise; and
- deleted immediately after the exercise.

The absence of an IP application restriction is accepted only for this
temporary, 24-event calibration. It is not approval for a persistent Private
Alpha credential.

## 5. Selected Google and Netlify boundaries

The intended Google Cloud project is the existing Maps billing project already
used by DayGuide Places:

- **Project name:** `My First Project`
- **Project ID:** `project-7e314c31-0522-4f34-ab8`
- **Organisation:** `neilfranklin66-org`

The existing Places key must remain unchanged and Places-only.

The Netlify candidate uses the existing project:

- **Project:** `ubiquitous-melomakarona-874d9c`
- **Project ID:** `9df12298-e795-42f0-9c00-3ff464f8b41e`
- **Production URL:** `https://ubiquitous-melomakarona-874d9c.netlify.app`
- **Production state:** published and locked

Only a CLI draft deploy with `deploy-preview` context and an unpublishable
preview URL may be used. The production URL is rejected by the runner.

## 6. Local operator runner

Packet 155 adds `npm run packet155:calibrate`. The runner:

- imports the exact approved 24-scenario plan;
- requires the exact acknowledgement
  `PACKET155_MAXIMUM_24_PROVIDER_EVENTS_APPROVED`;
- accepts only an HTTPS `*.netlify.app` preview origin;
- explicitly rejects DayGuide's canonical production origin;
- accepts one to three unique batch indexes per invocation;
- signs in as a temporary Firebase guest;
- obtains a short-lived Firebase ID token without printing or storing it;
- sends batches sequentially to the same-origin preview function;
- performs no retry;
- stops immediately on authentication, provider, quota, rate, network, or
  malformed-response failure;
- prints only sanitised scenario, mode, duration, distance, and observation
  evidence; and
- attempts to delete the temporary Firebase identity at completion.

The exercise is split into two invocations to remain below the existing
three-checks-per-minute Netlify rule:

- phase one: batch indexes `0,1,2`; and
- phase two, after the rate window has cleared: batch indexes `3,4`.

The runner does not receive or read the Google Routes key. The key exists only
inside the unpublished Netlify function environment.

## 7. External setup sequence

No provider request may occur until every setup item is visibly confirmed.

### Google Cloud

- [x] Confirm project `project-7e314c31-0522-4f34-ab8`.
- [x] Record the linked billing-account name and currency without copying
      payment information.
- [x] Enable Routes API without changing Places API or the Places key.
- [x] Set the hard Routes daily quota to 150.
- [x] Create the project-scoped GBP 5 monthly budget with 50%, 90%, and 100%
      actual-spend alerts, or stop if the account currency is not GBP.
- [x] Create `DayGuide Netlify Routes Calibration Key`.
- [x] Restrict the key to Routes API only.
- [x] Leave application restriction unset only under the temporary calibration
      exception in section 4.

### Netlify deploy-preview context

- [x] Add secret `GOOGLE_ROUTES_API_KEY` only for Deploy Previews.
- [x] Add
      `DAYGUIDE_ROUTES_PROVIDER_MODE=google_routes_compute_routes_essentials`
      only for Deploy Previews.
- [x] Keep Production values absent.
- [x] Create a genuine GitHub PR Deploy Preview for the exact Packet 155
      preparation branch.
- [x] Confirm the preview identifies the exact Packet 155 preparation commit,
      contains all four functions, and remains unpublished.
- [x] Confirm the public bundle contains neither Google routing key nor secret
      value.
- [x] Confirm missing authentication fails before a provider call.

## 8. Evidence sequence

After setup:

1. record provider usage as zero or the known pre-existing value;
2. run phase one once;
3. retain its sanitised output even if unfavourable;
4. wait for the Netlify rate window to clear;
5. run phase two once;
6. retain all unavailable and partial results;
7. collect independent references for the same public place, date, time, and
   mode;
8. build one sample for each of the 24 scenario IDs;
9. run the approved Packet 153 quality assessment; and
10. record walking and public transport as separate PASS, FAIL, or INSUFFICIENT
    decisions.

TfL's journey planner or published operator schedule is the preferred
public-transport reference. Walking references must be a documented independent
route review and must not be another display of the same Google route.

## 9. Mandatory shutdown

Whether the evidence passes or fails:

1. remove the deploy-preview provider-mode value;
2. remove the deploy-preview routing-key value;
3. delete `DayGuide Netlify Routes Calibration Key`;
4. delete or make inaccessible the draft deploy;
5. verify the Places key remains unchanged;
6. confirm canonical production still points to its locked prior deploy; and
7. record final Google usage and any cost without exposing account or payment
   details.

Deleting the Google key is mandatory because a Netlify deploy retains the
environment values captured when it was built. Removing the current Netlify
variable alone does not rewrite an old draft function.

## 10. Live evidence and decision

The controlled exercise ran on 27 July 2026. It produced exactly 24 provider
events, one for each approved scenario, in the approved five batches. All 24
returned a route. There were no automatic retries, alternatives, or matrix
requests.

The independent comparison used the official Transport for London Journey
Planner API. It made one reference request for each scenario; all 24 returned
usable evidence with no retry. Walking references used walking mode. Public
transport references used TfL's bus, Tube, Overground, DLR, Elizabeth line,
National Rail, and tram modes. Anchor scenarios used arrival-time evidence.

`Reference minus Google` is the optimistic understatement. A positive value
means Google allowed less time than the independent reference.

| Scenario | Mode | Google | TfL | Difference | Anchor critical |
|---|---|---:|---:|---:|---|
| walk-euston-british-museum | Walking | 22 | 22 | 0 | No |
| walk-british-museum-royal-opera | Walking | 12 | 15 | 3 | Yes |
| walk-waterloo-southbank | Walking | 5 | 10 | 5 | Yes |
| walk-southbank-tate-modern | Walking | 19 | 18 | -1 | No |
| walk-tate-globe | Walking | 6 | 5 | -1 | No |
| walk-globe-london-bridge | Walking | 16 | 16 | 0 | Yes |
| walk-london-bridge-tower | Walking | 22 | 20 | -2 | No |
| walk-southwark-station-hotel | Walking | 8 | 8 | 0 | No |
| walk-national-gallery-victoria | Walking | 31 | 38 | 7 | Yes |
| walk-st-pancras-british-library | Walking | 8 | 8 | 0 | No |
| walk-barbican-st-pauls | Walking | 16 | 17 | 1 | No |
| walk-natural-history-v-and-a | Walking | 5 | 16 | 11 | No |
| transit-euston-southwark | Public transport | 20 | 31 | 11 | No |
| transit-st-pancras-london-bridge | Public transport | 21 | 31 | 10 | No |
| transit-victoria-national-theatre | Public transport | 22 | 26 | 4 | Yes |
| transit-london-bridge-royal-opera | Public transport | 34 | 29 | -5 | Yes |
| transit-natural-history-barbican | Public transport | 48 | 53 | 5 | Yes |
| transit-tower-euston | Public transport | 32 | 39 | 7 | No |
| transit-euston-southwark-hotel | Public transport | 28 | 37 | 9 | No |
| transit-british-museum-natural-history | Public transport | 32 | 48 | 16 | No |
| transit-waterloo-barbican | Public transport | 40 | 32 | -8 | No |
| transit-national-gallery-tower | Public transport | 28 | 35 | 7 | No |
| transit-st-pancras-national-theatre-weekend | Public transport | 26 | 28 | 2 | No |
| transit-victoria-tate-weekend | Public transport | 23 | 32 | 9 | Yes |

The Packet 153 gate gives these separate decisions:

| Mode | Availability | Maximum permitted | Maximum observed | Critical breaches | Decision |
|---|---:|---:|---:|---:|---|
| Walking | 12/12 (100%) | 5 minutes | 11 minutes | 1 | **FAIL** |
| Public transport | 12/12 (100%) | 10 minutes | 16 minutes | 0 | **FAIL** |

Walking fails because the maximum understatement is 11 minutes and the
National Gallery to Victoria anchor-critical scenario understates by seven
minutes. Public transport fails because its maximum understatement is 16
minutes. The fact that all routes were available does not override either
safety failure.

The result is retained in
`src/routing/packet155LiveCalibrationEvidence.js` and is re-evaluated by an
automated test through the approved quality-gate code. The evidence does not
approve provider activation. Routing remains disabled and production remains
unchanged.

## 11. External controls, deployment, and incident record

The authenticated setup established:

- Routes API enabled in the intended project;
- Compute Routes hard daily quota granted at 150;
- Compute Route Matrix daily quota granted at zero;
- `My Billing Account` open and billed in GBP;
- project-scoped `DayGuide Routes Private Alpha Guardrail` budget at GBP 5 per
  month, with actual-spend thresholds at 50%, 90%, and 100%; and
- a separate temporary key restricted to Routes API only.

The GitHub draft PR was number 7. Its genuine Netlify Deploy Preview deployed
four functions and returned `AUTH_REQUIRED` to an unauthenticated routing
request, proving that caller verification failed closed before provider use.

The first preview build failed only because the non-sensitive literal
`DAYGUIDE_ROUTES_PROVIDER_MODE` had accidentally been classified as a Netlify
secret. Netlify's scanner found that literal in tracked policy and test files.
It did not find either Google API key in the repository or bundle. The variable
was recreated as non-secret, scanning remained enabled, and the retry passed.
No `REACT_APP_` routing variable was introduced and no browser bundle received
the server-side Routes key.

One first-generation calibration key was displayed by the Cloud Shell create
command and then pasted into the private project conversation. It was deleted
immediately before any deploy or provider request. A separate replacement was
created without copying its value into the repository, logs, documentation, or
conversation. The deleted value must never be restored or reused.

## 12. Shutdown status

The mandatory shutdown is independent of the FAIL result:

| Area | Status |
|---|---|
| Product Owner criteria/quota acceptance | Complete |
| Local approved plan, runner, and evidence test | Complete |
| Google project/billing-account confirmation | Complete |
| Routes API hard daily quota | 150, confirmed |
| Route Matrix daily quota | 0, confirmed |
| Monitoring budget | GBP 5 monthly, project scoped |
| Provider events | 24; no retry |
| Independent references | 24; no retry |
| Quality result | **Walking FAIL; public transport FAIL** |
| Netlify Deploy Preview variables | Removed |
| Packet 155 Deploy Preview | Deleted; URL returns 404 |
| Temporary Routes-only replacement key | Deletion pending signed-in Google action |
| GitHub draft PR and temporary public branch | Closure pending evidence commit |
| Existing Places key | Must remain unchanged |
| Production | Unchanged and locked |

## 13. Official sources

Checked on 27 July 2026:

- Routes usage, billing, quotas, and limits:
  https://developers.google.com/maps/documentation/routes/usage-and-billing
- Routes setup and key guidance:
  https://developers.google.com/maps/documentation/routes/get-api-key
- Google Maps Platform key security:
  https://developers.google.com/maps/api-security-best-practices
- Transit request window and limitations:
  https://developers.google.com/maps/documentation/routes/transit-route
- Cloud Billing budgets and their non-capping behaviour:
  https://docs.cloud.google.com/billing/docs/how-to/budgets
- Netlify deploy-preview environment variables:
  https://docs.netlify.com/build/environment-variables/overview/
- Netlify deploy contexts and draft previews:
  https://docs.netlify.com/deploy/deploy-overview/
- Netlify rate limiting:
  https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/
- TfL Unified API and journey-planning data:
  https://tfl.gov.uk/info-for/open-data-users/unified-api

## 14. Repository handling

The preparation commit must include `[skip netlify]` and remain local until its
tests and production build pass. External setup and the live exercise must be
recorded as later Packet 155 evidence. No Packet 155 commit may be published to
production.
