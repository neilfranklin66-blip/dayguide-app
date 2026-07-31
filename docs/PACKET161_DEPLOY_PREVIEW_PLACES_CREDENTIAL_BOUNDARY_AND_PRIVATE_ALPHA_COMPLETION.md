# Packet 161 — Deploy-Preview Places Credential Boundary and Private Alpha Completion

**Date:** 28 July 2026

**Status:** PASS — live acceptance completed and preview credential rolled back

**Candidate:** draft PR 8 at
`afd053a49bf86dac03797a169a3a1c0d1d13f541`

**Production baseline:** `master@5ef141b`, deploy
`6a6602bd6c7609eabb08d744`

## 1. Purpose

Packet 161 resolves Packet 160's single operational blocker: the server-side
Places credential is available to Production but not to Netlify Deploy
Previews. It temporarily makes the existing Places-only credential available to
the exact unpublished candidate, reruns that candidate, completes the
Places-dependent Private Alpha journey, and then restores the narrow baseline.

This is a credential-context and acceptance packet. It does not change product
logic or activate a routing provider.

## 2. Explicit authority

Packet 161 authorises:

- editing the existing Netlify `GOOGLE_PLACES_API_KEY` variable;
- adding the existing credential value specifically to the **Deploy Previews**
  context;
- retaining its existing Production value unchanged;
- retrying the exact PR 8 candidate at commit `afd053a`;
- using the unpublished candidate to make bounded Google Places requests for
  manual acceptance;
- inspecting sanitised Netlify, browser, GitHub, and function evidence; and
- removing the Deploy Preview value after the acceptance exercise.

Packet 161 does **not** authorise:

- creating, rotating, deleting, revealing, logging, or committing a Google API
  key;
- adding any `REACT_APP_*` key variable or browser-readable credential path;
- making the credential available to Branch deploys, Preview Server and Agent
  Runners, or Local development;
- changing the existing Production secret value;
- enabling Google Routes or adding `GOOGLE_ROUTES_API_KEY`;
- changing Google Cloud API restrictions, billing, quotas, Firebase, or
  provider configuration;
- merging PR 8 or moving local or remote `master`;
- publishing, promoting, unlocking, or replacing the locked Production deploy;
  or
- retaining a broader context if Netlify cannot express the authorised narrow
  boundary.

If Netlify cannot preserve Production and add only Deploy Previews, the
configuration change must stop rather than silently select all contexts.

## 3. Secret-handling boundary

The credential must remain:

- named exactly `GOOGLE_PLACES_API_KEY`;
- marked as containing secret values;
- referenced only by Netlify Functions;
- restricted in Google Cloud to Places API;
- absent from Git, build output, browser JavaScript, screenshots, copied
  evidence, and chat text; and
- separate from every Routes configuration path.

Because Netlify does not reveal an existing masked secret, a Product Owner paste
may be required. The value must be pasted directly into Netlify's Deploy
Previews field and must not be supplied to source code or recorded evidence.

## 4. Candidate rebuild gate

After the Deploy Preview value is saved:

1. retry the exact PR 8 deploy from commit `afd053a`;
2. confirm Netlify associates the new deploy with PR 8 and that commit;
3. require initializing, building, deploying, cleanup, and post-processing to
   complete;
4. require secrets scanning to pass;
5. confirm the expected Functions are deployed;
6. call `places-resolve` with one bounded public test query and require an
   `OK` result with sanitised candidates;
7. confirm production still identifies `master@5ef141b`; and
8. take no Publish action.

## 5. Places-dependent Private Alpha acceptance

The rebuilt unpublished candidate must demonstrate:

1. a typed London station or address returns verified Google Places choices;
2. a searched start can be selected and finalised;
3. a verified destination and deadline can be selected;
4. a complete verified hard anchor can be added and remains planner-locked;
5. the searched start drives live restaurant discovery;
6. a restaurant card shows a real photograph and `Live from Google Places`;
7. accepting the restaurant adds it to the timeline;
8. an activity remains honestly labelled as a sample idea;
9. the timeline preserves the restaurant, activity, start, destination, and
   anchor;
