# Quantum Gravity Lab

**Live: https://quantum-gravity-lab.vercel.app**

An interactive, simulation-driven exploratorium of **quantum mechanics × general relativity × black holes**, with **information** and **gravity** as the two candidate fundamental pillars. Built around nine driving questions — from *why is there an invariant speed?* to *is spacetime made of entanglement?* — each answered as honestly as current physics allows, including "open question."

Every visual is driven by live, benchmarked numerics — no canned animation:

- **SR core** — Lorentz boosts exact to 1e-12; the K-family derivation showing Galileo and Einstein are the only two consistent kinematics.
- **Schwarzschild geodesic engine** — perihelion precession within 1% of 6πGM/(c²a(1−e²)), photon capture sharp at b_c = 3√3·GM/c², ISCO and photon sphere located numerically, energy conserved to 1e-8/orbit.
- **Slits all the way down** — Feynman's escalation (2 slits → N slits → screens of slits) computed for real: the layered slit-sum provably converges to the free propagator; stationary phase shows classical mechanics emerging by interference.
- **Split-step Schrödinger** — norm conserved to 1e-6, dispersion matching σ(t) to 1%, tunneling matching the analytic barrier coefficient to 5%.
- **Bell/CHSH** — sampled singlet correlations hit −cosθ; CHSH reaches 2√2 while the bundled local-hidden-variable model provably can't beat 2.
- **GPU lensing raytracer** — null geodesics integrated per pixel in a shader; the rendered shadow matches the analytic 3√3·r_s scaling within 5% (e2e pixel-measured).
- **It from bit** — entanglement entropy computed live from the reduced density matrix; decoherence as record-creation (mutual information rising as visibility falls); Landauer and Bekenstein calculators.
- **Concept graph** — 50+ nodes / 55+ typed edges (derives / emerges / constrains / conjecture / tension), each justified and epistemically labeled, navigable in 3D.

Every claim carries one of five honesty tags: `established · theoretical-prediction · interpretation · conjecture · open-question`.

## Develop

```bash
npm install
npm run dev          # vite dev server
npm test             # 48 physics benchmark + content tests
npm run e2e          # 21 Playwright specs (pixel-measured physics)
bash scripts/import-smoke.sh   # sim cores import in bare Node
```

Architecture: pure, dependency-free sim cores in `src/sim/` (importable in bare Node, unit-benchmarked against analytic physics); renderers in `src/app/` consume them; content (panels/graph/questions) in `src/content/`. Testability hook at `window.__QGLAB__` exposes the sim clock and per-scene facts.

Built with the PRD-as-rubric workflow: spec at `tasks/prds/quantum-gravity-lab.md` (in the parent workspace), graded by an independent evaluator, with mutation tests proving every gate bites (10/10 killed).
