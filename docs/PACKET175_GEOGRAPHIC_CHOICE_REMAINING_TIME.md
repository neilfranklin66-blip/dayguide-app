# Packet 175 — Geographic Choice and Remaining-Time Guidance

## Status

Local implementation candidate. Not pushed, preview-verified, merged, or production-live.

## Purpose

Give a person one simple, optional choice of where to look next when their
planning start and a later finish or fixed commitment are meaningfully apart.
The person remains in control of the next search area:

- Near where they started
- Near the later place
- Somewhere in between

This is a planning aid that helps avoid accidental zig-zagging. It is not a
route guarantee or an arrival prediction.

## Behaviour

After a person accepts a live activity or food place during **Plan a day**,
DayGuide may show the choice once when all of the following are true:

- a verified planning start exists;
- there is a later fixed commitment, or an end destination;
- the start and later place are at least 1.5 km apart; and
- the place just selected has usable coordinates.

The card identifies the later place, shows straight-line directional distances
where available, and shows the unallocated part of the user's own selected time
budget when at least 30 minutes remains. It then searches the selected live
category around the area the person chooses.

The later fixed commitment takes priority over an end destination. Otherwise,
the end destination supplies the later location. A short or local day receives
no extra question.

## Safety and accuracy boundary

- Distances are straight-line geographic context only.
- The remaining-time figure is the time budget less selected stop durations and
  the app's existing 15-minute between-stop allowance; it is not a travel-time
  prediction.
- The card explicitly says that it is not a live route and directs a person to
  check live journey times when arrival matters.
- It never says or implies “you will make it”.
- No Routes provider, credential, Netlify setting, or production behaviour is
  changed by this packet.

## Preserved behaviour

- **Find something nearby** stays a simple local-discovery flow and never shows
  this planning question.
- Existing start-area searches remain the initial planning behaviour.
- The selected card is retained before the user chooses a new search area.
- Live-place searches remain the only source for new cards; no sample fallback
  is introduced.
- Restaurant pagination now continues from the currently selected planning area
  rather than reverting to device location.

## Validation

- Geographic-choice engine tests cover the later-commitment, nearby-place, and
  directional-distance cases.
- A DayGuide integration test confirms that choosing the later area re-queries
  live activities using that later area's coordinates.
- Locale consistency checks require the new copy in English, Spanish, French,
  Chinese, and Vietnamese.
- Production build completed locally.

## Next gate

Push only with Product Owner authorisation, open an unpublished preview, and
manually test a start, a later finish or fixed commitment, all three geographic
choices, and the normal no-later-place path. Production promotion remains a
separate decision.
