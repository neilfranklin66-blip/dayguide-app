# Packet 185 — DayGuide design foundation

## Purpose

Create one small, durable visual and interaction foundation before further
Plan-a-Day reconstruction. DayGuide should feel like a friendly decision
companion, not a long form or diary-management system.

## What this packet changes

- Adds `src/design-tokens.css`: shared colour, typography, spacing, radius,
  elevation, focus and touch-target values.
- Applies those values to the shared page, card, button, input and
  planning-panel foundations without changing Live Places, place resolution,
  itinerary logic, credentials, providers or deployment configuration.
- Establishes the approved six-screen, phone-first contract below. It is the
  source for later UI packets until an editable Figma workspace is connected.

## Design principles

1. **One question at a time.** A short, clear prompt and a direct choice are
   better than an explanatory paragraph.
2. **Tap before typing.** Offer a small set of sensible choices first. Ask for
   text only for a place, address, postcode/ZIP code, or genuinely personal
   detail that cannot be inferred.
3. **A choice confirms underneath itself.** Confirmation never appears above
   the interaction that caused it.
4. **A plan has limited structure.** Build a Day supports one optional finish
   destination and one optional important event. It is not an unlimited diary.
5. **Show geography, do not lecture about it.** A provider-free “Your day
   area” diagram can show real relative positions without claiming roads,
   routes or travel guarantees.
6. **User control stays visible.** Selected places, times and cards can be
   changed or removed where they appear.

## Visual rules

| Element | Rule |
|---|---|
| Typeface | One system sans-serif family throughout. |
| Main text | `--dg-color-text`; secondary copy uses `--dg-color-text-secondary`. |
| Brand | Blue remains the primary identity; the existing blue/purple gradient is reserved for primary actions and the page background. |
| Focus | A 3px action-orange outline (`--dg-color-focus`) is visible for keyboard users and in low-contrast surroundings. |
| Controls | Standard actions are at least 52px high; compact secondary actions are never below 44px. |
| Inputs | At least 64px high, a clear dark border and no hidden or implied value. |
| Surfaces | White cards; pale-blue grouped panels; one consistent radius and border family. |
| Copy | Plain language. No “Private Alpha”, “fixed anchor”, “buffer”, routing policy or duplicate instructions in the normal path. |

## Six phone-first reference screens

### 1. Welcome

`Plan a day` and `Find something nearby` are equally clear. Nearby promises
one real local choice; Plan a day promises a simple day shape.

### 2. Plan basics

Ask only: date, starting time and starting location. Start location gives two
mutually exclusive routes:

`Use my current location` **or** `Search for a start place`.

The result appears immediately below the selected route, for example
“Using your current location” or “Starting at Northampton Museum”.

### 3. Optional day structure

Two collapsed, optional actions only:

- `Need to finish somewhere later?`
- `Is there one important event today?`

The finish asks for a place and, only when chosen, an optional arrival time.
There is no invented default time. The important-event route begins with three
quick choices: `Theatre / cinema`, `Meeting`, or `Something else`, then asks
for its place and time. No second event can be added in v1.

### 4. Your day area

After the fixed points are known, show a compact coordinate-based diagram:

- blue: start;
- purple: important event;
- red: finish;
- orange: Food & Drinks;
- green: Things to do.

It is a relative-position view, not a road map or route claim. It needs no
mapping-provider call, key or billing. Selected cards and dots should
highlight each other when this screen is implemented.

### 5. Real place cards

Cards retain live place names, real photos where supplied, clear food/activity
labels, a visible source marker and large Choose / Skip actions. Long venue
names wrap rather than truncate.

### 6. Itinerary

The first item is a journey from the selected start location to the first
venue. A selected start time means departure time, not an impossible instant
arrival. Typical estimates remain estimates; a Maps action is optional.

## Delivery boundaries

This packet is a foundation only. The following need their own focused
implementation and acceptance evidence:

- one-finish/one-important-event planning interaction;
- first-leg travel and realistic first-arrival scheduling;
- the provider-free day-area diagram;
- any future interactive premium map.

## Figma handoff

No editable Figma workspace is connected to this session, so no Figma file was
created. When one is connected, create a `DayGuide Design Foundation` file and
transfer the token names, visual rules and six screens in this document before
authorising further broad UI changes.
