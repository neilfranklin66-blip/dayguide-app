# DayGuide — Deployment Reality Audit

## 1. Audit identity and scope

- **Packet:** 136 — Deployment Reality Audit
- **Audit date:** 13 July 2026
- **Repository:** `C:\Users\neilf\Documents\dayguide\dayguide-app`
- **Audit branch:** `packet-136-deployment-reality-audit`
- **Baseline commit:** `d62165b docs: add development workflow and handover`
- **Application:** Official ChatGPT Windows desktop app
- **Implementation agent:** Codex
- **Governance:** [`PROJECT_GOVERNANCE.md`](PROJECT_GOVERNANCE.md)
- **Scope:** tracked deployment evidence, bounded Git metadata, and any safe
  public homepage evidence discoverable from tracked content

This was a documentation-only evidence audit. No deployment, external-service
configuration, environment-variable change, repair, build, application test,
paid API request, or authenticated check was authorised.

The untracked `.claude/` and `Dayguide#2/` folders were protected and were not
inspected, searched, opened, enumerated, staged, modified, moved, renamed, or
deleted. Secret values, local environment files, credential stores,
administration consoles, and operating-system configuration were excluded.

### Packet 137 evidence supplement

- **Update date:** 25 July 2026
- **Update packet:** 137 — Project Governance and Traceable Deployment
  Foundation
- **Update baseline:** `883451c docs: add deployment reality audit`
- **Repository scope:** read-only reinspection of tracked deployment
  configuration
- **External source:** Product Owner-supplied Netlify observations in the
  approved Packet 137 instruction

Packet 137 did not access the Netlify UI or API and did not make a public
network request. Its external observations are recorded as supplied facts,
separate from repository evidence and independent public-live verification.

### Packet 138 evidence supplement

Packet 138 performed the separately authorised read-only evidence capture on
25 July 2026 at repository commit `76ec515`. The complete evidence register is
in [`NETLIFY_EVIDENCE_CAPTURE.md`](NETLIFY_EVIDENCE_CAPTURE.md).

The supplied HTTPS URL returned `200 OK` from Netlify and visibly rendered the
DayGuide authentication interface. Plain HTTP redirected to HTTPS. The expected
`places-photo` Netlify Function route returned `404 Not Found`. No authenticated
Netlify access was available: the CLI was absent, the browser required login,
the connected Chrome surface was unavailable, and the unauthenticated site API
returned `401 Access Denied`. Site ownership, repository linkage, provider-side
build/environment configuration, deploy provenance/history, and rollback
capability therefore remain unresolved. No login, deployment, function-provider
request, environment-value access, or external setting change occurred.

### Packet 139 authenticated evidence supplement

Packet 139 records authenticated Netlify browser observations captured manually
by the Product Owner on 25 July 2026. Codex did not access Netlify or GitHub.
The full transcription and evidence limitations are in
[`NETLIFY_AUTHENTICATED_EVIDENCE.md`](NETLIFY_AUTHENTICATED_EVIDENCE.md).

The authenticated observations identify the project and owner, confirm that no
Git repository is linked, confirm CLI deployment with skipped build stages,
identify one deployed function (`places-nearby`), confirm the exact required
server variable is absent while a `REACT_APP_` name is configured, and identify
a manual retained-deploy recovery control subject to 90-day automatic deletion.
No secret value or external setting was accessed or changed.

### Packet 140 recovery and configuration supplement

Packet 140 records later evidence supplied from Product Owner-operated Netlify,
File Explorer, and PowerShell sessions on 25 July 2026. The full record is in
[`NETLIFY_RECOVERY_AND_SECRET_CONFIGURATION.md`](NETLIFY_RECOVERY_AND_SECRET_CONFIGURATION.md).

The Product Owner preserved the current production deploy as a 4,726,438-byte
ZIP outside the repository and supplied its SHA-256. The archive was not opened
or extracted and does not establish source or Git provenance. The Product Owner
also created exact `GOOGLE_PLACES_API_KEY` as a Production secret scoped to
Builds, Functions, and Runtime. The legacy client-prefixed variable remains.
No deployment, republish, function invocation, or Git linkage followed, so
runtime behaviour and production commit traceability remain unverified. Codex
did not access the archive, `.env.local`, Netlify, GitHub, or a secret value.

