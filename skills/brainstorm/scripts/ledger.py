#!/usr/bin/env python3
"""Decision ledger for a brainstorm session, stored as <folder>/ledger.json."""
import argparse
import json
import re
import sys
from pathlib import Path

STATUSES = ["open", "blocked", "settled", "deferred", "contradicted"]
USAGE = f"""Usage: python3 ledger.py <folder> <command> [options]
  init
  add <id> --question <text> [--prereq <id,id>] [--impact <text>] [--minor]
  set <id> [--status <status>] [--answer <text>] [--source <text>] [--reason <text>]
           [--question <text>] [--prereq <id,id>] [--impact <text>]
  show [--status <status>]
  next
  audit
Statuses: {", ".join(STATUSES)}"""

parser = argparse.ArgumentParser(usage=USAGE, add_help=False)
parser.add_argument("positionals", nargs="*")
for option in ["question", "prereq", "impact", "status", "answer", "source", "reason"]:
    parser.add_argument(f"--{option}")
parser.add_argument("--minor", action="store_true")
values = parser.parse_args()
folder, command, key = (values.positionals + [None, None, None])[:3]
file = Path(folder) / "ledger.json" if folder else None


def fail(message):
    print(message, file=sys.stderr)
    sys.exit(1)


def load():
    if not file.exists():
        fail(f"No ledger at {file}. Run init first.")
    return json.loads(file.read_text())


def save(ledger):
    file.write_text(json.dumps(ledger, indent=2, ensure_ascii=False) + "\n")


def find(ledger, key):
    return next((q for q in ledger["questions"] if q["id"] == key), None) or fail(f"Unknown ID {key}.")


def prerequisites(ledger, text):
    ids = [p.strip() for p in text.split(",") if p.strip()] if text else []
    for p in ids:
        find(ledger, p)
    return ids


def line(q):
    prereq = ",".join(q["prerequisites"]) or "none"
    rows = [f"{q['id']} [{q['status']}{'' if q['material'] else ', minor'}] {q['question']} | Prerequisites: {prereq}"]
    if q["impact"]:
        rows.append(f"  Impact: {q['impact']}")
    if q["answer"]:
        rows.append(f"  Answer: {q['answer']} | Source: {q['source']}")
    if q["reason"]:
        rows.append(f"  Reason: {q['reason']}")
    return "\n".join(rows)


# Unanswered prerequisites block a question until they are settled or deferred.
def ready(ledger, q):
    return all(find(ledger, p)["status"] in ("settled", "deferred") for p in q["prerequisites"])


def problems(ledger):
    found = []
    for q in ledger["questions"]:
        if q["material"] and q["status"] in ("open", "blocked", "contradicted"):
            found.append(f"{q['id']} is {q['status']}")
        if q["status"] == "settled" and not (q["answer"] and q["source"]):
            found.append(f"{q['id']} is settled without an answer and source")
        if q["status"] == "deferred" and not q["reason"]:
            found.append(f"{q['id']} is deferred without a reason")
    return found


def natural(text):
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", text)]


def init():
    if file.exists():
        fail(f"{file} already exists.")
    save({"questions": []})
    print(f"Created {file}")


def add():
    ledger = load()
    if not key or not values.question:
        fail(USAGE)
    if any(q["id"] == key for q in ledger["questions"]):
        fail(f"{key} already exists.")
    q = {
        "id": key,
        "question": values.question,
        "prerequisites": prerequisites(ledger, values.prereq),
        "impact": values.impact or "",
        "material": not values.minor,
        "status": "open",
        "answer": "",
        "source": "",
        "reason": "",
    }
    ledger["questions"].append(q)
    save(ledger)
    print(line(q))


def set_():
    ledger = load()
    q = find(ledger, key)
    status = values.status or q["status"]
    if status not in STATUSES:
        fail(f"Unknown status {status}. Use one of: {', '.join(STATUSES)}.")
    if q["status"] == "settled" and status != "settled" and not values.reason:
        fail(f"Reopening settled {key} requires --reason.")
    for field in ["question", "impact", "answer", "source", "reason"]:
        if getattr(values, field) is not None:
            q[field] = getattr(values, field)
    if values.prereq is not None:
        q["prerequisites"] = prerequisites(ledger, values.prereq)
    if status == "settled" and not (q["answer"] and q["source"]):
        fail(f"Settling {key} requires --answer and --source.")
    if status in ("deferred", "contradicted", "blocked") and not q["reason"]:
        fail(f"Marking {key} {status} requires --reason.")
    q["status"] = status
    save(ledger)
    print(line(q))


def show():
    ledger = load()
    rows = [q for q in ledger["questions"] if not values.status or q["status"] == values.status]
    print("\n".join(map(line, rows)) if rows else "No entries.")


def next_():
    ledger = load()

    def unlocks(q):
        return sum(q["id"] in other["prerequisites"] for other in ledger["questions"])

    eligible = sorted(
        (q for q in ledger["questions"] if q["status"] == "open" and ready(ledger, q)),
        key=lambda q: (not q["material"], -unlocks(q), natural(q["id"])),
    )
    if eligible:
        print(line(eligible[0]))
        print(f"  Unlocks: {unlocks(eligible[0])}")
    else:
        print("No eligible open question.")


def audit():
    found = problems(load())
    if found:
        fail("Audit failed:\n" + "\n".join(f"- {p}" for p in found))
    print("Audit passed.")


commands = {"init": init, "add": add, "set": set_, "show": show, "next": next_, "audit": audit}

if not folder or command not in commands:
    fail(USAGE)
commands[command]()
