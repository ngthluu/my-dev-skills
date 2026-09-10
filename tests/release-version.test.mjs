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
import { spawnSync } from "node:child_process";
const script = resolve("scripts/version.mjs");
const paths = [".claude-plugin", ".codex-plugin", ".cursor-plugin"];
test("version CLI synchronizes manifests and rejects invalid or inconsistent metadata", () => {
  const dir = mkdtempSync(join(tmpdir(), "versions-"));
  try {
    for (const p of paths) {
      mkdirSync(join(dir, p));
      writeFileSync(
        join(dir, p, "plugin.json"),
        JSON.stringify({
          name: "my-skills",
          skills: "./skills/",
          version: "0.1.0",
        }),
      );
    }
    const run = (...args) =>
      spawnSync(process.execPath, [script, ...args], {
        cwd: dir,
        encoding: "utf8",
      });
    assert.equal(run("set", "0.2.0").status, 0);
    for (const p of paths)
      assert.equal(
        JSON.parse(readFileSync(join(dir, p, "plugin.json"))).version,
        "0.2.0",
      );
    assert.equal(run("validate", "v0.2.0").status, 0);
    for (const invalid of [
      "v0.2.0",
      "01.2.0",
      "0.2",
      "0.2.0+build",
      "0.2.0-01",
      "0.2.0\n",
      "0.2.0\r",
      " 0.2.0",
    ])
      assert.notEqual(run("set", invalid).status, 0);
    writeFileSync(
      join(dir, paths[0], "plugin.json"),
      JSON.stringify({ name: "wrong", skills: "./skills/", version: "0.3.0" }),
    );
    assert.match(run("validate").stderr, /inconsistent|identity/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
