import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  cpSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const cli = join(root, "node_modules/skills/bin/cli.mjs");
const source = "https://github.com/ngthluu/my-dev-skills";
const names = ["brainstorm", "debug", "implement"];
function run(command, args, cwd, env = process.env) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: "utf8",
    timeout: 60000,
  });
  assert.ifError(result.error);
  return result;
}
function ok(result) {
  assert.equal(result.status, 0, result.stdout + result.stderr);
}

test("published skills CLI installs the selected release and all packaged assets for four agents", () => {
  const temp = mkdtempSync(join(tmpdir(), "skills-install-"));
  try {
    const repo = join(temp, "source");
    mkdirSync(repo);
    const snapshot = join(temp, "snapshot");
    cpSync(join(root, "skills"), snapshot, { recursive: true });
    cpSync(snapshot, join(repo, "skills"), { recursive: true });
    const git = (...args) => {
      const result = run("git", args, repo);
      ok(result);
      return result.stdout.trim();
    };
    git("init", "-b", "main");
    git("config", "user.name", "Installation fixture");
    git("config", "user.email", "fixture@example.invalid");
    const marker = join(repo, "skills/brainstorm/release-fixture.txt");
    writeFileSync(marker, "0.1.0");
    git("add", ".");
    git("commit", "-m", "older fixture");
    git("tag", "v0.1.0");
    writeFileSync(marker, "0.2.0");
    git("add", ".");
    git("commit", "-m", "stable fixture");
    git("tag", "v0.2.0");
    git("branch", "latest");
    writeFileSync(marker, "unpublished development");
    git("add", ".");
    git("commit", "-m", "development fixture");
    // Git rewrites only this source inside child processes; no user configuration changes.
    const env = {
      ...process.env,
      DISABLE_TELEMETRY: "1",
      GIT_CONFIG_COUNT: "1",
      GIT_CONFIG_KEY_0: `url.file://${repo}.insteadOf`,
      GIT_CONFIG_VALUE_0: `${source}.git`,
      GIT_ALLOW_PROTOCOL: "file",
      GIT_TERMINAL_PROMPT: "0",
    };
    for (const agent of ["claude-code", "codex", "cursor", "opencode"]) {
      const project = join(temp, agent);
      mkdirSync(project);
      const install = (ref) =>
        run(
          process.execPath,
          [
            cli,
            "add",
            `${source}/tree/${ref}`,
            "--skill",
            "*",
            "--agent",
            agent,
            "--copy",
            "-y",
          ],
          project,
          env,
        );
      for (const [ref, version] of [
        ["v0.2.0", "0.2.0"],
        ["v0.1.0", "0.1.0"],
        ["latest", "0.2.0"],
      ]) {
        ok(install(ref));
        const destination = join(
          project,
          agent === "claude-code" ? ".claude/skills" : ".agents/skills",
        );
        assert.deepEqual(readdirSync(destination).sort(), names);
        assert.equal(
          readFileSync(
            join(destination, "brainstorm/release-fixture.txt"),
            "utf8",
          ),
          version,
        );
        for (const name of names) {
          const compare = (relative = "") => {
            for (const entry of readdirSync(join(snapshot, name, relative), {
              withFileTypes: true,
            })) {
              const path = join(relative, entry.name);
              if (entry.isDirectory()) compare(path);
              else
                assert.ok(
                  readFileSync(join(destination, name, path)).equals(
                    readFileSync(join(snapshot, name, path)),
                  ),
                  `${agent}: ${name}/${path}`,
                );
            }
          };
          compare();
        }
        const lock = JSON.parse(
          readFileSync(join(project, "skills-lock.json"), "utf8"),
        );
        assert.deepEqual(Object.keys(lock.skills).sort(), names);
        for (const record of Object.values(lock.skills)) {
          assert.equal(record.source, "ngthluu/my-dev-skills");
          assert.equal(record.ref, ref);
        }
      }
      const missing = install("v99.0.0");
      assert.notEqual(missing.status, 0);
      assert.match(missing.stdout + missing.stderr, /v99\.0\.0|clone|branch/i);
      const destination = join(
        project,
        agent === "claude-code" ? ".claude/skills" : ".agents/skills",
      );
      assert.equal(
        readFileSync(
          join(destination, "brainstorm/release-fixture.txt"),
          "utf8",
        ),
        "0.2.0",
      );
      const selectedProject = join(temp, `${agent}-selected`);
      mkdirSync(selectedProject);
      ok(
        run(
          process.execPath,
          [
            cli,
            "add",
            `${source}/tree/latest`,
            "--skill",
            "debug",
            "--agent",
            agent,
            "-y",
          ],
          selectedProject,
          env,
        ),
      );
      const selectedDestination = join(
        selectedProject,
        agent === "claude-code" ? ".claude/skills" : ".agents/skills",
      );
      assert.deepEqual(readdirSync(selectedDestination), ["debug"]);
      assert.ok(
        readFileSync(join(selectedDestination, "debug/SKILL.md")).equals(
          readFileSync(join(snapshot, "debug/SKILL.md")),
        ),
      );
    }
    const failedProject = join(temp, "transport-failure");
    mkdirSync(failedProject);
    const failed = run(
      process.execPath,
      [
        cli,
        "add",
        `${source}/tree/latest`,
        "--skill",
        "*",
        "--agent",
        "codex",
        "-y",
      ],
      failedProject,
      {
        ...env,
        GIT_CONFIG_KEY_0: `url.file://${join(temp, "nonexistent-remote")}.insteadOf`,
      },
    );
    assert.notEqual(
      failed.status,
      0,
      "Unavailable source must fail instead of selecting development",
    );
    assert.match(failed.stdout + failed.stderr, /clone|repository|exist/i);
    // Redirect the OS home boundary in the child only; never change HOME/CODEX_HOME
    // or touch the maintainer's real global installation. The published CLI is unchanged.
    const globalHome = join(temp, "global-home");
    mkdirSync(globalHome);
    const preload = join(temp, "isolated-home.mjs");
    writeFileSync(
      preload,
      `import os from 'node:os';\nimport { syncBuiltinESMExports } from 'node:module';\nos.homedir = () => process.env.SKILLS_TEST_HOME;\nsyncBuiltinESMExports();\nglobalThis.fetch = async () => { throw new Error('Network disabled for installation fixture'); };\n`,
    );
    const globalEnv = {
      ...env,
      SKILLS_TEST_HOME: globalHome,
      XDG_CONFIG_HOME: join(globalHome, ".config"),
    };
    delete globalEnv.CODEX_HOME;
    delete globalEnv.CLAUDE_CONFIG_DIR;
    const globalProject = join(temp, "global-project");
    mkdirSync(globalProject);
    for (const [ref, version] of [
      ["v0.2.0", "0.2.0"],
      ["v0.1.0", "0.1.0"],
      ["latest", "0.2.0"],
    ]) {
      ok(
        run(
          process.execPath,
          [
            "--import",
            pathToFileURL(preload).href,
            cli,
            "add",
            `${source}/tree/${ref}`,
            "--global",
            "--copy",
            "--skill",
            "*",
            "--agent",
            "claude-code",
            "codex",
            "cursor",
            "opencode",
            "-y",
          ],
          globalProject,
          globalEnv,
        ),
      );
      for (const path of [".claude/skills", ".agents/skills"]) {
        assert.deepEqual(readdirSync(join(globalHome, path)).sort(), names);
        assert.equal(
          readFileSync(
            join(globalHome, path, "brainstorm/release-fixture.txt"),
            "utf8",
          ),
          version,
        );
      }
      assert.deepEqual(
        readdirSync(globalProject),
        [],
        "Global installation must not install into the project",
      );
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
