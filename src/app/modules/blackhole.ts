import * as THREE from "three";
import {
  BH_PRESETS,
  M_SUN,
  bhEntropyOverKb,
  evaporationLifetime,
  hawkingTemperature,
  horizonBits,
  schwarzschildRadius,
} from "../../sim/hawking";
import { criticalImpactParameter } from "../../sim/geodesic";
import { onTick } from "../clock";
import { el, makeCanvas, renderPanel, renderQuestionBanners, sceneBox, slider } from "../ui";
import { registerScene } from "../hook";

export const id = "blackhole";
export const title = "The Black Hole Lab";
export const subtitle =
  "Null geodesics integrated per pixel in a shader — the shadow, the photon ring, the lensed disk — plus the thermodynamics where QM and GR finally collide.";

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uM;      // geometric mass (G=c=1 units)
uniform float uD;      // camera distance
uniform float uFov;    // vertical fov (radians)
uniform float uSpin;   // disk phase (visual only)
uniform float uDisk;   // 1 = accretion disk on, 0 = off (measurement instrument)
uniform float uFlat;   // 1 = flat-sky capture map: escaped rays white, captured black
varying vec2 vUv;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

vec3 sky(vec3 d) {
  vec3 col = vec3(0.004, 0.006, 0.012);
  // procedural starfield (no external assets — fully self-contained)
  vec3 g = d * 420.0;
  vec3 cell = floor(g);
  float h = hash(cell);
  if (h > 0.9988) {
    vec3 fr = fract(g) - 0.5;
    float fall = exp(-dot(fr, fr) * 22.0);
    float tw = 0.6 + 0.4 * hash(cell + 1.0);
    col += vec3(tw, tw * 0.96, tw * 1.05) * fall * 3.2;
  }
  // faint galactic band
  col += vec3(0.05, 0.06, 0.10) * exp(-8.0 * d.y * d.y);
  return col;
}

