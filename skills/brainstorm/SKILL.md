---
name: brainstorm
description: Turn an idea, feature, or problem into a self-contained implementation handoff spec through exhaustive, decision-focused questioning. Use before implementation when requirements, constraints, behavior, or test seams still need to be discovered.
disable-model-invocation: true
metadata:
  opencode/autoinvoke: "false"
---

# Brainstorm

Turn the idea into a handoff spec that gives a fresh implement session full context to start coding without rediscovery. Do not implement in this session.

## Working rules

- The main agent inspects context, maps decisions, asks questions, reconciles the ledger, checks readiness, and writes the spec itself.
- Use subagents only when useful, available, and permitted for bounded fact lookup, option comparisons, visuals, or read-only reviews.
- Give side tasks current evidence and clear scope. Isolate visual files, and prohibit further delegation.
- Verify findings before using them. Present conclusions and conflicts, keeping raw investigation logs out of chat.
- Work through the steps in order. Each step writes its file in the session folder before the next step starts.

```text
.my-dev-skills/.gitignore    *
.my-dev-skills/<slug>/
  context.md   Step 2
  ledger.json  Steps 3-5, via scripts/ledger.mjs
  visuals/     Step 4, optional
  review.md    Step 6, optional
  README.md    Step 6, the spec
```

## Step 1: Set up the folder

- Pick a lowercase hyphenated slug from the request. Make it more specific if `.my-dev-skills/<slug>/` exists.
- Create `.my-dev-skills/<slug>/`. Add `.my-dev-skills/.gitignore` containing `*` if it is missing.
- Reuse an existing folder only when asked.

## Step 2: Inspect context

- Inspect the workspace, repository instructions, existing artifacts, and prior answers yourself.
- Research material unknowns using reliable primary sources. Check dates and applicability, and retain links.
- Reconcile findings and extract existing decisions. Find available facts instead of asking the user to retrieve them.
- Label each finding as verified, inferred, or assumed. Cite the evidence for verified claims.
- Note affected code, reusable patterns, and verification commands. Write `context.md` with these, findings, labels, and sources.

## Step 3: Map decisions

- Identify material decisions, dependencies, and shared prerequisites yourself.
- Integrate findings into a dependency graph before the first question. Revise it as answers reveal branches.
- Record each decision with a stable ID in `ledger.json` through [scripts/ledger.mjs](scripts/ledger.mjs). Never edit the JSON by hand.
- Statuses are `settled`, `open`, `blocked`, `deferred`, or `contradicted`. The script rejects changes without required evidence.

```text
L init
L add Q2 --question "<decision>" --prereq Q1 --impact "<outcome or unlocked decisions>" [--minor]
L set Q2 --status settled --answer "<answer>" --source "<user message or evidence>"
L set Q2 --status deferred|blocked|contradicted --reason "<reason>"
L show [--status open]
L next
L audit
```

- `L` is `node <skill-dir>/scripts/ledger.mjs <folder>`. Show relevant entries in chat and rerun `show` after compaction.

## Step 4: Ask one material question

- Run `next` to select exactly one eligible open question. It ranks material ones by unlocked decisions, then breaks a tie by stable ID.
- Override its pick only for clearly higher outcome impact. Option analysis may be a side task.
- Classify before asking. If a throwaway probe outside the source tree can settle it, run it and record the result with `set`.
- Ask the user only preference or priority calls that no experiment can settle. Skip questions already resolved by evidence.
- Explain why the decision matters, recommend an answer, and state its tradeoff.
- Use a suitable host question tool with one question, without repeating it in chat.
- If unavailable, restricted, or unsuitable, ask one plain chat question in the final response, never in commentary.
- Do not change collaboration mode to access a tool. Wait for an actual answer, then follow Step 5.
- A nonblocking question tool or empty result is not an answer. Keep the question pending and stop dependent work until a reply arrives.

For spatial, stateful, comparative, or quantitative relationships, create a browser visual when clearer than prose or a table.

- The visual writer reads [references/visual-workspace.md](references/visual-workspace.md). Check its artifact and verification findings.
- Save visuals in `visuals/`. Keep chat as the input channel, `ledger.json` authoritative, the Markdown spec canonical, and pages display-only.
- Update visuals for material model changes and carry validated conclusions into the spec.

## Step 5: Reconcile and repeat

- Read the whole latest message, new evidence, and `show` output yourself. Reconcile answers, dependencies, and contradictions.
- Apply only supported status changes. A recommendation, subagent proposal, or unanswered question is not a user answer.
- Match by meaning and settle several decisions when answered together. For partial or ambiguous answers, ask only missing material detail.
- Defer a material choice only when the user explicitly postpones it or authorizes a default.
- Defer minor implementation details only when they do not change scope, behavior, acceptance criteria, or material risk.
- Explicitly writing an assumption does not settle a material choice.
- Never treat silence as agreement. Reopen settled decisions only when evidence contradicts or invalidates them.
- Mark conflicts `contradicted`, explain them, and ask the smallest resolving question. Record its resolution and source.
- Record every change with `set` or `add` before continuing. Never reask solely because the graph changed.
- Return to Step 4 while any material decision remains. This is not a one-question limit for the whole session.
- Check gaps yourself: unresolved branches, assumptions, failures, migration, compatibility, and operations.
- Run `audit`. It fails on material open, blocked, or contradicted IDs and on answers or deferrals lacking evidence.
- On failure, resolve each item or obtain an explicit deferral, then return to Step 4. Record merged or excluded IDs with reasons.
- Then summarize without another confirmation.

## Step 6: Write the handoff spec

- Enter this step only after the ledger audit passes.
- Write `README.md` yourself from `show` output and `context.md`. Pair every observable acceptance criterion with an agreed public test seam.
- Read [references/spec-template.md](references/spec-template.md) and follow it, omitting empty sections. Prefer existing interfaces.
- Write for a reader with no session memory. Omit status, dates, and ledger states. Exclude secrets and sensitive data.
- Reference code by path and line. Make the spec sufficient without the other session files.
- Optionally use a read-only subagent to review against the ledger and evidence. Verify each finding yourself.
- Sort findings in `review.md` into act on, consider, noted, or dismissed with a reason. Dismiss nits and unsupported hypotheticals.
- Return act-on gaps to Step 4. Record consider items as spec risks. Write without final confirmation.

## Step 7: Report the spec path

- Reply with only the spec path: `.my-dev-skills/<slug>/README.md`.
