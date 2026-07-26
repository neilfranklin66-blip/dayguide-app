# DayGuide — Controlled Traceable Deployment Preparation

## Document control

- **Packet:** 141 — Controlled Traceable Deployment Preparation
- **Preparation date:** 26 July 2026
- **Implementation agent:** Codex
- **Repository:** `C:\Users\neilf\Documents\dayguide\dayguide-app`
- **Repository baseline:** `bbb12ea docs: record recovery and Netlify secret
  configuration`
- **Production change:** None
- **External setting change:** None

This packet prepares one controlled release from known Git source. It does not
connect Git, change a provider setting, invoke a live function, deploy, publish,
or inspect a secret or recovery archive.

## 1. Decision summary

**GO — prepare an explicitly authorised Packet 142, subject to its operational
preconditions and sequence.**

The repository is ready to be used as the source of a controlled Netlify build:

- `master` identifies the source to deploy;
- the tracked Netlify configuration selects the expected build output and
  functions directory;
- both required function files are tracked;
- automated function tests verify server-only key handling;
- current client code does not read the legacy client-prefixed key;
- Node.js major version 24 is pinned for the hosted and local build; and
- the build, function, verification, publication, and rollback sequence is
  defined below.

This is not a claim that production is already corrected. The existing
20 May 2026 CLI artifact remains live, unlinked to Git, and unverified against
the corrected Production variable.

Packet 142 must treat the old Google Places credential as potentially public.
Before a new frontend build, it must provision a replacement through a
secret-safe operator action, update exact Production variable
`GOOGLE_PLACES_API_KEY`, and remove `REACT_APP_GOOGLE_PLACES_API_KEY` from all
Netlify deploy contexts. The old provider credential remains enabled only until
the replacement deployment passes its live checks, then is retired.

## 2. Evidence classification

- **Verified — repository:** directly established from tracked files, bounded
  Git history, or repeatable local checks.
- **Product Owner-supplied operational evidence:** authenticated or local facts
  supplied during Packets 139 and 140, not independently reproduced by Codex.
- **Official provider guidance:** current Netlify documentation used to prepare
  settings and operating steps.
- **Inference:** a conclusion supported by named evidence but not directly
  attributable to the old production artifact.
- **Unresolved:** evidence is insufficient.

Codex did not inspect `.env.local`, either protected untracked folder, a secret
value, the recovery ZIP, or an authenticated Netlify or GitHub session.

## 3. Why production omitted `places-photo`

### Verified chronology

| Event | Evidence |
|---|---|
| Current production artifact published | 20 May 2026 at 3:28 PM, Product Owner-transcribed Netlify evidence |
| Latest tracked `master` commit before that time | `3bd5a7e`, dated 18 May 2026 |
| `places-nearby.js` first tracked | `28a0ee2`, dated 12 May 2026 |
| `places-photo.js` first tracked | `ed3b055`, dated 7 July 2026 |
| Server-only Places architecture introduced | `ed3b055`, dated 7 July 2026 |

The strongest supported explanation is chronological: `places-photo.js` did not
exist in tracked Git history until 7 July, 48 days after the current production
artifact was published. A deployment produced from the tracked May repository
state could include `places-nearby` but could not include the later
`places-photo` file.

This explains the observed inventory without implying a Netlify packaging
failure. It is not absolute provenance: the old CLI artifact has no source
commit, so uncommitted or non-repository inputs cannot be reconstructed. No
evidence shows that current Netlify configuration omitted a function that
already existed at the time.

## 4. Current repository deployment definition

Root [`netlify.toml`](../netlify.toml) declares:

```toml
[build]
  command = "npm run build"
  publish = "build"
  functions = "netlify/functions"
```

Repository-root [`package.json`](../package.json) defines `npm run build` as
`react-scripts build`. The base directory is unset and therefore defaults to
the repository root.

The configured functions directory contains both tracked JavaScript handlers:

```text
netlify/functions/places-nearby.js
netlify/functions/places-photo.js
```

The Create React App command produces the static `build` directory. It does not
copy Netlify Functions into that directory. Netlify separately reads the
configured functions directory during its build and prepares supported files as
functions. This distinction matters: successful static compilation alone is
not proof of a complete Netlify deploy.

Current Netlify guidance:

