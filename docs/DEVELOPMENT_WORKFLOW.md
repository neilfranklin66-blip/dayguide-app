# DayGuide — Development Workflow and Implementation Handover

## 1. Purpose and status

This document is the repository-level implementation workflow for DayGuide. It
defines how implementation packets are authorised, performed, verified,
reviewed, integrated, and handed over.

It controls implementation procedure. It does not override product decisions
made by the Product Owner or decisions recorded in authoritative project
documents. When this workflow conflicts with a packet-specific instruction, the
implementation agent must stop and ask the Product Owner to resolve the
conflict; it must not choose a new product direction independently.

## 2. Authority hierarchy

DayGuide uses the following authority hierarchy:

1. **Neil Franklin — Product Owner and final product decision authority.**
2. **ChatGPT — Project Manager, Product Architect, and Reviewer.**
3. **Codex, Claude Code, or another specifically approved repository agent —
   implementation agent.**
4. **An independent reviewing model or agent — only when explicitly
   commissioned.**

The implementation agent may identify risks, explain evidence, challenge an
instruction, and recommend a safer or clearer approach. It may not silently
change product intent, packet scope, architecture, acceptance criteria, or the
authority assigned to later Git or deployment actions.

## 3. Explicit implementation-agent selection

Every packet must explicitly record:

```text
Application being used:
Selected implementation agent:
Repository path:
Starting branch:
Expected packet branch:
```

The application and the implementation agent are separate facts. “ChatGPT,”
“ChatGPT Windows desktop app,” “Codex,” and “Claude Code” are not
interchangeable descriptions:

- ChatGPT may hold the Project Manager, Product Architect, and Reviewer role.
- The ChatGPT Windows desktop app is an application or interface.
- Codex is a repository implementation agent that may run within an approved
  application.
- Claude Code is a different repository implementation agent.

The next packet's implementation agent must never be inferred from the previous
packet. Only one implementation agent may edit the repository during a packet.
Changing agents during an active packet requires Product Owner approval and a
written handover. A reviewing agent must not edit concurrently with the selected
implementation agent.

## 4. Mandatory pre-implementation restatement

Before repository implementation instructions are given, the instruction must
restate:

1. the selected implementation agent;
2. the exact repository path;
3. the expected starting branch and packet branch;
4. the permitted Git state;
5. protected repository items; and
6. the exact next authorised action.

The agent must compare the restatement with the actual repository position
before editing. Missing or contradictory authority is a stop-and-report
condition.

## 5. Repository safety and protected items

The canonical repository path is:

```text
C:\Users\neilf\Documents\dayguide\dayguide-app
```

Unless the Product Owner gives a separate explicit instruction, these untracked
folders are protected:

- `.claude/`
- `Dayguide#2/`

Protected items must not be inspected, searched, opened, staged, modified,
moved, renamed, or deleted. Broad recursive commands must be restricted to
tracked paths or use explicit exclusions whenever they could enter a protected
folder. Their permitted presence does not make the repository dirty for packet
preflight purposes.

Repository state belongs to the user. An agent must not clean, reset, stash,
discard, or overwrite work merely to obtain a convenient starting position.

## 6. Permitted starting Git state

The normal packet starting position is:

- current branch `master`;
- `master` synchronised with `origin/master`;
- no tracked changes;
- only explicitly permitted untracked items; and
- no unexplained active packet branch.

An unexpected branch, ahead/behind/diverged state, tracked modification,
unapproved untracked item, unexplained packet branch, or other material
difference requires the agent to stop and report. It must not independently
clean, reset, stash, switch, pull, merge, repair, or delete anything unless the
packet or a later Product Owner instruction explicitly authorises that action.

## 7. Packet contract

Every implementation packet should define:

- packet number and title;
- selected implementation agent;
- objective;
- reason for doing the work now;
- starting branch;
- packet branch;
- in-scope work;
- explicit exclusions;
- relevant authority documents;
- bounded files or directories that may be inspected;
- acceptance criteria;
- required automated validation;
- required manual validation;
- stop-and-report conditions;
- permitted Git actions;
- prohibited Git actions; and
- required completion-report format.

The contract should distinguish facts supplied by an authority from assumptions
the implementation agent is expected to verify. Authority documents that are
unavailable must be named without invented quotations, versions, or content.

## 8. Standard packet lifecycle

The normal sequence is:

```text
Confirm authority
→ verify repository state
→ create one packet branch
→ inspect only authorised areas
→ implement bounded changes
→ review the diff
→ run proportionate validation
→ commit on the packet branch
→ report results
→ await Product Owner review
→ merge under separate authority
→ push under separate authority
→ delete branches under separate authority
→ verify final repository state
→ prepare the next-chat handover
```

Implementation authority does not automatically grant authority to merge, push,
delete branches, deploy, or begin another packet. Each later action requires
separate authority unless the active packet explicitly grants it.

## 9. Branch and commit rules

