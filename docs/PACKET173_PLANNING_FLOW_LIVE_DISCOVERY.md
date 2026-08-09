# Packet 173 - Plan-a-Day Live Discovery

## Status

**Complete and accepted on the unpublished preview. This remains a draft PR
candidate; it has not been merged or promoted to Production.**

This packet is based on `692fe59` from the unmerged Packet 170/172 release
candidate source. The Packet 173 candidate was pushed for an unpublished
preview; bounded Google Places calls were made only to verify the approved
preview flows. This packet does not merge, alter Production or change
credentials. Google Routes and Ticketmaster remain out of scope.

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
- The optional end destination now uses the matching direct pattern: **Where
  will you finish?** It has its own place, address, postcode and ZIP-code
  search; selecting a result cannot replace the chosen start.

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
- A first correction-preview check confirmed that a named place could be found
  and selected, but also exposed that the activity-first hand-off discarded the
  selected planning start. A follow-up local correction now passes that same
  planning input to the live activity search.
- In a location-denied preview session, a search for **London Euston** returned
  real Google Maps matches; selecting **Euston** then produced a real National
  Gallery activity card marked **Live from Google Places**. No sample card or
  unavailable message appeared in that named-start route.
- A public-postcode check, **SW1A 1AA**, returned an immediately selectable
  Google Maps result. This confirms that a postcode reaches and is resolved by
  the same direct start control. ZIP-code resolution remains the same provider
  query path but has not been manually checked in this packet.
- A hosted destination check selected **Euston** as start and **Trafalgar
  Square** as finish through separate direct searches. The activity search
  returned the real National Gallery from the Euston start area, and the final
  itinerary retained both distinct places with a Google Maps link between them.

## Legacy-record boundary

The `isSample` display branches remain for saved plans created before this
packet. They continue to identify legacy sample entries and withhold a real
nearby-distance claim. The current selection flow cannot import
`mockActivityData.json`; an automated structural guard enforces this boundary.

## Automated validation

- Focused activity, configuration, locale, engine, named-start and place
  resolution tests passed.
- The named-start correction's focused suite passed: 5 suites, 1,359 tests.
- The selected-start hand-off correction's broader focused suite passed: 6
  suites, 1,414 tests, including a denied-location named-start activity test.
- The independent-destination correction's broader focused suite passed: 6
  suites, 1,475 tests. It verifies distinct selected start/end places and that
  live activities still use the start coordinates.
- `src/DayGuide.test.js`: 54 tests passed after the asynchronous live-search
  conversion.
- Full-suite and production-build validation are still required before review
  closure.

## Acceptance coverage and boundary

The accepted core route covers normal live activities, named start, denied
location with a named start, direct postcode resolution, an independent end
destination, and persistence of both places into the itinerary. French and
phone-width core use were previously manually confirmed.

Legacy saved-plan sample rendering remains deliberately preserved and was not
retested in this closure; its automated structural guard remains in place. A
no-start denied-location unavailable card is also retained as a separately
automated honesty boundary.

## Deliberate deferrals

- No change to the length or questions in Plan a day.
- No removal or migration of legacy saved sample records.
- No change to activity radius, rating threshold, caching, Places function,
  transport estimates, routes, or provider configuration.
