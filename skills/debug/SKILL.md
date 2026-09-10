---
name: debug
description: Investigate and fix reported bugs, failures, unexpected behavior, flaky behavior, and performance regressions using observable evidence and regression checks.
---

# Debug

Take the reported symptom through diagnosis to a verified fix in the current session. No brainstorm spec or separate diagnosis document is required. Keep effort proportional to the uncertainty: an obvious, evidenced bug needs a short loop; an ambiguous failure needs discriminating experiments.

## Establish a useful signal

Read relevant repository instructions, context, ADRs, recent changes, and the expected versus actual behavior. Record the starting Git status and relevant diff so unrelated work survives your edits and cleanup.

Exercise the symptom through a meaningful public boundary: a test, CLI command, HTTP request, browser flow, replay, or focused harness. Run it and capture what demonstrates this particular failure. An unrelated setup error or a test that merely runs without crashing does not reproduce the report. Compare a working case when useful. Reduce inputs and setup only while preserving the failing signal; exhaustive minimization is unnecessary when the cause is already evidenced.

For flaky behavior, repeat the trigger and report failures out of attempts, keeping relevant timing, random seeds, and environment conditions explicit. Controlled scheduling or stress can strengthen a weak signal. For performance regressions, record comparable repeated baseline measurements before editing, including workload, measurement boundary, and variation; use profiling or scaling comparisons to localize the cost. A single fast run is insufficient evidence.

If reproduction or access is unavailable, continue useful local investigation and distinguish observed facts from unconfirmed hypotheses. Do not change behavior on speculation. When progress needs external input, state what you tried and request the specific missing access, redacted capture, or reproduction detail. Do not claim the issue is fixed because a different local scenario succeeds.

## Diagnose before changing behavior

Trace the failing value through the relevant callers and system boundaries to its origin. Compare working inputs, configuration, and recent changes. Tie the proposed cause to a falsifiable prediction and test that prediction.

For ambiguous failures, share ranked hypotheses with the evidence for each and a probe that distinguishes them. This is a progress update, not an approval checkpoint. Test one variable at a time; update the ranking from results. Do not invent a quota of hypotheses for an obvious bug.

Prefer targeted inspection, a debugger, or small probes over broad logging. Tag temporary instrumentation with a unique marker and track disposable files for cleanup. Inspect only needed fields in captured material; redact secrets before displaying command output, artifacts, or reports. Keep credentials in the environment rather than command arguments and avoid environment dumps. External mutations and production instrumentation must remain within the user's authorization and environment rules.

Count failed fix attempts, including relevant attempts reported earlier. After three failures, stop patching and reassess the root-cause model and architecture: shared state, ownership, coupling, and invalid assumptions may explain why local fixes failed. Explain what the failures rule out, gather new discriminating evidence, and only resume fixes on a supported model. Do not turn reassessment into an unapproved redesign.

## Fix, verify, and clean up

When a meaningful automated seam exists, write a regression test that exercises the actual bug pattern and observe it fail for the reported reason before applying the fix. A multi-caller or cross-boundary bug needs a test that reaches that interaction. Then make the smallest evidence-supported change, run the regression test again, rerun the original unminimized scenario, and run relevant neighboring checks. Investigate any failed verification before claiming success.

If no meaningful automated seam exists, explain why and use the strongest available observable verification. Do not add a shallow test just to claim coverage. For flaky or performance fixes, repeat comparable measurements after the change and report the bounded evidence; finite successful runs do not prove universal absence of a race.

Remove your temporary instrumentation and disposable harnesses. Retain a harness only when it has an explicit ongoing purpose, such as a regression or benchmark, and identify that purpose. Inspect the final diff and untracked files against the starting state; preserve unrelated changes and user-owned artifacts.

Report the symptom, reproduction evidence, root cause, change, verification commands and outcomes, and remaining limits in chat. State blocked or unconfirmed results precisely. Committing, publishing, or creating a diagnosis document is not required by this skill.
