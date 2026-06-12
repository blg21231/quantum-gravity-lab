import { describe, expect, it } from "vitest";
import {
  decoherenceVisibility,
  evolve,
  gaussianPacket,
  makeGrid,
  moments,
  norm,
  sigmaAnalytic,
  tunnelingExperiment,
} from "../../src/sim/schrodinger";

describe("Wavefunction engine (AC6)", () => {
  it("(a) norm conserved within 1e-6 over 1000 steps", () => {
    const s = makeGrid(1024, -100, 100, 1);
    gaussianPacket(s, -20, 5, 2);
    const n0 = norm(s);
    evolve(s, (x) => 0.02 * x * x * 0, 0.01, 1000);
    expect(Math.abs(norm(s) - n0)).toBeLessThan(1e-6);
  });

  it("(b) free Gaussian dispersion matches σ(t) within 1%", () => {
    const sigma0 = 4;
    const mass = 1;
    const s = makeGrid(2048, -300, 300, mass);
    gaussianPacket(s, 0, sigma0, 0);
    const t = 30;
    const dt = 0.02;
    evolve(s, () => 0, dt, Math.round(t / dt));
    const { sigma } = moments(s);
    const expected = sigmaAnalytic(sigma0, mass, t);
    expect(Math.abs(sigma - expected) / expected).toBeLessThan(0.01);
  });

  it("(c) tunneling transmission matches the packet-weighted analytic coefficient within 5%", () => {
    const { numeric, analytic } = tunnelingExperiment();
    expect(Math.abs(numeric - analytic) / analytic).toBeLessThan(0.05);
  });

  it("(d) decoherence: visibility decreases monotonically to <10% as coupling rises", () => {
    const nEnv = 8;
    let prev = Infinity;
    const gs = [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.8, 1.0, 1.2, 1.4];
    for (const g of gs) {
      const v = decoherenceVisibility(g, nEnv);
      expect(v).toBeLessThanOrEqual(prev + 1e-12);
      prev = v;
    }
    expect(decoherenceVisibility(1.4, nEnv)).toBeLessThan(0.1);
  });
});
