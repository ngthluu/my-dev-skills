import json
import os
import re
import subprocess
import sys
from pathlib import Path

import pytest

script = Path(__file__).resolve().parent.parent / "scripts/release.py"
FAKE_GH = """\
import json, os, sys
a = sys.argv[1:]
p = os.environ["RELEASE_STATE"]
s = json.load(open(p))
expected = os.environ.get("EXPECT_REPO")
if expected:
    if a[0] == "api":
        valid = f"repos/{expected}/releases" in a and a[a.index("--hostname") + 1] == "github.com"
    else:
        valid = a[a.index("--repo") + 1] == f"github.com/{expected}"
    if not valid:
        print("Wrong GitHub repository: ambient default is " + str(os.environ.get("GH_REPO")), file=sys.stderr)
        sys.exit(3)
if a[0] == "api":
    print(json.dumps([[r for r in s if r["tag_name"] != os.environ.get("STALE_RELEASE_LIST")]]))
elif a[:2] == ["release", "create"]:
    if os.environ.get("FAIL_PUBLISH"):
        sys.exit(1)
    body = open(a[a.index("--notes-file") + 1]).read() if "--notes-file" in a else None
    s.append({"tag_name": a[2], "draft": False, "prerelease": "--prerelease" in a, "body": body})
    json.dump(s, open(p, "w"))
else:
    sys.exit(2)
"""


class Fixture:
    def __init__(self, root):
        self.root = root
        self.repo = root / "repo"
        self.remote = root / "remote.git"
        self.bin = root / "bin"
        self.state = root / "state.json"
        self.repo.mkdir()
        self.bin.mkdir()
        self.git("init", "--bare", str(self.remote))
        self.git("init")
        self.git("config", "user.email", "test@example.invalid")
        self.git("config", "user.name", "Test")
        self.git("remote", "add", "origin", "https://github.com/release-fixture/skills.git")
        self.git("config", f"url.{self.remote}.insteadOf", "https://github.com/release-fixture/skills.git")
        self.state.write_text("[]")
        gh = self.bin / "gh"
        gh.write_text(f"#!{sys.executable}\n{FAKE_GH}")
        gh.chmod(0o755)

    def git(self, *args):
        return subprocess.run(
            ["git", *args], cwd=self.repo, check=True, capture_output=True, stdin=subprocess.DEVNULL, text=True
        ).stdout.strip()

    def tag(self, v, passing=True, notes=None):
        for p in [".claude-plugin", ".codex-plugin", ".cursor-plugin"]:
            (self.repo / p).mkdir(parents=True, exist_ok=True)
            (self.repo / p / "plugin.json").write_text(
                json.dumps({"name": "my-skills", "skills": "./skills/", "version": v})
            )
        (self.repo / "tests").mkdir(exist_ok=True)
        (self.repo / "tests" / "test_check.py").write_text(f"def test_check():\n    assert {passing}\n")
        if notes is not None:
            (self.repo / "docs" / "release-notes").mkdir(parents=True, exist_ok=True)
            (self.repo / "docs" / "release-notes" / f"v{v}.md").write_text(notes)
        self.git("add", ".")
        self.git("commit", "-m", v)
        self.git("tag", f"v{v}")
        self.git("push", "origin", f"v{v}")
        return self.git("rev-parse", "HEAD")

    def run(self, v, **env):
        return subprocess.run(
            [sys.executable, script, f"v{v}"],
            cwd=self.repo,
            capture_output=True,
            text=True,
            env={**os.environ, "PATH": f"{self.bin}:{os.environ['PATH']}", "RELEASE_STATE": str(self.state), **env},
        )

    def releases(self):
        return json.loads(self.state.read_text())

    def latest(self):
        return (self.git("ls-remote", "origin", "refs/heads/latest").split() or [""])[0]


@pytest.fixture
def f(tmp_path):
    return Fixture(tmp_path)


def hook(path, source):
    path.write_text(source)
    path.chmod(0o755)


def test_release_validates_committed_tag_and_checks_before_publication(f):
    f.tag("0.2.0", False)
    failed = f.run("0.2.0")
    assert failed.returncode != 0
    assert re.search(r"AssertionError|FAILED", failed.stdout + failed.stderr)
    assert f.releases() == []
    sha = f.tag("0.2.1")
    result = f.run("0.2.1")
    assert result.returncode == 0, result.stderr
    assert f.latest() == sha
    f.git("tag", "v0.9.0")
    f.git("push", "origin", "v0.9.0")
    assert f.run("0.9.0").returncode != 0
    assert len(f.releases()) == 1


def test_publication_uses_reviewed_notes_from_the_tagged_commit(f):
    f.tag("0.3.0", True, "# 0.3.0\n\n## Improvements\n\n- Clearer prompts.\n")
    (f.repo / "docs" / "release-notes" / "v0.3.0.md").write_text("# 0.3.0\n\n- Uncommitted change.\n")
    result = f.run("0.3.0")
    assert result.returncode == 0, result.stderr
    assert "Clearer prompts" in f.releases()[0]["body"]
    assert "Uncommitted" not in f.releases()[0]["body"]


