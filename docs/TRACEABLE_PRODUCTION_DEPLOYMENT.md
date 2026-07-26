# DayGuide — First Traceable Production Deployment

## 1. Record identity

- **Packet:** 142 — First Traceable Production Deployment
- **Prerequisite:** Packet 143 — Deterministic Dependency Installation
- **Operational date:** 26 July 2026
- **Implementation agent:** Codex
- **Authenticated console operator:** Neil Franklin, Product Owner
- **Repository:** `neilfranklin66-blip/dayguide-app`
- **Production branch:** `master`
- **Canonical URL:** `https://ubiquitous-melomakarona-874d9c.netlify.app/`
- **Netlify project:** `ubiquitous-melomakarona-874d9c`
- **Netlify site ID:** `9df12298-e795-42f0-9c00-3ff464f8b41e`
- **Published commit:** `5ef141bf903521dbb9b7c53ff5af682a920ef5be`
- **Published deploy ID:** `6a6602bd6c7609eabb08d744`
- **Published at:** `2026-07-26T13:01:48.545Z`
- **Publication state at handoff:** published and locked

No secret value is recorded in this document or in tracked source.

## 2. Outcome

Packet 142 replaced the unattributed 20 May 2026 CLI production artifact with a
Git-connected, commit-attributable Netlify production deployment. The existing
site was retained; no new hosting project or provider was created.

The deployed production state now has:

- GitHub repository linkage to `neilfranklin66-blip/dayguide-app`;
- production branch `master`;
- repository-root build context;
- build command `npm run build`;
- publish directory `build`;
- functions directory `netlify/functions`;
- both `places-nearby` and `places-photo` deployed;
- a restricted replacement Google Places credential held as a Netlify secret;
- no `REACT_APP_GOOGLE_PLACES_API_KEY` Netlify variable;
- no Places credential or Places environment-variable name in the public
  JavaScript bundle; and
- manual publication locking retained after publication.

## 3. Production protection and recovery

Before provider changes:

- the 20 May production deploy was confirmed as the published deploy;
- Netlify publication was locked;
- the interface displayed `Unlock to start auto publishing`;
- the 18 May retained deploy exposed a manual `Publish deploy` recovery action;
  and
- the 20 May artifact had already been preserved outside the repository under
  Packet 140.

The retained 18 May deploy remained in Netlify state `ready` after publication
of Packet 142. It remains historical recovery evidence, not a full functional
rollback guarantee: the old Google credential was retired after live
verification, so an old artifact that depends on that credential might not
restore Places functionality.

No rollback was triggered because the verified candidate passed.

## 4. Credential migration

The Google project used by the May deployment was identified as:

- **Project name:** `My First Project`
- **Project ID:** `project-7e314c31-0522-4f34-ab8`
- **Organisation:** `neilfranklin66-org`

The historical credential was:

- named `Maps Platform API Key`;
- created 11 May 2026;
- permitted to access 33 APIs; and
- unrestricted by application.

The project showed no Google Maps Platform traffic for the widest available
30-day report period. That did not prove the key had never been exposed, but it
reduced the risk that another active application depended on it.

Google Cloud did not expose a one-click rotation action in the observed
interface. The migration therefore used the equivalent two-key sequence:

1. Create `DayGuide Netlify Places Key`.
2. Restrict it to `Places API` only, not `Places API (New)`.
3. Leave application restriction as `None` because ordinary Netlify Functions
   do not provide a fixed outbound IP suitable for an IP allow-list.
4. Store the replacement in Netlify as the Production value of exact
   `GOOGLE_PLACES_API_KEY`.
5. Verify the replacement through the unpublished candidate.
6. Publish the verified candidate.
7. Delete the historical 33-API key.

The Product Owner handled all secret-value copy and paste. Codex did not receive,
display, store, or commit either credential value.

### Netlify scope limitation

`GOOGLE_PLACES_API_KEY` is marked `Contains secret values` and has one value in
the Production deploy context. The current Netlify plan required an upgrade to
change its scope from Builds, Functions, and Runtime to Functions only. No
upgrade was authorised or purchased, so the existing three scopes remain.

This residual is contained by all of the following:

- the key is Production-only;
- the key is marked as secret;
- Google limits it to Places API;
- current browser code does not read it;
- Create React App exposes only `REACT_APP_*` variables by name; and
- the published bundle was checked and contains neither the server variable
  name nor the replacement Places credential.

## 5. Legacy client variable removal

Authenticated Netlify evidence established that
`REACT_APP_GOOGLE_PLACES_API_KEY` still held values in Production, Deploy
Previews, Branch deploys, and Preview Server & Agent Runners. Local development
was empty.

The variable was deleted in full. A candidate built before deletion was
deliberately rejected after bundle inspection found two Google-format keys and
the legacy variable name. It was never published.

