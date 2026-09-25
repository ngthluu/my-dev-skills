import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const skill = readFileSync(resolve(root, "skills/brainstorm/SKILL.md"), "utf8");
const visual = readFileSync(resolve(root, "skills/brainstorm/references/visual-workspace.md"), "utf8");
const readme = readFileSync(resolve(root, "README.md"), "utf8");

test("brainstorm instructions preserve decisions and select one eligible question", () => {
  assert.match(skill, /dependency graph/i);
  assert.match(skill, /stable ID/);
  assert.match(skill, /answer and source/i);
  assert.match(skill, /reconcile the user's whole latest message/i);
  assert.match(skill, /One message may settle several nodes/i);
  assert.match(skill, /greatest impact/i);
  assert.match(skill, /tie by stable ID/i);
  assert.match(skill, /exactly one open node/i);
  assert.doesNotMatch(skill, /Ask every independent frontier question together/i);
});

test("brainstorm instructions handle tool fallback and finish without confirmation", () => {
  assert.match(skill, /dedicated question tool/i);
  assert.match(skill, /exactly one question in that tool call/i);
  assert.match(skill, /ask one plain chat question/i);
  assert.match(skill, /partial or ambiguous/i);
  assert.match(skill, /actually contradicts or invalidates/i);
  assert.match(skill, /without an extra confirmation question/i);
  assert.doesNotMatch(skill, /ask the user to confirm/i);
  assert.doesNotMatch(visual, /confirmation request in chat/i);
  assert.doesNotMatch(readme, /After your final confirmation/i);
});
