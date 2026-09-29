import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const skill = readFileSync(
  resolve(import.meta.dirname, "../skills/implement/SKILL.md"),
  "utf8",
);
const sections = Object.fromEntries(
  [...skill.matchAll(/^## (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)].map(
    ([, title, body]) => [title.toLowerCase(), body],
  ),
);
const section = (topic) => {
  const match = Object.entries(sections).find(([title]) => title.includes(topic));
  assert.ok(match, `missing ${topic} section`);
  return match[1];
};

test("implement instructions expose an ordered, concise workflow and copyable reports", () => {
  const steps = [...skill.matchAll(/^## Step (\d+): (.+)$/gm)];
  const instructions = skill.replace(/```[\s\S]*?```/g, "").split("\n").filter((line) => /^- /.test(line));
  const setup = section("contract");
  const implementation = section("implement");
  const review = section("review");
  const finish = section("finish");

  assert.ok(steps.length >= 5, "workflow needs step-by-step headings");
  assert.deepEqual(steps.map((match) => Number(match[1])), steps.map((_, index) => index + 1));
  for (const [name, body] of Object.entries({ setup, implementation, review, finish })) {
    assert.match(body, /^- /m, `${name} needs short instructions below its heading`);
  }
  assert.ok(instructions.length >= 5);
  assert.ok(instructions.every((line) => line.length <= 150 && !line.includes(";")),
    "keep bullets short without semicolon-linked clauses");
  assert.match(implementation, /public (?:test )?seam/i);
  assert.match(implementation, /red[\s\S]*green/i);
  assert.match(review, /requirements[\s\S]*code/i);
  assert.match(review, /read.only/i);
  assert.match(review, /fix/i);
  const finalTemplate = finish.match(/```[^\n]*\n([\s\S]*?)\n```/)?.[1];
  const reviewTemplate = review.match(/```[^\n]*\n([\s\S]*?)\n```/)?.[1];
  assert.ok(finalTemplate, "finish needs a copyable report template");
  assert.ok(reviewTemplate, "review needs a copyable findings template");
  assert.match(finalTemplate, /(?:changed|files)[\s\S]*(?:checks|tests)[\s\S]*review[\s\S]*(?:limitations|blockers)/i);
  assert.match(reviewTemplate, /verdict[\s\S]*finding/i);
  assert.ok(skill.trim().split(/\s+/).length < 1082, "skill should be shorter than its baseline");
});
