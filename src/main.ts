import { QUESTIONS } from "./content/questions";
import { startClock } from "./app/clock";
import { installHook, unregisterScene } from "./app/hook";
import { el } from "./app/ui";
import * as relativity from "./app/modules/relativity";
import * as curvature from "./app/modules/curvature";
import * as slits from "./app/modules/slits";
import * as quantum from "./app/modules/quantum";
import * as entanglement from "./app/modules/entanglement";
import * as blackhole from "./app/modules/blackhole";
import * as planck from "./app/modules/planck";
import * as information from "./app/modules/information";
import * as gravity from "./app/modules/gravity";
import * as graphview from "./app/modules/graphview";

interface ModuleDef {
  id: string;
  title: string;
  subtitle: string;
  mount: (root: HTMLElement) => () => void;
}

const MODULES: ModuleDef[] = [
  relativity,
  curvature,
  slits,
  quantum,
  entanglement,
  blackhole,
  planck,
  information,
  gravity,
  graphview,
];

const app = document.getElementById("app")!;
let cleanup: (() => void) | null = null;

function header(activeId: string | null): HTMLElement {
  const head = el("header", { class: "site" });
  head.append(el("h1", {}, el("a", { href: "#/" }, "Quantum Gravity Lab")));
  const nav = el("nav", { class: "modules", "data-testid": "module-nav" });
  for (const m of MODULES) {
    nav.append(el("a", { href: `#/${m.id}`, class: m.id === activeId ? "active" : "", "data-nav": m.id }, m.title));
  }
  const wrap = el("div", {});
  wrap.append(head, nav);
  return wrap;
}

function renderHome(): void {
  app.replaceChildren(header(null));
  const hero = el("div", {});
  hero.append(
    el("h2", { class: "module-title" }, "Quantum mechanics × general relativity × black holes"),
    el(
      "p",
      { class: "module-sub" },
      "An interactive lab built on real numerics — geodesic integrators, split-step Schrödinger evolution, phasor path sums, Bell statistics, a per-pixel lensing raytracer — with information and gravity as the two candidate fundamental pillars. Every claim carries an honesty label: established, prediction, interpretation, conjecture, or open question.",
    ),
  );
  app.append(hero);

  const cards = el("div", { class: "cards", "data-testid": "module-cards" });
  for (const m of MODULES) {
    cards.append(el("a", { class: "card", href: `#/${m.id}`, "data-card": m.id }, el("h3", {}, m.title), el("p", {}, m.subtitle)));
  }
  app.append(cards);

  app.append(el("h2", { class: "module-title" }, "The nine driving questions"));
  const ql = el("ul", { class: "qlist", "data-testid": "question-list" });
  for (const q of QUESTIONS) {
    const li = el("li", { "data-question": q.id });
    const links = q.routes.map((r, i) => {
      const a = el("a", { href: `#/${r}` }, MODULES.find((m) => m.id === r)?.title ?? r);
      return i === 0 ? a : ([", ", a] as const);
    });
    li.append(
      el("span", { class: "qid" }, q.id + " "),
      document.createTextNode(q.text + " "),
      el("em", { style: "color:var(--ink-dim)" }, ` [${q.status}] → `),
    );
    for (const part of links.flat()) li.append(part as Node | string);
    ql.append(li);
  }
  app.append(ql);
  app.append(footer());
}

function footer(): HTMLElement {
  return el(
    "footer",
    { class: "site" },
    "Every visual is driven by live, benchmarked numerics — no canned animation. Built around Bruce's nine driving questions. Tags: established · theoretical-prediction · interpretation · conjecture · open-question.",
  );
}

function renderModule(m: ModuleDef): void {
  app.replaceChildren(header(m.id));
  app.append(el("h2", { class: "module-title" }, m.title), el("p", { class: "module-sub" }, m.subtitle));
  const root = el("div", { "data-module-root": m.id });
  app.append(root);
  cleanup = m.mount(root);
  app.append(footer());
}

function route(): void {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
  for (const m of MODULES) unregisterScene(m.id);
  const hash = location.hash.replace(/^#\/?/, "").replace(/\/$/, "");
  const m = MODULES.find((x) => x.id === hash);
  window.scrollTo(0, 0);
  if (m) renderModule(m);
  else renderHome();
}

installHook();
startClock();
window.addEventListener("hashchange", route);
route();
