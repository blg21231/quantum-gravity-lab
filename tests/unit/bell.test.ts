import { describe, expect, it } from "vitest";
import {
  CHSH_OPTIMAL,
  TSIRELSON,
  chsh,
  mulberry32,
  sampleLHVCorrelation,
  sampleSingletCorrelation,
  singletCorrelationAnalytic,
} from "../../src/sim/bell";

describe("Bell is real (AC7)", () => {
  it("(a) singlet correlations match −cos(θ) within ±0.02 across 12 angle pairs at 1e5 samples", () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const b = a + Math.PI / 5 + i * 0.13;
      const E = sampleSingletCorrelation(a, b, 100_000, rng);
      expect(Math.abs(E - singletCorrelationAnalytic(a, b))).toBeLessThanOrEqual(0.02);
    }
  });

  it("(b) CHSH at optimal angles lands in [2.7, 2√2 + 0.03]", () => {
    const rng = mulberry32(123);
    const S = chsh(sampleSingletCorrelation, 200_000, rng, CHSH_OPTIMAL);
    expect(S).toBeGreaterThanOrEqual(2.7);
    expect(S).toBeLessThanOrEqual(TSIRELSON + 0.03);
  });

  it("(c) the LHV model through the SAME harness yields S ≤ 2.05", () => {
    const rng = mulberry32(321);
    const S = chsh(sampleLHVCorrelation, 200_000, rng, CHSH_OPTIMAL);
    expect(S).toBeLessThanOrEqual(2.05);
    // and across several other angle choices
    for (let i = 0; i < 5; i++) {
      const angles = { a: i * 0.3, a2: i * 0.3 + Math.PI / 2, b: 0.2 + i * 0.25, b2: 0.2 + i * 0.25 + Math.PI / 2 };
      expect(chsh(sampleLHVCorrelation, 100_000, rng, angles)).toBeLessThanOrEqual(2.05);
    }
  });
});
