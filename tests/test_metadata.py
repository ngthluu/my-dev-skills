import json
import os
import re
from pathlib import Path

import yaml

root = Path(__file__).resolve().parent.parent
names = ["brainstorm", "debug", "implement"]


def test_four_agent_configurations_discover_three_skills_with_resolvable_packaged_references():
    for folder in [".claude-plugin", ".codex-plugin", ".cursor-plugin"]:
        metadata = json.loads((root / folder / "plugin.json").read_text())
        assert metadata["name"] == "my-skills"
        assert metadata["skills"] == "./skills/"
        assert sorted(os.listdir(root / metadata["skills"])) == names
    opencode = json.loads((root / "opencode.json").read_text())
    assert opencode["skills"]["paths"] == ["./skills"]
    for name in names:
        directory = root / "skills" / name
        skill = (directory / "SKILL.md").read_text()
        frontmatter = yaml.safe_load(skill.split("---")[1])
        assert frontmatter["name"] == name
        assert len(frontmatter["description"]) > 20
        assert frontmatter["disable-model-invocation"] is True
        assert frontmatter["metadata"]["opencode/autoinvoke"] == "false"
        agent = yaml.safe_load((directory / "agents/openai.yaml").read_text())
        assert agent["policy"]["allow_implicit_invocation"] is False
        assert f"${name}" in agent["interface"]["default_prompt"]
        assert 25 <= len(agent["interface"]["short_description"]) <= 64
        for file in directory.rglob("*.md"):
            for target in re.findall(r"\]\(([^)]+)\)", file.read_text()):
                if re.match(r"https?:|#", target):
                    continue
                resolved = os.path.normpath(file.parent / target.split("#")[0])
                assert os.path.exists(resolved), f"{file}: missing {target}"
                assert resolved.startswith(f"{directory}/"), f"{file}: reference outside packaged skill"
