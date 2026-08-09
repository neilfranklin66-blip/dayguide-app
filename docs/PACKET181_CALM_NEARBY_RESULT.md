# Packet 181 — Calm Nearby Result

## Status

**Implemented locally; verification and Product Owner acceptance pending.**

| Field | Value |
| --- | --- |
| Product Owner | Neil Franklin |
| Selected implementation agent | Codex |
| Repository | `C:\Users\neilf\Documents\dayguide\dayguide-app` |
| Starting commit | `4110012` — Packet 180: correct nearby promise |
| Packet branch | `packet-181-calm-nearby-result` |

## Objective

Keep a one-place **Find something nearby** result focused on the real place and
its useful action, without generic journey-policy prose.

## Delivered behaviour

- A one-stop itinerary does not render the generic **Travel-time guidance**
  panel or its walking-preference summary.
- The existing venue-level **Open in Maps** action remains available wherever a
  live place supplies its Maps link.
- A two-or-more-stop itinerary continues to show travel guidance and its
  relevant between-place travel options.

## Rationale

There is no between-venue journey in a one-place result. Generic statements
about estimates, user accountability, and walking limits added reading without
helping the user choose or reach that place. A direct Maps action is the
appropriate optional way to check a live journey.

## Exclusions

- No change to Maps links, live-Places data, provider calls, routing policy,
  travel calculations, location, credentials, Netlify, deployment, merge, or
  production.
- No change to multi-stop Plan a day travel guidance.

## Validation

- Component tests prove generic travel guidance is absent for one stop and
  remains present for two stops.
- Existing timeline-row tests retain the exact **Open in Maps** link contract.
- Full test suite and production build are required before commit.

## Manual preview check

1. Choose one real nearby venue.
2. Confirm the itinerary has no **Travel-time guidance** or **Typical pace**
   panel.
3. Confirm the venue's **Open in Maps** action remains available when supplied
   by that live place.
