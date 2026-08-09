# Packet 179 — Explicit Plan Start Choice

## Status

**Implemented locally; unpublished preview and Product Owner acceptance pending.**

| Field | Value |
| --- | --- |
| Product Owner | Neil Franklin |
| Selected implementation agent | Codex |
| Repository | `C:\Users\neilf\Documents\dayguide\dayguide-app` |
| Starting commit | `e5f7d14` — Packet 178: restore credited live place photos |
| Packet branch | `packet-179-explicit-plan-start-choice` |

## Objective

Keep **Use my current location** as a working, explicit Plan-a-Day choice. A
location permission granted on DayGuide's welcome screen must not itself select
the starting place for a plan.

## Root cause

When browser geolocation was available, `DayGuide.jsx` created a current-location
place and immediately inserted it into every new planning draft. The visible
button then repeated the same selection and appeared not to work.

## Delivered behaviour

- A new Plan-a-Day draft has no selected starting place, even when location is
  available.
- **Use my current location** remains visible and, when pressed, visibly sets
  `Current location` as the start.
- Searching for and choosing a place, address, postcode, or ZIP code remains an
  equal alternative.
- Location remains available to the separate Find something nearby route; this
  packet changes only consent to use it as a plan origin.

## Exclusions

- No location-permission, provider, Google, Netlify, credential, billing, Routes,
  deployment, merge, or production change.
- No change to named-place resolution, destination, fixed-anchor, itinerary, or
  Nearby discovery behaviour.

## Validation

- Component test proving current location is unselected until the button is
  pressed, then visibly selected.
- Application flow test proving Plan a Day requires the explicit choice before
  continuing.
- Full test suite and production build required before commit.

## Manual preview check

1. Allow location on the welcome screen.
2. Start Plan a day and reach **Where will you start?**
3. Confirm no start is selected automatically.
4. Press **Use my current location — Current location** and confirm the start
   confirmation appears.
5. Separately confirm a postcode or named place can be selected instead.
