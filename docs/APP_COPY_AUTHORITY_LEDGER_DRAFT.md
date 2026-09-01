# DayGuide App Copy Authority Ledger — Draft for Product Owner review

**Purpose:** one checkable record of the English words that have actually been
agreed for the experience-reset app. It is deliberately stricter than a
snapshot of the source code: text being present in the application does **not**
make it approved.

**Status:** review draft. It changes no interface text and gives no permission
to alter interface text.

**Audit date:** 18 August 2026  
**Source scope:** the active baseline, Packets 185–186, the recorded Product
Owner decisions in this task, and every English user-facing source group in
`src/locales/en.json`.

## How to read this ledger

| Status | Meaning |
| --- | --- |
| **Approved exact copy** | The words below may be used exactly as written. They must not be casually rephrased. |
| **Approved interaction; wording pending** | The user approved the action or control, not a final string of words. No implementation may invent the words. |
| **Historical / superseded** | It was agreed earlier but is no longer authority for the reset flow. Preserve history; do not reintroduce it. |
| **Explicitly excluded** | It must not appear in the normal reset flow. |
| **Present but not approved** | It is in the current English source. It is not authority and needs Product Owner review before being retained, changed, or used as a design precedent. |

## Authority rule

The Product Owner designs the wording and flow. Codex implements the exact
approved wording and does not add, shorten, embellish, translate, or substitute
copy on its own initiative. A source string, old test, earlier packet, or
visual convention cannot override a later explicit Product Owner decision.

## A. Approved exact copy — current reset flow

### Page 1 — Welcome

| Location | Exact approved text |
| --- | --- |
| Brand | **DayGuide** |
| Strapline | **Your day, your choices** |
| Editorial promise | **Local favourites, hidden gems and somewhere new.** |
| First action | **Find something nearby** |
| Second action | **Plan your day** |

Page 1 must not call editorial imagery “Nearby”, add a non-functional arrow,
or use “Real places” as its promise.

### Page 2 — Nearby choice

| Location | Exact approved text |
| --- | --- |
| Heading | **What are you in the mood for?** |
| Choice 1 | **Food & Drinks** |
| Choice 2 | **Things to do** |
| Choice 3 | **Show me both** |
| Food category heading | **What sounds good?** |
| Food action | **Show Food & Drinks places** |
| Things-to-do action | **Show things to do** |

No explanatory sentence appears beneath any of the three Page 2 choices. This avoids an unapproved claim about what a specific discovery path will return.

The Food & Drinks category list is exactly:

> Italian · Indian · British · Japanese · Mexican · Mediterranean · Spanish ·
> French · Chinese · Asian · American · Middle Eastern · Cafe

The user may select one or more categories or browse the full matching set.
Cards continue in further matching batches until the available results are
exhausted; a zero result must invite a filter or area change, not display an
empty itinerary.

### Page 3 — Nearby single-card result

| Location | Exact approved text / control |
| --- | --- |
| Advance past a card | **Skip** |
| Select a card | **Choose** |
| Reset the nearby journey | **Start over** |
| Provider-origin marker | **Live from Google Places** — only when true |
| Google Maps action | **Open in Google Maps** |

Nearby is one selected live venue, not an itinerary. After **Choose**, the
selected live card remains with its Maps action and the quiet **Start over**
route. It must not add another venue or a travel-policy paragraph.

The map action opens the existing Google Maps deep link. It is labelled
**Open in Google Maps**, not “Maps”, “Open in Maps”, or an icon alone.

### Plan your day — exact phrases already agreed

| Location | Exact approved text |
| --- | --- |
| Departure-time heading | **When would you like to start?** |
| Page title | **Plan your day** |
| Date label | **Date** |
| Start-place heading | **Where will you start?** |
| Start-place help | **Search for a place, address, postcode or ZIP code.** |
| Current-location choice | **Use my current location** |
| Finish heading | **Where will you finish?** |
| Arrival-time question | **What time do you need to be there?** |
| No-deadline choice | **No fixed time** |
| No selected time | **No start time chosen yet** |
| Today time readout | **Starting Today at {time}** |
| Other-date time readout | **Starting {day} {date} at {time}** |
| Current-location confirmation | **Start area set: your current location, {area}** |
| Current-location fallback | **Start area set: your current location** |
| Searched-start confirmation | **Start area set: {name}, {locality} {postcode}** |
| Continue action | **Continue** |
| Neither requirement set | **Choose a start time and a start area to continue** |
| Start area missing | **Choose a start area to continue** |
| Start time missing | **Choose a start time to continue** |
| Location declined/unavailable | **Location isn't available. Search for a place, address, postcode or ZIP code instead.** |
| Location temporarily unavailable | **Couldn't get your location just now. Try again, or search for a place, address, postcode or ZIP code.** |

The start choice is always explicit: location permission is not consent to make
the current position the start automatically. A successful location or searched
place selection must confirm **directly below** the control that caused it.

### Tap-first time selection — approved controls

The approved interaction is tap-first, not a wheel and not keyboard-first.
The agreed quick-choice wording shown in the reference is:

> Now · In 1 hour · In 2 hours  
> Or pick a time  
> Morning · Afternoon / evening  
> 1–12  
> :00 · :15 · :30 · :45

Quick choices set a time directly. For a specific time, **Morning** activates
6–11 and **Afternoon / evening** activates 12–11 pm; a day part is required
before the hour grid becomes active. The selected-time readout is always
present and uses the exact approved forms in the Plan your day table.

The date control defaults to today and displays `Today · Tue 18 Aug`; it opens
the platform native picker and permits today through 90 days ahead. **Leaving
at this time** and **2 taps from here** remain reference-caption examples, not
production copy.

## B. Later design decisions

