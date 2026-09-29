---
name: debug
description: Investigate and fix reported bugs, failures, unexpected behavior, flaky behavior, and performance regressions using observable evidence and regression checks.
disable-model-invocation: true
metadata:
  opencode/autoinvoke: "false"
---

# Debug

Take the reported symptom through diagnosis to a verified fix in this session. Match effort to uncertainty. No brainstorm spec or diagnosis document is required.

## Working rules

- The main agent owns user questions, evidence, cause decisions, integration, and verification.
- Delegate the stages below when available and permitted. Otherwise work directly. Handle trivial tasks directly.
- Give agents current evidence, rules, and explicit file or environment ownership. Reuse them with updated context.
- Parallelize independent inspection. Serialize writes and probes unless files, dependencies, and environments are isolated.
- Prevent probes from altering each other's signal or competing for measurement resources.
- Verify returned evidence, actions, and uncertainties. Present useful conclusions, keeping raw reports out of chat.

## Step 1: Inspect the report

- Delegate inspection of repository instructions, relevant code, ADRs, recent changes, and expected versus actual behavior.
- Research material unknowns using reliable primary sources. Check dates and applicability, retaining links.
- Capture the starting Git ref, status, and relevant diff. Reconcile findings and preserve unrelated user changes.

## Step 2: Reproduce the signal

- Delegate reproduction at a meaningful public boundary: test, CLI, HTTP request, browser flow, replay, or focused harness.
- Capture the specific failure and a working comparison when useful. Unrelated setup errors or non-crashing runs are not reproduction.
- Reduce inputs while preserving the signal. Stop minimization once the cause is evidenced.
- For flakes, repeat triggers and record failures/attempts, timing, seeds, and environment. Use controlled scheduling or stress if useful.
- For performance, record repeated comparable baselines before edits: workload, measurement boundary, and variation.
- Profile or compare scaling to locate cost. One fast run is insufficient evidence.
- If reproduction or access is missing, investigate locally and distinguish facts from hypotheses. Do not patch on speculation.
- When blocked, report attempts and request specific missing access, reproduction details, or a redacted capture.
- Success in another scenario does not verify the reported failure.

## Step 3: Diagnose the cause

- Delegate independent hypotheses and tracing across callers and system boundaries. Compare working inputs, configuration, and changes.
- Test a falsifiable cause prediction with a distinguishing probe, varying one factor at a time.
- Reconcile evidence and rank hypotheses after each probe. An obvious bug does not require a hypothesis quota.
- When uncertain, share this update without turning it into an approval checkpoint:

```text
Evidence: <observed failure and working comparison>
Hypotheses, ranked: <cause → support or conflict>
Next probe: <prediction and distinguishing command>
```

- Prefer targeted probes to broad logs. Mark temporary instrumentation uniquely and track disposable files.
- Inspect only needed fields, redact secrets, and keep credentials in the environment rather than command arguments.
- Avoid environment dumps. Follow environment authorization rules for external mutations and production instrumentation.
- After three relevant failed fixes, including prior attempts, stop patching and reassess shared state, ownership, coupling, and assumptions.
- Explain what failures rule out. Gather new distinguishing evidence before another fix. Do not begin an unapproved redesign.

## Step 4: Fix the supported cause

- Delegate regression and fix together after evidence supports the cause, supplying reproduction, rules, criteria, and file ownership.
- Write a regression for the actual bug pattern at a meaningful automated seam. Observe failure for the reported reason before the fix.
- Exercise the interaction for cross-boundary or multi-caller bugs. Make the smallest evidence-supported change.
- If no meaningful automated seam exists, explain why and use the strongest observable check. Avoid coverage-only tests.
- Inspect and integrate the result with regression red/green and original reproduction evidence.

## Step 5: Verify the fix

- Run the regression green, original unminimized scenario, and relevant neighboring checks. Investigate failures.
- Delegate checks when useful, specifying the current revision and environment. Inspect evidence before claiming success.
- Repeat comparable flaky/performance measurements. Report bounded results: finite successful runs cannot prove a race absent.

## Step 6: Review independently

- If no behavior changed, skip fix review and report whether the symptom was reproduced, resolved without edits, unconfirmed, or blocked.
- Give two independent reviewers the report, reproduction, cause evidence, baseline, fix diff, rules, and verification.
- Use reviewers who did not implement the fix. Run read-only reviews in parallel without further delegation.
- If delegation is unavailable or prohibited, review each axis yourself and disclose the limitation.
- **Cause and regression:** check cause evidence, test seam, detection of the bug or a plausible equivalent, and original reproduction.
- **Code:** check correctness, maintainability, security, concurrency, errors, compatibility, unintended behavior, and repository rules.
- Distinguish rule violations from judgment calls. Exclude unrelated pre-existing issues.
- Keep separate verdicts (`Approve`, `Findings`, `Blocked`), unverifiable items, and findings graded critical, important, or minor.
- Each finding needs file:line, conflicting evidence or rule, impact, and a concrete fix when needed.

## Step 7: Resolve review findings

- Verify findings against evidence and code. Fix valid in-scope issues, reusing the original implementer and reviewers.
- Rerun affected regression and original reproduction. Recheck every open finding and new problems introduced by fixes.
- Repeat full reviews when cause, behavior, or design changes materially.
- Continue until both axes approve without material findings or a concrete external blocker prevents completion.

## Step 8: Clean up and report

- Delegate an audit of temporary instrumentation, disposable harnesses, final diff, and untracked files against the baseline.
- Remove temporary artifacts while preserving user files. Retain harnesses only for explicit regression or benchmark purposes.
- Verify cleanup and ensure final checks cover review fixes. Reuse current passing evidence if no relevant change followed it.
- Report in chat without requiring a commit, publication, or diagnosis document:

```text
Symptom and reproduction: <command and observed result>
Root cause: <evidence, or unconfirmed>
Change: <fix and regression, or none>
Reviews: <cause/regression verdict; code verdict; fixes>
Verification: <commands, outcomes, original scenario>
Limits or blocker: <remaining uncertainty or required input>
```
