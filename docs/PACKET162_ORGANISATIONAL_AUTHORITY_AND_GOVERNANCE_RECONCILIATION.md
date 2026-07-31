# Packet 162 — Organisational Authority and Governance Reconciliation

**Date:** 31 July 2026

**Status:** Repository reconciliation complete; external authority amendments
await editable originals and Product Owner decisions

**Baseline:** `80e240b4b6e461550e894c6c9deebaf577fb035a`

## 1. Authority and boundary

Packet 162 reconciles the tracked Packet 146–161 evidence before any production
promotion. It is documentation-only. It authorises no product-code behaviour,
provider call, credential or environment change, Netlify action, GitHub push or
merge, PR change, publication, or deployment.

The protected untracked `.claude/`, `Dayguide#2/`, and
`docs/KNOWN_ISSUES (# Edit conflict 2026-07-26 1mdrfiC #).md` paths were not
inspected, searched, opened, modified, staged, moved, renamed, or deleted.

## 2. Evidence vocabulary

This reconciliation uses these statuses distinctly:

| Status | Meaning |
|---|---|
| Implemented in tracked source | Present in the exact repository candidate; not by itself proof of execution or release. |
| Automated-test verified | Covered by a recorded passing automated suite at the named commit or packet point. |
| Unpublished-preview verified | Observed on the exact PR 8 Netlify Deploy Preview; not production evidence. |
| Production-live | Observed on the locked production deploy at `master@5ef141b`. |
| Accepted limitation | Deliberately retained and honestly disclosed; not a claim that the capability exists. |
| Future/planned | Requires a later decision or implementation and must not be described as current behaviour. |

## 3. Reconciled capability and operational state

| Area | Reconciled status through Packet 161 |
|---|---|
| Geographical intelligence | Packets 147–151 established the audit, route-capable model, hard-anchor engine, searched planning inputs, place resolution, and provider-neutral route-evidence boundary. Packet 159 mounts the input and fixed-window assessment in tracked source. No spatial ordering, route-corridor optimisation, opening-hours feasibility, or route-aware fill-time recommendation is active. |
| Searched start and destination | Implemented in tracked Packet 159 source and automated-test verified. Exact PR 8 preview verification resolved live London start and destination places. It is not production-live. |
| Hard anchors | Implemented in tracked source as user-controlled, planner-locked place/time/duration/buffer commitments. Incomplete anchors are rejected; accepted anchors are not moved. Automated tests cover the contract, and the exact preview verified a complete live anchor. Route feasibility remains unproved without accepted route evidence. |
| Place resolution | Explicit-search, server-side Google Places resolution is implemented and preview-verified. Requests are not sent while typing; results are sanitised and attributed. It depends on the Places-only server credential. The Legacy Find Place dependency remains monitored and requires a separate migration before wider-than-Private-Alpha release or on a recorded trigger. |
| Travel-estimate policy | Packet 156 is implemented and automated-test verified: user-owned walking settings, a 45-minute default, honest approximate evidence, accountability guidance, removal of the fabricated fixed-speed taxi time, and key-free Maps handoffs. Current proximity figures are not adjacent-leg route estimates. |
| Routing provider | Google Compute Routes Essentials is selected and scaffolded but disabled. Packet 155's controlled calibration returned all routes yet failed both walking and public-transport safety thresholds. No Routes key or provider mode remains configured; `GOOGLE_ROUTES_API_KEY` is absent. Activation is not approved. |
| Saved-plan v2 | Implemented in tracked Packet 159 source with valid v1 migration, minimum geographical persistence, invalid-data rejection, expiry/reset clearing of both keys, and omission of transient/provider evidence. Automated tests passed; the exact preview resumed the two-stop geographical plan. It is not production-live. |
| QR privacy boundary | The QR text contract excludes start, destination, anchor names, addresses, coordinates, deadlines, and the geographical object. Automated tests verify exclusion. The exact preview rendered the Share QR, but visual rendering alone is not a manual inspection of encoded private fields. Production Packet 145 separately verified QR interaction for the older production journey. |
| Restaurants and activities | Restaurants are live-only Google Places results when the service is available; no mock restaurant fallback is permitted. Activities remain sample/demo data and are visibly labelled. The exact preview showed a real restaurant photograph and `Live from Google Places` alongside an honestly labelled sample activity. The Packet 159 workflow is not production-live. |
| Credential boundaries | `GOOGLE_PLACES_API_KEY` is server-only, Places-restricted, and now Production-only after Packet 161 rollback. Preview, branch, agent-runner, and local contexts are empty. The exact already-built preview retains its build-time environment, so no post-rollback runtime `NO_API_KEY` claim is made without a rebuild. Routes uses a separate exact variable and has no fallback to Places. |
| Integration and preview | Packet 157 reconciled and tested Packets 146–156. Packet 158 fast-forwarded exact reviewed commit `f3de536` to GitHub `master` without producing a Netlify candidate. Packet 159 is commit `daa13a2`; Packet 160's exact candidate source is `afd053a` on draft PR 8. Packet 161 verified deploy `6a68a3a3f9034449c8f4bf7e`. PR 8 remains draft and unmerged. |
| Production | Production remains locked at `master@5ef141b`, deploy `6a6602bd6c7609eabb08d744`. Packets 159–161 are not production-live. Google Routes is off. |
| Accepted presentation limitation | KI-003 records the minor orphaned `again.` line caused by `.location-status { word-break: break-all; }`. It remains for the later welcome-layout/release-candidate packet and is not changed here. |

