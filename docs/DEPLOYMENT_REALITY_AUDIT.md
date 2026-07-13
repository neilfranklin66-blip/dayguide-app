# DayGuide — Deployment Reality Audit

## 1. Audit identity and scope

- **Packet:** 136 — Deployment Reality Audit
- **Audit date:** 13 July 2026
- **Repository:** `C:\Users\neilf\Documents\dayguide\dayguide-app`
- **Audit branch:** `packet-136-deployment-reality-audit`
- **Baseline commit:** `d62165b docs: add development workflow and handover`
- **Application:** Official ChatGPT Windows desktop app
- **Implementation agent:** Codex
- **Scope:** tracked deployment evidence, bounded Git metadata, and any safe
  public homepage evidence discoverable from tracked content

This was a documentation-only evidence audit. No deployment, external-service
configuration, environment-variable change, repair, build, application test,
paid API request, or authenticated check was authorised.

The untracked `.claude/` and `Dayguide#2/` folders were protected and were not
inspected, searched, opened, enumerated, staged, modified, moved, renamed, or
deleted. Secret values, local environment files, credential stores,
administration consoles, and operating-system configuration were excluded.

## 2. Evidence methodology

The audit used:

- `git status`, branch, commit, and remote metadata;
- `git ls-files`, `git grep`, and `git show` restricted to tracked,
  deployment-relevant paths;
- direct inspection of tracked documentation, package metadata, Netlify
  configuration, Netlify functions, environment-variable examples, Firebase
  integration symbols, public metadata, and the client function URLs; and
- a focused tracked-content search for a public production or preview URL.

No tracked public deployment URL was found. Consequently, no public network
check was attempted. This is an evidence limitation, not packet failure.

Excluded evidence included untracked files, secret values, provider consoles,
authenticated sessions, deployment logs, build logs for the current commit,
local dependency state, paid API flows, and undocumented operator knowledge.

Classifications used throughout:

- **Verified — repository:** directly proven by tracked content or Git metadata.
- **Verified — public live:** directly demonstrated by a safe unauthenticated
  public check.
- **Documented but unverified:** stated in repository documentation without
  independent confirmation.
- **Unverified:** insufficient evidence.
- **Inconsistent:** evidence sources conflict.
- **Risk:** a condition could cause deployment, security, reliability, or
  maintenance problems.
- **Decision required:** Product Owner or architectural judgement is needed.

## 3. Repository and source-control position

| Item | Evidence | Classification | Conclusion |
|---|---|---|---|
| Repository remote | `origin` fetch and push URLs identify the established DayGuide GitHub repository. | Verified — repository | GitHub is the source-control remote. |
| Baseline | Preflight showed `master` at `d62165b`, synchronized with `origin/master`. | Verified — repository | Packet 136 began from the required baseline. |
| Default remote branch | `origin/HEAD -> origin/master`. | Verified — repository | GitHub's default remote branch is `master`. |
| Production branch | No tracked Netlify setting or deployment workflow identifies the production branch. | Unverified | GitHub's default branch is not proof of Netlify's production branch. |
| Deployment branches/workflows | No tracked `.github/workflows/` file or deployment-specific branch existed at preflight. | Verified — repository | No GitHub Actions deployment is defined in the tracked tree. |
| Deployment trigger | `README.md` says the app deploys to Netlify; tracked files do not identify whether deploys are automatic, manual, or linked to this repository. | Documented but unverified | Trigger and ownership remain unknown. |
| Live commit identity | No tracked site URL, build metadata endpoint, release marker, or deployed-commit identifier exists. | Unverified | No live deployment can be tied to `d62165b` or another commit. |

Unrelated historical branches were not inspected.

## 4. Deployment architecture summary

Tracked evidence supports this intended architecture:

```text
Browser
→ Create React App static frontend
→ relative /.netlify/functions/* endpoint
→ Netlify function
→ Google Places service
→ response or redirect normalised for the browser
→ DayGuide interface
```

A second browser-side path uses the tracked Firebase web configuration for
Firebase Authentication and Firestore-backed language preferences. Google Maps
search links open directly from the browser. Placeholder restaurant images may
load from `placehold.co`.

The frontend framework, request paths, function code, and provider integrations
are **Verified — repository**. Netlify hosting, function deployment, Firebase
availability, Google service configuration, and all live behaviour are
**Unverified**.

## 5. Hosting configuration

