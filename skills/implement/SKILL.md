---
name: implement
description: Implement a requested change or completed spec with test-driven development, delegated implementation slices, and independent code review.
---

# Implement

Deliver the user's request completely. Treat the current request and any supplied spec or requirements document as the contract. Preserve unrelated user changes and follow repository instructions such as `AGENTS.md`, `CONTRIBUTING.md`, ADRs, and documented coding standards.

## Establish the contract and baseline

Read the entire supplied spec or requirements document and every artifact it directly requires. When none was supplied, use the current request as the requirements source. Inspect the relevant code before editing.

Establish observable acceptance criteria and public test seams from the requirements source. Resolve missing facts yourself. Ask the user only about an unresolved product decision that would materially change the result. Do not silently expand the scope.

Record the starting Git ref, status, and existing diff so implementation changes can be distinguished from pre-existing work. Identify the repository's test, typecheck, lint, build, and formatting commands from its own configuration.

Break the work into small vertical slices. Each slice should produce one observable behavior at an agreed seam.

## Implement with TDD

For each slice, follow a red → green cycle:

1. Write one behavior-focused test through the agreed public seam.
2. Run that focused test and confirm it fails for the expected missing behavior. A syntax, fixture, or environment failure is not a valid red state.
3. Write the smallest implementation that makes the test pass. Do not anticipate later slices.
4. Run the focused test again, then relevant neighboring tests.
5. Continue with the next behavior. Refactor only while the suite stays green.

Tests should survive internal refactoring. Avoid private-method tests, mocks of internal collaborators, tautological expectations, and large batches of tests written ahead of their implementations. Use a known literal, worked example, or the requirements source as the independent source of expected values.

A green test is meaningful only when it would detect missing or wrong behavior. Its setup must reach the real public path, its assertions must observe the promised outcome, and its expected values must not be copied from or recomputed with the production algorithm. Do not mock the behavior being implemented, hide assertions behind conditionals, accept merely non-crashing execution, or weaken a correct test to accommodate the implementation. When one example could pass through a constant, hard-coded special case, or ignored input, add the smallest contrasting or boundary example that rules that out. If a test passed before the behavior existed, or would remain green with the relevant production change removed, it is not evidence for the slice; correct it and observe a valid red state before continuing.

When subagents are available and repository policy permits them, delegate each coherent behavior slice with its TDD implementation work. Implement small, straightforward changes directly when handoff overhead outweighs the benefit. Give each implementer the requirements source, one slice, its acceptance criterion and seam, relevant repository instructions, and explicit file ownership. Have the subagent inspect the source itself and return the red and green test evidence. Run mutating subagents sequentially unless their file ownership and dependencies are demonstrably disjoint; parallel work must never edit overlapping files. The parent agent remains responsible for inspecting and integrating every result and for final verification. If subagents are unavailable or delegation is prohibited, perform the same loop directly.

Run typechecking and focused tests throughout. Once all slices are green, run formatting or lint checks, typechecking, the full relevant test suite, and the build when the project defines them.

## Review on two independent axes

Determine the implementation diff from the recorded baseline. If it is empty, investigate before claiming completion.

Give each reviewer the requirements source, baseline and implementation diff, relevant repository instructions, changed-file list, and red/green plus verification evidence available so far. Use separate reviewers who did not implement the changes under review. Reviewers must inspect independently and read-only: they do not edit the work or delegate parts of their review.

When subagents are available and repository policy permits them, launch these two read-only reviewers in parallel so one review does not bias the other:

- **Requirements reviewer:** compare the diff and tests with the user request and any supplied spec. Report missing or partial requirements, incorrect behavior, unsupported scope, and weak or absent evidence for acceptance criteria. Check that each test reaches the agreed seam and would detect a plausible implementation that violates the requirement. Cite the requirement and code locations.
- **Code reviewer:** compare the diff with repository instructions and conventions. Report concrete correctness, maintainability, security, concurrency, error-handling, and test-quality problems, including tests that mirror the implementation, mock the subject under test, bypass the public path, or overfit one fixture. Distinguish documented violations from judgment calls and skip issues enforced conclusively by passing tools.

If subagents are unavailable or delegation is prohibited, perform the two reviews separately in the main session. Review only implementation changes; mention relevant pre-existing problems separately without taking ownership of them.

Each reviewer returns its own verdict and findings grouped as critical, important, or minor. Every finding must cite a file and line, the violated requirement or rule, why it matters, and a concrete fix when non-obvious. Reviewers list anything they could not verify rather than treating absence of evidence as approval.

Keep the two reports separate so one axis cannot mask the other. Verify each finding against the requirements, evidence, and code; fix every valid in-scope issue and rerun affected focused checks. Return valid findings to the original implementer when available; otherwise apply the fixes directly. Reuse the original reviewers for fix rounds when available rather than spawning an agent per finding. For each fix round, re-review every open finding against the fix diff and check that the fix introduced no new material problem. Repeat the full two-axis review only when fixes materially change behavior or design. Stop when both axes approve with no material finding left, or when a concrete external blocker prevents completion.

## Finish

Run the final relevant verification suite after review fixes. Update a supplied requirements document only when implementation reveals a necessary factual correction or an explicitly approved decision; preserve its original intent.

Report:

- what changed and which acceptance criteria it satisfies;
- tests and checks run, with their outcomes;
- the requirements and code review verdicts and fixes made;
- any remaining limitations or blockers;
- the files changed.

Do not commit, push, open a pull request, deploy, or publish unless the user requested that action.