## 4. Organisational authority source availability

The tracked repository contains editable `CURRENT_STATE.md`,
`PROJECT_GOVERNANCE.md`, packet records, technical decisions, audits, and
deployment evidence. It does **not** contain editable originals for these named
organisational authorities:

- DayGuide Product Authority;
- Decision Register;
- Reconciled Roadmap;
- Current Direction; or
- Knowledge Catalogue / master plan.

No tracked file name or governance cross-reference identifies an editable
repository location for those originals. ChatGPT-project sources are read-only
under Packet 162. Therefore this packet does not create substitute authority
documents, overwrite a mirror, or pretend that the external originals were
updated.

## 5. Controlled amendment handoff

When the Product Owner supplies or opens each editable original, apply the
following amendment without erasing its history:

1. add a dated 31 July 2026 Packet 162 reconciliation entry;
2. classify every relevant claim using the vocabulary in section 2;
3. record Packet 155 as a completed calibration with **FAIL** for both walking
   and public transport, followed by full temporary-credential shutdown;
4. record Packets 159–161 as tracked and unpublished-preview evidence only;
5. retain Production at `master@5ef141b`, deploy
   `6a6602bd6c7609eabb08d744`;
6. record Places as Production-only and Routes as off with no retained key;
7. preserve live-restaurant versus sample-activity and QR geographical-privacy
   distinctions; and
8. link this repository reconciliation instead of duplicating packet detail.

## 6. Unresolved Product Owner authority decisions

Packet 162 surfaces, but does not decide:

- whether the failed Packet 155 thresholds require estimate padding, a new
  calibration design, a different provider/evidence method, or continued
  disabled routing;
- when and how the Legacy Places resolver migrates before a wider release;
- whether draft PR 8 is accepted for later integration after the separate UI
  release-candidate work;
- the release threshold for accessibility, representative-device, legal,
  privacy, and commercial readiness; and
- the exact ordering and scope of the later welcome-layout/release-candidate
  packet and the separately authorised production-promotion packet.

These are authority decisions, not documentation contradictions to resolve
silently.

## 7. Validation and next boundary

Packet 162 validation must cover dates, packet numbers, commit/deploy identities,
status terminology, Markdown links, changed paths, and whitespace. Application
tests and a production build are not evidence-generating requirements for this
documentation-only packet.

The next packet may address the welcome layout and KI-003 as part of a bounded
release candidate. A later, separately authorised packet may integrate, push,
merge, publish, or promote an exact accepted commit. Packet 162 grants none of
those authorities.
