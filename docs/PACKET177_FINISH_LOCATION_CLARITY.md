# Packet 177 — Finish-location clarity

## Status

Local implementation candidate. Not pushed, preview-verified, merged, or production-live.

## Problem addressed

An end destination is optional, but once its checkbox is selected the planning
model correctly requires a verified finish. Previously, that requirement was
only made clear after pressing **Continue with these fixed details**. This
could make an anchor-only plan appear blocked by an unrelated destination
error.

## Behaviour

When an optional end destination is on but no verified finish has been chosen,
DayGuide immediately shows:

> Choose a verified finish, or remove this optional destination.

It also presents a visible **Remove end destination** action. Removing is
explicit and clears the optional destination state through the existing
workflow. DayGuide never silently removes a destination.

Fixed-anchor-only plans continue normally when the optional destination is
off. A person who wants both can still search and explicitly select a verified
finish.

## Boundaries

- No change to the fixed-anchor model or validation rules.
- No change to live Places, credentials, Netlify, Routes, billing, or
  production.
- No route-feasibility or arrival promise is made.

## Validation

- Existing anchor-only completion test remains green.
- New test verifies the immediate explanation, explicit removal action, and
  successful continuation with `end: null`.
- Planning workflow, place-resolution, and five-language locale consistency
  tests pass.
- Production build succeeds locally.

## Next gate

Push only with Product Owner authorisation, open an unpublished preview, and
test: anchor only; destination only; anchor plus destination; and removal of an
unselected optional destination. Production promotion remains separate.
