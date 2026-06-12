import { describe, expect, it } from "vitest";
import { EDGES, NODES } from "../../src/content/graph";
import { QUESTIONS } from "../../src/content/questions";

const nodeIds = new Set(NODES.map((n) => n.id));
const hasEdge = (from: string, to: string, type?: string) =>
  EDGES.some((e) => e.from === from && e.to === to && (!type || e.type === type));

describe("Concept graph (AC11)", () => {
  it("has ≥30 nodes and ≥50 edges", () => {
    expect(NODES.length).toBeGreaterThanOrEqual(30);
    expect(EDGES.length).toBeGreaterThanOrEqual(50);
  });

  it("every edge endpoint resolves, every justification is substantive (≥40 chars), every edge typed + statused", () => {
    const types = new Set(["derives", "emerges", "constrains", "conjecture", "tension"]);
    const statuses = new Set(["established", "theoretical-prediction", "interpretation", "conjecture", "open-question"]);
    for (const e of EDGES) {
      expect(nodeIds.has(e.from), `from ${e.from}`).toBe(true);
      expect(nodeIds.has(e.to), `to ${e.to}`).toBe(true);
      expect(types.has(e.type)).toBe(true);
      expect(statuses.has(e.status)).toBe(true);
      expect(e.justification.trim().length, `justification of ${e.from}→${e.to}`).toBeGreaterThanOrEqual(40);
    }
    // no duplicate node ids
    expect(nodeIds.size).toBe(NODES.length);
  });

  it("contains all 13 pinned edges", () => {
    expect(hasEdge("relativity-principle", "invariant-speed", "derives")).toBe(true);
    expect(hasEdge("causality", "invariant-speed", "derives")).toBe(true);
    expect(hasEdge("invariant-speed", "time-dilation", "derives")).toBe(true);
    expect(hasEdge("spacetime-interval", "time-dilation", "derives")).toBe(true);
    expect(hasEdge("path-integral", "classical-action-paths", "emerges")).toBe(true);
    expect(hasEdge("superposition", "decoherence", "derives")).toBe(true);
    expect(hasEdge("environment-coupling", "decoherence", "derives")).toBe(true);
    expect(hasEdge("entanglement", "wormholes", "conjecture")).toBe(true);
    expect(hasEdge("general-relativity", "black-hole-information", "tension")).toBe(true);
    expect(hasEdge("quantum-mechanics", "black-hole-information", "tension")).toBe(true);
    expect(hasEdge("horizon-area", "bekenstein-hawking-entropy", "derives")).toBe(true);
    expect(hasEdge("bekenstein-hawking-entropy", "holography", "conjecture")).toBe(true);
    expect(hasEdge("planck-lattice", "lorentz-invariance", "tension")).toBe(true);
    expect(hasEdge("decoherence", "classical-records", "derives")).toBe(true);
    expect(hasEdge("entanglement-entropy", "spacetime-geometry", "conjecture")).toBe(true);
    expect(hasEdge("horizon-thermodynamics", "einstein-equations", "conjecture")).toBe(true);
    expect(hasEdge("information", "physics-as-information", "conjecture")).toBe(true);
    expect(hasEdge("gravity", "quantization", "tension")).toBe(true);
  });

  it("ER=EPR and emergent-gravity edges are conjecture-status, never established", () => {
    const erepr = EDGES.find((e) => e.from === "entanglement" && e.to === "wormholes");
    expect(erepr?.status).toBe("conjecture");
    const jacobson = EDGES.find((e) => e.from === "horizon-thermodynamics" && e.to === "einstein-equations");
    expect(jacobson?.status).toBe("conjecture");
  });

  it("every node referenced by the questions manifest resolves into the graph", () => {
    for (const q of QUESTIONS) {
      for (const n of q.nodes) expect(nodeIds.has(n), `${q.id} → ${n}`).toBe(true);
    }
  });

  it("the gravity node carries edges to ≥3 named dilemmas (AC16d)", () => {
    const gravityEdges = EDGES.filter((e) => e.from === "gravity");
    const targets = new Set(gravityEdges.map((e) => e.to));
    expect(targets.has("quantization")).toBe(true);
    expect(targets.has("objective-collapse")).toBe(true);
    expect(targets.has("black-hole-information")).toBe(true);
  });
});