### Packet 141 controlled deployment-preparation supplement

Packet 141 performed a tracked-history, configuration, test, and clean-build
review on 26 July 2026. Its complete decision record and runbook are in
[`CONTROLLED_TRACEABLE_DEPLOYMENT_PREPARATION.md`](CONTROLLED_TRACEABLE_DEPLOYMENT_PREPARATION.md).

Bounded Git history shows `places-photo.js` first entered the repository in
commit `ed3b055` on 7 July 2026, 48 days after the current production artifact
was published. This chronology explains why a May repository-derived artifact
could contain `places-nearby` but not the later photo function. It does not
create missing provenance for the old CLI upload.

Packet 141 pins Node major version 24, verifies both current handlers and the
complete suite, and completes a production build from an isolated tracked-source
export. It decides that the historical Google credential must be treated as
potentially public: the tracked May client source read the client-prefixed
variable. Before a new build, a replacement credential must be created, exact
Production `GOOGLE_PLACES_API_KEY` updated, and
`REACT_APP_GOOGLE_PLACES_API_KEY` removed from every Netlify context. Rotation
is a two-phase action: create the replacement before the build, keep the old
credential enabled only through initial live verification, then retire it.

No live function was invoked. No repository connection, provider setting,
deployment, publication, rollback, secret value, local environment file, or
recovery archive was accessed or changed.

### Packets 142 and 143 production-deployment supplement

Packets 142 and 143 performed the separately authorised provider migration,
deterministic-install correction, locked candidate verification, and deliberate
publication on 26 July 2026. The complete evidence record is in
[`TRACEABLE_PRODUCTION_DEPLOYMENT.md`](TRACEABLE_PRODUCTION_DEPLOYMENT.md).

The existing Netlify project was retained and linked to GitHub repository
`neilfranklin66-blip/dayguide-app`, production branch `master`, using the
tracked root build, publish, and functions settings. Publication was locked
before the connection and remained locked after publication.

The first Git-connected candidate for Packet 141 commit `f049d39` failed during
the build with an ESLint/Jest environment-resolution error. Production remained
the 20 May CLI deploy. Isolated reproduction established a current npm
peer-resolution conflict in the Create React App 5 dependency tree. Packet 143
added `.npmrc` with `legacy-peer-deps=true`; clean `npm ci`, 37 suites, 927
tests, and a CI production build then passed. Packet 143 commit
`5ef141bf903521dbb9b7c53ff5af682a920ef5be` was fast-forwarded to `master` and
pushed.

The replacement Google key was created in confirmed project
`project-7e314c31-0522-4f34-ab8`, limited to `Places API`, and stored by the
Product Owner as the protected Production value of
`GOOGLE_PLACES_API_KEY`. Secret values were not supplied to Codex or recorded.
The Netlify plan did not permit narrowing the variable from Builds, Functions,
and Runtime to Functions only without an upgrade. No upgrade was authorised.

Authenticated Netlify inspection then established that
`REACT_APP_GOOGLE_PLACES_API_KEY` still contained values in four hosted
contexts. A ready candidate built before its deletion was rejected after public
bundle inspection found the legacy variable name and an additional
Google-format key. That candidate was never published.

The legacy variable was deleted in full. Netlify rebuilt exact commit
`5ef141b` without cache. The resulting candidate:

- deploy ID `6a6602bd6c7609eabb08d744`;
- returned HTTP `200`;
- deployed both tracked functions;
- contained no legacy or server Places variable name in the public bundle;
- contained one Google-format client key, traced to tracked Firebase web
  configuration; and
- remained unpublished during inspection.

The bounded Places verification returned `OK` with 20 nearby results and a
dependent photo redirect to `lh3.googleusercontent.com`. The candidate was then
published deliberately. Public Netlify metadata confirmed:

- canonical deploy ID `6a6602bd6c7609eabb08d744`;
- canonical commit
  `5ef141bf903521dbb9b7c53ff5af682a920ef5be`;
