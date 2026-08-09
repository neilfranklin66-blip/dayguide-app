# Packet 178 — Live Place Photos with Proper Attribution

## Status

**Implemented locally; unpublished preview and Product Owner acceptance pending.**

| Field | Value |
| --- | --- |
| Product Owner | Neil Franklin |
| Selected implementation agent | Codex |
| Repository | `C:\Users\neilf\Documents\dayguide\dayguide-app` |
| Starting commit | `821c5af` — Packet 177: clarify optional finish |
| Packet branch | `packet-178-live-place-photos-attribution` |

## Objective

Restore live Google venue photographs to Food & Drinks cards where the Places API
supplies a usable photo, while keeping each displayed photograph visibly linked
to its required author and individual Google Maps source.

## Evidence and cause

The Places API (New) migration already requested `places.photos` and retained the
private server-side photo proxy. Its response mapper nevertheless discarded every
photo with `authorAttributions`. This was a conservative temporary safeguard, but
many real venue photographs carry that information; the resulting live cards could
therefore have no image.

Google's current Places policy requires author credit when supplied and access to
the individual source photo on Google Maps. Packet 178 carries only the necessary
browser-safe fields: author name, profile URL, avatar URL, and the photo's Google
Maps URL. The private `GOOGLE_PLACES_API_KEY` remains only in the Netlify
functions.

## Delivered behaviour

- The server response retains a valid photo reference together with safe author
  attribution and source-link fields.
- Food & Drinks cards show the first photo that has both a usable reference and
  individual Google Maps source URL.
- When Google supplies author details, the card shows a compact `Photo by` credit,
  linked author name, optional author avatar, and `View photo` link.
- The card's existing live-source marker now explicitly says `Google Maps`, which
  is the current provider attribution name for a space-limited card.
- If a card has no safely attributable photo, or the image fails to load, the
  photo area is omitted without disrupting selection.
- All five supported locales include the new credit and source-link labels.

## Explicit exclusions

- No Google Cloud, API key, Netlify environment, billing, Routes, provider-call,
  deployment, merge, or production change.
- No activity-card imagery work.
- No stored image, photo-name caching, or photo fallback pretending to be live.
- No change to restaurant search, ranking, filters, selection, itinerary, or
  geographical-planning behaviour.

## Validation

- Focused API, server-function, Food & Drinks card, adapter, and locale tests.
- Full suite and production build are required before this packet is committed.
- Unpublished preview check: use a real Food & Drinks result with a known venue
  photograph (for example Sophia's Italian Restaurant, Northampton, if returned),
  confirm its visible photo, author credit where supplied, source link, and a
  graceful no-photo card.

## Manual acceptance boundary

A preview result proves only that the current provider response and card display
work at that time. It does not guarantee that every venue has a photograph or
that a particular photo will remain Google's first returned photo.
