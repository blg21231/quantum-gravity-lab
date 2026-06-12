import { describe, expect, it } from "vitest";
import {
  binaryEntropy,
  decoherenceRecord,
  entanglementEntropy,
  entanglementEntropyAnalytic,
  shannonEntropy,
} from "../../src/sim/info";

describe("Information pillar (AC15)", () => {
  it("(a) entanglement entropy: 0 bits for product, exactly 1 bit for Bell, analytic curve within 1e-9", () => {
    expect(Math.abs(entanglementEntropy(0) - 0)).toBeLessThanOrEqual(1e-9);
    expect(Math.abs(entanglementEntropy(Math.PI / 2) - 0)).toBeLessThanOrEqual(1e-9);
    expect(Math.abs(entanglementEntropy(Math.PI / 4) - 1)).toBeLessThanOrEqual(1e-9);
    for (let i = 0; i <= 40; i++) {
      const theta = (i / 40) * (Math.PI / 2);
      expect(Math.abs(entanglementEntropy(theta) - entanglementEntropyAnalytic(theta))).toBeLessThanOrEqual(1e-9);
    }
  });

  it("(b) Shannon entropy exact on known distributions", () => {
    expect(Math.abs(shannonEntropy([1, 1]) - 1)).toBeLessThanOrEqual(1e-12);
    expect(Math.abs(shannonEntropy([1, 1, 1, 1]) - 2)).toBeLessThanOrEqual(1e-12);
    expect(shannonEntropy([1, 0, 0])).toBe(0);
    expect(Math.abs(shannonEntropy([3, 1]) - binaryEntropy(0.75))).toBeLessThanOrEqual(1e-12);
  });

  it("(c) measurement as information production: mutual information rises monotonically as visibility falls", () => {
    const nEnv = 10;
    const gs = [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.8, 1.0, 1.2, Math.PI / 2];
    let prevVis = Infinity;
    let prevMI = -Infinity;
    for (const g of gs) {
      const { visibility, mutualInformation } = decoherenceRecord(g, nEnv);
      expect(visibility).toBeLessThanOrEqual(prevVis + 1e-12);
      expect(mutualInformation).toBeGreaterThanOrEqual(prevMI - 1e-12);
      prevVis = visibility;
      prevMI = mutualInformation;
    }
    // fully decohered: 2 bits of S:E mutual information (perfect classical record, pure joint state)
    const full = decoherenceRecord(Math.PI / 2, nEnv);
    expect(Math.abs(full.mutualInformation - 2)).toBeLessThanOrEqual(1e-9);
    expect(full.visibility).toBeLessThanOrEqual(1e-9);
  });
});
