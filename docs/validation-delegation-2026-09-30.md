# Delegation and brainstorm completion review — 2026-09-30

The user requested a review of all three skills, preferring subagents for side tasks while the main agent does the important work. They also reported brainstorm listing roughly ten questions, asking one, and then writing a spec. The starting commit was `8192557`, with a clean working tree.

## Where delegation was instructed

There are no executable subagent-spawning scripts in these skill folders. The host agent follows delegation instructions in each `SKILL.md` when its tools and permissions allow it. All three previously said to delegate the stages below, with direct work as the fallback.

| Skill | Previous delegation points |
| --- | --- |
| Brainstorm | Step 1: context inspection. Step 2: decision mapping. Step 3: option analysis and visuals. Step 4: reconciliation for every substantive reply and a final gap check. Step 5: spec drafting and a separate review. |
| Implement | Step 1: repository inspection. Step 2: complex planning analysis. Step 3: implementation slices. Step 4: verification execution. Step 5: two independent reviews. Step 6: fixes returned to the original implementer. |
| Debug | Step 1: inspection. Step 2: reproduction. Step 3: hypotheses and tracing. Step 4: regression and fix. Step 5: verification checks. Step 6: two independent reviews. Step 7: fixes returned to the implementer. Step 8: cleanup audit. |

Read-only research, option comparisons, visual preparation, extra checks, and independent reviews are useful bounded assignments. Delegating most core stages conflicts with the user's preferred ownership model. Saying that the main agent “owns” a stage did not require it to perform that stage.

## Brainstorm completion risk and correction

The previous instructions already said to wait for answers and repeat for remaining material decisions. However, they delegated reconciliation and drafting, and allowed completion when material branches were “safely deferred with explicit assumptions” without defining safe deferral. This left room to replace unanswered choices with assumptions. No transcript of the reported incident was supplied, so this review identifies instruction risks rather than proving that a subagent caused that incident.

The updated [brainstorm skill](../skills/brainstorm/SKILL.md) keeps context interpretation, decision mapping, question selection, answer reconciliation, the ledger audit, and spec writing with the main agent. One question is asked at a time across as many turns as needed. Unanswered material choices remain open or blocked unless the user explicitly postpones them or authorizes a default. Minor implementation details can be deferred only when they do not change scope, behavior, acceptance criteria, or material risk. Every ledger ID needs an answer/source or justified deferral before a ready spec can be written. Empty or nonblocking question-tool results do not count as answers.

The updated [implement](../skills/implement/SKILL.md) and [debug](../skills/debug/SKILL.md) skills keep core implementation and fixes with the main agent. It also performs decisive verification. Auxiliary implementation edits remain allowed in implement. Independent review remains delegated when available and permitted, with findings checked and resolved by the main agent. Further delegation is prohibited. The README now describes these boundaries.

## Verification

An independent evaluation agent used the revised brainstorm skill in an isolated temporary workspace. It received only the skill, a synthetic project README, and the feature request, without this review's diagnosis or expected result. The task sender supplied successive user replies. Question tools, browser tooling, and further delegation were unavailable in this harness.

The request was an activity-log export for audits and occasional analysis. The README described a paginated log with existing date filtering and permissions, event fields, potentially sensitive free-text descriptions, and browser/HTTP test seams.

| Observed turn | Result |
| --- | --- |
| Initial request | Asked Q1 about export eligibility. |
| Reply restricted exports to audit/admin users | Settled Q1 and asked Q2 about file format. No spec existed. |
| Reply selected CSV, five fields, excluded descriptions, and selected all matching records across pages | Settled Q2–Q4 and asked Q5 about date/time convention. |
| Reply selected full UTC days and ISO 8601 timestamps | Settled Q5 and asked Q6 about the row limit. |

The next reply selected a 100,000-row limit, rejection instead of truncation, and explicitly authorized recommended defaults for remaining choices. That completion leg was interrupted after an extended wait without an artifact or progress response. Final spec generation and the handoff are therefore unobserved in this evaluation. The observed interview turns demonstrate continued questioning and reconciliation, without proving full completion behavior.

The temporary workspace is `/var/folders/q9/1lgsjv4n37n0gcrdmg1rfjy00000gn/T/my-dev-skills-interview-yef2767n`. Temporary artifacts may disappear after system cleanup.

The repository's 23 tests passed, including instruction structure, explicit-invocation metadata, real installer fixtures for four agent targets, release tooling, and offline visual checks. `npm run validate` and `git diff --check` passed. No tests were added that merely match the new wording.

The generic skill-creator validator rejects the existing `disable-model-invocation` frontmatter key in both baseline and revised copies of all three skills. Temporary projections omitting only that key pass its validation. The actual skills retain the key to preserve this repository's explicit-invocation compatibility; repository metadata checks pass.

This evaluation exercises four turns of one simulated interview using chat fallback. It does not establish behavior in every supported application, live asynchronous question tools, compaction, every decision graph, or final spec generation. Implement and debug were reviewed for instruction changes, without rerunning their agent-driven feature/bug scenarios.
