# DayGuide — Netlify Recovery and Secret Configuration Evidence

## Document control

- **Packet:** 140 — Record Recovery Evidence and Netlify Secret Configuration
- **Evidence date:** 25 July 2026
- **Implementation agent:** Codex
- **Repository:** `C:\Users\neilf\Documents\dayguide\dayguide-app`
- **Repository baseline:** `8f94656 docs: record authenticated Netlify
  evidence`
- **Evidence source:** Product Owner-operated Netlify, File Explorer, and
  PowerShell sessions

This is a documentation-only evidence record. Codex did not access Netlify or
GitHub, open the recovery archive, inspect `.env.local`, access a secret value,
or perform a deployment or external configuration change.

## 1. Executive summary

The Product Owner preserved the current published Netlify artifact as a ZIP
outside the Git repository and recorded its size and SHA-256. The archive is a
recoverable copy of the production deployment published on 20 May 2026; it is
not a source-code backup and does not establish Git provenance.

The Product Owner also created the exact server-side Netlify variable required
by tracked functions:

```text
GOOGLE_PLACES_API_KEY
```

It is configured as a secret for Production and scoped to Builds, Functions,
and Runtime. The legacy client-prefixed variable remains unchanged.

Production deployment state did not change. No new deployment, republish, or
function request occurred, `places-photo` remains absent, Git remains unlinked,
and the current artifact still cannot be tied to a Git commit. The corrected
variable must not be described as operationally consumed or verified until a
controlled deployment and safe runtime check occur.

## 2. Evidence source and limitations

The Product Owner supplied observations from:

- an authenticated Netlify session;
- Windows File Explorer; and
- local PowerShell used for secret-safe transfer and archive hashing.

Codex transcribed those facts but did not independently reproduce them.

Limitations:

- the recovery ZIP was not opened or extracted;
- Codex did not access the ZIP or its filesystem location;
- `.env.local` was not inspected;
- the API-key value was not displayed, copied, compared, validated, tested,
  hashed, inferred, or recorded by Codex;
- no equality check between local and Netlify values was attempted;
- no Netlify environment value was opened;
- no function was invoked;
- no deployment or rollback was performed; and
- no evidence ties the current artifact to a Git commit.

The archive size and SHA-256 are Product Owner-supplied integrity evidence. The
hash identifies the archive bytes; it does not validate the archive contents,
source, behaviour, or Git provenance.

## 3. Recovery archive

The Product Owner downloaded the current published Netlify deployment through:

```text
Options → Download Deployed Files
```

The archive was preserved outside the Git repository at:

```text
C:\Users\neilf\Documents\dayguide-deployment-recovery\dayguide-production-deploy-2026-05-20.zip
```

Recorded properties:

| Property | Product Owner-supplied evidence |
|---|---|
| Related production deploy | Published 20 May 2026 |
| File size | 4,726,438 bytes |
| Archive opened | No |
| Archive extracted | No |
| Stored inside repository | No |

The archive is deployment-recovery evidence for the current Netlify production
artifact. It is not a source-code backup, does not replace the Git repository,
and does not establish which source commit produced the deployment.

The local path is recorded as evidence only. Repository documentation must not
link directly to it as if it were portable or universally accessible.

## 4. Recovery integrity evidence

Product Owner-supplied SHA-256:

```text
3D24A349173D80A61AAABD2E54FCD3B1FD61288E626C5FBA1166B4E9A0F10510
```

The hash permits a later authorised operator to detect whether the archived
bytes have changed. It does not prove:

- that the ZIP can be extracted;
- that its files are complete;
- that the artifact is known-good;
- that static files and functions can be restored together;
- that Netlify will accept it for recovery; or
- that it corresponds to a Git commit.

No integrity recheck was performed by Codex.

## 5. Environment-variable correction

The Product Owner created this exact Netlify variable:

```text
GOOGLE_PLACES_API_KEY
```

Authenticated configuration confirmed after creation:

| Field | Product Owner-supplied observation |
|---|---|
| Secret | Enabled |
| Scope | Builds, Functions, Runtime |
| Post Processing | Unavailable/crossed out |
| Deploy context | Production only |
| Netlify summary | `1 value in 1 deploy context` |
| Spelling and capitalisation | Verified exactly |
| Value disclosed | No |

Tracked `places-nearby.js` and `places-photo.js` read
`process.env.GOOGLE_PLACES_API_KEY`. The current Netlify configuration now
contains the exact name expected by tracked code for the Production context.

