import { measureFringeSpacing, nSlitAnalytic, phasorArrows, slitPattern } from "../../sim/pathint";
import { onTick } from "../clock";
import { makeCanvas, renderPanel, renderQuestionBanners, sceneBox, slider } from "../ui";
import { registerScene } from "../hook";

export const id = "slits";
export const title = "Slits All the Way Down";
export const subtitle =
  "Two slits → N slits → screens of slits → infinitely many screens of infinitely many slits: the path integral, built before your eyes.";

export function mount(root: HTMLElement): () => void {
  const cleanups: (() => void)[] = [];
  root.append(...renderQuestionBanners("slits"));
  root.append(renderPanel("slits-doubleslit"));

  // ── interference scene: particle hits accumulate under the sim clock ─────
  const canvas = makeCanvas(900, 460);
  const lambda = 0.5;
  let d = 30; // slit separation
  let nSlits = 2;
  let layers = 1; // visual escalation: extra slit screens drawn + pattern from densified sources
  const slitWidth = 4;
  const Ldist = 40_000;
  const span = 2200;
  const nPts = 900;
  const ys = new Float64Array(nPts);
  for (let i = 0; i < nPts; i++) ys[i] = -span + (2 * span * i) / (nPts - 1);
  let I: Float64Array = new Float64Array(nPts);
  const cdf = new Float64Array(nPts);
  let hits: number[] = [];
  let measuredSpacing = NaN;

  const recompute = () => {
    // layers act as source densification: each extra screen multiplies the effective
    // sources (the discrete step toward the continuum limit shown in the panel below)
    I = slitPattern(ys, nSlits, d, slitWidth, lambda, Ldist, 48 * layers);
    let acc = 0;
    for (let i = 0; i < nPts; i++) {
      acc += I[i];
      cdf[i] = acc;
    }
    for (let i = 0; i < nPts; i++) cdf[i] /= acc;
    hits = [];
    measuredSpacing = measureFringeSpacing(ys, I);
  };
  recompute();

  const draw = () => {
    const ctx = canvas.getContext("2d")!;
    const { width: W, height: H } = canvas;
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);
    // analytic envelope (faint) + numeric curve
    ctx.strokeStyle = "#243049";
    ctx.beginPath();
    for (let i = 0; i < nPts; i++) {
      const px = (i / (nPts - 1)) * W;
      const theta = Math.atan2(ys[i], Ldist);
      const py = H - 40 - nSlitAnalytic(theta, nSlits, d, slitWidth, lambda) * (H * 0.45);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = "#6ea8ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < nPts; i++) {
      const px = (i / (nPts - 1)) * W;
      const py = H - 40 - I[i] * (H * 0.45);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
    // the slit screens themselves (escalation made visible)
    for (let l = 0; l < layers; l++) {
      const sy = 56 + l * 26;
      ctx.strokeStyle = "#3a4763";
      ctx.lineWidth = 3;
      const slitPx = (dd: number) => ((dd / 8 + span) / (2 * span)) * W; // schematic compression
      ctx.beginPath();
      ctx.moveTo(W * 0.3, sy);
      ctx.lineTo(W * 0.7, sy);
      ctx.stroke();
      ctx.strokeStyle = "#05070c";
      ctx.lineWidth = 5;
      for (let sIdx = 0; sIdx < nSlits; sIdx++) {
        const cx2 = slitPx((sIdx - (nSlits - 1) / 2) * d * 18);
        ctx.beginPath();
        ctx.moveTo(cx2 - 4, sy);
        ctx.lineTo(cx2 + 4, sy);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
    }
    // accumulated particle hits (the dot-by-dot buildup)
    ctx.fillStyle = "rgba(255, 184, 110, 0.85)";
    for (const [hi, h] of hits.entries()) {
      const px = ((h + span) / (2 * span)) * W;
      const py = H - 14 - Math.abs(Math.sin(h * 12.9898 + hi * 0.618)) * 38;
      ctx.fillRect(px, py, 2.2, 2.2);
    }
    ctx.fillStyle = "#9aa4bd";
    ctx.font = "13px system-ui";
    ctx.fillText(
      `${nSlits} slits × ${layers} screen${layers > 1 ? "s" : ""} · separation d=${d} · ${hits.length} particles · measured fringe spacing ≈ ${Number.isNaN(measuredSpacing) ? "—" : measuredSpacing.toFixed(0)} (λL/d = ${((lambda * Ldist) / d).toFixed(0)})`,
      14,
      20,
    );
  };
  draw();

  cleanups.push(
    onTick(() => {
      // sample particle hits from the live pattern — sim-driven, not keyframed
      for (let k = 0; k < 60; k++) {
        const u = Math.random();
        let lo = 0;
        let hi = nPts - 1;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (cdf[mid] < u) lo = mid + 1;
          else hi = mid;
        }
        hits.push(ys[lo]);
      }
      if (hits.length > 12_000) hits = hits.slice(-12_000);
      draw();
    }),
  );

  const dControl = slider({
    label: "slit separation d",
    min: 15,
    max: 60,
    step: 1,
    value: 30,
    format: (v) => v.toFixed(0),
    testid: "slit-separation",
    onInput: (v) => {
      d = v;
      recompute();
      draw();
    },
  });
  const nControl = slider({
    label: "slits per screen N",
    min: 2,
    max: 8,
    step: 1,
    value: 2,
    format: (v) => v.toFixed(0),
    testid: "slit-count",
    onInput: (v) => {
      nSlits = v;
      recompute();
      draw();
    },
  });
  const mControl = slider({
    label: "screens M",
    min: 1,
    max: 4,
    step: 1,
    value: 1,
    format: (v) => v.toFixed(0),
    testid: "screen-count",
    onInput: (v) => {
      layers = v;
      recompute();
      draw();
    },
  });
  root.append(sceneBox(canvas, [nControl, mControl, dControl], "slit-interference"));
  registerScene("slit-interference", () => ({
    nSlits,
    layers,
    separation: d,
    measuredFringeSpacing: measuredSpacing,
    analyticFringeSpacing: (lambda * Ldist) / d,
    hits: hits.length,
  }));

  root.append(renderPanel("slits-pathintegral"));

  // ── phasor arrows: QED-style amplitude summation ─────────────────────────
  const phCanvas = makeCanvas(900, 420);
  let actionScale = 1;
  const drawPhasors = () => {
    const ctx = phCanvas.getContext("2d")!;
    const { width: W, height: H } = phCanvas;
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);
    const arrows = phasorArrows(actionScale, 3, 61);
    // chain the arrows tip-to-tail (the Feynman picture)
    let x = W * 0.12;
    let y = H * 0.62;
    const len = 11;
    ctx.lineWidth = 2;
    let sx = 0;
    let sy = 0;
    for (const [i, a] of arrows.entries()) {
      const nx = x + len * Math.cos(a.phase);
      const ny = y - len * Math.sin(a.phase);
      const off = Math.abs(a.c) / 3;
      ctx.strokeStyle = `hsl(${210 - off * 160}, 80%, ${65 - off * 25}%)`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      x = nx;
      y = ny;
      if (i === arrows.length - 1) {
        sx = nx;
        sy = ny;
      }
    }
    // resultant
    ctx.strokeStyle = "#ffb86e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.12, H * 0.62);
    ctx.lineTo(sx, sy);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = "#9aa4bd";
    ctx.font = "13px system-ui";
    ctx.fillText(
      `each arrow = one path's e^(iS/ħ) · blue = near the classical path, red = far from it · action scale ×${actionScale.toFixed(0)}`,
      14,
      20,
    );
    ctx.fillText("crank the action and watch off-classical paths curl into cancellation — the classical world emerging", 14, 40);
  };
  drawPhasors();
  const scaleControl = slider({
    label: "action / ħ scale",
    min: 1,
    max: 100,
    step: 1,
    value: 1,
    format: (v) => `×${v.toFixed(0)}`,
    testid: "action-scale",
    onInput: (v) => {
      actionScale = v;
      drawPhasors();
    },
  });
  root.append(sceneBox(phCanvas, [scaleControl], "phasors"));
  registerScene("phasors", () => ({ actionScale }));

  root.append(renderPanel("slits-stationary"));
  return () => cleanups.forEach((fn) => fn());
}
