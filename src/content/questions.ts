import type { Question } from "./types";

// The nine driving questions — canonical text from the PRD rubric (quantum-gravity-lab).
export const QUESTIONS: Question[] = [
  {
    id: "Q1",
    text: "Why is there an invariant speed c? Is it derivable (e.g., from symmetry + causality), and could a minimum length play a comparable axiomatic role?",
    routes: ["relativity"],
    nodes: ["invariant-speed", "relativity-principle", "causality"],
    status: "partial",
  },
  {
    id: "Q2",
    text: "Is “infinite slits in infinite screens” — the sum over all paths — a faithful model of how nature computes? What does the double slit actually force us to accept?",
    routes: ["slits"],
    nodes: ["path-integral", "double-slit", "superposition"],
    status: "partial",
  },
  {
    id: "Q3",
    text: "If reality is a Planck-scale lattice of possibilities with nonzero amplitude on every configuration, is that a viable model — and how does it square with Lorentz invariance?",
    routes: ["planck", "quantum"],
    nodes: ["planck-lattice", "lorentz-invariance", "causal-sets"],
    status: "open",
  },
  {
    id: "Q4",
    text: "How do amplitudes resolve into the single world we see — collapse, decoherence, many-worlds? If all branches are real, how to think about the count, and can branches be coarse-grained (“deduped”)?",
    routes: ["quantum"],
    nodes: ["measurement-problem", "decoherence", "many-worlds"],
    status: "open",
  },
  {
    id: "Q5",
    text: "Is entanglement geometrically connected to wormholes (ER=EPR)?",
    routes: ["entanglement"],
    nodes: ["entanglement", "wormholes"],
    status: "open",
  },
  {
    id: "Q6",
    text: "What laws govern black holes, where GR and QM must both apply — horizon, Hawking radiation, entropy, the information paradox, holography?",
    routes: ["blackhole"],
    nodes: ["black-holes", "hawking-radiation", "black-hole-information", "holography"],
    status: "partial",
  },
  {
    id: "Q7",
    text: "Which phenomena are fundamental vs emergent vs equivalent; is there one deeper layer beneath QM and GR, and what are the live candidates?",
    routes: ["graph", "planck"],
    nodes: ["physics-as-information", "emergent-gravity", "causal-sets"],
    status: "open",
  },
  {
    id: "Q8",
    text: "Is information the most fundamental layer of the universe — distinctions arising from quantum fluctuations? Do observation and/or entanglement produce information, and is spacetime itself made of it?",
    routes: ["information"],
    nodes: ["information", "physics-as-information", "entanglement-entropy", "quantum-fluctuations"],
    status: "open",
  },
  {
    id: "Q9",
    text: "Is gravity fundamental or emergent — and is it the common thread behind the deepest dilemmas (resistance to quantization, the measurement problem, black-hole information)?",
    routes: ["gravity"],
    nodes: ["gravity", "emergent-gravity", "quantization", "objective-collapse"],
    status: "open",
  },
];
