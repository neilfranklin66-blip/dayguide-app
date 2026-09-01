# Packet 182 — Plan a Day: essentials first

## Purpose

Make the first Plan a Day choices quicker to read and easier to use outdoors, without changing the live-place, place-search, routing, credential, or deployment behaviour.

## Implemented scope

- Date and start time appear before activity and food choices.
- Date and time controls are larger; the time remains directly editable and now offers :00, :15, :30 and :45 one-tap choices.
- The main screen uses shorter, friendlier wording. Start order and walking preferences remain available under **More planning options** rather than being part of the first decision path.
- The place screen no longer repeats the start-time control or shows Private Alpha and browser-storage prose. The optional later destination is asked as a normal question, and the detailed time commitment editor is folded away until needed.
- The five supported interface languages have equivalent concise labels.

## Deliberate limits

This is a first simplification pass, not a replacement of the working planning and discovery architecture. It does not change:

- real Google Places search and card selection;
- start, finish, or commitment validation;
- saved-plan treatment, maps links, journey estimates, provider configuration, credentials, billing, Netlify, or production;
- the broader future decision on the final order of all planning questions.

## Validation

- Focused component, planning-place, time-control, and locale-consistency suite passes: 1,503 tests.
- Full automated suite passes: 2,235 tests across 68 suites.
- Production build completes successfully.
- A later unpublished preview should check only the visual first pass: large date/time controls, direct typed time, and the collapsed optional controls. Live place behaviour remains covered by the existing acceptance base.

## Follow-on

Use preview feedback to decide whether a later packet should further reduce the initial preference choices or move named-start selection earlier. Do not treat this packet as production promotion.
