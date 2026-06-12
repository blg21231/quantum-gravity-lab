import { composeK } from "../../sim/sr";
import { onTick } from "../clock";
import { el, makeCanvas, renderModulePanels, renderPanel, renderQuestionBanners, sceneBox, slider } from "../ui";
import { registerScene } from "../hook";

export const id = "relativity";
export const title = "The Invariant Speed";
export const subtitle =
  "Derive why an absolute speed exists at all — from symmetry and causality, not from light.";

export function mount(root: HTMLElement): () => void {
  const cleanups: (() => void)[] = [];
  root.append(...renderQuestionBanners("relativity"));
  root.append(renderPanel("rel-derivation"));

  // ── K-knob: the one-parameter family of kinematics ──────────────────────
  const kCanvas = makeCanvas(900, 360);
  let K = 1;
  const drawK = () => {
    const ctx = kCanvas.getContext("2d")!;
    const { width: W, height: H } = kCanvas;
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);
    // axes: u from -1..1 (units of c), fixed v=0.5; plot u⊕v
    ctx.strokeStyle = "#243049";
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    // invariant-speed guides at ±c
    ctx.strokeStyle = "#3a2b4d";
    ctx.setLineDash([4, 4]);
    for (const y of [H / 2 - H / 3, H / 2 + H / 3]) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const v = 0.5;
    ctx.strokeStyle = "#6ea8ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= W; px++) {
      const u = ((px / W) * 2 - 1) * 0.99;
      const w = composeK(u, v, K);
      const py = H / 2 - w * (H / 3);
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = "#9aa4bd";
    ctx.font = "13px system-ui";
    ctx.fillText(`u ⊕ 0.5c with K=${K.toFixed(2)}  —  K=0: Galileo (line escapes the guides) · K=1: Einstein (curve pinned inside ±c)`, 14, 20);
    ctx.fillText("+c", W / 2 + 6, H / 2 - H / 3 - 6);
    ctx.fillText("−c", W / 2 + 6, H / 2 + H / 3 + 14);
  };
  drawK();
  const kControl = slider({
    label: "K (kinematics family)",
    min: 0,
    max: 1,
    step: 0.01,
    value: 1,
    testid: "k-knob",
    onInput: (v) => {
      K = v;
      drawK();
    },
  });
  root.append(sceneBox(kCanvas, [kControl], "k-family"));

  // ── spacetime diagram with boost ─────────────────────────────────────────
  root.append(renderPanel("rel-geometry"));
  const stCanvas = makeCanvas(900, 520);
  let boostV = 0;
  let phase = 0;
  const events: { t: number; x: number }[] = [];
  for (let i = 0; i < 9; i++) events.push({ t: -2 + i * 0.5, x: ((i * 37) % 5) - 2 });
  const drawST = () => {
    const ctx = stCanvas.getContext("2d")!;
    const { width: W, height: H } = stCanvas;
    const S = 90; // px per unit
    const cx = W / 2;
    const cy = H / 2;
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);
    const g = 1 / Math.sqrt(1 - boostV * boostV);
    const tx = (e: { t: number; x: number }) => {
      const xb = g * (e.x - boostV * e.t);
      const tb = g * (e.t - boostV * e.x);
      return { px: cx + xb * S, py: cy - tb * S };
    };
    // grid of the boosted frame (simultaneity + worldline directions)
    ctx.strokeStyle = "#1f2a42";
    for (let q = -4; q <= 4; q += 0.5) {
      ctx.beginPath();
      const a = tx({ t: -3, x: q });
      const b = tx({ t: 3, x: q });
      ctx.moveTo(a.px, a.py);
      ctx.lineTo(b.px, b.py);
      ctx.stroke();
      ctx.beginPath();
      const c = tx({ t: q, x: -5 });
      const d = tx({ t: q, x: 5 });
      ctx.moveTo(c.px, c.py);
      ctx.lineTo(d.px, d.py);
      ctx.stroke();
    }
    // THE LIGHT CONE — invariant under every boost: slopes stay ±1 exactly.
    ctx.strokeStyle = "#ffb86e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 3 * S, cy + 3 * S);
    ctx.lineTo(cx + 3 * S, cy - 3 * S);
    ctx.moveTo(cx - 3 * S, cy - 3 * S);
    ctx.lineTo(cx + 3 * S, cy + 3 * S);
    ctx.stroke();
    ctx.lineWidth = 1;
    // worldline of a massive traveler + pulsing proper-time ticks
    ctx.strokeStyle = "#6ea8ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const wv = 0.6;
    for (let t = -2.6; t <= 2.6; t += 0.05) {
      const p = tx({ t, x: wv * t });
      if (t <= -2.6 + 1e-9) ctx.moveTo(p.px, p.py);
      else ctx.lineTo(p.px, p.py);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
    // events
    for (const [i, e] of events.entries()) {
      const p = tx(e);
      const pulse = 3 + Math.sin(phase * 2 + i) * 1.2;
      ctx.fillStyle = "#e8ecf6";
      ctx.beginPath();
      ctx.arc(p.px, p.py, pulse, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#9aa4bd";
    ctx.font = "13px system-ui";
    ctx.fillText(`boost v = ${boostV.toFixed(2)}c · γ = ${g.toFixed(3)} — worldlines tilt, simultaneity shears, the light cone never moves`, 14, 20);
  };
  drawST();
  cleanups.push(
    onTick((dt) => {
      phase += dt;
      drawST();
    }),
  );
  const boostControl = slider({
    label: "boost v/c",
    min: -0.9,
    max: 0.9,
    step: 0.01,
    value: 0,
    testid: "boost",
    onInput: (v) => {
      boostV = v;
      drawST();
    },
  });
  root.append(sceneBox(stCanvas, [boostControl], "spacetime-diagram"));
  registerScene("relativity", () => ({ boostV, K, lightConeSlope: 1 }));

  root.append(renderPanel("rel-minlength"));
  const link = el("a", { href: "#/planck", class: "crosslink", "data-crosslink": "planck" }, "→ Continue into the discreteness module: can spacetime be pixels at all?");
  root.append(link);
  void renderModulePanels;
  return () => cleanups.forEach((fn) => fn());
}
