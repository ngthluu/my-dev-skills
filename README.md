# My Dev Skills

Three shared skills: **brainstorm** an implementation-ready spec, **implement** it with tests and independent review, and **debug** unexpected behavior from evidence to a verified fix.

Works with **Claude Code, Codex, Cursor, and OpenCode**.

## Install a release

Run this in your project's terminal:

```sh
# Latest stable published release
npx skills@latest add https://github.com/ngthluu/my-dev-skills/tree/latest

# Pin an immutable release
npx skills@latest add https://github.com/ngthluu/my-dev-skills/tree/v0.1.0
```

Choose `brainstorm`, `implement`, and/or `debug`, select your coding agent, and pick project or global installation. Restart your agent after installation. The `v0.1.0` and `latest` refs become available after the first release is published; a missing ref is an installation error, not a reason to install the development branch.

`skills@latest` selects the **installer package**. `tree/latest` selects this repository's **stable release branch**, pointing to the exact commit of the highest published stable version. `tree/v0.1.0` selects an immutable release tag. Prereleases do not advance `latest`.

For a noninteractive project install, select skills and agents explicitly:

```sh
npx skills@latest add https://github.com/ngthluu/my-dev-skills/tree/latest --skill brainstorm implement debug --agent claude-code codex cursor opencode -y
```

Use `--global` for user-wide installation, and `--copy` if you prefer copies over the installer's default symlinks. Requires Node.js 22.20 or newer, Git, and your chosen coding application. The installation checks use published CLI `1.5.25`.

## Upgrade or restore a release

Reinstall from `tree/latest` with the same skills, agents, and project/global scope to upgrade. Reinstall from `tree/v0.1.0` to select or restore that exact release. To restore another published version, replace `v0.1.0` with its tag from [Releases](https://github.com/ngthluu/my-dev-skills/releases). Restart the agent to reload the installed instructions. Do not rely on the installer's generic `update` command to preserve a release pin.

For development-branch installation only:

```sh
npx skills@latest add ngthluu/my-dev-skills
```

Installer or network errors must be resolved and the requested command retried; do not switch sources silently. Existing installations stay unchanged until reinstalled. The skills CLI installs the shared skill files directly; plugin marketplace caches are a separate installation mechanism. The three plugin manifests now share the release version without a Codex timestamp suffix. If a plugin-managed installation remains stale, use that application's supported plugin refresh/reinstall flow and restart it; do not edit version metadata to bypass its cache.

## How to use

### Brainstorm an idea

```text
Use the brainstorm skill to design a searchable activity log for this project.
```

The agent investigates the project, tracks decisions in chat, and asks one material question at a time, using the host's question UI when available. When seeing relationships helps, it creates a temporary offline HTML reference styled with embedded Pico CSS: before/after diagrams, static lifecycle views, UI comparisons, or a final review with explicit decision scope. All useful detail stays visible, and comparison cards have distinct colors and borders. Pages display information only; answers remain in chat. Once material decisions are settled or safely deferred, it writes the canonical spec to `docs/specs/yyyy-mm-dd-<slug>.md`, including acceptance criteria and test seams, without an extra confirmation round.

### Implement the spec

Start a **fresh session** in the same project:

```text
Use the implement skill with docs/specs/2026-09-10-activity-log.md.
```

Replace the path with your spec. The agent implements with TDD and independently reviews spec compliance and code quality. It delegates when subagents are available and permitted; otherwise it works in the main session.

### Debug a reported problem

```text
Use the debug skill: the activity log repeats the last item when I load the next page.
```

Debug works in the current session without a brainstorm spec. It reproduces the symptom, investigates root cause, observes a failing regression signal, makes the smallest supported fix, and verifies the original scenario. For flaky or performance problems it measures repeated behavior. If reproduction or access is missing, it gathers evidence and reports the specific blocker without claiming a speculative fix.

| Agent | Brainstorm | Implement | Debug |
| --- | --- | --- | --- |
| Claude Code | `/brainstorm` | `/implement` | `/debug` |
| Codex | `$brainstorm` | `$implement` | `$debug` |
| Cursor | Type `/` and select `brainstorm` | Type `/` and select `implement` | Type `/` and select `debug` |
| OpenCode | Ask to load `brainstorm` with the `skill` tool | Ask to load `implement` with the `skill` tool | Ask to load `debug` with the `skill` tool |

Include your idea, spec path, or bug report after selecting the skill. Shared instructions use `$brainstorm`, `$implement`, and `$debug` as shorthand; use your agent's syntax above.

These skills are configured for explicit invocation in Claude Code, Cursor, Codex, and OpenCode V2. OpenCode V1 does not recognize the OpenCode V2 invocation metadata, so it may still suggest or load a skill automatically.

## Contributing and releasing

[Issues](https://github.com/ngthluu/my-dev-skills/issues) and pull requests are welcome. Describe the problem, expected behavior, and verification. Edit the shared [brainstorm](skills/brainstorm/SKILL.md), [implement](skills/implement/SKILL.md), and [debug](skills/debug/SKILL.md) instructions in their owning folders. Keep references, templates, and examples inside each skill so installation carries them along.

Run `npm ci`, `npx playwright install chromium`, and `npm test` for release tooling, real installer fixtures, and offline browser checks. These development dependencies are not needed to use the skills. Also run `npm run validate` and `git diff --check`. No application build or typecheck is defined. Scenario evaluations of agent behavior are separate from installation and deterministic tooling checks; see [validation evidence](docs/validation.md).

See the [maintainer release guide](docs/releases.md) for version selection, validation, review/commit/tag/push steps, required repository permissions, publication recovery, and the first remote installation smoke test. Preparing a version locally does not publish it.

## License

[MIT](LICENSE) © 2026 Luu Nguyen.
