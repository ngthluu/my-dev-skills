#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { tagVersion, validate } from "./version.mjs";
const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
const git = (...args) => run("git", args);
let repository;
function originRepository() {
  // Read raw configuration: Git may rewrite transport URLs in isolated tests.
  const origin = git("config", "--get-all", "remote.origin.url");
  let pushUrl;
  try {
    pushUrl = git("config", "--get-all", "remote.origin.pushurl");
  } catch (error) {
    if (error.status !== 1) throw error;
  }
  if (pushUrl !== undefined)
    throw new Error(
      "Release origin must not configure a separate pushurl; use one GitHub origin for validation, publication, and latest",
    );
  const match =
    /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([A-Za-z0-9-]+)\/([A-Za-z0-9_.-]+?)\/?$/.exec(
      origin,
    );
  if (!match)
    throw new Error(
      "Unsupported origin URL; expected a GitHub HTTPS or SSH repository URL",
    );
  const name = match[2].replace(/\.git$/, "");
  if (!name || name === "." || name === "..")
    throw new Error("Invalid GitHub repository in origin URL");
  return `${match[1]}/${name}`;
}
function records() {
  const pages = JSON.parse(
    run("gh", [
      "api",
      "--paginate",
      "--slurp",
      "--hostname",
      "github.com",
      `repos/${repository}/releases`,
    ]),
  );
  return pages.flat();
}
function remoteTag(tag) {
  const lines = git(
    "ls-remote",
    "origin",
    `refs/tags/${tag}`,
    `refs/tags/${tag}^{}`,
  ).split("\n");
  const peeled =
    lines.find((line) => line.endsWith("^{}")) ??
    lines.find((line) => line.endsWith(`refs/tags/${tag}`));
  if (!peeled) throw new Error(`Release tag ${tag} is missing on origin`);
  return peeled.split(/\s/)[0];
}
function checkedTag(tag) {
  tagVersion(tag);
  git("fetch", "--no-tags", "origin", `refs/tags/${tag}:refs/tags/${tag}`);
  const commit = git("rev-parse", `${tag}^{commit}`);
  if (remoteTag(tag) !== commit)
    throw new Error(
      `Remote tag ${tag} differs from the local committed release`,
    );
  validate(tag, true);
  return commit;
}
function requiredChecks(commit) {
  const directory = mkdtempSync(join(tmpdir(), "release-checks-"));
  try {
    git("worktree", "add", "--detach", directory, commit);
    if (existsSync(join(directory, "package-lock.json")))
      run("npm", ["ci", "--ignore-scripts"], { cwd: directory });
    const tests = readdirSync(join(directory, "tests"))
      .filter((name) => name.endsWith(".test.mjs"))
      .map((name) => join("tests", name));
    if (!tests.length)
      throw new Error("No required tests found in release commit");
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    process.stdout.write(
      run(process.execPath, ["--test", ...tests], { cwd: directory, env }) +
        "\n",
    );
  } finally {
    try {
      git("worktree", "remove", "--force", directory);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }
}
function stable(record) {
  if (record.draft || record.prerelease) return false;
  try {
    return !tagVersion(record.tag_name).includes("-");
  } catch {
    return false;
  }
}
function compare(a, b) {
  const av = a.tag_name.slice(1).split(".").map(BigInt),
    bv = b.tag_name.slice(1).split(".").map(BigInt);
  for (let i = 0; i < 3; i++)
    if (av[i] !== bv[i]) return av[i] > bv[i] ? -1 : 1;
  return 0;
}
function updateLatest(confirmed) {
  for (let attempt = 0; attempt < 8; attempt++) {
    // Read the lease BEFORE releases: any competing advancement invalidates this snapshot.
    const old = git("ls-remote", "origin", "refs/heads/latest").split(/\s/)[0];
    // GitHub's release list may lag behind a successful create response.
    const best = [...records(), confirmed].filter(stable).sort(compare)[0];
    if (!best) {
      console.log("No published stable release; latest unchanged.");
      return;
    }
    const commit = checkedTag(best.tag_name);
    if (old === commit) {
      console.log(`latest already points to ${best.tag_name} (${commit})`);
      return;
    }
    try {
      git(
        "push",
        `--force-with-lease=refs/heads/latest:${old}`,
        "origin",
        `${commit}:refs/heads/latest`,
      );
      console.log(`latest points to ${best.tag_name} (${commit})`);
      return;
    } catch (error) {
      if (attempt === 7)
        throw new Error(
          `Publication succeeded, but latest update failed. Rerun this release command to recover. ${error.stderr ?? error.message}`,
        );
    }
  }
}
try {
  const [tag, ...extra] = process.argv.slice(2);
  if (extra.length) throw new Error("Usage: node scripts/release.mjs vX.Y.Z");
  repository = originRepository();
  const value = tagVersion(tag),
    commit = checkedTag(tag);
  requiredChecks(commit);
  // Recheck the immutable remote identity after checks and before publishing.
  if (remoteTag(tag) !== commit)
    throw new Error("Remote release tag changed during validation");
  const existing = records().find((record) => record.tag_name === tag);
  if (existing?.draft)
    throw new Error(
      `Release ${tag} is a draft; resolve it explicitly before retrying`,
    );
  if (existing && Boolean(existing.prerelease) !== value.includes("-"))
    throw new Error(`Release ${tag} has inconsistent prerelease metadata`);
  if (!existing) {
    try {
      run("gh", [
        "release",
        "create",
        tag,
        "--repo",
        `github.com/${repository}`,
        "--verify-tag",
        "--title",
        tag,
        "--generate-notes",
        "--latest=false",
        ...(value.includes("-") ? ["--prerelease"] : []),
      ]);
    } catch (error) {
      throw new Error(
        `Publication failed or its result is unknown; latest was not moved. Inspect GitHub Releases and rerun ${tag} to recover. ${error.stderr ?? error.message}`,
      );
    }
  }
  console.log(`Published release confirmed: ${tag} (${commit})`);
  updateLatest(existing ?? {
    tag_name: tag,
    draft: false,
    prerelease: value.includes("-"),
  });
} catch (error) {
  if (error.stdout) process.stderr.write(error.stdout);
  console.error(error.stderr || error.message);
  process.exitCode = 1;
}
