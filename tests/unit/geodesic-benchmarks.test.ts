import { describe, expect, it } from "vitest";
import {
  circularL,
  criticalImpactParameter,
  findISCO,
  findPhotonSphere,
  gravitationalTimeDilation,
  measurePrecession,
  photonCaptured,
  photonDeflection,
  slowScatteringComparison,
  trajectoryForTestMass,
} from "../../src/sim/geodesic";

const M = 1;

describe("Schwarzschild geodesic engine (AC3)", () => {
  it("(a) perihelion precession matches 6πM/(a(1−e²)) within 1% on 3 distinct orbits", () => {
    const cases = [
      { r0: 700, L: Math.sqrt((M * 700 * 580) / ((700 + 580) / 2 - 3 * M) / 2) },
    ];
    void cases;
    for (const { r0, lFrac } of [
      { r0: 600, lFrac: 0.985 },
      { r0: 900, lFrac: 0.99 },
      { r0: 1400, lFrac: 0.992 },
    ]) {
      const L = circularL(r0, M) * lFrac; // slightly sub-circular → eccentric bound orbit
      const res = measurePrecession(M, r0, L, 3, r0 / 4000);
      const relErr = Math.abs(res.perOrbitPrecession - res.analytic) / res.analytic;
      expect(relErr).toBeLessThan(0.01);
    }
  });

  it("(b) energy conserved: drift ≤1e-8 per orbit", () => {
    const r0 = 600;
    const L = circularL(r0, M) * 0.985;
    const res = measurePrecession(M, r0, L, 3, r0 / 4000);
    expect(res.energyDriftPerOrbit).toBeLessThanOrEqual(1e-8);
  });

  it("(c) photon capture boundary at b_c = 3√3·M sharp within 1%; photon sphere 3M and ISCO 6M within 0.5%", () => {
    const bc = criticalImpactParameter(M);
    expect(photonCaptured(M, bc * 0.99)).toBe(true);
    expect(photonCaptured(M, bc * 1.01)).toBe(false);
    expect(Math.abs(findPhotonSphere(M) - 3 * M) / (3 * M)).toBeLessThan(0.005);
    expect(Math.abs(findISCO(M) - 6 * M) / (6 * M)).toBeLessThan(0.005);
  });

  it("(d) weak-field photon deflection matches 4M/b within 1% at large b", () => {
    const b = 2000;
    const defl = photonDeflection(M, b);
    expect(Math.abs(defl - (4 * M) / b) / ((4 * M) / b)).toBeLessThan(0.01);
  });

  it("(e) gravitational time dilation equals √(1−rs/r) within 0.1%", () => {
    for (const r of [3, 10, 100, 1e4]) {
      const expected = Math.sqrt(1 - 2 / r);
      expect(Math.abs(gravitationalTimeDilation(M, r) - expected) / expected).toBeLessThan(0.001);
    }
  });
});

describe("Rubber sheet retired (AC4): time curvature is the slow-speed mechanism", () => {
  it("slow-object deflection: full GR vs Newtonian (time-curvature-only) agree within 5%", () => {
    const { fullGR, newtonian } = slowScatteringComparison(M, 4000, 0.02);
    expect(Math.abs(fullGR - newtonian) / newtonian).toBeLessThan(0.05);
  });

  it("null deflection is the factor-2 sum: full (4M/b) vs Newtonian-like (2M/b) within 5%", () => {
    const b = 2000;
    const full = photonDeflection(M, b);
    expect(Math.abs(full / ((2 * M) / b) - 2)).toBeLessThan(0.1); // ratio 2 within 5%
  });
});

describe("Equivalence principle (AC16a): trajectories are mass-independent", () => {
  it("test masses differing ×10⁶ follow identical paths to ≤1e-10", () => {
    const init = { r: 20, phi: 0, vr: 0 };
    const L = circularL(20, M) * 0.97;
    const a = trajectoryForTestMass(1e-6, M, init, L, 5000, 0.05);
    const b = trajectoryForTestMass(1, M, init, L, 5000, 0.05);
    for (let i = 0; i < a.length; i += 100) {
      expect(Math.abs(a[i].r - b[i].r)).toBeLessThanOrEqual(1e-10);
      expect(Math.abs(a[i].phi - b[i].phi)).toBeLessThanOrEqual(1e-10);
    }
  });
});
