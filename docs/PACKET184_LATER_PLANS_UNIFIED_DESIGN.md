# Packet 184 — Later plans: unified design

## Purpose

Replace the Plan a Day later-commitment whiteboard with one coherent, optional interaction.

## Implemented

- **Need to be somewhere later?** is one clear action. Opening it immediately shows the finish-place search; there is no second checkbox.
- Every time field in this route uses the same direct typed entry. It accepts `0930` or `09:30`; no browser time wheel remains for start time, finish time, or an added time.
- A chosen finish asks **What time do you need to be there?** and offers **No fixed time**. No deadline is assumed until a time is entered.
- Added times use the same plain questions and are presented as consistent cards with individual **Edit** and **Remove** actions.
- A chosen finish has its own **Remove end destination** action. The normal place search remains available to change it.
- Removed fixed-anchor language from the visible path. The plan summary uses **Your later plans** and **Planned time**.
- Planning inputs now share the same typeface, focus treatment, borders, and control proportions. Small numeric inputs for an added time do not occupy the entire width.

## Unchanged

Live Places, location and place resolution, validation, Google Maps actions, routing policy, credentials, Netlify, and production are unchanged.

## Validation

- Focused planning, place-resolution, typed-time, hard-time, app-flow, and language checks pass: 1,578 tests.
- Full automated suite passes: 2,257 tests across 69 suites.
- Production build completes successfully.

## Preview focus

Check the Later plans action on a phone: one tap opens the finish search; typed times work without a wheel; a selected finish or added time has a clear individual remove option.
