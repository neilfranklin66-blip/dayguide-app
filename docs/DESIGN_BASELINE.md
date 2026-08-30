# DayGuide Design Baseline

- **Status:** Active design authority for the experience reset
- **Version:** 1.9
- **Effective:** 26 August 2026
**Scope:** The welcome screen, nearby-discovery choice screens, and the next single-card discovery screen. It also records the agreed direction that later planning screens must follow.

## Authority and history

This baseline is the active reference for the current reconstruction. It **supersedes Packet 185 where the two differ**. In particular, the current experience leads with **Find something nearby**, uses the approved full-screen welcome treatment, and separates quick nearby discovery from longer day planning.

[Packet 185 - Design Foundation](PACKET185_DESIGN_FOUNDATION.md) remains unchanged as the historical record of the earlier foundation. It must not be rewritten to make history appear different. Later documents and implementation should cite this baseline when they need the current decision.

This document distinguishes deliberately between:

| Label | Meaning |
| --- | --- |
| **Implemented** | Present in tracked source on the experience-reset branch. |
| **Approved next** | Agreed product direction that must guide the next implementation, but is not yet evidence of shipped behaviour. |
| **Future decision** | Valuable direction, but not authorised as current behaviour. |

## Product promise

DayGuide is a location-aware companion that helps people find enjoyable things to do and shape a day around their own choices.

It is not a lengthy questionnaire, a travel-policy explanation, or an app that tells people how to spend their time. The first useful option should arrive quickly; the user chooses, skips, or stops whenever they wish.

The governing design principles are:

1. Less typing and less clutter.
2. More obvious tapping and clear, outdoor-friendly controls.
3. A premium, calm, visually led feel.
4. One understandable step at a time, with no duplicated questions.
5. Total consistency of language, fonts, spacing, layouts, colours, and action behaviour.
6. Real nearby venue information must never be represented by a pretend venue.

## Shared visual and language system

- **Phone first:** screens must work comfortably at phone width before desktop refinements. Tap targets must be generous and visible in glare or low light.
- **One visual language:** the Page 1/2 system is the reference. Do not introduce an unrelated blue legacy layout, extra decorative labels, or a new category palette without a recorded decision.
- **Action roles:** deep DayGuide blue is the primary nearby-discovery action; coral is the primary planning/build action. Neither colour becomes a competing category code.
- **Plain labels:** use **Food & Drinks** exactly. Do not substitute “Food and Drinks”, “Food & Drink”, “Food”, or a new variation.
- **No decorative false affordances:** a label, badge, arrow, or button may appear only if it accurately describes something the user can act on. Editorial imagery must not be labelled “Nearby” or presented as a live venue.
- **No persistent clutter:** language, account, or log-out controls do not belong as prominent controls on every step. Technical language, internal labels, and repetitive explanations stay out of the main flow.
- **Accessible detail:** long venue names wrap rather than disappear; text never overlays a control; colour is never the only way to understand a choice; keyboard focus remains visible for desktop and assistive use.

## Binding English copy authority

This is the complete list of English user-facing phrases approved for the
current experience-reset design. Use each phrase exactly as shown, including
capitalisation, punctuation, and **&**. A string present in application source,
an old test, a prior packet, or a previous screen is **not** approved merely
because it exists.

No new visible phrase may be added, shortened, rephrased, or translated from
this list without Product Owner approval. Where the list uses a placeholder in
braces, the surrounding words are fixed and only the placeholder is dynamic.

### Page 1 — Welcome

- **DayGuide**
- **Your day, your choices**
- **Local favourites, hidden gems and somewhere new.**
- **Find something nearby**
- **Plan your day**

### Page 2 — Nearby choice and categories

- **What are you in the mood for?**
- **Food & Drinks**
- **Things to do**
- **Show me both**
- **What sounds good?**
- **Show Food & Drinks places**
- **Show things to do**

The approved Food & Drinks category labels are:

- **Italian**, **Indian**, **British**, **Japanese**, **Mexican**,
  **Mediterranean**, **Spanish**, **French**, **Chinese**, **Asian**,
  **American**, **Middle Eastern**, **Cafe**

There is no approved explanatory sentence beneath the three nearby-choice
cards.

### Page 3 — Nearby single-card result

- **Skip**
- **Choose**
- **Start over**
- **Live from Google Places** — only where this is factually true
- **Open in Google Maps**

### Plan your day opening

