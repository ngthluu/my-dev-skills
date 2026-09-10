import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
const script = resolve("scripts/release.mjs");
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "release-")),
    repo = join(root, "repo"),
    remote = join(root, "remote.git"),
    bin = join(root, "bin"),
    state = join(root, "state.json");
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(repo);
  mkdirSync(bin);
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: repo,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  git("init", "--bare", remote);
  git("init");
  git("config", "user.email", "test@example.invalid");
  git("config", "user.name", "Test");
  git(
    "remote",
    "add",
    "origin",
    "https://github.com/release-fixture/skills.git",
  );
  git(
    "config",
    `url.${remote}.insteadOf`,
    "https://github.com/release-fixture/skills.git",
  );
  writeFileSync(state, "[]");
  writeFileSync(
    join(bin, "gh"),
    `#!${process.execPath}\nconst fs=require('fs');const cp=require('child_process');const a=process.argv.slice(2);const p=process.env.RELEASE_STATE;let s=JSON.parse(fs.readFileSync(p));if(process.env.EXPECT_REPO){const expected=process.env.EXPECT_REPO;const valid=a[0]==='api'?a.includes('repos/'+expected+'/releases')&&a[a.indexOf('--hostname')+1]==='github.com':a[a.indexOf('--repo')+1]==='github.com/'+expected;if(!valid){console.error('Wrong GitHub repository: ambient default is '+process.env.GH_REPO);process.exit(3);}}if(a[0]==='api'){console.log(JSON.stringify([s]));}else if(a[0]==='release'&&a[1]==='create'){if(process.env.FAIL_PUBLISH)process.exit(1);s.push({tag_name:a[2],draft:false,prerelease:a.includes('--prerelease')});fs.writeFileSync(p,JSON.stringify(s));}else process.exit(2);`,
    { mode: 0o755 },
  );
  const tag = (v, pass = true) => {
    for (const p of [".claude-plugin", ".codex-plugin", ".cursor-plugin"]) {
      mkdirSync(join(repo, p), { recursive: true });
      writeFileSync(
        join(repo, p, "plugin.json"),
        JSON.stringify({ name: "my-skills", skills: "./skills/", version: v }),
      );
    }
    mkdirSync(join(repo, "tests"), { recursive: true });
    writeFileSync(
      join(repo, "tests", "check.test.mjs"),
      `import assert from 'node:assert/strict'; assert.equal(${pass},true);`,
    );
    git("add", ".");
    git("commit", "-m", v);
    git("tag", `v${v}`);
    git("push", "origin", `v${v}`);
    return git("rev-parse", "HEAD");
  };
  const run = (v, env = {}) =>
    spawnSync(process.execPath, [script, `v${v}`], {
      cwd: repo,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: bin + ":" + process.env.PATH,
        RELEASE_STATE: state,
        ...env,
      },
    });
  const latest = () =>
    git("ls-remote", "origin", "refs/heads/latest").split(/\s/)[0];
  return { root, repo, remote, state, git, tag, run, latest };
}
test("release validates committed tag and checks before publication", (t) => {
  const f = fixture(t);
  f.tag("0.2.0", false);
  const failed = f.run("0.2.0");
  assert.notEqual(failed.status, 0);
  assert.match(failed.stdout + failed.stderr, /AssertionError|ERR_ASSERTION/);
  assert.deepEqual(JSON.parse(readFileSync(f.state)), []);
  const sha = f.tag("0.2.1");
  const result = f.run("0.2.1");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.latest(), sha);
  f.git("tag", "v0.9.0");
  f.git("push", "origin", "v0.9.0");
  assert.notEqual(f.run("0.9.0").status, 0);
  assert.equal(JSON.parse(readFileSync(f.state)).length, 1);
});
test("latest ignores older releases and prereleases; failed publication and retries are safe", (t) => {
  const f = fixture(t);
  f.tag("0.2.0");
  const newest = f.tag("0.10.0");
  f.tag("1.0.0-rc.1");
  assert.equal(f.run("0.10.0").status, 0);
  assert.equal(f.run("0.2.0").status, 0);
  assert.equal(f.run("1.0.0-rc.1").status, 0);
  assert.equal(f.latest(), newest);
  f.tag("1.0.0");
  assert.notEqual(f.run("1.0.0", { FAIL_PUBLISH: "1" }).status, 0);
  assert.equal(f.latest(), newest);
  assert.equal(f.run("0.10.0").status, 0);
  assert.equal(JSON.parse(readFileSync(f.state)).length, 3);
});
test("publication followed by rejected latest push is visible and retry recovers without duplicate release", (t) => {
  const f = fixture(t);
  const sha = f.tag("0.2.0");
  const hook = join(f.remote, "hooks", "update");
  writeFileSync(hook, '#!/bin/sh\n[ "$1" != refs/heads/latest ]\n', {
    mode: 0o755,
  });
  const failed = f.run("0.2.0");
  assert.notEqual(failed.status, 0);
  assert.match(failed.stderr, /Publication succeeded.*latest update failed/);
  assert.equal(f.latest(), "");
  assert.equal(JSON.parse(readFileSync(f.state)).length, 1);
  rmSync(hook);
  assert.equal(f.run("0.2.0").status, 0);
  assert.equal(f.latest(), sha);
  assert.equal(JSON.parse(readFileSync(f.state)).length, 1);
});
test("competing latest advancement invalidates the old lease and retries from fresh releases", (t) => {
  const f = fixture(t);
  f.tag("0.2.0");
  const newer = f.tag("0.10.0");
  // The hook models a concurrent publisher after this command reads releases and its lease.
  const hook = join(f.remote, "hooks", "pre-receive"),
    marker = join(f.root, "raced");
  writeFileSync(
    hook,
    `#!${process.execPath}\nconst fs=require('fs'),cp=require('child_process');if(!fs.existsSync(${JSON.stringify(marker)})){fs.writeFileSync(${JSON.stringify(marker)},'1');let records=JSON.parse(fs.readFileSync(${JSON.stringify(f.state)}));records.push({tag_name:'v0.10.0',draft:false,prerelease:false});fs.writeFileSync(${JSON.stringify(f.state)},JSON.stringify(records));const env={...process.env};delete env.GIT_QUARANTINE_PATH;cp.execFileSync('git',['update-ref','refs/heads/latest',${JSON.stringify(newer)}],{env});process.exit(1);}`,
    { mode: 0o755 },
  );
  const result = f.run("0.2.0");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.latest(), newer);
});
test("release rejects a local tag that differs from origin without rewriting the remote", (t) => {
  const f = fixture(t);
  const original = f.tag("0.2.0");
  f.tag("0.2.1");
  f.git("tag", "-f", "v0.2.0");
  const result = f.run("0.2.0");
  assert.notEqual(result.status, 0);
  assert.deepEqual(JSON.parse(readFileSync(f.state)), []);
  assert.equal(
    f.git("ls-remote", "origin", "refs/tags/v0.2.0").split(/\s/)[0],
    original,
  );
  assert.notEqual(f.run("broken").status, 0);
});

