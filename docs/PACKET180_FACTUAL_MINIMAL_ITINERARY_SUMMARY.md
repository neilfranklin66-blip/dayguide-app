# Packet 180 — Factual, Minimal Itinerary Summary

## Status

**Implemented locally; verification and Product Owner acceptance pending.**

| Field | Value |
| --- | --- |
| Product Owner | Neil Franklin |
| Selected implementation agent | Codex |
| Repository | `C:\Users\neilf\Documents\dayguide\dayguide-app` |
| Starting commit | `49c93b6` — Packet 179: make current location a deliberate plan-start choice |
| Packet branch | `packet-180-factual-minimal-itinerary-summary` |

## Objective

Replace the misleading, over-explanatory itinerary narrative with a short
summary that states only what the user has actually selected.

## Root cause

The prior narrative used `startWith`, an internal instruction about the next
selection stage, as though it described the content of the completed itinerary.
As a result, a one-card food plan could say it started with activities, and the
reverse could happen for a one-card activity plan. It also repeated preferences
and made time-fit claims that did not describe the selected cards.

## Delivered behaviour

- A one-stop itinerary has no **Day guide** narrative; its selected card is the
  useful summary.
- A two-or-more-stop itinerary receives one factual sentence built from its
  actual entries and their actual order. For example: `2-stop plan: food, then
  activity.`
- The sentence does not refer to internal routing state, start time, available
  time, preferences, budget, children, or a claim that the plan fits.
- Timeline entries now carry their selected type (`food` or `activity`) so live
  restaurant results are classified from their actual card data rather than
  from journey flow state.
- The compact wording is supplied in English, Spanish, French, Vietnamese, and
  Chinese.
- The welcome-screen hint now makes the same factual promise: **Real nearby
  places, chosen by you.** It does not imply that Nearby is restaurants-only.

## Exclusions

- No live-Places search, location, itinerary ordering, route, travel-estimate,
  provider, credential, Netlify, billing, deployment, merge, or production
  change.
- The separate time-budget display remains unchanged; this packet removes only
  duplicated prose from the itinerary summary.

## Validation

- Unit tests cover zero-, one-, two-, and three-stop itineraries, actual order
  overriding next-stage state, and locale-specific punctuation.
- Timeline tests confirm actual food/activity classification and one-stop
  narrative suppression.
- Locale consistency tests require the new keys in all supported languages.
- Full test suite and production build are required before commit.

## Manual verification checklist

1. Select one Food & Drinks card through **Find something nearby**. Confirm the
   itinerary does not say it begins with activities, and has no Day guide text.
2. Select one Things to do card. Confirm the inverse wording is also absent.
3. Select food followed by an activity. Confirm the Day guide says only
   `2-stop plan: food, then activity.` in the selected order.
4. Confirm the summary does not repeat cuisine preferences, budget, available
   time, or a time-fit claim.
