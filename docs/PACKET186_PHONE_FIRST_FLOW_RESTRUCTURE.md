# Packet 186 — Phone-first flow restructure

## Packet record

- **Implementation:** Codex desktop, on `packet-186-phone-first-flow-restructure`
  from `0cea57e` (Packet 185 design foundation).
- **Scope:** source and translation changes only; no deployment, provider,
  credential, Netlify, or production action.

## Purpose

Begin the approved DayGuide experience restructure without changing the live
Places provider boundary or inserting editorial photography.

## Implemented foundation

- The welcome screen now leads with **Find something nearby**, then offers
  **Plan a day**. Exact device coordinates are no longer front-page content;
  location remains available quietly when needed.
- **Plan a day** now starts with the essentials on one screen: date, typed start
  time, and a verified start place or explicit current-location choice. It no
  longer begins with the legacy preference questionnaire.
- The optional later-details section is restricted in the interface to one
  finish destination and one important timed event. The important-event editor
  offers Theatre or cinema, Meeting, and Other as quick labels in every
  supported language, while retaining verified place and typed-time controls.
- After the plan basics, a short choice screen asks whether the person wants
  Food & drink, Things to do, or both. This preserves the established live
  Places card paths rather than introducing fabricated cards.
- Nearby selection now ends at one calm selected-place result with its existing
  Google Maps action, rather than building an itinerary from a single pick.

## Explicit exclusions

- No photograph, generated image, stock asset, video, map tile, or visual asset
  was added. The Product Owner must choose and approve any later editorial
  photography before it is copied into the repository.
- No changes were made to Google credentials, Places functions, Netlify,
  deployment configuration, providers, or production.
- Existing live place-card image handling and Google Places attribution remain
  unchanged.
- The provider-free geographic diagram and first-leg travel-time calculation
  remain a later bounded implementation step.

## Follow-up validation required

Manual preview evidence should cover:

1. a nearby food result and a nearby activity result, each ending at a single
   result with Open in Maps;
2. a planned day using a named start, date and typed time;
3. optional finish and one important event; and
4. denied-location recovery without a dead end.

The first-leg travel-time calculation and provider-free area diagram are not
implied by this packet. They need their own acceptance criteria after this
shorter input flow is reviewed.
