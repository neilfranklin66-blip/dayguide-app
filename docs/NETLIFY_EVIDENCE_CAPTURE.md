# DayGuide — Read-Only Netlify Evidence Capture

## Document control

- **Packet:** 138 — Read-Only Netlify Evidence Capture
- **Capture date:** 25 July 2026
- **Capture window:** 12:13:20–12:15:09 UTC (13:13:20–13:15:09 BST)
- **Implementation agent:** Codex
- **Repository:** `C:\Users\neilf\Documents\dayguide\dayguide-app`
- **Repository commit inspected:** `76ec515 docs: establish project governance
  and deployment foundation`
- **Packet branch:** `packet-138-read-only-netlify-evidence-capture`
- **Candidate live URL:**
  `https://ubiquitous-melomakarona-874d9c.netlify.app/`

This is a read-only evidence record. No deployment, build, rollback, site
linkage, authentication, token creation, environment-variable access, or
Netlify/GitHub setting change occurred.

### Evidence limitations

No authenticated Netlify access was already available:

- the Netlify CLI was not installed;
- no `NETLIFY_AUTH_TOKEN` environment variable was present;
- the in-app browser reached the Netlify login page;
- the connected Chrome browser surface was unavailable; and
- an unauthenticated Netlify API site request returned HTTP `401 Access Denied`.

Packet 138 did not initiate login, request a token, switch accounts, or ask for
new permissions. Consequently, account, site, deployment-history, provider-side
build, environment, and rollback fields that require authenticated Netlify
access remain unresolved.

## Evidence methodology

Evidence classifications:

- **Verified — repository:** directly observed in tracked files or Git metadata.
- **Verified — local metadata:** directly observed in a specific ignored local
  metadata file; this does not prove current provider state.
- **Verified — public live:** directly observed through a minimal public HTTP
  request or browser render.
- **Verified — access limitation:** directly observed failure or absence that
  limits this capture.
- **Product Owner-supplied:** accepted as packet context but not independently
  reproduced.
- **Unresolved:** the available evidence cannot establish the fact.

Material evidence register:

| ID | Fact | Evidence source | Command, interface, file, or endpoint | Capture time (UTC) | Confidence | Independently verified |
|---|---|---|---|---|---|---|
| R1 | Repository baseline and remote `master` were both `76ec515`; tracked and staged diffs were empty. | Git metadata | `git status -sb`, `git rev-parse`, `git remote -v`, `git diff --quiet`, read-only `git fetch origin master` | 12:05–12:06 | High | Yes |
| R2 | Repository build command is `npm run build`; publish directory is `build`; functions directory is `netlify/functions`. | Tracked repository configuration | `netlify.toml`, `package.json` | 12:07–12:09 | High | Yes |
| R3 | CRA uses `react-scripts 5.0.1`, and the repository does not select a Node or npm runtime. | Tracked repository configuration | `package.json`; tracked-path search documented in `DEPLOYMENT_REALITY_AUDIT.md` | 12:07–12:09 | High | Yes |
| R4 | Two tracked functions use `GOOGLE_PLACES_API_KEY`; client routes target their expected `/.netlify/functions/` paths. | Tracked source | `netlify/functions/places-nearby.js`, `places-photo.js`, `src/api/placesApi.js`, `.env.local.example` | 12:08–12:09 | High | Yes |
| R5 | No tracked redirects, Git deployment workflow, production-branch setting, deploy-preview setting, hook, or public commit marker was found. | Tracked repository search | `git ls-files` and `git grep` restricted to tracked deployment-relevant paths | 12:08 | High for repository absence | Yes |
| L1 | An ignored local Netlify state file records site ID `9df12298-e795-42f0-9c00-3ff464f8b41e`. | Local non-secret metadata | `.netlify/state.json` | 12:10 | High for file content; low for current provider state | Yes, locally only |
| A1 | Netlify CLI access was unavailable. | Local command availability | `where.exe netlify` returned exit code `1`; exact local state and token-presence checks | 12:10–12:16 | High | Yes |
| A2 | Existing in-app browser access was not authenticated to Netlify. | Netlify browser UI | `https://app.netlify.com/sites/ubiquitous-melomakarona-874d9c/overview` displayed Netlify login controls | 12:12 | High | Yes |
| A3 | Connected Chrome access was unavailable. | Browser connection | Existing Chrome browser-surface selection returned unavailable | 12:12 | High | Yes |
| A4 | Unauthenticated Netlify API access was denied. | Netlify API | `GET https://api.netlify.com/api/v1/sites/9df12298-e795-42f0-9c00-3ff464f8b41e` returned `401 Access Denied` | 12:14:39 | High | Yes |
| P1 | Plain HTTP redirects permanently to the supplied HTTPS URL. | Public live request | `GET http://ubiquitous-melomakarona-874d9c.netlify.app/` without redirect following | 12:14:58 | High | Yes |
| P2 | The HTTPS homepage returned `200 OK` from Netlify. | Public live request | `GET https://ubiquitous-melomakarona-874d9c.netlify.app/` | 12:13:20 | High | Yes |
| P3 | The rendered page visibly identifies itself as DayGuide and presents the authentication screen. | Public browser render | DOM snapshot of the supplied HTTPS URL | 12:12–12:13 | High | Yes |
| P4 | Public metadata remains generic CRA metadata and exposes asset hashes but no Git commit identity. | Public browser render | Document title, metadata, stylesheet and script URLs read from the supplied HTTPS page | 12:13 | High for observed fields | Yes |
| P5 | The expected `places-photo` function route returned `404 Not Found`. | Public live request | `GET https://ubiquitous-melomakarona-874d9c.netlify.app/.netlify/functions/places-photo` without redirect following | 12:13:20 | High | Yes |
| E1 | The packet states that the production deploy appears manual/prebuilt, skipped a Netlify build, shows no Git commit, and has no automatic GitHub deployment. | Approved Packet 138 context | Packet 138 confirmed starting state | Before capture | Medium; not platform-reproduced | No |

