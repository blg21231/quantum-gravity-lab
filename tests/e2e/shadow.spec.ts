import { expect, test } from "@playwright/test";
import { PNG } from "pngjs";
import { action, facts, gotoModule } from "./helpers";

// AC8(a,b): the rendered shadow's pixel-measured angular size matches the analytic
// 3√3·r_s(M) prediction within 5%, at each of ≥3 mass presets (a scaling law, not
// just monotonicity). Measured disk-off (the accretion disk is foreground, not shadow).

test("black-hole shadow matches the analytic scaling law across 3 masses (AC8)", async ({ page }) => {
  test.setTimeout(240_000);
  await gotoModule(page, "blackhole");
  await page.evaluate(() => (window as any).__QGLAB__.setPaused(true));
  await action(page, "bh-lensing", "setDisk", false);
  await action(page, "bh-lensing", "setFlatSky", true);

  for (const mu of [1, 2, 3]) {
    await action(page, "bh-lensing", "setMass", mu);
    await page.waitForTimeout(300);
    const f = await facts(page, "bh-lensing");
    const canvas = page.locator('[data-scene="bh-lensing"] canvas');
    const shot = PNG.sync.read(await canvas.screenshot());
    const W = shot.width;
    const H = shot.height;
    // radial first-crossing scan from the center: the photon-ring glow sits exactly at
    // the shadow boundary (b = b_c), giving a bright fiducial edge in every direction
    const lumAt = (x: number, y: number) => {
      const i = (Math.round(y) * W + Math.round(x)) * 4;
      return 0.299 * shot.data[i] + 0.587 * shot.data[i + 1] + 0.114 * shot.data[i + 2];
    };
    const cx = W / 2;
    const cy = H / 2;
    const radii: number[] = [];
    for (let k = 0; k < 24; k++) {
      const ang = (k / 24) * 2 * Math.PI;
      for (let r = 4; r < Math.min(W, H) / 2 - 2; r += 0.5) {
        const x = cx + r * Math.cos(ang);
        const y = cy + r * Math.sin(ang);
        if (lumAt(x, y) > 128) {
          radii.push(r);
          break;
        }
      }
    }
    expect(radii.length).toBeGreaterThanOrEqual(20);
    radii.sort((a, b) => a - b);
    const rPx = radii[Math.floor(radii.length / 2)];
    // pixel radius → angle (screenshot scale vs internal canvas handled via height ratio)
    const fov = f.fovY as number;
    const measuredAngle = Math.atan(Math.tan(fov / 2) * ((2 * rPx) / H));
    const expected = f.expectedShadowAngularRadius as number;
    const relErr = Math.abs(measuredAngle - expected) / expected;
    expect(relErr, `μ=${mu}: measured ${measuredAngle.toFixed(4)} vs analytic ${expected.toFixed(4)} (rel ${relErr.toFixed(3)})`).toBeLessThanOrEqual(0.05);
  }
  await action(page, "bh-lensing", "setFlatSky", false);
  await action(page, "bh-lensing", "setDisk", true);
  await page.evaluate(() => (window as any).__QGLAB__.setPaused(false));
});

test("Hawking calculator matches the analytic formulas (rendered values, AC8c)", async ({ page }) => {
  await gotoModule(page, "blackhole");
  // SI constants, independent recomputation
  const G = 6.6743e-11;
  const C = 299792458;
  const HBAR = 1.054571817e-34;
  const KB = 1.380649e-23;
  const LP2 = (HBAR * G) / C ** 3;
  const masses: Record<string, number> = { primordial: 1e12, solar: 1.98892e30, sgrA: 4.15e6 * 1.98892e30 };
  for (const [id, m] of Object.entries(masses)) {
    const row = page.locator(`tr[data-preset="${id}"]`);
    const temp = parseFloat((await row.locator('[data-field="temp"]').textContent())!);
    const bits = parseFloat((await row.locator('[data-field="bits"]').textContent())!);
    const life = parseFloat((await row.locator('[data-field="lifetime"]').textContent())!);
    const expT = (HBAR * C ** 3) / (8 * Math.PI * G * m * KB);
    const rs = (2 * G * m) / C ** 2;
    const expBits = (4 * Math.PI * rs * rs) / (4 * LP2) / Math.LN2;
    const expLife = (5120 * Math.PI * G * G * m ** 3) / (HBAR * C ** 4);
    expect(Math.abs(temp - expT) / expT).toBeLessThanOrEqual(0.001);
    expect(Math.abs(bits - expBits) / expBits).toBeLessThanOrEqual(0.001);
    expect(Math.abs(life - expLife) / expLife).toBeLessThanOrEqual(0.001);
  }
});
