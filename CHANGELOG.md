# Changelog

## Unreleased

- Brainstorm session folders are now date-prefixed as `.my-dev-skills/yyyy-mm-dd-<slug>/`.
- Removed brainstorm's visual workspace: the HTML templates, examples, and `visuals/` folder.
- Brainstorm's decision ledger script is now `scripts/ledger.py` and runs with `python3` (standard library only) instead of Node.js.
- Maintainer tooling and checks moved from Node.js to Python managed by uv: `uv run pytest`, `scripts/version.py`, and `scripts/release.py`.

## [0.1.9]

- Changed brainstorm to write a temporary handoff spec to `.my-dev-skills/<slug>/README.md`, which is ignored by Git, instead of committing a spec under `docs/specs/`. The spec now covers the goal, current state, where to change, acceptance criteria, suggested slices, and verification commands. Brainstorm replies with only the spec path.
- Brainstorm now records its context, decision ledger, optional visuals, and review in the session folder. The ledger is managed by a bundled Node.js script that checks for required evidence and audits for unresolved decisions before writing the spec. Questions that a throwaway experiment can settle get the experiment instead of a question to the user.
- Implement now plans from a spec's suggested slices, confirms its file paths, runs its verification commands, and favors minimal code with no speculative abstractions or compatibility shims.
- Debug now fixes faults where they start rather than where they show, reverts edits made for refuted hypotheses, and ships no speculative changes beside the fix.
- Renamed the repository-local maintainer skill from release-notes to release-version.

## [0.1.8]

- Kept core brainstorm, implementation, and debugging work with the main agent, with subagents limited to bounded supporting tasks and reviews.
- Strengthened brainstorm instructions to continue asking and reconciling questions until every material decision is answered or explicitly deferred before writing the spec.

## [0.1.7]

- Hid the repository-local release-notes skill from the public installer skill list.

## [0.1.6]

- Added a repository-local release-notes skill and a maintained changelog with reviewed notes for historical releases.
- Updated release publication to use a reviewed notes file committed with a new tag when one is present.
- Clarified that anyone may open issues, while pull requests are maintainer-only.

## [0.1.5]

- Shortened and clarified the brainstorm, implement, and debug instructions and their handoffs.
- Improved release publication when GitHub's release listing lags behind a newly published release.

## [0.1.4]

- Guided brainstorm interviews through a decision graph, with clearer visual and chat handoffs.
- Refined the prompts and metadata for the three shared skills.

## [0.1.3]

- Kept final brainstorm confirmation in chat without generating or refreshing a visual solely for that step.

## [0.1.2]

- Added display-only, offline visual patterns for brainstorm decisions, including flows, comparisons, and final review.
- Clarified that choices and approvals are made in chat, not in the visual workspace.

## [0.1.1]

- Strengthened implementation guidance for meaningful tests, delegated work, and independent requirements and code review.
- Strengthened debugging guidance for evidence-based fixes, regression checks, and independent cause and code review.

## [0.1.0]

- Released the brainstorm, implement, and debug skills for Claude Code, Codex, Cursor, and OpenCode.
- Added versioned installation, release validation, and an immutable-tag publication workflow.
