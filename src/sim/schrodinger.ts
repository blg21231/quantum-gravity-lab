// 1D time-dependent Schrödinger equation via split-step FFT. ħ = 1. Pure module.

import { fft } from "./fft";

export interface QState {
  re: Float64Array;
  im: Float64Array;
  n: number;
  dx: number;
  x0: number; // left edge
  mass: number;
}

export function makeGrid(n: number, xMin: number, xMax: number, mass: number): QState {
  return {
    re: new Float64Array(n),
    im: new Float64Array(n),
    n,
    dx: (xMax - xMin) / n,
    x0: xMin,
    mass,
  };
}

export function xAt(s: QState, i: number): number {
  return s.x0 + i * s.dx;
}

/** Gaussian wave packet centered x0 with width sigma and momentum k0; normalized. */
export function gaussianPacket(s: QState, xc: number, sigma: number, k0: number): void {
  for (let i = 0; i < s.n; i++) {
    const x = xAt(s, i);
    const amp = Math.exp(-((x - xc) * (x - xc)) / (4 * sigma * sigma));
    s.re[i] = amp * Math.cos(k0 * x);
    s.im[i] = amp * Math.sin(k0 * x);
  }
  normalize(s);
}

export function norm(s: QState): number {
  let acc = 0;
  for (let i = 0; i < s.n; i++) acc += s.re[i] * s.re[i] + s.im[i] * s.im[i];
  return acc * s.dx;
}

export function normalize(s: QState): void {
  const f = 1 / Math.sqrt(norm(s));
  for (let i = 0; i < s.n; i++) {
    s.re[i] *= f;
    s.im[i] *= f;
  }
}

/** ⟨x⟩ and σ_x of the probability density. */
export function moments(s: QState): { mean: number; sigma: number } {
  let p = 0;
  let m1 = 0;
  let m2 = 0;
  for (let i = 0; i < s.n; i++) {
    const d = s.re[i] * s.re[i] + s.im[i] * s.im[i];
    const x = xAt(s, i);
    p += d;
    m1 += d * x;
    m2 += d * x * x;
  }
  const mean = m1 / p;
  return { mean, sigma: Math.sqrt(Math.max(0, m2 / p - mean * mean)) };
}

/** Analytic free-packet width: σ(t) = σ0 √(1 + (t/(2 m σ0²))²)  (ħ=1). */
export function sigmaAnalytic(sigma0: number, mass: number, t: number): number {
  const u = t / (2 * mass * sigma0 * sigma0);
  return sigma0 * Math.sqrt(1 + u * u);
}

/** Split-step evolution for `steps` steps of dt under potential V(x). */
export function evolve(s: QState, V: (x: number) => number, dt: number, steps: number): void {
  const n = s.n;
  const vHalfRe = new Float64Array(n);
  const vHalfIm = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const phase = -V(xAt(s, i)) * dt * 0.5;
    vHalfRe[i] = Math.cos(phase);
    vHalfIm[i] = Math.sin(phase);
  }
  const kRe = new Float64Array(n);
  const kIm = new Float64Array(n);
  const dk = (2 * Math.PI) / (n * s.dx);
  for (let i = 0; i < n; i++) {
    const k = (i < n / 2 ? i : i - n) * dk;
    const phase = (-(k * k) / (2 * s.mass)) * dt;
    kRe[i] = Math.cos(phase);
    kIm[i] = Math.sin(phase);
  }
  const mul = (aRe: Float64Array, aIm: Float64Array, bRe: Float64Array, bIm: Float64Array) => {
    for (let i = 0; i < n; i++) {
      const r = aRe[i] * bRe[i] - aIm[i] * bIm[i];
      aIm[i] = aRe[i] * bIm[i] + aIm[i] * bRe[i];
      aRe[i] = r;
    }
  };
  for (let st = 0; st < steps; st++) {
    mul(s.re, s.im, vHalfRe, vHalfIm);
    fft(s.re, s.im);
    mul(s.re, s.im, kRe, kIm);
    fft(s.re, s.im, true);
    mul(s.re, s.im, vHalfRe, vHalfIm);
  }
}

/** Analytic rectangular-barrier transmission coefficient for energy E (ħ=1). */
export function barrierTransmissionAnalytic(E: number, V0: number, width: number, mass: number): number {
  if (E <= 0) return 0;
  if (Math.abs(E - V0) < 1e-12) {
    const k = Math.sqrt(2 * mass * E);
    const t = (k * width) / 2;
    return 1 / (1 + t * t);
  }
  if (E < V0) {
    const kappa = Math.sqrt(2 * mass * (V0 - E));
    const sh = Math.sinh(kappa * width);
    return 1 / (1 + (V0 * V0 * sh * sh) / (4 * E * (V0 - E)));
  }
  const k2 = Math.sqrt(2 * mass * (E - V0));
  const sn = Math.sin(k2 * width);
  return 1 / (1 + (V0 * V0 * sn * sn) / (4 * E * (E - V0)));
}

/**
 * Run a packet at a rectangular barrier; returns the numeric transmitted probability and
 * the packet-energy-weighted analytic prediction (the honest comparison for a packet
 * with finite momentum spread).
 */
export function tunnelingExperiment(opts?: {
  n?: number;
  k0?: number;
  sigma?: number;
  V0?: number;
  width?: number;
  mass?: number;
}): { numeric: number; analytic: number } {
  const n = opts?.n ?? 16384;
  const mass = opts?.mass ?? 1;
  const k0 = opts?.k0 ?? 1.4;
  const sigma = opts?.sigma ?? 14;
  const V0 = opts?.V0 ?? 1.1;
  const width = opts?.width ?? 1.2;
  // Fine grid: the binary-sampled barrier's effective width must resolve `width`
  // (tunneling is exponentially sensitive to it), and the packet must split cleanly
  // before any wrap-around.
  const s = makeGrid(n, -300, 300, mass);
  gaussianPacket(s, -100, sigma, k0);
  const V = (x: number) => (x >= -width / 2 && x <= width / 2 ? V0 : 0);
  const dt = 0.05;
  const T = 140;
  evolve(s, V, dt, Math.round(T / dt));
  let trans = 0;
  for (let i = 0; i < n; i++) {
    if (xAt(s, i) > width / 2 + 5) trans += s.re[i] * s.re[i] + s.im[i] * s.im[i];
  }
  const numeric = trans * s.dx;
  // packet-weighted analytic: |φ(k)|² ∝ exp(−2σ²(k−k0)²), E = k²/2m
  let wsum = 0;
  let tsum = 0;
  const nk = 4001;
  for (let i = 0; i < nk; i++) {
    const k = k0 - 4 / sigma + (8 / sigma) * (i / (nk - 1));
    const w = Math.exp(-2 * sigma * sigma * (k - k0) * (k - k0));
    const E = (k * k) / (2 * mass);
    wsum += w;
    tsum += w * barrierTransmissionAnalytic(E, V0, width, mass);
  }
  return { numeric, analytic: tsum / wsum };
}

/**
 * Decoherence model: fringe pattern with environment-reduced visibility.
 * System in superposition of two paths; each path imprints on N environment qubits
 * with coupling angle g → visibility = |⟨E0|E1⟩| = cos(g)^N.
 */
export function decoherenceVisibility(g: number, nEnv: number): number {
  return Math.abs(Math.cos(g)) ** nEnv;
}

/** Interference intensity with environment coupling: I(x) ∝ 1 + V·cos(k x). */
export function fringeIntensity(x: number, k: number, g: number, nEnv: number): number {
  return 1 + decoherenceVisibility(g, nEnv) * Math.cos(k * x);
}
