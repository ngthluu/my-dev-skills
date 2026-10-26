import json
import os
import re
import shutil
import subprocess
from pathlib import Path
from urllib.parse import quote

import pytest

root = Path(__file__).resolve().parent.parent
source = "https://github.com/ngthluu/my-dev-skills"
names = ["brainstorm", "debug", "implement"]
# The published installer users run through `npx skills`; pinned for reproducible checks.
SKILLS_CLI = "skills@1.5.25"


@pytest.fixture(scope="module")
def cli(tmp_path_factory):
    if not (shutil.which("node") and shutil.which("npm")):
        pytest.skip("Node.js and npm are required to exercise the published skills CLI")
    prefix = tmp_path_factory.mktemp("skills-cli")
    ok(run("npm", ["install", "--prefix", str(prefix), "--ignore-scripts", "--no-audit", "--no-fund", SKILLS_CLI], prefix))
    return ["node", str(prefix / "node_modules/skills/bin/cli.mjs")]


def run(command, args, cwd, env=None):
    return subprocess.run(
        [command, *args], cwd=cwd, env=env or os.environ, capture_output=True, text=True, timeout=120
    )


def ok(result):
    assert result.returncode == 0, result.stdout + result.stderr


def test_repository_local_maintainer_skill_is_hidden_from_normal_installation(cli):
    local_skill = root / ".claude/skills/release-version/SKILL.md"
    assert "internal: true" in local_skill.read_text()
    listed = run(cli[0], [*cli[1:], "add", str(root), "--list"], root, {**os.environ, "NO_COLOR": "1"})
    ok(listed)
    assert "Found 3 skills" in listed.stdout
    assert not re.search(r"\brelease-version\b", listed.stdout)


def same_tree(snapshot, destination, label):
    for path in snapshot.rglob("*"):
        if path.is_file():
            relative = path.relative_to(snapshot)
            assert (destination / relative).read_bytes() == path.read_bytes(), f"{label}: {relative}"


def test_published_skills_cli_installs_the_selected_release_and_all_packaged_assets_for_four_agents(cli, tmp_path):
    repo = tmp_path / "source"
    repo.mkdir()
    snapshot = tmp_path / "snapshot"
    shutil.copytree(root / "skills", snapshot)
    shutil.copytree(snapshot, repo / "skills")

    def git(*args):
        result = run("git", args, repo)
        ok(result)
        return result.stdout.strip()

    git("init", "-b", "main")
    git("config", "user.name", "Installation fixture")
    git("config", "user.email", "fixture@example.invalid")
    marker = repo / "skills/brainstorm/release-fixture.txt"
    marker.write_text("0.1.0")
    git("add", ".")
    git("commit", "-m", "older fixture")
    git("tag", "v0.1.0")
    marker.write_text("0.2.0")
    git("add", ".")
    git("commit", "-m", "stable fixture")
    git("tag", "v0.2.0")
    git("branch", "latest")
    marker.write_text("unpublished development")
    git("add", ".")
    git("commit", "-m", "development fixture")
    # Git rewrites only this source inside child processes; no user configuration changes.
    env = {
        **os.environ,
        "DISABLE_TELEMETRY": "1",
        "GIT_CONFIG_COUNT": "1",
        "GIT_CONFIG_KEY_0": f"url.file://{repo}.insteadOf",
        "GIT_CONFIG_VALUE_0": f"{source}.git",
        "GIT_ALLOW_PROTOCOL": "file",
        "GIT_TERMINAL_PROMPT": "0",
    }

    def skills(args, cwd, env, node_args=()):
        return run(cli[0], [*node_args, *cli[1:], *args], cwd, env)

    for agent in ["claude-code", "codex", "cursor", "opencode"]:
        project = tmp_path / agent
        project.mkdir()
        destination = project / (".claude/skills" if agent == "claude-code" else ".agents/skills")

        def install(ref):
            return skills(["add", f"{source}/tree/{ref}", "--skill", "*", "--agent", agent, "--copy", "-y"], project, env)

        for ref, version in [("v0.2.0", "0.2.0"), ("v0.1.0", "0.1.0"), ("latest", "0.2.0")]:
            ok(install(ref))
            assert sorted(os.listdir(destination)) == names
            assert (destination / "brainstorm/release-fixture.txt").read_text() == version
            for name in names:
                same_tree(snapshot / name, destination / name, f"{agent}: {name}")
            lock = json.loads((project / "skills-lock.json").read_text())
            assert sorted(lock["skills"]) == names
            for record in lock["skills"].values():
                assert record["source"] == "ngthluu/my-dev-skills"
                assert record["ref"] == ref
        missing = install("v99.0.0")
        assert missing.returncode != 0
        assert re.search(r"v99\.0\.0|clone|branch", missing.stdout + missing.stderr, re.I)
        assert (destination / "brainstorm/release-fixture.txt").read_text() == "0.2.0"
        selected_project = tmp_path / f"{agent}-selected"
        selected_project.mkdir()
        ok(skills(["add", f"{source}/tree/latest", "--skill", "debug", "--agent", agent, "-y"], selected_project, env))
        selected_destination = selected_project / (".claude/skills" if agent == "claude-code" else ".agents/skills")
        assert os.listdir(selected_destination) == ["debug"]
        assert (selected_destination / "debug/SKILL.md").read_bytes() == (snapshot / "debug/SKILL.md").read_bytes()

    failed_project = tmp_path / "transport-failure"
    failed_project.mkdir()
    failed = skills(
        ["add", f"{source}/tree/latest", "--skill", "*", "--agent", "codex", "-y"],
        failed_project,
        {**env, "GIT_CONFIG_KEY_0": f"url.file://{tmp_path / 'nonexistent-remote'}.insteadOf"},
    )
    assert failed.returncode != 0, "Unavailable source must fail instead of selecting development"
    assert re.search(r"clone|repository|exist", failed.stdout + failed.stderr, re.I)

    # Redirect the OS home boundary in the child only; never change HOME/CODEX_HOME
    # or touch the maintainer's real global installation. The published CLI is unchanged.
    global_home = tmp_path / "global-home"
    global_home.mkdir()
    preload = (
        "import os from 'node:os';"
        "import { syncBuiltinESMExports } from 'node:module';"
        "os.homedir = () => process.env.SKILLS_TEST_HOME;"
        "syncBuiltinESMExports();"
        "globalThis.fetch = async () => { throw new Error('Network disabled for installation fixture'); };"
    )
    global_env = {**env, "SKILLS_TEST_HOME": str(global_home), "XDG_CONFIG_HOME": str(global_home / ".config")}
    global_env.pop("CODEX_HOME", None)
    global_env.pop("CLAUDE_CONFIG_DIR", None)
    global_project = tmp_path / "global-project"
    global_project.mkdir()
    for ref, version in [("v0.2.0", "0.2.0"), ("v0.1.0", "0.1.0"), ("latest", "0.2.0")]:
        ok(
            skills(
                ["add", f"{source}/tree/{ref}", "--global", "--copy", "--skill", "*",
                 "--agent", "claude-code", "codex", "cursor", "opencode", "-y"],
                global_project,
                global_env,
                node_args=["--import", f"data:text/javascript,{quote(preload)}"],
            )
        )
        for path in [".claude/skills", ".agents/skills"]:
            assert sorted(os.listdir(global_home / path)) == names
            assert (global_home / path / "brainstorm/release-fixture.txt").read_text() == version
        assert os.listdir(global_project) == [], "Global installation must not install into the project"
