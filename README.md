# My Skills

Reusable AI coding skills for Claude Code, Codex, Cursor, and OpenCode. Clarify an idea into a self-contained spec, then implement it with test-driven development and independent review.

## Skills

| Skill | What it does | Deliverable |
| --- | --- | --- |
| [brainstorm](skills/brainstorm/SKILL.md) | Investigates the workspace and interviews you until the important decisions are settled. | An implementation spec at `docs/specs/yyyy-mm-dd-<slug>.md`. |
| [implement](skills/implement/SKILL.md) | Builds from the spec using observable acceptance criteria, TDD, and separate spec and code reviews. | Implementation, validation results, and a completion report. |

Brainstorming ends with a written handoff. Implementation starts in a fresh session so it can work from the spec without depending on the original conversation.

## Install

Install directly from this repository's GitHub URL with the [skills CLI](https://github.com/vercel-labs/skills). It downloads the source and installs the selected skills; no manual clone or file copying is needed.

Prerequisites: Node.js 22.20 or newer (including `npx`), Git, and your chosen coding application.

**Repository URL:** replace `OWNER/my-skills` below with this project's GitHub owner and repository name. These examples are templates until the public repository URL is configured.

For an interactive installation, run this from your working project and choose your skills, hosts, and installation scope:

```sh
npx skills add https://github.com/OWNER/my-skills
```

Or install both skills for a particular host across your projects:

| Host | Command |
| --- | --- |
| Claude Code | `npx skills add OWNER/my-skills --skill brainstorm implement -a claude-code -g` |
| Codex | `npx skills add OWNER/my-skills --skill brainstorm implement -a codex -g` |
| Cursor | `npx skills add OWNER/my-skills --skill brainstorm implement -a cursor -g` |
| OpenCode | `npx skills add OWNER/my-skills --skill brainstorm implement -a opencode -g` |

Install for all four hosts:

```sh
npx skills add OWNER/my-skills --skill brainstorm implement -a claude-code codex cursor opencode -g
```

Omit `-g` for a project installation. Review the installer's destination and replacement summary, particularly if skills with these names are already installed. Restart your host after installation.

These commands install the skills directly. They do not register the repository's plugin manifests or require a marketplace listing.

### Verify, update, or uninstall

```sh
# Preview the repository's skills without installing them
npx skills add OWNER/my-skills --list

# List globally installed skills
npx skills list -g

# Update these two globally installed skills
npx skills update brainstorm implement -g

# Remove these two globally installed skills
npx skills remove brainstorm implement -g
```

For CLI options and supported agents, see the [installer reference](https://github.com/vercel-labs/skills#options).

### Invoke the skills

| Host | Start brainstorming | Implement a spec |
| --- | --- | --- |
| Claude Code | `/brainstorm` followed by your idea | `/implement` followed by the spec path |
| Codex | `$brainstorm` followed by your idea | `$implement` followed by the spec path |
| Cursor | Type `/` in Agent chat and select `brainstorm` | Select `implement` and provide the spec path |
| OpenCode | Ask it to load `brainstorm` with its `skill` tool | Ask it to load `implement` with the spec path |

### Local development

Contributors can preview skill discovery from a checkout with `npx skills add . --list`, or install from it with `npx skills add .`. OpenCode also reads this repository's `opencode.json`, which points to `./skills`.

Claude Code can load the checkout as a plugin for a session with `claude --plugin-dir /absolute/path/to/my-skills`. In that mode, its commands are `/my-skills:brainstorm` and `/my-skills:implement`. See [Claude Code plugins](https://code.claude.com/docs/en/plugins).

## Usage

Start with an idea:

```text
Use the brainstorm skill to design a searchable activity log for this project.
```

Answer the questions, review the decisions, and confirm the final understanding. The skill writes a spec with requirements, acceptance criteria, and test seams.

Start a fresh session in the same project:

```text
Use the implement skill with docs/specs/2026-09-08-activity-log.md.
```

Replace the example path with the spec you created. The implementation skill follows a red-to-green test cycle and reviews the result against both the spec and repository conventions.

The shared instructions use `$brainstorm` and `$implement` as shorthand; use your host's invocation syntax above. Delegation requires host support and repository permission. When subagents are unavailable, the implementation skill performs the work and reviews in the main session.

## Repository structure

```text
.claude-plugin/plugin.json     Claude Code plugin manifest
.codex-plugin/plugin.json      Codex plugin manifest
.cursor-plugin/plugin.json     Cursor plugin manifest
opencode.json                  OpenCode skill discovery configuration
skills/
  brainstorm/
    SKILL.md
    agents/openai.yaml
    references/visual-workspace.md
  implement/
    SKILL.md
    agents/openai.yaml
LICENSE
```

`skills/` is the shared source of truth. No build step or external service is required by this skill pack. The manifests support host-specific packaging; direct installation above does not require a marketplace listing. Host applications, models, and project tooling have their own requirements.

## Contributing

Issues and pull requests are welcome. Describe the workflow problem, the expected behavior, and an example that demonstrates the change. Edit skills in `skills/` rather than maintaining separate copies for each host. Keep supporting references relative to their skill directory and preserve the spec handoff between brainstorming and implementation.

For compatibility changes, identify the host and version you tested. Validate JSON configuration and skill frontmatter, and verify that installation preserves supporting files. Installation layout checks do not replace testing skill discovery and behavior inside the host.

## License

[MIT](LICENSE) © 2026 Luu Nguyen.
