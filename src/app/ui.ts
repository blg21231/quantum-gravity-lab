import { PANELS } from "../content/panels";
import { QUESTIONS } from "../content/questions";
import type { ModuleId } from "../content/types";

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

export function renderPanel(id: string): HTMLElement {
  const p = PANELS.find((x) => x.id === id);
  if (!p) throw new Error(`unknown panel ${id}`);
  const sec = el("section", { "data-panel": p.id, "data-epistemic": p.tag });
  sec.append(
    el("span", { class: `tag-chip tag-${p.tag}` }, p.tag),
    el("h3", {}, p.title),
    ...p.body.split("\n").map((para) => el("p", {}, para)),
  );
  return sec;
}

export function renderModulePanels(module: ModuleId): HTMLElement[] {
  return PANELS.filter((p) => p.module === module).map((p) => renderPanel(p.id));
}

export function renderQuestionBanners(module: ModuleId): HTMLElement[] {
  return QUESTIONS.filter((q) => q.routes.includes(module)).map((q) => {
    const div = el("div", { class: "question-banner", "data-question": q.id });
    div.append(
      el("span", { class: "qstatus", "data-qstatus": q.status }, q.status),
      el("span", { class: "qid" }, q.id),
      document.createTextNode(q.text),
    );
    return div;
  });
}

export interface SliderSpec {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format?: (v: number) => string;
  onInput: (v: number) => void;
  testid?: string;
}

export function slider(spec: SliderSpec): HTMLElement {
  const fmt = spec.format ?? ((v: number) => v.toFixed(2));
  const valEl = el("b", {}, fmt(spec.value));
  const input = el("input", {
    type: "range",
    min: String(spec.min),
    max: String(spec.max),
    step: String(spec.step),
    value: String(spec.value),
    ...(spec.testid ? { "data-testid": spec.testid } : {}),
  });
  input.addEventListener("input", () => {
    const v = Number(input.value);
    valEl.textContent = fmt(v);
    spec.onInput(v);
  });
  return el("label", {}, `${spec.label} `, valEl, input);
}

export function sceneBox(canvas: HTMLCanvasElement, controls: HTMLElement[], sceneId: string): HTMLElement {
  const box = el("div", { class: "scene", "data-scene": sceneId });
  box.append(canvas);
  if (controls.length) {
    const bar = el("div", { class: "controls" });
    bar.append(...controls);
    box.append(bar);
  }
  return box;
}

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}
