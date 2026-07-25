# DayGuide — Authenticated Netlify Configuration Evidence

## Document control

- **Packet:** 139 — Record Authenticated Netlify Configuration Evidence
- **Evidence-capture date:** 25 July 2026
- **Implementation agent:** Codex
- **Repository:** `C:\Users\neilf\Documents\dayguide\dayguide-app`
- **Repository baseline:** `6b9b2ff docs: capture read-only Netlify deployment
  evidence`
- **Evidence source:** authenticated Netlify browser session operated by the
  Product Owner
- **Transcription source:** authenticated facts supplied in the approved
  Packet 139 instruction

Codex did not access Netlify or GitHub during Packet 139. This document
transcribes the Product Owner's authenticated observations and compares them
with tracked repository evidence and Packet 138 public-live evidence. No secret
value was opened, copied, exported, inferred, tested, or recorded.

## 1. Executive summary

The authenticated Netlify project is
`ubiquitous-melomakarona-874d9c`, owned by `DayGuide`, with site ID
`9df12298-e795-42f0-9c00-3ff464f8b41e`. The authenticated site ID matches the
local metadata ID already recorded by Packet 138.

The project is not linked to a Git repository. The current production deployment
was last deployed from CLI, with all Netlify build stages skipped. It cannot be
tied to a Git repository, branch, or commit.

One production function, `places-nearby`, is actively running.
`places-photo` is not listed and Packet 138 independently observed its public
route returning `404 Not Found`.

The exact server-side variable required by tracked code,
`GOOGLE_PLACES_API_KEY`, was absent from the authenticated variable list. The
configured name is `REACT_APP_GOOGLE_PLACES_API_KEY`. This is a confirmed
configuration-name mismatch, but production nearby-search failure was not
tested or conclusively established.

An earlier retained deploy can be manually republished, but automatic deploy
deletion is set to 90 days. Git must not be connected until configuration and
recovery gaps are addressed in a controlled packet.

## 2. Evidence source and limitations

### Evidence classes

- **Authenticated Product Owner-transcribed Netlify evidence:** the Product
  Owner observed the fact in an authenticated Netlify browser session and
  supplied it in Packet 139; Codex did not independently access the interface.
- **Verified — repository:** tracked files or local Git metadata directly prove
  the fact.
- **Verified — public live:** Packet 138 directly observed the fact using a
  bounded public request or browser render.
- **Codex inference:** a reasoned conclusion drawn from named evidence and
  explicitly labelled as inference.
- **Unresolved:** available evidence is insufficient.

### Limitations

- No screenshots, exports, deploy downloads, or API responses were supplied to
  Codex.
- No Netlify deploy, function, environment-variable value, setting, or control
  was opened by Codex.
- No Git provider, branch, commit SHA, commit message, or deploy message was
  displayed in the authenticated evidence.
- The deployed artifact is not attributable to tracked source.
- The live `places-nearby` endpoint was not invoked.
- The function-log panel remained on `Loading`; no request, warning, or error
  evidence was available.
- Provider runtime, current function source, deploy IDs, exact artifact file
  list, and credential-control details remain unknown.

Authenticated observations are recorded as authoritative Product
Owner-transcribed evidence, not misrepresented as independently reproduced by
Codex.

### Packet 140 subsequent evidence

Packet 139's statement that exact `GOOGLE_PLACES_API_KEY` was absent is a dated
finding from the authenticated capture. Packet 140 later recorded that the
Product Owner:

- preserved the current production artifact outside the repository with
  recorded size and SHA-256 evidence; and
- created exact `GOOGLE_PLACES_API_KEY` as a secret for the Production context,
  scoped to Builds, Functions, and Runtime.

The legacy client-prefixed variable remained configured, and no deployment or
function invocation followed the correction. Current recovery and configuration
evidence is in
[`NETLIFY_RECOVERY_AND_SECRET_CONFIGURATION.md`](NETLIFY_RECOVERY_AND_SECRET_CONFIGURATION.md).
Codex did not access the archive, `.env.local`, Netlify, or a secret value.

## 3. Project identity

| Field | Authenticated observation |
|---|---|
| Project name | `ubiquitous-melomakarona-874d9c` |
| Owner | `DayGuide` |
| Project/Site ID | `9df12298-e795-42f0-9c00-3ff464f8b41e` |
| Created | 11 May 2026 at 11:09 AM |
| Last updated | 11 June 2026 at 1:35 AM |
| Production domain | `ubiquitous-melomakarona-874d9c.netlify.app` |
| Custom domains | None shown |

Packet 138 recorded the same site ID from ignored local `.netlify/state.json`
metadata and independently verified the production hostname was reachable. The
matching authenticated ID strengthens site correlation. Packet 139 did not
reinspect the ignored local file.

## 4. Repository and continuous-deployment status

The authenticated project configuration showed:

```text
Current repository
Not linked
```

Confirmed consequences:

- no Git repository is connected to this Netlify project;
- continuous deployment from Git is not configured;
- no Netlify production branch currently applies; and
- GitHub's default branch being `master` is not Netlify production-branch
  configuration.

The Deploys page also showed:

```text
Last deployed from CLI.
Auto publishing is on. Deploys are published automatically.
```

**Auto publishing is not continuous deployment.** It means a successful manual
or CLI deploy is published automatically. It does not mean Git pushes trigger
Netlify builds.

Split Testing was unavailable because it requires a connected Git repository.

## 5. Production deployment history

The authenticated Deploys page showed these production entries:

| Date and time | Status | Duration | Deploy message | Git provenance displayed |
|---|---|---:|---|---|
| 20 May 2026 at 3:28 PM | Published | 2 seconds | None | None |
| 18 May 2026 at 6:08 PM | Completed | 35 seconds | None | None |
| 18 May 2026 at 6:00 PM | Completed | 24 seconds | None | None |
| 18 May 2026 at 5:06 PM | Completed | 24 seconds | None | None |
| 18 May 2026 at 3:47 PM | Completed | 1 second | None | None |
| 18 May 2026 at 2:36 PM | Completed | 4 seconds | None | None |
| 18 May 2026 at 11:43 AM | Completed | 22 seconds | None | None |
| 18 May 2026 at 9:39 AM | Completed | 28 seconds | None | None |
| 12 May 2026 at 4:47 PM | Completed | 5 seconds | None | None |
| 12 May 2026 at 4:03 PM | Completed | 3 seconds | None | None |
| 12 May 2026 at 3:57 PM | Completed | 5 seconds | None | None |
| 12 May 2026 at 2:46 PM | Completed | 6 seconds | None | None |

No provider repository, branch, commit SHA, commit reference, commit message, or
deploy message was displayed. No history entry can be tied to a known Git
commit.

## 6. Current production deploy

Latest published production deploy:

| Field | Authenticated observation |
|---|---|
| Published | 20 May 2026 at 3:28 PM |
| Source displayed at project level | CLI |
| Status | Production published |
| Deployment time | 2 seconds |
| Deploy message | None |
| Upload change | 4 new files uploaded |
| Generated content change | 1 generated page and 3 assets changed |
| Functions | 1 function deployed |
| Initialising | Skipped |
| Building | Skipped |
| Deploying | Skipped |
| Cleanup | Skipped |
| Post-processing | Complete |
| Artifact | 15 files, approximately 4.5 MB |
| Included `netlify.toml` | 479 B |

The deploy's Options menu contained:

- Download files
- Deploy settings

No rollback, restore, delete, republish, or download action was performed.

This evidence is consistent with a prebuilt CLI upload rather than a
Netlify-hosted repository build. It does not identify the source tree or commit
used to create the artifact.

## 7. Deployed Functions

The authenticated Functions page showed:

```text
1 function actively running in production
places-nearby
Created on May 12
```

Function detail:

| Field | Authenticated observation |
|---|---|
| Function | `places-nearby` |
| Status | Running in production |
| Endpoint | `https://ubiquitous-melomakarona-874d9c.netlify.app/.netlify/functions/places-nearby` |
| Log retention | 24 hours |
| Log panel | Remained on `Loading` |
| Runtime version | Not displayed |
| Recent requests, warnings, or errors | Not observable |
| Environment-variable names | Not displayed on the function page |

The Functions page did not list `places-photo`. Packet 138 independently
requested `/.netlify/functions/places-photo` and received `404 Not Found`.
Together, the authenticated list and public route evidence confirm that
`places-photo` is not deployed in the current production artifact.

No evidence establishes why the CLI deployment omitted it. The cause remains
unresolved.

## 8. Environment-variable configuration

The authenticated Environment Variables page showed:

```text
REACT_APP_GOOGLE_PLACES_API_KEY
Scoped to Builds, Functions, Runtime
4 values in 4 deploy contexts
```

Filtering by the exact required server name:

```text
GOOGLE_PLACES_API_KEY
```

still returned only:

```text
REACT_APP_GOOGLE_PLACES_API_KEY
```

Confirmed configuration facts:

- `REACT_APP_GOOGLE_PLACES_API_KEY` is present;
- it is scoped to Builds, Functions, and Runtime across four deploy contexts;
- exact `GOOGLE_PLACES_API_KEY` is absent from the authenticated variable list;
  and
- no value was opened, copied, exported, inferred, tested, or revealed.

Tracked `places-nearby.js` and `places-photo.js` read
`process.env.GOOGLE_PLACES_API_KEY`. This establishes a naming mismatch between
current tracked function requirements and authenticated Netlify environment
configuration.

Because the deployed function source cannot be tied to the repository and
`places-nearby` was not invoked, production operational failure is a risk rather
than conclusively proved.

A `REACT_APP_` variable can be embedded in browser output when it is available
during a Create React App frontend build. It is unsuitable as the intended
server-only secret configuration. The current artifact was prebuilt and was not
inspected for secret content, so this document does not claim that the deployed
browser bundle contains the value.