test("publication explicitly targets origin despite a conflicting GitHub CLI default", (t) => {
  const f = fixture(t);
  const sha = f.tag("0.2.0");
  const result = f.run("0.2.0", {
    GH_REPO: "another-owner/another-repository",
    EXPECT_REPO: "release-fixture/skills",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.latest(), sha);
  assert.equal(JSON.parse(readFileSync(f.state)).length, 1);
});
test("release refuses a separate push destination before publication", (t) => {
  const f = fixture(t);
  f.tag("0.2.0");
  f.git("config", "remote.origin.pushurl", f.remote);
  const result = f.run("0.2.0");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /pushurl/);
  assert.deepEqual(JSON.parse(readFileSync(f.state)), []);
});
test("release rejects unsupported origins before any GitHub operation", (t) => {
  const f = fixture(t);
  f.tag("0.2.0");
  f.git("remote", "set-url", "origin", f.remote);
  const result = f.run("0.2.0");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unsupported origin URL/);
  assert.deepEqual(JSON.parse(readFileSync(f.state)), []);
});
test("SSH GitHub origins target the same explicit publication repository", (t) => {
  const f = fixture(t);
  const sha = f.tag("0.2.0");
  for (const origin of [
    "git@github.com:release-fixture/skills.git",
    "ssh://git@github.com/release-fixture/skills.git",
  ]) {
    f.git("remote", "set-url", "origin", origin);
    f.git("config", "--add", `url.${f.remote}.insteadOf`, origin);
    const result = f.run("0.2.0", {
      GH_REPO: "wrong/repository",
      EXPECT_REPO: "release-fixture/skills",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(f.latest(), sha);
  }
  assert.equal(JSON.parse(readFileSync(f.state)).length, 1);
});