10. fixed travel legs remain explicitly unverified and require a live check;
11. a key-free Google Maps handoff opens the intended live venue;
12. saved-plan v2 resumes the minimum geographical data and selected stops;
13. the Share window renders a QR code while excluding geographical details
    under the automated privacy contract; and
14. Start Over clears the test plan.

Location permission is not required when an explicitly searched verified start
successfully drives restaurant discovery.

## 6. Closure and rollback

After acceptance evidence is captured:

- remove the `GOOGLE_PLACES_API_KEY` value from Deploy Previews;
- retain the Production value unchanged;
- verify the preview function returns the expected safe `NO_API_KEY` state
  after rollback, or record if Netlify requires a rebuild for that state;
- keep PR 8 draft and unmerged;
- keep Production at `master@5ef141b`;
- record the exact candidate deploy identity and evidence without any secret
  value; and
- create a local `[skip netlify]` evidence commit without pushing it.

The final result is **PASS** only when both live acceptance and credential
rollback succeed. A safe inability to add the narrow context is **BLOCKED**, not
a reason to widen access. A credential exposure, Production change, or
uncontrolled context expansion is **FAIL**.

## 7. Completion evidence

The exact PR 8 candidate at `afd053a` was rebuilt as Netlify Deploy Preview
`6a68a3a3f9034449c8f4bf7e`. Initializing, building, deploying, cleanup, and
post-processing completed; secret scanning passed; and two Functions were
deployed. The deploy remained unpublished and Production remained locked at
`master@5ef141b`, deploy `6a6602bd6c7609eabb08d744`.

The bounded guest journey verified live Google Places choices for London
Euston Station, The Hoxton Southwark, and the National Theatre. It selected the
station as start, the hotel as destination, and a planner-locked 18:30 theatre
anchor at the National Theatre with a 120-minute duration and 15-minute early
arrival. The live run left the optional destination deadline blank; deadline
entry and persistence remain covered by the existing automated workflow tests.

Restaurant discovery initially returned no Italian/moderate match. Removing
the cuisine filter produced the live Charlotte Street Hotel card with a real
photograph, rating, price/distance evidence, and `Live from Google Places`.
Accepting it added it to the timeline. The V&A Museum remained honestly marked
as a sample activity. The completed two-stop itinerary preserved the live
restaurant and sample activity together with the geographical input and locked
anchor, displayed the fixed-time and unverified-travel warnings, and exposed
key-free Maps handoffs. The restaurant handoff opened the intended live Google
Maps venue.

The Share window rendered a QR code. Reload and Resume restored the two planned
stops and the geographical summary. The post-Start Over cleared state was then
verified on the exact Packet 161 origin,
`https://deploy-preview-8--ubiquitous-melomakarona-874d9c.netlify.app`: the
universal `Plan your perfect day, wherever you are` wording and only
`Start Planning` were shown, with no `Resume your plan` option. The locked
production origin was explicitly excluded from this clearance evidence.

The same exact-preview check reproduced one non-blocking presentation defect:
the location-unavailable message can leave `again.` alone on a second line at
the observed browser width. The message remains complete and the location
fallback remains usable; the visual defect is recorded as KI-003 rather than
misclassified as a Packet 161 acceptance failure.

The complete automated suite finished successfully with **61 suites and 1,862
tests passing**. The command host reached its time boundary only after Jest had
reported completion. A separate local production-build rerun was blocked by a
local `EPERM` write restriction on `build/asset-manifest.json`; the exact
candidate's successful Netlify build is the authoritative build evidence.

## 8. Credential rollback and decision

After acceptance, the Product Owner removed the Deploy Previews value from
`GOOGLE_PLACES_API_KEY`. Netlify showed **1 value in 1 deploy context**:
Production retained its value, while Deploy Previews, Branch deploys, Preview
Server and Agent Runners, and Local development were empty. No Routes variable
or provider was enabled.

Netlify deploys receive their environment at build time, so the already-built
preview was not rebuilt solely to demonstrate `NO_API_KEY` after rollback. The
configuration-level rollback is directly evidenced; a future rebuild of PR 8
would be expected to return the same safe `NO_API_KEY` state previously proved
by Packet 160. This recorded rebuild requirement is permitted by section 6.

Packet 161 therefore closes as **PASS**. PR 8 remains draft and unmerged;
Production, remote `master`, and the locked published deploy are unchanged.
