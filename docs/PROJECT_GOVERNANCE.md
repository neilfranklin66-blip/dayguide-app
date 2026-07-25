# DayGuide — Project Governance

## 1. Purpose and authority

This document defines the permanent repository-level governance model for
DayGuide implementation packets: decision authority, implementation ownership,
review and acceptance, evidence expectations, closure, and handover.

It is read together with:

- [`DEVELOPMENT_WORKFLOW.md`](DEVELOPMENT_WORKFLOW.md) for the operational
  repository workflow and packet lifecycle;
- [`CURRENT_STATE.md`](CURRENT_STATE.md) for verified application capability
  state;
- [`KNOWN_ISSUES.md`](KNOWN_ISSUES.md) for evidence-backed issues, risks,
  uncertainties, and accepted limitations; and
- [`DEPLOYMENT_REALITY_AUDIT.md`](DEPLOYMENT_REALITY_AUDIT.md) for the
  repository-versus-live deployment evidence boundary.

Packet-specific instructions may narrow this governance model, but an
implementation agent must not silently broaden authority or override a Product
Owner decision.

## 2. Governance roles

### Product Owner

**Neil Franklin is the Product Owner** and final product decision authority. The
Product Owner:

- selects or approves packet objectives and scope;
- approves the implementation agent;
- resolves product, priority, acceptance, and risk decisions;
- decides whether a packet is accepted, accepted with observations, or rejected;
- separately authorises integration, push, deployment, and branch cleanup; and
- determines the next authorised action.

### Project Manager, Product Architect, and Reviewer

**ChatGPT is the Project Manager, Product Architect, and Reviewer.** In that
role, ChatGPT:

- turns Product Owner intent into bounded packet instructions;
- maintains architectural and cross-document consistency;
- reviews evidence, validation, deviations, risks, and completion reports;
- recommends an acceptance outcome; and
- identifies knowledge that should be promoted into repository or external
  authority documents.

Review authority does not grant concurrent repository-editing authority.

### Implementation agent

**Codex, Claude Code, or another explicitly approved repository agent may
implement a packet.** The selected agent:

- works only within the packet's authority and bounded inspection scope;
- preserves repository safety and protected items;
- distinguishes evidence from assumptions;
- implements, validates, commits, and reports only what the packet permits; and
- stops when a decision, new authority, destructive action, or scope expansion
  is required.

### Independent reviewer

An independent model or agent may review only when explicitly commissioned. It
must not edit concurrently with the selected implementation agent.

## 3. One implementation agent per packet

Every packet must name exactly one selected implementation agent. The agent must
not be inferred from the application, the previous packet, or the previous chat.

Only one implementation agent may work on a packet unless the Product Owner
explicitly authorises a change. A mid-packet agent change requires:

1. Product Owner approval;
2. a written handover recording repository and packet state;
3. confirmation that the outgoing agent has stopped editing; and
4. an explicit restatement by the incoming agent before work resumes.

“ChatGPT,” “the ChatGPT desktop app,” “Codex,” and “Claude Code” describe
different roles, applications, or agents and must not be used interchangeably.

## 4. Normal delivery model

The normal workflow is:

```text
one complete packet brief
→ one implementation run
→ one structured completion report
→ one review and acceptance decision
```

The normal model avoids fragmented instruction unless an exceptional condition
requires direct supervision. Later integration or operational actions remain
separately authorised stages.

## 5. Standard packet structure

A complete packet should state:

- packet number and title;
- Product Owner and reviewer roles;
- application and selected implementation agent;
- objective and reason for the work;
- repository path;
- expected starting commit and branch;
- packet branch;
- permitted starting Git state;
- protected items;
- authorised inspection scope;
- in-scope changes;
- explicit exclusions;
- authority and evidence documents;
- acceptance criteria;
- automated and manual validation;
- stop-and-report conditions;
- permitted and prohibited Git actions;
- commit authority and message, if any; and
- required completion-report structure.

Material assumptions must be called out as assumptions rather than embedded as
facts.

