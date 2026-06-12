import { describe, expect, it } from "vitest";
import {
  BH_PRESETS,
  C,
  G,
  HBAR,
  KB,
  M_SUN,
  PLANCK_LENGTH,
  bhEntropyOverKb,
  evaporationLifetime,
  hawkingTemperature,
  horizonArea,
  horizonBits,
  landauerLimit,
  schwarzschildRadius,
} from "../../src/sim/hawking";

describe("Hawking calculator (AC8c) — analytic within 0.1% for 3 presets", () => {
  it("temperature T = ħc³/(8πGMk) for all presets", () => {
    for (const p of BH_PRESETS) {
      const expected = (HBAR * C ** 3) / (8 * Math.PI * G * p.massKg * KB);
      expect(Math.abs(hawkingTemperature(p.massKg) - expected) / expected).toBeLessThan(0.001);
    }
    // order-of-magnitude pin: solar-mass T ≈ 6.2e-8 K
    const tSun = hawkingTemperature(M_SUN);
    expect(tSun).toBeGreaterThan(5.5e-8);
    expect(tSun).toBeLessThan(7e-8);
  });

  it("entropy S/k = A/(4 l_p²) and bits = S/(k ln2) for all presets", () => {
    for (const p of BH_PRESETS) {
      const rs = (2 * G * p.massKg) / C ** 2;
      const A = 4 * Math.PI * rs * rs;
      const expected = A / (4 * PLANCK_LENGTH ** 2);
      expect(Math.abs(bhEntropyOverKb(p.massKg) - expected) / expected).toBeLessThan(0.001);
      expect(Math.abs(horizonBits(p.massKg) - expected / Math.LN2) / (expected / Math.LN2)).toBeLessThan(0.001);
      expect(Math.abs(horizonArea(p.massKg) - A) / A).toBeLessThan(0.001);
      expect(Math.abs(schwarzschildRadius(p.massKg) - rs) / rs).toBeLessThan(0.001);
    }
  });

  it("lifetime ∝ M³ within 0.1%", () => {
    const t1 = evaporationLifetime(1e12);
    const t2 = evaporationLifetime(2e12);
    expect(Math.abs(t2 / t1 - 8) / 8).toBeLessThan(0.001);
    for (const p of BH_PRESETS) {
      const expected = (5120 * Math.PI * G * G * p.massKg ** 3) / (HBAR * C ** 4);
      expect(Math.abs(evaporationLifetime(p.massKg) - expected) / expected).toBeLessThan(0.001);
    }
  });

  it("Landauer limit kT·ln2 within 0.1% at 3 temperatures (AC15b)", () => {
    for (const T of [0.1, 300, 1e6]) {
      expect(Math.abs(landauerLimit(T) - KB * T * Math.LN2) / (KB * T * Math.LN2)).toBeLessThan(0.001);
    }
  });
});
