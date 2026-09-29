---
name: brainstorm
description: Turn an idea, feature, or problem into a self-contained implementation spec through exhaustive, decision-focused questioning. Use before implementation when requirements, constraints, behavior, or test seams still need to be discovered.
disable-model-invocation: true
metadata:
  opencode/autoinvoke: "false"
---

# Brainstorm

Turn the idea into a decision record and self-contained spec at `docs/specs/yyyy-mm-dd-<slug>.md` for a fresh implementation session. Do not implement in this session.

## Working rules

- The main agent owns user questions, decisions, and the ledger. Subagents propose updates with evidence and uncertainties.
- Delegate the stages below when available and permitted. Otherwise work directly. Handle trivial updates directly.
- Reuse agents with current context, parallelize independent investigations, and give writers separate files.
- Verify findings before using them. Present conclusions and conflicts, keeping raw investigation logs out of chat.

## Step 1: Inspect context

- Delegate inspection of the workspace, repository instructions, existing artifacts, and prior answers.
- Research material unknowns using reliable primary sources. Check dates and applicability, retain links, and label assumptions.
- Reconcile findings and extract existing decisions. Find available facts instead of asking the user to retrieve them.

## Step 2: Map decisions

- Have subagents identify material decisions, dependencies, and shared prerequisites. Split complex independent branches.
- Integrate findings into a dependency graph before the first question. Revise it as answers reveal branches.
- Maintain this session ledger with stable IDs and statuses: `settled`, `open`, `blocked`, `deferred`, or `contradicted`.

```text
Q1 | Question: <decision> | Prerequisites: <IDs or none> | Impact: <outcome or unlocked decisions> | Status: open
Answer/source: <answer and evidence> | Reopened/deferred reason: <if applicable>
```

- Show relevant entries in chat and preserve the complete ledger in compaction summaries. Do not create a separate ledger file.

## Step 3: Ask one material question

- Select exactly one eligible open node with settled prerequisites or explicit safe deferrals.
- Prefer outcome impact or unlocking potential. Break a genuine tie by stable ID. Delegate complex option analysis.
- Explain why the decision matters, recommend an answer, and state its tradeoff. Skip duplicate or optional questions.
- Use a suitable host question tool with one question, without repeating it in chat.
- If unavailable, restricted, or unsuitable, ask one plain chat question in the final response, never in commentary.
- Do not change collaboration mode to access a tool. Wait for the answer, then follow Step 4.

For spatial, stateful, comparative, or quantitative relationships, delegate a browser visual when clearer than prose or a table.

- Have the writer read [references/visual-workspace.md](references/visual-workspace.md). Check its artifact and verification findings.
- Keep chat as the input channel and ledger authority, the Markdown spec canonical, and the page display-only.
- Update visuals for material model changes and carry validated conclusions into the spec.
- Save a linked HTML companion beside the spec only when requested.

## Step 4: Reconcile and repeat

- Reuse one reconciliation subagent for each substantive reply, supplying the whole latest message, new evidence, and complete ledger.
- Request proposed answer, assumption, dependency, and contradiction updates with evidence. Verify and apply before another question.
- Match by meaning and settle several decisions when answered together. For partial or ambiguous answers, ask only missing material detail.
- Never treat silence as agreement. Reopen settled decisions only when evidence contradicts or invalidates them.
- Mark conflicts `contradicted`, explain them, and ask the smallest resolving question. Record its resolution and source.
- Never reask solely because the graph changed. Return to Step 3 for remaining material decisions.
- Before finishing, delegate a gap check: unresolved branches, assumptions, failures, migration, compatibility, and operations.
- Finish discovery when all material branches are settled or safely deferred with explicit assumptions. Summarize without another confirmation.

## Step 5: Write the spec

- Delegate drafting from the settled ledger and evidence. Pair every observable acceptance criterion with an agreed public test seam.
- Use the template below, omitting inapplicable conditional details. Prefer existing interfaces and practical test boundaries.
- Have a separate subagent review against the ledger and evidence. Verify findings and return material decision gaps to Step 3.
- Create `docs/specs/` if needed. Use the local date and a lowercase hyphenated slug, making it more specific if the path exists.
- Write without final confirmation. Update an existing spec only when requested. Exclude secrets and sensitive personal data.
- Reference existing artifacts by path and make the spec sufficient without temporary HTML.

```markdown
# <title>
- Status: Ready for implementation
- Date: <local date>
- Source: <request and evidence>

## Outcome and current state
<beneficiary, request summary, current and desired behavior, workspace findings>

## Decisions and requirements
<decisions, rationale, rejected alternatives, requirements, non-goals, flows, edge cases, failure behavior>

## Acceptance criteria and public test seams
| Criterion | Observable seam |
| --- | --- |
| <outcome> | <public boundary and observation> |

## Constraints and risks
<constraints, dependencies, affected areas, assumptions, risks, deferred questions>
<compatibility, rollout, migration, observability when applicable; existing artifact paths>
Read this whole spec and inspect the current workspace before implementing.
```

## Step 6: Report the handoff

- Tell the user to start a new session with `Use $implement with <spec-path>.`
