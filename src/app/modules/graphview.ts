import * as THREE from "three";
import { EDGES, NODES } from "../../content/graph";
import { onTick } from "../clock";
import { el, makeCanvas, renderPanel, renderQuestionBanners, sceneBox } from "../ui";
import { registerScene } from "../hook";

export const id = "graph";
export const title = "The Concept Map";
export const subtitle =
  "What derives what, what emerges from what, where the tensions live — the lab's synthesis, navigable.";

const STATUS_COLOR: Record<string, number> = {
  established: 0x3fb68b,
  "theoretical-prediction": 0x6ea8ff,
  interpretation: 0xb48cff,
  conjecture: 0xffb86e,
  "open-question": 0xff7e96,
};

export function mount(root: HTMLElement): () => void {
  const cleanups: (() => void)[] = [];
  root.append(...renderQuestionBanners("graph"));
  root.append(renderPanel("graph-reading"));

  const W = 900;
  const H = 620;
  const canvas = makeCanvas(W, H);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(W, H, false);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070c);
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 400);
  camera.position.set(0, 0, 64);
  scene.add(new THREE.AmbientLight(0xffffff, 1.6));

  // ── force layout (precomputed in a few hundred iterations) ────────────────
  const idx = new Map(NODES.map((n, i) => [n.id, i]));
  const N = NODES.length;
  const px = new Float64Array(N);
  const py = new Float64Array(N);
  const pz = new Float64Array(N);
  let seed = 1234;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648 - 0.5;
  };
  for (let i = 0; i < N; i++) {
    px[i] = rnd() * 40;
    py[i] = rnd() * 30;
    pz[i] = rnd() * 16;
  }
  const links = EDGES.map((e) => [idx.get(e.from)!, idx.get(e.to)!] as const);
  for (let iter = 0; iter < 420; iter++) {
    const fx = new Float64Array(N);
    const fy = new Float64Array(N);
    const fz = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        let dx = px[i] - px[j];
        let dy = py[i] - py[j];
        let dz = pz[i] - pz[j];
        const d2 = dx * dx + dy * dy + dz * dz + 0.01;
        const f = 160 / d2;
        const d = Math.sqrt(d2);
        dx /= d;
        dy /= d;
        dz /= d;
        fx[i] += dx * f;
        fy[i] += dy * f;
        fz[i] += dz * f;
        fx[j] -= dx * f;
        fy[j] -= dy * f;
        fz[j] -= dz * f;
      }
    }
    for (const [a, b] of links) {
      const dx = px[b] - px[a];
      const dy = py[b] - py[a];
      const dz = pz[b] - pz[a];
      const k = 0.04;
      fx[a] += dx * k;
      fy[a] += dy * k;
      fz[a] += dz * k;
      fx[b] -= dx * k;
      fy[b] -= dy * k;
      fz[b] -= dz * k;
    }
    const damp = 0.6;
    for (let i = 0; i < N; i++) {
      px[i] += Math.max(-2, Math.min(2, fx[i] * damp)) - px[i] * 0.004;
      py[i] += Math.max(-2, Math.min(2, fy[i] * damp)) - py[i] * 0.004;
      pz[i] += Math.max(-2, Math.min(2, fz[i] * damp)) - pz[i] * 0.004;
    }
  }

  // nodes
  const group = new THREE.Group();
  scene.add(group);
  const meshes: THREE.Mesh[] = [];
  for (let i = 0; i < N; i++) {
    const n = NODES[i];
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(n.id === "gravity" || n.id === "information" ? 1.5 : 0.95, 20, 14),
      new THREE.MeshBasicMaterial({ color: STATUS_COLOR[n.status] ?? 0xffffff }),
    );
    m.position.set(px[i], py[i], pz[i]);
    m.userData = { nodeId: n.id, module: n.module };
    group.add(m);
    meshes.push(m);
  }
  // edges
  const linePos: number[] = [];
  const lineCol: number[] = [];
  for (const e of EDGES) {
    const a = idx.get(e.from)!;
    const b = idx.get(e.to)!;
    linePos.push(px[a], py[a], pz[a], px[b], py[b], pz[b]);
    const c = new THREE.Color(STATUS_COLOR[e.status] ?? 0x888888);
    lineCol.push(c.r, c.g, c.b, c.r, c.g, c.b);
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePos, 3));
  lineGeo.setAttribute("color", new THREE.Float32BufferAttribute(lineCol, 3));
  const lines = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.32 }),
  );
  group.add(lines);

  // labels via sprite-less DOM overlay (cheap + crisp)
  const labelLayer = el("div", { style: "position:absolute;inset:0;pointer-events:none;overflow:hidden;" });
  const labels: HTMLElement[] = NODES.map((n) => {
    const s = el("span", {
      style:
        "position:absolute;font-size:10px;color:#c8d0e4;transform:translate(-50%,-160%);white-space:nowrap;text-shadow:0 1px 3px #000;",
      "data-node-label": n.id,
    });
    s.textContent = n.label;
    labelLayer.append(s);
    return s;
  });

  const v = new THREE.Vector3();
  const updateLabels = () => {
    for (let i = 0; i < N; i++) {
      v.set(px[i], py[i], pz[i]).applyMatrix4(group.matrixWorld).project(camera);
      const sx = ((v.x + 1) / 2) * 100;
      const sy = ((1 - v.y) / 2) * 100;
      labels[i].style.left = sx + "%";
      labels[i].style.top = sy + "%";
      labels[i].style.opacity = v.z < 1 ? "0.95" : "0";
    }
  };

  cleanups.push(
    onTick((dt) => {
      group.rotation.y += dt * 0.06;
      group.updateMatrixWorld();
      renderer.render(scene, camera);
      updateLabels();
    }),
  );
  group.updateMatrixWorld();
  renderer.render(scene, camera);
  updateLabels();

  // click → navigate to the node's module
  const ray = new THREE.Raycaster();
  const onClick = (ev: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    ray.setFromCamera(new THREE.Vector2(x, y), camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    if (hit) {
      const mod = (hit.object.userData as { module?: string }).module;
      if (mod && mod !== "graph") location.hash = `#/${mod}`;
    }
  };
  canvas.addEventListener("click", onClick);
  cleanups.push(() => canvas.removeEventListener("click", onClick));

  const box = sceneBox(canvas, [], "concept-graph");
  (box as HTMLElement).style.position = "relative";
  box.append(labelLayer);
  root.append(box);

  // legend
  const legend = el("div", { class: "controls" });
  for (const [k, c] of Object.entries(STATUS_COLOR)) {
    legend.append(
      el(
        "label",
        {},
        el("span", {
          style: `display:inline-block;width:12px;height:12px;border-radius:3px;background:#${c.toString(16).padStart(6, "0")};margin-right:6px;`,
        }),
        k,
      ),
    );
  }
  root.append(legend);
  registerScene("concept-graph", () => ({
    nodes: NODES.length,
    edges: EDGES.length,
    rotation: group.rotation.y,
  }));

  return () => {
    cleanups.forEach((fn) => fn());
    renderer.dispose();
  };
}