The public `places-nearby` route was deliberately not invoked. If deployed and
configured, even a malformed request could reach the paid Google Places
provider. Its live response therefore remains unresolved rather than inferred
from the `places-photo` result.

## 1. Executive summary

The supplied HTTPS URL is a reachable Netlify-hosted page and visibly renders
the DayGuide authentication interface. HTTP redirects to HTTPS, and the
homepage returns `200 OK`.

The public deployment is incomplete against the tracked intended architecture:
the expected `places-photo` Netlify Function route returns `404`. This directly
proves that route was unavailable at capture time; it does not prove the state
of every possible function or identify why the route is absent.

The local checkout records a Netlify site ID, but no authenticated Netlify
access was available to verify site ownership, repository linkage, build
configuration, deployment provenance, environment-variable presence, recent
deploy history, or rollback capability. The current deployment cannot be tied
to a Git commit.

## 2. Repository-confirmed deployment configuration

| Concern | Repository-confirmed fact | Evidence |
|---|---|---|
| Framework | Create React App via `react-scripts 5.0.1` | R2, R3 |
| Build command | `npm run build` → `react-scripts build` | R2 |
| Build output | `build` | R2 |
| Netlify publish directory | `build` | R2 |
| Netlify Functions directory | `netlify/functions` | R2 |
| Tracked functions | `places-nearby.js`, `places-photo.js` | R4 |
| Frontend routes | `/.netlify/functions/places-nearby`, `/.netlify/functions/places-photo` | R4 |
| Required server variable name | `GOOGLE_PLACES_API_KEY` | R4 |
| Redirects/rewrites | No tracked `_redirects` or `netlify.toml` redirect block | R5 |
| Runtime selection | No repository-level Node or npm version selection | R3 |
| Git deploy automation | No tracked deployment workflow or trigger | R5 |
| Production/preview policy | No tracked production-branch, branch-deploy, or deploy-preview policy | R5 |
| Commit exposure | No tracked release or deployed-commit marker | R5 |

These facts define repository intent; they do not prove provider-side settings
or the origin of the live artifact.

## 3. Netlify site identity

| Field | Result | Classification | Evidence |
|---|---|---|---|
| Public hostname | `ubiquitous-melomakarona-874d9c.netlify.app` | Verified — public live | P1, P2 |
| Local site ID | `9df12298-e795-42f0-9c00-3ff464f8b41e` | Verified — local metadata | L1 |
| Account or team | Unresolved | Authenticated access required | A1–A4 |
| Netlify project/site display name | Unresolved; the public hostname suggests a slug but does not prove the provider-side display name | Unresolved | A2, A4 |
| Canonical URL setting | Unresolved; the supplied Netlify URL is reachable but provider canonical-domain settings were unavailable | Unresolved | P1, P2, A2, A4 |
| Custom domains | Unresolved | Authenticated access required | A2, A4 |
| Creation date | Unresolved | Authenticated access required | A2, A4 |
| Site state | Provider state unresolved; public homepage reachable at capture time | Mixed | P2, A2, A4 |

The local site ID is useful correlation evidence, but an ignored local state
file can be stale or copied. It is not independent proof that the current
Netlify account owns the public hostname or that the repository remains linked.

## 4. Repository linkage and automatic deployment

No Netlify-confirmed linkage evidence was obtainable. The authenticated
dashboard was unavailable, the public API denied access, the CLI was absent, and
the repository contains no Netlify/GitHub deployment workflow.