| Topic | Candidate wording / issue |
| --- | --- |
| Maps action label | **Resolved:** **Open in Google Maps**. It accurately describes the existing Google Maps deep link. It must not be icon-only. |
| Important-event type labels | **Resolved for the current single English locale:** **Theatre or Cinema**, **Meeting**, and **Something else**. British **Theatre** applies throughout the present English locale. |
| Food/Things guidance sentences | **Resolved:** no descriptive sentence appears beneath the Page 2 choices. |
| Wider nearby search / rural driving range | Product direction approved for later design; the displayed controls and words are not yet approved. |
| Miles versus kilometres | **Resolved for future implementation:** `en` uses miles; `es`, `fr`, `vi`, and `zh` use kilometres; one decimal below 10, whole number at 10+. English uses **away**, measured as straight-line distance from the active search origin, never a preceding selected place. |

## C. Historical decisions — preserve, do not revive as reset-flow copy

These formulations document earlier product thinking. They must not be treated
as permission to put them back into the reset flow without a fresh decision:

- **Do you need to be somewhere later? If so we can plan options in that vicinity.**
- **Plan a day** as reset-flow user-facing copy; it is superseded by **Plan your day**.
- **Fixed anchor**, **buffer**, and accompanying policy language.
- Walking-preference questions, pace, longest-walk settings, age/weight
  discussion, and travel-policy explanations.
- Multi-stop Nearby completion wording and empty-itinerary wording.
- “Private Alpha” notices and technical/provider explanations in normal flow.

## D. Explicitly excluded wording or behaviour

- Do not use **Food and Drinks**, **Food & Drink**, or **Food** in place of
  **Food & Drinks**.
- Do not use **Real places** as marketing or explanatory copy. DayGuide does
  not present pretend venues, so it is not a useful promise.
- Do not show decorative overlay labels **Food**, **Explore**, or **Both** on
  the Page 2 choice cards.
- Do not use “Private Alpha”, “fixed anchor”, “buffer”, or routing-policy prose
  in the normal app path.
- Do not make unapproved current location the starting place.
- Do not add an itinerary, another venue, or a follow-up decision after a
  Nearby **Choose** action.

## E. Full current English-source classification

This is the complete classification of current English source **groups**. The
exact key/value inventory remains inspectable in
[`src/locales/en.json`](../src/locales/en.json). Group classification prevents
old strings from silently acquiring authority while retaining a full audit
trail.

| English source group | Classification | Notes |
| --- | --- | --- |
| `app` | Present but not approved | Includes the emoji application title. |
| `login` | Present but not approved for the reset design | Authentication wording needs a separate entry/auth decision. |
| `location` | Mixed | The two approved Plan your day recovery sentences in section A are authority for that screen only. Other technical fallback/error wording is not approved. |
| `welcome` | Mixed | Only the five Page 1 strings in section A are approved. Coordinate/location/resume strings are not. |
| `discovery` | Mixed | Only the headings, three choices, Food & Drinks list/action, Things action, **Skip**, **Choose**, and **Start over** in section A are approved. All hints, loading, completion, error and build-itinerary strings are not. |
| `interests` | Historical / superseded except tap-first values in section A | Legacy questionnaire, price, party, walking and start-order wording must not guide the reset flow. |
| `planning` | Mixed | Only the exact phrases in section A are approved. “When would you like to go?” and all other source wording are not authority. |
| `planMood` | Present but not approved | It is the old blue planning mood screen, including “Your day takes shape” and its explanatory paragraphs. It must not be used as reset-flow authority. |
| `nearbyResult` | Mixed | **Live from Google Places** is approved when true; the Google Maps action is **Open in Google Maps**. “Your nearby pick” and “Find another” are not approved. Future locale-distance formatting is governed by section B. |
| `activities` | Present but not approved for reset copy | Some live-data recovery behaviour is needed, but no displayed wording in this group is approved by this ledger. Sample wording must not appear for new live discovery. |
| `mealPrompt` | Historical / superseded | Nearby does not build a multi-stop plan. |
| `geography` | Historical / future | The provider-free relative-position concept is approved for later work; its displayed copy is not. |
| `restaurants` | Present but not approved for reset copy | Live-data truthfulness is required; old restaurant/timeline copy needs a separate review before reuse. |
| `cuisine` | Mixed | The 13 Page 2 Food & Drinks category labels in section A are approved. |
| `priceRange` | Historical / future | No approval to surface price controls in the reset flow. |
| `timeline` | Historical / superseded for Nearby | A planned-day itinerary is later work; it must not appear after a single nearby selection. |
| `transport` | Future planning detail | Not approved as current reset-flow copy. |
| `popups` | No current English values | No classification needed. |
| `header` | Present but not approved | Persistent language/account/logout controls are specifically not part of every reset screen. |

## F. Known authority conflicts requiring correction before another UI-copy packet

1. The former source/baseline phrase **When would you like to go?** is not
   approved. The Product Owner-approved heading is **When would you like to
   start?**. The versioned baseline amendment records this authority correction;
   application code still requires a separately authorised implementation.
2. `src/locales/en.json` contains many legacy strings that conflict with the
   reset direction, including the old blue planning mood text, walking
   preferences, anchors/buffers, multi-stop Nearby language, and default-policy
   explanations. Their presence is not approval.
3. The current source contains both **Maps** and **Open in Maps**. Both are
   superseded for the future reset design by **Open in Google Maps**.

## Review checklist

Before implementation changes any displayed wording, check every proposed
string against this ledger:

1. If it appears under **Approved exact copy**, use it unchanged.
2. If it appears under **Pending**, obtain the Product Owner’s exact choice.
3. If it appears under **Present but not approved**, do not retain, change, or
   use it as precedent without review.
4. If it is absent from the ledger, it is not approved; propose it rather than
   inserting it.
