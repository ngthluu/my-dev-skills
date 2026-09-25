import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { parse } from "yaml";

const root = resolve(import.meta.dirname, "..");
test("four agent configurations discover three skills with resolvable packaged references", () => {
  for (const folder of [".claude-plugin", ".codex-plugin", ".cursor-plugin"]) {
    const metadata = JSON.parse(
      readFileSync(join(root, folder, "plugin.json"), "utf8"),
    );
    assert.equal(metadata.name, "my-skills");
    assert.equal(metadata.skills, "./skills/");
    assert.deepEqual(readdirSync(resolve(root, metadata.skills)).sort(), [
      "brainstorm",
      "debug",
      "implement",
    ]);
  }
  const opencode = JSON.parse(
    readFileSync(join(root, "opencode.json"), "utf8"),
  );
  assert.deepEqual(opencode.skills.paths, ["./skills"]);
  for (const name of ["brainstorm", "debug", "implement"]) {
    const dir = join(root, "skills", name);
    const skill = readFileSync(join(dir, "SKILL.md"), "utf8");
    const frontmatter = parse(skill.split("---")[1]);
    assert.equal(frontmatter.name, name);
    assert.ok(frontmatter.description.length > 20);
    assert.equal(frontmatter["disable-model-invocation"], true);
    assert.equal(frontmatter.metadata["opencode/autoinvoke"], "false");
    const agent = parse(readFileSync(join(dir, "agents/openai.yaml"), "utf8"));
    assert.equal(agent.policy.allow_implicit_invocation, false);
    assert.ok(agent.interface.default_prompt.includes(`$${name}`));
    assert.ok(
      agent.interface.short_description.length >= 25 &&
        agent.interface.short_description.length <= 64,
    );
    function links(folder) {
      for (const entry of readdirSync(folder, { withFileTypes: true })) {
        const file = join(folder, entry.name);
        if (entry.isDirectory()) links(file);
        else if (file.endsWith(".md")) {
          for (const match of readFileSync(file, "utf8").matchAll(
            /\]\(([^)]+)\)/g,
          )) {
            const target = match[1];
            if (/^(https?:|#)/.test(target)) continue;
            assert.ok(
              existsSync(resolve(dirname(file), target.split("#")[0])),
              `${file}: missing ${target}`,
            );
            assert.ok(
              resolve(dirname(file), target).startsWith(dir + "/"),
              `${file}: reference outside packaged skill`,
            );
          }
        }
      }
    }
    links(dir);
  }
});