## 9. Domains and HTTPS

- Production uses the Netlify subdomain
  `ubiquitous-melomakarona-874d9c.netlify.app`.
- No custom domain is configured.
- The custom-domain certificate panel stated that a custom domain is required
  to provision a certificate there.
- Branch subdomains require a custom domain and branch deploys.
- Packet 138 independently verified successful HTTPS access to the Netlify
  subdomain and an HTTP-to-HTTPS redirect.

No domain, DNS, or certificate setting was changed.

## 10. Retention and rollback

Authenticated project settings showed:

- Functions region: `CMH (Ohio, US East)`;
- automatic deploy deletion: 90 days; and
- Pretty URLs: enabled.

The previous successful deploy from 18 May 2026 at 6:08 PM showed:

| Field | Authenticated observation |
|---|---|
| Recovery control | `Publish deploy` |
| Files | All files already uploaded by a previous deploy |
| Functions | 1 function deployed |
| Initialising/building/deploying/cleanup | Skipped |
| Post-processing | Complete |
| Artifact | 15 files, approximately 4.5 MB |
| Included `netlify.toml` | 618 B |

Its Options menu contained:

- Delete deploy
- Download deployed files
- Deploy settings

This confirms that a retained earlier successful deploy can be republished
manually, providing a manual rollback mechanism while that deploy remains
retained. No prior deploy was published, deleted, downloaded, or changed.

The 90-day automatic-deletion policy means older recovery points may be removed.
Netlify wording that files had the “same commits” is not Git provenance: no Git
repository or commit SHA was connected or displayed.

Whether republishing restores static files and functions together exactly as
expected was not tested.

## 11. Confirmed configuration gaps

1. The Netlify project is not linked to a Git repository.
2. Continuous deployment from Git is not configured.
3. The current production deploy came from CLI.
4. The current deploy cannot be tied to a Git commit.
5. Netlify build stages were skipped.
6. Only `places-nearby` is deployed.
7. `places-photo` is absent, and its public route returns `404`.
8. Exact server-side variable `GOOGLE_PLACES_API_KEY` is absent.
9. Only `REACT_APP_GOOGLE_PLACES_API_KEY` is configured for the relevant key
   name.
10. Rollback is manual through publishing a retained earlier deploy.
11. Deploy recovery points are subject to 90-day automatic deletion.

## 12. Risks

- **Release traceability:** production cannot be mapped to a reviewed Git
  commit.
- **Deployment reproducibility:** skipped hosted build stages and unknown
  prebuilt source prevent reproduction from Netlify evidence.
- **Function completeness:** the tracked photo proxy is absent from production.
- **Configuration mismatch:** the exact server-side variable expected by tracked
  code is absent.
- **Potential secret exposure:** a `REACT_APP_` variable could enter client
  output during a CRA frontend build; current artifact exposure is not proved.
- **Operational uncertainty:** live nearby-search success remains untested.
- **Recovery durability:** manual rollback depends on retained deploys that can
  be automatically deleted after 90 days.
- **Change risk:** connecting Git before correcting configuration and preserving
  recovery evidence could replace the current artifact without a verified
  rollback path.

## 13. Deployment decision

**Do not connect Git yet.**

The authenticated evidence closes important identity and configuration
questions but confirms production gaps that should be remediated before
continuous deployment is established. Packet 139 records evidence only and does
not authorise or implement remediation.

## 14. Recommended remediation sequence

1. Preserve or download a known-good production deploy as separately authorised
   recovery evidence.
2. Correct the server-side environment-variable naming without exposing the
   value.
3. Ensure both tracked functions are included in a controlled deployment.
4. Verify both function routes safely.
5. Establish Git-connected deployment from `master`.
6. Perform a traceable production deployment.
7. Verify the deployed Git commit and rollback procedure.

Each operational action requires a separately authorised packet. This sequence
does not authorise a deploy, download, variable change, repository link, or
rollback.

## 15. Prohibited conclusions and remaining unknowns

Do not conclude that:

- auto publishing means Git continuous deployment;
- the current artifact corresponds to a known Git commit;
- Netlify's “same commits” wording proves Git provenance;
- the deployed `places-nearby` source matches current tracked code;
- the configured variable value is present in the browser bundle;
- live nearby search is working or failing;
- the current artifact was produced by `netlify.toml`; or
- manual republishing has been tested as a complete recovery procedure.

Remaining unknowns:

- deployed function runtime and exact source;
- current deploy ID and unique deploy URL;
- source directory and commit used for the prebuilt CLI artifact;
- whether `places-nearby` succeeds in production;
- secret value, restrictions, ownership, rotation, billing, and quota controls;
- exact contents and known-good status of retained deploys;
- whether manual republishing restores functions and static assets together;
- deploy IDs and exact deletion dates under the retention policy; and
- the provider-side build/runtime configuration that would apply after a future
  Git connection.
