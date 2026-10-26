#!/usr/bin/env python3
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from version import tag_version, validate  # noqa: E402


def run(command, *args, **options):
    return subprocess.run(
        [command, *args],
        check=True,
        capture_output=True,
        stdin=subprocess.DEVNULL,
        text=True,
        **options,
    ).stdout.strip()


def git(*args):
    return run("git", *args)


repository = None


def origin_repository():
    # Read raw configuration: Git may rewrite transport URLs in isolated tests.
    origin = git("config", "--get-all", "remote.origin.url")
    try:
        git("config", "--get-all", "remote.origin.pushurl")
    except subprocess.CalledProcessError as error:
        if error.returncode != 1:
            raise
    else:
        raise RuntimeError(
            "Release origin must not configure a separate pushurl; use one GitHub origin for validation, publication, and latest"
        )
    match = re.fullmatch(
        r"(?:https://github\.com/|git@github\.com:|ssh://git@github\.com/)([A-Za-z0-9-]+)/([A-Za-z0-9_.-]+?)/?",
        origin,
    )
    if not match:
        raise RuntimeError(
            "Unsupported origin URL; expected a GitHub HTTPS or SSH repository URL"
        )
    name = re.sub(r"\.git$", "", match[2])
    if name in ("", ".", ".."):
        raise RuntimeError("Invalid GitHub repository in origin URL")
    return f"{match[1]}/{name}"


def records():
    pages = json.loads(
        run(
            "gh",
            "api",
            "--paginate",
            "--slurp",
            "--hostname",
            "github.com",
            f"repos/{repository}/releases",
        )
    )
    return [record for page in pages for record in page]


def remote_tag(tag):
    lines = git("ls-remote", "origin", f"refs/tags/{tag}", f"refs/tags/{tag}^{{}}").split("\n")
    peeled = next((line for line in lines if line.endswith("^{}")), None) or next(
        (line for line in lines if line.endswith(f"refs/tags/{tag}")), None
    )
    if not peeled:
        raise RuntimeError(f"Release tag {tag} is missing on origin")
    return peeled.split()[0]


def checked_tag(tag):
    tag_version(tag)
    git("fetch", "--no-tags", "origin", f"refs/tags/{tag}:refs/tags/{tag}")
    commit = git("rev-parse", f"{tag}^{{commit}}")
    if remote_tag(tag) != commit:
        raise RuntimeError(f"Remote tag {tag} differs from the local committed release")
    validate(tag, True)
    return commit


def required_checks(commit):
    directory = tempfile.mkdtemp(prefix="release-checks-")
    try:
        git("worktree", "add", "--detach", directory, commit)
        tests = sorted(
            str(Path("tests") / path.name)
            for path in Path(directory, "tests").glob("test_*.py")
        )
        if not tests:
            raise RuntimeError("No required tests found in release commit")
        env = {
            name: value
            for name, value in os.environ.items()
            if name not in ("PYTEST_ADDOPTS", "PYTEST_CURRENT_TEST", "VIRTUAL_ENV")
        }
        # Run the release commit's own locked toolchain when it has one.
        pytest = (
            ["uv", "run", "--frozen", "pytest"]
            if Path(directory, "uv.lock").exists()
            else [sys.executable, "-m", "pytest"]
        )
        print(run(*pytest, "-p", "no:cacheprovider", *tests, cwd=directory, env=env))
    finally:
        try:
            git("worktree", "remove", "--force", directory)
        finally:
            shutil.rmtree(directory, ignore_errors=True)


def stable(record):
    if record.get("draft") or record.get("prerelease"):
        return False
    try:
        return "-" not in tag_version(record.get("tag_name"))
    except ValueError:
        return False


def numeric(record):
    return tuple(int(part) for part in record["tag_name"][1:].split("."))


def update_latest(confirmed):
    for attempt in range(8):
        # Read the lease BEFORE releases: any competing advancement invalidates this snapshot.
        old = (git("ls-remote", "origin", "refs/heads/latest").split() or [""])[0]
        # GitHub's release list may lag behind a successful create response.
        candidates = sorted(filter(stable, [*records(), confirmed]), key=numeric, reverse=True)
        if not candidates:
            print("No published stable release; latest unchanged.")
            return
        best = candidates[0]
        commit = checked_tag(best["tag_name"])
        if old == commit:
            print(f"latest already points to {best['tag_name']} ({commit})")
            return
        try:
            git(
                "push",
                f"--force-with-lease=refs/heads/latest:{old}",
                "origin",
                f"{commit}:refs/heads/latest",
            )
            print(f"latest points to {best['tag_name']} ({commit})")
            return
        except subprocess.CalledProcessError as error:
            if attempt == 7:
                raise RuntimeError(
                    f"Publication succeeded, but latest update failed. Rerun this release command to recover. {error.stderr or error}"
                )


def main(argv):
    global repository
    if len(argv) != 1:
        raise RuntimeError("Usage: python3 scripts/release.py vX.Y.Z")
    [tag] = argv
    repository = origin_repository()
    value = tag_version(tag)
    commit = checked_tag(tag)
    required_checks(commit)
    # Recheck the immutable remote identity after checks and before publishing.
    if remote_tag(tag) != commit:
        raise RuntimeError("Remote release tag changed during validation")
    existing = next((record for record in records() if record.get("tag_name") == tag), None)
    if existing and existing.get("draft"):
        raise RuntimeError(f"Release {tag} is a draft; resolve it explicitly before retrying")
    if existing and bool(existing.get("prerelease")) != ("-" in value):
        raise RuntimeError(f"Release {tag} has inconsistent prerelease metadata")
    if not existing:
        notes_directory = None
        try:
            notes_args = ["--generate-notes"]
            notes_path = f"docs/release-notes/{tag}.md"
            if git("ls-tree", "--name-only", commit, "--", notes_path):
                body = git("show", f"{commit}:{notes_path}")
                if not body.startswith(f"# {value}\n") or not body.strip():
                    raise RuntimeError(f"Release notes for {tag} have an invalid heading")
                notes_directory = tempfile.mkdtemp(prefix="release-notes-")
                notes_file = Path(notes_directory, "notes.md")
                notes_file.write_text(body + "\n")
                notes_args = ["--notes-file", str(notes_file)]
            run(
                "gh",
                "release",
                "create",
                tag,
                "--repo",
                f"github.com/{repository}",
                "--verify-tag",
                "--title",
                tag,
                *notes_args,
                "--latest=false",
                *(["--prerelease"] if "-" in value else []),
            )
        except (RuntimeError, OSError, subprocess.CalledProcessError) as error:
            detail = getattr(error, "stderr", None) or error
            raise RuntimeError(
                f"Publication failed or its result is unknown; latest was not moved. Inspect GitHub Releases and rerun {tag} to recover. {detail}"
            )
        finally:
            if notes_directory:
                shutil.rmtree(notes_directory, ignore_errors=True)
    print(f"Published release confirmed: {tag} ({commit})")
    update_latest(existing or {"tag_name": tag, "draft": False, "prerelease": "-" in value})


if __name__ == "__main__":
    try:
        main(sys.argv[1:])
    except (RuntimeError, ValueError, OSError, subprocess.CalledProcessError) as error:
        if getattr(error, "stdout", None):
            sys.stderr.write(error.stdout)
        print(getattr(error, "stderr", None) or error, file=sys.stderr)
        sys.exit(1)
