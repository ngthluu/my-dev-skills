---
name: brainstorm
description: Turn an idea, feature, or problem into a self-contained implementation spec through exhaustive, decision-focused questioning. Use before implementation when requirements, constraints, behavior, or test seams still need to be discovered.
disable-model-invocation: true
metadata:
  opencode/autoinvoke: "false"
---

# Brainstorm

Interview the user until a fresh AI session can implement the work without access to this conversation. The deliverable is a decision record and implementation spec at `docs/specs/yyyy-mm-dd-<slug>.md`.

Do not implement the work in this session.

## Explore the decision graph

First investigate the workspace, existing artifacts, earlier answers, and authoritative facts. Extract decisions the user has already made; do not ask them to retrieve facts you can find. Before the first question, map the key material decisions and their prerequisites as a dependency graph. Shared prerequisites or answers may serve several branches. Extend or revise the graph when an answer reveals a new branch.

Keep a concise decision ledger in chat. Give each node a stable ID, question, prerequisites, impact on the outcome, status (`settled`, `open`, `blocked`, `deferred`, or `contradicted`), answer and source when known, and a reason when reopened or deferred. Show only the relevant frontier when that keeps chat readable, but retain all settled answers throughout the session; carry the ledger into any context-compaction summary before continuing. The ledger is session state, not a temporary file or a second spec.

Before **every** question, reconcile the user's whole latest message and new evidence with the entire ledger. One message may settle several nodes, supersede an assumption, or reveal new dependencies. Match answers by meaning, not only wording or ID. Never reask a settled decision because the graph changed. If an answer is partial or ambiguous, ask only for the missing material detail. Reopen a settled node only when later evidence actually contradicts or invalidates it; mark it `contradicted`, state the conflict, then make its smallest resolution question `open` and eligible. Record the resolution and source. Silence is not agreement.

Choose exactly one open node whose prerequisites are settled or safely deferred with an explicit assumption. Resolve prerequisites before dependent nodes; among eligible nodes, choose the one with the greatest impact on the outcome or on unlocking other decisions, then break a genuine tie by stable ID. Briefly explain why it matters and recommend an answer with its tradeoff. Ask that one decision through the host's dedicated question tool when it is exposed and can represent the question. Make exactly one question in that tool call and do not restate it afterward. If the tool is unavailable, restricted, or unsuitable, ask one plain chat question with the same decision and recommendation, only in the final response, never in intermediate commentary. Do not change collaboration mode to obtain a tool. Wait for the answer before choosing another node.

Challenge vague goals, implicit behavior, conflicting requirements, failure cases, migration and compatibility expectations, operational constraints, and the boundary of the work. Continue until every material branch needed for implementation in a fresh session is settled or explicitly deferred with a safe assumption. Do not prolong the interview with optional or duplicate questions. Summarize the decisions and write the spec without an extra confirmation question.

## Use a visual decision workspace when it helps

Keep chat as the input channel, but create a temporary browser-based view when spatial, stateful, comparative, or quantitative relationships are becoming hard to judge in prose. Good signals include flows or dependencies, state transitions, visual comparisons between meaningful alternatives, UI layout decisions, or acceptance criteria whose coverage is difficult to scan.

Read [references/visual-workspace.md](references/visual-workspace.md) before creating one. Use its question-to-representation guide to choose or adapt a packaged template: before/after, handoff flow, system map, dependency graph, static lifecycle, final review, or UI comparison. Combine patterns when needed; the templates are not a closed menu. These use embedded Pico CSS and work offline. Lead with the visual relationship and short recommendation; show useful supporting detail directly, without show/hide toggles. Keep the workspace display-only: no reply panels, copy buttons, selection controls, or approval forms. Keep stable IDs for traceability, but show them only when they help the user refer to a specific item. Update the page only when the model changes materially. A visual does not replace the chat ledger or canonical spec.

Do not create a visual merely because the brainstorm is long. When prose or a compact Markdown table communicates the issue just as well, keep the round in chat.

## Define observable completion

Before closing the interview, establish:

- the outcome and who benefits;
- current behavior and desired behavior;
- scope and explicit non-goals;
- functional requirements and important failure behavior;
- constraints, dependencies, compatibility, rollout, and migration needs;
- acceptance criteria stated as observable outcomes;
- public test seams for each acceptance criterion, favoring existing interfaces and the highest practical seam;
- unresolved risks or decisions that may safely be deferred.

A test seam is the public boundary where behavior can be observed without reaching into implementation details. These agreed seams must appear in the spec so `$implement` can use them for TDD.

## Write the handoff spec

When all material decisions are settled or safely deferred, create `docs/specs/` if needed and write `docs/specs/yyyy-mm-dd-<slug>.md` without requesting final confirmation. Use the current local date and a short lowercase hyphenated slug. If the target already exists, choose a more specific slug unless the user explicitly asked to update it.

Make the document self-contained and concise. Include:

1. title, status, date, and source context;
2. conversation summary and intended outcome;
3. current state and relevant workspace findings;
4. requirements and non-goals;
5. decisions made, including rationale and rejected alternatives that matter;
6. user-visible flows, edge cases, and failure behavior;
7. acceptance criteria paired with their agreed test seams;
8. technical constraints and likely affected areas, without inventing an implementation the user did not approve;
9. rollout, migration, observability, or compatibility requirements when applicable;
10. risks, assumptions, and any explicitly deferred questions;
11. a fresh-session instruction telling the next agent to read the whole spec, inspect the current workspace, and invoke `$implement` with this spec path.

Reference existing artifacts by path instead of copying them. Never copy secrets or sensitive personal data into the spec.

The Markdown spec is canonical. If a visual workspace was used, capture its validated conclusions in the spec rather than making the next session depend on the temporary HTML. Preserve a generated HTML companion beside the spec only when the user asks for a durable or shareable browser view; mark it as generated and link it back to the canonical spec.

After writing, report the exact path and tell the user to start a new session with:

```text
Use $implement with <spec-path>.
```

The skill cannot clear or reset the current model context itself; the new session is the context boundary.
