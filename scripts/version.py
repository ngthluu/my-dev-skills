#!/usr/bin/env python3
import json
import re
import subprocess
import sys
from pathlib import Path

MANIFESTS = [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    ".cursor-plugin/plugin.json",
]
# Build metadata is intentionally excluded: every accepted version has one release identity.
NUMERIC = "(?:0|[1-9][0-9]*)"
IDENTIFIER = f"(?:{NUMERIC}|[0-9]*[A-Za-z-][0-9A-Za-z-]*)"
VERSION_PATTERN = re.compile(
    rf"{NUMERIC}\.{NUMERIC}\.{NUMERIC}(?:-{IDENTIFIER}(?:\.{IDENTIFIER})*)?",
    re.ASCII,
)


def version(value):
    if not VERSION_PATTERN.fullmatch(value or ""):
        raise ValueError(
            f"Malformed version: {value}; expected X.Y.Z or X.Y.Z-prerelease (no build suffix)"
        )
    return value


def tag_version(tag):
    if not (tag or "").startswith("v"):
        raise ValueError(f"Malformed release tag: {tag}; expected vX.Y.Z")
    return version(tag[1:])


def validate(tag=None, committed=False):
    expected = tag_version(tag) if tag else None
    values = [
        json.loads(
            subprocess.run(
                ["git", "show", f"{tag}:{path}"],
                check=True,
                capture_output=True,
                text=True,
            ).stdout
            if committed
            else Path(path).read_text()
        )
        for path in MANIFESTS
    ]
    for value in values:
        if value.get("name") != "my-skills" or value.get("skills") != "./skills/":
            raise ValueError("Inconsistent plugin identity or skill discovery path")
        version(value.get("version"))
        wanted = expected or values[0]["version"]
        if value["version"] != wanted:
            raise ValueError(
                f"inconsistent manifest version: expected {wanted}, found {value['version']}"
            )
    return values[0]["version"]


def main(argv):
    command, value, *extra = argv + [None, None]
    if any(arg is not None for arg in extra):
        raise ValueError("Unexpected arguments")
    if command == "set":
        version(value)
        for path in MANIFESTS:
            entry = json.loads(Path(path).read_text())
            Path(path).write_text(
                json.dumps({**entry, "version": value}, indent=2, ensure_ascii=False) + "\n"
            )
        print(f"Set all plugin versions to {value}; review and commit before tagging.")
    elif command == "validate":
        print(f"Validated {validate(value)}")
    else:
        raise ValueError("Usage: python3 scripts/version.py set VERSION | validate [TAG]")


if __name__ == "__main__":
    try:
        main(sys.argv[1:])
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        print(error, file=sys.stderr)
        sys.exit(1)
