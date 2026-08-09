# Packet 174 - Outdoor Usability and Card Resilience

## Status

**Draft PR 16 candidate. An unpublished-preview visual check is requested;
it is not accepted, merged, or Production-live.**

## Purpose

Improve the readability and touch usability of the approved live-discovery
flow without changing live Places behaviour, credentials, providers, routing,
or the production deployment.

## Delivered locally

- The nearby **Food & drink** and **Things to do** choices use the same large,
  two-column choice-card treatment at desktop and phone widths.
- Date and time inputs now share a 56px minimum control height, clearer border
  contrast, and visible keyboard focus treatment. Existing values and controls
  are unchanged.
- Primary and choice buttons have a 52px minimum touch target.
- Long live venue names wrap within their card and retain the full name as the
  heading title. Card height remains content-led: real cards can legitimately
  differ in height because name, category, address, photo, and live facts vary.
- Food and activity interest options share the same two-column card grid,
  minimum height, and mobile padding. The former three-column cuisine grid and
  activity-only mobile override made the two groups look unrelated.
- A missing venue photo now uses the neutral **Food & drink** image label. It
  no longer abbreviates the live restaurant name inside the blue fallback
  image; the full live name remains in the heading below.
- The orange focus treatment now applies to the focused date/time fields as
  well as keyboard-focused controls. It is a temporary focus indicator, not a
  permanent change of the DayGuide colour theme.
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
