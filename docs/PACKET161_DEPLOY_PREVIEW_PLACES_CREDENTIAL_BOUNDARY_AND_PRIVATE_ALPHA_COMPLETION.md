# Packet 161 — Deploy-Preview Places Credential Boundary and Private Alpha Completion

**Date:** 28 July 2026

**Status:** Authorised; external evidence pending

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
