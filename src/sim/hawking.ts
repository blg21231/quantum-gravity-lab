// Black-hole thermodynamics: Hawking temperature, Bekenstein–Hawking entropy,
// evaporation lifetime, Bekenstein/holographic information bound. SI units. Pure module.

export const G = 6.6743e-11; // m³ kg⁻¹ s⁻²
export const C = 299_792_458; // m/s
export const HBAR = 1.054571817e-34; // J·s
export const KB = 1.380649e-23; // J/K
export const M_SUN = 1.98892e30; // kg

export const PLANCK_LENGTH = Math.sqrt((HBAR * G) / (C * C * C)); // ≈1.616e-35 m

export function schwarzschildRadius(M: number): number {
  return (2 * G * M) / (C * C);
}

export function horizonArea(M: number): number {
  const rs = schwarzschildRadius(M);
  return 4 * Math.PI * rs * rs;
}

/** Hawking temperature T_H = ħc³ / (8πGMk_B). */
export function hawkingTemperature(M: number): number {
  return (HBAR * C * C * C) / (8 * Math.PI * G * M * KB);
}

/** Bekenstein–Hawking entropy S = k_B·A / (4 l_p²); returned in units of k_B. */
export function bhEntropyOverKb(M: number): number {
  return horizonArea(M) / (4 * PLANCK_LENGTH * PLANCK_LENGTH);
}

/** Horizon information content in bits: S/(k_B ln 2) = A/(4 l_p² ln 2). */
export function horizonBits(M: number): number {
  return bhEntropyOverKb(M) / Math.LN2;
}

/** Evaporation lifetime t = 5120 π G² M³ / (ħ c⁴) (photon-only Page estimate). */
export function evaporationLifetime(M: number): number {
  return (5120 * Math.PI * G * G * M * M * M) / (HBAR * C * C * C * C);
}

/** Landauer limit: minimum energy to erase one bit at temperature T. */
export function landauerLimit(T: number): number {
  return KB * T * Math.LN2;
}

export interface BHPreset {
  id: string;
  label: string;
  massKg: number;
}

export const BH_PRESETS: BHPreset[] = [
  { id: "primordial", label: "Primordial (10¹² kg)", massKg: 1e12 },
  { id: "solar", label: "Solar mass", massKg: M_SUN },
  { id: "sgrA", label: "Sgr A* (4.15×10⁶ M☉)", massKg: 4.15e6 * M_SUN },
];
