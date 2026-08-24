# Packet 196 — Pages 1–3 Acceptance Record

- **Status:** Active acceptance gate; documentation only
- **Date:** 24 August 2026
- **Applies to:** PR 24 / `packet-186-phone-first-flow-restructure`
- **Recorded source state:** `7b041d5` (`Packet 195: align approved discovery copy and locale distances`)
- **Authority:** [DayGuide Design Baseline](DESIGN_BASELINE.md), especially Pages 1–3. This record does not replace that baseline or rewrite earlier packet history.

## Purpose

This is the controlled recovery point for the first three user-facing screens. It separates what is already approved from what is visibly incomplete. It authorises **no new copy, visual language, layout, or product behaviour**.

No later screen may be treated as a reason to change these three pages. Any proposed change must first name the affected requirement in this record and receive Product Owner approval.

## Page 1 — welcome

**Acceptance status: accepted. Preserve exactly.**

The approved page is the full-photo DayGuide opening with:

1. **DayGuide** high and right, clear of the restaurant and people.
2. **Your day, your choices** lower in the open sea area.
3. **Local favourites, hidden gems and somewhere new.** directly below it.
4. **Find something nearby** as the first action.
5. **Plan your day** as the second action.

The editorial photo is not a live nearby place, must have no inactive “Nearby” badge or arrow, and must not be replaced without visual approval.

## Page 2 — nearby choice

**Acceptance status: direction approved; current visual implementation not accepted.**

The page must contain only these routes:

| Route | Required label | Required treatment |
| --- | --- | --- |
| Food discovery | **Food & Drinks** | One photo card, then the established 13-category selection. |
| Activity discovery | **Things to do** | One photo card, then the established activity-category selection. |
| Mixed discovery | **Show me both** | One clear route, not duplicated and not presented as an itinerary. |

The Page 2 requirements already approved are:

- use **Food & Drinks** exactly;
- use **Things to do** exactly;
- no overlay labels such as “Food”, “Explore”, or “Both”;
- no explanatory sentences under the three route labels;
- no “Your day takes shape” claim before the user has selected anything;
- the Food & Drinks card uses the approved restaurant image/crop;
- the Things to do card uses the approved Tower Bridge crop;
- no new category colours, font family, font size scale, background treatment, or unrelated legacy layout may be introduced without visual approval.

The present Page 2 must therefore be treated as **incomplete** until the approved images, typography, sizing, spacing, and one shared Page 1–3 visual language are shown together and accepted.

## Page 3 — live nearby card and selected result

**Acceptance status: live data path exists; selected-result escape is not accepted.**

Before selection, one real matching venue is shown at a time, with a provider photo only when supplied, attribution where required, accurate live-source marker, venue details, **Skip**, **Choose**, and **Open in Google Maps**.

After **Choose**, Nearby ends calmly with that single selected venue and its Maps action. It does not create an itinerary, add another venue, or present travel-policy text.

The approved quiet **Start over** route must return to Page 1. It is an acceptance requirement that this route is visibly discoverable on a normal phone screen; a control below the usable viewport is not an adequate exit. The current implementation does not meet that requirement and must be corrected in the next Page 1–3 repair packet.

The provider-photo attribution/link is a separate Google policy and product-boundary matter. This record does not change, hide, rename, or remove it.

## Explicitly undecided — do not invent

The following are not settled by prior approval and must not be guessed in code:

- exact Page 2 font family and numerical type scale;
- exact Page 2 background/surface treatment and vertical spacing;
- the final visual placement of the visible selected-result exit control, provided it fulfils the accepted behaviour above;
- any change to the Google photo/link hand-off.

## Minimum visual acceptance check

Before Page 4 or further planning-screen work:

1. Page 1 matches the accepted opening exactly.
2. Page 2 displays its two approved photo cards, one **Show me both** route, and no extra overlay/copy.
3. Food & Drinks leads to the 13 established categories and **Show Food & Drinks places**.
4. Things to do leads to its established activity categories and **Show things to do**.
5. A live Food & Drinks card and a live Things to do card each show Skip, Choose, Maps, truthful source details, and no invented imagery.
6. After Choose, the selected result has a genuinely visible way back to Page 1 and does not create an itinerary.

## Implementation boundary

This packet records the acceptance gate only. It makes no product-code, credential, provider, deployment, or test change. The next implementation packet is limited to reconciling Page 2 and the selected-result escape against this record after the unresolved visual items are explicitly approved.

