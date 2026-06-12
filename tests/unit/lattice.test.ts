import { describe, expect, it } from "vitest";
import { mulberry32 } from "../../src/sim/bell";
import {
  boostPoint,
  meanDiamondCount,
  meanNearestNeighbor,
  poissonSprinkling,
  regularLattice,
} from "../../src/sim/sprinkling";
import { interval2 } from "../../src/sim/sr";

describe("The lattice meets Lorentz (AC9a)", () => {
  it("the boost preserves intervals to ≤1e-12", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 500; i++) {
      const p = { t: (rng() - 0.5) * 10, x: (rng() - 0.5) * 10 };
      const b = boostPoint(p, 0.6);
      expect(Math.abs(interval2(b) - interval2(p))).toBeLessThanOrEqual(1e-12 * Math.max(1, Math.abs(interval2(p))));
    }
  });

  it("a regular lattice picks out a frame: nearest-neighbor spacing changes under boost", () => {
    const lat = regularLattice(10, 1);
    const boosted = lat.map((p) => boostPoint(p, 0.6));
    const nn0 = meanNearestNeighbor(lat);
    const nn1 = meanNearestNeighbor(boosted);
    // boost shears the lattice; mean Euclidean NN spacing shifts detectably (>5%)
    expect(Math.abs(nn1 - nn0) / nn0).toBeGreaterThan(0.05);
  });

  it("a Poisson sprinkling's causal-diamond counts are boost-invariant within sampling error", () => {
    const rng = mulberry32(11);
    const L = 40;
    const rho = 3;
    const tau = 1.5;
    const trials = 24;
    const ratios: number[] = [];
    for (let k = 0; k < trials; k++) {
      const pts = poissonSprinkling(L, rho, rng);
      const boosted = pts.map((p) => boostPoint(p, 0.5));
      const m0 = meanDiamondCount(pts, L / 2, tau, 60, rng);
      const m1 = meanDiamondCount(boosted, L / 2, tau, 60, rng);
      ratios.push(m1 / m0);
    }
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    // invariant statistics: mean ratio within 5% of 1
    expect(Math.abs(mean - 1)).toBeLessThan(0.05);
  });
});