- One bounded packet normally uses one clearly named branch.
- Unrelated work must not be included in the packet branch or commit.
- Commits should describe the packet outcome, not merely the editing activity.
- The implementation agent must report the commit hash after committing.
- History must not be rewritten unless separately and explicitly authorised.
- Force push is prohibited unless separately and explicitly authorised.
- Branch deletion is a separate post-merge action.
- A packet commit must not imply authority to merge, push, deploy, or delete a
  branch.

If the packet permits a commit, the staged-path set must be checked before the
commit so that only authorised files are included.

## 10. Verification levels

Verification must be proportionate to the packet type and risk.

### Product-code packet

Normally requires:

- focused tests;
- the complete test suite;
- a production build;
- diff inspection; and
- relevant manual behavioural validation.

If a required check cannot run, the agent must report the exact failure and must
not present dated or partial evidence as a current pass.

### Documentation-only packet

Normally requires:

- comparison with relevant authority documents;
- factual and terminology consistency review;
- Markdown structure and reference review;
- `git diff --check`; and
- no full test suite or production build unless documentation affects tooling or
  the packet explicitly requires them.

### Discovery or audit packet

Normally requires:

- read-only investigation;
- recorded evidence sources;
- clearly classified findings;
- verified facts separated from assumptions;
- no speculative fixes; and
- no product-code changes unless separately approved.

## 11. Stop-and-report conditions

The implementation agent must stop and report when it encounters:

- unexpected tracked changes;
- an unexpected branch or divergence from the remote;
- a conflict between authority documents;
- missing information requiring a product decision;
- a need to inspect a protected item;
- scope expansion;
- credentials, secrets, or inaccessible external services;
- a potentially destructive command;
- a failed assumption underlying the packet;
- a validation failure that cannot be resolved within the authorised scope; or
- evidence that another repository agent may be editing concurrently.

Stopping does not authorise cleanup or repair. The report should state the
evidence, impact, and exact decision or authority needed to continue.

## 12. Completion report

Every completed implementation packet must report:

```text
Outcome:
Files changed:
Files deliberately not changed:
Tests or checks performed:
Build result:
Manual verification required:
Git status:
Commit:
Deviations from the packet:
Residual risks:
Recommended next action:
```

The report must distinguish:

- successful automated validation;
- validation not run because it was not required;
- validation requiring Product Owner or external action; and
- unresolved risks.

Command output requested by the packet must be reported completely. A completion
report must not imply that a merge, push, deployment, cleanup, or later packet
has been authorised.

## 13. Review, merge and cleanup separation

Packet implementation and packet integration are separate stages. Unless
explicitly authorised within the packet, the implementation agent must not:

- switch to `master`;
- merge the packet branch;
- push `master` or the packet branch;
- delete local or remote branches;
- deploy the application; or
- begin another packet.

Review approval authorises only the actions stated by the Product Owner.
Fast-forward merge, remote verification, push, and local or remote branch
cleanup may therefore be separate instructions with separate verification.

## 14. New-chat implementation handover

Use this template when delivery moves to a new conversation, application, or
implementation agent:

```text
# DayGuide — New Chat Implementation Handover

## Current delivery model
Product Owner:
ChatGPT role:
Approved implementation agents:
Selected implementation agent for the current packet:

## Implementation history
Last completed packet:
Implementation agent used:
Current packet or next intended packet:

## Current implementation environment
Application being used:
Implementation agent:
Repository path:
Current branch:
Latest commit:
Current Git status:
Remote status:

## Protected repository items
Protected folders:
Permitted untracked items:

## Current repository position
Master synchronised with origin:
Active packet branch:
Tracked changes:
Outstanding commits:

## Next authorised action
State one exact next action only.

## Restrictions
List actions not authorised.

## Authoritative documents
List the latest documents that must be consulted.

## Outstanding decisions or risks
List unresolved product decisions, validation gaps, operational uncertainties and protected items.

## Mandatory pre-implementation restatement
Restate the agent, path, branches, permitted Git state, protected items and next authorised action.
```

The handover must explicitly record every implementation-agent change. A move
between Claude Code and Codex, or between any other agents, must never be hidden
by naming only the application. The outgoing agent must record the last
authorised action completed; the incoming agent must restate the handover before
editing.

## 15. Knowledge promotion after a packet

After a packet is accepted, the reviewer should determine whether stable,
material, and relevant information must be promoted into:

- `docs/CURRENT_STATE.md`;
- `docs/KNOWN_ISSUES.md`;
- Reconciled Current Roadmap;
- DayGuide Decision Register;
- DayGuide Knowledge Catalogue; or
- DayGuide Project Brief.

Not every packet should update every authority document. Current implemented
behaviour belongs in the current-state register; evidence-backed issues, debt,
risks, and uncertainties belong in the known-issues register; roadmap,
decision, catalogue, and brief changes depend on their own authority and
availability. Do not invent content for an unavailable external document.
