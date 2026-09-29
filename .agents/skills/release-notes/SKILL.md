---
name: release-notes
description: Draft and maintain this repository's changelog and reviewed GitHub release notes from verified changes. Use when preparing or correcting release prose, not for publishing a release.
---

# Release notes

Work in the current repository. Read its release guide, existing `CHANGELOG.md`, and recent release notes before editing. This skill writes release prose; it does not choose a version, tag, commit, push, or publish unless the user separately requests those actions.

## Establish the release scope

- Determine the requested version and source range. Use the previous applicable release tag as the base when preparing a version; for ongoing maintenance, use changes since that tag and keep them under `Unreleased` until a version is chosen. Ask only if the version or base is genuinely ambiguous.
- Inspect Git status, tags, the commit diff, merged work, and relevant documentation. Preserve unrelated edits. Treat commit subjects and PR descriptions as leads, then verify user-visible claims against the actual change.
- Include only shipped behavior. Distinguish completed work from plans, partial implementation, internal refactors, and changes that require a platform or configuration qualifier. Do not invent a fix, security impact, migration, compatibility claim, or test result.

## Maintain the changelog

- Keep `CHANGELOG.md` in reverse version order with `## Unreleased` at the top and `## [X.Y.Z]` headings for releases. Keep previous entries intact except for a factual correction the user requested.
- Write concise bullets describing the user effect. Combine related changes, mention affected platforms when relevant, and surface breaking changes or actions users must take. Avoid raw commit lists, implementation trivia, private issue text, real user data, and local paths.
- When preparing a version, move applicable verified `Unreleased` entries into its section, reconcile against the full release diff, and leave any still unreleased work under `Unreleased`. Do not duplicate entries. Keep the version consistent with the repository's release metadata.

## Prepare GitHub notes

- Write the exact publication body to `docs/release-notes/vX.Y.Z.md` before the release tag is created. Start with `# X.Y.Z`, then `Released: YYYY-MM-DD` only when the publication date is known; if it may slip, update it before tagging.
- Group notable changes under `## Features`, `## Improvements`, and `## Fixes` in that order, omitting empty groups. Add `## Security`, `## Upgrade notes`, and `## Known issues` only when verified content applies. State required user actions prominently. Avoid empty headings and placeholders.
- Keep the GitHub body aligned with the changelog and tagged source. Confirm every claim and link; report unresolved evidence rather than presenting a guess as fact. Review the final rendered Markdown and report the source range, files changed, and any claims needing human confirmation.
- The release command uses the note file committed at the tag. Existing historical tags without a note file retain GitHub generated notes. Editing a note after tagging does not change an immutable release; prepare a corrected release version or get an explicit publication correction request.