- publication timestamp `2026-07-26T13:01:48.545Z`;
- canonical homepage HTTP `200`; and
- publication lock retained.

After live verification, the historical 11 May credential with access to 33
APIs was deleted. The 18 May retained Netlify deployment remained `ready`, but
old-key retirement means it is not claimed as a complete Places-functional
rollback.

These later facts supersede the operationally unverified state described in the
Packet 136–141 snapshots. They do not rewrite those dated observations.

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

Packet 137 supplied a public URL and Netlify deployment observations through the
Product Owner-approved packet. They were not independently reproduced by Codex.
They are therefore identified as **Product Owner-supplied external facts** and
remain **Documented but unverified** under this audit's evidence classification.

Packet 138 adds **Verified — public live** evidence for the homepage, HTTP-to-
HTTPS redirect, and unavailable `places-photo` route. It does not promote the
Packet 137 deployment-method observations to Netlify-confirmed facts.

Packet 139 adds **Authenticated Product Owner-transcribed Netlify evidence**:
facts observed by the Product Owner in an authenticated session and supplied to
Codex for documentation. They are stronger than unauthenticated assumptions but
are not described as independently reproduced by Codex.

Packet 140 adds **Product Owner-supplied operational evidence** for recovery
preservation and a later environment-name correction. The evidence is dated and
does not rewrite the Packet 139 capture point or prove deployment consumption.

Packet 141 adds **Verified — repository** chronology, current configuration,
automated tests, and a clean tracked-source build, plus a deployment procedure
grounded in current official Netlify guidance. It does not promote prepared
settings or procedures to live evidence.

Packets 142 and 143 add **Verified — repository**, **Authenticated Product
Owner-operated**, and **Verified — public live** evidence for exact Git
provenance, hosted build completion, provider configuration names and controls,
bounded Places function success, bundle-secret exclusion, deliberate
publication, and retained locking. Secret values remain excluded.

Packet 136 excluded untracked files, secret values, provider consoles,
authenticated sessions, deployment logs, build logs for the current commit,
local dependency state, paid API flows, and undocumented operator knowledge.
Packet 139 adds only the bounded authenticated observations supplied by the
Product Owner; secret values and unrelated account information remain excluded.

Classifications used throughout:

- **Verified — repository:** directly proven by tracked content or Git metadata.
- **Verified — public live:** directly demonstrated by a safe unauthenticated
  public check.
- **Authenticated Product Owner-transcribed:** observed by the Product Owner in
  an authenticated Netlify session and supplied for documentation; not
  independently accessed by Codex.
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
| Production branch | No tracked Netlify setting or deployment workflow identifies the production branch; Packet 137 states that automatic GitHub deployment has not been established. | Unverified | GitHub's default branch is not proof of a Netlify production branch. |
| Deployment branches/workflows | No tracked `.github/workflows/` file or deployment-specific branch existed at preflight. | Verified — repository | No GitHub Actions deployment is defined in the tracked tree. |
| Deployment trigger | `README.md` says the app deploys to Netlify; tracked files define no trigger. Packet 137 states that production appears to be a manual or prebuilt upload and automatic GitHub deployment is not established. | Documented but unverified | The supplied observation supports a manual/prebuilt path, but trigger and ownership remain unverified by Codex. |
| Live commit identity | No tracked release marker or deployed-commit identifier exists. Packet 137 states that the production deploy shows no Git commit. | Unverified | No live deployment can be tied to `883451c` or another commit. |

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
| Site identity and URL | No Netlify site identifier or public application URL is tracked. Packet 137 supplies `https://ubiquitous-melomakarona-874d9c.netlify.app/`. | Documented but unverified | The URL is externally supplied, not repository-traceable or independently checked by Codex. |

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

### Packet 136 historical observation

No public production or preview URL was found in the permitted tracked evidence.
The Firebase authentication domain was not treated as a frontend deployment URL,
and no public check occurred.

### Packet 137 Product Owner-supplied external facts

