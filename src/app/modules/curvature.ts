import * as THREE from "three";
import {
  circularL,
  findISCO,
  findPhotonSphere,
  gravitationalTimeDilation,
  radialAccelMassive,
  rk4Step,
} from "../../sim/geodesic";
import type { OrbitState } from "../../sim/geodesic";
import { onTick } from "../clock";
import { el, makeCanvas, renderPanel, renderQuestionBanners, sceneBox, slider } from "../ui";
import { registerScene } from "../hook";

export const id = "curvature";
export const title = "Curved Spacetime, Without the Rubber Sheet";
export const subtitle =
  "Geodesics integrated live in the Schwarzschild metric — precession, the photon sphere, the ISCO, and gravity as a gradient in time.";

export function mount(root: HTMLElement): () => void {
  const cleanups: (() => void)[] = [];
  root.append(...renderQuestionBanners("curvature"));
  root.append(renderPanel("curv-rubbersheet"));
  root.append(renderPanel("curv-timecurvature"));

  // ── three.js orbit explorer ───────────────────────────────────────────────
  const canvas = makeCanvas(900, 560);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(900, 560, false);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070c);
  const camera = new THREE.PerspectiveCamera(45, 900 / 560, 0.1, 500);
  camera.position.set(0, 34, 26);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.PointLight(0x88aaff, 900);
  key.position.set(20, 30, 20);
  scene.add(key);

  // starfield backdrop (parallaxes with the camera)
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(2800 * 3);
  let sSeed = 99;
  const sRnd = () => {
    sSeed = (sSeed * 1103515245 + 12345) % 2147483648;
    return sSeed / 2147483648 - 0.5;
  };
  for (let i = 0; i < 2800; i++) {
    const v = new THREE.Vector3(sRnd(), sRnd(), sRnd()).normalize().multiplyScalar(150 + 60 * Math.abs(sRnd()));
    starPos[i * 3] = v.x;
    starPos[i * 3 + 1] = v.y;
    starPos[i * 3 + 2] = v.z;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xbfc8e0, size: 2.6, sizeAttenuation: false })));

  let M = 0.5;
  // black hole + horizon
  const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const bh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), bhMat);
  scene.add(bh);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0x2a3c66, transparent: true, opacity: 0.35, side: THREE.BackSide }),
  );
  scene.add(glow);

  // rings derive from the LIVE engine (findPhotonSphere / findISCO), not constants
  const ringMat = (color: number) =>
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
  const photonRing = new THREE.Mesh(new THREE.RingGeometry(1, 1.06, 96), ringMat(0xffb86e));
  const iscoRing = new THREE.Mesh(new THREE.RingGeometry(1, 1.04, 96), ringMat(0x3fb68b));
  photonRing.rotation.x = -Math.PI / 2;
  iscoRing.rotation.x = -Math.PI / 2;
  scene.add(photonRing, iscoRing);

  // orbiting body + trail
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 16), new THREE.MeshStandardMaterial({ color: 0x6ea8ff, emissive: 0x224488 }));
  scene.add(body);
  const trailMax = 1400;
  const trailPos = new Float32Array(trailMax * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
  trailGeo.setDrawRange(0, 0);
  const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0x6ea8ff, transparent: true, opacity: 0.65 }));
  scene.add(trail);
  let trailLen = 0;

  let orbit: OrbitState = { r: 8, phi: 0, vr: 0 };
  let L = 0;
  let photonSphereR = 0;
  let iscoR = 0;

  const rebuild = () => {
    photonSphereR = findPhotonSphere(M);
    iscoR = findISCO(M);
    photonRing.geometry.dispose();
    photonRing.geometry = new THREE.RingGeometry(photonSphereR, photonSphereR + 0.3, 96);
    iscoRing.geometry.dispose();
    iscoRing.geometry = new THREE.RingGeometry(iscoR, iscoR + 0.26, 96);
    bh.scale.setScalar(2 * M); // horizon r_s = 2M
    glow.scale.setScalar(2.3 * M);
    const r0 = 16 * M;
    orbit = { r: r0, phi: 0, vr: 0 };
    L = circularL(r0, M) * 0.965; // eccentric → visible precession
    trailLen = 0;
    trailGeo.setDrawRange(0, 0);
  };
  rebuild();

  const statusLine = el("div", { class: "controls" });
  const dilation = el("b", { class: "readout" }, "");
  statusLine.append(el("label", {}, "clock rate at the body  dτ/dt = √(1−r_s/r): ", dilation));

  let camAngle = 0;
  let camPhase = 0;
  cleanups.push(
    onTick((dt) => {
      camAngle += dt * 0.12;
      camPhase += dt * 0.9;
      // orbit + elevation breathing: the ring ellipses visibly reshape as the camera moves
      camera.position.set(26 * Math.sin(camAngle), 34 + 8 * Math.sin(camPhase), 26 * Math.cos(camAngle));
      camera.lookAt(0, 0, 0);
      const h = dt * 14;
      const sub = 8;
      for (let i = 0; i < sub; i++) {
        orbit = rk4Step(orbit, { M, L }, h / sub, radialAccelMassive);
        if (orbit.r < 2.2 * M) {
          rebuild();
          break;
        }
      }
      const x = orbit.r * Math.cos(orbit.phi);
      const z = orbit.r * Math.sin(orbit.phi);
      body.position.set(x, 0, z);
      if (trailLen < trailMax) {
        trailPos[trailLen * 3] = x;
        trailPos[trailLen * 3 + 1] = 0;
        trailPos[trailLen * 3 + 2] = z;
        trailLen++;
        trailGeo.setDrawRange(0, trailLen);
        trailGeo.attributes.position.needsUpdate = true;
      } else {
        trailPos.copyWithin(0, 3);
        trailPos[(trailMax - 1) * 3] = x;
        trailPos[(trailMax - 1) * 3 + 1] = 0;
        trailPos[(trailMax - 1) * 3 + 2] = z;
        trailGeo.attributes.position.needsUpdate = true;
      }
      dilation.textContent = gravitationalTimeDilation(M, orbit.r).toFixed(4) + `  (r = ${orbit.r.toFixed(1)})`;
      renderer.render(scene, camera);
    }),
  );
  renderer.render(scene, camera);

  const massControl = slider({
    label: "black-hole mass M",
    min: 0.5,
    max: 1.0,
    step: 0.05,
    value: 0.5,
    testid: "orbit-mass",
    onInput: (v) => {
      M = v;
      rebuild();
    },
  });
  root.append(sceneBox(canvas, [massControl], "orbit-explorer"));
  root.append(statusLine);

  // scene-measured facts: ring radii read back from the live three.js geometry
  const worldRingRadius = (mesh: THREE.Mesh): number => {
    const geo = mesh.geometry as THREE.RingGeometry;
    return geo.parameters.innerRadius * mesh.scale.x;
  };
  registerScene("orbit-explorer", () => ({
    M,
    photonSphereWorldR: worldRingRadius(photonRing),
    iscoWorldR: worldRingRadius(iscoRing),
    bodyR: orbit.r,
    bodyPhi: orbit.phi,
    trailLen,
    rendererCalls: renderer.info.render.calls,
  }), {
    setMass: (m: unknown) => {
      M = Number(m);
      rebuild();
      renderer.render(scene, camera);
    },
  });

  root.append(renderPanel("curv-orbits"));
  return () => {
    cleanups.forEach((fn) => fn());
    renderer.dispose();
  };
}
