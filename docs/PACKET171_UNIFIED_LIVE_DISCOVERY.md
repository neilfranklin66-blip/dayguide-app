# Packet 171 - Unified Live Discovery

## Status

**Accepted on the unpublished preview, 8 August 2026.**

This packet extends the existing draft branch only. It does not merge,
publish, or alter Production. Google Routes and Ticketmaster remain out of
scope.

## Delivered discovery flow

- Find something nearby opens one simple choice: Food & drink or Things to do.
- Food uses the established DayGuide cuisine choices, including Cafe as the
  practical quick-food route for cafes, bakeries and takeaway food.
- Things to do uses genuine Google Places venues. Sample London activity cards
  are never used by the nearby discovery route.
- Food labels retain a Google venue type and any available cuisine clue. A
  food venue cannot qualify as an activity only because it also has a
  sport-related provider tag.
- Choose keeps browsing possible; Build my day is offered after a choice;
  itinerary rows can be removed.
- A no-selection route returns to useful live choices rather than building an
  empty itinerary.

## Result-volume boundary

The first provider page contains up to 20 suitable results. When Google
returns an opaque next-page token, the end of that batch offers Show more
matching places. Google controls the order and maximum; DayGuide does not
claim to know the total number of nearby places.

## Unpublished-preview acceptance evidence

With location enabled, the Product Owner confirmed:

1. Food & drink showed plentiful genuine live places. The established choice
   list was visible; a further live batch appeared after the first one was
   skipped, then Google supplied no more.
2. Where Google supplied a specific food type or reliable cuisine clue, cards
   displayed it. Generic Restaurant remains an honest fallback rather than an
   invented cuisine claim.
3. Things to do showed many genuine live venues across the activity choices.
   The recovery check independently returned Northampton Museum and Art
   Gallery and Abington Park Museum from the preview function.
4. Food venues were excluded from Things to do, and nearby discovery did not
   fall through to sample London activity cards, including after the food
   popup.
5. Chosen food cards built an itinerary. Transport options and the Google Maps
   live-route handoff worked in the hosted app.

## Accepted limitations

- Google does not supply a specific cuisine/type for every venue. Those cards
  remain generic.
- Displayed transport options are planning estimates between selected stops.
  Google Maps provides the live journey check; Google Routes remains off.
