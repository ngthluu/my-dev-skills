# Tagged releases, debug skill, and brainstorm visuals

- Status: Approved for implementation
- Date: 2026-09-10
- Repository: `ngthluu/my-dev-skills`
- Source: `$brainstorm` discovery; the user accepted all recommendations in two decision rounds, confirmed the complete summary, and requested this spec.

## Outcome and conversation summary

Provide predictable installation of released skills, add an evidence-driven debugging workflow, and improve visual brainstorming. The repository will contain exactly three skills: `brainstorm`, `implement`, and `debug`, shared by Claude Code, Codex, Cursor, and OpenCode.

The user requested tag-based versioning and tag/latest installation, an evidence-driven debugging skill, and better standalone brainstorm HTML prototypes. Discovery settled the scope below. Implementation belongs in a fresh session; this discovery session creates only this spec.

## Current state

Workspace inspection found:

- `skills/brainstorm/SKILL.md` interviews the user and writes an approved spec under `docs/specs/`; implementation happens in a fresh session.
- `skills/brainstorm/references/visual-workspace.md` describes temporary, standalone offline HTML, stable decision IDs, chat-based answers, and a canonical Markdown spec. There is no shipped HTML template.
- `skills/implement/SKILL.md` defines TDD, delegation when permitted, and independent spec/code reviews.
- Each existing skill has `agents/openai.yaml` metadata.
- `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` have version `0.1.0`; `.codex-plugin/plugin.json` has `0.1.0+codex.20260908042523`. All identify the plugin as `my-skills` and discover `./skills/`.
- `opencode.json` discovers skills from `./skills`.
- `README.md` describes two skills and installs with `npx skills@latest add ngthluu/my-dev-skills`. That `@latest` selects the installer package, not this repository's release.
- No local tags, release automation, or test/build configuration were present. The working tree was clean before this spec was created. Reinspect these facts before implementing.

Installer verification: explicit GitHub tree URLs must select the requested branch or tag. Verify the actual published CLI used for installation.

## Decisions and requirements

### D1–D2: Explicit, synchronized releases

- Prepare `v0.2.0` as the first release for this work. All plugin manifests use exactly `0.2.0`, without the current Codex timestamp suffix.
- Release identity is an immutable `vX.Y.Z` tag. If prereleases are supported, use SemVer prerelease tags and exclude them from stable/latest selection.
- A maintainer explicitly selects the version. Provide a local command to update all version-bearing manifests consistently, and a validation command usable locally and in CI.
- Pushing a release tag triggers validation followed by GitHub Release creation. Validate the tag against the committed manifest versions and relevant required checks before publication.
- Reject malformed versions and inconsistent release metadata clearly. Do not silently publish a different commit or rewrite an existing version tag.
- Automatic version inference from commit messages is out of scope. The version command updates files; documentation makes subsequent review, commit, tag, and push steps explicit.

### D6: Stable installation and updates

Use these public installation forms:

```sh
# Latest stable published release
npx skills@latest add https://github.com/ngthluu/my-dev-skills/tree/latest

# Immutable release
npx skills@latest add https://github.com/ngthluu/my-dev-skills/tree/v0.2.0
```

- `latest` is a release-managed branch pointing to the exact commit of the highest stable published version by SemVer ordering. It is not a version tag or the development branch.
- Advance it only after a stable release passes validation and is published. A prerelease, an older patch release, or a failed release must not move it backward or point it at unpublished work.
- Account for concurrent and retried workflow runs so they cannot regress the pointer. A partial publication failure must be visible and recoverable without moving immutable tags; document recovery.
- Missing refs and network/installer failures must be surfaced without a fallback to the development branch.
- README installation remains based on the skills CLI, including skill selection and project/global installation. Explain that `skills@latest` refers to the installer and `tree/latest` refers to this repository's stable release.
- Document reinstalling from latest to upgrade and from a specific tag to select or restore a release. Do not promise that the installer's generic update command preserves pins unless verified.
- The existing unqualified repository command can remain documented as development-branch installation; it must not be represented as stable-release selection.
- A command that queries GitHub Releases during every installation was rejected in favor of the simpler branch URL. No custom installer or separately published npm package is required.

### D3–D4, D7: Debug from symptom to verified fix

Add `skills/debug/SKILL.md` and matching agent metadata. The skill applies to reported bugs, failures, unexpected behavior, flaky behavior, and performance regressions. It operates in the current session without requiring a brainstorm spec.

Required workflow:

1. Inspect relevant repository instructions, context, recent changes, and the reported expected/actual behavior. Preserve unrelated work.
2. Build a specific feedback loop that exercises the reported symptom through a meaningful public boundary: a test, CLI invocation, HTTP request, browser flow, replay, or other suitable harness. Capture evidence that it can detect the actual problem; unrelated failures are not a valid reproduction.
3. Minimize and tighten reproduction where useful. Prefer fast, repeatable signals, but use repeated measurements and explicit reproduction rates or performance baselines when deterministic reproduction is inappropriate.
4. Investigate root cause before changing behavior. Trace relevant data and boundaries, compare working cases, and connect hypotheses to falsifiable predictions.
5. For ambiguous failures, present ranked hypotheses and test one variable at a time. Adapt effort to complexity; do not require 3–5 hypotheses or exhaustive minimization for an obvious, evidenced bug. Presenting hypotheses is a progress update, not a mandatory approval checkpoint.
6. Use targeted probes or tagged temporary instrumentation. After three failed fix attempts, reassess the root-cause model and architecture before further fixes; do not continue guessing or launch an unapproved redesign.
7. Write and observe a failing regression test before the fix when a meaningful seam exists. Apply the smallest supported fix, verify the test, rerun the original scenario, and run relevant neighboring checks.
8. Remove temporary instrumentation and disposable harnesses unless retained artifacts have an explicit purpose. Report the symptom, evidence, root cause, change, verification, and any remaining limits in chat.

When reproduction or access is missing, continue useful evidence gathering and label hypotheses as unconfirmed. Do not make a speculative fix. If blocked, state what was tried and request the specific missing input. If no meaningful automated regression seam exists, explain the limitation and use the strongest available observable verification; do not add a shallow test solely to claim coverage.

Handle sensitive captured material with redaction and avoid exposing secrets in commands or reports. Respect the user's authorized scope and environment rules for external mutations and production instrumentation.

Rejected alternatives: diagnosis-only handoff, mandatory spec creation, mandatory diagnosis documents, and rigid hypothesis/reproduction gates for every bug. The skill must be self-contained after installation; it must not require other skills to be installed or fetched at runtime.

### D5, D8: Standalone visual brainstorming

Enhance the existing visual-workspace instructions and ship a reusable HTML template plus examples inside `skills/brainstorm/`.

- Adopt focused screens, restrained typography and spacing, light/dark themes, selectable comparison cards, mockup components, and side-by-side visual comparisons. Use this repository's identity.
- A visual comparison normally presents 2–4 meaningful alternatives with stable decision IDs, consequences, and the recommendation indicated. Alternatives differ structurally when testing layout or behavior.
- Include keyboard-operable selections, visible focus, readable contrast, responsive layout, and labels that do not rely on color alone.
- Provide a copyable answer summary using the question/option IDs. Browser selections are local exploration; the user submits decisions in chat. Provide a readable/selectable summary even if clipboard access is unavailable under `file://`.
- Scale fidelity to the question. Use visuals when seeing layout, interactions, or spatial relationships helps; keep ordinary scope, tradeoff, and requirements questions in chat.
- Keep each generated workspace independently usable as a standalone HTML file with inline resources and no required network access. Do not add a server, framework, build step, CDN assets, analytics, or browser-event collection.
- Generated decision aids remain temporary and outside the project by default. Open with the available platform mechanism and report the absolute path; if opening is unavailable, provide the path and continue in chat.
- Preserve the existing stable question/decision IDs, synthetic prototype state, reset behavior where relevant, update-on-material-change practice, and final visual refresh when a workspace was used.
- Preserve chat as the discovery authority and Markdown as the durable spec. Capture validated visual conclusions in the spec. A durable generated HTML companion remains opt-in only when requested by the user.
- Keep the exhaustive decision rounds, final confirmation, and fresh-session implementation handoff intact.

Rejected alternative: a live server, automatic refresh, and recorded browser events. Supporting template generation may use small local tooling if justified, but must not introduce a runtime server or make the output depend on installed repository files.

### D9: Integration and delivery

- Update README skill descriptions, examples, invocation table, installation/version guidance, and contribution guidance for three skills across the four supported agents.
- Update plugin descriptions and appropriate interface/default-prompt metadata. Preserve existing plugin identity and discovery paths.
- Keep supporting skill references, templates, and examples within their owning skill directories so installation carries them along.
- Keep skill instructions and supporting assets self-contained. Preserve the repository's MIT license.
- Implement and validate release tooling and maintainer documentation. Actually committing, pushing, tagging, publishing `v0.2.0`, or modifying remote settings is a separate maintainer action, not authorized by this spec alone.

## Acceptance criteria and agreed public test seams

