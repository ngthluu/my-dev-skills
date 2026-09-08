---
name: implement
description: Implement a completed spec with test-driven development, delegated implementation slices, and independent code review. Use when the user supplies a spec produced by brainstorm or another implementation-ready requirements document.
---

# Implement

Deliver the supplied spec completely. Use its acceptance criteria and agreed public test seams as the contract. Preserve unrelated user changes and follow repository instructions such as `AGENTS.md`, `CONTRIBUTING.md`, ADRs, and documented coding standards.

## Establish the contract and baseline

Read the entire spec and every artifact it directly requires. Inspect the relevant code before editing. If no spec path was supplied, look for a single clearly relevant file under `docs/specs/`; ask the user only when no safe choice exists.

Check that the spec defines observable acceptance criteria and test seams. Resolve missing facts yourself. Ask the user only about an unresolved product decision that would materially change the result. Do not silently expand the scope.

Record the starting Git ref, status, and existing diff so implementation changes can be distinguished from pre-existing work. Identify the repository's test, typecheck, lint, build, and formatting commands from its own configuration.

Break the spec into small vertical slices. Each slice should produce one observable behavior at an agreed seam.

## Implement with TDD

For each slice, follow a red → green cycle:

1. Write one behavior-focused test through the agreed public seam.
2. Run that focused test and confirm it fails for the expected missing behavior. A syntax, fixture, or environment failure is not a valid red state.
3. Write the smallest implementation that makes the test pass. Do not anticipate later slices.
4. Run the focused test again, then relevant neighboring tests.
5. Continue with the next behavior. Refactor only while the suite stays green.

Tests should survive internal refactoring. Avoid private-method tests, mocks of internal collaborators, tautological expectations, and large batches of tests written ahead of their implementations. Use a known literal, worked example, or the spec as the independent source of expected values.

When subagents are available and repository policy permits them, delegate TDD implementation work. Give each implementer the spec path, one slice, its acceptance criterion and seam, relevant repository instructions, and explicit file ownership. Have the subagent inspect the source itself and return the red and green test evidence. Run mutating subagents sequentially unless their file ownership and dependencies are demonstrably disjoint; parallel work must never edit overlapping files. The parent agent remains responsible for inspecting and integrating every result. If subagents are unavailable, perform the same loop directly.

Run typechecking and focused tests throughout. Once all slices are green, run formatting or lint checks, typechecking, the full relevant test suite, and the build when the project defines them.

## Review on two independent axes

Determine the implementation diff from the recorded baseline. If it is empty, investigate before claiming completion.

When subagents are available, launch these two read-only reviewers in parallel so one review does not bias the other:

- **Spec reviewer:** compare the diff and tests with the full spec. Report missing or partial requirements, incorrect behavior, unsupported scope, and weak or absent evidence for acceptance criteria. Cite spec sections and code locations.
- **Code reviewer:** compare the diff with repository instructions and conventions. Report concrete correctness, maintainability, security, concurrency, error-handling, and test-quality problems. Distinguish documented violations from judgment calls and skip issues enforced conclusively by passing tools.

If subagents are unavailable, perform the two reviews separately in the main session. Review only implementation changes; mention relevant pre-existing problems separately without taking ownership of them.

Aggregate findings without allowing one axis to mask the other. Verify each finding against the code, fix every valid in-scope issue, and rerun affected focused checks. Repeat the two-axis review when fixes materially change behavior or design. Stop when no material in-scope findings remain or when a concrete external blocker prevents completion.

## Finish

Run the final relevant verification suite after review fixes. Update the spec only when implementation reveals a necessary factual correction or an explicitly approved decision; preserve its original intent.

Report:

- what changed and which acceptance criteria it satisfies;
- tests and checks run, with their outcomes;
- the two review results and fixes made;
- any remaining limitations or blockers;
- the files changed.

Do not commit, push, open a pull request, deploy, or publish unless the user requested that action.