| Question | Result | Evidence |
|---|---|---|
| Repository provider | Unresolved on Netlify; repository remote is GitHub | R1, A2, A4 |
| Linked owner/repository | Unresolved | A2, A4 |
| Site linked to GitHub | Unresolved independently; Packet 138 says automatic GitHub deployment has not been established | E1 |
| Production branch | Unresolved | R5, A2, A4 |
| Automatic production deploys | Unresolved independently; packet context says not established | E1 |
| Deploy previews | Unresolved | R5, A2, A4 |
| Branch deploys | Unresolved | R5, A2, A4 |

## 5. Current production deploy

The currently published static page is reachable, but authenticated deploy
metadata was unavailable.

| Field | Result | Evidence |
|---|---|---|
| Deploy ID | Unresolved | A2, A4 |
| Deploy URL | No unique deploy URL obtained; supplied production URL verified reachable | P2 |
| Deploy type/context | Unresolved | A2, A4 |
| Created/published timestamps | Unresolved | A2, A4 |
| Deploy state | Provider state unresolved; public page returned `200` | P2 |
| Build skipped | Product Owner-supplied, not independently reproduced | E1 |
| Source/upload method | Appears manual/prebuilt per packet context; not independently reproduced | E1 |
| Git provider/repository/branch | Unresolved | A2, A4 |
| Commit SHA/reference/message | Unresolved | A2, A4, P4 |
| Deploy title | Unresolved | A2, A4 |
| Initiator/actor | Unresolved | A2, A4 |

## 6. Recent deployment history

No recent-deploy list could be accessed without authentication. Therefore:

- no reasonable sample of prior deploys was available;
- no deploy IDs, timestamps, actors, upload methods, branches, or commit
  references were captured;
- deploy-preview and branch-deploy history remain unresolved; and
- neither the current nor previous deployments can be tied to Git commits.

This is an access limitation, not evidence that previous deploys do not exist.

## 7. Build and publish configuration

| Setting | Repository value | Netlify-confirmed value | Assessment |
|---|---|---|---|
| Base directory | Not configured | Unresolved | No comparison possible |
| Package directory | Not configured | Unresolved | No comparison possible |
| Build command | `npm run build` | Unresolved | Repository intent only |
| Publish directory | `build` | Unresolved | Repository intent only |
| Functions directory | `netlify/functions` | Unresolved | Repository intent; public photo route is unavailable |
| Framework detection | CRA evidenced in repository | Unresolved | Provider detection unavailable |
| Node/runtime | Unpinned in repository | Unresolved | Reproducibility risk |
| Build image/environment | Not tracked | Unresolved | Provider evidence unavailable |
| Build disabled | Not configured in repository | Unresolved | Packet context says latest build was skipped |
| UI overrides | Not repository-readable | Unresolved | Authenticated access required |
| Package manager | npm lockfile tracked | Unresolved | Provider choice unavailable |
| Dependency caching | No repository-specific setting | Unresolved | Provider relevance unavailable |
| Deploy-context overrides | None tracked | Unresolved | Provider settings unavailable |

The Packet 138 context and public function `404` are consistent with a static
manual upload that bypassed tracked function deployment, but they do not prove
the exact upload mechanism. That explanation remains a supported hypothesis,
not a Netlify-confirmed fact.

## 8. Functions configuration

Repository evidence defines two expected functions and matching client routes
(R4). Public evidence establishes:

- the `places-photo` endpoint returned `404 Not Found` from Netlify at
  12:13:20 UTC (P5);
- the response was HTML rather than the tracked function's expected redirect;
  and
- the `places-nearby` endpoint was not invoked to avoid a potentially paid
  provider request.

Conclusion: the expected photo-function route was unavailable in the published
site at capture time. Whether the nearby function exists, whether a platform
functions directory is configured, and whether a manual static upload omitted
both functions remain unresolved.

## 9. Environment-variable presence

| Variable | Repository use | Platform presence | Scope/context | Value |
|---|---|---|---|---|
| `GOOGLE_PLACES_API_KEY` | Server-side in both tracked functions | Unresolved | Unresolved | Not accessed |

No environment-variable interface was opened because authenticated Netlify
access was unavailable. No value was displayed, copied, exported, inferred, or
tested. The public function `404` cannot establish whether the variable exists;
route availability and environment configuration are separate concerns.

## 10. Live-site observations

### Redirect and HTTP evidence

- Plain HTTP returned `301 Moved Permanently` with
  `Location: https://ubiquitous-melomakarona-874d9c.netlify.app/` (P1).
- HTTPS returned `200 OK`, `Server: Netlify`,
  `Content-Type: text/html; charset=UTF-8`, HSTS, Netlify edge-cache headers,
  and Netlify request ID `01KYCK3DST7THWB5JKTA7GD0ZJ` (P2).
- The homepage response exposed no Git commit header (P2).

### Rendered application evidence

The browser reached the supplied URL without a redirect and rendered:

- the heading “DayGuide”;
- “Plan your perfect day in the UK”;
- Google sign-in, email sign-in, account creation, and email/password controls.

