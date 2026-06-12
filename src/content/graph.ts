import type { GraphEdge, GraphNode } from "./types";

export const NODES: GraphNode[] = [
  // relativity cluster
  { id: "relativity-principle", label: "Relativity principle", module: "relativity", status: "established" },
  { id: "causality", label: "Causality", module: "relativity", status: "established" },
  { id: "invariant-speed", label: "Invariant speed c", module: "relativity", status: "established" },
  { id: "spacetime-interval", label: "Spacetime interval", module: "relativity", status: "established" },
  { id: "time-dilation", label: "Time dilation", module: "relativity", status: "established" },
  { id: "length-contraction", label: "Length contraction", module: "relativity", status: "established" },
  { id: "lorentz-invariance", label: "Lorentz invariance", module: "relativity", status: "established" },
  // curvature cluster
  { id: "equivalence-principle", label: "Equivalence principle", module: "gravity", status: "established" },
  { id: "general-relativity", label: "General relativity", module: "curvature", status: "established" },
  { id: "spacetime-curvature", label: "Spacetime curvature", module: "curvature", status: "established" },
  { id: "geodesics", label: "Geodesics", module: "curvature", status: "established" },
  { id: "newtonian-gravity", label: "Newtonian gravity", module: "curvature", status: "established" },
  { id: "gravitational-time-dilation", label: "Gravitational time dilation", module: "curvature", status: "established" },
  { id: "einstein-equations", label: "Einstein field equations", module: "curvature", status: "established" },
  // quantum cluster
  { id: "quantum-mechanics", label: "Quantum mechanics", module: "quantum", status: "established" },
  { id: "superposition", label: "Superposition", module: "quantum", status: "established" },
  { id: "double-slit", label: "Double slit", module: "slits", status: "established" },
  { id: "path-integral", label: "Path integral", module: "slits", status: "established" },
  { id: "classical-action-paths", label: "Classical least-action paths", module: "slits", status: "established" },
  { id: "wavefunction", label: "Wavefunction", module: "quantum", status: "established" },
  { id: "environment-coupling", label: "Environment coupling", module: "quantum", status: "established" },
  { id: "decoherence", label: "Decoherence", module: "quantum", status: "established" },
  { id: "classical-records", label: "Classical records", module: "information", status: "established" },
  { id: "measurement-problem", label: "Measurement problem", module: "quantum", status: "open-question" },
  { id: "many-worlds", label: "Many-worlds", module: "quantum", status: "interpretation" },
  { id: "born-rule", label: "Born rule", module: "quantum", status: "established" },
  // entanglement cluster
  { id: "entanglement", label: "Entanglement", module: "entanglement", status: "established" },
  { id: "bell-inequalities", label: "Bell inequalities", module: "entanglement", status: "established" },
  { id: "entanglement-entropy", label: "Entanglement entropy", module: "information", status: "established" },
  { id: "wormholes", label: "Wormholes (ER bridges)", module: "entanglement", status: "theoretical-prediction" },
  // black hole cluster
  { id: "black-holes", label: "Black holes", module: "blackhole", status: "established" },
  { id: "event-horizon", label: "Event horizon", module: "blackhole", status: "established" },
  { id: "horizon-area", label: "Horizon area", module: "blackhole", status: "established" },
  { id: "bekenstein-hawking-entropy", label: "Bekenstein–Hawking entropy", module: "blackhole", status: "theoretical-prediction" },
  { id: "hawking-radiation", label: "Hawking radiation", module: "blackhole", status: "theoretical-prediction" },
  { id: "black-hole-information", label: "Black-hole information paradox", module: "blackhole", status: "open-question" },
  { id: "holography", label: "Holographic principle", module: "blackhole", status: "conjecture" },
  // planck cluster
  { id: "planck-length", label: "Planck length", module: "planck", status: "established" },
  { id: "planck-lattice", label: "Regular Planck lattice", module: "planck", status: "conjecture" },
  { id: "causal-sets", label: "Causal sets", module: "planck", status: "conjecture" },
  { id: "string-theory", label: "String theory", module: "planck", status: "conjecture" },
  { id: "loop-quantum-gravity", label: "Loop quantum gravity", module: "planck", status: "conjecture" },
  // information cluster
  { id: "information", label: "Information", module: "information", status: "established" },
  { id: "shannon-entropy", label: "Shannon entropy", module: "information", status: "established" },
  { id: "landauer-principle", label: "Landauer principle", module: "information", status: "established" },
  { id: "bekenstein-bound", label: "Bekenstein bound", module: "information", status: "theoretical-prediction" },
  { id: "physics-as-information", label: "Physics as information (it from bit)", module: "information", status: "conjecture" },
  { id: "quantum-fluctuations", label: "Quantum fluctuations", module: "information", status: "established" },
  { id: "spacetime-geometry", label: "Spacetime geometry", module: "curvature", status: "established" },
  // gravity cluster
  { id: "gravity", label: "Gravity", module: "gravity", status: "established" },
  { id: "quantization", label: "Quantization", module: "gravity", status: "established" },
  { id: "horizon-thermodynamics", label: "Horizon thermodynamics", module: "gravity", status: "theoretical-prediction" },
  { id: "emergent-gravity", label: "Emergent/entropic gravity", module: "gravity", status: "conjecture" },
  { id: "objective-collapse", label: "Objective collapse (Penrose)", module: "gravity", status: "conjecture" },
];

