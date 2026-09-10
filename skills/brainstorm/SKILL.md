---
name: brainstorm
description: Turn an idea, feature, or problem into a self-contained implementation spec through exhaustive, decision-focused questioning. Use before implementation when requirements, constraints, behavior, or test seams still need to be discovered.
---

# Brainstorm

Interview the user until a fresh AI session can implement the work without access to this conversation. The deliverable is a decision record and implementation spec at `docs/specs/yyyy-mm-dd-<slug>.md`.

Do not implement the work in this session.

## Explore the decision tree

Treat the subject as a tree: each answer may reveal decisions that depend on it. Track settled decisions, unresolved decisions, facts to investigate, assumptions, and contradictions.

Work in rounds. The frontier is the set of questions whose prerequisites are already settled. In each round:

1. Investigate facts available from the workspace, tools, or authoritative sources. Do not ask the user to retrieve facts you can retrieve.
2. Ask every independent frontier question together. Number the questions, explain why each decision matters, and give a recommended answer with its tradeoff.
3. Wait for the user's answers. Recompute the tree from those answers before asking the next round.

Keep dependent questions for later rounds. Challenge vague goals, implicit behavior, conflicting requirements, failure cases, migration and compatibility expectations, operational constraints, and the boundary of the work. Revisit an answer when new information contradicts it.

“Endlessly” means until the frontier is empty, not a fixed number of rounds. Do not end merely because enough material exists for a plausible plan. When you believe the tree is exhausted, summarize the decisions and ask the user to confirm that the shared understanding is complete. If they add or change anything, reopen the affected branches and continue.

## Use a visual decision workspace when it helps

Keep chat as the input channel, but create a temporary browser-based view when spatial, stateful, comparative, or quantitative relationships are becoming hard to judge in prose. Good signals include flows or dependencies, state transitions, visual comparisons between meaningful alternatives, UI layout decisions, or acceptance criteria whose coverage is difficult to scan.

Read [references/visual-workspace.md](references/visual-workspace.md) before creating one. The visual workspace is a disposable decision aid, not implementation and not a second source of truth. Use its packaged standalone template and examples when helpful. Give questions and options stable IDs so the user can explore the browser view and copy an answer summary into chat; browser selections alone do not settle decisions. Update it only when the decision model changes materially and once more before final confirmation.

Do not create a visual merely because the brainstorm is long. When prose or a compact Markdown table communicates the issue just as well, keep the round in chat.

## Define observable completion

Before closing the tree, establish:

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

After the user confirms the understanding, create `docs/specs/` if needed and write `docs/specs/yyyy-mm-dd-<slug>.md`. Use the current local date and a short lowercase hyphenated slug. If the target already exists, choose a more specific slug unless the user explicitly asked to update it.

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