| ID | Observable outcome | Public seam and evidence |
| --- | --- | --- |
| AC1 | A maintainer can set a version and all plugin manifests agree; malformed input or inconsistent metadata fails clearly. | Invoke the version and validation commands against temporary repository fixtures; inspect resulting manifests, exit status, and diagnostics. |
| AC2 | A valid matching release tag reaches publication only after required validation; invalid or mismatched tags cannot publish. | Exercise release commands/workflow entry behavior with temporary Git repositories and a controlled publication boundary; inspect intended release tag/commit and call outcomes. Review workflow wiring. |
| AC3 | Latest points to the highest stable published release and cannot regress on an older release, prerelease, failure, retry, or concurrent run. | Temporary Git remotes and controlled release records through the release tooling's public command boundary; inspect the resulting branch commit. Cover retry/partial-failure recovery. |
| AC4 | Explicit-tag and latest installations select the intended repository contents and expose exactly three skills with their supporting assets. | Actual skills CLI installation in temporary project directories, using controlled refs where necessary; inspect installed files and provenance for each supported agent target. Exercise missing-ref behavior. |
| AC5 | Documentation gives usable stable, pinned, upgrade, and older-version installation flows without confusing installer and skill versions. | Follow documented commands in disposable projects; compare installed version/content and command results. Published remote examples receive a maintainer smoke test after the first release. |
| AC6 | Debug fixes an evidenced ordinary bug with a meaningful failing/passing regression signal and verifies the original symptom. | Scenario-based agent evaluation against a small buggy fixture; inspect command evidence, final behavior, diff, and report rather than checking for phrases in the skill text. |
| AC7 | Debug handles ambiguity, unavailable reproduction, flaky/performance behavior, and repeated failed fixes without speculative completion claims. | Scenario evaluations with explicit expected behavior for each condition; review hypothesis/probe evidence, measurements, reassessment, and precise blocked reports. |
| AC8 | Debug cleans temporary instrumentation and protects unrelated work and sensitive report content. | Seed a scenario fixture with unrelated changes and synthetic sensitive values; inspect the final diff, artifacts, and report. Use synthetic data only. |
| AC9 | A generated HTML aid opens offline, presents focused alternatives, supports keyboard selection and answer summaries, and remains usable on narrow screens and in light/dark themes. | Open generated examples under `file://`; automate interactions through the DOM/browser boundary and inspect network behavior. Manually inspect representative desktop/mobile and light/dark views. Exercise clipboard-unavailable fallback. |
| AC10 | Brainstorm keeps visual choices advisory until supplied in chat and records confirmed conclusions in its canonical spec. | Scenario review of skill instructions and a representative brainstorm flow using the template; inspect chat-to-spec traceability and temporary artifact placement. |
| AC11 | README and agent/plugin metadata consistently describe three discoverable skills without broken packaged references. | Skills CLI discovery/installation and installed-file checks for Claude Code, Codex, Cursor, and OpenCode; parse metadata and resolve relative references. |

Use behavior-focused tests at these seams, not tests that merely mirror source text or private implementation. A lightweight test harness is appropriate because the repository currently has none. Choose its language and file organization during implementation; no particular testing framework was approved or required.

Report installation/discovery evidence separately from actual agent-runtime evaluations. If an agent application, browser runner, credential, or remote publication environment is unavailable, state precisely what was exercised and what remains a manual check. Do not claim a mocked publication or static skill review proves a live release or agent behavior.

## Likely affected areas and constraints

- `README.md`, the three `.*/plugin.json` manifests, and existing skill agent metadata as needed.
- New `skills/debug/` instructions, agent metadata, and only useful supporting references.
- `skills/brainstorm/SKILL.md`, its visual reference, and new packaged templates/examples.
- New release/version scripts, GitHub Actions configuration, tests/fixtures, and concise maintainer documentation.
- `opencode.json` only if discovery verification demonstrates a necessary change.

Retain compatibility with the documented Node/Git installer requirements unless investigation proves a correction necessary. Preserve the existing four-agent scope. Cross-platform installation must not gain an unnecessary shell-specific wrapper. Do not expand into new agents, a marketplace service, automatic skill updates, production UI implementation, or unrelated implement-skill changes.

## Rollout, risks, and deferred details

- Prepare matching `0.2.0` manifests and tooling locally. The maintainer reviews and commits, creates/pushes the release tag, then verifies GitHub Release creation, latest advancement, and both documented remote install commands.
- Before the first publication, `tree/v0.2.0` and `tree/latest` may not exist remotely. Validate with controlled refs and explicitly leave the real remote smoke test for publication; do not silently publish to satisfy it.
- Existing installations remain as installed until users reinstall. Removing the committed Codex timestamp suffix establishes synchronized release metadata; investigate cache behavior and document any necessary supported refresh procedure without adding divergent release versions.
- Release automation needs repository write capability for releases and the latest branch. Document required workflow permissions and any branch-protection interaction; remote configuration is a maintainer prerequisite.
- Latest-branch updates and GitHub Release creation are separate operations. Failure recovery, concurrency control, and explicit job diagnostics are required, but their implementation mechanism is deferred to the implementing agent.
- Installer behavior can change. Recheck the published CLI during implementation while preserving the approved behavior.
- Skill behavior is partly model-dependent. Scenario evidence is necessary; metadata checks alone are insufficient. Exact scenario fixtures, test runner, script names, release-note format, and HTML component internals are implementation choices.
- No unresolved product decision blocks implementation. Reopen discovery only if workspace evidence contradicts an approved requirement or requires a material scope change.

## Fresh-session handoff

Read this whole spec, inspect the current workspace and repository instructions, and invoke `$implement` with this path. Treat the acceptance criteria and public test seams as the implementation contract. Preserve unrelated work and distinguish local verification from checks that require a published release or unavailable agent runtime.

```text
Use $implement with docs/specs/2026-09-10-versioning-debug-and-brainstorm-visuals.md.
```
