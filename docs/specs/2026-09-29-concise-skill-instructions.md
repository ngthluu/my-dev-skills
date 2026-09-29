# Concise instructions for the three development skills

- **Status:** Ready for implementation
- **Date:** 2026-09-29
- **Source:** User request, repository inspection, and the [Claude Code debugging prompt example](https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/skill-debugging.md). The user chose to preserve existing workflow behavior while shortening the wording.

## Outcome and current state

Make the `brainstorm`, `implement`, and `debug` skill instructions quicker for people and agents to scan and follow. Each `SKILL.md` should use meaningful `##` sections, ordered steps for actions, bullets for rules and exceptions, and short, usable templates for its output or handoff.

The three existing files are `skills/brainstorm/SKILL.md` (1,126 words), `skills/implement/SKILL.md` (1,082 words), and `skills/debug/SKILL.md` (1,235 words), measured with `wc -w` before this spec. They contain valuable behavior but bury some actions in long paragraphs. `tests/brainstorm-instructions.test.mjs` matches several exact prose fragments, so its assertions may need to change with the rewrite. Metadata and packaged references are checked by `tests/metadata.test.mjs`. The linked prompt demonstrates compact context headings followed by a numbered action list; its Claude session log, settings variables, and guide subagent are specific to that product.

## Decisions and requirements

1. Rewrite the three repository `SKILL.md` files. Keep their YAML metadata, explicit invocation settings, skill names, and public purpose intact.
2. Preserve the existing workflow contracts: brainstorm investigates and tracks decisions, asks one material question at a time, then writes a self-contained spec for a fresh implementation session; implement uses public seams, red/green TDD, verification, and two independent review axes; debug reproduces and diagnoses from evidence, writes a meaningful regression check when possible, verifies the original symptom, and reports limits precisely.
3. Use short `##` headings based on the job at each stage. Put the main workflow in numbered steps. Put exceptions, quality checks, and decision rules in short bullets adjacent to the relevant step. Replace repeated explanations with one clear rule; preserve rules that affect outcomes.
4. Add compact, copyable templates where the current skill asks for a structured artifact: brainstorm's decision ledger and handoff spec, implement's final report and review findings, and debug's evidence or hypothesis update and final report. Templates should show required fields and order without imposing unnecessary prose or a new file format.
5. Keep details that are needed only for the optional visual workspace in its packaged reference. The main brainstorm skill must still say when to use it, how to keep chat and the Markdown spec authoritative, and where to read the reference. Do not change the visual behavior or assets as part of this task.
6. Treat the linked debugging prompt as a structural example, not a source of new Claude-specific logging or settings requirements. Do not copy its product-only variables or require a guide subagent.
7. Keep each rewritten `SKILL.md` shorter than its baseline word count, with no fixed percentage target. Clarity and retained behavior take priority over an arbitrary length limit.
8. Update directly affected wording-based checks and repository documentation only where the rewrite makes them inaccurate. Prefer tests that assert structural requirements or observable skill behavior over tests that require an incidental sentence to remain verbatim.

## Scope and failure behavior

- Preserve the four-agent packaging and relative-reference compatibility. Supporting files should remain within their owning skill directory when installed.
- Preserve the handling of unavailable question tools, unavailable reproduction, absent test seams, blocked work, user changes, and review findings. Make these paths easy to find in the appropriate step.
- Do not add a new workflow, require a new tool, change the invocation policy, or weaken TDD, evidence, or independent review requirements to save words.
- Do not implement a product feature, release, tag, push, reinstall the skills, or create a separate diagnosis document.

## Acceptance criteria and public test seams

| Criterion | Observable seam |
| --- | --- |
| AC1. Each of the three `SKILL.md` files has clear `##` sections, ordered action steps, nearby bullet rules, and a concise output or handoff template. Each is shorter than its recorded baseline. | Read the installed or repository Markdown as a user would; inspect heading/list structure and compare `wc -w` with the baselines above. |
| AC2. Brainstorm still reconciles a decision ledger, asks one eligible question through a suitable host tool or chat fallback, and writes a self-contained spec without implementing or asking for final confirmation. | Review the instructions and replay representative multi-answer, partial-answer, contradiction, tool-present, and tool-absent interview scenarios through the user-facing skill. |
| AC3. Implement still uses meaningful public-seam red/green tests, verifies the result, and performs separate requirements and code reviews with fixes for valid findings. | Review the instructions and exercise a small representative implementation task through the user-facing skill, inspecting test chronology and review reports. |
| AC4. Debug still reproduces the reported signal, tests root-cause predictions, verifies a supported fix against both regression and original scenario, and labels unconfirmed or blocked cases accurately. | Review the instructions and use the existing scenarios documented in `tests/debug/README.md`; inspect commands, diff, and report rather than phrase matches alone. |
| AC5. The four-agent metadata and packaged links still resolve, and repository checks pass after any directly needed test adjustment. | Run `npm test`, `npm run validate`, and `git diff --check`; inspect any environment-dependent failure separately. |

## Constraints, risks, and handoff

Likely changed files are the three `SKILL.md` files and `tests/brainstorm-instructions.test.mjs`; edit other checks or `README.md` only when their current text becomes wrong. The main risk is losing a material edge case while compressing prose. Compare the before and after instructions by workflow stage and exception, then use the behavioral seams above to check the result. Model behavior cannot be proven by static text checks alone; report which scenario evaluations were actually run.

No product decision remains open. Exact headings, template layout, and wording are implementation choices. Read this whole spec and inspect the current workspace before editing. Then invoke `$implement` with this path:

```text
Use $implement with docs/specs/2026-09-29-concise-skill-instructions.md.
```
