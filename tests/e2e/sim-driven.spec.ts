import { expect, test } from "@playwright/test";
import { action, facts, freezeResumeDiffs, gotoModule } from "./helpers";

// AC13: the three NAMED scenes each pass freeze/resume AND a parameter-causality
// magnitude law. A decorative clock-gated animation fails the causality limb.

test("slit-interference: freeze/resume + doubling separation halves the pixel-measured fringe spacing", async ({ page }) => {
  await gotoModule(page, "slits");
  const canvas = page.locator('[data-scene="slit-interference"] canvas');
  const { frozen, running } = await freezeResumeDiffs(page, canvas, 3200);
  expect(frozen).toBeLessThanOrEqual(0.001);
  expect(running).toBeGreaterThanOrEqual(0.01);

  // pixel-measured fringe spacing: scan the rendered curve (bright blue ink) per column
  const measure = async (): Promise<number> => {
    await page.waitForTimeout(250);
    return page.evaluate(() => {
      const c = document.querySelector('[data-scene="slit-interference"] canvas') as HTMLCanvasElement;
      const ctx = c.getContext("2d")!;
      const img = ctx.getImageData(0, 0, c.width, c.height).data;
      const W = c.width;
      const H = c.height;
      // for each column find the topmost "curve-blue" pixel → curve height
      const heights: number[] = [];
      for (let x = 0; x < W; x++) {
        let top = H;
        for (let y = 40; y < H - 10; y++) {
          const i = (y * W + x) * 4;
          const r = img[i];
          const g = img[i + 1];
          const b = img[i + 2];
          if (b > 160 && b > r + 40 && g > 90 && g < 220) {
            top = y;
            break;
          }
        }
        heights.push(H - top);
      }
      // peaks of the curve = interference maxima (windowed, with prominence)
      const peaks: number[] = [];
      const win = 12;
      const maxH = Math.max(...heights);
      for (let x = win; x < W - win; x++) {
        if (heights[x] < maxH * 0.35) continue;
        let isMax = true;
        for (let j = x - win; j <= x + win; j++) {
          if (j !== x && (heights[j] > heights[x] || (heights[j] === heights[x] && j < x))) {
            isMax = false;
            break;
          }
        }
        if (isMax) peaks.push(x);
      }
      if (peaks.length < 2) return NaN;
      const gaps = peaks.slice(1).map((p, i) => p - peaks[i]);
      return gaps.reduce((a, b) => a + b, 0) / gaps.length;
    });
  };

  const setSep = async (v: number) => {
    await page.locator('[data-testid="slit-separation"]').fill(String(v));
    await page.waitForTimeout(300);
  };
  await setSep(20);
  const s20 = await measure();
  await setSep(40);
  const s40 = await measure();
  expect(Number.isFinite(s20)).toBe(true);
  expect(Number.isFinite(s40)).toBe(true);
  const ratio = s20 / s40;
  expect(Math.abs(ratio - 2), `fringe ratio ${ratio} (s20=${s20}px, s40=${s40}px)`).toBeLessThanOrEqual(0.2);
});

test("wave-packet: freeze/resume + 4× mass cuts the late-time spread rate by ×4 within 10%", async ({ page }) => {
  await gotoModule(page, "quantum");
  const canvas = page.locator('[data-scene="wave-packet"] canvas');
  const { frozen, running } = await freezeResumeDiffs(page, canvas);
  expect(frozen).toBeLessThanOrEqual(0.001);
  expect(running).toBeGreaterThanOrEqual(0.01);

  // deterministic late-time measurement via the scene instruments
  await page.evaluate(() => (window as any).__QGLAB__.setPaused(true));
  const rate = async (mass: number): Promise<number> => {
    await action(page, "wave-packet", "setMass", mass);
    await action(page, "wave-packet", "reset0", 2);
    const a = (await action(page, "wave-packet", "ff", 150)) as { sigma: number };
    const b = (await action(page, "wave-packet", "ff", 200)) as { sigma: number };
    return (b.sigma - a.sigma) / 50;
  };
  const r1 = await rate(1);
  const r4 = await rate(4);
  const ratio = r1 / r4;
  expect(Math.abs(ratio - 4) / 4, `spread-rate ratio ${ratio}`).toBeLessThanOrEqual(0.1);
  await page.evaluate(() => (window as any).__QGLAB__.setPaused(false));
});

test("orbit-explorer: freeze/resume + doubling mass doubles the scene-measured photon-sphere and ISCO radii", async ({ page }) => {
  await gotoModule(page, "curvature");
  const canvas = page.locator('[data-scene="orbit-explorer"] canvas');
  const { frozen, running } = await freezeResumeDiffs(page, canvas, 3200);
  expect(frozen).toBeLessThanOrEqual(0.001);
  expect(running).toBeGreaterThanOrEqual(0.01);

  await action(page, "orbit-explorer", "setMass", 0.5);
  const f1 = await facts(page, "orbit-explorer");
  await action(page, "orbit-explorer", "setMass", 1.0);
  const f2 = await facts(page, "orbit-explorer");
  expect(Math.abs(f2.photonSphereWorldR / f1.photonSphereWorldR - 2)).toBeLessThanOrEqual(0.1);
  expect(Math.abs(f2.iscoWorldR / f1.iscoWorldR - 2)).toBeLessThanOrEqual(0.1);
  // and the values themselves sit at the engine's photon sphere (3M) and ISCO (6M)
  expect(Math.abs(f2.photonSphereWorldR - 3.0) / 3.0).toBeLessThanOrEqual(0.05);
  expect(Math.abs(f2.iscoWorldR - 6.0) / 6.0).toBeLessThanOrEqual(0.05);
});