The replacement no-cache candidate was built only after deletion. Its public
bundle contained:

- zero `REACT_APP_GOOGLE_PLACES_API_KEY` names;
- zero `GOOGLE_PLACES_API_KEY` names; and
- one Google-format browser key, traced to tracked `src/firebase.js`.

Firebase web configuration is intentionally public and is not the Places
server credential.

## 6. Git linkage and build chronology

The existing Netlify project was linked to GitHub with:

- repository owner `neilfranklin66-blip`;
- repository `dayguide-app`;
- production branch `master`;
- blank base directory;
- build command `npm run build`;
- publish directory `build`; and
- functions directory `netlify/functions`.

The first locked Git-connected candidate targeted Packet 141 commit
`f049d398d2bb93c5c25502020fa6683c34d5230b`. It failed before deployment with:

```text
[eslint] package.json » eslint-config-react-app/jest#overrides[0]:
Environment key "jest/globals" is unknown
```

The May production deployment remained unchanged. No rollback was required and
no Google verification request was made by that failed build.

Reproduction from an isolated tracked-source export established that current
npm no longer accepted the existing dependency graph consistently without the
legacy peer-resolution mode required by the Create React App 5 stack.

Packet 143 added exactly:

```text
legacy-peer-deps=true
```

to `.npmrc`. Its isolated verification under Node `v24.15.0` and npm `11.12.1`
passed:

- clean `npm ci`;
- 37 test suites;
- 927 tests;
- zero failed tests;
- production build; and
- 229.26 kB gzipped main JavaScript bundle.

Packet 143 commit `5ef141bf903521dbb9b7c53ff5af682a920ef5be`
was fast-forwarded to `master` and pushed. Netlify then produced a ready locked
candidate for that exact commit.

The first ready Packet 143 candidate was not published because it predated
legacy-variable deletion. Netlify then ran `Retry without cache with latest
branch commit`. The resulting clean candidate:

- deploy ID `6a6602bd6c7609eabb08d744`;
- built from 13:51:16 to 13:51:52 Europe/London;
- uploaded four new files;
- changed one generated page and three assets;
- deployed two functions; and
- completed all build, deploy, cleanup, and post-processing stages.

## 7. Candidate and live verification

The unpublished candidate homepage returned HTTP `200`.

The bounded provider verification used:

- one valid nearby search for restaurants around
  `51.5074,-0.1278`, radius 1000 metres; and
- one dependent photo request from a returned photo reference.

Results:

- nearby status `OK`;
- 20 nearby results;
- at least one dependent photo reference; and
- photo response `302 Found` to `lh3.googleusercontent.com`.

A prior missing-parameter probe returned Google `INVALID_REQUEST`; it did not
validate the credential and is not treated as the authorised successful nearby
check. No provider request was repeated after publication.

After deliberate publication, public evidence confirmed:

- canonical homepage HTTP `200`;
- published deploy ID `6a6602bd6c7609eabb08d744`;
- published commit
  `5ef141bf903521dbb9b7c53ff5af682a920ef5be`;
- published bundle `/static/js/main.3e20a375.js`;
- zero legacy-variable names in the public bundle;
- zero server-variable names in the public bundle;
- only the intended Firebase browser key pattern remained;
- two functions were included in the published deploy; and
- publication remained locked.

The historical Google key was deleted only after these checks passed.

## 8. Residual issues and boundaries

- Auto publishing remains locked. Future production publication requires a
  deliberate operator action.
- Functions-only secret scope is unavailable without a Netlify plan upgrade.
  No upgrade is presently justified by this packet.
- The Create React App 5 dependency stack requires
  `legacy-peer-deps=true`. Packet 143 makes that requirement explicit and
  reproducible; modernising the build stack is a separate change.
- The clean install reported dated dependency-audit findings. No automatic
  `npm audit fix` or breaking dependency upgrade was attempted.
- Firebase authentication providers, authorised domains, Firestore rules, and
  a complete signed-in production journey remain outside Packet 142.
- Google billing alerts, quotas, and cost thresholds were observed only to the
  extent needed for credential migration; no financial thresholds were changed.
- Entering the separate Google project `dayguide1` during project
  identification produced an unused key dated 26 July 2026. It is not used by
  DayGuide and was not deleted because cleanup of an unrelated project was not
  authorised. Its ownership and safe removal require a separate bounded check.

## 9. Release decision

Packet 142 is **accepted operationally** for its defined objective:

- the existing Netlify project is Git-connected;
- production is attributable to an exact reviewed commit;
- the build is reproducible under the tracked compatibility setting;
- both functions are deployed;
- the replacement Places credential works;
- the public Places credential path is removed;
- the broad historical credential is retired;
- production is manually locked; and
- a retained historical deploy remains available.

This record is committed locally with `[skip netlify]` and is not pushed by
Packet 142, so documenting the deployment cannot trigger another Netlify build.