| Concern | Repository evidence | Classification | Assessment |
|---|---|---|---|
| Hosting provider | Root `netlify.toml`; `README.md` names Netlify. | Verified — repository for intended configuration; Documented but unverified for live hosting | Netlify is the intended provider, not a proven live provider. |
| Build command | `command = "npm run build"`. | Verified — repository | Explicit. |
| Publish directory | `publish = "build"`. | Verified — repository | Matches Create React App's normal output. |
| Function directory | `functions = "netlify/functions"`. | Verified — repository | Matches the two tracked function files. |
| Redirects/rewrites | No tracked `_redirects` and no redirect block in `netlify.toml`. | Verified — repository | SPA fallback is absent. The current app has no router, so no present deep-link defect is proved. |
| Runtime version | No root `engines`, `packageManager`, `.nvmrc`, `.node-version`, `.tool-versions`, or Netlify Node setting. | Risk | Provider-selected runtime defaults can change build behaviour. |
| Plugins/scripts | No tracked Netlify plugin, deployment script, or GitHub deployment workflow. | Verified — repository | Deployment automation beyond Netlify's build block is not repository-readable. |
| Production/preview branches | No tracked production-branch, preview, or branch-deploy policy. | Unverified | Provider-side policy may exist but was not accessible. |
| Site identity and URL | No Netlify site identifier or public application URL is tracked. | Unverified | Safe public verification could not start. |

The tracked hosting configuration is partial: it describes build outputs and
function location but not site identity, branch policy, runtime, trigger,
ownership, preview behaviour, or rollback.

## 6. Build and runtime configuration

- **Package manager evidence — Verified — repository:** `package-lock.json` is
  tracked at lockfile version 3, identifying an npm lock and a reproducible
  dependency graph subject to a compatible runtime/toolchain.
- **Build system — Verified — repository:** Create React App via
  `react-scripts 5.0.1`.
- **Scripts — Verified — repository:** `start`, `build`, `test`, and
  `eject` are defined; the deployment command selects `npm run build`.
- **Frontend dependencies — Verified — repository:** React, Firebase, i18next,
  and QR-code support are declared.
- **Runtime requirement — Risk:** no project-level Node or npm version is pinned.
  Transitive package engine declarations do not select the deployment runtime.
- **Build-time environment — Verified — repository:** no production client code
  reads a `REACT_APP_*` key. The Google Places key name is read only by the
  serverless functions.
- **Current production build — Unverified:** Packet 136 did not install
  dependencies or run a build, and configuration inspection does not prove that
  the current commit builds successfully on Netlify.

The Packet 131 build result documented elsewhere is dated 11 July 2026. It is
not evidence of a Packet 136 production build or a live Netlify deployment.

## 7. Serverless functions and routes

| Function | Expected route | Client method | Responsibility | External call | Deployment-relevant behaviour |
|---|---|---|---|---|---|
| `places-nearby.js` | `/.netlify/functions/places-nearby` | Browser `fetch` defaults to GET; handler has no method guard | Proxy nearby restaurant queries while attaching the server-side key | Google Places legacy Nearby Search | Missing key returns HTTP 200 with `REQUEST_DENIED/NO_API_KEY`; fetch failure returns HTTP 502; provider payload otherwise passes through. |
| `places-photo.js` | `/.netlify/functions/places-photo` | Browser image request/GET; handler has no method guard | Resolve a Google photo reference without exposing the key | Google Places photo endpoint, then provider CDN redirect | Missing key/reference or provider failure redirects to a placeholder; successful provider redirect is cached longer. |

The client route constants and Netlify function filenames are **Verified —
repository** and appear internally consistent. Netlify's
`/.netlify/functions/<name>` routing, deployed function presence, supported
runtime, and live provider behaviour remain **Unverified** because no function
was invoked.

The functions do not validate HTTP methods. This is a **Risk**, not a verified
live exploit or outage.

## 8. Environment-variable inventory

No values were sought, displayed, inferred, or recorded.

| Variable name | Referenced location | Use | Purpose | Requirement | Sensitivity | Repository evidence | Live availability |
|---|---|---|---|---|---|---|---|
| `GOOGLE_PLACES_API_KEY` | `.env.local.example`; both Netlify functions | Server-side | Authorise Google nearby-search and photo requests | Required for live restaurant results and real provider photos; not required for the static shell | Secret credential | Verified — repository | Unverified |
| `REACT_APP_GOOGLE_PLACES_API_KEY` | Comments and test-only regression checks | Not used by production client code | Legacy/client-exposure sentinel that production tests prohibit | Not required and must not be used for the key | Would expose a supplied value in the client bundle | Verified — repository as test-only/non-production | Not applicable to intended production configuration; provider state unverified |

Firebase uses a tracked web configuration object rather than environment
variables. Its values are intentionally not reproduced here. The presence of
that object is **Verified — repository**; project provisioning, authorised
domains, provider settings, Firestore rules, and live connectivity are
**Unverified**.

