# Packet 171 — Unified Live Discovery

## Status

**Local implementation candidate; unpublished-preview acceptance required.**

This packet extends the existing draft branch only. It does not merge, publish,
or alter Production. Google Routes and Ticketmaster remain out of scope.

## Implemented direction

- `Find something nearby` now makes one friendly binary choice: **Food &
  drink** or **Things to do**.
- Food reuses the established DayGuide cuisine choices, including **Café** as
  the practical quick-food route for cafés, bakeries and takeaway food.
- Things to do requests real Google Places venues for the established activity
  choices. Sample activity cards are not used by that discovery route.
- Food card labels now prefer Google Places' primary-type display label, so a
  venue can appear as `Italian restaurant`, `Café`, `Bakery`, and so on.
- Restaurant acceptance uses the provider primary type when available. A shop
  cannot qualify only because a broad secondary type is food-related.
- **Choose** adds a card to the user’s current picks while browsing continues;
  **Build my day** is available once at least one pick exists; itinerary rows
  have **Remove**.
- A no-selection discovery return goes back to the relevant category choices,
  rather than attempting to build an empty itinerary.

## Result-volume boundary

The client now retains up to 20 suitable results from its first provider page,
rather than silently discarding after 12. When Google returns an opaque next
page token, the end of that card batch offers **Show more matching places**.
That asks Google for the next page only when the person chooses it. It makes no
claim to know the total number of matches: Google controls the order and its
current maximum. Multi-cuisine discovery remains a combined first-page search;
the explicit continuation route is verified for All food & drink and a single
cuisine.

## Acceptance evidence required

On the exact unpublished preview, with location enabled:

1. Confirm Food & drink shows the established categories and Café makes sense
   as a quick-food choice.
2. Confirm each returned food card has an accurate visible type, and that
   shops such as Home Bargains do not appear.
3. Confirm Things to do returns genuine live venues with accurate labels, not
   sample London cards.
4. Choose more than one card, keep browsing, build a day deliberately, and
   remove a card from the itinerary.
5. Skip every card and confirm no empty itinerary is presented.
6. If **Show more matching places** appears, use it once and confirm the next
   cards are live, different places; if it does not appear, record that Google
   supplied no further page rather than calling that an app failure.
