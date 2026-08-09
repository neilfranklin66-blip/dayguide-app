# Packet 173 - Plan-a-Day Live Discovery

## Status

**Implemented locally; awaiting review, push, and unpublished-preview
verification.**

This packet is based on `692fe59` from the unmerged Packet 170/172 release
candidate source. It does not merge, push, deploy, change Netlify, change
credentials, call a provider, or alter Production. Google Routes and
Ticketmaster remain out of scope.

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

## Legacy-record boundary

The `isSample` display branches remain for saved plans created before this
packet. They continue to identify legacy sample entries and withhold a real
nearby-distance claim. The current selection flow cannot import
`mockActivityData.json`; an automated structural guard enforces this boundary.

## Automated validation

- Focused activity, configuration, locale, and engine tests passed.
- `src/DayGuide.test.js`: 54 tests passed after the asynchronous live-search
  conversion.
- Full-suite and production-build validation are still required before review
  closure.

## Required unpublished-preview checks

1. Plan a day, activities first: confirm a genuine local activity card, Maps
   link, no sample badge, then complete a day.
2. Set a named start that differs from the phone location: confirm activity
   cards move with the named start.
3. Deny location and do not set a start: confirm the brief unavailable card and
   no sample card.
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
