// Slits-all-the-way-down: Huygens slit sums → layered propagator → the Feynman path
// integral, plus stationary phase. ħ = 1. Pure module — no DOM/WebGL.

export interface Complex {
  re: number;
  im: number;
}

const cmul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});

/**
 * Fraunhofer N-slit intensity (normalized to 1 at θ=0):
 * I(θ) = [sin(Nφ/2)/(N sin(φ/2))]² · sinc²(πa sinθ/λ), φ = 2πd sinθ/λ.
 */
export function nSlitAnalytic(theta: number, nSlits: number, d: number, a: number, lambda: number): number {
  const sinT = Math.sin(theta);
  const phi = (2 * Math.PI * d * sinT) / lambda;
  const alpha = (Math.PI * a * sinT) / lambda;
  const grating =
    Math.abs(phi) < 1e-12 ? 1 : Math.sin((nSlits * phi) / 2) / (nSlits * Math.sin(phi / 2));
  const envelope = Math.abs(alpha) < 1e-12 ? 1 : Math.sin(alpha) / alpha;
  return grating * grating * envelope * envelope;
}

/**
 * Numeric Huygens sum: each slit is sampled with `samplesPerSlit` point sources,
 * phasors e^{ikr} summed at each screen position. Far-field geometry.
 */
export function slitPattern(
  screenY: Float64Array,
  nSlits: number,
  d: number,
  a: number,
  lambda: number,
  Ldist: number,
  samplesPerSlit = 64,
): Float64Array {
  const k = (2 * Math.PI) / lambda;
  const out = new Float64Array(screenY.length);
  const centers: number[] = [];
  for (let i = 0; i < nSlits; i++) centers.push((i - (nSlits - 1) / 2) * d);
  for (let j = 0; j < screenY.length; j++) {
    let re = 0;
    let im = 0;
    for (const c of centers) {
      for (let q = 0; q < samplesPerSlit; q++) {
        const y = c - a / 2 + (a * (q + 0.5)) / samplesPerSlit;
        const r = Math.sqrt(Ldist * Ldist + (screenY[j] - y) * (screenY[j] - y));
        re += Math.cos(k * r);
        im += Math.sin(k * r);
      }
    }
    out[j] = re * re + im * im;
  }
  // normalize peak to 1
  let max = 0;
  for (const v of out) max = Math.max(max, v);
  if (max > 0) for (let j = 0; j < out.length; j++) out[j] /= max;
  return out;
}

/**
 * Fringe spacing measured from the numeric pattern: principal maxima found with a
 * windowed prominence test (immune to sampling micro-ripple), mean peak-to-peak.
 */
export function measureFringeSpacing(screenY: Float64Array, I: Float64Array, win = 8): number {
  const peaks: number[] = [];
  for (let i = win; i < I.length - win; i++) {
    if (I[i] < 0.3) continue;
    let isMax = true;
    for (let j = i - win; j <= i + win; j++) {
      if (j === i) continue;
      // ties (flat-topped maxima straddling the grid) break toward the lower index
      if (I[j] > I[i] || (I[j] === I[i] && j < i)) {
        isMax = false;
        break;
      }
    }
    if (isMax) peaks.push(screenY[i]);
  }
  if (peaks.length < 2) return NaN;
  const gaps: number[] = [];
  for (let i = 1; i < peaks.length; i++) gaps.push(peaks[i] - peaks[i - 1]);
  return gaps.reduce((x, y) => x + y, 0) / gaps.length;
}

/** Analytic free-particle propagator K(xf, xi; T), mass m, ħ=1 (up to global phase/norm conventions kept consistent below). */
export function freePropagator(xf: number, xi: number, T: number, m: number): Complex {
  const pref = Math.sqrt(m / (2 * Math.PI * T)); // |K|; phase carried separately
  const phase = (m * (xf - xi) * (xf - xi)) / (2 * T) - Math.PI / 4;
  return { re: pref * Math.cos(phase), im: pref * Math.sin(phase) };
}

/**
 * Analytic free evolution of a Gaussian packet ψ0 ∝ exp(−x²/4σ0²) (ħ=1):
 * ψ(x,t) = (2πσ0²)^{−1/4} · (1+iβ)^{−1/2} · exp(−x²/(4σ0²(1+iβ))), β = t/(2mσ0²).
 */
export function freeGaussianEvolved(x: number, t: number, m: number, sigma0: number): Complex {
  const beta = t / (2 * m * sigma0 * sigma0);
  const norm = Math.pow(2 * Math.PI * sigma0 * sigma0, -0.25);
  // (1+iβ)^{−1/2}
  const r = Math.hypot(1, beta);
  const ang = Math.atan2(beta, 1);
  const sRe = Math.cos(-ang / 2) / Math.sqrt(r);
  const sIm = Math.sin(-ang / 2) / Math.sqrt(r);
  // exp(−x²/(4σ0²(1+iβ))) = exp(−x²(1−iβ)/(4σ0²(1+β²)))
  const denom = 4 * sigma0 * sigma0 * (1 + beta * beta);
  const eRe = Math.exp((-x * x) / denom);
  const ePhase = (x * x * beta) / denom;
  const expRe = eRe * Math.cos(ePhase);
  const expIm = eRe * Math.sin(ePhase);
  return cmul({ re: norm * sRe, im: norm * sIm }, { re: expRe, im: expIm });
}