- **Plan your day**
- **When would you like to start?**
- **Date**
- **Now**
- **In 1 hour**
- **In 2 hours**
- **Or pick a time**
- **Morning**
- **Afternoon / evening**
- **Where will you start?**
- **Search for a place, address, postcode or ZIP code.**
- **Use my current location**
- **No start time chosen yet**
- **Starting Today at {time}**
- **Starting {day} {date} at {time}**
- **Start area set: your current location, {area}**
- **Start area set: your current location**
- **Start area set: {name}, {locality} {postcode}**
- **Continue**
- **Choose a start time and a start area to continue**
- **Choose a start area to continue**
- **Choose a start time to continue**
- **Location isn't available. Search for a place, address, postcode or ZIP code instead.**
- **Couldn't get your location just now. Try again, or search for a place, address, postcode or ZIP code.**

The approved specific-time control labels are **1** through **12**, then
**:00**, **:15**, **:30**, and **:45**. They are controls, not additional
sentences. The date value is dynamically displayed in the approved form
`Today · Tue 18 Aug`.

### Later bounded planning labels

- **Where will you finish?**
- **What time do you need to be there?**
- **No fixed time**
- **Theatre or Cinema**
- **Meeting**
- **Something else**

The current English locale uses British **Theatre** throughout.

### Copy not yet approved

The following required future areas have no approved user-facing wording yet:

- a nearby-card count, including any `1 of 19` format;
- the zero-result recovery message and controls;
- the planned-day itinerary title, summary, empty state, and actions;
- wider nearby-search or rural-driving controls;
- a later relative-position diagram and its labels.

Do not fill these gaps with existing source text or new wording. Obtain the
exact phrase before implementation.

### Superseded or excluded reset-flow wording

The following is deliberately preserved as a do-not-reintroduce list for the
current reset flow. Historical documents retain it as history; application
source must not treat it as a design precedent.

| Phrase or form | Current rule |
| --- | --- |
| **Plan a day** | Superseded by **Plan your day**. |
| **When would you like to go?** | Superseded by **When would you like to start?**. |
| **Your day takes shape** | Not approved; it claims progress before the user has made a choice. |
| **Your Perfect Day** | Not approved; DayGuide must not promise a perfect plan. |
| **Your itinerary is empty. Start over or change your selections to build your day.** | Not approved for the reset flow; it must not be shown when the available actions do not provide the stated recovery. |
| **Pick one to see nearby options.** | Not approved. Page 2 has no explanatory sentence below the choice cards. |
| **Somewhere to eat, or just a good coffee** | Not approved. |
| **Places worth a wander** | Not approved. |
| **A balanced mix nearby** | Not approved. |
| **Find somewhere good to eat or have a coffee.** | Not approved. |
| **Find a place worth seeing, doing or exploring.** | Not approved. |
| **Start with something to do, then add food if you want it.** | Not approved. |
| **Food and Drinks**, **Food & Drink**, or **Food** | Do not use in place of the exact label **Food & Drinks**. |
| **Real places** | Do not use as a promise or explanatory copy. |
| **Food**, **Explore**, or **Both** as overlay words | Do not place these over Page 2 choice cards. |
| **Your nearby pick**, **Find another**, **Choose this**, or **Not for me** | Not approved for the nearby selected-card flow. |
| **Maps** or **Open in Maps** | Use the exact action label **Open in Google Maps**. |
| **Private Alpha**, **Fixed anchor**, or **Buffer** | Do not use in the normal reset flow. |
| **Do you need to be somewhere later? If so we can plan options in that vicinity.** | Historical wording; do not reintroduce. |
| Walking-preference, pace, age/weight, or routing-policy explanations | Do not use in the normal reset flow. |

This table deliberately lists phrases with an explicit current decision. It
does not approve or classify every remaining legacy string in the source file;
anything outside the approved list is unapproved until reviewed.

## The two journeys

| Journey | User need | Intended outcome |
| --- | --- | --- |
| **Find something nearby** | “Give me a good option now.” | A quick mood choice, relevant real place cards, then one calm selected result with Maps. It does not force an itinerary. |
| **Plan your day** | “Help me shape a day around my own plans.” | Day, departure time, start area, then only the optional commitments needed for a useful plan. It can later lead to places and an itinerary. |

The journeys share the same visual system and place-card truthfulness, but they must not be forced through the same number of screens.

## Page 1 - Welcome

**Status:** Implemented and visually approved.

### Required content and hierarchy

1. A single uplifting editorial hero image, filling most of the phone screen.
2. **DayGuide** positioned high and to the right where it does not cover the venue or people in the image.
3. **Your day, your choices** lower in the image, in open visual space.
4. **Local favourites, hidden gems and somewhere new.** directly below it, also in open visual space.
5. **Find something nearby** as the first, visually primary action.
6. **Plan your day** as the second action.

The approved Page 1 treatment uses the seaside restaurant editorial image. It is a mood-setting image, not a claim that the pictured restaurant is nearby or available through DayGuide. It must remain a single image: no overlapping editorial cards, no inactive “Nearby” pill, and no inactive arrow.

