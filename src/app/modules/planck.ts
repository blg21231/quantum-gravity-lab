import { mulberry32 } from "../../sim/bell";
import { boostPoint, poissonSprinkling, regularLattice } from "../../sim/sprinkling";
import type { Pt } from "../../sim/sprinkling";
import { makeCanvas, renderPanel, renderQuestionBanners, sceneBox, slider } from "../ui";
import { registerScene } from "../hook";

export const id = "planck";
export const title = "Pixels of Spacetime?";
export const subtitle =
  "Bruce's lattice picture meets Lorentz invariance: boost a grid and you can tell — boost a sprinkling and you can't.";

export function mount(root: HTMLElement): () => void {
  root.append(...renderQuestionBanners("planck"));
  root.append(renderPanel("pl-lattice"));

  const canvas = makeCanvas(900, 480);
  let v = 0;
  const L = 9;
  const lattice = regularLattice(L, 1.2);
  const sprinkle = poissonSprinkling(L, 1 / 1.44, mulberry32(7));

  const draw = () => {
    const ctx = canvas.getContext("2d")!;
    const { width: W, height: H } = canvas;
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);
    const half = W / 2;
    const S = 19;
    const plot = (pts: Pt[], cx: number, color: string) => {
      ctx.fillStyle = color;
      for (const p of pts) {
        const b = boostPoint(p, v);
        const px = cx + b.x * S;
        const py = H / 2 - b.t * S + 14;
        if (px > cx - half / 2 + 12 && px < cx + half / 2 - 12 && py > 40 && py < H - 14) {
          ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
        }
      }
    };
    // light-cone guides through the center of each panel — invariant
    for (const cx of [half / 2, half + half / 2]) {
      ctx.strokeStyle = "#2b2336";
      ctx.beginPath();
      ctx.moveTo(cx - 90, H / 2 + 90 + 14);
      ctx.lineTo(cx + 90, H / 2 - 90 + 14);
      ctx.moveTo(cx - 90, H / 2 - 90 + 14);
      ctx.lineTo(cx + 90, H / 2 + 90 + 14);
      ctx.stroke();
    }
    plot(lattice, half / 2, "#6ea8ff");
    plot(sprinkle, half + half / 2, "#ffb86e");
    ctx.strokeStyle = "#1c2538";
    ctx.beginPath();
    ctx.moveTo(half, 0);
    ctx.lineTo(half, H);
    ctx.stroke();
    ctx.fillStyle = "#9aa4bd";
    ctx.font = "13px system-ui";
    ctx.fillText(`REGULAR LATTICE — boost v = ${v.toFixed(2)}c: rows shear, spacings change, the rest frame is detectable`, 14, 22);
    ctx.fillText("POISSON SPRINKLING — same boost: statistically identical; no experiment finds a frame", half + 14, 22);
  };
  draw();

  const boostControl = slider({
    label: "boost v/c",
    min: -0.85,
    max: 0.85,
    step: 0.01,
    value: 0,
    testid: "lattice-boost",
    onInput: (x) => {
      v = x;
      draw();
    },
  });
  root.append(sceneBox(canvas, [boostControl], "lattice-vs-sprinkling"));
  registerScene("lattice-vs-sprinkling", () => ({
    boost: v,
    latticePoints: lattice.length,
    sprinklingPoints: sprinkle.length,
  }));

  root.append(renderPanel("pl-bounds"));
  root.append(renderPanel("pl-strings"));
  root.append(renderPanel("pl-lqg"));
  root.append(renderPanel("pl-causalsets"));
  return () => undefined;
}