vec3 diskColor(float r, float rs, float phase, float side) {
  float t = clamp((r - 3.0 * rs * 0.5) / (8.0 * rs), 0.0, 1.0);
  vec3 hot = vec3(1.35, 1.05, 0.55);
  vec3 cool = vec3(0.85, 0.35, 0.12);
  float doppler = 1.0 + 0.45 * side; // approaching side brighter
  float flicker = 0.92 + 0.08 * sin(phase * 2.0 + r * 7.0);
  return mix(hot, cool, t) * (1.2 / (0.4 + t * 2.2)) * doppler * flicker;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 ndc = vUv * 2.0 - 1.0;
  float tanF = tan(uFov * 0.5);
  vec3 ro = vec3(0.0, 1.2, uD);
  vec3 target = vec3(0.0);
  vec3 fwd = normalize(target - ro);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  vec3 rd = normalize(fwd + ndc.x * aspect * tanF * right + ndc.y * tanF * up);

  float rs = 2.0 * uM;
  float D = length(ro);
  vec3 e1 = normalize(ro);                      // outward radial
  float cosT = dot(rd, -e1);                    // toward-hole component
  vec3 tDir = rd + cosT * e1;                   // transverse component
  float sinT = length(tDir);
  vec3 e2 = sinT > 1e-6 ? tDir / sinT : vec3(0.0);

  // impact parameter for a static observer at D
  float b = D * sinT / sqrt(max(1e-6, 1.0 - rs / D));

  // integrate u'' = 3 M u^2 - u in the orbital plane (u = 1/r)
  float u = 1.0 / D;
  float du = u * cosT / max(sinT, 1e-5);
  float phi = 0.0;
  float dphi = 0.028;
  bool captured = false;
  vec3 acc = vec3(0.0);
  float prevY = ro.y;
  float prevR = D;
  float uh = 1.0 / max(rs, 1e-6);

  if (sinT < 1e-5) { captured = cosT > 0.0; }

  for (int i = 0; i < 340; i++) {
    if (captured) break;
    // RK4 on (u, du)
    float k1u = du;                         float k1d = 3.0 * uM * u * u - u;
    float u2 = u + 0.5 * dphi * k1u;        float d2 = du + 0.5 * dphi * k1d;
    float k2u = d2;                         float k2d = 3.0 * uM * u2 * u2 - u2;
    float u3 = u + 0.5 * dphi * k2u;        float d3 = du + 0.5 * dphi * k2d;
    float k3u = d3;                         float k3d = 3.0 * uM * u3 * u3 - u3;
    float u4 = u + dphi * k3u;              float d4 = du + dphi * k3d;
    float k4u = d4;                         float k4d = 3.0 * uM * u4 * u4 - u4;
    u += dphi / 6.0 * (k1u + 2.0 * k2u + 2.0 * k3u + k4u);
    du += dphi / 6.0 * (k1d + 2.0 * k2d + 2.0 * k3d + k4d);
    phi += dphi;
    if (u >= uh) { captured = true; break; }
    float r = 1.0 / max(u, 1e-7);
    // accretion-disk crossing (equatorial plane y = 0)
    vec3 pos = r * (cos(phi) * e1 + sin(phi) * e2);
    if (uDisk > 0.5 && prevY * pos.y < 0.0) {
      float rc = 0.5 * (r + prevR);
      if (rc > 1.6 * rs && rc < 7.5 * rs) {
        float side = sign(dot(cross(e1, e2), vec3(0.0, 1.0, 0.0)));
        acc += diskColor(rc, rs, uSpin, side * sign(ndc.x + 0.001)) * 0.85;
      }
    }
    prevY = pos.y;
    prevR = r;
    if (u < 1.0 / (4.0 * uD) && du < 0.0) break;   // escaped
  }

  if (uFlat > 0.5) {
    // measurement mode: the rendered frame IS the geodesic capture map
    gl_FragColor = vec4(captured ? vec3(0.0) : vec3(1.0), 1.0);
    return;
  }
  vec3 col;
  if (captured) {
    col = acc; // light from the disk in front of the shadow still reaches us
  } else {
    vec3 outDir = normalize(cos(phi) * e1 + sin(phi) * e2);
    col = sky(outDir) + acc;
  }
  // photon-ring glow hint
  float nearC = abs(b - 3.0 * 1.7320508 * uM) / max(rs, 1e-5);
  col += vec3(1.0, 0.85, 0.6) * 0.10 * exp(-nearC * nearC * 22.0);
  gl_FragColor = vec4(pow(col, vec3(0.85)), 1.0);
}
`;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export function mount(root: HTMLElement): () => void {
  const cleanups: (() => void)[] = [];
  root.append(...renderQuestionBanners("blackhole"));
  root.append(renderPanel("bh-lensing"));

  const W = 720;
  const H = 405;
  const canvas = makeCanvas(W, H);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setSize(W, H, false);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const D = 25;
  const FOV = 0.5;
  let massMu = 1; // slider multiplier; geometric M = 0.25·μ
  const uniforms = {
    uRes: { value: new THREE.Vector2(W, H) },
    uM: { value: 0.25 * massMu },
    uD: { value: D },
    uFov: { value: FOV },
    uSpin: { value: 0 },
    uDisk: { value: 1 },
    uFlat: { value: 0 },
  };
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms }),
  );
  scene.add(quad);

  let lastFrameMs = 0;
  let accT = 0;
  const render = () => {
    const t0 = performance.now();
    renderer.render(scene, cam);
    lastFrameMs = performance.now() - t0;
  };
  render();
  cleanups.push(
    onTick((dt) => {
      acc(dt);
    }),
  );
  function acc(dt: number) {
    accT += dt;
    // gentle disk flicker — auto-degrades on software GL (skip if frames are slow)
    if (accT > 0.5 && lastFrameMs < 120) {
      uniforms.uSpin.value += accT;
      accT = 0;
      render();
    }
  }

  const massControl = slider({
    label: "mass (μ)",
    min: 1,
    max: 3,
    step: 1,
    value: 1,
    format: (v) => `×${v.toFixed(0)}`,
    testid: "bh-mass",
    onInput: (v) => {
      massMu = v;
      uniforms.uM.value = 0.25 * v;
      render();
    },
  });
  root.append(sceneBox(canvas, [massControl], "bh-lensing"));
  registerScene("bh-lensing", () => {
    const M = uniforms.uM.value;
    const rs = 2 * M;
    const bc = criticalImpactParameter(M);
    const sinAlpha = (bc / D) * Math.sqrt(1 - rs / D);
    return {
      massMu,
      M,
      cameraDistance: D,
      fovY: FOV,
      canvasW: W,
      canvasH: H,
      criticalImpactParameter: bc,
      expectedShadowAngularRadius: Math.asin(Math.min(1, sinAlpha)),
      lastFrameMs,
    };
  }, {
    setMass: (mu: unknown) => {
      massMu = Number(mu);
      uniforms.uM.value = 0.25 * massMu;
      render();
    },
    setDisk: (on: unknown) => {
      uniforms.uDisk.value = on ? 1 : 0;
      render();
    },
    setFlatSky: (on: unknown) => {
      uniforms.uFlat.value = on ? 1 : 0;
      render();
    },
  });

  root.append(renderPanel("bh-timedilation"));
  root.append(renderPanel("bh-hawking"));

  // ── Hawking calculator ────────────────────────────────────────────────────
  const calcWrap = el("div", {});
  const table = el("table", { class: "calc", "data-testid": "hawking-table" });
  table.append(
    el(
      "tr",
      {},
      el("th", {}, "object"),
      el("th", {}, "mass (kg)"),
      el("th", {}, "r_s"),
      el("th", {}, "T_Hawking (K)"),
      el("th", {}, "entropy (bits)"),
      el("th", {}, "lifetime (s)"),
    ),
  );
  const fmt = (x: number) => x.toExponential(3);
  for (const p of BH_PRESETS) {
    table.append(
      el(
        "tr",
        { "data-preset": p.id },
        el("td", {}, p.label),
        el("td", { "data-field": "mass" }, fmt(p.massKg)),
        el("td", { "data-field": "rs" }, fmt(schwarzschildRadius(p.massKg)) + " m"),
        el("td", { "data-field": "temp" }, fmt(hawkingTemperature(p.massKg))),
        el("td", { "data-field": "bits" }, fmt(horizonBits(p.massKg))),
        el("td", { "data-field": "lifetime" }, fmt(evaporationLifetime(p.massKg))),
      ),
    );
  }
  calcWrap.append(table);
  const custom = el("div", { class: "controls" });
  const customOut = el("b", { class: "readout", "data-testid": "hawking-custom" }, "");
  const updateCustom = (logM: number) => {
    const m = 10 ** logM;
    customOut.textContent = `M = ${fmt(m)} kg → T = ${fmt(hawkingTemperature(m))} K · S = ${fmt(bhEntropyOverKb(m))} k_B = ${fmt(horizonBits(m))} bits · area-law: entropy ∝ horizon AREA, not volume`;
  };
  custom.append(
    slider({
      label: "custom mass log₁₀(kg)",
      min: 9,
      max: 40,
      step: 0.1,
      value: Math.log10(M_SUN),
      format: (v) => v.toFixed(1),
      testid: "hawking-mass",
      onInput: updateCustom,
    }),
    el("label", {}, "", customOut),
  );
  updateCustom(Math.log10(M_SUN));
  calcWrap.append(custom);
  root.append(calcWrap);

  root.append(renderPanel("bh-entropy"));
  root.append(renderPanel("bh-infoparadox"));
  root.append(renderPanel("bh-holography"));
  return () => {
    cleanups.forEach((fn) => fn());
    renderer.dispose();
  };
}
