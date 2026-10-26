import re
from pathlib import Path

import yaml

skill = (Path(__file__).resolve().parent.parent / "skills/debug/SKILL.md").read_text()
_, frontmatter, body = re.split(r"^---\s*$", skill, maxsplit=2, flags=re.M)
steps = re.findall(r"^## Step (\d+): (.+)$", body, re.M)
templates = re.findall(r"```text\n([\s\S]*?)\n```", body)


def test_debug_retains_invocation_metadata_and_concise_scannable_workflow():
    metadata = yaml.safe_load(frontmatter)
    assert metadata["name"] == "debug"
    assert metadata["disable-model-invocation"] is True
    assert metadata["metadata"]["opencode/autoinvoke"] == "false"
    assert len(steps) >= 5, "workflow has step-by-step headings"
    assert re.search(r"^- .+$", body, re.M), "instructions appear as bullets"
    assert len(skill.split()) < 1235, "shorter than baseline"


def test_debug_gives_copyable_progress_and_final_report_templates():
    assert len(templates) == 2
    progress, final = templates
    for field in [r"evidence", r"hypothes", r"next probe"]:
        assert re.search(field, progress, re.I)
    for field in [r"symptom", r"reproduc", r"root cause", r"change", r"review", r"verif", r"limit"]:
        assert re.search(field, final, re.I)


def test_debug_actions_stay_ordered_with_nearby_rules():
    numbers = [int(number) for number, _ in steps]
    assert numbers == list(range(1, len(numbers) + 1))

    workflow_sections = re.split(r"^## ", body, flags=re.M)[1:]
    assert all(re.search(r"^- .+$", section, re.M) for section in workflow_sections)
    instructions = [line for line in re.sub(r"```[\s\S]*?```", "", body).split("\n") if line.startswith("- ")]
    assert all(len(line) <= 150 and ";" not in line for line in instructions), \
        "keep bullets short without semicolon-linked clauses"
