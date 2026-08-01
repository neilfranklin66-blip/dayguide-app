# Packet 167 — Journey Intent and Time-Criticality Decision Support

## Status

Local implementation prepared for review. This packet is provider-neutral and is not a Routes, Places, Netlify, credential, deployment, or production-promotion change.

## Product decision implemented

DayGuide must not tell a user that they “will make it”, including where a walking leg appears manageable. A route can be closed, inaccessible, disrupted, unsafe for that user, or affected by circumstances DayGuide cannot know.

The planning step records one user-controlled journey context:

- **Flexible** — later stops may move or be skipped.
- **Prefer to allow extra time** — the user decides how much extra time to add.
- **Time-sensitive** — a delay matters; the user can add a deadline or a fixed anchor and chooses their own buffer.

This context is decision support only. It does not calculate a travel time, change an existing deadline or buffer, decide hard-anchor feasibility, determine accessibility, or provide an arrival assurance.

## Behaviour and boundaries

- New and restored plans carry `journeyIntent` with the geographical planning input.
- A previously saved plan without this field restores as **Flexible**, preserving its existing places, deadlines and buffers.
- An unsupported stored context is rejected rather than silently turned into an assurance.
- Timeline and fixed-route summaries restate the applicable limitation and send users to live directions. They do not imply that a buffer exists unless the user has recorded one.
- Flexible walking guidance is conditional on what the user finds manageable and explicitly notes changing conditions, closures and accessibility.
- Google Routes remains disabled for production decisions. Packet 166's failed closed trial neither supplies this feature nor is reinterpreted as an arrival-confidence signal.

## Acceptance checks

- No UI copy promises arrival, route availability, accessibility, or a feasible hard-anchor window.
- Selecting Time-sensitive with neither a fixed anchor nor an arrival deadline asks the user to add a target if they want one recorded, without requiring it.
- The choice round-trips through saved-plan v2 geographical persistence without retaining search queries, route evidence, or provider results.
- English, Spanish, French, Chinese and Vietnamese carry both the planning and travel-guidance safety language. The locale-consistency test enforces the complete travel-guidance subtree and placeholder parity.

## Deliberately deferred

- No provider enablement, paid feature, premium claim, calendar integration, live-route assessment, or production release.
- No change to Packet 166 evidence, temporary credential shutdown, or the independent-reference assessment record. Those must close separately under their existing safety gate.

## Independent review amendment

Claude Code's independent review identified localisation, wording and assistive-technology gaps before preview. The follow-up repair:

- replaces outcome-shaped “comfortable arrival” copy with user-controlled extra-time wording;
- adds a target-recording prompt for that context without adding or deciding a buffer;
- associates each radio choice with its qualifying guidance and announces changing guidance politely;
- translates the whole timeline travel-guidance subtree in every supported locale; and
- adds regression tests for the corrected summary, live guidance and accessibility relationships.

The independent review draft remains untracked review evidence. Its Product Owner questions about later intent variants, storage migration policy and future accessibility/routing work remain open; none is decided by this packet.
