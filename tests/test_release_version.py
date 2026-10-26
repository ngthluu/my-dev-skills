import json
import subprocess
import sys
from pathlib import Path

script = Path(__file__).resolve().parent.parent / "scripts/version.py"
paths = [".claude-plugin", ".codex-plugin", ".cursor-plugin"]


def test_version_cli_synchronizes_manifests_and_rejects_invalid_or_inconsistent_metadata(tmp_path):
    for p in paths:
        (tmp_path / p).mkdir()
        (tmp_path / p / "plugin.json").write_text(
            json.dumps({"name": "my-skills", "skills": "./skills/", "version": "0.1.0"})
        )

    def run(*args):
        return subprocess.run([sys.executable, script, *args], cwd=tmp_path, capture_output=True, text=True)

    assert run("set", "0.2.0").returncode == 0
    for p in paths:
        assert json.loads((tmp_path / p / "plugin.json").read_text())["version"] == "0.2.0"
    assert run("validate", "v0.2.0").returncode == 0
    for invalid in ["v0.2.0", "01.2.0", "0.2", "0.2.0+build", "0.2.0-01", "0.2.0\n", "0.2.0\r", " 0.2.0"]:
        assert run("set", invalid).returncode != 0, repr(invalid)
    (tmp_path / paths[0] / "plugin.json").write_text(
        json.dumps({"name": "wrong", "skills": "./skills/", "version": "0.3.0"})
    )
    assert "inconsistent" in run("validate").stderr or "identity" in run("validate").stderr
