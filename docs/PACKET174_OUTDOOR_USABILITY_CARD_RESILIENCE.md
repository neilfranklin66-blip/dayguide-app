# Packet 174 - Outdoor Usability and Card Resilience

## Status

**Local candidate. Not pushed, previewed, accepted, merged, or Production-live.**

## Purpose

Improve the readability and touch usability of the approved live-discovery
flow without changing live Places behaviour, credentials, providers, routing,
or the production deployment.

## Delivered locally

- The nearby **Food & drink** and **Things to do** choices use the same large
  choice-card treatment: equal two-column cards on wider screens and full-width
  cards on narrow screens.
- Date and time inputs now share a 56px minimum control height, clearer border
  contrast, and visible keyboard focus treatment. Existing values and controls
  are unchanged.
- Primary and choice buttons have a 52px minimum touch target.
- Long live venue names wrap within their card and retain the full name as the
  heading title. Card height remains content-led: real cards can legitimately
  differ in height because name, category, address, photo, and live facts vary.
- Secondary card copy and fact labels use darker text for improved contrast.

## Boundaries

No live search request, result ranking, Google Places response, provider,
credential, Netlify setting, deployment, language content, or production
branch has changed.

## Local validation

- Focused DayGuide, locale, card-name, and outdoor-control tests: 4 suites,
  1,468 tests passed.
- Production build completed successfully.

## Required next evidence

An unpublished-preview visual and touch check at desktop and phone widths,
including a long live restaurant name, before acceptance or any merge decision.
