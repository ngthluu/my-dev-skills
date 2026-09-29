import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const skill = readFileSync(resolve(root, "skills/brainstorm/SKILL.md"), "utf8");
const visual = readFileSync(resolve(root, "skills/brainstorm/references/visual-workspace.md"), "utf8");
const readme = readFileSync(resolve(root, "README.md"), "utf8");

test("brainstorm presents a short, ordered workflow with copyable handoff artifacts", () => {
  const steps = [...skill.matchAll(/^## Step (\d+): (.+)$/gm)];
  const templates = [...skill.matchAll(/```(?:text|markdown)\n([\s\S]*?)\n```/g)].map((match) => match[1]);
  const instructions = skill.replace(/```[\s\S]*?```/g, "").split("\n").filter((line) => /^- /.test(line));

  assert.ok(steps.length >= 5, "workflow needs step-by-step headings");
  assert.deepEqual(steps.map((match) => Number(match[1])), steps.map((_, index) => index + 1));
  assert.ok(instructions.length >= 5, "instructions should sit below the steps as bullets");
  assert.ok(instructions.every((line) => line.length <= 150 && !line.includes(";")),
    "keep bullets short without semicolon-linked clauses");
  assert.ok(templates.some((template) => [
    /question/i, /prerequisites/i, /impact/i, /status/i,
    /answer/i, /source/i, /reason/i,
  ].every((field) => field.test(template))), "copyable decision ledger template");
  const handoff = templates.find((template) =>
    /(?:status|date|source)/i.test(template)
    && /current state/i.test(template)
    && /decisions/i.test(template)
    && /requirements/i.test(template)
    && /acceptance criteria/i.test(template)
    && /test seams/i.test(template)
    && /risks/i.test(template)
  );
  assert.ok(handoff, "copyable handoff spec template");
  assert.doesNotMatch(handoff, /, and handoff|Use \$implement with docs\/specs\/yyyy-mm-dd-<slug>\.md\./);
  assert.match(skill, /Tell the user to start a new session with `Use \$implement with <spec-path>\.`/);
  assert.ok(skill.trim().split(/\s+/).length < 1126, "shorter than the original skill");
});

test("brainstorm retains decision reconciliation and one-question selection", () => {
  assert.match(skill, /dependency graph/i);
  assert.match(skill, /stable ID/i);
  assert.match(skill, /settled.*open.*blocked.*deferred.*contradicted/is);
  assert.match(skill, /(?:whole|entire|all).*(?:latest message|new evidence)/i);
  assert.match(skill, /(?:several|multiple).*(?:decision|node)/i);
  assert.match(skill, /(?:partial|ambiguous)/i);
  assert.match(skill, /contradict/i);
  assert.match(skill, /prerequisites/i);
  assert.match(skill, /(?:impact|unlock)/i);
  assert.match(skill, /tie.*stable ID/i);
  assert.match(skill, /(?:exactly|only) one.*(?:open|eligible|question)/i);
  assert.match(skill, /(?:dedicated|host).*question tool/i);
  assert.match(skill, /(?:unavailable|restricted|unsuitable)/i);
  assert.match(skill, /plain chat question/i);
  assert.match(skill, /final response/i);
  assert.match(skill, /wait for.*answer/i);
});

test("brainstorm keeps visual authority and fresh-session handoff", () => {
  assert.match(skill, /\[references\/visual-workspace\.md\]\(references\/visual-workspace\.md\)/);
  assert.match(skill, /(?:spatial|stateful|comparative|quantitative)/i);
  assert.match(skill, /chat.*(?:authoritative|input channel)/i);
  assert.match(skill, /(?:Markdown spec|spec).*canonical/i);
  assert.match(skill, /(?:without|no).*confirmation/i);
  assert.match(skill, /docs\/specs\/yyyy-mm-dd-<slug>\.md/);
  assert.match(skill, /fresh.*session/i);
  assert.doesNotMatch(visual, /confirmation request in chat/i);
  assert.doesNotMatch(readme, /After your final confirmation/i);
});
