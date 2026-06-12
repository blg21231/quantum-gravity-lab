# AC → test coverage map (`quantum-gravity-lab`)

PRD: `~/Documents/Claude/tasks/prds/quantum-gravity-lab.md`

| AC | What it gates | Asserting tests |
|----|---------------|-----------------|
| AC1 | SR exactness (interval, subluminal composition, γ) + boost interaction | `tests/unit/sr.test.ts` · `tests/e2e/interactions.spec.ts` ("boost slider … light cone stays invariant") |
| AC2 | K-family kinematics derivation, numerically live + min-length cross-link | `tests/unit/sr.test.ts` (K-family) · `tests/e2e/interactions.spec.ts` ("K-knob") · `tests/e2e/journey.spec.ts` (cross-links) |
| AC3 | Schwarzschild benchmarks (precession, conservation, capture, ISCO/photon sphere, weak field, time dilation) | `tests/unit/geodesic-benchmarks.test.ts` |
| AC4 | Rubber-sheet critique + time-curvature mechanism + factor-2 deflection | `tests/unit/geodesic-benchmarks.test.ts` ("Rubber sheet retired") · panels via journey walk |
| AC5 | Two-slit analytic match, N×M controls, propagator convergence (floor ≤2%), stationary phase, phasors | `tests/unit/path-integral.test.ts` · `tests/e2e/interactions.spec.ts` ("N and M controls") |
| AC6 | Norm, dispersion, tunneling, decoherence monotone→<10%, interpretations + branch-counting | `tests/unit/schrodinger.test.ts` · `tests/unit/epistemic-tags.test.ts` (AC6e) · `tests/e2e/interactions.spec.ts` ("decoherence slider") |
| AC7 | Singlet −cosθ, CHSH ∈ [2.7, 2√2+ε], LHV ≤ 2.05, live angles, ER=EPR conjecture | `tests/unit/bell.test.ts` · `tests/e2e/interactions.spec.ts` ("bell") |
| AC8 | Pixel-measured shadow vs 3√3·r_s(M) scaling at 3 masses; Hawking calculator 0.1%; tags | `tests/e2e/shadow.spec.ts` · `tests/unit/hawking.test.ts` |
| AC9 | Lattice-vs-sprinkling boost statistics + interactive + QG survey tags | `tests/unit/lattice.test.ts` · `tests/e2e/interactions.spec.ts` ("planck") |
| AC10 | 9 questions mapped/rendered, pinned statuses, ≥9 routes | `tests/unit/questions.test.ts` · `tests/e2e/journey.spec.ts` ("driving-questions ledger", "full journey") |
| AC11 | Graph ≥30/≥50, 13 pinned edges, justifications ≥40 chars, node refs resolve, click-nav | `tests/unit/concept-graph.test.ts` · `tests/e2e/journey.spec.ts` ("concept graph") |
| AC12 | Every panel tagged, pinned tags, 5-module conjecture minimum, banned-phrase lint | `tests/unit/epistemic-tags.test.ts` · `tests/e2e/journey.spec.ts` ("epistemic honesty walk") |
| AC13 | 3 named scenes: freeze/resume + per-scene causality magnitude laws; bare-Node import smoke | `tests/e2e/sim-driven.spec.ts` · `scripts/import-smoke.sh` |
| AC14 | Live prod, three.js load-bearing, console-clean, zero cross-origin, airgap, viewports | `tests/e2e/journey.spec.ts` · `tests/e2e/airgap.spec.ts` · `tests/e2e/viewports.spec.ts` (+ prod smoke with `SMOKE_URL`) |
| AC15 | Entanglement entropy curve 1e-9, Shannon/Landauer, MI monotone, Bekenstein bits, it-from-bit tags | `tests/unit/information.test.ts` · `tests/unit/hawking.test.ts` (Landauer/bits) · `tests/e2e/interactions.spec.ts` ("information") |
| AC16 | Equivalence principle ≤1e-10, drop-test interactive, emergent-gravity counterpoint, dilemma edges | `tests/unit/geodesic-benchmarks.test.ts` ("Equivalence principle") · `tests/unit/concept-graph.test.ts` ("gravity node") · `tests/e2e/interactions.spec.ts` ("drop test") |

Mutation tests: `python3 tasks/prds/mutate.py quantum-gravity-lab` (run from `~/Documents/Claude`) — 10/10 killed.
