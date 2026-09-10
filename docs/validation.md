# Implementation validation — 2026-09-10

Contract: [approved spec](specs/2026-09-10-versioning-debug-and-brainstorm-visuals.md). Baseline was commit `0a366739107b3c59858d9d65f8aa2595fec19ff8`, with no tracked diff and only the supplied `docs/` spec untracked. The existing implement skill was preserved. The spec was later updated at the user's request to remove external references. No repository commit, remote tag, push, publication, or remote settings change was performed.

Local environment: macOS, Node 26.8.1, npm 11.19.0, published skills CLI 1.5.25, Playwright 1.58.2 with local Google Chrome, and Python standard library fixtures. The GitHub workflow selects Node 22 (minimum supported 22.20). These observations do not establish behavior in every supported coding application's runtime.

## Repeatable checks

```sh
npm ci --ignore-scripts
npx playwright install chromium
npm test
npm run validate
git diff --check
```

On Linux, install browser system dependencies with `npx playwright install --with-deps chromium`. Browser tests automatically use local macOS Chrome when available; `CHROME_PATH` can select an executable. No build, typecheck, or separate lint configuration exists. JavaScript syntax was checked with `node --check`; edited scripts, tests, and HTML were formatted and checked using Prettier 3.8.1.

| Criteria | Executed evidence |
| --- | --- |
| AC1 | Version commands against temporary manifest fixtures: synchronized set/validate; malformed versions, build suffixes, leading zeroes, whitespace, inconsistent identity rejected. All repository plugin manifests validate as `0.2.0`. |
| AC2 | Release CLI against temporary Git repositories and remotes with controlled `gh` publication: committed failing checks and mismatched/moved tags block publication; matching tag succeeds. GitHub targeting stays bound to origin despite conflicting CLI defaults. Unsupported origins and separate push destinations fail before publication. Workflow wiring reviewed. |
| AC3 | Numeric stable ordering (`0.10.0` versus `0.2.0`), older releases, prereleases, failed publication, retry, rejected branch update recovery, and a competing latest update that invalidates the old lease. Published records and remote branch commit inspected through public command boundaries. |
| AC4–5 | Actual published CLI installs documented tree URL forms using child-process Git URL rewrites to controlled refs. Four agent targets exercised for pinned, older, and latest project installation; every packaged file and lockfile ref checked. Selected-skill/default-symlink flow also exercised. Missing refs and unavailable transport fail without development fallback. |
| AC5 global | Actual CLI `--global --copy` invoked for all four targets through pin → older version → latest. A child-only Node preload redirects the OS home lookup to a temporary directory; real HOME/CODEX_HOME are not changed, and network fetch is disabled. Three skills and correct release markers verified in the CLI's Claude and shared `.agents/skills` global directories; project remains empty. This tests installer placement, not application loading. |
| AC9 | Playwright opens a template copy outside the skill folder under `file://`; Space/arrow selection, readable answer IDs, reset, and clipboard-unavailable fallback pass. Both examples fit 320px in light/dark with visible keyboard focus and zero non-file requests. Representative desktop/mobile screenshots in both themes were visually inspected. |
| AC11 | Parsed all plugin/agent metadata and OpenCode discovery; exactly three skills found. Relative Markdown references resolve inside their owning skill. Real installations compare every supporting asset against the selected source snapshot. |

The initial installer test observed only two skills before debug was added. Visual TDD observed missing radio controls and then passing keyboard/summary behavior; a narrow-screen stacking assertion failed before its layout correction. Release command tests observed failing behavior before implementation, including review regressions described below. Fixture/setup failures are not counted as TDD evidence.

## Agent scenario evaluations (AC6–8)

An independent collaborating agent read the new debug skill and received only each user request and its prepared workspace, without the fixture generator's expected checks. It ran actual Python CLI commands in six isolated Git repositories. The parent then reran retained regression tests, inspected changes, verified ordinary neighboring pages, and checked notes/diagnostics preservation. These are agent-driven fixture evaluations, not automated phrase checks or external Claude Code/Cursor/OpenCode application runs.

Recreate fixtures using [tests/debug/README.md](../tests/debug/README.md). The session's full command/output chronology is `/tmp/my-dev-skills-debug-evaluation.md`; its temporary fixture paths begin `/tmp/my-dev-skills-eval-`. Temporary evidence may disappear after system cleanup; the outcomes are recorded here.

