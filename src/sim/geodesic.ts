// Schwarzschild geodesics. Geometric units G = c = 1; mass M sets the scale (r_s = 2M).
// Pure module — no DOM/WebGL.

export interface OrbitState {
  r: number;
  phi: number;
  vr: number; // dr/dτ (massive) or dr/dλ (null)
}

export interface OrbitParams {
  M: number;
  L: number; // specific angular momentum
}

/** d²r/dτ² for a massive particle: −M/r² + L²/r³ − 3ML²/r⁴ (exact in Schwarzschild). */
export function radialAccelMassive(r: number, p: OrbitParams): number {
  const { M, L } = p;
  return -M / (r * r) + (L * L) / (r * r * r) - (3 * M * L * L) / (r * r * r * r);
}

/** d²r/dλ² for a photon: L²/r³ − 3ML²/r⁴. */
export function radialAccelNull(r: number, p: OrbitParams): number {
  const { M, L } = p;
  return (L * L) / (r * r * r) - (3 * M * L * L) / (r * r * r * r);
}

/** Newtonian (time-curvature-only, slow-speed) radial acceleration: −M/r². */
export function radialAccelNewtonian(r: number, p: OrbitParams): number {
  const { M, L } = p;
  return -M / (r * r) + (L * L) / (r * r * r);
}

/** Conserved energy per unit mass for a massive orbit: E² = vr² + (1−2M/r)(1 + L²/r²). */
export function energyMassive(s: OrbitState, p: OrbitParams): number {
  const f = 1 - (2 * p.M) / s.r;
  return Math.sqrt(s.vr * s.vr + f * (1 + (p.L * p.L) / (s.r * s.r)));
}

export type Accel = (r: number, p: OrbitParams) => number;

/** One RK4 step of (r, vr, phi) with dphi/dσ = L/r². */
export function rk4Step(s: OrbitState, p: OrbitParams, h: number, accel: Accel): OrbitState {
  const f = (st: OrbitState) => ({
    r: st.vr,
    vr: accel(st.r, p),
    phi: p.L / (st.r * st.r),
  });
  const k1 = f(s);
  const k2 = f({ r: s.r + 0.5 * h * k1.r, vr: s.vr + 0.5 * h * k1.vr, phi: 0 });
  const k3 = f({ r: s.r + 0.5 * h * k2.r, vr: s.vr + 0.5 * h * k2.vr, phi: 0 });
  const k4 = f({ r: s.r + h * k3.r, vr: s.vr + h * k3.vr, phi: 0 });
  const r = s.r + (h / 6) * (k1.r + 2 * k2.r + 2 * k3.r + k4.r);
  const vr = s.vr + (h / 6) * (k1.vr + 2 * k2.vr + 2 * k3.vr + k4.vr);
  // φ from the updated radius midpointish average (consistent RK4 on the full system):
  const phi =
    s.phi +
    (h / 6) *
      (p.L / (s.r * s.r) +
        (2 * p.L) / ((s.r + 0.5 * h * k1.r) * (s.r + 0.5 * h * k1.r)) +
        (2 * p.L) / ((s.r + 0.5 * h * k2.r) * (s.r + 0.5 * h * k2.r)) +
        p.L / ((s.r + h * k3.r) * (s.r + h * k3.r)));
  return { r, vr, phi };
}

/** Circular-orbit angular momentum at radius r (massive): L² = M r² / (r − 3M). */
export function circularL(r: number, M: number): number {
  return Math.sqrt((M * r * r) / (r - 3 * M));
}

export interface PrecessionResult {
  perOrbitPrecession: number;
  analytic: number;
  a: number;
  e: number;
  energyDriftPerOrbit: number;
}

/**
 * Integrate a bound massive orbit from apoapsis r0 with angular momentum L,
 * measure perihelion-to-perihelion Δφ − 2π and compare with 6πM/(a(1−e²)).
 */
export function measurePrecession(M: number, r0: number, L: number, orbits = 4, h = 0.5): PrecessionResult {
  let s: OrbitState = { r: r0, phi: 0, vr: 0 };
  const p: OrbitParams = { M, L };
  const E0 = energyMassive(s, p);
  const periPhis: number[] = [];
  let rMin = Infinity;
  let rMax = 0;
  let prevVr = s.vr;
  let prevState = s;
  let steps = 0;
  const maxSteps = 60_000_000;
  while (periPhis.length < orbits + 1 && steps < maxSteps) {
    const next = rk4Step(s, p, h, radialAccelMassive);
    rMin = Math.min(rMin, next.r);
    rMax = Math.max(rMax, next.r);
    if (prevVr < 0 && next.vr >= 0) {
      // perihelion crossing — linear interpolation in vr for the crossing φ
      const fr = prevVr / (prevVr - next.vr);
      periPhis.push(prevState.phi + fr * (next.phi - prevState.phi));
    }
    prevVr = next.vr;
    prevState = next;
    s = next;
    steps++;
  }
  const deltas: number[] = [];
  for (let i = 1; i < periPhis.length; i++) deltas.push(periPhis[i] - periPhis[i - 1] - 2 * Math.PI);
  const perOrbitPrecession = deltas.reduce((x, y) => x + y, 0) / deltas.length;
  const a = (rMin + rMax) / 2;
  const e = (rMax - rMin) / (rMax + rMin);
  const analytic = (6 * Math.PI * M) / (a * (1 - e * e));
  const E1 = energyMassive(s, p);
  const energyDriftPerOrbit = Math.abs(E1 - E0) / Math.max(1, periPhis.length - 1);
  return { perOrbitPrecession, analytic, a, e, energyDriftPerOrbit };
}

