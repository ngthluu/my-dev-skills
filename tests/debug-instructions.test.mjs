import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

const skill = readFileSync(resolve(import.meta.dirname, "../skills/debug/SKILL.md"), "utf8");
const [, frontmatter, body] = skill.split(/^---\s*$/m);
const steps = [...body.matchAll(/^## Step (\d+): (.+)$/gm)];
const templates = [...body.matchAll(/```text\n([\s\S]*?)\n```/g)].map((match) => match[1]);

test("debug retains invocation metadata and concise, scannable workflow", () => {
  const metadata = parse(frontmatter);
  assert.equal(metadata.name, "debug");
  assert.equal(metadata["disable-model-invocation"], true);
  assert.equal(metadata.metadata["opencode/autoinvoke"], "false");
  assert.ok(steps.length >= 5, "workflow has step-by-step headings");
  assert.match(body, /^- .+$/m, "instructions appear as bullets");
  assert.ok(skill.trim().split(/\s+/).length < 1235, "shorter than baseline");
});

test("debug gives copyable progress and final-report templates", () => {
  assert.equal(templates.length, 2);
  const [progress, final] = templates;
  for (const field of [/evidence/i, /hypothes/i, /next probe/i]) {
    assert.match(progress, field);
  }
  for (const field of [/symptom/i, /reproduc/i, /root cause/i, /change/i,
    /review/i, /verif/i, /limit/i]) {
    assert.match(final, field);
  }
});

test("debug actions stay ordered with nearby rules", () => {
  const numbers = steps.map((match) => Number(match[1]));
  assert.deepEqual(numbers, numbers.map((_, index) => index + 1));

  const workflowSections = body.split(/^## /m).slice(1);
  assert.ok(workflowSections.every((section) => /^- .+$/m.test(section)));
  const instructions = body.replace(/```[\s\S]*?```/g, "").split("\n").filter((line) => /^- /.test(line));
  assert.ok(instructions.every((line) => line.length <= 150 && !line.includes(";")),
    "keep bullets short without semicolon-linked clauses");
});
