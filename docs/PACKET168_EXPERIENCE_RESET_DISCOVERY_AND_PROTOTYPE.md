# Packet 168 — Experience-Reset Discovery and Prototype

## Status

Implemented locally for Product Owner review. This packet is a contained UI discovery prototype. It does not alter credentials, providers, deployment settings, routing policy, or the live-place service.

## Approved product authority

The Product Owner approved the **DayGuide Experience Reset** on 1 August 2026. DayGuide is to become a location-aware, card-based decision companion: the user makes a small number of enjoyable choices, sees useful place options early, and shapes their own day. The agreed product test is:

> “I quickly found something I would enjoy, chose it myself, and DayGuide helped me see what could happen next.”

The first useful option must hook the user. Later choices should extend an emerging itinerary through optional contextual branches, not a long questionnaire.

## Discovery findings

### Current entry-flow conflict

`InterestsStage` renders activity interests, cuisine, price, available time, date, time, children, selection order and walking preferences before the user receives a place card. It therefore conflicts with the approved short conversational flow and with outdoor use.

### Live-place distinction

Restaurant discovery calls the protected server-side Places boundary only after a search is requested. It can truthfully show a live result, a zero-result state, or an unavailable state.

Activity discovery does **not** yet have a live source: `DayGuide.jsx` deliberately derives activity cards from `mockActivityData.json` and marks every result as a London sample. It must not be represented as a real nearby recommendation.

The reported Italian-search failure cannot be attributed to a single source cause from tracked code alone. The client asks the Places boundary for an Italian-restaurant keyword and then applies name/type-based cuisine detection. A future live-discovery repair must collect a bounded request/response outcome and distinguish provider configuration, location, zero results, provider error, and overly restrictive client filtering.

### Geographical intelligence

The existing fixed-anchor and destination workflow has valid governance boundaries but exposes internal terminology and long caveats in the customer journey. The reset prototype instead asks:

> **Do you need to be somewhere later?**<br>
> If so, we can plan options in that vicinity.

It intentionally does not claim a route, arrival, or real geographical ranking.

## Prototype scope

The Welcome screen exposes **Try the new DayGuide** alongside the unchanged legacy entry route. The contained prototype has two entry paths:

- **Plan a day:** day, start time, start area, optional later area, time available, then interest.
- **Find something nearby:** interest immediately.

It uses large, high-contrast controls (minimum 64px) with visible buttons rather than swipe-only controls. It reaches an acknowledgement and a small “day so far” view without a provider call.

The prototype ends with an explicit statement that it has not found live places or planned a journey. This is intentional: it enables a visual and conversational review without falsely masking the live-discovery defect.

## Deferred implementation decisions

1. Whether the reset becomes the sole default entry route after Product Owner preview review.
2. The exact data and ranking capability required for genuine nearby activities.
3. The bounded live-restaurant evidence run and repair decision for Italian/no-result behaviour.
4. How a verified later destination should influence suggestions after live discovery is dependable.
5. The simplified itinerary and amendable-detail design after the first place choice.

## Validation intent

This packet validates the interface contract and interaction model only. It does not provide external-place, routing, travel-time, provider, production, or arrival-feasibility evidence.
