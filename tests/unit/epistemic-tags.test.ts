import { describe, expect, it } from "vitest";
import { BANNED_ESTABLISHED_VOICE, PANELS } from "../../src/content/panels";

describe("Epistemic honesty (AC12)", () => {
  it("every panel carries exactly one valid tag", () => {
    const valid = new Set(["established", "theoretical-prediction", "interpretation", "conjecture", "open-question"]);
    for (const p of PANELS) expect(valid.has(p.tag), p.id).toBe(true);
    const ids = new Set(PANELS.map((p) => p.id));
    expect(ids.size).toBe(PANELS.length);
  });

  it("pinned tags hold", () => {
    const tag = (id: string) => PANELS.find((p) => p.id === id)?.tag;
    expect(tag("ent-erepr")).toBe("conjecture"); // ER=EPR
    expect(tag("q-manyworlds")).toBe("interpretation"); // many-worlds
    expect(tag("bh-hawking")).toBe("theoretical-prediction"); // Hawking radiation
    expect(tag("slits-pathintegral")).toBe("established"); // path integral
    expect(tag("bh-infoparadox")).toBe("open-question"); // information-paradox resolution
    expect(tag("info-itfrombit")).toBe("conjecture"); // it-from-bit
    expect(tag("grav-emergent")).toBe("conjecture"); // emergent/entropic gravity
    expect(tag("grav-collapse")).toBe("conjecture"); // objective collapse
    expect(tag("bh-holography")).toBe("conjecture"); // holographic principle
    // each surveyed QG program is conjecture
    expect(tag("pl-strings")).toBe("conjecture");
    expect(tag("pl-lqg")).toBe("conjecture");
    expect(tag("pl-causalsets")).toBe("conjecture");
  });

  it("anti-blanket-established: the five named modules each carry ≥1 conjecture/open-question panel", () => {
    for (const mod of ["quantum", "planck", "blackhole", "information", "gravity"] as const) {
      const speculative = PANELS.filter(
        (p) => p.module === mod && (p.tag === "conjecture" || p.tag === "open-question"),
      );
      expect(speculative.length, mod).toBeGreaterThanOrEqual(1);
    }
  });

  it("content lint: no established-voice phrasing in conjecture/interpretation/open-question panels", () => {
    const speculative = PANELS.filter(
      (p) => p.tag === "conjecture" || p.tag === "interpretation" || p.tag === "open-question",
    );
    expect(speculative.length).toBeGreaterThan(0);
    for (const p of speculative) {
      const text = (p.title + " " + p.body).toLowerCase();
      for (const banned of BANNED_ESTABLISHED_VOICE) {
        expect(text.includes(banned), `${p.id} contains "${banned}"`).toBe(false);
      }
    }
  });

  it("branch-counting treatment references Hilbert space vs configuration (AC6e)", () => {
    const p = PANELS.find((x) => x.id === "q-branchcount")!;
    expect(p.tag).toBe("open-question");
    expect(p.body).toMatch(/Hilbert space/);
    expect(p.body.toLowerCase()).toMatch(/configuration/);
    expect(p.body.toLowerCase()).toMatch(/dedupe|coarse-grain/);
    // all four named interpretations exist with distinct interpretation tags
    for (const id of ["q-copenhagen", "q-manyworlds", "q-pilotwave", "q-histories"]) {
      expect(PANELS.find((x) => x.id === id)?.tag).toBe("interpretation");
    }
  });
});
