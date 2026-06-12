import { expect, test } from "@playwright/test";
import { ROUTES, gotoModule, trackConsoleErrors, trackRequests } from "./helpers";

const TAGS = ["established", "theoretical-prediction", "interpretation", "conjecture", "open-question"];

test("full journey: ≥9 module routes render, zero console errors, zero cross-origin requests (AC10/AC14)", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await page.goto("/");
  const { crossOrigin } = trackRequests(page);
  await expect(page.locator('[data-testid="module-cards"] a.card')).toHaveCount(10);
  await expect(page.locator('[data-testid="question-list"] li')).toHaveCount(9);

  expect(ROUTES.length).toBeGreaterThanOrEqual(9);
  for (const r of ROUTES) {
    await gotoModule(page, r);
    await expect(page.locator(`[data-module-root="${r}"]`)).toBeVisible();
    // every module page renders at least one tagged content panel
    expect(await page.locator("[data-panel]").count()).toBeGreaterThanOrEqual(1);
  }
  expect(crossOrigin, `cross-origin requests: ${crossOrigin.join(", ")}`).toHaveLength(0);
  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("driving-questions ledger: each Q renders on its route with question text + status (AC10)", async ({ page }) => {
  await page.goto("/");
  const items = page.locator('[data-testid="question-list"] li');
  await expect(items).toHaveCount(9);
  for (let i = 0; i < 9; i++) {
    const qid = await items.nth(i).getAttribute("data-question");
    expect(qid).toBe(`Q${i + 1}`);
  }
  // every route that owns a question shows its banner with the question text
  const expectQ = async (route: string, qid: string, fragment: string | RegExp) => {
    await gotoModule(page, route);
    const banner = page.locator(`.question-banner[data-question="${qid}"]`);
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(fragment);
    const status = await banner.locator(".qstatus").textContent();
    expect(["established", "partial", "open"]).toContain(status?.trim());
  };
  await expectQ("relativity", "Q1", "invariant speed");
  await expectQ("slits", "Q2", "infinite screens");
  await expectQ("planck", "Q3", "Planck-scale lattice");
  await expectQ("quantum", "Q4", "collapse, decoherence, many-worlds");
  await expectQ("entanglement", "Q5", "ER=EPR");
  await expectQ("blackhole", "Q6", "information paradox");
  await expectQ("graph", "Q7", "fundamental vs emergent");
  await expectQ("information", "Q8", "most fundamental layer");
  await expectQ("gravity", "Q9", "fundamental or emergent");
  // pinned honest statuses: Q4, Q5, Q7, Q8, Q9 never "established"
  for (const [route, qid] of [
    ["quantum", "Q4"],
    ["entanglement", "Q5"],
    ["graph", "Q7"],
    ["information", "Q8"],
    ["gravity", "Q9"],
  ] as const) {
    await gotoModule(page, route);
    const status = await page.locator(`.question-banner[data-question="${qid}"] .qstatus`).textContent();
    expect(["open", "partial"]).toContain(status?.trim());
  }
});

test("epistemic honesty walk: every panel tagged, pinned tags hold, 5 modules carry conjecture/open (AC12)", async ({ page }) => {
  const seenByModule = new Map<string, Set<string>>();
  const pinned: Record<string, string> = {
    "ent-erepr": "conjecture",
    "q-manyworlds": "interpretation",
    "bh-hawking": "theoretical-prediction",
    "slits-pathintegral": "established",
    "bh-infoparadox": "open-question",
    "info-itfrombit": "conjecture",
    "grav-emergent": "conjecture",
    "grav-collapse": "conjecture",
    "bh-holography": "conjecture",
    "pl-strings": "conjecture",
    "pl-lqg": "conjecture",
    "pl-causalsets": "conjecture",
  };
  const seenTags: Record<string, string> = {};
  for (const r of ROUTES) {
    await gotoModule(page, r);
    const panels = page.locator("[data-panel]");
    const count = await panels.count();
    expect(count, `module ${r} has no panels`).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < count; i++) {
      const p = panels.nth(i);
      const tag = await p.getAttribute("data-epistemic");
      const pid = await p.getAttribute("data-panel");
      expect(tag, `panel ${pid} untagged`).toBeTruthy();
      expect(TAGS, `panel ${pid} invalid tag ${tag}`).toContain(tag!);
      // the chip is visible and shows the tag text
      await expect(p.locator(".tag-chip")).toHaveText(tag!);
      seenTags[pid!] = tag!;
      if (!seenByModule.has(r)) seenByModule.set(r, new Set());
      seenByModule.get(r)!.add(tag!);
    }
  }
  for (const [pid, tag] of Object.entries(pinned)) {
    expect(seenTags[pid], `pinned panel ${pid}`).toBe(tag);
  }
  // anti-blanket-established: the five named modules each carry ≥1 conjecture/open panel
  for (const mod of ["quantum", "planck", "blackhole", "information", "gravity"]) {
    const tags = seenByModule.get(mod)!;
    expect(
      tags.has("conjecture") || tags.has("open-question"),
      `module ${mod} has no conjecture/open-question panel`,
    ).toBe(true);
  }
  // four named interpretations rendered with the interpretation tag (AC6e)
  for (const pid of ["q-copenhagen", "q-manyworlds", "q-pilotwave", "q-histories"]) {
    expect(seenTags[pid]).toBe("interpretation");
  }
});

test("concept graph renders and node-click navigates (AC11)", async ({ page }) => {
  await gotoModule(page, "graph");
  const f = await page.evaluate(() => (window as any).__QGLAB__.facts("concept-graph"));
  expect(f.nodes).toBeGreaterThanOrEqual(30);
  expect(f.edges).toBeGreaterThanOrEqual(50);
  // canvas actually drawn: non-trivial pixel variance
  const canvas = page.locator('[data-scene="concept-graph"] canvas');
  const shot = await canvas.screenshot();
  expect(shot.byteLength).toBeGreaterThan(4000);
  // click near a labeled node: use a label's position to aim the click
  const label = page.locator('[data-node-label="black-holes"]');
  await page.evaluate(() => (window as any).__QGLAB__.setPaused(true));
  await page.waitForTimeout(200);
  const box = await label.boundingBox();
  expect(box).toBeTruthy();
  // the node sphere sits just below its label
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height + 10);
  await page.waitForTimeout(400);
  expect(page.url()).toContain("#/blackhole");
  await page.evaluate(() => (window as any).__QGLAB__.setPaused(false));
});

test("cross-links navigate: relativity→planck, information→blackhole, gravity→graph (AC2/AC15/AC16)", async ({ page }) => {
  await gotoModule(page, "relativity");
  await page.locator('[data-crosslink="planck"]').click();
  await expect(page.locator('[data-module-root="planck"]')).toBeVisible();
  await gotoModule(page, "information");
  await page.locator('[data-crosslink="blackhole"]').click();
  await expect(page.locator('[data-module-root="blackhole"]')).toBeVisible();
  await gotoModule(page, "gravity");
  await page.locator('[data-crosslink="graph"]').click();
  await expect(page.locator('[data-module-root="graph"]')).toBeVisible();
});
