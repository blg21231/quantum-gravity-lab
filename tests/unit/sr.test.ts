import { describe, expect, it } from "vitest";
import { boost, composeK, composeRel, gamma, interval2, lengthContractionFactor, timeDilationFactor } from "../../src/sim/sr";
import { mulberry32 } from "../../src/sim/bell";

describe("SR engine exactness (AC1)", () => {
  it("Lorentz boost preserves the interval to ≤1e-12 over 1000 random cases", () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const e = { t: (rng() - 0.5) * 20, x: (rng() - 0.5) * 20 };
      const v = (rng() - 0.5) * 1.98;
      const b = boost(e, v);
      expect(Math.abs(interval2(b) - interval2(e))).toBeLessThanOrEqual(1e-12 * Math.max(1, Math.abs(interval2(e))));
    }
  });

  it("velocity composition of subluminal speeds is subluminal (1000 cases incl. 0.99∘0.99)", () => {
    const rng = mulberry32(7);
    expect(Math.abs(composeRel(0.99, 0.99))).toBeLessThan(1);
    for (let i = 0; i < 1000; i++) {
      const u = (rng() - 0.5) * 1.999;
      const v = (rng() - 0.5) * 1.999;
      expect(Math.abs(composeRel(u, v))).toBeLessThan(1);
    }
  });

  it("time dilation and length contraction equal 1/γ to ≤1e-12", () => {
    for (const v of [0.1, 0.5, 0.9, 0.99, 0.999]) {
      const g = gamma(v);
      expect(Math.abs(timeDilationFactor(v) - 1 / g)).toBeLessThanOrEqual(1e-12);
      expect(Math.abs(lengthContractionFactor(v) - 1 / g)).toBeLessThanOrEqual(1e-12);
      expect(Math.abs(g - 1 / Math.sqrt(1 - v * v))).toBeLessThanOrEqual(1e-12);
    }
  });
});

describe("K-family kinematics (AC2): the only two consistent kinematics", () => {
  it("K=0 reproduces Galilean addition to ≤1e-12", () => {
    const rng = mulberry32(3);
    for (let i = 0; i < 200; i++) {
      const u = (rng() - 0.5) * 10;
      const v = (rng() - 0.5) * 10;
      expect(Math.abs(composeK(u, v, 0) - (u + v))).toBeLessThanOrEqual(1e-12 * Math.max(1, Math.abs(u + v)));
    }
  });

  it("K=1/c² (c=1) reproduces the relativistic formula to ≤1e-12", () => {
    const rng = mulberry32(4);
    for (let i = 0; i < 200; i++) {
      const u = (rng() - 0.5) * 1.9;
      const v = (rng() - 0.5) * 1.9;
      const expected = (u + v) / (1 + u * v);
      expect(Math.abs(composeK(u, v, 1) - expected)).toBeLessThanOrEqual(1e-12 * Math.max(1, Math.abs(expected)));
    }
  });

  it("K>0 has an invariant speed: composing 1/√K with anything returns 1/√K", () => {
    for (const K of [0.25, 1, 4]) {
      const c = 1 / Math.sqrt(K);
      for (const v of [0.1 * c, 0.5 * c, 0.9 * c]) {
        expect(Math.abs(composeK(c, v, K) - c)).toBeLessThanOrEqual(1e-12 * c);
      }
    }
  });
});
