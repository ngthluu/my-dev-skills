---
name: implement
description: Implement a requested change or completed spec with test-driven development and independent code review.
disable-model-invocation: true
metadata:
  opencode/autoinvoke: "false"
---

# Implement

Deliver the requested change or supplied spec completely. Follow repository instructions and preserve unrelated user changes.

## Working rules

- The main agent establishes the contract, plans behavior slices, implements core behavior, integrates changes, and verifies the result itself.
- Use subagents only when useful, available, and permitted for bounded lookup, isolated auxiliary edits, extra checks, or read-only review.
- Keep product decisions, architecture, and acceptance of results with the main agent. Handle small tasks directly.
- Give agents the contract, relevant rules, baseline, evidence, and explicit file ownership. Reuse them with updated context.
- Parallelize independent side tasks. Serialize writers unless files and dependencies are disjoint. Prohibit further delegation.
- Require concise findings, changed files, commands, outcomes, and uncertainties. Verify results and keep raw reports out of chat.

## Step 1: Establish the contract

- Read the entire supplied spec and its required artifacts yourself. Otherwise use the current request as the contract.
- Identify observable acceptance criteria and public test seams. Ask only about unresolved material product decisions.
- Inspect repository rules, relevant code, prior decisions, and verification commands yourself before editing.
- Resolve material unknowns through inspection and primary-source research. Check dates, retain links, and distinguish assumptions.
- Reconcile evidence and record the starting Git ref, status, and relevant diff before mutations. Keep the agreed scope.

## Step 2: Plan behavior slices

- Decide boundaries, dependencies, and risks yourself. Use focused side investigations when useful and verify their evidence.
- Divide work into small vertical slices, each delivering one observable behavior at an agreed public seam.

## Step 3: Implement with red and green tests

- Implement core behavior slices yourself. Delegate only isolated auxiliary edits with clear criteria, public seams, and file ownership.
- Auxiliary writers inspect the relevant source themselves before editing.
- Follow this TDD cycle for behavioral changes, including delegated edits. Inspect red/green evidence and integrate before dependent work.

1. Write one behavior-focused test through the agreed public seam.
2. Run it and observe failure from missing behavior. Setup, fixture, and syntax errors do not count as red.
3. Make the smallest implementation that passes, without anticipating later slices.
4. Run the focused test and neighboring tests green. Refactor while tests stay green.
5. Repeat for the next behavior instead of writing a batch of tests ahead of implementation.

- Assert outcomes through the real public path using expected values from requirements, known literals, or worked examples.
- Do not mirror the production algorithm, mock the behavior under test, or weaken a correct test to pass.
- Avoid private-method tests, internal mocks, tautologies, conditional assertions, and checks that only assert no crash.
- Add a contrasting or boundary case when one example permits constant output, a hard-coded special case, or ignored input.
- Repair tests that pass without the behavior. Observe a valid red state before continuing that slice.

## Step 4: Verify the implementation

- Run focused tests and available typechecking during implementation.
- After integration, run defined formatting, lint, typechecking, the full relevant test suite, and build. Resolve failures.
- Extra checks may be side tasks. Run decisive acceptance checks yourself and inspect commands, outcomes, and failure evidence.

## Step 5: Review independently

- Compare changes with the recorded baseline. Investigate an unexpected empty diff.
- When delegation is available and permitted, give two reviewers the contract, rules, baseline, diff, changed files, and verification evidence.
- Use reviewers who did not implement the changes. Run read-only reviews in parallel, without further delegation.
- If delegation is unavailable or prohibited, review the two axes separately yourself and disclose the limitation.
- **Requirements:** check missing criteria, incorrect behavior, unsupported scope, and evidence at each public test seam.
- **Code:** check correctness, maintainability, security, concurrency, errors, conventions, and test quality.
- Check that tests catch plausible violations. Flag mirrored algorithms, internal mocks, bypassed seams, and overfit fixtures.
- Separate rule violations from judgment calls. Skip issues conclusively enforced by passing tools.
- Review implementation changes, mentioning relevant pre-existing issues separately. Keep reports and unverifiable items explicit.

```text
Axis: Requirements | Code
Verdict: Approve | Findings | Blocked
Findings:
- Critical | Important | Minor: file:line — violated requirement/rule; impact; concrete fix
Could not verify: ...
```

## Step 6: Resolve review findings

- Verify each finding against the contract and code. Fix every valid in-scope issue.
- Handle core fixes yourself and auxiliary fixes with their original writer.
- Rerun affected checks and give original reviewers the fix diff and evidence. Recheck open findings and new problems from fixes.
- Repeat both full reviews when fixes materially change behavior or design.
- Continue until both axes approve without material findings or a concrete external blocker prevents completion.

## Step 7: Finish

- Ensure final verification covers all review fixes. Reuse current passing evidence when no relevant change followed it.
- Correct a supplied spec only for necessary factual corrections or approved decisions, preserving its intent.
- Do not commit, push, open a pull request, deploy, or publish unless requested.
- Report the outcome concisely:

```text
Changed: <files and acceptance criteria>
Checks: <commands and outcomes, including red/green evidence>
Review: <requirements verdict; code verdict; fixes>
Limitations or blockers: <unverified items or required input>
```
