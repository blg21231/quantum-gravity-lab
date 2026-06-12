import { decoherenceVisibility, evolve, fringeIntensity, gaussianPacket, makeGrid, moments } from "../../sim/schrodinger";
import type { QState } from "../../sim/schrodinger";
import { onTick } from "../clock";
import { makeCanvas, renderPanel, renderQuestionBanners, sceneBox, slider } from "../ui";
import { registerScene } from "../hook";

export const id = "quantum";
export const title = "Wavefunction, Measurement, Branching";
export const subtitle =
  "Watch ψ evolve for real — then face the question the equation refuses to answer: why one outcome?";

export function mount(root: HTMLElement): () => void {
  const cleanups: (() => void)[] = [];
  root.append(...renderQuestionBanners("quantum"));
  root.append(renderPanel("q-wavefunction"));

  // ── live split-step wave packet ───────────────────────────────────────────
  const canvas = makeCanvas(900, 380);
  const n = 1024;
  let mass = 1;
  let barrierOn = false;
  let state: QState;
  let simT = 0;
  const sigma0 = 5;
  const V = (x: number) => (barrierOn && x >= 28 && x <= 31 ? 1.05 : 0);
  const reset = () => {
    state = makeGrid(n, -150, 150, mass);
    gaussianPacket(state, -60, sigma0, 1.4);
    simT = 0;
  };
  reset();
  let lastSigma = sigma0;
  const draw = () => {
    const ctx = canvas.getContext("2d")!;
    const { width: W, height: H } = canvas;
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);
    if (barrierOn) {
      const bx = ((28 + 150) / 300) * W;
      const bw = (3 / 300) * W;
      ctx.fillStyle = "#243049";
      ctx.fillRect(bx, H * 0.25, bw, H * 0.65);
    }
    // probability density + real part
    ctx.strokeStyle = "#3fb68b";
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const px = (i / (n - 1)) * W;
      const py = H - 30 - state.re[i] * 1100 - 60;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = "#6ea8ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const d = state.re[i] * state.re[i] + state.im[i] * state.im[i];
      const px = (i / (n - 1)) * W;
      const py = H - 30 - d * 5200;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
    const m = moments(state);
    lastSigma = m.sigma;
    ctx.fillStyle = "#9aa4bd";
    ctx.font = "13px system-ui";
    ctx.fillText(
      `|ψ|² (blue) and Re ψ (green) · m=${mass.toFixed(1)} · t=${simT.toFixed(1)} · σ(t)=${m.sigma.toFixed(2)} · spreading rate ∝ 1/m ${barrierOn ? "· tunneling barrier ON" : ""}`,
      14,
      20,
    );
  };
  draw();
  cleanups.push(
    onTick((dt) => {
      const simDt = dt * 4;
      const steps = 4;
      evolve(state, V, simDt / steps, steps);
      simT += simDt;
      if (simT > 70 || moments(state).mean > 120) reset();
      draw();
    }),
  );
  const massControl = slider({
    label: "particle mass m",
    min: 0.5,
    max: 4,
    step: 0.5,
    value: 1,
    format: (v) => v.toFixed(1),
    testid: "packet-mass",
    onInput: (v) => {
      mass = v;
      reset();
      draw();
    },
  });
  const barrierBtn = document.createElement("button");
  barrierBtn.className = "secondary";
  barrierBtn.dataset.testid = "barrier-toggle";
  barrierBtn.textContent = "Toggle barrier";
  barrierBtn.addEventListener("click", () => {
    barrierOn = !barrierOn;
    reset();
    draw();
  });
  root.append(sceneBox(canvas, [massControl, barrierBtn], "wave-packet"));
  registerScene(
    "wave-packet",
    () => ({
      mass,
      simT,
      sigma: lastSigma,
      sigma0,
      barrierOn,
    }),
    {
      // deterministic e2e instruments: centered zero-momentum packet + synchronous
      // fast-forward so the late-time (∝1/m) spreading regime is reachable
      setMass: (m: unknown) => {
        mass = Number(m);
        reset();
      },
      reset0: (s0: unknown) => {
        barrierOn = false;
        state = makeGrid(n, -150, 150, mass);
        gaussianPacket(state, 0, Number(s0) || 2, 0);
        simT = 0;
        draw();
      },
      ff: (tTarget: unknown) => {
        const target = Number(tTarget);
        const dt = 0.05;
        while (simT < target) {
          evolve(state, V, dt, 20);
          simT += dt * 20;
        }
        const m = moments(state);
        lastSigma = m.sigma;
        draw();
        return { simT, sigma: m.sigma };
      },
    },
  );

  root.append(renderPanel("q-decoherence"));

  // ── decoherence: coupling kills the fringes ───────────────────────────────
  const decCanvas = makeCanvas(900, 300);
  let coupling = 0;
  const nEnv = 8;
  const drawDec = () => {
    const ctx = decCanvas.getContext("2d")!;
    const { width: W, height: H } = decCanvas;
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);
    const vis = decoherenceVisibility(coupling, nEnv);
    ctx.strokeStyle = "#b48cff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= W; px++) {
      const x = (px / W) * 60 - 30;
      const inten = fringeIntensity(x, 1.1, coupling, nEnv) / 2;
      const py = H - 26 - inten * (H - 70);
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = "#9aa4bd";
    ctx.font = "13px system-ui";
    ctx.fillText(
      `interference visibility = |⟨E₀|E₁⟩| = cos^${nEnv}(g) = ${vis.toFixed(3)} — each environment qubit that learns the path multiplies coherence down`,
      14,
      20,
    );
  };
  drawDec();
  const couplingControl = slider({
    label: "environment coupling g",
    min: 0,
    max: 1.55,
    step: 0.01,
    value: 0,
    testid: "coupling",
    onInput: (v) => {
      coupling = v;
      drawDec();
    },
  });
  root.append(sceneBox(decCanvas, [couplingControl], "decoherence"));
  registerScene("decoherence", () => ({ coupling, visibility: decoherenceVisibility(coupling, nEnv), nEnv }));

  // ── interpretations, honestly labeled ────────────────────────────────────
  for (const pid of ["q-copenhagen", "q-manyworlds", "q-pilotwave", "q-histories", "q-branchcount"]) {
    root.append(renderPanel(pid));
  }
  return () => cleanups.forEach((fn) => fn());
}
