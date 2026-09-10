# Debug agent scenarios

These are behavioral evaluation fixtures, not a text-matching test of the skill.
They use Python's standard library and synthetic data only. Run from the repository:

```sh
python3 tests/debug/scenarios.py ordinary /tmp/debug-ordinary-unique
```

Repeat with `ambiguous`, `unavailable`, `flaky`, `performance`, and `repeated`, using a
new destination for every run. The command initializes a disposable Git repository
with an unrelated uncommitted note, then prints the task and absolute workspace.

Give an independent agent the printed request, the workspace path, and the absolute
path to `skills/debug/SKILL.md`. Tell it to run commands only in that workspace and
to use `python3` when `python` is unavailable. Do not give it the fixture source,
expected cause, proposed fix, or the evaluator checks in `scenarios.py`. Capture the
actual tool transcript and final report outside the fixture. Avoid dumping private
fixture fields into the transcript.

Review the scenario's `checks` in `scenarios.py` against the command chronology,
observed outputs, final Git diff, retained tests, and report. Execute the original
command independently. Check `NOTES.md` and `diagnostics.json` against the seeded
contents, and inspect untracked artifacts and temporary instrumentation. For
ordinary pagination, also check pages 1 and 3 at size 2. Report each criterion as
pass, fail, or unobserved, with command/evidence references. A fixture setup smoke
test does not count as an agent evaluation; a passing final result alone does not
prove the regression test ran red before the fix. Record runtime/model, date, any
missing tools, and which scenarios were actually exercised. Do not infer support
for all four agent applications from one runtime.
