// Special relativity core. Units: c = 1 unless stated. Pure module — no DOM/WebGL.

export const C_SI = 299_792_458; // m/s

export interface Event2 {
  t: number;
  x: number;
}

export function gamma(v: number): number {
  return 1 / Math.sqrt(1 - v * v);
}

/** Lorentz boost of an event by frame velocity v (c=1). */
export function boost(e: Event2, v: number): Event2 {
  const g = gamma(v);
  return { t: g * (e.t - v * e.x), x: g * (e.x - v * e.t) };
}

/** Invariant interval s² = t² − x² (signature +−). */
export function interval2(e: Event2): number {
  return e.t * e.t - e.x * e.x;
}

/**
 * The one-parameter family of velocity-composition laws consistent with the
 * relativity principle + homogeneity + isotropy:  u ⊕ v = (u + v) / (1 + K·u·v).
 * K = 0 → Galilean addition; K = 1/c² → Einstein addition (with c=1, K=1).
 */
export function composeK(u: number, v: number, K: number): number {
  return (u + v) / (1 + K * u * v);
}

/** Relativistic velocity addition (c=1). */
export function composeRel(u: number, v: number): number {
  return composeK(u, v, 1);
}

/** Proper-time dilation factor for a clock moving at v: dτ/dt = 1/γ. */
export function timeDilationFactor(v: number): number {
  return 1 / gamma(v);
}

/** Length contraction factor: L = L0/γ. */
export function lengthContractionFactor(v: number): number {
  return 1 / gamma(v);
}