| Supplied fact | Source | Audit classification | Consequence |
|---|---|---|---|
| Live URL: `https://ubiquitous-melomakarona-874d9c.netlify.app/` | Approved Packet 137 instruction | Documented but unverified | A candidate canonical URL is now known outside tracked configuration. |
| Current production deployment appears to be a manual or prebuilt upload | Approved Packet 137 instruction | Documented but unverified | Repository build configuration may not have produced the live artifact. |
| Netlify build was skipped | Approved Packet 137 instruction | Documented but unverified | The live deploy does not demonstrate that `npm run build` succeeds in Netlify. |
| No Git commit is shown against the production deploy | Approved Packet 137 instruction | Documented but unverified | Live-to-repository traceability is absent in the supplied observation. |
| Automatic GitHub deployment has not been established | Approved Packet 137 instruction | Documented but unverified | No Git-connected build may be assumed. |

Packet 137 did not open the URL, inspect public headers or assets, invoke a
function, test Firebase, submit data, or trigger a paid external API. At the
Packet 137 update point, the availability and content of the candidate URL
remained **Unverified**, and the audit had no **Verified — public live**
evidence.

### Packet 138 public-live evidence

At 12:13–12:15 UTC on 25 July 2026:

- plain HTTP returned `301 Moved Permanently` to the supplied HTTPS URL;
- the HTTPS homepage returned `200 OK` with `Server: Netlify`;
- the rendered page showed the DayGuide authentication interface;
- its title and description retained generic Create React App identity;
- no Git commit identity was exposed in the observed headers or page metadata;
  and
- `/.netlify/functions/places-photo` returned `404 Not Found`.

The nearby-search function was not invoked because a deployed handler could
make a paid Google Places request. The photo-route `404` proves that expected
route was unavailable at capture time; it does not prove why it was absent or
establish the state of every function.

## 11. Repository-to-deployment consistency matrix

| Item | Repository evidence | Authenticated/public evidence | Classification | Risk or follow-up |
|---|---|---|---|---|
| Repository remote | Established GitHub `origin`. | Netlify is linked to `neilfranklin66-blip/dayguide-app`. | Verified — repository and authenticated | Retain linkage. |
| Production branch | GitHub default and Netlify production branch are `master`. | Published deploy identifies branch `master`. | Verified — repository and public live | Retain deliberate publication lock. |
| Build command | `npm run build`. | Netlify completed the command for exact commit `5ef141b`. | Verified — repository and hosted build | None beyond normal future build verification. |
| Publish directory | `build`. | Published deploy contains the expected generated page and assets. | Verified — repository and hosted deploy | None. |
| Function directory | `netlify/functions`. | Published deploy reports two functions. | Verified — repository and hosted deploy | Reopen only if future inventory changes. |
| Redirects | No tracked redirect/rewrite. | None. | Verified — repository | Reassess if routing/deep links are introduced. |
| Runtime version | `.node-version` pins Node major 24; Packet 143 passed clean install, tests, and build under Node `v24.15.0`. | Git-connected hosted build completed; exact hosted patch version was not retained. | Verified — repository; bounded hosted evidence | Record hosted patch version only if later diagnosis needs it. |
| Environment names | Functions require server-only `GOOGLE_PLACES_API_KEY`; current browser code prohibits the client-secret form. | Replacement is a Production secret; legacy variable is deleted; published bundle contains neither variable name nor Places key. | Verified — repository, authenticated, and public live | Functions-only scope remains unavailable without plan upgrade. |
| Frontend function URLs | Two relative routes match two tracked handlers. | Nearby returned `OK`; dependent photo reached Google's image host. | Verified — repository and bounded provider-live | Do not repeat paid checks without a new reason. |
| External providers | Google, Firebase, GitHub, Maps, and placeholder service are evidenced. | Google Places and GitHub/Netlify delivery are verified within Packet 142; Firebase journey remains unverified. | Mixed verified and unverified by provider | Audit Firebase separately. |
| Deployment method | Git linkage and `.npmrc` compatibility requirement are tracked. | Netlify built exact Git commit and publication was deliberate. | Verified — repository and hosted build | Retain reproducible settings and lock. |
| Live URL | No tracked URL. | Authenticated production domain matches Packet 138's reachable Netlify hostname; no custom domain is configured. | Authenticated and Verified — public live | Record future domain changes through controlled evidence. |
| Deployed commit identity | Git `master` and `origin/master` identify `5ef141b`. | Canonical Netlify metadata identifies the same full SHA and deploy `6a6602bd6c7609eabb08d744`. | Verified — repository and public live | Record each future release similarly. |
| Rollback mechanism | Packet 141 tracks rollback triggers and operator steps. | May 18 retained deploy remains `ready`; Packet 140 archive remains external. | Prepared and target-available; complete restoration unverified | Old-key retirement can limit Places functionality in historical artifacts. |

