# Packet 170 — Live Places Acceptance and First-Minute Flow

## Status

**Implemented in tracked source; awaiting unpublished-preview acceptance.**

This packet makes no claim that a newly deployed preview, a provider request, or
a production origin has been verified. It changes no key, provider setting,
Netlify setting, billing limit, or routing policy.

## Product decision

The welcome screen now offers two clear routes:

- **Plan a day** retains the existing fuller planning workflow.
- **Find something nearby** goes directly to restaurant discovery once the
  device location is available.

The nearby route clears earlier selections and does not ask about activities,
walking, children, date, time, price, or cuisine before attempting its first
search. Its first result must be a live Google Places restaurant card. It may
instead show an honest unavailable or no-results card; it must never substitute
a stored/sample restaurant.

The option labels and supporting line are present in all five supported UI
locales. The control is deliberately large enough for outdoor use.

## Automated evidence

The regression suite includes an interaction test proving that the nearby
button:

1. calls the restaurant search with the current device coordinates and no
   implicit cuisine or price filter;
2. renders a restaurant only through the `live` source path; and
3. does not mount the former preference questionnaire first.

Existing live-search tests continue to cover the Places API (New) proxy,
provider-error classification, price filtering and the rule that mock
restaurants cannot appear as live results.

## Required unpublished-preview acceptance

Before this packet can be described as preview-verified, test the exact preview
origin with location permission granted:

1. Press **Find something nearby** from a fresh welcome screen.
2. Confirm that a named restaurant card appears and carries the visible
   `Live from Google Places` label.
3. Confirm its card information is a genuine local place, not a stored DayGuide
   sample, and that **Open in Maps** resolves to that place.
4. Repeat the established restaurant checks for at least three cuisines and
   each available price choice through **Plan a day**. Record whether each
   produces live cards, a genuine no-results state, or an explicit failure
   state.
5. If a result is unavailable, capture the browser request and safe response
   classification before changing code or credentials. Do not infer the cause
   from the friendly on-screen message.

This evidence is intentionally separated from production. Google Routes stays
disabled, and production is not in scope for Packet 170.

## Deliberate deferrals

- Live activities, events, and landmarks remain unimplemented; existing
  activity cards remain visibly sample data.
- Candidate multi-select, map view, cloud plans, accounts, audio, native
  packaging, and paid tiers are not part of this packet.
- The **Plan a day** route will be simplified in subsequent Experience Reset
  work once this first useful nearby loop is accepted.
