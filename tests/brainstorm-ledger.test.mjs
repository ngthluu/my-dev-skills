import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const script = resolve(import.meta.dirname, "../skills/brainstorm/scripts/ledger.mjs");

function session() {
  const folder = mkdtempSync(join(tmpdir(), "ledger-"));
  const run = (...args) => spawnSync(process.execPath, [script, folder, ...args], { encoding: "utf8" });
  return { folder, run };
}

test("ledger picks the eligible question that unlocks the most decisions", (t) => {
  const { folder, run } = session();
  t.after(() => rmSync(folder, { recursive: true }));
  run("init");
  run("add", "Q1", "--question", "Color?", "--minor");
  run("add", "Q2", "--question", "Storage?");
  run("add", "Q3", "--question", "Schema?", "--prereq", "Q2");
  assert.match(run("next").stdout, /^Q2 /);
  run("set", "Q2", "--status", "settled", "--answer", "SQLite", "--source", "user reply");
  assert.match(run("next").stdout, /^Q3 /);
});

test("ledger rejects unsupported status changes and keeps the file unchanged", (t) => {
  const { folder, run } = session();
  t.after(() => rmSync(folder, { recursive: true }));
  run("init");
  run("add", "Q1", "--question", "Storage?");
  assert.equal(run("set", "Q1", "--status", "settled", "--answer", "SQLite").status, 1);
  assert.equal(run("set", "Q1", "--status", "deferred").status, 1);
  assert.equal(JSON.parse(readFileSync(join(folder, "ledger.json"), "utf8")).questions[0].status, "open");
  run("set", "Q1", "--status", "settled", "--answer", "SQLite", "--source", "user reply");
  assert.equal(run("set", "Q1", "--status", "open").status, 1, "reopening needs a reason");
});

test("ledger audit fails until every material decision is settled or deferred", (t) => {
  const { folder, run } = session();
  t.after(() => rmSync(folder, { recursive: true }));
  run("init");
  run("add", "Q1", "--question", "Storage?");
  run("add", "Q2", "--question", "Color?", "--minor");
  const failed = run("audit");
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /Q1 is open/);
  assert.doesNotMatch(failed.stderr, /Q2/);
  run("set", "Q1", "--status", "deferred", "--reason", "user postponed");
  assert.equal(run("audit").status, 0);
});
