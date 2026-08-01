# Packet 166 - Closed Google Routes Evidence Trial

**Date:** 31 July 2026
**Status:** Approved preparation and bounded external evidence exercise; not a
user-facing or production route capability

## Authority

The Product Owner expressly authorised Packet 166's external trial setup and
bounded Google Routes calls under the Packet 165 limits. This packet is a
closed operational evidence exercise, not approval to release Route Confidence
Preview, sell a premium feature, or alter core planning.

The trial is limited to a fresh 24-event London calibration: 12 walking and 12
public-transport requests across the existing representative scenario set. The
runner has no automatic retries and accepts only a non-production HTTPS Netlify
preview origin. It rejects the canonical Production origin.

For execution, the fresh planned weekday is **Monday 3 August 2026** and the
weekend is **Saturday 8 August 2026**. This operational dating assumption keeps
the evidence forward-looking; it does not determine any user cohort, pricing,
or release date.

## Enforced and operational bounds

| Control | Packet 166 bound |
|---|---|
| Provider exercise | 24 total Compute Routes requests, maximum |
| Modes | Walking and public transport only |
| Invocation size | At most 3 batches / 18 requests; then wait for the 60-second preview rate window before any remaining batches |
| Retry, matrix, alternatives, refresh | Prohibited |
| Preview endpoint | Authenticated `routes-evidence` function only |
| Daily project cap | 150 Routes requests, configured as a hard Google quota before calls |
| Credential | Separate temporary Routes-only key, restricted to Compute Routes and non-production use |
| Production | No Routes key, provider mode, deployment, or publication permitted |
| User-visible routing / premium claim | Prohibited |

The existing Netlify three-requests-per-minute rule is an additional abuse
control, not the daily cost cap. The Google Cloud quota is the required hard
daily cap; budget alerts alone are insufficient.

## Execution order and stop conditions

1. Create a fresh unpublished preview from this exact branch, retaining
   production's locked state.
2. Configure and verify the temporary separate Routes-only key and a hard
   150-request Google daily quota in that preview context only.
3. Confirm the provider mode is absent from Production and active only for the
   unpublished preview.
4. Run the first three batches once. Stop on the first authentication, provider,
   quota, rate, network, malformed-response, or cost-control failure. Do not
   retry.
5. After the 60-second preview rate window, run at most the remaining two
   batches once, still within the 24-event and 150-request caps.
6. Remove the preview provider mode and key, revoke the temporary key, and
   retain only sanitised aggregate evidence.

### External preflight record - 31 July 2026

The Product Owner selected Google Cloud's **My First Project** for this closed
exercise and authorised its upgrade from the expiring free trial to paid
billing. The Routes API was already enabled. Google Cloud showed the applicable
`Directions - ComputeRoutes per request quota per day` at **150**; it was
verified rather than changed. Netlify then showed both
`GOOGLE_ROUTES_API_KEY` and `DAYGUIDE_ROUTES_PROVIDER_MODE` with one value in
the **Deploy Previews** context, with Production, branch deploys, preview
server/agent runners and local development empty.

This is configuration preflight evidence only. It is not evidence of a built
preview, a provider call, a successful route response, a safety pass, or a
Production capability. The temporary key's value is not recorded here.

### Preview request record - 1 August 2026

PR 11 was moved from draft to ready for review. This documentation-only commit
requests a fresh unpublished Netlify Deploy Preview from the existing Packet
166 branch. It does not authorise a Production deploy, publication, provider
call, credential expansion, or a safety decision. The exact preview identity
and its source commit must be verified before the runner can be used.

After the Product Owner explicitly unlocked Netlify on 1 August 2026, the
follow-up documentation-only commit re-submits this branch event for PR 11.
It retains the same no-Production, no-provider-call boundary.

Any optimistic-understatement breach, anchor-critical breach, missing hard
quota, privacy/entitlement failure, or user confusion stops the exercise. The
Packet 155 FAIL outcome remains in force unless new independent evidence and a
separate Product Owner decision change it.

## Deliberately unresolved

Packet 166 does not create a tester cohort or an opt-in user interface. It does
not set a revised padding policy, independent reference method, premium price,
payment/entitlement architecture, retention policy, consumer wording, or
production release decision. Those remain the Product Owner decisions listed
in Packet 165.

## Repository evidence

- [`packet166Approval.js`](../src/routing/packet166Approval.js) records the
  exact 24-event, date, no-user-output and no-production boundary.
- [`packet166CalibrationRunner.js`](../src/routing/packet166CalibrationRunner.js)
  requires the explicit acknowledgement, authenticates via Firebase, emits
  sanitised evidence only, refuses Production, and fails closed without retry.
- [`run-packet166-calibration.cjs`](../scripts/run-packet166-calibration.cjs)
  creates and deletes a temporary anonymous Firebase identity around each run.

No secret value, raw authentication token, or route credential is committed.