## 12. Deployment risks and contradictions

### Verified blocking risks

None. Packet 136 did not obtain direct evidence that a blocking condition is
currently present in production.

### Verified non-blocking risks

- **Dependency age — Risk:** Create React App 5 requires tracked legacy peer
  resolution; the dated clean install reported dependency-audit findings.
- **Secret process scope — Residual risk:** the Netlify plan requires an upgrade
  to narrow the Production secret from Builds, Functions, and Runtime to
  Functions only. The published bundle nevertheless contains no Places key.
- **Unused wrong-project key — Closed in Packet 144:** the Product Owner
  confirmed and deleted the unused broad key from Google project `dayguide1`.
  The project then showed no API keys; the production credential in the
  separate production project was unchanged.
- **Recovery validation — Risk:** the current artifact is preserved outside the
  repository with hash evidence, but archive contents and complete restoration
  are untested; old-key retirement can limit historical Places functionality.
- **Method handling — Risk:** serverless handlers do not restrict request
  methods.
- **Public identity metadata — Inconsistent:** repository documentation and UI
  describe DayGuide, while `public/index.html` and `public/manifest.json`
  retain generic Create React App identity.

### Suspected risks requiring validation

- Firebase project availability, providers, authorised domains, rules, and quota
  are **Unverified**.
- Google billing alerts and quota governance remain **Unverified**; no financial
  threshold was changed.
- Public frontend and Places-function availability are **Verified — public
  live** within the bounded checks; authenticated workflow and full
  asset/application behaviour remain **Unverified**.

### Documentation inconsistencies

- Generic Create React App title/manifest metadata conflicts with the DayGuide
  identity in repository documentation. This remains **Inconsistent** in
  tracked and deployed content.

### Missing operational knowledge

The Netlify project identity, owner label, domain, repository linkage, production
branch, build settings, exact deployed source/commit, both functions, bounded
Places behaviour, credential migration, manual lock, retained deploy, and
preserved external archive are recorded. Exact hosted runtime patch, billing and
quota monitoring, Firebase operational state, and a fully tested rollback
remain unavailable.

### Product Owner decisions

- **Completed:** preserve the old artifact and retained deploy.
- **Completed:** pin Node major 24 and track deterministic npm compatibility.
- **Completed:** connect the existing site to GitHub `master`.
- **Completed:** replace and restrict the Places credential, remove the legacy
  variable, verify both functions, publish deliberately, and retire the old key.
- **Decision retained:** keep auto publishing locked.
- **Decision deferred:** no Netlify plan upgrade solely for Functions-only scope.
- **Decision required later:** authorise any Firebase journey audit, dependency
  modernisation, or cleanup of the unused `dayguide1` key separately.

## 13. Current deployment-readiness assessment

| Area | Rating | Reason |
|---|---|---|
| Repository configuration | Green | Build, publish, functions, production branch, Node-major, and npm compatibility settings are exact. |
| Reproducible build knowledge | Green with legacy debt | Clean install, full suite, CI build, and hosted build pass; the old toolchain still requires compatibility mode. |
| Hosting configuration | Green | Existing site is Git-linked, exact-commit attributable, published, and locked. |
| Serverless routing | Green for bounded evidence | Both functions are deployed and passed the authorised nearby/photo checks. |
| Environment configuration | Green with scope residual | Legacy variable is deleted; replacement is Production-only and Places-only, but Netlify process scope cannot be narrowed without upgrade. |
| External-service readiness | Mixed | Google Places is verified within scope; Firebase remains unverified. |
| Live frontend availability | Green for bounded reachability | Canonical HTTPS returns `200` and serves the verified clean bundle. |
| Live restaurant functionality | Green for bounded provider and UI evidence | Packet 142's nearby call returned 20 results and dependent photo redirection succeeded. Packet 146 then verified live cards, photographs, selection, mixed timeline persistence, and the exact Maps handoff through the production UI. |
| Security of secret handling | Green with residuals | No Places key is public; the old and wrong-project unused keys are retired. Netlify scope remains a separate hygiene item. |
| Rollback readiness | Amber | Retained deploy and external archive exist; full restoration and old Places behaviour are unverified. |
| Deployment ownership and procedure | Green | Exact repository, branch, commit, build, deploy, operator, and lock are recorded. |

