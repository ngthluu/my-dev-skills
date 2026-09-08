# My Dev Skills

Two skills for turning an idea into working software: **brainstorm** the spec, then **implement** it with tests and code review.

Works with **Claude Code, Codex, Cursor, and OpenCode**.

## Install

Run this in your project's terminal:

```sh
npx skills@latest add ngthluu/my-dev-skills
```

Choose `brainstorm` and `implement`, select your coding agent, and pick project or global installation. The installer downloads everything for you—no manual cloning required. Restart your agent after installation.

Requires Node.js 22.20 or newer, Git, and your chosen coding application. See the [skills CLI documentation](https://github.com/vercel-labs/skills#install-a-skill).

## How to use

### 1. Brainstorm your idea

```text
Use the brainstorm skill to design a searchable activity log for this project.
```

The agent investigates your project, asks questions, and helps settle the requirements. Once you confirm the decisions, it writes a spec to `docs/specs/yyyy-mm-dd-<slug>.md` with acceptance criteria and test seams.

### 2. Implement the spec

Start a **fresh session** in the same project:

```text
Use the implement skill with docs/specs/2026-09-08-activity-log.md.
```

Replace the example path with your spec. The agent implements it with test-driven development, checks the result against the spec, and reviews the code. When subagents are available and permitted, it delegates implementation and independent reviews; otherwise, it works in the main session.

You can also invoke the skills directly:

| Agent | Brainstorm | Implement |
| --- | --- | --- |
| Claude Code | `/brainstorm` | `/implement` |
| Codex | `$brainstorm` | `$implement` |
| Cursor | Type `/` and select `brainstorm` | Type `/` and select `implement` |
| OpenCode | Ask to load `brainstorm` with the `skill` tool | Ask to load `implement` with the `skill` tool |

Include your idea or spec path after selecting the skill. The shared skill instructions use `$brainstorm` and `$implement` as shorthand; use your agent's syntax above.

## Contributing

[Issues](https://github.com/ngthluu/my-dev-skills/issues) and pull requests are welcome. Describe the problem, expected behavior, and how you tested your change.

The shared instructions live in [skills/brainstorm](skills/brainstorm/SKILL.md) and [skills/implement](skills/implement/SKILL.md). Edit them there; all four agents use the same files. Keep supporting references inside the skill folder and test discovery in the agent you changed.

## License

[MIT](LICENSE) © 2026 Luu Nguyen.
