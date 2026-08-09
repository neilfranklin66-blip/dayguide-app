# Packet 173 - Plan-a-Day Live Discovery

## Status

**Unpublished-preview candidate in review. A named-start usability correction
is implemented locally and awaits its own preview verification.**

This packet is based on `692fe59` from the unmerged Packet 170/172 release
candidate source. The Packet 173 candidate was pushed for an unpublished
preview; this correction does not merge, alter Production, change credentials,
or call a provider. Google Routes and Ticketmaster remain out of scope.

## Delivered behaviour

- Plan a day activity selection uses the existing Google Places activity search;
  it no longer imports or presents sample London activity cards.
- The search uses a verified named planning start when supplied, otherwise the
  device location. A named start therefore permits real activity search without
  GPS and keeps recommendations at the planned starting area.
- Activity-first planning keeps its existing meal prompt. Loading activities no
  longer changes the chosen start order.
- Food-first planning and the activity-break popup use the same live-only
  activity loader.
- A live search distinguishes results, no results, already-seen results, denied
  location, no location, configuration, quota, network, and unknown failures.
  Only a successful search produces place cards.
- When children are in the party and no activity types are explicitly chosen,
  the Places request excludes the adult-only nightlife category. An explicit
  nightlife choice remains a user choice.
- The five supported languages have activity-specific unavailable wording.
  Denied or missing location explains the two genuine next steps: allow
  location access or add a named starting place.
- The named-start route is now one visible control: **Where will you start?**
  A user can search for a place, address, postcode or ZIP code and select a
  result directly. Selecting it immediately makes it the planning start; there
  is no separate Add action or empty technical dropdown.

## Unpublished-preview evidence so far

- Plan a day showed real activity cards and no sample activity cards in normal
  location-enabled use.
- French-language use, completing an itinerary, and opening live Google Maps
  journeys were manually confirmed.
- A first denied-location attempt used the published main site rather than this
  Packet 173 preview, so it is not evidence for this packet.
- The preview exposed that the previous named-start control was not clear or
  usable without interpreting a separate search-and-add sequence. The direct
  control above is the controlled correction; it still needs preview evidence.

## Legacy-record boundary

The `isSample` display branches remain for saved plans created before this
packet. They continue to identify legacy sample entries and withhold a real
nearby-distance claim. The current selection flow cannot import
`mockActivityData.json`; an automated structural guard enforces this boundary.

## Automated validation

- Focused activity, configuration, locale, engine, named-start and place
  resolution tests passed.
- The named-start correction's focused suite passed: 5 suites, 1,359 tests.
- `src/DayGuide.test.js`: 54 tests passed after the asynchronous live-search
  conversion.
- Full-suite and production-build validation are still required before review
  closure.

## Required unpublished-preview checks

1. Plan a day, activities first: confirm a genuine local activity card, Maps
   link, no sample badge, then complete a day.
2. Set a named start that differs from the phone location: search by a named
   place, address or postcode, select a result directly, then confirm activity
   cards move with the named start.
3. In a separate private browser window, deny location, set a named start using
   the direct control, and confirm real activity cards appear around that start.
   Also deny location without setting a start: confirm the brief unavailable
   card and no sample card.
4. Confirm an explicit activity choice keeps the current selection flow. The
   adult-only guard is automated coverage for any future broad activity search
   made with children in the party; the present Plan-a-Day screen requires an
   activity choice before continuing.
5. Resume an older saved plan, if available: confirm any legacy sample row keeps
   its sample note.
6. Repeat the core route in one non-English locale and on a phone.

## Deliberate deferrals

- No change to the length or questions in Plan a day.
- No removal or migration of legacy saved sample records.
- No change to activity radius, rating threshold, caching, Places function,
  transport estimates, routes, or provider configuration.