def test_latest_ignores_older_releases_and_prereleases_failed_publication_and_retries_are_safe(f):
    f.tag("0.2.0")
    newest = f.tag("0.10.0")
    f.tag("1.0.0-rc.1")
    assert f.run("0.10.0").returncode == 0
    assert f.run("0.2.0").returncode == 0
    assert f.run("1.0.0-rc.1").returncode == 0
    assert f.latest() == newest
    f.tag("1.0.0")
    assert f.run("1.0.0", FAIL_PUBLISH="1").returncode != 0
    assert f.latest() == newest
    assert f.run("0.10.0").returncode == 0
    assert len(f.releases()) == 3


def test_newly_published_release_advances_latest_while_the_release_list_is_stale(f):
    f.tag("0.1.3")
    assert f.run("0.1.3").returncode == 0
    newest = f.tag("0.1.4")
    result = f.run("0.1.4", STALE_RELEASE_LIST="v0.1.4")
    assert result.returncode == 0, result.stderr
    assert f.latest() == newest


def test_publication_followed_by_rejected_latest_push_is_visible_and_retry_recovers_without_duplicate_release(f):
    sha = f.tag("0.2.0")
    update = f.remote / "hooks" / "update"
    hook(update, '#!/bin/sh\n[ "$1" != refs/heads/latest ]\n')
    failed = f.run("0.2.0")
    assert failed.returncode != 0
    assert re.search(r"Publication succeeded.*latest update failed", failed.stderr)
    assert f.latest() == ""
    assert len(f.releases()) == 1
    update.unlink()
    assert f.run("0.2.0").returncode == 0
    assert f.latest() == sha
    assert len(f.releases()) == 1


def test_competing_latest_advancement_invalidates_the_old_lease_and_retries_from_fresh_releases(f):
    f.tag("0.2.0")
    newer = f.tag("0.10.0")
    marker = f.root / "raced"
    # The hook models a concurrent publisher after this command reads releases and its lease.
    hook(
        f.remote / "hooks" / "pre-receive",
        f"""#!{sys.executable}
import json, os, subprocess, sys
marker, state = {str(marker)!r}, {str(f.state)!r}
if not os.path.exists(marker):
    open(marker, "w").write("1")
    records = json.load(open(state))
    records.append({{"tag_name": "v0.10.0", "draft": False, "prerelease": False}})
    json.dump(records, open(state, "w"))
    env = {{k: v for k, v in os.environ.items() if k != "GIT_QUARANTINE_PATH"}}
    subprocess.run(["git", "update-ref", "refs/heads/latest", {newer!r}], env=env, check=True)
    sys.exit(1)
""",
    )
    result = f.run("0.2.0")
    assert result.returncode == 0, result.stderr
    assert f.latest() == newer


def test_release_rejects_a_local_tag_that_differs_from_origin_without_rewriting_the_remote(f):
    original = f.tag("0.2.0")
    f.tag("0.2.1")
    f.git("tag", "-f", "v0.2.0")
    result = f.run("0.2.0")
    assert result.returncode != 0
    assert f.releases() == []
    assert f.git("ls-remote", "origin", "refs/tags/v0.2.0").split()[0] == original
    assert f.run("broken").returncode != 0


def test_publication_explicitly_targets_origin_despite_a_conflicting_github_cli_default(f):
    sha = f.tag("0.2.0")
    result = f.run("0.2.0", GH_REPO="another-owner/another-repository", EXPECT_REPO="release-fixture/skills")
    assert result.returncode == 0, result.stderr
    assert f.latest() == sha
    assert len(f.releases()) == 1


def test_release_refuses_a_separate_push_destination_before_publication(f):
    f.tag("0.2.0")
    f.git("config", "remote.origin.pushurl", str(f.remote))
    result = f.run("0.2.0")
    assert result.returncode != 0
    assert "pushurl" in result.stderr
    assert f.releases() == []


def test_release_rejects_unsupported_origins_before_any_github_operation(f):
    f.tag("0.2.0")
    f.git("remote", "set-url", "origin", str(f.remote))
    result = f.run("0.2.0")
    assert result.returncode != 0
    assert "Unsupported origin URL" in result.stderr
    assert f.releases() == []


def test_ssh_github_origins_target_the_same_explicit_publication_repository(f):
    sha = f.tag("0.2.0")
    for origin in ["git@github.com:release-fixture/skills.git", "ssh://git@github.com/release-fixture/skills.git"]:
        f.git("remote", "set-url", "origin", origin)
        f.git("config", "--add", f"url.{f.remote}.insteadOf", origin)
        result = f.run("0.2.0", GH_REPO="wrong/repository", EXPECT_REPO="release-fixture/skills")
        assert result.returncode == 0, result.stderr
        assert f.latest() == sha
    assert len(f.releases()) == 1
