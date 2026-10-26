# Spec template

Write the handoff spec as `.my-dev-skills/yyyy-mm-dd-<slug>/README.md` with this structure. Replace each placeholder and omit empty sections.

```markdown
# <task title>

Implement this in the current workspace. It holds all agreed context. Verify code references before editing.

## Goal
<what to build or change, why, and who benefits, in one or two sentences>

## Current state
<how it works today, with file:line references and evidence>

## What to build
<requirements: behavior, flows, data shapes, edge cases, failure behavior>

## Decisions
<settled decisions with rationale and rejected alternatives. Do not reopen them.>

## Out of scope
<non-goals and areas not to touch>

## Where to change
<files, entry points, and existing helpers, patterns, and conventions to follow>

## Acceptance criteria and public test seams
| ID | Criterion | Public seam and observation |
| --- | --- | --- |
| AC1 | <observable outcome> | <public boundary and what to observe> |

## Suggested slices
1. <first behavior slice in dependency order> (AC1)

## Verification
<test, typecheck, lint, and build commands, test locations, and a test to copy>

## Constraints and risks
<constraints, compatibility, migration, rollout, assumptions, deferred items with defaults, risks>
```
