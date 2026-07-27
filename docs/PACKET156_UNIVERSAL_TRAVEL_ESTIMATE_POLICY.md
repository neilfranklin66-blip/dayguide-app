# Packet 156 — Universal Travel-Estimate Policy, User Accountability, and Live-Checking Handoffs

## 1. Authority and outcome

- **Product Owner:** Neil Franklin
- **Implementation agent:** Codex
- **Authority received:** `Implement Packet 156 — Universal Travel-Estimate
  Policy, User Accountability, and Live-Checking Handoffs`
- **Implementation branch:**
  `packet-156-universal-travel-estimates-accountability-handoffs`
- **Production publication:** not authorised

Packet 156 establishes DayGuide as an itinerary-planning guide rather than a
guarantor of real-world arrival times. It retains useful estimated travel
times, makes their evidence and limitations visible, gives the user control of
walking assumptions, and provides a key-free handoff to live Google Maps
directions for each itinerary leg.

The governing product statement is:

> DayGuide helps organise the day. Travel times are estimates, and the user
> decides when to leave after checking current routes and conditions.

This does not reduce DayGuide's longer-term ambition to develop more reliable
and personalised geographical intelligence.

## 2. Universal policy

The policy is independent of London, the United Kingdom, currency, or a
particular transport network.

Every displayed journey duration must identify one of three evidence states:

1. **Provider estimate** — a live provider duration is available and may be
   displayed, but live checking is still recommended.
2. **Planning estimate** — DayGuide has calculated an approximate duration
   from limited distance or mode evidence.
3. **Live check required** — DayGuide has no defensible fixed duration and
   directs the user to current navigation evidence.

An estimate is not a guarantee. Weather, traffic, closures, service changes,
queues, shopping, luggage, children, personal pace, entrances, pickup delays,
parking, and other real-world conditions remain variable.

The itinerary now displays this limitation and the user's responsibility
prominently. A fixed-time anchor can invoke a stronger warning to check the
live journey and allow additional time.

## 3. Walking preferences and boundary

Walking uses the universal physical relationship:

`time = routed distance / walking speed`

The default profile is:

- walking pace: **Typical**;
- internal starting speed: 4.8 km/h; and
- longest walk normally offered: **45 minutes**.

These values are planning defaults, not statements about a person. The
preferences screen allows the user to choose:

- Relaxed, Typical, or Brisk pace; and
- a normal maximum of 15, 30, 45, 60, or 90 minutes.

DayGuide does not infer pace from age, weight, or another personal
characteristic. A walk is removed from the offered modes only when its
calculated time exceeds the user's selected maximum.

The preferences are stored separately from the itinerary under
`dayguide_travel_preferences_v1`, so starting a new day does not erase the
user's general travel preference.

## 4. Previous-experience learning foundation

`recordWalkingExperience` provides a deliberately narrow future foundation for
the premium experience:

> We have based your walking travel time on your previous experience.

It accepts only an explicitly supplied distance and actual duration and stores:

- an aggregate learned minutes-per-kilometre value; and
- a bounded experience count.

It does not store a route, location, GPS trail, place, date, or personal
characteristic. No automatic tracking or background collection is introduced
by Packet 156, and the current UI does not claim that personal learning has
already occurred.

## 5. Mode treatment

### Walking

- calculated from the selected or explicitly learned pace;
- constrained by the user's maximum walking preference;
- described as an estimate; and
- linked to a live walking route when both itinerary endpoints are available.

### Public transport

The existing Tube/train and bus figures remain rough planning estimates until
true route-leg evidence is mounted. Timetables, waiting, interchange, access,
and disruption prevent distance alone from being an arrival guarantee. Each
mode receives a transit directions handoff.

### Car, taxi, and ride-hail

The old taxi display used a fixed 18 km/h city speed plus three minutes. Packet
156 removes that fabricated duration from the user-facing policy. Without live
provider evidence the taxi category says **Check live traffic**.

Its Maps handoff uses driving mode. A future implementation may add separate
pickup, drop-off, parking, entrance, and anchor allowances, but it must not
represent any of those as live evidence unless they are actually known.

