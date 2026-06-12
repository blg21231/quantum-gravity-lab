import { expect, test } from "@playwright/test";
import { action, facts, gotoModule, pixelDiffFraction, setRange } from "./helpers";

test("relativity: boost slider re-renders the diagram, light cone stays invariant (AC1)", async ({ page }) => {
  await gotoModule(page, "relativity");
  await page.evaluate(() => (window as any).__QGLAB__.setPaused(true));
  await page.waitForTimeout(200);
  const canvas = page.locator('[data-scene="spacetime-diagram"] canvas');
  const conePixels = () =>
    page.evaluate(() => {
      const c = document.querySelector('[data-scene="spacetime-diagram"] canvas') as HTMLCanvasElement;
      const ctx = c.getContext("2d")!;
      const img = ctx.getImageData(0, 0, c.width, c.height).data;
      const cx = c.width / 2;
      const cy = c.height / 2;
      // sample along both light-cone diagonals; count cone-colored (orange) pixels
      let hits = 0;
      let total = 0;
      for (let t = -180; t <= 180; t += 6) {
        for (const sgn of [1, -1]) {
          const x = Math.round(cx + t);
          const y = Math.round(cy - sgn * t);
          const i = (y * c.width + x) * 4;
          const r = img[i];
          const g = img[i + 1];
          const b = img[i + 2];
          total++;
          if (r > 180 && g > 120 && b < 150) hits++;
        }
      }
      return hits / total;
    });
  const before = await canvas.screenshot();
  const coneBefore = await conePixels();
  await page.locator('[data-testid="boost"]').fill("0.6");
  await page.waitForTimeout(250);
  const after = await canvas.screenshot();
  const coneAfter = await conePixels();
  expect(await pixelDiffFraction(before, after)).toBeGreaterThanOrEqual(0.01);
  // the cone was drawn before and is still drawn at the same slopes after the boost
  expect(coneBefore).toBeGreaterThanOrEqual(0.9);
  expect(coneAfter).toBeGreaterThanOrEqual(0.9);
  await page.evaluate(() => (window as any).__QGLAB__.setPaused(false));
});

test("relativity: the K-knob deforms the composition law live (AC2)", async ({ page }) => {
  await gotoModule(page, "relativity");
  const canvas = page.locator('[data-scene="k-family"] canvas');
  const k1 = await canvas.screenshot();
  await page.locator('[data-testid="k-knob"]').fill("0");
  await page.waitForTimeout(250);
  const k0 = await canvas.screenshot();
  expect(await pixelDiffFraction(k1, k0)).toBeGreaterThanOrEqual(0.005);
  // minimum-length treatment present with honest tag
  const panel = page.locator('[data-panel="rel-minlength"]');
  await expect(panel).toBeVisible();
  expect(await panel.getAttribute("data-epistemic")).toBe("open-question");
});

test("slits: N and M controls recompute the pattern; phasors respond to the action scale (AC5b/e)", async ({ page }) => {
  await gotoModule(page, "slits");
  await page.evaluate(() => (window as any).__QGLAB__.setPaused(true));
  await page.waitForTimeout(200);
  const canvas = page.locator('[data-scene="slit-interference"] canvas');
  const base = await canvas.screenshot();
  await page.locator('[data-testid="slit-count"]').fill("6");
  await page.waitForTimeout(250);
  const n6 = await canvas.screenshot();
  expect(await pixelDiffFraction(base, n6)).toBeGreaterThanOrEqual(0.005);
  await page.locator('[data-testid="screen-count"]').fill("3");
  await page.waitForTimeout(250);
  const m3 = await canvas.screenshot();
  expect(await pixelDiffFraction(n6, m3)).toBeGreaterThanOrEqual(0.002);
  const f = await facts(page, "slit-interference");
  expect(f.nSlits).toBe(6);
  expect(f.layers).toBe(3);
  // phasor arrows: cranking action/ħ visibly re-curls the arrows
  const ph = page.locator('[data-scene="phasors"] canvas');
  const p1 = await ph.screenshot();
  await page.locator('[data-testid="action-scale"]').fill("60");
  await page.waitForTimeout(250);
  const p2 = await ph.screenshot();
  expect(await pixelDiffFraction(p1, p2)).toBeGreaterThanOrEqual(0.005);
  await page.evaluate(() => (window as any).__QGLAB__.setPaused(false));
});

