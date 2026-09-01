# Packet 186–201 log

**Purpose:** permanent, evidence-led record of the commits labelled Packets 186
through 201 on branch `packet-186-phone-first-flow-restructure`.

**Method:** file lists below are taken from `git show --name-status` for the
listed commits. “Not recalled” means no dedicated committed packet
specification was located in this review. It is deliberately not reconstructed
from a commit title. Status is the current position after later commits,
current source inspection, and the Product Owner’s correction that Page 3 is
the Plan your day essentials screen, not a nearby live-card screen.

**Important historical discrepancy:** `DESIGN_BASELINE.md` and the Packet 196
record used “Page 3” for the nearby live-card route. That numbering is
superseded by the Product Owner’s current definition. This log preserves the
historical record; it does not validate that earlier numbering.

## Packet 186

- **Commits:** `7ce42a2` (13 August 2026), `a1dca47` (13 August 2026),
  `2f09405` (14 August 2026).
- **Intended achievement:** begin the phone-first restructure without changing
  Places, credentials, deployment, or adding editorial photography. The
  committed packet specification records a welcome route leading to nearby
  discovery, a shortened planning start, bounded later details, a planning
  mood choice, and a one-place nearby result.
- **Files changed:**
  - `docs/PACKET186_PHONE_FIRST_FLOW_RESTRUCTURE.md`
  - `src/DayGuide.css`
  - `src/DayGuide.jsx`
  - `src/DayGuide.test.js`
  - `src/components/DateSelector.jsx`
  - `src/components/DirectPlaceSearch.jsx`
  - `src/components/HardAnchorEditor.jsx`
  - `src/components/HardAnchorEditor.test.js`
  - `src/components/NearbyResultStage.jsx`
  - `src/components/NearbyResultStage.test.js`
  - `src/components/PlanMoodStage.jsx`
  - `src/components/PlanMoodStage.test.js`
  - `src/components/PlanningInputStage.jsx`
  - `src/components/PlanningInputStage.test.js`
  - `src/components/PlanningInputWithPlaceResolution.jsx`
  - `src/components/PlanningInputWithPlaceResolution.test.js`
  - `src/components/WelcomeStage.jsx`
  - `src/components/WelcomeStage.test.js`
  - `src/locales/en.json`
  - `src/locales/es.json`
  - `src/locales/fr.json`
  - `src/locales/vi.json`
  - `src/locales/zh.json`
- **Current status:** **partial.** Later packets replaced the welcome treatment,
  time-entry approach, nearby result treatment, planning copy, and layout.
- **Superseded/abandoned:** partially superseded by Packets 187–201. The
  historic typed-time aspect is superseded by later tap-first work.

## Packet 187