Overall deployment readiness is **Green for the Packet 142 objective**, with
separate Amber work for Firebase assurance, dependency modernisation, and
rollback completeness.

## 14. Recommended follow-up work

Ranked, bounded later packets:

1. **Live Private Alpha journey:** Packets 144–146 verified the guest denied-
   and allowed-location production paths without changing the locked deployment.
   Representative mobile-device layout and non-guest authentication remain
   separate decisions.
2. **Firebase security and provider audit:** verify authorised domains,
   authentication providers, and Firestore rules.
3. **Dependency modernisation:** replace the legacy Create React App toolchain
   through a separately reviewed migration; do not use forced audit fixes.
4. **Credential governance:** review billing/quota alerts. Packet 144 completed
   safe deletion of the unused key in Google project `dayguide1`.
5. **Rollback exercise:** test a bounded restore plan that does not depend on
   the retired historical Places key.
6. **Public identity metadata:** replace generic Create React App title and
   manifest identity in a bounded product-code/static-assets packet.

## 15. Audit conclusion

Known from repository evidence: the source remote, baseline commit, CRA/npm build
command, build output, Netlify function directory, two function implementations,
relative client routes, one server-side variable name, and Google/Firebase
integration boundaries.

Known from Packet 138 public-live evidence: the supplied URL redirects to HTTPS,
returns `200` from Netlify, visibly renders DayGuide, exposes no observed commit
identity, and returns `404` for the expected `places-photo` function route.

Known from authenticated Product Owner-transcribed Netlify evidence: the project
identity and owner label, production domain, absence of custom domains and Git
linkage, CLI deployment source, skipped build stages, deployment history, one
running `places-nearby` function, absence of `places-photo`, configured
client-prefixed variable name, manual publish-deploy recovery, and 90-day
automatic deletion.

Known from Packet 140 Product Owner-supplied operational evidence: the current
deploy archive is preserved outside the repository with recorded size and
SHA-256, and exact Production secret name `GOOGLE_PLACES_API_KEY` is configured.
The legacy client-prefixed variable remains and production was not redeployed.

Known from Packet 141 repository evidence: `places-photo` entered Git after the
current production artifact was published; both current functions are selected
by tracked configuration and pass focused tests; the full suite and clean
production build pass under pinned Node major 24; the May client source read
the client-prefixed variable; and exact connection, locked-publication,
verification, and rollback procedures are prepared.

Known from Packets 142 and 143: the existing site is linked to GitHub
`master`; exact commit `5ef141b` built successfully after the tracked
dependency-resolution correction; both functions are deployed; the replacement
Places-only credential passed bounded nearby and photo checks; the legacy
client variable is deleted; the clean public bundle contains no Places secret;
the old 33-API credential is retired; deploy
`6a6602bd6c7609eabb08d744` is canonical; and publication remains locked.

Still unknown or outside this audit: the complete authenticated user journey,
Firebase provider and Firestore-rule readiness, Google billing-alert and quota
governance, the exact hosted Node patch version, restoration of the preserved
ZIP, and whether an old retained deploy remains fully functional after
historical-key retirement.

The central deployment contradictions are resolved. Production is now
attributable to reviewed Git source, reproducibly built, function-complete for
the tracked Places boundary, credential-migrated, and deliberately locked.

**Single recommended next action:** review and accept Packet 142, then define a
separate bounded live Private Alpha journey check without altering the locked
deployment or reopening credential work.
