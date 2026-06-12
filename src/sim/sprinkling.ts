// Planck-scale discreteness vs Lorentz invariance: a regular lattice picks out a frame
// under boosts; a Poisson sprinkling's statistics are boost-invariant. 1+1D. Pure module.

import type { Rng } from "./bell";

export interface Pt {
  t: number;
  x: number;
}

export function boostPoint(p: Pt, v: number): Pt {
  const g = 1 / Math.sqrt(1 - v * v);
  return { t: g * (p.t - v * p.x), x: g * (p.x - v * p.t) };
}

/** Regular lattice on [−L, L]² with spacing h. */
export function regularLattice(L: number, h: number): Pt[] {
  const out: Pt[] = [];
  for (let t = -L; t <= L + 1e-9; t += h) for (let x = -L; x <= L + 1e-9; x += h) out.push({ t, x });
  return out;
}

/** Poisson sprinkling on [−L, L]² with density rho. */
export function poissonSprinkling(L: number, rho: number, rng: Rng): Pt[] {
  const area = 4 * L * L;
  // Poisson(rho·area) count via Knuth
  const lambda = rho * area;
  let n: number;
  if (lambda > 600) {
    // normal approximation for large λ
    const u1 = rng();
    const u2 = rng();
    n = Math.max(0, Math.round(lambda + Math.sqrt(lambda) * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)));
  } else {
    const target = Math.exp(-lambda);
    let k = 0;
    let prod = 1;
    for (;;) {
      prod *= rng();
      if (prod <= target) break;
      k++;
    }
    n = k;
  }
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) out.push({ t: -L + 2 * L * rng(), x: -L + 2 * L * rng() });
  return out;
}

/** Mean Euclidean nearest-neighbor distance of a point set (coordinate-grid measure). */
export function meanNearestNeighbor(pts: Pt[], sampleCap = 1500): number {
  const n = Math.min(pts.length, sampleCap);
  let acc = 0;
  for (let i = 0; i < n; i++) {
    let best = Infinity;
    for (let j = 0; j < pts.length; j++) {
      if (i === j) continue;
      const dt = pts[i].t - pts[j].t;
      const dx = pts[i].x - pts[j].x;
      const d = dt * dt + dx * dx;
      if (d < best) best = d;
    }
    acc += Math.sqrt(best);
  }
  return acc / n;
}

/**
 * Count points inside a causal diamond between p (bottom) and q (top): events e with
 * p ≺ e ≺ q in the causal order. The diamond's invariant volume is boost-invariant,
 * so for a Poisson sprinkling the count statistics are too.
 */
export function diamondCount(pts: Pt[], p: Pt, q: Pt): number {
  let n = 0;
  for (const e of pts) {
    const inFuture = e.t - p.t > Math.abs(e.x - p.x);
    const inPast = q.t - e.t > Math.abs(q.x - e.x);
    if (inFuture && inPast) n++;
  }
  return n;
}

/** Mean diamond count over many randomly placed diamonds of fixed half-height tau. */
export function meanDiamondCount(pts: Pt[], L: number, tau: number, nDiamonds: number, rng: Rng): number {
  let acc = 0;
  for (let i = 0; i < nDiamonds; i++) {
    const cx = -L / 2 + (L / 2) * 2 * rng() * 0.5;
    const ct = -L / 2 + (L / 2) * 2 * rng() * 0.5;
    const p: Pt = { t: ct - tau, x: cx };
    const q: Pt = { t: ct + tau, x: cx };
    acc += diamondCount(pts, p, q);
  }
  return acc / nDiamonds;
}