/**
 * Evolve an initial wavefunction by repeated application of the one-step slit-sum
 * kernel (the layered-slits construction acting on a state).
 */
export function layeredEvolve(
  psi0: (x: number) => Complex,
  T: number,
  m: number,
  layers: number,
  nx: number,
  X: number,
): { x: Float64Array; re: Float64Array; im: Float64Array } {
  const dx = (2 * X) / (nx - 1);
  const x = new Float64Array(nx);
  let re = new Float64Array(nx);
  let im = new Float64Array(nx);
  for (let i = 0; i < nx; i++) {
    x[i] = -X + i * dx;
    const p = psi0(x[i]);
    re[i] = p.re;
    im[i] = p.im;
  }
  const eps = T / layers;
  const pref = Math.sqrt(m / (2 * Math.PI * eps));
  for (let l = 0; l < layers; l++) {
    const nre = new Float64Array(nx);
    const nim = new Float64Array(nx);
    for (let i = 0; i < nx; i++) {
      let aRe = 0;
      let aIm = 0;
      for (let j = 0; j < nx; j++) {
        const phase = (m * (x[i] - x[j]) * (x[i] - x[j])) / (2 * eps) - Math.PI / 4;
        const kRe = pref * Math.cos(phase);
        const kIm = pref * Math.sin(phase);
        aRe += kRe * re[j] - kIm * im[j];
        aIm += kRe * im[j] + kIm * re[j];
      }
      nre[i] = aRe * dx;
      nim[i] = aIm * dx;
    }
    re = nre;
    im = nim;
  }
  return { x, re, im };
}

/**
 * Normalized RMS error of the layered slit-sum evolution of a Gaussian packet vs the
 * analytic free propagator result, over the central region |x| ≤ 6.
 */
export function layeredPropagatorError(layers: number, nx: number): number {
  const m = 1;
  const T = 1;
  const X = 14;
  const sigma0 = 1.5;
  const norm = Math.pow(2 * Math.PI * sigma0 * sigma0, -0.25);
  const psi0 = (x: number): Complex => ({ re: norm * Math.exp((-x * x) / (4 * sigma0 * sigma0)), im: 0 });
  const { x, re, im } = layeredEvolve(psi0, T, m, layers, nx, X);
  let num = 0;
  let den = 0;
  for (let i = 0; i < x.length; i++) {
    if (Math.abs(x[i]) > 6) continue;
    const a = freeGaussianEvolved(x[i], T, m, sigma0);
    const dr = re[i] - a.re;
    const di = im[i] - a.im;
    num += dr * dr + di * di;
    den += a.re * a.re + a.im * a.im;
  }
  return Math.sqrt(num / den);
}

/**
 * Stationary phase: one-kink path family x(t) bends by offset `c` at T/2 between fixed
 * endpoints. Action S(c) = S_classical + m·c²/ (T/2)  (free particle). Sum phasors
 * e^{i·scale·S(c)} over offsets; return the smallest tube half-width containing 90% of
 * the |partial-sum| of the total.
 */
export function stationaryPhaseTubeWidth(scale: number, cMax = 6): number {
  const m = 1;
  const T = 1;
  // S(c) − S_cl = 4m c²/T for a symmetric one-kink path (two legs each of length T/2)
  const dS = (c: number) => ((4 * m) / T) * c * c;
  // Sampling must resolve the fastest phase: dφ/dc = scale·8c ≤ scale·8·cMax;
  // keep ≤0.25 rad per sample.
  const nc = Math.max(8001, 2 * Math.ceil((scale * 8 * cMax * cMax) / 0.25) + 1);
  const dc = (2 * cMax) / (nc - 1);
  // cumulative phasor sums ordered by |c| ascending (prefix sums)
  const half = (nc - 1) / 2;
  let re = 1; // c = 0 term (phase 0)
  let im = 0;
  const totsRe: number[] = [re];
  const totsIm: number[] = [im];
  for (let k = 1; k <= half; k++) {
    const c = k * dc;
    const ph = scale * dS(c);
    re += 2 * Math.cos(ph); // ±c contribute equally (dS is even)
    im += 2 * Math.sin(ph);
    totsRe.push(re);
    totsIm.push(im);
  }
  const totMag = Math.hypot(re, im);
  for (let k = 0; k <= half; k++) {
    if (Math.hypot(totsRe[k], totsIm[k]) >= 0.9 * totMag) return Math.max(k, 1) * dc;
  }
  return cMax;
}

/** Per-path phasor arrows for the visual: returns {c, phase} pairs for the kink family. */
export function phasorArrows(scale: number, cMax = 3, nc = 81): { c: number; phase: number }[] {
  const out: { c: number; phase: number }[] = [];
  for (let i = 0; i < nc; i++) {
    const c = -cMax + (2 * cMax * i) / (nc - 1);
    out.push({ c, phase: scale * 4 * c * c });
  }
  return out;
}

export { cmul };