Before another editorial image is added or replaced, its source, licence, crop, and placement require Product Owner confirmation.

## Page 2 - What are you in the mood for?

**Status:** Implemented as the approved direction; visual polish and text must remain governed by this section.

### Required first choice

The page presents exactly these three equal, clear choices:

- **Food & Drinks**
- **Things to do**
- **Show me both**

Each choice is a direct route into the matching discovery path. The page must not add overlay words such as “Food”, “Explore”, or “Both” over those controls. It must not make an itinerary promise before a user has selected a place.

The three choice cards carry no explanatory sentence beneath their labels. The labels are sufficient; no generic discovery hint is added unless separately approved.

The visual composition uses editorial photography only as durable part of the app design, not as temporary filler. Food imagery should communicate eating or drinking at the available crop. The Things to do editorial direction is the approved Tower Bridge crop: preserve both bridge towers and the river, retain useful sky, and minimise distracting foreground railings. If the final crop or source asset changes, it must be shown for approval before insertion.

### Food & Drinks drill-down

After **Food & Drinks**, the page heading is **What sounds good?** and retains the established 13 tappable categories:

Italian, Indian, British, Japanese, Mexican, Mediterranean, Spanish, French, Chinese, Asian, American, Middle Eastern, and Cafe.

The user can choose one or more categories, or see all matching Food & Drinks. The action label is:

> **Show Food & Drinks places**

It is intentionally explicit: “places” alone is too vague at this point in the flow. This action discovers Food & Drinks venues; it is not a duplicate of the coral **Plan your day** action.

### Things to do drill-down

After **Things to do**, present the established activity choices in the same card, spacing, type, and action pattern as Food & Drinks. The action label is:

> **Show things to do**

Do not replace the established activity categories or create a separate visual language without a Product Owner decision.

### Show me both

**Show me both** is a user choice to browse both types of place. It should remain simple and must not introduce a hidden planning form. Its precise live ordering remains a Page 3 implementation decision, but it must never pretend the user has committed to an itinerary.

### Discovery breadth

**Approved next behaviour:** discovery should continue with further matching batches until the available result set is exhausted, rather than ending after one arbitrary short set. A zero-result state must honestly invite a filter or area change; it must never show an empty-itinerary message.

The current radius and any wider rural/driving option are not changed by this baseline. The wider rural/driving topic remains deferred until its transport and search behaviour exists.

Card distance is the straight-line distance from the active discovery search origin: the location or named place actually used for that search. It is not the distance from a preceding selected card. For future implementation, the selected app locale determines the display unit: `en` uses spelled-out miles with **away** (`0.3 miles away`, `1.2 miles away`, `12 miles away`); `es`, `fr`, `vi`, and `zh` use their locale-standard `km` abbreviation. Display one decimal place below 10 units and a whole number at 10 or more.

## Page 3 - Single-card discovery

**Status:** Implemented for the nearby journey and visually approved.

Page 3 is the premium discovery view reached after a Page 2 choice and its optional filter. It should feel like a useful option, not another form.

### Required card contents

1. One real matching venue at a time.
2. A large venue photo only when the live place source supplies one.
3. Accurate venue name, relevant type/cuisine where available, rating/distance/address details where supplied, and an accurate source marker such as **Live from Google Places**.
4. Required provider photo attribution whenever a Google-supplied photo is displayed.
5. A clear **Open in Google Maps** action that remains available after selection. It must not be icon-only or imply an in-app map.
6. Two simple actions: **Skip** and **Choose**.

The card must accommodate long venue names without clipping. It must not use an editorial photo as the image of a live venue, invent a photo, make a generic recommendation claim, or imply that a place is open, suitable, or reachable unless the supporting data actually says so.

### Continuation and completion

- **Skip** moves to the next matching live card.
- Matching cards continue in further batches until there are no more matching results.
- **Choose** keeps the user’s choice visible and gives access to Maps. In the nearby journey, one choice is a complete, calm outcome; it does not force a timetable or itinerary, add another venue, or ask another decision after selection. A quiet **Start over** link below Maps returns to the opening screen if the user wants a different search. The user can keep browsing with **Skip** before choosing.
- A later refinement may offer a reversible “second thought” or remove action. It must not silently discard the choice or turn Nearby into multi-stop planning.
- If live discovery is unavailable, state the practical recovery action plainly: allow location, set a named area, change filters, or return to nearby choices. Do not claim a search was successful and do not substitute sample venues.

## Planning foundations that follow this baseline

These rules guide later planning-screen reconstruction; they do not authorise a broad planning rewrite in the Page 3 packet.

