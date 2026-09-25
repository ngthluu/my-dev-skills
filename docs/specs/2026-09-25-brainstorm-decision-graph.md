# Predictable brainstorm interviews and explicit skill invocation

- **Status:** Ready for implementation
- **Date:** 2026-09-25
- **Source:** User request and decision interview in this session. The user chose to write the spec without a final confirmation round.

## Outcome and current state

Make `$brainstorm` ask each material decision once, use the host's question UI when available, and follow a predictable order while still discovering dependencies revealed by answers. The beneficiary is a user designing work with the three skills in this repository.

Today, `skills/brainstorm/SKILL.md` calls the subject a tree, asks every independent frontier question in a round, recomputes the tree after answers, and requires a final confirmation. It does not define how to reconcile new answers with answered questions, how to choose one question, or how to use a host question tool. Rebuilding an untracked frontier can cause semantically repeated questions. The skill produces a self-contained spec in `docs/specs/` and leaves implementation to a fresh session.

The repository packages `brainstorm`, `implement`, and `debug` for Claude Code, Codex, Cursor, and OpenCode. Explicit-invocation metadata for all three skills was already applied in this discovery session at the user's direct request; see the current working diff. The installed copy under `~/.agents/skills/` is separate from this repository.

## Decisions

| ID | Decision | Reason |
| --- | --- | --- |
| D1 | Model the interview as a **dependency graph plus a decision ledger**, not a strict tree. | Several decisions can share a prerequisite or answer. A ledger makes settled answers reusable across branches. |
| D2 | Before the first question, map the key known decisions and their prerequisites; extend or revise the map when answers reveal new branches. | Provides a stable starting order without pretending every branch is knowable in advance. |
| D3 | Track the concise ledger in chat, using stable decision IDs and settled, open, blocked, deferred, or contradicted status with the answer's source. | Keeps the interview auditable without writing a temporary state file. |
| D4 | Ask **one decision question at a time** through the host's dedicated question tool when it is exposed; otherwise ask one plain chat question. | Fits the requested Claude/Codex question UI and avoids a batch of questions. The skill cannot generate a keyboard shortcut; Codex CLI's Option/Alt+Up is a user-side UI control when shown by the host. |
| D5 | For a partial or ambiguous answer, ask only for the missing material detail. Reopen a settled decision only when a new answer or evidence actually contradicts or invalidates it. | Prevents repeating a question the user already answered. |
| D6 | Traverse eligible questions by dependency first, then by impact on the outcome; break remaining ties by stable ID. | Makes selection reproducible. |
| D7 | When the graph has no material unresolved decisions, write the spec without an extra confirmation question. | The user explicitly rejected a final confirmation round. The closing summary can be declarative. |

An ordered checklist was considered because it is simple, but cannot express conditional prerequisites well. A strict tree gives clear branch order, but duplicates shared decisions. A fully adaptive interview preserves flexibility but does not provide the requested predictable traversal.

## Required behavior

1. Investigate workspace and authoritative facts before asking. Extract decisions already supplied by the user, existing artifacts, or earlier answers before constructing the initial graph. Do not ask the user to retrieve facts available to the agent.
2. Give each decision a stable ID, question, prerequisites, impact, status, answer/source, and any reason it was reopened or deferred. Keep the visible ledger concise; it may show only decisions relevant to the current frontier, but settled answers must remain available to the agent throughout the session, including after context compaction.
3. Before every question, reconcile the whole new user message with the ledger. One answer may settle several nodes, supersede assumptions, or add nodes. Check semantic equivalence, not wording or question ID alone. Never ask a settled question again merely because the graph was rebuilt.
4. Select exactly one open node whose prerequisites are settled. If several qualify, choose the one that unlocks the most consequential behavior or other decisions; use stable ID to break a genuine tie. Explain briefly why it matters and present a recommended answer with its tradeoff. Use the host question tool if available and suitable for this question. Do not switch the user's collaboration mode solely to obtain a tool. If the tool is absent, restricted, or cannot represent the question, use chat.
5. If an answer is incomplete, ask a focused follow-up about only the missing part. If a later fact conflicts with a settled decision, state the conflict and ask the smallest question needed to resolve it. Record the resolution and its source. Do not treat lack of an explicit answer as agreement.
6. End when every material branch needed for a fresh session's implementation is settled or explicitly deferred with a safe assumption. Preserve the existing coverage of outcome, current/desired behavior, scope and non-goals, failure behavior, constraints, compatibility, rollout/migration, acceptance criteria, and public test seams. Do not prolong the interview with optional or duplicate questions. Summarize the decisions and write the canonical Markdown spec without asking for final confirmation.
7. Keep the existing optional visual-workspace behavior when relationships genuinely benefit from a visual. A visual is display-only and does not replace the chat ledger or canonical spec.