When an approved live provider duration is supplied to the policy boundary,
DayGuide can display it as a provider estimate for any supported mode while
still recommending a current check.

## 6. Key-free live checking

`buildGoogleMapsDirectionsUrl` creates route-specific handoffs with:

- the current itinerary stop as origin;
- the next itinerary stop as destination; and
- walking, driving, or transit mode as appropriate.

The URL uses the public Google Maps directions interface. It contains no API
key, server credential, user identity, or payment information. Links open in a
new tab with `noopener noreferrer`.

This is different from the existing restaurant **Open in Maps** place link.
Packet 156's **Check live journey** action is a directions handoff between two
itinerary stops and can also work with an honestly labelled sample activity's
name and address.

## 7. Current evidence limitation

The current production-shaped timeline still carries `distance` as a venue's
proximity to the user's search origin. It is not true distance between the
current and next itinerary stop. Packet 156 therefore labels the displayed
figures:

> Planning estimates use nearby distance, not live traffic or a routed
> itinerary leg.

Packet 156 does not silently relabel this data as route evidence. The Packet
148–151 geographical-plan foundation must eventually supply true adjacent-leg
distance or provider duration before DayGuide can present more capable
stop-to-stop estimates.

## 8. Packet 155 interpretation

Packet 155 remains a valid result against its explicitly approved raw-duration
criteria:

- walking raw-duration comparison: FAIL;
- public-transport raw-duration comparison: FAIL; and
- provider availability: 24/24.

Packet 156 clarifies the product consequence. The provider integration did not
fail. The experiment showed that unadjusted external durations should not be
presented as guaranteed DayGuide commitments. That does not prevent reasonable
estimates, visible uncertainty, user preferences, or live navigation
handoffs.

Packet 156 does not reactivate the Routes credential or provider mode. No new
API key is required for the Maps directions links.

## 9. Visible product changes

- The UK-only English, Spanish, French, Chinese, and Vietnamese opening
  taglines are replaced by a universal "wherever you are" message.
- The preference screen includes walking pace and maximum-walk controls.
- The itinerary includes a visible travel-time guidance panel.
- Taxi shows **Check live traffic**, not a fixed-speed duration.
- Walking, taxi, train/Tube, and bus cards can open a route-specific live Maps
  journey between adjacent itinerary stops.
- The current evidence limitation remains visible beside the choices.

## 10. Acceptance and exclusions

Packet 156 is accepted locally when:

- default walking preference is Typical and 45 minutes;
- a user can select a different supported pace and maximum;
- walking eligibility changes with those preferences;
- no age or weight inference exists;
- explicit prior experience can update only an aggregate pace;
- taxi has no fabricated fixed-speed time;
- valid provider evidence can be represented distinctly;
- every supported mode builds the correct key-free Maps directions handoff;
- general and hard-anchor warnings render correctly;
- saved-plan behaviour is unchanged;
- all existing and new tests pass; and
- the production build succeeds.

Excluded:

- automatic journey tracking;
- automatic premium-profile messaging;
- traffic-aware provider activation;
- live transit disruption data;
- taxi pickup or fare prediction;
- parking calculation;
- mounting the Packet 149 planning-input workflow;
- changing or publishing production; and
- claiming that the current proximity estimate is true leg routing.

## 11. Security and privacy

- No API key is added.
- No Routes environment variable is restored.
- No Google credential is required by a directions link.
- No precise journey history or location trail is persisted.
- User preference storage is local and separate from the saved plan.
- The existing Places key and production deployment are unchanged.

## 12. Validation result

On 27 July 2026:

- the complete test suite passed: **59 suites and 1,134 tests**;
- the production build compiled successfully;
- the main JavaScript bundle was `main.badc4dab.js` at 231.83 kB gzipped;
- the main CSS bundle was `main.805fb421.css` at 4.51 kB gzipped;
- no API key, provider mode, or Netlify variable was added;
- no remote branch or pull request was created; and
- no preview or production deployment occurred.

Packet 156 is therefore implemented in tracked local source, subject to the
current-evidence limitations recorded in section 7.
