import { describe, expect, it } from "vitest";
import { QUESTIONS } from "../../src/content/questions";

describe("Driving-questions ledger (AC10)", () => {
  it("maps all nine questions, each to ≥1 route, ≥1 node, and a status", () => {
    expect(QUESTIONS.length).toBe(9);
    const ids = QUESTIONS.map((q) => q.id);
    expect(ids).toEqual(["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9"]);
    for (const q of QUESTIONS) {
      expect(q.text.length).toBeGreaterThan(40);
      expect(q.routes.length).toBeGreaterThanOrEqual(1);
      expect(q.nodes.length).toBeGreaterThanOrEqual(1);
      expect(["established", "partial", "open"]).toContain(q.status);
    }
  });

  it("pinned honest statuses: Q4, Q5, Q7, Q8, Q9 are open or partial — never established", () => {
    for (const id of ["Q4", "Q5", "Q7", "Q8", "Q9"]) {
      const q = QUESTIONS.find((x) => x.id === id)!;
      expect(["open", "partial"]).toContain(q.status);
      expect(q.status).not.toBe("established");
    }
  });
});
