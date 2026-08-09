# Packet 183 — Direct time entry and later plans

## Purpose

Refine the Packet 182 Plan a Day simplification after preview feedback. The browser's rotating time wheel was still awkward on a phone, and the optional finish question duplicated the idea of a later commitment.

## Implemented

- The native time control is removed from the main planning flow. The start time is one ordinary editable field; it accepts `09:30` or `0930` and does not open a minute wheel.
- The quarter-hour buttons are removed. There is one way to amend the time, rather than competing controls.
- **Add a time you need to keep** is the single collapsed optional section. It contains both the optional later finish and the ability to add a named place and time.
- Removed user-facing fixed-anchor wording from this path. A completed plan calls such an item **Planned time** and the summary is **Your later plans**.
- All five supported interface languages have equivalent wording.

## Unchanged

Real Places discovery, start/finish search and validation, maps actions, routing policy, provider configuration, credentials, Netlify, and production are unchanged.

## Validation

- Focused time-entry, planning-stage, planning-place, summary, app-flow, accessibility-control, and locale checks pass: 1,560 tests.
- Full automated suite passes: 2,236 tests across 68 suites.
- Production build completes successfully.

## Preview focus

On a phone, type a time in the one field using either `0930` or `09:30`. Confirm that no wheel appears, and that later finish and named time details appear only after opening **Add a time you need to keep**.