No evidence proves that `GOOGLE_PLACES_API_KEY` exists in Netlify. The absence
of a tracked value is correct secret-handling practice and is not evidence that
the operational value is absent.

## 9. External-service dependencies

| Provider | Purpose | Repository integration evidence | Required configuration | Live status | Failure consequence / risk |
|---|---|---|---|---|---|
| Netlify | Static hosting, build, and serverless functions | `netlify.toml`, function directory, relative client routes | Site linkage, production branch, runtime, deploy trigger, function deployment | Documented but unverified | Static site or functions may be absent, stale, or differently configured. |
| Google Places | Nearby restaurant data and photos | Function URLs target Google Places endpoints | Server-side key, enabled service, billing, restrictions, quota | Unverified | Restaurant results fail; photos fall back to placeholders. |
| Firebase | Authentication and Firestore language preferences | Firebase SDK dependency and tracked initialisation/auth/prefs code | Active project, providers, authorised domains, rules, quota | Unverified | Authentication gate may prevent entry; remote preferences may fail. |
| GitHub | Source-control remote | `origin` points to the DayGuide repository | Repository availability and access | Verified — repository for remote identity | Relationship to Netlify deploy triggering is unknown. |
| Google Maps | User-opened venue search links | Tracked Maps search URL construction | Public Maps availability | Unverified | External map links may fail; core static app can still render. |
| placehold.co | Restaurant fallback imagery | Tracked placeholder URLs | Public service availability | Unverified | Some restaurant images may fail; data flow can continue. |

## 10. Public deployment evidence

No public production or preview URL was found in the permitted tracked evidence.
The Firebase authentication domain is not evidence of the DayGuide frontend
deployment URL and was not treated as one.

Therefore:

- no homepage was opened;
- no HTTP status or response header was recorded;
- no visible application identity was observed;
- no static-asset loading was tested;
- no function or external API was invoked; and
- no deployed commit identity was observed.

All public-live deployment claims remain **Unverified**. There is no
**Verified — public live** evidence in Packet 136.

## 11. Repository-to-deployment consistency matrix

| Item | Repository evidence | Public-live evidence | Classification | Risk or follow-up |
|---|---|---|---|---|
| Repository remote | Established GitHub `origin`. | None required for local metadata. | Verified — repository | Confirm provider linkage separately. |
| Production branch | GitHub default is `master`; no Netlify branch setting. | None. | Unverified | Confirm provider production branch. |
| Build command | `npm run build`. | None. | Verified — repository | Run a separately authorised clean build with the selected runtime. |
| Publish directory | `build`. | None. | Verified — repository | Confirm Netlify uses tracked configuration. |
| Function directory | `netlify/functions`. | None. | Verified — repository | Confirm both functions deploy. |
| Redirects | No tracked redirect/rewrite. | None. | Verified — repository | Reassess if routing/deep links are introduced. |
| Runtime version | No root runtime pin. | None. | Risk | Select and pin a supported Node version. |
| Environment names | One server variable name; client-secret form prohibited. | None. | Verified — repository | Verify provider presence and controls without recording values. |
| Frontend function URLs | Two relative Netlify function URLs match filenames. | None. | Verified — repository | Perform a separately authorised live function check. |
| External providers | Google, Firebase, GitHub, Maps, and placeholder service are evidenced. | None. | Verified — repository | Verify operational readiness provider by provider. |
| Live URL | No tracked URL. | None. | Unverified | Product Owner must establish the canonical URL. |
| Deployed commit identity | No tracked mechanism. | None. | Unverified | Add release/deploy traceability. |
| Rollback mechanism | No tracked runbook, workflow, or rollback reference. | None. | Risk | Define ownership and rollback procedure. |

## 12. Deployment risks and contradictions

### Verified blocking risks

None. Packet 136 did not obtain direct evidence that a blocking condition is
currently present in production.

### Verified non-blocking risks

- **Runtime drift — Risk:** no Node or npm version is pinned for Netlify or local
  reproducibility.
- **Deployment knowledge gap — Risk:** no tracked deployment trigger, owner,
  release procedure, deployed-commit marker, or rollback runbook exists.
- **Method handling — Risk:** serverless handlers do not restrict request
  methods.
- **Public identity metadata — Inconsistent:** repository documentation and UI
  describe DayGuide, while `public/index.html` and `public/manifest.json`
  retain generic Create React App identity.

### Suspected risks requiring validation

- Netlify site linkage, production branch, build runtime, and current deployed
  commit are **Unverified**.
- Google key presence, restrictions, billing, quota, and function deployment are
  **Unverified**.