export const EDGES: GraphEdge[] = [
  // ── pinned: relativity-principle + causality →derives→ invariant-speed
  {
    from: "relativity-principle",
    to: "invariant-speed",
    type: "derives",
    status: "established",
    justification:
      "With homogeneity and isotropy, the relativity principle restricts velocity composition to the one-parameter K-family; K>0 yields a frame-invariant speed.",
  },
  {
    from: "causality",
    to: "invariant-speed",
    type: "derives",
    status: "established",
    justification:
      "Causal order between events must be frame-independent; superluminal influence with K>0 kinematics would reverse cause and effect for some observers, selecting the invariant-speed branch as a causal speed limit.",
  },
  // ── pinned: invariant-speed + interval →derives→ time-dilation
  {
    from: "invariant-speed",
    to: "time-dilation",
    type: "derives",
    status: "established",
    justification:
      "An invariant speed forces the interval (ct)²−x² to be the conserved geometric quantity; projecting a moving worldline onto another frame's time axis stretches it by γ.",
  },
  {
    from: "spacetime-interval",
    to: "time-dilation",
    type: "derives",
    status: "established",
    justification:
      "Interval invariance applied to a moving clock's ticks directly yields dτ = dt/γ — time dilation is the Minkowski analogue of a projection, not a mechanical effect.",
  },
  {
    from: "spacetime-interval",
    to: "length-contraction",
    type: "derives",
    status: "established",
    justification:
      "Measuring a rod means intersecting its worldsheet with a simultaneity slice; interval invariance makes moving rods measure shorter by 1/γ.",
  },
  {
    from: "invariant-speed",
    to: "lorentz-invariance",
    type: "derives",
    status: "established",
    justification:
      "The transformations preserving the invariant speed form the Lorentz group; demanding physics respect them is Lorentz invariance, confirmed in every collider and astrophysical test to date.",
  },
  // curvature cluster
  {
    from: "equivalence-principle",
    to: "general-relativity",
    type: "derives",
    status: "established",
    justification:
      "Universality of free fall (mass-independent trajectories, tested to 1e-13) is what permits gravity to be encoded as geometry rather than as a force on objects.",
  },
  {
    from: "general-relativity",
    to: "spacetime-curvature",
    type: "derives",
    status: "established",
    justification:
      "Einstein's equations relate the stress-energy of matter to the curvature of the metric; curvature is the theory's core dynamical variable.",
  },
  {
    from: "spacetime-curvature",
    to: "geodesics",
    type: "derives",
    status: "established",
    justification:
      "Free bodies extremize proper time; in a curved metric those extremal worldlines are geodesics, bending toward regions of slower time at low speed.",
  },
  {
    from: "gravitational-time-dilation",
    to: "newtonian-gravity",
    type: "emerges",
    status: "established",
    justification:
      "Keeping only the g_tt gradient and taking slow motion, geodesic motion reduces exactly to Newton's −GM/r²: everyday gravity is the gradient of time's flow rate.",
  },
  {
    from: "general-relativity",
    to: "gravitational-time-dilation",
    type: "derives",
    status: "established",
    justification:
      "The Schwarzschild solution gives static clocks the rate √(1−rs/r) relative to infinity, confirmed by GPS corrections and atomic-clock tower experiments.",
  },
  {
    from: "general-relativity",
    to: "black-holes",
    type: "derives",
    status: "established",
    justification:
      "Schwarzschild's solution plus gravitational collapse (Oppenheimer–Snyder) predicts horizons; EHT imaging and LIGO mergers confirm objects matching the prediction in detail.",
  },
  // quantum cluster
  {
    from: "double-slit",
    to: "superposition",
    type: "derives",
    status: "established",
    justification:
      "Single-particle interference forces amplitudes over indistinguishable alternatives to add coherently before squaring — superposition is the only consistent reading.",
  },
  {
    from: "superposition",
    to: "path-integral",
    type: "derives",
    status: "established",
    justification:
      "Iterating amplitude-addition over infinitely many slit screens (Feynman's construction, the slits module's escalation) turns superposition over alternatives into a sum over all paths weighted by e^{iS/ħ}.",
  },
  // ── pinned: path-integral →emerges→ classical-action-paths
  {
    from: "path-integral",
    to: "classical-action-paths",
    type: "emerges",
    status: "established",
    justification:
      "By stationary phase, contributions far from the action's extremum cancel when S≫ħ, leaving Newton's least-action trajectory as the surviving bundle — classical mechanics as constructive interference.",
  },
  {
    from: "path-integral",
    to: "wavefunction",
    type: "derives",
    status: "established",
    justification:
      "The kernel built from the path sum propagates ψ exactly as the Schrödinger equation does; the two formulations are mathematically equivalent.",
  },
  {
    from: "quantum-mechanics",
    to: "quantum-fluctuations",
    type: "derives",
    status: "established",
    justification:
      "Noncommuting observables forbid simultaneous sharp values, so even the vacuum carries irreducible fluctuation statistics, measurable in the Casimir and Lamb effects.",
  },
  // ── pinned: superposition + environment →derives→ decoherence
  {
    from: "superposition",
    to: "decoherence",
    type: "derives",
    status: "established",
    justification:
      "A superposed system that entangles with an environment loses local interference as the environment states distinguish the branches; visibility falls multiplicatively per coupled degree of freedom.",
  },
  {
    from: "environment-coupling",
    to: "decoherence",
    type: "derives",
    status: "established",
    justification:
      "Tracing out environmental degrees of freedom that have recorded which-path information suppresses off-diagonal terms of the reduced density matrix exponentially fast.",
  },
  // ── pinned: decoherence →derives→ classical-records
  {
    from: "decoherence",
    to: "classical-records",
    type: "derives",
    status: "established",
    justification:
      "Decoherence redundantly imprints the pointer state into many environmental fragments (quantum Darwinism); those stable, copyable correlations are precisely what classical records are.",
  },
  {
    from: "decoherence",
    to: "measurement-problem",
    type: "constrains",
    status: "established",
    justification:
      "Decoherence explains the absence of macroscopic interference and selects pointer bases, but does not by itself produce a single outcome — it sharpens rather than solves the measurement problem.",
  },
  {
    from: "measurement-problem",
    to: "many-worlds",
    type: "constrains",
    status: "interpretation",
    justification:
      "Many-worlds answers the single-outcome question by denying it: all branches persist and observers find themselves in one; the cost is deriving the Born rule from branch structure.",
  },
  {
    from: "many-worlds",
    to: "born-rule",
    type: "tension",
    status: "interpretation",
    justification:
      "If all branches occur, squared-amplitude probabilities must be derived rather than postulated; whether decision-theoretic or envariance derivations succeed is actively contested.",
  },
  // entanglement cluster
  {
    from: "superposition",
    to: "entanglement",
    type: "derives",
    status: "established",
    justification:
      "Superposition applied to composite systems yields states that cannot factor into parts; entanglement is multi-system superposition, produced by any interaction that correlates subsystems.",
  },
  {
    from: "entanglement",
    to: "bell-inequalities",
    type: "derives",
    status: "established",
    justification:
      "Singlet correlations E=−cosθ violate the CHSH bound of 2 reaching 2√2, ruling out local hidden variables — confirmed loophole-free in 2015-era experiments.",
  },
  {
    from: "entanglement",
    to: "entanglement-entropy",
    type: "derives",
    status: "established",
    justification:
      "Entangling two systems makes each reduced state mixed; the entropy of either part quantifies in bits the information created by the correlation itself.",
  },
  // ── pinned: entanglement ↔ wormholes (ER=EPR, conjecture)
  {
    from: "entanglement",
    to: "wormholes",
    type: "conjecture",
    status: "conjecture",
    justification:
      "ER=EPR (Maldacena–Susskind 2013): maximally entangled black-hole pairs are conjectured to be identical to non-traversable Einstein–Rosen bridges, with support from AdS/CFT toy models only.",
  },
  // black-hole cluster
  {
    from: "black-holes",
    to: "event-horizon",
    type: "derives",
    status: "established",
    justification:
      "The Schwarzschild geometry has a null surface at r=2GM/c² from inside which no causal path exits; the horizon defines the black hole.",
  },
  {
    from: "event-horizon",
    to: "horizon-area",
    type: "derives",
    status: "established",
    justification:
      "Hawking's classical area theorem: in any classical process the total horizon area is non-decreasing, behaving exactly like an entropy — the formal seed of black-hole thermodynamics.",
  },
  // ── pinned: horizon-area →derives→ bekenstein-hawking-entropy →conjecture→ holography
  {
    from: "horizon-area",
    to: "bekenstein-hawking-entropy",
    type: "derives",
    status: "theoretical-prediction",
    justification:
      "Bekenstein's thought experiments plus Hawking's temperature calculation fix S = k_B·A/(4 l_p²): a quarter of the horizon area in Planck units, entropy scaling with area rather than volume.",
  },
  {
    from: "bekenstein-hawking-entropy",
    to: "holography",
    type: "conjecture",
    status: "conjecture",
    justification:
      "If the maximal entropy of a region scales with its boundary area, the interior's physics may be fully encoded on the boundary ('t Hooft–Susskind); proven only in AdS/CFT model universes.",
  },
  {
    from: "quantum-mechanics",
    to: "hawking-radiation",
    type: "derives",
    status: "theoretical-prediction",
    justification:
      "Quantum field theory on the curved background near a horizon yields thermal emission at T=ħc³/(8πGMk); the calculation uses only tested ingredients but the radiation itself is unobserved.",
  },
  {
    from: "hawking-radiation",
    to: "black-hole-information",
    type: "tension",
    status: "open-question",
    justification:
      "Exactly thermal radiation from a completely evaporating hole would destroy the infallen state's information, contradicting unitary quantum evolution — the sharpest standing QM/GR contradiction.",
  },
  // ── pinned: GR + QM →tension→ black-hole-information
  {
    from: "general-relativity",
    to: "black-hole-information",
    type: "tension",
    status: "open-question",
    justification:
      "GR insists the horizon is locally unremarkable and the interior real; combined with unitarity this generates the paradox — at least one of the two theories' assumptions must fail at the horizon.",
  },
  {
    from: "quantum-mechanics",
    to: "black-hole-information",
    type: "tension",
    status: "open-question",
    justification:
      "Unitarity forbids information destruction, so quantum mechanics demands the Hawking flux carry the infallen information out — against the semiclassical picture of a featureless horizon.",
  },
  {
    from: "black-holes",
    to: "quantum-mechanics",
    type: "constrains",
    status: "established",
    justification:
      "Black holes are the one laboratory where quantum theory and strong-field gravity must both apply at full strength; any quantum gravity must reproduce their thermodynamics.",
  },
  // planck cluster
  // ── pinned: planck-lattice →tension→ lorentz-invariance
  {
    from: "planck-lattice",
    to: "lorentz-invariance",
    type: "tension",
    status: "established",
    justification:
      "A regular grid defines a rest frame and preferred axes: boosting it changes nearest-neighbor statistics (demonstrated live in the discreteness module), so grid-like discreteness conflicts with observed boost symmetry.",
  },
  {
    from: "causal-sets",
    to: "lorentz-invariance",
    type: "constrains",
    status: "conjecture",
    justification:
      "Poisson sprinkling makes discreteness statistical: causal-diamond counts depend only on invariant volume, so no boost is detectable — discreteness without a preferred frame.",
  },
  {
    from: "planck-length",
    to: "planck-lattice",
    type: "constrains",
    status: "established",
    justification:
      "The Planck length sets the scale where quantum gravity effects must enter, motivating pixel models — but it licenses a scale, not a grid; the lattice reading adds structure the symmetry forbids.",
  },
  {
    from: "string-theory",
    to: "holography",
    type: "derives",
    status: "conjecture",
    justification:
      "AdS/CFT arose inside string theory and realizes holography exactly there: a gravitational bulk dual to a boundary gauge theory, the strongest evidence the holographic principle can be consistent.",
  },
  {
    from: "loop-quantum-gravity",
    to: "planck-length",
    type: "derives",
    status: "conjecture",
    justification:
      "LQG's area and volume operators have discrete spectra in Planck units, deriving granularity from quantization rather than assuming a background grid.",
  },
  // information cluster
  {
    from: "shannon-entropy",
    to: "information",
    type: "derives",
    status: "established",
    justification:
      "Shannon's theorem identifies −Σp·log p as the unique measure (up to units) of distinguishability satisfying natural axioms; it grounds 'information' as a physical quantity.",
  },
  {
    from: "landauer-principle",
    to: "information",
    type: "constrains",
    status: "established",
    justification:
      "Erasing one bit dissipates at least kT·ln2, experimentally verified — information processing is physically costed, tying bits to joules and entropy.",
  },
  {
    from: "entanglement-entropy",
    to: "information",
    type: "derives",
    status: "established",
    justification:
      "Entanglement entropy is information created by correlation: a Bell pair's parts each carry exactly one bit of entropy that neither carried before entangling.",
  },
  {
    from: "quantum-fluctuations",
    to: "information",
    type: "conjecture",
    status: "conjecture",
    justification:
      "Bruce's distinctions-from-fluctuations hypothesis: random quantum fluctuations supply raw distinguishability, which observation and entanglement stabilize into facts — suggestive but lacking a derivation of physical law from it.",
  },
  // ── pinned: information →conjecture→ physics-as-information
  {
    from: "information",
    to: "physics-as-information",
    type: "conjecture",
    status: "conjecture",
    justification:
      "Wheeler's it-from-bit and the modern it-from-qubit program propose every physical 'it' derives from informational distinctions; holographic toy models supply structure but no proof for our universe.",
  },
  // ── pinned: entanglement-entropy →conjecture→ spacetime-geometry
  {
    from: "entanglement-entropy",
    to: "spacetime-geometry",
    type: "conjecture",
    status: "conjecture",
    justification:
      "Ryu–Takayanagi equates boundary entanglement entropy with bulk minimal areas, and Van Raamsdonk's argument shows cutting entanglement disconnects spacetime — geometry plausibly woven from entanglement in holographic models.",
  },
  {
    from: "bekenstein-bound",
    to: "physics-as-information",
    type: "constrains",
    status: "theoretical-prediction",
    justification:
      "The maximal information of a region scaling with boundary area is the single most information-theoretic fact known about gravity, anchoring informational reconstructions of physics.",
  },
  {
    from: "horizon-area",
    to: "bekenstein-bound",
    type: "derives",
    status: "theoretical-prediction",
    justification:
      "A black hole saturates the bound: A/(4 l_p² ln2) bits is the most information any region of that boundary area can hold, since adding more collapses it into a larger hole.",
  },
  // gravity cluster
  {
    from: "equivalence-principle",
    to: "gravity",
    type: "derives",
    status: "established",
    justification:
      "Mass-independent free fall is gravity's defining signature, verified to 1e-13; it distinguishes gravity from every screenable force and licenses its geometric description.",
  },
  // ── pinned: gravity →tension→ quantization
  {
    from: "gravity",
    to: "quantization",
    type: "tension",
    status: "established",
    justification:
      "Perturbatively quantized general relativity is nonrenormalizable — G's dimensions generate uncontrollable infinities — so the recipe that worked for the other three forces fails for gravity.",
  },
  // ── pinned: horizon-thermodynamics →conjecture→ einstein-equations
  {
    from: "horizon-thermodynamics",
    to: "einstein-equations",
    type: "conjecture",
    status: "conjecture",
    justification:
      "Jacobson 1995: demanding δQ=TdS with area-entropy across all local Rindler horizons yields Einstein's equations as an equation of state — gravity possibly thermodynamic/emergent rather than fundamental.",
  },
  {
    from: "horizon-thermodynamics",
    to: "emergent-gravity",
    type: "conjecture",
    status: "conjecture",
    justification:
      "If Einstein's equations are an equation of state, gravity may be entropic (Verlinde): a statistical pull toward higher-entropy configurations rather than a fundamental interaction.",
  },
  {
    from: "emergent-gravity",
    to: "gravity",
    type: "tension",
    status: "conjecture",
    justification:
      "The emergent reading directly opposes gravity-as-fundamental: one of the two pictures must give, and current evidence cannot adjudicate between them.",
  },
  {
    from: "gravity",
    to: "objective-collapse",
    type: "conjecture",
    status: "conjecture",
    justification:
      "Penrose–Diósi propose superposed mass distributions are superposed geometries that nature resolves in time ~ħ/E_G — gravity conjecturally entering the measurement problem; experiments now pressure the simplest versions.",
  },
  {
    from: "objective-collapse",
    to: "measurement-problem",
    type: "conjecture",
    status: "conjecture",
    justification:
      "If gravitational collapse were real, the measurement problem would have a dynamical solution with testable deviations from unitarity at mesoscopic mass scales.",
  },
  {
    from: "gravity",
    to: "black-hole-information",
    type: "constrains",
    status: "established",
    justification:
      "Gravity supplies the horizon that creates the paradox and the area law that bounds its information content; the paradox is unformulable without it.",
  },
  {
    from: "gravity",
    to: "bekenstein-bound",
    type: "derives",
    status: "theoretical-prediction",
    justification:
      "It is gravity that enforces the storage limit: packing more information into a region than its boundary allows collapses it into a black hole.",
  },
  {
    from: "einstein-equations",
    to: "general-relativity",
    type: "derives",
    status: "established",
    justification:
      "The field equations are general relativity's dynamical content, fixing how matter curves spacetime and how curvature moves matter.",
  },
  {
    from: "wavefunction",
    to: "quantum-mechanics",
    type: "derives",
    status: "established",
    justification:
      "Unitary state evolution plus the Born rule constitute the quantum formalism's predictive core, unbeaten across every domain tested.",
  },
];
