#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
export const manifests = [
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
];
// Build metadata is intentionally excluded: every accepted version has one release identity.
const numeric = "(?:0|[1-9][0-9]*)";
const identifier = `(?:${numeric}|[0-9]*[A-Za-z-][0-9A-Za-z-]*)`;
const versionPattern = new RegExp(
  `^${numeric}\\.${numeric}\\.${numeric}(?:-${identifier}(?:\\.${identifier})*)?$`,
);
export function version(value) {
  if (!versionPattern.test(value ?? ""))
    throw new Error(
      `Malformed version: ${value}; expected X.Y.Z or X.Y.Z-prerelease (no build suffix)`,
    );
  return value;
}
export function tagVersion(tag) {
  if (!tag?.startsWith("v"))
    throw new Error(`Malformed release tag: ${tag}; expected vX.Y.Z`);
  return version(tag.slice(1));
}
export function validate(tag, committed = false) {
  const expected = tag ? tagVersion(tag) : undefined;
  const values = manifests.map((path) =>
    JSON.parse(
      committed
        ? execFileSync("git", ["show", `${tag}:${path}`], { encoding: "utf8" })
        : readFileSync(path, "utf8"),
    ),
  );
  for (const value of values) {
    if (value.name !== "my-skills" || value.skills !== "./skills/")
      throw new Error("Inconsistent plugin identity or skill discovery path");
    version(value.version);
    if (value.version !== (expected ?? values[0].version))
      throw new Error(
        `inconsistent manifest version: expected ${expected ?? values[0].version}, found ${value.version}`,
      );
  }
  return values[0].version;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const [command, value, ...extra] = process.argv.slice(2);
    if (extra.length) throw new Error("Unexpected arguments");
    if (command === "set") {
      version(value);
      const values = manifests.map((path) =>
        JSON.parse(readFileSync(path, "utf8")),
      );
      values.forEach((entry, i) =>
        writeFileSync(
          manifests[i],
          JSON.stringify({ ...entry, version: value }, null, 2) + "\n",
        ),
      );
      console.log(
        `Set all plugin versions to ${value}; review and commit before tagging.`,
      );
    } else if (command === "validate")
      console.log(`Validated ${validate(value)}`);
    else
      throw new Error(
        "Usage: node scripts/version.mjs set VERSION | validate [TAG]",
      );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