The browser document title remained `React App`, and the public description was
`Web site created using create-react-app`. Public assets included
`/static/css/main.4da42f33.css` and `/static/js/main.c71de4f9.js`. These hashes
identify artifacts, not a source commit (P3, P4).

No authentication was attempted, no form was submitted, and no external
application workflow was exercised.

## 11. Deployment provenance and commit traceability

The current deployment cannot be tied to a Git commit.

- No deploy record was accessible (A2, A4).
- No Git metadata was exposed in the observed headers or document metadata
  (P2, P4).
- The repository contains no deployed-commit exposure mechanism (R5).
- Packet context says the production deployment shows no Git commit and appears
  manual/prebuilt (E1).

The static asset hashes provide change-detection identifiers only. They cannot
be mapped to `76ec515` or another commit with the available evidence.

## 12. Rollback and recovery evidence

Authenticated deployment history and controls were unavailable. Packet 138 did
not click or invoke any rollback, publish, restore, lock, or recovery control.

The following remain unresolved:

- previous and currently published deploy identifiers;
- identification of a known-good deploy;
- publish-deploy or rollback capability;
- deployment locks;
- deploy retention;
- evidence required to restore a prior version; and
- whether static assets and functions would be restored together.

The repository contains no rollback runbook. Public site access alone cannot
establish provider recovery capability.

## 13. Confirmed facts

### Repository-confirmed

- GitHub is the repository remote, with `master` at `76ec515` when captured.
- Repository intent is CRA build → `build` publish output plus two functions
  from `netlify/functions`.
- Both functions use the server-only `GOOGLE_PLACES_API_KEY` name.
- No tracked Git deployment workflow, production/preview policy, runtime pin,
  redirect file, or deployed-commit marker exists.

### Local-metadata-confirmed

- `.netlify/state.json` records site ID
  `9df12298-e795-42f0-9c00-3ff464f8b41e`.

### Netlify-platform-confirmed

- No authenticated platform configuration fact was obtained.
- The unauthenticated site API denies access with HTTP `401`.

### Public-live-confirmed

- HTTP redirects to HTTPS.
- The HTTPS homepage returns `200` from Netlify.
- The page visibly renders DayGuide's authentication interface.
- Public metadata exposes generic CRA identity and hashed assets, but no commit.
- The expected `places-photo` function route returns `404`.

## 14. Unresolved facts

- Account/team, site display name, ownership, creation date, custom domains, and
  provider site state.
- Whether the local site ID still corresponds to the supplied live hostname.
- GitHub linkage, linked owner/repository, production branch, automatic deploys,
  deploy previews, and branch deploys.
- Current and recent deploy IDs, types, timestamps, actors, upload methods,
  titles, and Git provenance.
- Platform build command, publish/functions directories, overrides, runtime,
  build image, build-disable state, package-manager choice, caching, and
  context-specific configuration.
- `GOOGLE_PLACES_API_KEY` presence and scope.
- Live `places-nearby` route and live Google Places behaviour.
- Rollback, retention, lock, and known-good-deploy evidence.

## 15. Risks

- **Traceability:** the public artifact cannot be mapped to a reviewed commit.
- **Functional completeness:** the expected photo-function route is unavailable,
  so tracked restaurant-photo behaviour is not present at that route.
- **Deployment consistency:** a static manual upload may bypass tracked build
  and function configuration.
- **Secret-dependent functionality:** key presence cannot be verified, and the
  live nearby-search route was deliberately not tested.
- **Recovery:** no accessible evidence identifies a known-good deploy or
  rollback procedure.
- **Ownership:** site ownership and repository linkage are unresolved, so
  connecting Git without confirming authority could affect the wrong site or
  replace an unattributed production artifact.
- **Operational stasis:** leaving the current process unchanged preserves the
  reachable static page but also preserves missing provenance and the verified
  function-route gap.

## 16. Recommended next action

**Outcome: further evidence is required first.**

Do not establish a Git connection yet. Commission a Product Owner-authorised,
operator-attended, read-only Netlify capture in an already authenticated
session. It should verify:

1. account/team and site ownership against local site ID
   `9df12298-e795-42f0-9c00-3ff464f8b41e`;
2. canonical domains and site state;
3. repository linkage and production-branch configuration;
4. the current deploy ID, source, upload method, timestamps, actor, and any Git
   metadata;
5. recent deploy history and rollback/retention controls;
6. build, publish, functions, runtime, and deploy-context settings; and
7. presence and scope—never value—of `GOOGLE_PLACES_API_KEY`.

Until those facts are captured and reviewed, the existing manual deployment
should temporarily remain unchanged. Acting now could replace a reachable but
unattributed artifact without a verified recovery path; not acting leaves the
verified photo-function `404` and commit-traceability gap in place.
