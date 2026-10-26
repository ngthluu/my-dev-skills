#!/usr/bin/env node
// Decision ledger for a brainstorm session, stored as <folder>/ledger.json.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const STATUSES = ["open", "blocked", "settled", "deferred", "contradicted"];
const USAGE = `Usage: node ledger.mjs <folder> <command> [options]
  init
  add <id> --question <text> [--prereq <id,id>] [--impact <text>] [--minor]
  set <id> [--status <status>] [--answer <text>] [--source <text>] [--reason <text>]
           [--question <text>] [--prereq <id,id>] [--impact <text>]
  show [--status <status>]
  next
  audit
Statuses: ${STATUSES.join(", ")}`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    question: { type: "string" },
    prereq: { type: "string" },
    impact: { type: "string" },
    minor: { type: "boolean" },
    status: { type: "string" },
    answer: { type: "string" },
    source: { type: "string" },
    reason: { type: "string" },
  },
});
const [folder, command, id] = positionals;
const file = folder && join(folder, "ledger.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function load() {
  if (!existsSync(file)) fail(`No ledger at ${file}. Run init first.`);
  return JSON.parse(readFileSync(file, "utf8"));
}

function save(ledger) {
  writeFileSync(file, JSON.stringify(ledger, null, 2) + "\n");
}

function find(ledger, key) {
  return ledger.questions.find((q) => q.id === key) ?? fail(`Unknown ID ${key}.`);
}

function prerequisites(ledger, list) {
  const ids = list ? list.split(",").map((p) => p.trim()).filter(Boolean) : [];
  for (const p of ids) find(ledger, p);
  return ids;
}

function line(q) {
  const prereq = q.prerequisites.length ? q.prerequisites.join(",") : "none";
  const rows = [`${q.id} [${q.status}${q.material ? "" : ", minor"}] ${q.question} | Prerequisites: ${prereq}`];
  if (q.impact) rows.push(`  Impact: ${q.impact}`);
  if (q.answer) rows.push(`  Answer: ${q.answer} | Source: ${q.source}`);
  if (q.reason) rows.push(`  Reason: ${q.reason}`);
  return rows.join("\n");
}

// Unanswered prerequisites block a question until they are settled or deferred.
function ready(ledger, q) {
  return q.prerequisites.every((p) => ["settled", "deferred"].includes(find(ledger, p).status));
}

function problems(ledger) {
  const found = [];
  for (const q of ledger.questions) {
    if (q.material && ["open", "blocked", "contradicted"].includes(q.status)) found.push(`${q.id} is ${q.status}`);
    if (q.status === "settled" && !(q.answer && q.source)) found.push(`${q.id} is settled without an answer and source`);
    if (q.status === "deferred" && !q.reason) found.push(`${q.id} is deferred without a reason`);
  }
  return found;
}

const commands = {
  init() {
    if (existsSync(file)) fail(`${file} already exists.`);
    save({ questions: [] });
    console.log(`Created ${file}`);
  },
  add() {
    const ledger = load();
    if (!id || !values.question) fail(USAGE);
    if (ledger.questions.some((q) => q.id === id)) fail(`${id} already exists.`);
    const q = {
      id,
      question: values.question,
      prerequisites: prerequisites(ledger, values.prereq),
      impact: values.impact ?? "",
      material: !values.minor,
      status: "open",
      answer: "",
      source: "",
      reason: "",
    };
    ledger.questions.push(q);
    save(ledger);
    console.log(line(q));
  },
  set() {
    const ledger = load();
    const q = find(ledger, id);
    const status = values.status ?? q.status;
    if (!STATUSES.includes(status)) fail(`Unknown status ${status}. Use one of: ${STATUSES.join(", ")}.`);
    if (q.status === "settled" && status !== "settled" && !values.reason) fail(`Reopening settled ${id} requires --reason.`);
    for (const field of ["question", "impact", "answer", "source", "reason"]) {
      if (values[field] !== undefined) q[field] = values[field];
    }
    if (values.prereq !== undefined) q.prerequisites = prerequisites(ledger, values.prereq);
    if (status === "settled" && !(q.answer && q.source)) fail(`Settling ${id} requires --answer and --source.`);
    if (["deferred", "contradicted", "blocked"].includes(status) && !q.reason) fail(`Marking ${id} ${status} requires --reason.`);
    q.status = status;
    save(ledger);
    console.log(line(q));
  },
  show() {
    const ledger = load();
    const rows = ledger.questions.filter((q) => !values.status || q.status === values.status);
    console.log(rows.length ? rows.map(line).join("\n") : "No entries.");
  },
  next() {
    const ledger = load();
    const unlocks = (q) => ledger.questions.filter((other) => other.prerequisites.includes(q.id)).length;
    const eligible = ledger.questions
      .filter((q) => q.status === "open" && ready(ledger, q))
      .sort((a, b) => b.material - a.material || unlocks(b) - unlocks(a) || a.id.localeCompare(b.id, undefined, { numeric: true }));
    if (eligible.length) {
      console.log(line(eligible[0]));
      console.log(`  Unlocks: ${unlocks(eligible[0])}`);
    } else {
      console.log("No eligible open question.");
    }
  },
  audit() {
    const found = problems(load());
    if (found.length) fail(`Audit failed:\n${found.map((p) => `- ${p}`).join("\n")}`);
    console.log("Audit passed.");
  },
};

if (!folder || !commands[command]) fail(USAGE);
commands[command]();