## Explicit invocation, already applied

The three `SKILL.md` files now set `disable-model-invocation: true` for Claude Code and Cursor and string metadata `opencode/autoinvoke: "false"` for OpenCode V2. Their `agents/openai.yaml` sidecars now set `policy.allow_implicit_invocation: false` for Codex. `README.md` records the OpenCode V1 limit: it does not recognize the V2 metadata. Keep these settings when implementing this spec, and document any observed version-specific behavior accurately. Do not disable skill discovery or explicit invocation to approximate manual-only behavior.

The [Agent Skills specification](https://agentskills.io/specification) defines `metadata` as string-to-string client-specific data. [Claude Code](https://code.claude.com/docs/en/skills), [Cursor](https://prod.cursor.com/docs/skills), [Codex's skill metadata reference](https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/skill-creator/references/openai_yaml.md), and [OpenCode V2](https://opencode.ai/v2/docs/skills) document the corresponding controls. The standalone `disable-model-invocation` key is not a portable Agent Skills standard field.

## Acceptance criteria and test seams

| Criterion | Observable seam |
| --- | --- |
| AC1. A user message that answers two mapped decisions settles both; the next question concerns a genuinely open node, and neither settled decision is asked again. | Replay a representative interview transcript through the user-facing skill with recorded question/answer turns. |
| AC2. A partial answer produces one focused clarification; an unequivocal answer produces no clarification. A later contradiction reopens only the affected decision. | Replay partial-answer, complete-answer, and contradiction transcripts through the user-facing interview. |
| AC3. The skill creates a key-decision graph before questioning, extends it after a new dependency appears, and asks eligible nodes in prerequisite, impact, stable-ID order. | Inspect the skill instructions and replay a branching transcript where the order differs from discovery order. |
| AC4. A host with a suitable question tool gets exactly one question in a tool call; a host without one gets one chat question, with the same decision and recommendation. | Run or simulate the skill in tool-present and tool-absent host scenarios; inspect the public question output. |
| AC5. With all material decisions settled or safely deferred, the skill writes a complete self-contained spec without a confirmation prompt; it does not produce implementation code. | Replay a completed interview and inspect chat plus the generated `docs/specs/` artifact. |
| AC6. Each of the three skills remains explicitly invocable and is not automatically advertised where supported by Claude Code, Cursor, Codex, and OpenCode V2. | Parse installed/packaged skill metadata and run application-specific manual loading checks where those applications are available; do not infer runtime behavior from YAML parsing alone. |

## Scope and constraints

Likely affected files are `skills/brainstorm/SKILL.md`, optionally its references or a compact example, the three skill metadata files and Codex sidecars already edited, and any directly relevant repository documentation or checks. Keep the final skill instructions concise and portable. The graph and ledger are an interview procedure, not a required executable engine or persistent database. Preserve the existing spec handoff, public test-seam requirements, and optional offline visuals.

No change is requested to `$implement` or `$debug` workflow bodies. No release, tag, push, or reinstall is part of this spec. The metadata edit is in the working tree; users of separately installed copies need their normal update or reinstall flow after a release or local install.

## Risks and deferrals

- Prompt instructions improve consistency but cannot make a model perfectly deterministic. The observable target is stable traversal and no unnecessary repeated questions in representative sessions.
- Tool availability and the Codex CLI's Option/Alt+Up key handling depend on the host and terminal. The skill chooses the question tool when exposed and does not promise a shortcut will work.
- OpenCode V1 has no equivalent portable explicit-only metadata while preserving the existing skill-tool invocation path. Its current automatic behavior remains a documented compatibility limit.
- The first graph cannot predict every dependency. New branches are allowed, but must be reconciled with the ledger before another question.

## Fresh-session instruction

Read this entire spec, inspect the current workspace and working diff, and invoke `$implement` with this path. Preserve the explicit-invocation metadata already applied in this session.

```text
Use $implement with docs/specs/2026-09-25-brainstorm-decision-graph.md.
```