- [Build configuration overview](https://docs.netlify.com/build/configure-builds/overview/)
- [Functions configuration](https://docs.netlify.com/build/functions/configuration/)

Packet 141 verifies repository selection and handler tests. Packet 142 must
confirm the hosted build log and deployed function inventory before publication.

## 5. Runtime decision

Tracked [`.node-version`](../.node-version) pins Node.js major version:

```text
24
```

Reasons:

- Packet 141 ran under Node 24;
- Netlify currently lists Node 24 as its default build version;
- Netlify supports `.node-version` in the repository base directory; and
- a source-controlled major pin prevents an unrelated default-major change
  from silently changing the build.

Netlify may select the latest available 24.x patch. Packet 142 must record the
exact hosted Node and npm versions from the build log.

Official guidance:

- [Manage build dependencies](https://docs.netlify.com/build/configure-builds/manage-dependencies/)
- [Available software at build time](https://docs.netlify.com/build/configure-builds/available-software-at-build-time/)

## 6. Function and key boundaries

Tracked production code establishes:

- both functions read `process.env.GOOGLE_PLACES_API_KEY`;
- neither function falls back to `REACT_APP_GOOGLE_PLACES_API_KEY`;
- current client `src/api/placesApi.js` calls relative function URLs and reads
  no environment key;
- `places-nearby` returns `REQUEST_DENIED`/`NO_API_KEY` when the server variable
  is absent; and
- `places-photo` falls back to a placeholder when its server key or photo
  reference is unavailable.

Automated regression coverage confirms that:

- the client source contains no client-prefixed key reference;
- a legacy client-prefixed variable cannot satisfy either function;
- the server key is attached only to provider requests; and
- the test key does not enter function responses.

These are repository guarantees. Production behaviour remains unverified until
the later hosted build and bounded live checks.

## 7. Legacy variable and credential decision

### Evidence

At tracked May deployment point `3bd5a7e`:

- `src/api/placesApi.js` read
  `process.env.REACT_APP_GOOGLE_PLACES_API_KEY`; and
- `netlify/functions/places-nearby.js` also read the client-prefixed name.

Packet 139 later recorded `REACT_APP_GOOGLE_PLACES_API_KEY` configured for
Builds, Functions, and Runtime across four deploy contexts. Packet 140 records
that a locally held value was transferred, without display, to the new
Production `GOOGLE_PLACES_API_KEY` variable. No value was accessed by Codex and
no equality claim is made.

A Create React App variable with a `REACT_APP_` name can be embedded in browser
output when referenced during a build. The May source did reference it.
Evidence does not prove that the May build environment supplied a value, or
that the current bundle contains one, but exposure is plausible enough that the
old credential must not be trusted as private.

### Decision

**Replace, verify, retire, and remove; do not retain as normal configuration.**

Packet 142 must, before any new build:

1. create a replacement Google Places credential using a secret-safe
   Product Owner-operated flow;
2. apply the required Google API restrictions and cost controls;
3. replace the Production value of exact `GOOGLE_PLACES_API_KEY` without
   exposing it;
4. delete `REACT_APP_GOOGLE_PLACES_API_KEY` from every Netlify deploy context;
5. confirm names and scopes only, never values;
6. keep the old Google credential enabled during the locked candidate build and
   initial live verification; and
7. capture the completion time so later build evidence proves which
   configuration it consumed.

Netlify documents that each deploy uses the environment-variable values set at
its deployment time. Removing the legacy variable from current site
configuration therefore does not rewrite the already-published May function
environment:

- [Environment variables and serverless functions](https://docs.netlify.com/build/functions/environment-variables/)

After the new deployment passes nearby and photo verification, disable the old
Google credential promptly. This two-phase rotation preserves the old deploy as
a working rollback target during the riskiest part of the change while still
preventing the legacy variable from entering the new build. Because the old
credential may already be public, its final retirement is a security
prerequisite for Packet 142 acceptance, not general clean-up.

Packet 141 does not authorise or perform these operations.

## 8. Exact Netlify connection settings

Use the existing project; do not create another:

| Setting | Required value |
|---|---|
| Project | `ubiquitous-melomakarona-874d9c` |
| Site ID | `9df12298-e795-42f0-9c00-3ff464f8b41e` |
| Git provider | GitHub |
| Repository | `neilfranklin66-blip/dayguide-app` |
| Repository URL | `https://github.com/neilfranklin66-blip/dayguide-app` |
| Production branch | `master` |
| Base directory | Unset / repository root |
| Package directory | Unset |
| Build command | `npm run build` |
| Publish directory | `build` |
| Functions directory | `netlify/functions` |
| Node.js | Major 24 from tracked `.node-version` |
| Deploy previews | Disabled for the first controlled release |
| Branch deploys | Disabled |
| Production secret name | `GOOGLE_PLACES_API_KEY` |
| Production secret scope | Builds, Functions, Runtime; Production context |

Tracked `netlify.toml` is the authority for build, publish, and functions paths.
UI values must not override it with different paths.

Linking a repository establishes continuous deployment. Current Netlify
guidance says repository linking activates builds, and pushing to the production
branch triggers builds:

- [Repository permissions and linking](https://docs.netlify.com/configure-builds/repo-permissions-linking/)
- [Create deploys](https://docs.netlify.com/deploy/create-deploys/)

## 9. Safe first-deploy sequence

Packet 142 should use this order:

1. Confirm local and remote `master` identify the approved Packet 142 commit.
2. Record the current production deploy identity and confirm the retained
   rollback target is still available.
3. Lock the currently published deploy to stop auto publishing.
4. Create the restricted replacement credential and update only exact
   Production `GOOGLE_PLACES_API_KEY`.
5. Remove `REACT_APP_GOOGLE_PLACES_API_KEY` from every Netlify context while
   leaving the old provider credential enabled temporarily.
6. Link the existing Netlify project to the named GitHub repository.
7. Select `master` and the exact settings in section 8.
8. Trigger or allow one build of the known `master` commit.
9. Keep the resulting deploy unpublished while inspecting:
   - Git commit identity;
   - Node and npm versions;
   - dependency installation;
   - build result;
   - publish directory;
   - both packaged functions; and
   - absence of a client-prefixed variable name in configuration.
10. If every pre-publication criterion passes, deliberately publish that deploy.
11. Execute the one-request nearby check in section 10.
12. If nearby succeeds and supplies a photo reference, perform one photo check.
13. If both checks pass, disable the old provider credential.
14. Record deployment, verification, and old-credential retirement evidence.
15. Unlock auto publishing only after the Product Owner accepts the traceable
    workflow; otherwise keep the deploy locked.

Netlify documents that locking stops auto publishing while allowing new deploys
to build and remain available for deliberate publication:

- [Manage deploys — locked deploys and rollback](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/)

If the UI does not permit the project to be locked before repository linking,
stop and record **NO-GO**. Do not test connection behaviour on production.

## 10. Cost-minimised live verification

Packet 141 does not execute this request.

Use a public, non-personal central-London coordinate and one request:

```text
GET https://ubiquitous-melomakarona-874d9c.netlify.app/.netlify/functions/places-nearby?location=51.5074%2C-0.1278&radius=1000&type=restaurant
```

The request contains no key, credential, personal location, keyword fan-out, or
client-controlled provider URL. The tracked handler makes at most one Google
Nearby Search request.

Success criteria:

- HTTP `200`;
- JSON response;
- provider `status` is `OK` or the valid no-match outcome `ZERO_RESULTS`;
- for `OK`, `results` is an array;
- response body contains no key or secret; and
- Netlify records exactly one invocation for the check.

Failure meanings:

| Outcome | Decision |
|---|---|
| HTTP `404` | Function missing — rollback/no-go |
| `REQUEST_DENIED` with `NO_API_KEY` | corrected secret not consumed — rollback/no-go |
| Other `REQUEST_DENIED` | credential/API restriction failure — rollback/no-go |
| `OVER_QUERY_LIMIT` | quota or billing control failure — no-go; publication decision reviewed |
| HTTP `5xx` or `FETCH_ERROR` | provider/network failure — retry once only if clearly transient; otherwise no-go |
| `ZERO_RESULTS` | valid function/provider response; nearby proxy passes |

Only after an `OK` response contains a photo reference, request once:

```text
GET https://ubiquitous-melomakarona-874d9c.netlify.app/.netlify/functions/places-photo?ref=<URL-ENCODED_RETURNED_REFERENCE>&maxwidth=400
```

Success is a redirect to a provider image/CDN URL and a loadable image. A
placeholder, `404`, exposed key, or broken redirect is a failure.

## 11. Rollback plan

### Target and evidence

- Pre-change live deployment: published 20 May 2026 at 3:28 PM.
- Provider control: the retained successful deploy offers `Publish deploy`.
- External recovery evidence:
  `C:\Users\neilf\Documents\dayguide-deployment-recovery\dayguide-production-deploy-2026-05-20.zip`
- Recorded size: `4,726,438` bytes.
- Recorded SHA-256:
  `3D24A349173D80A61AAABD2E54FCD3B1FD61288E626C5FBA1166B4E9A0F10510`.

The ZIP was not opened, extracted, or proven restorable. It is secondary
recovery evidence, not the primary rollback mechanism.

### Rollback triggers

Rollback the new deploy if any of these occurs after publication:

- homepage or authentication shell fails to load;
- deployed commit differs from the approved commit;
- hosted build or function inventory cannot be attributed to that commit;
- either required function is absent;
- nearby verification returns a blocking failure from section 10;
- the photo function is missing or exposes a credential;
- the production secret name/scope is incorrect; or
- a material security or data-integrity issue appears.

### Operator steps

1. Stop further checks and record the failure without exposing secrets.
2. Keep auto publishing locked.
3. Open the retained 20 May deployment detail.
4. Verify its date and prior production identity.
5. Select `Publish deploy`.
6. Confirm the canonical URL serves the previous DayGuide shell.
7. Confirm the production deploy list identifies the republished target.
8. Record rollback time, actor, target, reason, and resulting public status.
9. Leave Git connected only if it cannot overwrite the rollback while locked;
   otherwise unlink only under explicit Product Owner authority.

Netlify describes republishing a retained successful deploy as an atomic,
instant rollback that does not rebuild it. A later Git-triggered production
deploy can overwrite the rollback if auto publishing is enabled, which is why
the lock remains part of the procedure.

The recorded 90-day deletion policy limits older recovery points. Current
Netlify guidance says the currently published deploy and most recent successful
production deploy are exceptions to automatic deletion, but availability must
still be confirmed immediately before Packet 142.

Each deploy retains the environment-variable values from its deployment time,
so deleting the legacy Netlify variable does not rewrite the May deploy.
However, disabling the old Google credential after successful verification
means a later rollback to May may restore the artifact but not its Google
provider access. Re-enabling an exposed credential would require a separate,
explicit security decision. Packet 142 must record this limitation when it
retires the old credential.

## 12. Packet 142 go/no-go criteria

### GO prerequisites

Packet 142 may begin only when its instruction explicitly authorises:

- replacement-credential creation, secret-safe Netlify update, and retirement
  of the old credential after successful verification;
- removal of the legacy client-prefixed variable from all contexts;
- locking the current deploy;
- GitHub repository connection;
- one traceable build;
- deliberate publication after inspection;
- one nearby request and, conditionally, one photo request; and
- rollback if a named trigger occurs.

Before publication, Packet 142 must confirm:

- local and remote `master` equal the approved commit;
- the retained rollback target is available;
- exact Production `GOOGLE_PLACES_API_KEY` is secret-enabled and correctly
  scoped after rotation;
- `REACT_APP_GOOGLE_PLACES_API_KEY` is absent from every context;
- the Netlify build identifies the approved Git commit;
- Node uses major version 24;
- `npm run build` succeeds;
- publish directory is `build`;
- `places-nearby` and `places-photo` are both packaged;
- the candidate deploy remains unpublished; and
- no secret appears in logs or captured evidence.

### NO-GO conditions

Stop without publication if:

- any required setting differs;
- connection cannot be performed while publication is locked;
- the build is not attributable to the approved commit;
- build or function packaging fails;
- either function is absent;
- the legacy variable remains available to the build;
- the rotated server variable name/scope is not confirmed;
- the rollback target is unavailable;
- a secret is displayed or copied into evidence; or
- a newly discovered condition materially threatens security, traceability,
  function completeness, or recovery.

Generic Create React App metadata, the Git global-ignore warning, broad
technical debt, non-critical UI polish, and unrelated external-service
uncertainties are not Packet 142 blockers.

## 13. Packet 141 verification

Completed on 26 July 2026:

- Node version: `v24.15.0`
- npm version: `11.12.1`
- targeted Netlify function tests: 1 suite, 8 tests passed
- complete automated suite: 37 suites, 927 tests passed; zero snapshots
- production build: compiled successfully from an isolated clean export of
  tracked source
- main JavaScript bundle: 229.26 kB gzipped
- Markdown/reference review: passed
- `git diff --check`: passed
- authorised-path review: passed; five authorised files only

The first isolated-build method failed before compilation because Windows
blocked the temporary junction from writing ESLint's ordinary dependency cache.
An independent offline dependency install was then attempted but stopped because
the local npm cache lacked an optional TypeScript peer package. No package was
downloaded or added. The successful method reused the repository's existing
installed dependencies while building an isolated tracked-source export. That
export contained no untracked `.env.local` or protected folder.

## 14. Residual risks

- No hosted Netlify build has yet confirmed function packaging.
- No live function has been invoked.
- Production Firebase behaviour remains unverified and belongs to the later
  Private Alpha journey.
- Google credential restrictions, billing, and quota controls require
  Product Owner-operated confirmation during the separately authorised
  operational packet.
- The old artifact remains unattributed.
- The retained-deploy rollback route has not been exercised.
- The external ZIP is not a tested restore mechanism.
- Netlify UI wording or control order may differ from current official
  documentation; any material mismatch is a stop condition, not permission to
  improvise.

These risks are bounded by the locked candidate-deploy sequence and explicit
rollback criteria. They do not justify unrelated remediation before the first
controlled release.
