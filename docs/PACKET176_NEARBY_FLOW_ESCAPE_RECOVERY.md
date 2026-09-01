# Packet 176 — Nearby-flow Escape and Recovery

## Status

Local implementation candidate. Not pushed, preview-verified, merged, or production-live.

## Problem addressed

The short **Find something nearby** route can only find live places when the
browser supplies a location. Previously, a denied or unavailable location could
offer a planning-start action or a skip action that led people away from the
nearby route and could leave them without a clear exit.

## Behaviour

For a location-denied or no-location live search in **Find something nearby**:

- show one short, non-repeated explanation;
- offer **Back to nearby choices**, returning to the main Food & drink / Things
  to do fork;
- offer **Start over**, returning to the welcome screen; and
- do not show **Set a starting place** or **Skip … and continue**.

The longer **Plan a day** route continues to offer a named starting place,
because that is a useful, deliberate part of that route.

All activity and restaurant unavailable/no-result cards may also receive the
same explicit **Start over** escape when the surrounding flow supplies it.

## Boundaries

- This does not manufacture nearby results when location is unavailable.
- It does not alter Google Places, credentials, Netlify, Routes, billing,
  production, or provider policy.
- It does not change a successful location-enabled live-discovery flow.

## Validation

- Component tests cover activity and restaurant location-denied nearby recovery.
- A DayGuide integration test covers the full nearby activity path: denial,
  return to the main nearby fork, denial again, then Start over.
- Locale consistency checks cover the new recovery labels and concise
  location explanation in all five supported languages.

## Next gate

Push only with Product Owner authorisation, open an unpublished preview, and
test both location-enabled and denied-location nearby paths on phone and
desktop. Production promotion remains separate.
