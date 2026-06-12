import {
  CHSH_OPTIMAL,
  TSIRELSON,
  chsh,
  mulberry32,
  sampleLHVCorrelation,
  sampleSingletCorrelation,
  singletCorrelationAnalytic,
} from "../../sim/bell";
import { el, makeCanvas, renderPanel, renderQuestionBanners, sceneBox, slider } from "../ui";
import { registerScene } from "../hook";

export const id = "entanglement";
export const title = "Entanglement & Bell";
export const subtitle =
  "Run the experiment that ended local realism — then meet the conjecture that entangled pairs are wormhole mouths.";

export function mount(root: HTMLElement): () => void {
  root.append(...renderQuestionBanners("entanglement"));
  root.append(renderPanel("ent-bell"));

  const canvas = makeCanvas(900, 420);
  let angleA = 0;
  let angleB = Math.PI / 4;
  const rng = mulberry32(2026);
  let lastQuantumE = 0;
  let lastLhvE = 0;
  let lastS = 0;
  let lastSLhv = 0;

  const draw = () => {
    const ctx = canvas.getContext("2d")!;
    const { width: W, height: H } = canvas;
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);
    // correlation vs angle difference: quantum (sampled, dots) over −cosθ (curve) + LHV
    ctx.strokeStyle = "#243049";
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.strokeStyle = "#6ea8ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= W; px++) {
      const th = (px / W) * Math.PI;
      const py = H / 2 - singletCorrelationAnalytic(0, th) * (H / 2 - 40) * -1;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // LHV model curve (sampled, coarse)
    ctx.strokeStyle = "#ff7e96";
    ctx.beginPath();
    for (let i = 0; i <= 36; i++) {
      const th = (i / 36) * Math.PI;
      const E = sampleLHVCorrelation(0, th, 4000, rng);
      const px = (i / 36) * W;
      const py = H / 2 + E * (H / 2 - 40);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
    // sampled quantum point at the chosen angles
    const th = Math.abs(angleA - angleB);
    lastQuantumE = sampleSingletCorrelation(angleA, angleB, 60_000, rng);
    lastLhvE = sampleLHVCorrelation(angleA, angleB, 60_000, rng);
    const px = (th / Math.PI) * W;
    ctx.fillStyle = "#ffb86e";
    ctx.beginPath();
    ctx.arc(px, H / 2 + lastQuantumE * (H / 2 - 40), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9aa4bd";
    ctx.font = "13px system-ui";
    ctx.fillText(
      `E(a,b) sampled = ${lastQuantumE.toFixed(3)} vs −cos(θ) = ${singletCorrelationAnalytic(angleA, angleB).toFixed(3)} (blue) · local-hidden-variable model (red) is linear — and bounded`,
      14,
      20,
    );
    // CHSH meters
    lastS = chsh(sampleSingletCorrelation, 40_000, rng, CHSH_OPTIMAL);
    lastSLhv = chsh(sampleLHVCorrelation, 40_000, rng, CHSH_OPTIMAL);
    ctx.fillText(
      `CHSH at optimal angles — quantum: S = ${lastS.toFixed(3)} (Tsirelson 2√2 = ${TSIRELSON.toFixed(3)}) · LHV: S = ${lastSLhv.toFixed(3)} (classical bound 2)`,
      14,
      40,
    );
  };
  draw();

  const aControl = slider({
    label: "detector a (rad)",
    min: 0,
    max: Math.PI,
    step: 0.01,
    value: 0,
    testid: "angle-a",
    onInput: (v) => {
      angleA = v;
      draw();
    },
  });
  const bControl = slider({
    label: "detector b (rad)",
    min: 0,
    max: Math.PI,
    step: 0.01,
    value: Math.PI / 4,
    testid: "angle-b",
    onInput: (v) => {
      angleB = v;
      draw();
    },
  });
  root.append(sceneBox(canvas, [aControl, bControl], "bell"));
  registerScene("bell", () => ({
    angleA,
    angleB,
    quantumE: lastQuantumE,
    analyticE: singletCorrelationAnalytic(angleA, angleB),
    lhvE: lastLhvE,
    chshQuantum: lastS,
    chshLHV: lastSLhv,
  }));

  root.append(renderPanel("ent-erepr"));
  const link = el(
    "a",
    { href: "#/information", class: "crosslink", "data-crosslink": "information" },
    "→ The entropy this correlation creates is the subject of the information module.",
  );
  root.append(link);
  return () => undefined;
}
