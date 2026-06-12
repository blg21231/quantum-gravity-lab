import type { Panel } from "./types";

// Every claim in the app carries exactly one epistemic tag. Conjecture/interpretation/
// open-question panels must never use established-voice wording (linted).

export const PANELS: Panel[] = [
  // ── relativity ────────────────────────────────────────────────────────────
  {
    id: "rel-derivation",
    module: "relativity",
    tag: "established",
    title: "Why an invariant speed is forced",
    body: `Start from almost nothing: the laws of physics look the same in every inertial frame (the relativity principle), space and time are homogeneous, space is isotropic, and causes precede effects. Working out every velocity-composition law consistent with those assumptions leaves a one-parameter family: u ⊕ v = (u + v)/(1 + K·u·v). Exactly two kinds of universe survive. K = 0 is Galileo's — velocities just add, and there is no speed limit. K > 0 is Lorentz's — there is one invariant speed 1/√K that every observer measures identically, and composing any two slower velocities never reaches it. The knob below is K itself: slide it and watch Galileo deform continuously into Einstein. Experiment (Michelson–Morley and a century of successors) picks K > 0, with the invariant speed equal to light's. So "why is there an absolute speed?" has a sharp answer: symmetry plus causality permit only two kinematics, and we live in the one with the invariant speed. Light is not special — c is a property of spacetime's causal structure; light merely moves at it because photons are massless.`,
  },
  {
    id: "rel-geometry",
    module: "relativity",
    tag: "established",
    title: "Time dilation and length contraction are geometry",
    body: `The invariant interval s² = (ct)² − x² plays the role Pythagoras plays in space. Boosting to a moving frame tilts worldlines and simultaneity slices, but every light cone stays exactly where it was — slope ±c. Time dilation (moving clocks tick slow, by 1/γ) and length contraction (moving rods shorten, by 1/γ) are not mechanical effects; they are projections of the same 4D object onto different observers' axes, forced by interval invariance.`,
  },
  {
    id: "rel-minlength",
    module: "relativity",
    tag: "open-question",
    title: "Could a minimum length play the axiomatic role instead?",
    body: `Bruce's instinct: if there is an absolute minimum length, maybe the absolute speed could be derived from it. Here is the tension to explore: a naive invariant minimum length contradicts the boosts we just derived — lengths contract, so a "shortest possible rod" in one frame would be shorter still in another. Whether nature evades this (by deforming the Lorentz transformations near the Planck scale, as in doubly-special-relativity proposals, or by making discreteness statistical rather than grid-like, as causal sets do) remains unsettled. The discreteness module takes this question head-on.`,
  },

  // ── curvature ─────────────────────────────────────────────────────────────
  {
    id: "curv-rubbersheet",
    module: "curvature",
    tag: "established",
    title: "Retiring the rubber sheet",
    body: `The bowling-ball-on-a-trampoline picture has two real defects. First, it is circular: the ball dents the sheet because Earth's gravity pulls it down — it explains gravity using gravity. Second, it shows only the curvature of space, but for slow-moving objects (you, planets, baseballs) spatial curvature is almost irrelevant. What actually moves the apple is the curvature of time: clocks deeper in the well tick slower, and a body following its longest-proper-time path bends toward where time runs slow. Gravity, at everyday speeds, is a gradient in the flow of time.`,
  },
  {
    id: "curv-timecurvature",
    module: "curvature",
    tag: "established",
    title: "Newton emerges from time curvature",
    body: `Keep only the time-time piece of the Schwarzschild metric and let a slow object follow its geodesic: you recover Newton's −GM/r² exactly — the engine behind this scene demonstrates the match to within 5%. Light, moving at c, samples space and time curvature equally, which is why its deflection is exactly twice the naive Newtonian value: the famous 1.75 arcseconds at the Sun's limb that made Einstein a celebrity in 1919. The factor of two is the fingerprint that spacetime — not just time — is curved.`,
  },
  {
    id: "curv-orbits",
    module: "curvature",
    tag: "established",
    title: "Orbits in Schwarzschild geometry",
    body: `Near a compact mass the orbits stop being Kepler's closed ellipses: perihelia precess by 6πGM/(c²a(1−e²)) per orbit (Mercury's stubborn 43″/century was the first evidence), circular photon orbits exist at r = 1.5 r_s, and no stable circular orbit survives inside the ISCO at r = 3 r_s. Every trajectory drawn here is integrated live from the geodesic equation — the same engine the test suite benchmarks against those analytic values.`,
  },

  // ── slits ─────────────────────────────────────────────────────────────────
  {
    id: "slits-doubleslit",
    module: "slits",
    tag: "established",
    title: "What the double slit forces on us",
    body: `Send particles one at a time at two slits and an interference pattern still builds up, dot by dot. Each particle's behavior depends on both slits being open — yet any attempt to learn which slit it took erases the fringes. The unavoidable lesson: what propagates is a complex amplitude, and amplitudes for indistinguishable alternatives add before being squared into probabilities. Everything quantum follows from taking that seriously.`,
  },
  {
    id: "slits-pathintegral",
    module: "slits",
    tag: "established",
    title: "Slits all the way down: the path integral",
    body: `Now run Feynman's escalation — the one Bruce reconstructed from memory. Add a third slit, a fourth, a fifth. Then add a second screen full of slits, a third, a fourth. In the limit of infinitely many screens each with infinitely many slits, the screens are gone: empty space itself is the limiting case, and the amplitude to go from A to B becomes a sum over every possible path, each contributing e^{iS/ħ} weighted by its action. This is the path-integral formulation of quantum mechanics — mathematically equivalent to Schrödinger's equation and verified wherever quantum mechanics is. The interactive below computes these sums for real: refine the slit screens and watch the discrete construction converge to the exact free propagator.`,
  },
  {
    id: "slits-stationary",
    module: "slits",
    tag: "established",
    title: "Where the classical world comes from",
    body: `Why don't baseballs diffract? Crank up the action relative to ħ and watch the phasor arrows: paths far from the classical one spin so fast they cancel in pairs, while paths near the action's stationary point — Newton's path — add coherently. The classical principle of least action is not an extra law; it is what survives of the sum over all paths when S ≫ ħ. Classical mechanics emerges from quantum mechanics by interference.`,
  },

  // ── quantum ───────────────────────────────────────────────────────────────
  {
    id: "q-wavefunction",
    module: "quantum",
    tag: "established",
    title: "The wavefunction, evolving",
    body: `Between measurements, the quantum state evolves deterministically under the Schrödinger equation — spreading, tunneling through barriers it classically could not cross, interfering with itself. The simulation here is a split-step spectral integrator: norm conserved to one part in a million over a thousand steps, packet dispersion matching the analytic σ(t) curve to 1%, tunneling probabilities matching the textbook barrier formula.`,
  },
  {
    id: "q-decoherence",
    module: "quantum",
    tag: "established",
    title: "Decoherence: how interference dies",
    body: `Couple the system to an environment — stray photons, air molecules, anything that learns which path was taken — and the fringes fade. Each environmental degree of freedom that becomes correlated with the path multiplies the interference visibility by a factor below one; a handful of them and coherence is gone for all practical purposes. Decoherence is measured physics and explains why superpositions of macroscopically distinct states are never observed in practice. What it does not by itself explain is why a single outcome occurs.`,
  },
  {
    id: "q-copenhagen",
    module: "quantum",
    tag: "interpretation",
    title: "Copenhagen / collapse",
    body: `The oldest reading: the wavefunction is a tool for computing probabilities, and measurement is a special process where it collapses to one outcome. It matches lab practice but leaves "what counts as a measurement?" undefined — the cut between quantum system and classical apparatus floats. Some descendants (objective-collapse models like GRW or Penrose's gravitational proposal) make collapse a real physical process with testable deviations; those remain speculative.`,
  },
  {
    id: "q-manyworlds",
    module: "quantum",
    tag: "interpretation",
    title: "Many-worlds",
    body: `Take the Schrödinger equation as exact and universal: no collapse ever happens, and every term in the superposition is equally real — the measurement appears to have one outcome because *you* are inside one branch. This reading is economical in laws but extravagant in worlds, and it must earn the Born rule (why squared amplitudes are the right betting odds) rather than postulate it; whether the standard derivations succeed is still argued.`,
  },
  {
    id: "q-pilotwave",
    module: "quantum",
    tag: "interpretation",
    title: "Pilot wave (de Broglie–Bohm)",
    body: `Particles always have definite positions, guided by the wavefunction. The double slit becomes unmysterious — the particle goes through one slit, its guiding wave through both. The price is explicit nonlocality: the guidance equation links distant particles instantaneously, which sits uneasily with relativity even though no signal can be sent with it.`,
  },
  {
    id: "q-histories",
    module: "quantum",
    tag: "interpretation",
    title: "Decoherent histories",
    body: `Assign probabilities only to coarse-grained histories that decohere — sets of alternatives the environment has made interference-free. It refines Copenhagen by replacing the measurement cut with a decoherence criterion, and it cohabits naturally with the many-worlds picture; whether it answers the single-outcome question or reframes it is part of the standing debate.`,
  },
  {
    id: "q-branchcount",
    module: "quantum",
    tag: "open-question",
    title: "Bruce's counting question: every Planck pixel?",
    body: `If reality were a Planck-scale lattice of "slit decisions," does every configuration of every pixel carry nonzero amplitude — and is each its own world? Two clarifications sharpen the question. First, quantum states live in Hilbert space, not in the set of classical configuration snapshots: a generic state is a superposition over configuration space, and the number of orthogonal states in a region is bounded (by the holographic entropy bound) far below the count of naive pixel-combinations. Second, "worlds" are not pixel-configurations: branches are defined by decoherence, which coarse-grains enormous bundles of micro-configurations into a single stable record — that coarse-graining is the principled version of Bruce's "dedupe" instinct. What remains genuinely unresolved: whether branch number is even well-defined, and whether amplitude-weighted existence is the right way to count anything at all.`,
  },

  // ── entanglement ──────────────────────────────────────────────────────────
  {
    id: "ent-bell",
    module: "entanglement",
    tag: "established",
    title: "Bell: no local hidden story survives",
    body: `Prepare two particles in a singlet state, separate them, and measure spins along chosen angles. Quantum mechanics predicts correlations E(a,b) = −cos(θ) whose CHSH combination reaches 2√2 ≈ 2.83. Bell's theorem shows any theory in which outcomes are fixed by local pre-existing facts caps that combination at 2 — and the experiment in this module runs both: the quantum sampler beats the bound, the local-hidden-variable model never does, through the identical estimator. Loophole-free experiments (2015 onward; Nobel 2022) settled it in nature's favor: the correlations are real and no local hidden story explains them. Entanglement does not transmit signals — the violation lives only in the comparison of the two records.`,
  },
  {
    id: "ent-erepr",
    module: "entanglement",
    tag: "conjecture",
    title: "ER = EPR: are entangled pairs wormhole mouths?",
    body: `Maldacena and Susskind's 2013 proposal — the one behind Bruce's "two ends of the same object" intuition: a maximally entangled pair of black holes is the same thing as a non-traversable Einstein–Rosen bridge connecting them, and perhaps every entangled pair is linked by some quantum-scale version of such geometry. It elegantly knits together the two 1935 papers (EPR on entanglement, ER on bridges) and fits the broader it-from-qubit picture in which spacetime connectivity is built from entanglement. It remains unproven: its sharpest support comes from AdS/CFT model universes unlike ours, and no experimental test exists. The wormholes involved are non-traversable, so it implies no faster-than-light travel.`,
  },

  // ── blackhole ─────────────────────────────────────────────────────────────
  {
    id: "bh-lensing",
    module: "blackhole",
    tag: "established",
    title: "The shadow and the photon ring",
    body: `Light passing a black hole with impact parameter below b_c = (3√3/2)·r_s spirals in; above it, light escapes. The result is a dark disc of angular diameter set by 3√3·r_s — the shadow the Event Horizon Telescope photographed around M87* and Sgr A*. The scene here integrates the actual null geodesic equation per pixel in a shader; the measured shadow size in the rendered frame matches the analytic prediction, and the e2e suite checks it.`,
  },
  {
    id: "bh-timedilation",
    module: "blackhole",
    tag: "established",
    title: "Time at the horizon",
    body: `A clock hovering at radius r ticks at √(1 − r_s/r) the rate of one far away — at the horizon, the factor reaches zero, which is why an outside observer sees an infalling friend redden and freeze rather than cross. The crossing happens in finite time on the friend's own clock; the horizon is locally unremarkable. General relativity, applied without quantum mechanics, is silent about what finally becomes of what falls in.`,
  },
  {
    id: "bh-hawking",
    module: "blackhole",
    tag: "theoretical-prediction",
    title: "Hawking radiation",
    body: `Applying quantum field theory in the curved spacetime near a horizon, Hawking (1974) found black holes should radiate thermally at T = ħc³/(8πGMk_B) and slowly evaporate over a lifetime growing as M³. For a solar-mass hole the temperature is ~6×10⁻⁸ K — hopelessly colder than the cosmic microwave background, so the radiation has never been observed, and for astrophysical holes likely never will be directly. The calculation itself uses only physics tested elsewhere, which is why the prediction is taken seriously enough to anchor the information paradox.`,
  },
  {
    id: "bh-entropy",
    module: "blackhole",
    tag: "theoretical-prediction",
    title: "Entropy that grows with area",
    body: `Bekenstein and Hawking assign a black hole entropy S = k_B·A/(4 l_p²) — one quarter of the horizon area in Planck units, a quarter-bit-scale of information per Planck pixel of surface. Note what is strange: every ordinary system's maximum entropy grows with volume. The largest possible information content of a region apparently scales with the area wrapping it, as if the three-dimensional interior were redundant. That observation seeds the holographic principle.`,
  },
  {
    id: "bh-infoparadox",
    module: "blackhole",
    tag: "open-question",
    title: "The information paradox — where QM and GR collide",
    body: `Quantum mechanics insists evolution is unitary: information is never destroyed. Hawking's radiation, in his original calculation, is exactly thermal — carrying no imprint of what fell in. If the hole evaporates completely, the information is gone, and quantum mechanics is broken; if information escapes, the semiclassical picture of the horizon is wrong somewhere. Recent work (the Page-curve calculations via replica wormholes, 2019–) suggests the radiation is unitary after all, but how the interior story is rewritten — firewalls, islands, fuzzballs, something else — remains the sharpest open problem at the intersection of the two theories. This is the dilemma black holes were always going to force: they are the one laboratory where both theories must apply at full strength.`,
  },
  {
    id: "bh-holography",
    module: "blackhole",
    tag: "conjecture",
    title: "The holographic principle",
    body: `'t Hooft and Susskind's proposal, generalizing the area law: the physics inside any region might be fully encoded on its boundary, like a hologram. Its sharpest realization is AdS/CFT (Maldacena 1997), an exact duality between a gravitational universe and a lower-dimensional quantum theory without gravity — but proven only for spacetimes with the wrong (anti-de Sitter) asymptotics. Whether our own universe is holographic in any precise sense is unestablished, which keeps this filed as conjecture however influential it has become.`,
  },

  // ── planck ────────────────────────────────────────────────────────────────
  {
    id: "pl-lattice",
    module: "planck",
    tag: "established",
    title: "Why a Planck lattice fights Lorentz",
    body: `Bruce's lattice picture meets a hard constraint that the demo below makes visible: a regular grid of spacetime pixels defines preferred directions and a preferred rest frame — boost it and its spacing statistics change, so motion relative to "the grid" would be detectable, violating relativity. A Poisson sprinkling — points thrown down at random with fixed density per unit of invariant volume — has no such problem: boost it and its statistics are unchanged, because the sprinkling respects Lorentz symmetry on average. Discreteness is not ruled out; *grid-like* discreteness is in tension with the symmetry every experiment confirms.`,
  },
  {
    id: "pl-bounds",
    module: "planck",
    tag: "established",
    title: "What experiment already says",
    body: `If spacetime discreteness modified the propagation of light — higher-energy photons traveling very slightly slower, say — billions of light-years would amplify the lag into measurable arrival-time spreads from gamma-ray bursts. Fermi-LAT observations (notably GRB 090510) constrain linear Planck-scale dispersion beyond the Planck energy itself, ruling out the simplest Lorentz-violating discreteness. Any viable quantum spacetime must hide its granularity extraordinarily well.`,
  },
  {
    id: "pl-strings",
    module: "planck",
    tag: "conjecture",
    title: "Strings and holography",
    body: `String theory replaces point particles with extended objects, smoothing the short-distance behavior that makes gravity nonrenormalizable, and it naturally contains a graviton. Through AdS/CFT it gave the deepest realization of holography to date. The costs are well known: extra dimensions, a vast landscape of solutions, and as yet no contact with experiment at accessible energies.`,
  },
  {
    id: "pl-lqg",
    module: "planck",
    tag: "conjecture",
    title: "Loop quantum gravity",
    body: `Quantize geometry itself: areas and volumes acquire discrete spectra in Planck units, with space woven from spin networks. Attractively, discreteness is derived rather than assumed, and a quantized area operator resonates with the black-hole area law. Open problems include recovering smooth classical spacetime in the large and making contact with the rest of particle physics.`,
  },
  {
    id: "pl-causalsets",
    module: "planck",
    tag: "conjecture",
    title: "Causal sets",
    body: `Spacetime as a locally finite partial order: just events and which-causes-which, with volume counted by number of elements — "order plus number equals geometry." Its founding move is exactly the one the demo above motivates: random sprinkling rather than a lattice, preserving Lorentz invariance statistically. It predicted the right order of magnitude for the cosmological constant before observation; turning the program into full dynamics remains unfinished.`,
  },

  // ── information ───────────────────────────────────────────────────────────
  {
    id: "info-entanglement-creates",
    module: "information",
    tag: "established",
    title: "Entanglement manufactures information",
    body: `Take two qubits in a product state: each, alone, is in a definite state — zero bits of entropy. Entangle them and each one, viewed alone, becomes uncertain: the reduced state of either qubit of a Bell pair carries exactly one bit of entropy, created by the correlation itself. The slider below interpolates product → Bell and computes the entanglement entropy live from the reduced density matrix — Bruce's hypothesis that entanglement *produces* information, made quantitative. The information is in the relation, not in either part: the joint state stays pure.`,
  },
  {
    id: "info-records",
    module: "information",
    tag: "established",
    title: "Observation as information production",
    body: `What is a measurement, informationally? Decoherence gives a concrete answer: as an environment couples to a system, system–environment mutual information rises while interference visibility falls — records of the outcome proliferate into the world (this is quantum Darwinism's central quantity, computed live in the demo). An "observation" is nothing but this: correlation cascading outward until the outcome is redundantly, irreversibly written into many degrees of freedom. In this precise sense, observation and entanglement do produce information — bits of correlation that did not exist before.`,
  },
  {
    id: "info-landauer",
    module: "information",
    tag: "established",
    title: "Information is physical",
    body: `Landauer's principle: erasing one bit costs at least k_B·T·ln 2 of dissipated energy — verified in single-particle experiments since 2012. Information is not an abstraction layered on physics; it has an exchange rate into joules. Shannon's entropy and thermodynamic entropy are the same quantity measured in different units, which is why the calculator below converts freely between bits, temperature, and energy.`,
  },
  {
    id: "info-bekenstein",
    module: "information",
    tag: "theoretical-prediction",
    title: "The universe's storage limit scales with area",
    body: `The Bekenstein bound caps how much information any region can hold, and the cap saturates at a black hole: A/(4 l_p² ln 2) bits — the horizon area in Planck pixels, divided by 4 ln 2. A solar-mass black hole: ~10⁷⁷ bits on a 9-km-wide sphere. That the maximum is set by area rather than volume is the single most information-theoretic fact known about gravity, and it is gravity that enforces it: pack more bits into the region and it collapses into a black hole.`,
  },
  {
    id: "info-itfrombit",
    module: "information",
    tag: "conjecture",
    title: "It from bit",
    body: `Wheeler's hypothesis — and Bruce's: that information is the most fundamental layer, with every "it" (particle, field, spacetime itself) deriving its existence from binary distinctions, perhaps distinctions drawn from quantum fluctuations by observation and entanglement. The modern descendant, "it from qubit," is concrete: in holographic models, the connectivity and even the curvature of spacetime appear to be built out of patterns of entanglement (Van Raamsdonk's cutting argument; the Ryu–Takayanagi formula equating boundary entanglement entropy with bulk areas). The supporting evidence lives in model universes and remains conjectural for ours; as a research program it is among the most active routes toward quantum gravity.`,
  },
  {
    id: "info-distinctions",
    module: "information",
    tag: "open-question",
    title: "Are distinctions from fluctuations the ground floor?",
    body: `Bruce's sharpened version of the hypothesis: information as distinctions arising from pure random quantum fluctuations — with observation/entanglement as the mechanism that stabilizes a distinction into a fact. The pieces above give it real footing: entanglement demonstrably creates entropy, decoherence demonstrably creates records, and gravity's deepest law (the area bound) is already information-theoretic. What is missing is a derivation running the other way — getting the specific laws of physics (three forces, Lorentz symmetry, the Born rule) *out of* informational axioms rather than describing them informationally after the fact. Until something like that exists, "information is the fundamental layer" stays an open question with suggestive structure rather than a result.`,
  },

  // ── gravity ───────────────────────────────────────────────────────────────
  {
    id: "grav-universality",
    module: "gravity",
    tag: "established",
    title: "Gravity's signature: it cannot be screened",
    body: `Drop a feather and a hammer in vacuum and they fall identically — Apollo 15 staged it on the Moon; torsion-balance experiments confirm it to one part in 10¹³. In the geodesic engine the equivalence principle is structural: the trajectory equation contains no mass parameter at all, and the drop-test below runs two bodies a million-fold apart in mass along bit-identical paths. This universality is what lets gravity be geometry: because everything falls the same way, "falling" can be a property of spacetime rather than of objects. No other force has this character — and it is also why gravity alone cannot be screened, shielded, or transformed away globally.`,
  },
  {
    id: "grav-nonrenorm",
    module: "gravity",
    tag: "established",
    title: "The dilemma of quantizing gravity",
    body: `Quantize electromagnetism and you get a spectacularly predictive theory. Apply the same recipe to general relativity and it fails: the coupling constant G has dimensions that make the perturbation series generate new infinities at every order — gravity is nonrenormalizable, valid only as an effective theory below the Planck scale. The other forces live *on* spacetime; gravity *is* spacetime, and quantizing the stage with the actors is the unsolved step. Every quantum-gravity program in the discreteness module is an attempt at exactly this.`,
  },
  {
    id: "grav-emergent",
    module: "gravity",
    tag: "conjecture",
    title: "The counterpoint: is gravity emergent?",
    body: `Jacobson (1995) showed something startling: assume heat, temperature, and entropy behave thermodynamically across every local horizon (δQ = T·dS, with entropy proportional to area), and Einstein's field equations follow as an equation of state — the way the ideal gas law follows from molecular statistics. Verlinde's entropic-gravity proposal pushes further: gravity as an entropic force, not fundamental at all. On this reading the rubber sheet was doubly wrong — spacetime curvature itself might be a coarse-grained, statistical description of something informational underneath (note how naturally this meets the it-from-qubit program in the information module). The derivation is mathematically solid; whether it reveals gravity's true nature or is an elegant reformulation is unsettled — which is why this panel, unlike its neighbor on universality, is filed as conjecture.`,
  },
  {
    id: "grav-collapse",
    module: "gravity",
    tag: "conjecture",
    title: "Gravity in the measurement problem?",
    body: `Penrose's proposal: superpositions of significantly different mass distributions are superpositions of different spacetime geometries, and nature may not tolerate those — gravity itself collapsing the wavefunction on a timescale ~ħ/E_G, where E_G is the gravitational self-energy of the difference. Diósi reached similar dynamics independently. The idea is testable in principle (levitated nanoparticle interferometry is inching toward the regime), and recent underground experiments have already pressured the simplest Diósi parameterization. If anything like it held, gravity would be behind the measurement dilemma too — but as of now there is no experimental sign that collapse is real, gravitational or otherwise.`,
  },
  {
    id: "grav-thread",
    module: "gravity",
    tag: "open-question",
    title: "Is gravity the common thread?",
    body: `Tally gravity's appearances across this lab's dilemmas. It is the force that resists quantization (nonrenormalizability). It sets the information-storage limit of space (area bound). It owns the cleanest QM-vs-GR contradiction (the information paradox). It is conjectured to pick the branch in measurement (objective collapse) and conjectured to be made of entanglement (emergent gravity, ER=EPR). Bruce's hypothesis — that gravity is fundamental and behind many of modern physics' dilemmas — and its mirror image — that gravity is emergent and therefore behind nothing, merely symptomatic — are both live. Either way the pattern is striking: every deep crack in physics runs through gravity, which is the best reason to believe that whoever understands gravity's relation to information understands the next layer down.`,
  },

  // ── graph ─────────────────────────────────────────────────────────────────
  {
    id: "graph-reading",
    module: "graph",
    tag: "established",
    title: "How to read this map",
    body: `Nodes are the concepts this lab explores; edges say how they relate: "derives" (follows by argument or theorem), "emerges" (appears as a limit or coarse-graining), "constrains" (bounds or forbids), "tension" (the places the theories grind), and "conjecture" (proposed links not yet earned). Every edge carries a justification and an epistemic status — the same honesty labels used across the lab. Click any node to jump to the module that explores it. The map's claim is itself worth examining: that physics is not a pile of facts but a directed structure, and the open question of our era is which node sits at the bottom.`,
  },
];

/** Established-voice phrasings banned in conjecture/interpretation/open-question panels. */
export const BANNED_ESTABLISHED_VOICE = [
  "we know that",
  "it is proven",
  "it has been proven",
  "scientists have shown",
  "it is a fact",
  "established fact",
  "we now know",
  "proven fact",
];
