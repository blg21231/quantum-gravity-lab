// Information core: Shannon entropy, two-qubit entanglement entropy, and the
// decoherence record-creation model (system–environment mutual information). Pure module.

/** Shannon entropy in bits of a (will-be-normalized) distribution. */
export function shannonEntropy(p: number[]): number {
  const tot = p.reduce((a, b) => a + b, 0);
  let H = 0;
  for (const v of p) {
    if (v <= 0) continue;
    const q = v / tot;
    H -= q * Math.log2(q);
  }
  return H;
}

/** Binary entropy h(p) in bits. */
export function binaryEntropy(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
}

/**
 * Entanglement entropy of |ψ(θ)⟩ = cosθ|00⟩ + sinθ|11⟩: the reduced state of either
 * qubit has eigenvalues {cos²θ, sin²θ} → S = h(cos²θ) bits.
 * Computed the honest way: build ρ_A by partial trace, then diagonalize.
 */
export function entanglementEntropy(theta: number): number {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  // |ψ⟩ amplitudes in basis |00⟩,|01⟩,|10⟩,|11⟩
  const amp = [c, 0, 0, s];
  // ρ_A[i][j] = Σ_k ψ[i,k] ψ*[j,k]  (partial trace over qubit B)
  const psi = (i: number, k: number) => amp[i * 2 + k];
  const rho: number[][] = [
    [0, 0],
    [0, 0],
  ];
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) rho[i][j] += psi(i, k) * psi(j, k);
  // 2×2 symmetric eigenvalues
  const tr = rho[0][0] + rho[1][1];
  const det = rho[0][0] * rho[1][1] - rho[0][1] * rho[1][0];
  const disc = Math.sqrt(Math.max(0, tr * tr - 4 * det));
  const l1 = (tr + disc) / 2;
  const l2 = (tr - disc) / 2;
  let S = 0;
  for (const l of [l1, l2]) if (l > 1e-15) S -= l * Math.log2(l);
  return S;
}

/** Analytic check value: S(θ) = h(cos²θ). */
export function entanglementEntropyAnalytic(theta: number): number {
  return binaryEntropy(Math.cos(theta) ** 2);
}

/**
 * Decoherence as record creation. System qubit starts in |+⟩; each of nEnv environment
 * qubits becomes correlated with the system's pointer basis with coupling angle g
 * (⟨e0|e1⟩ = cos g per qubit). The joint state stays pure, so:
 *   coherence (fringe visibility) = |⟨E0|E1⟩| = cos^nEnv(g)
 *   S(ρ_S) = h((1 + visibility)/2)? — no: ρ_S eigenvalues are (1 ± |⟨E0|E1⟩|)/2.
 *   Mutual information I(S:E) = S(ρ_S) + S(ρ_E) − S(ρ_SE) = 2·S(ρ_S) for a pure joint state.
 */
export function decoherenceRecord(g: number, nEnv: number): {
  visibility: number;
  systemEntropy: number;
  mutualInformation: number;
} {
  const vis = Math.abs(Math.cos(g)) ** nEnv;
  const S = binaryEntropy((1 + vis) / 2);
  return { visibility: vis, systemEntropy: S, mutualInformation: 2 * S };
}
