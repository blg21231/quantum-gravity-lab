import { describe, expect, it } from "vitest";
import {
  freePropagator,
  layeredPropagatorError,
  measureFringeSpacing,
  nSlitAnalytic,
  phasorArrows,
  slitPattern,
  stationaryPhaseTubeWidth,
} from "../../src/sim/pathint";

describe("Slits all the way down (AC5)", () => {
  const lambda = 0.5;
  const d = 30;
  const a = 4;
  const L = 40_000;

  it("(a) numeric two-slit pattern matches analytic within 2% RMS; fringe spacing = λL/d within 2%", () => {
    const nPts = 1200;
    const span = 2200;
    const ys = new Float64Array(nPts);
    for (let i = 0; i < nPts; i++) ys[i] = -span + (2 * span * i) / (nPts - 1);
    const I = slitPattern(ys, 2, d, a, lambda, L);
    let num = 0;
    let den = 0;
    for (let i = 0; i < nPts; i++) {
      const theta = Math.atan2(ys[i], L);
      const ana = nSlitAnalytic(theta, 2, d, a, lambda);
      num += (I[i] - ana) * (I[i] - ana);
      den += ana * ana;
    }
    expect(Math.sqrt(num / den)).toBeLessThan(0.02);
    const spacing = measureFringeSpacing(ys, I);
    const expected = (lambda * L) / d;
    expect(Math.abs(spacing - expected) / expected).toBeLessThan(0.02);
  });

  it("(c) layered slit-sum converges to the free propagator: error strictly decreases as slits+layers refine AND finest ≤2%", () => {
    // genuinely-discrete slit screens refined through the convergence cliff:
    // layers double each level, slit density more than doubles
    const errs = [
      layeredPropagatorError(2, 141),
      layeredPropagatorError(4, 341),
      layeredPropagatorError(8, 741),
    ];
    for (let i = 1; i < errs.length; i++) expect(errs[i]).toBeLessThan(errs[i - 1]);
    expect(errs[errs.length - 1]).toBeLessThanOrEqual(0.02);
  });

  it("(e) phasor arrows: phase is even in the kink offset, zero on the classical path, and |K| = √(m/2πT)", () => {
    const arrows = phasorArrows(10, 3, 81);
    const mid = arrows[(arrows.length - 1) / 2];
    expect(mid.c).toBeCloseTo(0, 12);
    expect(mid.phase).toBeCloseTo(0, 12);
    for (let i = 0; i < arrows.length; i++) {
      const mirror = arrows[arrows.length - 1 - i];
      expect(arrows[i].phase).toBeCloseTo(mirror.phase, 9);
      expect(arrows[i].phase).toBeGreaterThanOrEqual(0);
    }
    const K = freePropagator(1.3, 0.2, 2, 1.5);
    expect(Math.hypot(K.re, K.im)).toBeCloseTo(Math.sqrt(1.5 / (2 * Math.PI * 2)), 12);
  });

  it("(d) stationary phase: 90%-amplitude tube shrinks monotonically as action/ħ scales ×100", () => {
    const widths = [stationaryPhaseTubeWidth(1), stationaryPhaseTubeWidth(10), stationaryPhaseTubeWidth(100)];
    expect(widths[1]).toBeLessThan(widths[0]);
    expect(widths[2]).toBeLessThan(widths[1]);
    expect(widths[2]).toBeLessThan(widths[0] / 3);
  });
});
