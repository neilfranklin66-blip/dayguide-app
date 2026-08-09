# Packet 172 - Live Discovery Release Candidate

## Purpose

Freeze the accepted Packet 171 live-discovery behaviour for a short,
real-world release-candidate check. This packet makes no product change, no
provider configuration change, and no Production change.

## Candidate

- Draft PR: 14
- Source branch: `packet-170-live-places-acceptance-first-minute-flow`
- Starting accepted source: `f345019`
- Preview: `https://deploy-preview-14--ubiquitous-melomakarona-874d9c.netlify.app`

## Automated gate

- Full automated test suite passes.
- Production build passes.
- Existing preview is successful.

## Product Owner checks

Run these with location enabled in two or three materially different places.
One home-area check and one town or visitor-area check are sufficient; a third
check is optional.

1. Open **Find something nearby**. Confirm Food & drink and Things to do are
   clear, large choices.
2. In each appropriate location, confirm Food & drink and Things to do show
   live, relevant places. Do not accept a sample card or a food venue in the
   activity list.
3. Pick at least two places. Confirm the itinerary, planning transport
   estimates, and Google Maps live-route links are usable.
4. Change the app to one supported non-English language. Confirm the core
   choice, cards, buttons, and itinerary remain understandable.
5. Check the flow once on a phone in ordinary outdoor light.

## Decision rule

- **Pass:** the core live flow is useful in the tested locations, no sample or
  cross-category regression is seen, and the phone flow is clear.
- **Hold:** record the exact card, location type, screen and wording if a
  result is irrelevant, unavailable, or unclear. Do not merge while held.

## Next authority boundary

Passing this gate prepares a separate Product Owner decision to merge PR 14.
It does not itself authorize a merge, Production deployment, Google Routes,
or new data providers.
