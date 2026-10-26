import json
import subprocess
import sys
from pathlib import Path

import pytest

script = Path(__file__).resolve().parent.parent / "skills/brainstorm/scripts/ledger.py"


@pytest.fixture
def run(tmp_path):
    def run(*args):
        return subprocess.run([sys.executable, script, tmp_path, *args], capture_output=True, text=True)

    run.folder = tmp_path
    return run


def test_ledger_picks_the_eligible_question_that_unlocks_the_most_decisions(run):
    run("init")
    run("add", "Q1", "--question", "Color?", "--minor")
    run("add", "Q2", "--question", "Storage?")
    run("add", "Q3", "--question", "Schema?", "--prereq", "Q2")
    assert run("next").stdout.startswith("Q2 ")
    run("set", "Q2", "--status", "settled", "--answer", "SQLite", "--source", "user reply")
    assert run("next").stdout.startswith("Q3 ")


def test_ledger_rejects_unsupported_status_changes_and_keeps_the_file_unchanged(run):
    run("init")
    run("add", "Q1", "--question", "Storage?")
    assert run("set", "Q1", "--status", "settled", "--answer", "SQLite").returncode == 1
    assert run("set", "Q1", "--status", "deferred").returncode == 1
    assert json.loads((run.folder / "ledger.json").read_text())["questions"][0]["status"] == "open"
    run("set", "Q1", "--status", "settled", "--answer", "SQLite", "--source", "user reply")
    assert run("set", "Q1", "--status", "open").returncode == 1, "reopening needs a reason"


def test_ledger_audit_fails_until_every_material_decision_is_settled_or_deferred(run):
    run("init")
    run("add", "Q1", "--question", "Storage?")
    run("add", "Q2", "--question", "Color?", "--minor")
    failed = run("audit")
    assert failed.returncode == 1
    assert "Q1 is open" in failed.stderr
    assert "Q2" not in failed.stderr
    run("set", "Q1", "--status", "deferred", "--reason", "user postponed")
    assert run("audit").returncode == 0