- Firebase project availability, providers, authorised domains, rules, and quota
  are **Unverified**.
- Public frontend and asset availability are **Unverified**.

### Documentation inconsistencies

- `README.md` says “This app deploys to Netlify” and that no manual build
  configuration is required in Netlify. Repository evidence proves the intended
  configuration but cannot prove either operational statement. This is
  **Inconsistent** in confidence, not proof that Netlify is misconfigured.
- Generic Create React App title/manifest metadata conflicts with the DayGuide
  identity in repository documentation. This is **Inconsistent** in tracked
  content; live visibility is unverified.

### Missing operational knowledge

Canonical public URL, Netlify site identity, production branch, deploy trigger,
deployment owner, selected runtime, environment presence, live function state,
deployed commit, monitoring, release history, and rollback procedure are
unrecorded or inaccessible.

### Product Owner decisions

- **Decision required:** identify the canonical production URL and deployment
  owner.
- **Decision required:** confirm the intended production branch and deployment
  trigger.
- **Decision required:** approve a supported Node runtime for reproducible
  builds.
- **Decision required:** approve ownership and minimum rollback/runbook
  requirements.

## 13. Current deployment-readiness assessment

| Area | Rating | Reason |
|---|---|---|
| Repository configuration | Amber | Core build/publish/function settings exist, but runtime, redirects policy, branch policy, and site identity are incomplete. |
| Reproducible build knowledge | Amber | npm lock and build script exist; runtime is unpinned and no Packet 136 build ran. |
| Hosting configuration | Amber | Netlify is intended and partially configured; live site and provider-side settings are unverified. |
| Serverless routing | Amber | Client paths and function filenames align; deployed routes and method behaviour are unverified. |
| Environment configuration | Red | The required variable name is known, but provider presence and controls are entirely unverified. “Red” records missing operational evidence, not a proved missing key. |
| External-service readiness | Red | Google and Firebase are essential to core paths but have no live evidence. |
| Live frontend availability | Not assessed | No tracked public URL was available for a permitted check. |
| Live restaurant functionality | Not assessed | Paid/external API flows were explicitly excluded. |
| Security of secret handling | Amber | Tracked code keeps the Google key server-side; provider controls and deployed bundle/state were not assessed. |
| Rollback readiness | Red | No tracked rollback mechanism or runbook exists. |
| Deployment ownership and procedure | Red | No repository-readable owner, trigger, release, or rollback procedure exists. |

Overall readiness is **Amber with Red operational-knowledge gaps**. The
repository describes a plausible deployment architecture but does not establish
that a current, attributable, reproducible, secure, and recoverable production
deployment exists.

## 14. Recommended follow-up work

Ranked, bounded later packets:

1. **Urgent — canonical deployment record:** record the Product Owner-confirmed
   public URL, Netlify site/owner, production branch, and deploy trigger without
   recording secret values.
2. **Urgent — environment verification:** have an authorised operator verify the
   required variable's presence, scope, restrictions, billing, quota, and
   rotation controls without exposing its value.
3. **High — runtime and production build verification:** select and pin a
   supported Node version, then run a clean build in a separately authorised
   product/configuration packet.
4. **High — deployment and rollback runbook:** document deploy ownership,
   release evidence, monitoring, rollback steps, and recovery authority.
5. **High — safe public frontend verification:** once the canonical URL is
   established, perform a single unauthenticated homepage/header/static-asset
   check and record deployed-commit traceability if available.
6. **High — controlled live restaurant verification:** separately authorise a
   minimal provider/function check with cost and credential safeguards.
7. **Medium — public identity metadata:** replace generic Create React App title
   and manifest identity in a bounded product-code/static-assets packet.

No follow-up was implemented by Packet 136.

## 15. Audit conclusion

Known from repository evidence: the source remote, baseline commit, CRA/npm build
command, build output, Netlify function directory, two function implementations,
relative client routes, one server-side variable name, and Google/Firebase
integration boundaries.

Unknown: the canonical live URL, whether Netlify is linked to this repository,
which branch and runtime it uses, whether the current commit is deployed,
whether functions and variables are present, whether Google and Firebase are
operational, who owns releases, and how rollback works.

The repository contains the core ingredients of a deployment process but not a
fully reproducible deployment process: runtime selection, provider linkage,
release traceability, ownership, and rollback are missing or unverified. Live
behaviour cannot currently be trusted as evidence because no canonical public
deployment was established and no permitted live observation occurred.

**Single recommended next action:** the Product Owner should identify and
confirm the canonical production URL, Netlify deployment owner, production
branch, and deploy trigger so a bounded read-only public and provider-state
verification packet can be authorised.