- **Commits:** `e138d5a` and `032ac09` (14 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 187
  specification was located.
- **Files changed:**
  - `src/DayGuide.css`
  - `src/DayGuide.jsx`
  - `src/DayGuide.test.js`
  - `src/assets/welcome-seaside-restaurant.jpg`
  - `src/components/WelcomeStage.jsx`
  - `src/components/WelcomeStage.test.js`
  - `src/locales/en.json`
  - `src/locales/es.json`
  - `src/locales/fr.json`
  - `src/locales/vi.json`
  - `src/locales/zh.json`
- **Current status:** **complete for Page 1.** The committed baseline records
  the seaside-restaurant welcome as implemented and visually approved.
- **Superseded/abandoned:** the first Packet 187 commit was refined by its
  second commit, `032ac09`, which repositioned the welcome copy. No later
  packet replaced the approved Page 1 image and hierarchy.

## Packet 188

- **Commits:** `6661a88`, `68bcd92`, and `e0a32bf` (14–16 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 188
  specification was located.
- **Files changed:**
  - `src/DayGuide.css`
  - `src/DayGuide.jsx`
  - `src/assets/nearby-food-restaurant.jpg`
  - `src/assets/nearby-things-tower-bridge.jpg`
  - `src/components/NearbyDiscoveryStage.jsx`
  - `src/components/NearbyMixedStage.jsx`
  - `src/components/NearbyMixedStage.test.jsx`
  - `src/components/NearbyResultStage.jsx`
  - `src/components/OutdoorControls.test.jsx`
  - `src/components/PlanMoodStage.jsx`
  - `src/locales/en.json`
  - `src/locales/es.json`
  - `src/locales/fr.json`
  - `src/locales/vi.json`
  - `src/locales/zh.json`
- **Current status:** **partial.** The Page 2 structure and two editorial
  assets remain in source, but the committed acceptance record says Page 2
  implementation verification was pending. Current source still contains an
  unapproved Things to do category heading.
- **Superseded/abandoned:** refined by Packets 196 and 200; the related
  planning mood component was further changed in Packets 198 and 199.

## Packet 189

- **Commit:** `8ef7eb2` (16 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 189
  specification was located.
- **Files changed:**
  - `src/DayGuide.css`
  - `src/api/placesApi.js`
  - `src/api/placesApi.test.js`
  - `src/components/ActivitiesStage.jsx`
  - `src/components/ActivitiesStage.test.js`
  - `src/components/ActivitySwipeCard.jsx`
  - `src/components/LivePlaceCard.jsx`
  - `src/components/NearbyMixedStage.jsx`
  - `src/components/NearbyMixedStage.test.jsx`
  - `src/components/RestaurantSwipeCard.jsx`
  - `src/components/RestaurantsStage.jsx`
  - `src/components/RestaurantsStage.test.js`
  - `src/locales/en.json`
  - `src/locales/es.json`
  - `src/locales/fr.json`
  - `src/locales/vi.json`
  - `src/locales/zh.json`
- **Current status:** **partial.** `LivePlaceCard.jsx` remains the shared live
  card component, but later packets changed the same route and its live
  end-to-end acceptance remains incomplete.
- **Superseded/abandoned:** partially superseded by Packets 197 and 200.

## Packet 190

- **Commits:** `ca15139` (17 August 2026) and `ef702e1` (18 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 190
  specification was located.
- **Files changed:**
  - `src/DayGuide.css`
  - `src/DayGuide.test.js`
  - `src/components/OutdoorControls.test.jsx`
  - `src/components/PlanningInputStage.jsx`
  - `src/components/PlanningInputStage.test.js`
  - `src/components/StartTimeSelector.jsx`
  - `src/components/StartTimeSelector.test.jsx`
  - `src/locales/en.json`
  - `src/locales/es.json`
  - `src/locales/fr.json`
  - `src/locales/localeConsistency.test.js`
  - `src/locales/vi.json`
  - `src/locales/zh.json`
- **Current status:** **partial.** The tap-first start-time component remains
  in the current Page 3 implementation, but Page 3 remains under repair and
  has not been accepted as the user-defined start/finish/start-area screen.
- **Superseded/abandoned:** the planning-input implementation was later changed
  by Packets 193, 195, and 201.

## Packet 191

- **Commit:** `a893134` (18 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 191
  specification was located.
- **Files changed:**
  - `src/DayGuide.test.js`
  - `src/components/PlanMoodStage.jsx`
  - `src/components/PlanMoodStage.test.js`
- **Current status:** **partial.** The files remain, but their tests and
  planning-mood implementation were changed later.
- **Superseded/abandoned:** superseded in part by Packets 195, 198, and 199.

## Packet 192

- **Commits:** `d5911d1`, `b682ff5`, and `966d494` (18 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 192
  specification was located.
- **Files changed:**
  - `docs/DESIGN_BASELINE.md`
  - `src/DayGuide.jsx`
  - `src/DayGuide.test.js`
  - `src/components/LivePlaceCard.jsx`
  - `src/components/NearbyResultStage.jsx`
  - `src/components/NearbyResultStage.test.js`
- **Current status:** **partial.** The baseline file and nearby selected-result
  component remain, but later acceptance and implementation packets changed
  both. The baseline’s historic Page 3 numbering is superseded by the Product
  Owner’s current screen definition.
- **Superseded/abandoned:** refined by Packets 194, 195, 197, 198, and 200.

## Packet 193

- **Commit:** `a778948` (18 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 193
  specification was located.
- **Files changed:**
  - `docs/DESIGN_BASELINE.md`
  - `src/DayGuide.css`
  - `src/components/PlanningInputStage.jsx`
  - `src/components/PlanningInputStage.test.js`
  - `src/components/PlanningInputWithPlaceResolution.test.js`
  - `src/components/TapTimePicker.jsx`
  - `src/components/TapTimePicker.test.jsx`
  - `src/locales/en.json`
  - `src/locales/es.json`
  - `src/locales/fr.json`
  - `src/locales/vi.json`
  - `src/locales/zh.json`
- **Current status:** **partial.** `TapTimePicker.jsx` is present but is not
  imported into the current DayGuide route. There is no current reachable
  finish-time screen using it.
- **Superseded/abandoned:** effectively abandoned in the current user flow;
  later planning changes did not connect the component to a reachable screen.

## Packet 194

- **Commit:** `23a8dd9` (18 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 194
  specification was located.
- **Files changed:**
  - `docs/DESIGN_BASELINE.md`
  - `src/DayGuide.css`
  - `src/DayGuide.jsx`
  - `src/components/NearbyResultStage.jsx`
  - `src/components/NearbyResultStage.test.js`
- **Current status:** **partial.** A Start over control remains in source, but
  its normal-phone visibility and the full nearby completion route have not
  been accepted.
- **Superseded/abandoned:** refined by Packets 197 and 200.

## Packet 195

- **Commits:** `bf0ba89` (18 August 2026) and `7b041d5` (23 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 195
  specification was located.
- **Files changed:**
  - `docs/DESIGN_BASELINE.md`
  - `src/DayGuide.css`
  - `src/DayGuide.jsx`
  - `src/components/ActivitiesStage.jsx`
  - `src/components/ActivitySwipeCard.jsx`
  - `src/components/HardAnchorEditor.jsx`
  - `src/components/LivePlaceCard.jsx`
  - `src/components/NearbyMixedStage.jsx`
  - `src/components/NearbyResultStage.jsx`
  - `src/components/NearbyResultStage.test.js`
  - `src/components/PlanMoodStage.jsx`
  - `src/components/PlanMoodStage.test.js`
  - `src/components/PlanningInputStage.jsx`
  - `src/components/PlanningInputStage.test.js`
  - `src/components/RestaurantSwipeCard.jsx`
  - `src/components/RestaurantsStage.jsx`
  - `src/components/TimelineItemRow.jsx`
  - `src/locales/en.json`
  - `src/locales/es.json`
  - `src/locales/fr.json`
  - `src/locales/vi.json`
  - `src/locales/zh.json`
  - `src/utils/placeDistance.js`
  - `src/utils/placeDistance.test.js`
- **Current status:** **partial.** The two commits touched separate planning and
  nearby concerns. Their planning work was changed again in Packet 201; their
  nearby work was changed again in Packets 196–200.
- **Superseded/abandoned:** partially superseded by Packets 196–201.

## Packet 196

- **Commits:** `9dcbc20` and `6e815fb` (24 August 2026).
- **Intended achievement:** record the Pages 1–3 acceptance gate and clarify
  Page 2 acceptance status. This is documented directly in
  `PACKET196_PAGE1_TO_3_ACCEPTANCE_RECORD.md`.
- **Files changed:**
  - `docs/PACKET196_PAGE1_TO_3_ACCEPTANCE_RECORD.md`
- **Current status:** **complete as a historical documentation commit; partial
  as a current authority.** It made no product-code change. Its Page 3 label
  conflicts with the Product Owner’s current page map and must not govern new
  work until corrected.
- **Superseded/abandoned:** its Page 3 numbering is superseded by the Product
  Owner’s current definition. Its Page 1 and Page 2 acceptance evidence remains
  historical evidence only.

## Packet 197

- **Commit:** `e4ea7ad` (25 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 197
  specification was located.
- **Files changed:**
  - `src/DayGuide.test.js`
  - `src/components/LivePlaceCard.jsx`
  - `src/components/NearbyResultStage.jsx`
  - `src/components/NearbyResultStage.test.js`
- **Current status:** **partial.** The changed components remain active, but
  the selected nearby card remains under repair.
- **Superseded/abandoned:** refined by Packet 200.

## Packet 198

- **Commit:** `a0bf31a` (25 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 198
  specification was located.
- **Files changed:**
  - `src/DayGuide.css`
  - `src/DayGuide.test.js`
  - `src/api/placesApi.js`
  - `src/api/placesApi.test.js`
  - `src/components/PlanMoodStage.jsx`
  - `src/components/PlanMoodStage.test.js`
- **Current status:** **partial.** The changed Maps and planning-mood paths are
  still active, but the live Maps result must be verified in the user flow and
  the planning-mood screen is not approved.
- **Superseded/abandoned:** the planning-mood part was refined by Packet 199.

## Packet 199

- **Commit:** `377da99` (25 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 199
  specification was located.
- **Files changed:**
  - `src/DayGuide.css`
  - `src/components/PlanMoodStage.jsx`
  - `src/components/PlanMoodStage.test.js`
- **Current status:** **partial.** The component is reachable after the current
  Plan your day essentials screen, but it is not part of the approved Page 1–3
  map and has not received visual approval.
- **Superseded/abandoned:** not replaced by a later packet; it remains an
  unresolved later-planning screen.

## Packet 200

- **Commit:** `1de6d9d` (25 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 200
  specification was located.
- **Files changed:**
  - `src/DayGuide.test.js`
  - `src/components/ActivitiesStage.jsx`
  - `src/components/ActivitiesStage.test.js`
  - `src/components/ActivitySwipeCard.jsx`
  - `src/components/LivePlaceCard.jsx`
  - `src/components/NearbyMixedStage.jsx`
  - `src/components/NearbyResultStage.jsx`
  - `src/components/NearbyResultStage.test.js`
  - `src/components/RestaurantSwipeCard.jsx`
  - `src/components/RestaurantsStage.jsx`
  - `src/components/RestaurantsStage.test.js`
- **Current status:** **partial.** It is the latest committed packet touching
  the shared nearby live-card route, but live browser acceptance for Food &
  Drinks, Things to do, Show me both, Maps, Skip, Choose and Start over is not
  recorded as complete.
- **Superseded/abandoned:** not replaced by a later nearby-card packet.

## Packet 201

- **Commit:** `4e81592` (25 August 2026).
- **Intended achievement:** **not recalled.** No dedicated committed Packet 201
  specification was located.
- **Files changed:**
  - `src/DayGuide.css`
  - `src/DayGuide.jsx`
  - `src/DayGuide.test.js`
  - `src/components/DateSelector.jsx`
  - `src/components/DirectPlaceSearch.jsx`
  - `src/components/PlanningInputStage.jsx`
  - `src/components/PlanningInputStage.test.js`
  - `src/components/PlanningInputWithPlaceResolution.jsx`
  - `src/components/PlanningInputWithPlaceResolution.test.js`
  - `src/components/StartTimeSelector.jsx`
  - `src/components/StartTimeSelector.test.jsx`
- **Current status:** **partial.** This is the current committed tip of PR 24.
  The rendered screen remains under repair and does not currently expose a
  finish-time control. The separate opening-screen draft is untracked and also
  explicitly excludes finish details, so it does not match the Product Owner’s
  current Page 3 definition.
- **Superseded/abandoned:** no later committed packet was found. It requires a
  corrected, approved Page 3 specification before further implementation.

