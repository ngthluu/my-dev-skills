import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const executablePath =
  process.env.CHROME_PATH || (existsSync(chrome) ? chrome : undefined);

test("offline decision aid supports keyboard choices, readable answers and reset", async () => {
  const browser = await chromium.launch({ executablePath });
  const directory = mkdtempSync(join(tmpdir(), "brainstorm-test-"));
  try {
    const source = resolve("skills/brainstorm/assets/decision-workspace.html");
    // Copy away from the installed skill to prove the generated aid is independent.
    copyFileSync(source, join(directory, "decision.html"));
    const page = await browser.newPage();
    page.setDefaultTimeout(1500);
    const requests = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto(pathToFileURL(join(directory, "decision.html")).href);
    await page.getByRole("radio", { name: /Q1-A/ }).focus();
    await page.keyboard.press("Space");
    assert.match(
      await page.getByLabel("Answer summary").inputValue(),
      /Q1: Q1-A/,
    );
    await page.keyboard.press("ArrowRight");
    assert.match(
      await page.getByLabel("Answer summary").inputValue(),
      /Q1: Q1-B/,
    );
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        configurable: true,
      }),
    );
    await page.getByRole("button", { name: "Copy answers" }).click();
    assert.match(await page.getByRole("status").textContent(), /select.*copy/i);
    assert.equal(
      await page
        .getByLabel("Answer summary")
        .evaluate((el) => el.selectionEnd - el.selectionStart),
      (await page.getByLabel("Answer summary").inputValue()).length,
    );
    await page.getByRole("button", { name: "Reset exploration" }).click();
    assert.equal(await page.getByRole("radio", { checked: true }).count(), 0);
    assert.match(
      await page.getByLabel("Answer summary").inputValue(),
      /No selections yet/,
    );
    assert.equal(requests.filter((url) => !url.startsWith("file:")).length, 0);
  } finally {
    await browser.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("examples stay offline and fit narrow screens in both themes", async () => {
  const browser = await chromium.launch({ executablePath });
  try {
    for (const name of ["layout-comparison.html", "review-flow.html"]) {
      for (const colorScheme of ["light", "dark"]) {
        const page = await browser.newPage({
          viewport: { width: 320, height: 740 },
          colorScheme,
          offline: true,
        });
        page.setDefaultTimeout(1500);
        const requests = [];
        page.on("request", (request) => requests.push(request.url()));
        await page.goto(
          pathToFileURL(resolve("skills/brainstorm/examples", name)).href,
        );
        assert.equal(await page.getByRole("radio").count(), 2);
        const cards = await page
          .locator(".card")
          .evaluateAll((nodes) =>
            nodes.map((el) => el.getBoundingClientRect().top),
          );
        assert.ok(cards[1] > cards[0], "Narrow screens stack comparison cards");
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        await page.getByRole("radio").first().focus();
        assert.equal(
          await page
            .getByRole("radio")
            .first()
            .evaluate((el) => getComputedStyle(el).outlineStyle),
          "solid",
        );
        await page.keyboard.press("Space");
        assert.match(
          await page.getByLabel("Answer summary").inputValue(),
          /Q\d: Q\d-A/,
        );
        const foreground = await page
          .locator("body")
          .evaluate((el) => getComputedStyle(el).color);
        assert.equal(
          foreground,
          colorScheme === "light" ? "rgb(23, 33, 47)" : "rgb(241, 244, 250)",
        );
        assert.equal(
          requests.filter((url) => !url.startsWith("file:")).length,
          0,
        );
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
});
