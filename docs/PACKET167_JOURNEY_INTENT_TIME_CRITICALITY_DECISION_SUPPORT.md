# Packet 167 — Journey Intent and Time-Criticality Decision Support

## Status

Local implementation prepared for review. This packet is provider-neutral and is not a Routes, Places, Netlify, credential, deployment, or production-promotion change.

## Product decision implemented

DayGuide must not tell a user that they “will make it”, including where a walking leg appears manageable. A route can be closed, inaccessible, disrupted, unsafe for that user, or affected by circumstances DayGuide cannot know.

The planning step records one user-controlled journey context:

- **Flexible** — later stops may move or be skipped.
- **Prefer a comfortable arrival** — the user chooses their own extra time.
- **Time-sensitive** — a delay matters; the user can add a deadline or a fixed anchor and chooses their own buffer.

This context is decision support only. It does not calculate a travel time, change an existing deadline or buffer, decide hard-anchor feasibility, determine accessibility, or provide an arrival assurance.

## Behaviour and boundaries

- New and restored plans carry `journeyIntent` with the geographical planning input.
- A previously saved plan without this field restores as **Flexible**, preserving its existing places, deadlines and buffers.
- An unsupported stored context is rejected rather than silently turned into an assurance.
- Timeline and fixed-route summaries restate the applicable limitation and send users to live directions.
- Flexible walking guidance is conditional on what the user finds manageable and explicitly notes changing conditions, closures and accessibility.
- Google Routes remains disabled for production decisions. Packet 166's failed closed trial neither supplies this feature nor is reinterpreted as an arrival-confidence signal.

## Acceptance checks

- No UI copy promises arrival, route availability, accessibility, or a feasible hard-anchor window.
- Selecting Time-sensitive with neither a fixed anchor nor an arrival deadline asks the user to add a target if they want one recorded, without requiring it.
- The choice round-trips through saved-plan v2 geographical persistence without retaining search queries, route evidence, or provider results.
- English, Spanish, French, Chinese and Vietnamese planning copy carries the new decision-support language; existing locale fallback continues for travel-notice strings that pre-date equivalent local entries.

## Deliberately deferred

- No provider enablement, paid feature, premium claim, calendar integration, live-route assessment, or production release.
- No change to Packet 166 evidence, temporary credential shutdown, or the independent-reference assessment record. Those must close separately under their existing safety gate.