## 6. Packet planning

Before implementation:

1. The Product Owner supplies or approves the objective.
2. ChatGPT converts the objective into a bounded, testable packet.
3. The packet names one implementation agent and the exact repository position.
4. The packet states what may be inspected and changed.
5. Acceptance criteria and validation are proportional to the risk.
6. Later authority to merge, push, deploy, or clean up is stated separately.

If the objective depends on unavailable product decisions, credentials, external
administration, or conflicting authority documents, planning must surface that
dependency before repository changes begin.

## 7. Implementation

The implementation agent must:

1. restate its authority, repository path, branches, permitted state, protected
   items, and next action;
2. perform read-only preflight;
3. stop if the repository differs materially from the packet baseline;
4. create the authorised packet branch;
5. inspect only bounded paths and evidence;
6. make the smallest changes that satisfy the packet;
7. avoid unrelated cleanup or refactoring;
8. run proportionate validation;
9. inspect and verify the changed/staged path set;
10. commit only when authorised; and
11. return the required structured report.

Implementation authority does not include acceptance, integration, deployment,
or cleanup unless those actions are explicitly included.

## 8. Review and acceptance

ChatGPT reviews the implementation against:

- packet scope and exclusions;
- acceptance criteria;
- repository and evidence consistency;
- changed-file boundaries;
- test, build, manual, and documentation validation;
- deviations and residual risks;
- protected-item compliance; and
- the requested completion-report evidence.

The Product Owner makes one of three outcomes:

### Accepted

The objective and required acceptance criteria are met, required validation is
satisfactory, and no unresolved observation blocks closure.

### Accepted with observations

The objective and required acceptance criteria are met, but non-blocking
observations, follow-up work, or operational verification remain explicitly
recorded. This outcome must not be used to waive a failed mandatory criterion.

### Rejected

A required criterion failed, the result materially departs from product intent,
evidence is inadequate, scope or safety was breached, or blocking corrections
remain. Rejection returns the packet for a separately authorised corrective
action; it does not authorise autonomous repair.

## 9. Packet closure

Implementation completion and packet closure are distinct.

- **Implementation complete:** authorised changes are validated, committed on
  the packet branch, and reported.
- **Accepted:** the Product Owner records an acceptance outcome.
- **Integrated:** merge and push are separately authorised and verified.
- **Closed:** required branch cleanup, final repository verification, knowledge
  promotion, and handover are complete.

A packet is not closed merely because a commit exists.

## 10. Definition of done

A packet is done only when all applicable conditions are satisfied:

- the stated objective and acceptance criteria are met;
- only authorised files or systems changed;
- protected items remained untouched;
- required automated checks passed, or approved exceptions are explicit;
- required manual validation is complete or clearly assigned;
- evidence and assumptions are correctly classified;
- no secret value is exposed;
- the final diff and staged path set were reviewed;
- the authorised commit exists and is reported;
- deviations and residual risks are recorded;
- the Product Owner has selected an acceptance outcome;
- separately authorised integration and cleanup are verified when required; and
- the next-chat or next-agent handover preserves all material state.

“Done” never implies an unperformed deployment, external verification, or
cleanup action.

## 11. Structured implementation completion report

Codex or another selected agent must return a report sufficient for independent
review. At minimum:

```text
Packet:
Implementation agent:
Repository:
Branch:
Starting commit:
Final commit:

Starting status:

Files inspected:
Files created:
Files modified:
Files deliberately unchanged:

Application files changed:
Protected paths inspected or changed:

Objective outcome:
Tests and checks executed:
Results:
Build result:
Manual verification required:

Deployment performed:
External settings changed:

Deviations:
Residual risks:
Recommended next action:

Final Git status:
Packet status:
```

Requested command output must be complete when exact output is needed for
review. The report must distinguish successful checks, checks not required,
checks not possible, and checks awaiting Product Owner or external action.

## 12. Step-by-step manual guidance

One-instruction-at-a-time operation is reserved for exceptional states:

- troubleshooting or recovery;
- risky manual operations;
- authentication or authorisation failures;
- deployment failures;
- Git divergence, conflicts, or cleanup problems;
- destructive or difficult-to-reverse actions;
- external-console work;
- credential-sensitive activity; or
- another condition where the Product Owner must observe each result before
  authorising the next action.

Routine bounded implementation should use the normal complete-packet model.
Step-by-step operation does not expand authority; every step must remain within
the stated recovery or operational objective.

## 13. Repository safety and protected paths

The canonical repository is:

```text
C:\Users\neilf\Documents\dayguide\dayguide-app
```

Unless separately authorised by the Product Owner, these untracked folders are
protected:

- `.claude/`
- `Dayguide#2/`

They must not be inspected, searched, opened, enumerated, staged, modified,
moved, renamed, deleted, or committed. Recursive commands must be restricted to
tracked files or explicit safe paths so they cannot enter protected folders.

Unexpected tracked changes, unapproved untracked items, an unexpected branch,
remote divergence, or evidence of concurrent editing requires stop-and-report.
The agent must not independently reset, clean, stash, overwrite, or repair the
state.

## 14. Git branch and commit expectations

- Start normally from synchronized `master` at the packet's stated baseline.
- Use one clearly named branch for one bounded packet.
- Do not mix unrelated work into the packet branch.
- Use a commit message that describes the packet outcome.
- Verify staged paths before committing.
- Report the final commit hash and branch state.
- Do not rewrite history or force-push without separate explicit authority.
- Treat switching to `master`, pulling, merging, pushing, deployment, and local
  or remote branch deletion as separate actions unless the packet explicitly
  combines them.
- Stop rather than resolving unexpected divergence or conflicts independently.

## 15. Tests and evidence

Validation must match the change:

- **Product-code changes:** focused tests, complete suite, production build,
  diff review, and relevant manual behaviour checks unless the packet explicitly
  sets another justified level.
- **Documentation-only changes:** authority comparison, factual and terminology
  review, Markdown/reference checks, changed-path verification, and
  `git diff --check`; application tests/build are optional only when practical
  or specifically requested.
- **Audit/discovery:** read-only evidence gathering, source inventory, clear
  confidence classification, and no speculative fix.
- **Deployment/operations:** explicit environment and authority, secret-safe
  evidence, reversible actions, and stepwise verification where risk demands it.

Old test results, repository configuration, and provider documentation must not
be presented as proof of current live behaviour. Evidence sources and dates must
be recorded.

## 16. Documentation updates and knowledge promotion

After implementation and review, determine whether stable material information
belongs in:

- `CURRENT_STATE.md`;
- `KNOWN_ISSUES.md`;
- `DEPLOYMENT_REALITY_AUDIT.md`;
- `DEVELOPMENT_WORKFLOW.md`;
- this governance document; or
- an external roadmap, decision register, knowledge catalogue, or project brief.

Do not update every document by default. Cross-reference rather than duplicate
large sections. Preserve historical findings and label later evidence as a
supplement instead of rewriting history to look cleaner.

## 17. Handover between chats or implementation agents

A handover must record:

- Product Owner, reviewer, application, and selected implementation agent;
- last completed and current/next packet;
- repository path, branch, commit, status, and remote state;
- protected paths and permitted untracked items;
- files changed and validation completed;
- current acceptance and integration state;
- outstanding commits, decisions, risks, and manual checks;
- exact next authorised action;
- actions not authorised; and
- authority documents the incoming agent must read.

An agent change must be explicit. The outgoing agent stops editing before the
incoming agent begins. The incoming agent restates the handover and verifies the
repository before acting.

## 18. Governance maintenance

The Product Owner owns changes to decision authority and acceptance policy.
ChatGPT maintains architectural and cross-document consistency. An approved
implementation agent may update this document only through a bounded packet.

Governance changes must preserve historical delivery evidence, avoid granting
implicit operational authority, and identify any change to roles, acceptance,
safety, or handover requirements.