- Start with the essentials: day, departure time, and start area.
- Departure time is tap-first, not a wheel or a keyboard-first input. The approved pattern uses quick choices such as **Now**, **In 1 hour**, **In 2 hours**, day-part choices, hour buttons, quarter-hour buttons, and a clear selected-time readout.
- **Use my current location** is a genuine choice, never an automatic assumption. Its success confirmation appears directly below the interaction the user has just made.
- A named place, address, postcode, or ZIP code remains an alternative start method.
- Keep the optional commitments bounded: one finish destination and one important event. Ask for an arrival time only after its associated destination/event has been chosen; do not invent a default deadline.
- The first planned venue cannot start at the same time as departure unless it is at the start location. Later plan work must allow travel time to the first venue.
- A provider-free relative-position diagram may later help show start, finish, and essential event. It is not a live map and must not be represented as one. A real interactive map remains a separate future/premium decision.

### Approved planning opening specification

The first Plan your day view is a short, visually separated sequence:

1. **When would you like to start?** — the day and tap-first departure time.
2. **Where will you start?** — current location or a searched place, address, postcode, or ZIP code.

The exact page layout, native-date-picker rule, tap-first time mechanics,
start-area confirmations, Continue state, and recovery copy are governed by
[Plan a Day Opening Screen Approval Draft](PLAN_A_DAY_OPENING_SCREEN_APPROVAL_DRAFT.md).
These use the established DayGuide neutral surface and spacing; no new colour
role or separate legacy layout is introduced. The optional finish and one
important time remain below this opening sequence and stay closed until the
user asks for them.

### Implemented planning control: optional finish time

Once a verified finish has been chosen, its optional arrival time uses the same tap-first control language as the departure time: day-part buttons, hour buttons, and quarter-hour buttons. It does not expose a wheel or typed-time field, and it begins with **No fixed time** rather than inventing a deadline. This is a narrow control replacement only; the one-finish/one-important-event structure and later planning work remain governed by the rules above.

## Implementation guardrails

1. Build the next screen from this baseline, not from stale UI tests or pre-reset copy.
2. Update tests only to express the approved flow and live-data truthfulness; tests do not decide product wording or layout.
3. Keep provider credentials, configuration, billing, and deployment decisions outside this design baseline.
4. Preserve Packet 185 and all prior packet records as evidence of how the product evolved.
5. Any change to Page 1 imagery, Page 2 editorial imagery/crop, action colour roles, or Page 3 card hierarchy requires visual review before it becomes the new baseline.

## Version history

| Version | Date | Change |
| --- | --- | --- |
| 1.9 | 26 August 2026 | Consolidated the binding English copy authority and explicit superseded/excluded reset-flow wording in this active baseline. This is a documentation-only clarification; it makes no application-source, deployment, credential, or provider change. |
| 1.8 | 22 August 2026 | Recorded the approved current-English important-event categories: **Theatre or Cinema**, **Meeting**, and **Something else**. The current single English locale uses British **Theatre** throughout. |
| 1.7 | 22 August 2026 | Recorded the Page 2 simplicity decision: the three nearby mood-choice cards carry no explanatory sentence beneath their labels. Recorded **Open in Google Maps** for the action that opens the existing Google Maps deep link, and the future locale-distance rule measured from the active search origin. The wider nearby/rural-driving topic remains deferred. |
| 1.6 | 18 August 2026 | Product Owner approved the complete opening specification: **Plan your day** replaces prior user-facing “Plan a day”; native date selection; mandatory, tap-first departure time; explicit start-area confirmation; bounded Continue state; and plain location recovery wording. The specification is documentation authority until separately implemented. |
| 1.5 | 18 August 2026 | Product Owner approved the exact departure-time heading **When would you like to start?**. This corrects the earlier unapproved “When would you like to go?” wording; it does not itself change application source. |
| 1.4 | 18 August 2026 | Recorded the implemented Plan a day opening: day and tap-first departure time together, followed by the explicit start-area choice; bounded optional commitments remain below. |
| 1.3 | 18 August 2026 | Added one quiet **Start over** link below the selected Nearby card's Maps action. It returns to the opening screen without creating an itinerary or another venue choice. |
| 1.2 | 18 August 2026 | Recorded the implemented tap-first optional finish-time control: no wheel, no keyboard-first entry and no pre-filled deadline. Also records Page 3 as implemented for Nearby. |
| 1.1 | 18 August 2026 | Clarified that Nearby ends after one **Choose** action: the selected live venue remains with Maps only. No post-choice “find another” or “start over” decision is shown, and Nearby must not add its choice to a multi-stop plan. |
| 1.0 | 18 August 2026 | Established the active authority for the approved Page 1 welcome, Page 2 discovery choices and category routes, Page 3 single-card direction, shared visual rules, and the narrow planning foundations. Explicitly supersedes Packet 185 where they differ while retaining Packet 185 as history. |