| Scenario | Observed result |
| --- | --- |
| Ordinary | Original page 2 returned `[2,3]`. CLI regression failed before the offset fix and passed afterward; original page 2 became `[3,4]`, with pages 1/3 independently verified as `[1,2]` / `[5,6]`. |
| Ambiguous | Ranked cache/backing-data/routing hypotheses preceded cold/warm/reversed-order probes. Cold beta returned Bob; warming alpha first produced Alice/Alice. Tenant-aware cache identity fixed the observed CLI regression, with working cold and reversed cases rechecked. |
| Unavailable | Local checkout returned 200, correctly distinguished from production 503. No behavior change or shallow regression was made. Agent requested a redacted failing request/response, timestamp/environment/request ID, relevant logs, and deployed code or replay capture; production cause remained unconfirmed. |
| Flaky | Original scenario failed 50/50 runs. A seeded regression failed before the lost-update fix and passed after; original scenario then failed 0/50 runs and 20 seeded cases passed. Agent explained the yield between read/write and explicitly limited the conclusion to the measured runs. |
| Performance | Five comparable CLI runs at size 4000: median 0.118266s before, 0.030487s after; size 12000: 0.820370s before, 0.031594s after. Order/duplicate output checks and a local benchmark regression were observed before/after. The retained 0.15s benchmark budget is host-dependent, not a portable CI threshold. |
| Three failed fixes | Agent explicitly reassessed shared-state ownership before a fourth fix, used failed timeout/retry/startup-clear attempts as evidence, and tested tenant cache identity. Regression failed/passed around a narrow fix; no redesign. |

All six unrelated notes remained byte-for-byte intact. Synthetic diagnostics were not needed or opened by the evaluator; the parent verified their bytes against Git and checked that the synthetic token was absent from the report. No temporary instrumentation remained. Retained regression/benchmark files had explicit purposes; the unavailable fixture had no new test or app change.

## Brainstorm trace (AC10)

A separate agent replayed a supplied synthetic transcript using the final brainstorm skill and template. Browser exploration selected `Q1-A`; the later supplied chat answer chose `Q1-B` for mobile reading. The refreshed temporary aid displayed settled `D1 / Q1-B`, and the generated canonical Markdown spec linked `Q1 → Q1-B → D1 → layout acceptance criterion`. Browser state never overrode chat. No durable HTML companion or production code was written.

The generated aid passed actual Chrome/Playwright checks at 320/1280px in both themes, including keyboard, clipboard fallback, reset, and no non-file requests. macOS `open` succeeded. The disposable spec and trace reside under `/tmp/brainstorm-trace-AjTEej/`. This scenario supplied an exhausted decision tree and final confirmation: it exercises chat-to-spec authority and artifact handling, not a full live requirements interview or all four applications.

## Independent reviews and fixes

Separate spec and code reviewers identified two material release issues. Failed checks could suppress their stdout diagnostics; a regression now observes the failure context and the command preserves it. GitHub CLI could use a different default repository from Git origin; publication and release queries now explicitly use the validated origin repository, with tests for conflicting defaults and divergent push destinations. Both issues were reproduced red before fixes and verified green afterward.

The reviews also prompted global installation evidence, the representative brainstorm trace, Node minimum consistency, and generated Python cache cleanup/ignore. Final independent spec and code reviews found no remaining material in-scope findings. A final wording correction clarified that the installer carries skill files/assets, not root plugin manifests. All 14 automated tests, version validation, JavaScript syntax checks, skill validators, formatting checks, and whitespace checks pass; live publication remains separate.

## Maintainer checks after publication

Live GitHub release creation, token/branch-rule permissions, and the real remote `tree/v0.2.0` / `tree/latest` installation smoke tests remain unperformed: publication is a separate maintainer action. Follow [the release guide](releases.md). Controlled GitHub records do not prove live publication. Application-specific loading, plugin marketplace cache refresh, and a complete live brainstorm interview remain manual runtime checks; no claim is made that installation/discovery tests establish them.

## Changed files

- Integration: `README.md`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `opencode.json`.
- Release: `scripts/version.mjs`, `scripts/release.mjs`, `.github/workflows/release.yml`, `docs/releases.md`.
- Debug: `skills/debug/SKILL.md`, `skills/debug/agents/openai.yaml`.
- Brainstorm: `skills/brainstorm/SKILL.md`, `skills/brainstorm/agents/openai.yaml`, `skills/brainstorm/references/visual-workspace.md`, `skills/brainstorm/assets/decision-workspace.html`, `skills/brainstorm/examples/layout-comparison.html`, `skills/brainstorm/examples/review-flow.html`.
- Checks: `package.json`, `package-lock.json`, `.gitignore`, `tests/install.test.mjs`, `tests/metadata.test.mjs`, `tests/release-version.test.mjs`, `tests/release-publish.test.mjs`, `tests/visual.test.mjs`, `tests/debug/scenarios.py`, `tests/debug/README.md`.
- Evidence: `docs/validation.md`. The supplied untracked spec was pre-existing input; its external references were subsequently removed at the user's request.