test("bell: live correlation tracks −cosθ as angles move; quantum beats LHV (AC7)", async ({ page }) => {
  await gotoModule(page, "entanglement");
  const f1 = await facts(page, "bell");
  expect(Math.abs((f1.quantumE as number) - (f1.analyticE as number))).toBeLessThanOrEqual(0.05);
  await setRange(page, "angle-b", Math.PI / 2);
  const f2 = await facts(page, "bell");
  expect(Math.abs((f2.angleB as number) - Math.PI / 2)).toBeLessThanOrEqual(0.02);
  expect(Math.abs((f2.quantumE as number) - (f2.analyticE as number))).toBeLessThanOrEqual(0.05);
  expect(f2.analyticE).not.toBeCloseTo(f1.analyticE as number, 2);
  // CHSH: quantum in the Tsirelson band, LHV under the classical bound
  expect(f2.chshQuantum).toBeGreaterThanOrEqual(2.6);
  expect(f2.chshQuantum).toBeLessThanOrEqual(2 * Math.SQRT2 + 0.06);
  expect(f2.chshLHV).toBeLessThanOrEqual(2.08);
});

test("planck: boosting shears the lattice and re-renders both point sets (AC9b)", async ({ page }) => {
  await gotoModule(page, "planck");
  const canvas = page.locator('[data-scene="lattice-vs-sprinkling"] canvas');
  const before = await canvas.screenshot();
  await page.locator('[data-testid="lattice-boost"]').fill("0.6");
  await page.waitForTimeout(250);
  const after = await canvas.screenshot();
  expect(await pixelDiffFraction(before, after)).toBeGreaterThanOrEqual(0.01);
});

test("information: live entanglement entropy hits the analytic anchors (AC15a)", async ({ page }) => {
  await gotoModule(page, "information");
  const setTheta = (v: number) => setRange(page, "ent-theta", v);
  await setTheta(0);
  expect((await facts(page, "entanglement-entropy")).entropyBits).toBeLessThanOrEqual(1e-9);
  await setTheta(Math.PI / 4);
  expect(Math.abs(((await facts(page, "entanglement-entropy")).entropyBits as number) - 1)).toBeLessThanOrEqual(1e-6);
  // record creation: MI rises with coupling
  await page.locator('[data-testid="mi-coupling"]').fill("0.2");
  await page.waitForTimeout(150);
  const lo = await facts(page, "record-creation");
  await page.locator('[data-testid="mi-coupling"]').fill("1.3");
  await page.waitForTimeout(150);
  const hi = await facts(page, "record-creation");
  expect(hi.mutualInformation).toBeGreaterThan(lo.mutualInformation as number);
  expect(hi.visibility).toBeLessThan(lo.visibility as number);
  // Bekenstein table present with the solar preset
  await expect(page.locator('[data-testid="bekenstein-table"] tr[data-preset="solar"]')).toBeVisible();
});

test("gravity: the drop test proves mass-independence and animates (AC16a)", async ({ page }) => {
  await gotoModule(page, "gravity");
  const f = await facts(page, "drop-test");
  expect(f.massRatio).toBe(1e6);
  expect(f.maxTrajectoryDivergence).toBeLessThanOrEqual(1e-10);
  const canvas = page.locator('[data-scene="drop-test"] canvas');
  const a = await canvas.screenshot();
  await page.waitForTimeout(900);
  const b = await canvas.screenshot();
  expect(await pixelDiffFraction(a, b)).toBeGreaterThanOrEqual(0.003);
  // fundamental-vs-emergent treatment present with honest tags
  expect(await page.locator('[data-panel="grav-emergent"]').getAttribute("data-epistemic")).toBe("conjecture");
  expect(await page.locator('[data-panel="grav-collapse"]').getAttribute("data-epistemic")).toBe("conjecture");
  expect(await page.locator('[data-panel="grav-nonrenorm"]').getAttribute("data-epistemic")).toBe("established");
});

test("quantum: decoherence slider kills the fringes (AC6d rendered)", async ({ page }) => {
  await gotoModule(page, "quantum");
  await page.locator('[data-testid="coupling"]').fill("0");
  await page.waitForTimeout(150);
  const v0 = (await facts(page, "decoherence")).visibility as number;
  await page.locator('[data-testid="coupling"]').fill("1.5");
  await page.waitForTimeout(150);
  const v1 = (await facts(page, "decoherence")).visibility as number;
  expect(v0).toBeGreaterThan(0.99);
  expect(v1).toBeLessThan(0.1);
  void action;
});
