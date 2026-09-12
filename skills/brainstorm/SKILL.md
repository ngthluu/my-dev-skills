---
name: brainstorm
description: Turn an idea, feature, or problem into a self-contained implementation spec through clear, focused questions. Use before implementation when requirements, constraints, behavior, or test seams still need to be discovered.
---

# Brainstorm

Interview the user until a fresh AI session can implement the work without access to this conversation. The deliverable is a decision record and implementation spec at `docs/specs/yyyy-mm-dd-<slug>.md`.

Do not implement the work in this session.

## Keep the conversation easy to read

Use simple English in questions, summaries, visuals, and the spec. Lead with the point. Use familiar words, active verbs, and one idea per sentence. Use the user's names for things; explain a necessary technical term once. Prefer “What happens if it fails?” to “Define failure semantics.”

Every sentence should help the user understand the proposal, make a decision, or see a meaningful tradeoff. Remove greetings, process narration, repeated context, generic benefits, and summaries that repeat the message. Do not expose internal bookkeeping such as “frontier,” “test seam,” or numbered risk codes unless the user needs it. Keep precise terms where they affect behavior.

Ask one question at a time by default. Group up to three short questions only when they concern the same topic and can be answered independently. For each question, give a short recommendation and its main downside when useful. Use two or three meaningful options, not a long menu. Do not ask the user to confirm facts you can check yourself.

Be brief without hiding missing decisions, assumptions, failure behavior, or material risks. If a topic needs detail, give the useful conclusion first and make the explanation optional. Short output must still preserve the facts needed to decide and implement.

## Explore the decisions

Privately track confirmed decisions, open questions, facts to check, assumptions, and conflicts. Each answer may reveal another decision. In each round:

1. Check facts in the workspace or authoritative sources.
2. Ask the next useful question whose prerequisites are settled. Save dependent questions for later.
3. Use the answer to update the model. Explain a change only if it affects the user’s decision.

Cover vague goals, conflicting requirements, important failure cases, compatibility, rollout, and scope. Reopen an answer when new evidence conflicts with it. Continue until all decisions needed for implementation are settled or explicitly deferred; thoroughness belongs in the investigation, not in the length of each message.

Before writing the spec, give a short summary of what will change and any remaining risks or deferrals. Ask the user to confirm that understanding. Do not repeat the whole conversation. Reopen affected decisions if they request changes.

## Use a visual decision workspace when it helps

Keep chat as the input channel, but create a temporary browser-based view when spatial, stateful, comparative, or quantitative relationships are becoming hard to judge in prose. Good signals include flows or dependencies, state transitions, visual comparisons between meaningful alternatives, UI layout decisions, or acceptance criteria whose coverage is difficult to scan.

Read [references/visual-workspace.md](references/visual-workspace.md) before creating one. Choose its packaged before/after, static lifecycle, final review, or UI comparison template. These use embedded Pico CSS and work offline. Lead with the visual relationship and short recommendation; show useful supporting detail directly, without show/hide toggles. Keep the workspace display-only: no reply panels, copy buttons, selection controls, or approval forms. Keep stable IDs for traceability, but show them only when they help the user refer to a specific item. Before final confirmation, make decision scope, changes, unresolved risks, and deferrals visible. Update the page when the model changes materially and before final confirmation.

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

Make the document self-contained and concise. State each requirement once; link to it elsewhere rather than repeating it. Use plain headings and combine related sections. Omit empty sections and irrelevant checklist items. Include:

1. title, status, date, and source context;
2. intended outcome and only the conversation context needed to understand it;
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
