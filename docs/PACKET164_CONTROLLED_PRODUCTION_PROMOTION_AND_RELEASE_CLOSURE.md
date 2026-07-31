# Packet 164 - Controlled Production Promotion and Release Closure

**Date:** 31 July 2026

**Status:** PASS - Packet 163 is production-live and publication is re-locked

## 1. Authority and boundary

Packet 164 records the separately authorised two-stage release of the accepted
Packet 163 candidate:

1. controlled GitHub integration through PR 9; then
2. controlled Netlify Production publication, live verification, and restoration
   of the publication lock.

It records operational evidence only. It makes no product-code change,
credential or secret change, provider call, Google Routes activation, or
environment-variable change. The protected untracked `.claude/`, `Dayguide#2/`,
and `docs/KNOWN_ISSUES (# Edit conflict 2026-07-26 1mdrfiC #).md` paths were not
inspected or changed.

## 2. Exact release lineage

| Evidence point | Exact identity | Status |
|---|---|---|
| Packet 163 product candidate | `739c7c4e5805f63cc6567e923b1c42ddc66ede17` | Automated and unpublished-preview verified |
| PR 9 final evidence head | `d288b5871d44b4ce88ba0edfe565c752ec170e67` | Unpublished-preview evidence record |
| PR 9 merge commit | `3cdcfd3401cef82e792ddb3ffc90cc74d9a01832` | Merged into GitHub `master` |
| Production deploy | `6a6ccd66eaaa320008175488` | Built successfully, deliberately published, then locked |
| Rollback predecessor | `master@5ef141b`, deploy `6a6602bd6c7609eabb08d744` | Retained as the immediate prior published deploy |

PR 9 was merged at 16:29 UTC on 31 July 2026. The exact production deploy
completed successfully from `master@3cdcfd3`; Netlify reported all build,
deployment, cleanup, and post-processing stages complete, with four functions
deployed. The deploy reused files previously uploaded for the same commit; that
is deployment deduplication, not a different source identity.

## 3. Controlled publication and restored safeguard

Before publication, Netlify showed the exact `master@3cdcfd3` Production deploy
as **Completed** while the published deploy remained `master@5ef141b` and auto
publishing was locked. Publication was then deliberately enabled and the exact
completed deploy was explicitly published.

After publication, Netlify confirmed **Published deploy** for
`master@3cdcfd3`. Auto publishing was immediately re-locked. The final
dashboard state is **Published & locked deploy** with the explicit statement:
"Publishing is locked to this deploy." Future branch or `master` builds may
still build but cannot publish until a later deliberate unlock and publish
action.

## 4. Production evidence and evidence boundaries

The public production welcome screen was opened from the published Netlify
deploy and observed to show:

- the approved universal heading, "Plan your perfect day, wherever you are";
- the supporting welcome copy;
- live location status and Refresh Location; and
- Start Planning as the only welcome entry action (no Resume action visible).

This is production-live evidence for the welcome state visible in that session.
It is not a replacement for the Packet 163 responsive denied-location check.
For safety, this closure did not alter browser location permissions to force a
denied state. The accepted desktop and phone KI-003 evidence therefore remains
the exact unpublished-preview observation: natural wrapping without the former
orphaned `again.` line.

The production release contains the Packet 163 UI repair and accepted source,
but this packet does not claim a new production verification of live Places,
searched start/destination, anchors, saved-plan v2, QR privacy contents, or
route estimates. Those capabilities retain the precise statuses recorded by
Packet 162 and their earlier evidence packets.

## 5. Operational boundaries preserved

- Google Routes remains disabled; Packet 155 calibration remains a failed safety
  gate and is not an activation authority.
- No provider request was made during this release closure.
- No credential, environment variable, secret scope, or key value was changed.
  The existing `GOOGLE_PLACES_API_KEY` Production-only boundary was not
  re-audited or broadened by this packet.
- The release did not modify the distinction between live Google Places
  restaurants and labelled sample activities, nor the QR geographical-privacy
  contract.

## 6. Closure and subsequent boundary

Packet 163's welcome-layout release candidate, including KI-003, is now
integrated and production-live at `master@3cdcfd3`. The public release is
locked to that exact deploy. Rollback remains a controlled action: select the
retained predecessor deploy `6a6602bd6c7609eabb08d744`, publish it deliberately,
and restore the lock after verification.

Later work must use a new, separately authorised packet. In particular, it must
not infer approval to activate Google Routes, change credentials, broaden
preview secret scope, or promote later source automatically.
