// Bell/CHSH statistics: quantum singlet vs a local-hidden-variable model. Pure module.

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sample spin-1/2 singlet measurement outcomes at detector angles a, b.
 * Quantum mechanics: P(A = B) = (1 − cos θ_ab)/2 → E[AB] = −cos θ_ab.
 */
export function sampleSingletCorrelation(a: number, b: number, n: number, rng: Rng): number {
  const pSame = (1 - Math.cos(a - b)) / 2;
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const A = rng() < 0.5 ? 1 : -1;
    const same = rng() < pSame;
    const B = same ? A : -A;
    acc += A * B;
  }
  return acc / n;
}

/** Analytic singlet correlation. */
export function singletCorrelationAnalytic(a: number, b: number): number {
  return -Math.cos(a - b);
}

/**
 * A local-hidden-variable model: shared λ uniform on the circle;
 * A = sign(cos(λ − a)), B = −sign(cos(λ − b)). Same estimator harness as the quantum arm.
 */
export function sampleLHVCorrelation(a: number, b: number, n: number, rng: Rng): number {
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const lambda = rng() * 2 * Math.PI;
    const A = Math.cos(lambda - a) >= 0 ? 1 : -1;
    const B = Math.cos(lambda - b) >= 0 ? -1 : 1;
    acc += A * B;
  }
  return acc / n;
}

export type CorrelationSampler = (a: number, b: number, n: number, rng: Rng) => number;

/** CHSH S = |E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′)| at the given angles. */
export function chsh(
  sampler: CorrelationSampler,
  n: number,
  rng: Rng,
  angles: { a: number; a2: number; b: number; b2: number },
): number {
  const E = (x: number, y: number) => sampler(x, y, n, rng);
  return Math.abs(E(angles.a, angles.b) - E(angles.a, angles.b2) + E(angles.a2, angles.b) + E(angles.a2, angles.b2));
}

/** The CHSH-optimal angle set (Tsirelson saturating): a=0, a′=π/2, b=π/4, b′=3π/4. */
export const CHSH_OPTIMAL = { a: 0, a2: Math.PI / 2, b: Math.PI / 4, b2: (3 * Math.PI) / 4 };

export const TSIRELSON = 2 * Math.SQRT2;
