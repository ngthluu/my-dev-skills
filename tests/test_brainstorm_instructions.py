import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
skill = (root / "skills/brainstorm/SKILL.md").read_text()
readme = (root / "README.md").read_text()
spec_template = (root / "skills/brainstorm/references/spec-template.md").read_text()


def bullets(text):
    return [line for line in re.sub(r"```[\s\S]*?```", "", text).split("\n") if line.startswith("- ")]


def test_brainstorm_presents_a_short_ordered_workflow_with_copyable_handoff_artifacts():
    steps = re.findall(r"^## Step (\d+): (.+)$", skill, re.M)
    templates = re.findall(r"```(?:text|markdown)\n([\s\S]*?)\n```", skill)
    instructions = bullets(skill)

    assert len(steps) >= 5, "workflow needs step-by-step headings"
    assert [int(number) for number, _ in steps] == list(range(1, len(steps) + 1))
    assert len(instructions) >= 5, "instructions should sit below the steps as bullets"
    assert all(len(line) <= 150 and ";" not in line for line in instructions), \
        "keep bullets short without semicolon-linked clauses"
    fields = [r"ledger\.py|^L ", r"--question", r"--prereq", r"--impact", r"--status",
              r"--answer", r"--source", r"--reason", r"\bnext\b", r"\baudit\b"]
    assert any(all(re.search(field, template, re.M) for field in fields) for template in templates), \
        "copyable ledger script usage"
    handoff = spec_template
    assert re.search(r"## Goal", handoff)
    for section in ["current state", "where to change", "verification", "decisions", "requirements",
                    "acceptance criteria", "test seams", "risks"]:
        assert re.search(section, handoff, re.I), f"copyable handoff spec template: {section}"
    assert not re.search(r", and handoff|Use \$implement with|^- (?:Status|Date):", handoff, re.M)
    assert re.search(r"Reply with only the spec path: `\.my-dev-skills/yyyy-mm-dd-<slug>/README\.md`", skill)
    assert not re.search(r"Use \$implement", skill)
    assert len(skill.split()) < 1126, "shorter than the original skill"


def test_brainstorm_retains_decision_reconciliation_and_one_question_selection():
    for pattern in [
        r"dependency graph", r"stable ID", r"settled.*open.*blocked.*deferred.*contradicted",
        r"(?:whole|entire|all).*(?:latest message|new evidence)", r"(?:several|multiple).*(?:decision|node)",
        r"(?:partial|ambiguous)", r"contradict", r"prerequisites", r"(?:impact|unlock)", r"tie.*stable ID",
        r"(?:exactly|only) one.*(?:open|eligible|question)", r"(?:dedicated|host).*question tool",
        r"(?:unavailable|restricted|unsuitable)", r"plain chat question", r"final response", r"wait for.*answer",
    ]:
        flags = re.I | (re.S if "contradicted" in pattern else 0)
        assert re.search(pattern, skill, flags), pattern


def test_brainstorm_keeps_fresh_session_handoff():
    assert not re.search(r"visual", skill, re.I)
    assert re.search(r"(?:without|no).*confirmation", skill, re.I)
    for file in ["context.md", "README.md"]:
        assert f"Write `{file}`" in skill
    assert "[references/spec-template.md](references/spec-template.md)" in skill
    assert "`ledger.json` through [scripts/ledger.py](scripts/ledger.py)" in skill
    assert ".my-dev-skills/.gitignore` containing `*`" in skill
    assert "docs/specs" not in skill
    assert re.search(r"fresh.*session", skill, re.I)
    assert not re.search(r"After your final confirmation", readme, re.I)
