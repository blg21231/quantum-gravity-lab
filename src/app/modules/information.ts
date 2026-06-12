import { decoherenceRecord, entanglementEntropy, shannonEntropy } from "../../sim/info";
import { BH_PRESETS, horizonBits, landauerLimit } from "../../sim/hawking";
import { el, makeCanvas, renderPanel, renderQuestionBanners, sceneBox, slider } from "../ui";
import { registerScene } from "../hook";

export const id = "information";
export const title = "It From Bit";
export const subtitle =
  "The pillar hypothesis: information — distinctions — as the universe's ground floor. Here it gets quantitative.";

export function mount(root: HTMLElement): () => void {
  root.append(...renderQuestionBanners("information"));
  root.append(renderPanel("info-entanglement-creates"));

  // ── entanglement entropy, live from the reduced density matrix ───────────
  const canvas = makeCanvas(900, 360);
  let theta = Math.PI / 8;
  let lastS = entanglementEntropy(theta);
  const draw = () => {
    const ctx = canvas.getContext("2d")!;
    const { width: W, height: H } = canvas;
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);
    // S(θ) curve
    ctx.strokeStyle = "#3fb68b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= W; px++) {
      const th = (px / W) * (Math.PI / 2);
      const S = entanglementEntropy(th);
      const py = H - 40 - S * (H - 90);
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
    lastS = entanglementEntropy(theta);
    const px = (theta / (Math.PI / 2)) * W;
    ctx.fillStyle = "#ffb86e";
    ctx.beginPath();
    ctx.arc(px, H - 40 - lastS * (H - 90), 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9aa4bd";
    ctx.font = "13px system-ui";
    ctx.fillText(
      `|ψ(θ)⟩ = cos θ|00⟩ + sin θ|11⟩ · entanglement entropy S = ${lastS.toFixed(4)} bits (0 = product, 1 = Bell pair) — computed live from the reduced density matrix`,
      14,
      20,
    );
    ctx.fillText("information that exists in neither qubit alone, created by the correlation itself", 14, 40);
  };
  draw();
  const thetaControl = slider({
    label: "entanglement θ",
    min: 0,
    max: Math.PI / 2,
    step: 0.005,
    value: Math.PI / 8,
    testid: "ent-theta",
    onInput: (v) => {
      theta = v;
      draw();
    },
  });
  root.append(sceneBox(canvas, [thetaControl], "entanglement-entropy"));
  registerScene("entanglement-entropy", () => ({ theta, entropyBits: lastS }));

  root.append(renderPanel("info-records"));

  // ── decoherence as record creation: MI rises as visibility falls ─────────
  const miCanvas = makeCanvas(900, 340);
  let g = 0.3;
  const nEnv = 10;
  const drawMI = () => {
    const ctx = miCanvas.getContext("2d")!;
    const { width: W, height: H } = miCanvas;
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 2.5;
    // visibility (falls) and mutual information (rises) vs coupling
    for (const [color, fn, label, y0] of [
      ["#ff7e96", (x: number) => decoherenceRecord(x, nEnv).visibility, "visibility", 20],
      ["#6ea8ff", (x: number) => decoherenceRecord(x, nEnv).mutualInformation / 2, "I(S:E)/2 bits", 40],
    ] as const) {
      ctx.strokeStyle = color;
      ctx.beginPath();
      for (let px = 0; px <= W; px++) {
        const x = (px / W) * (Math.PI / 2);
        const py = H - 36 - fn(x) * (H - 86);
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = "13px system-ui";
      ctx.fillText(label, W - 130, y0);
    }
    ctx.lineWidth = 1;
    const rec = decoherenceRecord(g, nEnv);
    const px = (g / (Math.PI / 2)) * W;
    ctx.strokeStyle = "#e8ecf6";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(px, 30);
    ctx.lineTo(px, H - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#9aa4bd";
    ctx.fillText(
      `coupling g = ${g.toFixed(2)} → visibility ${rec.visibility.toFixed(3)} · system–environment mutual information ${rec.mutualInformation.toFixed(3)} bits — the record being written`,
      14,
      20,
    );
  };
  drawMI();
  const gControl = slider({
    label: "environment coupling g",
    min: 0,
    max: Math.PI / 2,
    step: 0.01,
    value: 0.3,
    testid: "mi-coupling",
    onInput: (v) => {
      g = v;
      drawMI();
    },
  });
  root.append(sceneBox(miCanvas, [gControl], "record-creation"));
  registerScene("record-creation", () => ({ g, ...decoherenceRecord(g, nEnv) }));

  root.append(renderPanel("info-landauer"));

  // ── Shannon ↔ Landauer calculator ────────────────────────────────────────
  const calc = el("div", { class: "controls" });
  const out = el("b", { class: "readout", "data-testid": "landauer-out" }, "");
  let temp = 300;
  let pHeads = 0.5;
  const update = () => {
    const H2 = shannonEntropy([pHeads, 1 - pHeads]);
    out.textContent = `coin with p=${pHeads.toFixed(2)} → H = ${H2.toFixed(4)} bits · erasing one bit at T=${temp.toFixed(0)} K costs ≥ ${landauerLimit(temp).toExponential(3)} J`;
  };
  calc.append(
    slider({ label: "distribution p", min: 0.01, max: 0.99, step: 0.01, value: 0.5, testid: "shannon-p", onInput: (v) => { pHeads = v; update(); } }),
    slider({ label: "temperature (K)", min: 1, max: 1000, step: 1, value: 300, format: (v) => v.toFixed(0), testid: "landauer-T", onInput: (v) => { temp = v; update(); } }),
    el("label", {}, "", out),
  );
  update();
  root.append(calc);

  root.append(renderPanel("info-bekenstein"));
  const bek = el("table", { class: "calc", "data-testid": "bekenstein-table" });
  bek.append(el("tr", {}, el("th", {}, "black hole"), el("th", {}, "horizon information bound (bits)")));
  for (const p of BH_PRESETS) {
    bek.append(el("tr", { "data-preset": p.id }, el("td", {}, p.label), el("td", { "data-field": "bits" }, horizonBits(p.massKg).toExponential(3))));
  }
  root.append(bek);
  root.append(
    el("a", { href: "#/blackhole", class: "crosslink", "data-crosslink": "blackhole" }, "→ See where these bits live: the black-hole lab."),
  );

  root.append(renderPanel("info-itfrombit"));
  root.append(renderPanel("info-distinctions"));
  return () => undefined;
}
