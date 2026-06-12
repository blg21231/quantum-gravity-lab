import { circularL, trajectoryForTestMass } from "../../sim/geodesic";
import type { OrbitState } from "../../sim/geodesic";
import { onTick } from "../clock";
import { el, makeCanvas, renderPanel, renderQuestionBanners, sceneBox } from "../ui";
import { registerScene } from "../hook";

export const id = "gravity";
export const title = "Gravity's Special Status";
export const subtitle =
  "Fundamental layer — or emergent bookkeeping? The force behind every deep dilemma, examined from both sides.";

export function mount(root: HTMLElement): () => void {
  const cleanups: (() => void)[] = [];
  root.append(...renderQuestionBanners("gravity"));
  root.append(renderPanel("grav-universality"));

  // ── drop test: two masses, one geodesic ──────────────────────────────────
  const canvas = makeCanvas(900, 420);
  const M = 1;
  const r0 = 17;
  const L = circularL(r0, M) * 0.94;
  const steps = 2600;
  const h = 0.06;
  const trajLight = trajectoryForTestMass(1e-6, M, { r: r0, phi: 0, vr: 0 }, L, steps, h);
  const trajHeavy = trajectoryForTestMass(1, M, { r: r0, phi: 0, vr: 0 }, L, steps, h);
  let maxDivergence = 0;
  for (let i = 0; i < trajLight.length; i++) {
    maxDivergence = Math.max(
      maxDivergence,
      Math.abs(trajLight[i].r - trajHeavy[i].r),
      Math.abs(trajLight[i].phi - trajHeavy[i].phi),
    );
  }
  let idx = 0;
  const draw = () => {
    const ctx = canvas.getContext("2d")!;
    const { width: W, height: H } = canvas;
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);
    const S = 9.5;
    const cx = W / 2;
    const cy = H / 2;
    // hole
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(cx, cy, 2 * M * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2a3c66";
    ctx.stroke();
    const toPx = (s: OrbitState) => ({ x: cx + s.r * Math.cos(s.phi) * S, y: cy + s.r * Math.sin(s.phi) * S });
    // identical trail
    ctx.strokeStyle = "rgba(110,168,255,0.55)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= idx; i += 4) {
      const p = toPx(trajLight[i]);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    // the two bodies: a feather (small, light) and a star (big, 10⁶× heavier) — same point
    ctx.lineWidth = 1;
    const p1 = toPx(trajLight[idx]);
    const p2 = toPx(trajHeavy[idx]);
    ctx.fillStyle = "#ffb86e";
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6ea8ff";
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9aa4bd";
    ctx.font = "13px system-ui";
    ctx.fillText(
      `the feather (blue, m) and the boulder (orange, 10⁶·m) ride the same geodesic — max divergence over ${steps} steps: ${maxDivergence.toExponential(2)}`,
      14,
      20,
    );
    ctx.fillText("the equation of motion contains no mass at all: that is the equivalence principle, and it is why gravity can be geometry", 14, 40);
  };
  draw();
  cleanups.push(
    onTick(() => {
      idx = (idx + 10) % steps;
      draw();
    }),
  );
  root.append(sceneBox(canvas, [], "drop-test"));
  registerScene("drop-test", () => ({
    massRatio: 1e6,
    maxTrajectoryDivergence: maxDivergence,
    steps,
    idx,
  }));

  root.append(renderPanel("grav-nonrenorm"));
  root.append(renderPanel("grav-emergent"));
  root.append(renderPanel("grav-collapse"));
  root.append(renderPanel("grav-thread"));
  root.append(
    el("a", { href: "#/graph", class: "crosslink", "data-crosslink": "graph" }, "→ See gravity's edges to every dilemma on the concept map."),
  );
  return () => cleanups.forEach((fn) => fn());
}