/** Photon-sphere radius: extremum of the null effective potential (analytic 3M). Found numerically. */
export function findPhotonSphere(M: number): number {
  // V_null(r) = (1 − 2M/r)/r² → maximize numerically on [2.2M, 8M]
  let best = 0;
  let bestV = -Infinity;
  for (let r = 2.2 * M; r <= 8 * M; r += 0.0001 * M) {
    const v = (1 - (2 * M) / r) / (r * r);
    if (v > bestV) {
      bestV = v;
      best = r;
    }
  }
  return best;
}

/** ISCO radius: smallest r with a stable circular orbit (analytic 6M). Found numerically. */
export function findISCO(M: number): number {
  // Stable circular orbits need L²(r) = Mr²/(r−3M) AND d²V/dr² > 0; ISCO where the
  // effective-potential minimum disappears. Scan r downward checking stability.
  const stable = (r: number): boolean => {
    const L2 = (M * r * r) / (r - 3 * M);
    const V = (x: number) => (1 - (2 * M) / x) * (1 + L2 / (x * x));
    const eps = 1e-4 * M;
    const second = (V(r + eps) - 2 * V(r) + V(r - eps)) / (eps * eps);
    return second > 0;
  };
  let lo = 3.05 * M;
  let hi = 10 * M;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (stable(mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}

/** Critical photon impact parameter b_c = 3√3·M. */
export function criticalImpactParameter(M: number): number {
  return 3 * Math.sqrt(3) * M;
}

/** Shoot a photon from far away with impact parameter b; returns true if captured. */
export function photonCaptured(M: number, b: number, r0 = 400, h = 0.02): boolean {
  // E = 1, L = b. Inward photon: vr² = E² − L²(1−2M/r)/r².
  const L = b;
  const p: OrbitParams = { M, L };
  const f0 = 1 - (2 * M) / r0;
  let s: OrbitState = { r: r0, phi: 0, vr: -Math.sqrt(Math.max(0, 1 - (L * L * f0) / (r0 * r0))) };
  for (let i = 0; i < 4_000_000; i++) {
    s = rk4Step(s, p, h, radialAccelNull);
    if (s.r <= 2.001 * M) return true;
    if (s.r > r0 * 1.05 && s.vr > 0) return false;
  }
  return true;
}

/**
 * Photon deflection angle for impact parameter b (weak field analytic: 4M/b).
 * Integrates the full null geodesic and measures the asymptotic bend.
 */
export function photonDeflection(M: number, b: number, r0 = 40_000, h = 0.5): number {
  const L = b;
  const p: OrbitParams = { M, L };
  const f0 = 1 - (2 * M) / r0;
  let s: OrbitState = { r: r0, phi: 0, vr: -Math.sqrt(Math.max(0, 1 - (L * L * f0) / (r0 * r0))) };
  for (let i = 0; i < 40_000_000; i++) {
    s = rk4Step(s, p, h, radialAccelNull);
    if (s.r >= r0) break;
  }
  // A straight line entering at distance r0 with impact parameter b sweeps
  // π − 2·arcsin(b/r0) of polar angle between its two r=r0 crossings.
  const straightSweep = Math.PI - 2 * Math.asin(b / r0);
  return Math.abs(s.phi) - straightSweep;
}

/**
 * Slow-object scattering: integrate the full GR equation and the Newtonian
 * (time-curvature-only) equation from identical far-field initial conditions;
 * returns both deflection angles.
 */
export function slowScatteringComparison(
  M: number,
  b: number,
  v: number,
  r0 = 20_000,
  h = 2,
): { fullGR: number; newtonian: number } {
  const L = b * v;
  const p: OrbitParams = { M, L };
  const run = (accel: Accel): number => {
    let s: OrbitState = { r: r0, phi: 0, vr: -Math.sqrt(Math.max(1e-12, v * v - (L * L) / (r0 * r0))) };
    for (let i = 0; i < 80_000_000; i++) {
      s = rk4Step(s, p, h, accel);
      if (s.r >= r0) break;
    }
    return Math.abs(s.phi) - (Math.PI - 2 * Math.asin(b / r0));
  };
  return { fullGR: run(radialAccelMassive), newtonian: run(radialAccelNewtonian) };
}

/** Gravitational time-dilation factor for a static clock at r: dτ/dt = √(1 − r_s/r). */
export function gravitationalTimeDilation(M: number, r: number): number {
  return Math.sqrt(1 - (2 * M) / r);
}

/**
 * Equivalence principle: geodesics carry no mass parameter at all — this integrates a
 * trajectory for a "test mass" argument and provably ignores it (mass-independence).
 */
export function trajectoryForTestMass(
  _testMass: number,
  M: number,
  init: OrbitState,
  L: number,
  steps: number,
  h: number,
): OrbitState[] {
  const p: OrbitParams = { M, L };
  const out: OrbitState[] = [init];
  let s = init;
  for (let i = 0; i < steps; i++) {
    s = rk4Step(s, p, h, radialAccelMassive);
    out.push(s);
  }
  return out;
}
