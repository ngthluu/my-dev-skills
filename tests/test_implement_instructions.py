import re
from pathlib import Path

skill = (Path(__file__).resolve().parent.parent / "skills/implement/SKILL.md").read_text()
sections = {
    title.lower(): body
    for title, body in re.findall(r"^## (.+)\n([\s\S]*?)(?=^## |\Z)", skill, re.M)
}


def section(topic):
    match = next((body for title, body in sections.items() if topic in title), None)
    assert match is not None, f"missing {topic} section"
    return match


def test_implement_instructions_expose_an_ordered_concise_workflow_and_copyable_reports():
    steps = re.findall(r"^## Step (\d+): (.+)$", skill, re.M)
    instructions = [line for line in re.sub(r"```[\s\S]*?```", "", skill).split("\n") if line.startswith("- ")]
    setup = section("contract")
    implementation = section("implement")
    review = section("review")
    finish = section("finish")

    assert len(steps) >= 5, "workflow needs step-by-step headings"
    assert [int(number) for number, _ in steps] == list(range(1, len(steps) + 1))
    for name, body in {"setup": setup, "implementation": implementation, "review": review, "finish": finish}.items():
        assert re.search(r"^- ", body, re.M), f"{name} needs short instructions below its heading"
    assert len(instructions) >= 5
    assert all(len(line) <= 150 and ";" not in line for line in instructions), \
        "keep bullets short without semicolon-linked clauses"
    assert re.search(r"public (?:test )?seam", implementation, re.I)
    assert re.search(r"red[\s\S]*green", implementation, re.I)
    assert re.search(r"requirements[\s\S]*code", review, re.I)
    assert re.search(r"read.only", review, re.I)
    assert re.search(r"fix", review, re.I)
    final_template = re.search(r"```[^\n]*\n([\s\S]*?)\n```", finish)
    review_template = re.search(r"```[^\n]*\n([\s\S]*?)\n```", review)
    assert final_template, "finish needs a copyable report template"
    assert review_template, "review needs a copyable findings template"
    assert re.search(r"(?:changed|files)[\s\S]*(?:checks|tests)[\s\S]*review[\s\S]*(?:limitations|blockers)",
                     final_template[1], re.I)
    assert re.search(r"verdict[\s\S]*finding", review_template[1], re.I)
    assert len(skill.split()) < 1082, "skill should be shorter than its baseline"