This corrects the name-absence recorded by Packet 139. It does not prove that
the already-published function has loaded or used the new value.

## 6. Existing client-prefixed variable

The existing variable remains:

```text
REACT_APP_GOOGLE_PLACES_API_KEY
```

Its authenticated Netlify summary remains:

- scoped to Builds, Functions, and Runtime; and
- four values in four deploy contexts.

Packet 140 did not delete, rename, rotate, edit, or inspect this variable. The
security concern remains: a `REACT_APP_` value can enter Create React App
browser output when available during a frontend build.

No evidence demonstrates that the current prebuilt artifact contains the
secret. Removal, temporary retention, or rotation requires a separately
authorised security and deployment decision.

## 7. Production deployment state

After `GOOGLE_PLACES_API_KEY` was created:

- the latest production deploy remained 20 May 2026 at 3:28 PM;
- no new deployment occurred;
- no deploy was republished;
- no function was invoked;
- `places-photo` remained absent from production;
- production commit traceability remained unresolved; and
- Git remained unlinked from Netlify.

The currently deployed function may not receive or use the corrected
configuration until a controlled deployment occurs. Packet 140 therefore does
not claim that `places-nearby` is fixed or operational.

## 8. Security handling

The Product Owner reported this secret-safe transfer:

1. PowerShell copied the value locally from the existing ignored `.env.local`
   file without displaying it.
2. The value was pasted directly into the authenticated Netlify form.
3. The value was not pasted into ChatGPT, Codex, documentation, Git, or command
   output.
4. The Windows clipboard was subsequently overwritten with:

   ```text
   [cleared]
   ```

Codex did not inspect `.env.local`, the clipboard, the Netlify form, or any
secret value. No tracked file contains an API-key value as a result of this
packet.

## 9. Confirmed outcomes

1. A production-deployment recovery ZIP was preserved outside the repository.
2. Its path, byte size, and SHA-256 were recorded.
3. The archive was not opened or extracted.
4. The exact Production variable name `GOOGLE_PLACES_API_KEY` is now configured.
5. It is secret-enabled and scoped to Builds, Functions, and Runtime.
6. Its value is limited to one Production deploy context.
7. The existing client-prefixed variable remains unchanged.
8. No secret value was disclosed.
9. No deployment, republish, rollback, or function request occurred.
10. The production artifact, Git linkage, and function inventory remain
    unchanged.

## 10. Remaining deployment gaps

- The current CLI artifact cannot be tied to a Git commit.
- Netlify remains unlinked from Git.
- `places-photo` remains absent from production.
- It is not known why the current CLI artifact omitted `places-photo`.
- It is not verified that a repository build packages both functions.
- The corrected Production variable has not been consumed or runtime-verified.
- Live `places-nearby` behaviour remains untested.
- The legacy client-prefixed variable remains configured.
- The recovery ZIP has not been opened, extracted, restored, or tested.
- A complete static-and-function rollback procedure remains unverified.
- Runtime and hosted-build configuration remain unresolved.

## 11. Risks

- **Unconsumed correction:** production may continue using old function
  configuration until a controlled deployment.
- **Function incompleteness:** the photo function remains absent.
- **Legacy client-prefixed variable:** a future CRA build could expose its
  value; current exposure is not proved.
- **Recovery uncertainty:** the ZIP's integrity identifier is recorded, but its
  contents and restoration process are untested.
- **Traceability:** production still has no attributable Git commit.
- **Change sequencing:** connecting Git or deploying before build/function and
  rollback preparation could replace the current artifact without sufficient
  verification.

## 12. Decision

**Recovery evidence has been preserved and the required Production server-side
variable has been configured, but production deployment remains unchanged and
unverified.**

Do not connect Git or deploy as part of Packet 140. The next packet must prepare
the first controlled, traceable deployment and its go/no-go criteria before any
production change.

## 13. Recommended next packet

**Packet 141 — Controlled Traceable Deployment Preparation**

Before connecting Git or deploying, Packet 141 should:

1. inspect why the current CLI artifact omitted `places-photo`;
2. confirm the repository build includes both Netlify Functions;
3. establish a safe verification plan for `places-nearby` that minimises
   external API cost;
4. determine whether `REACT_APP_GOOGLE_PLACES_API_KEY` should be removed,
   retained temporarily, or rotated;
5. prepare Git-connected Netlify settings and rollback steps; and
6. define explicit go/no-go acceptance criteria for the first traceable
   deployment.

Packet 140 does not implement or authorise Packet 141.
