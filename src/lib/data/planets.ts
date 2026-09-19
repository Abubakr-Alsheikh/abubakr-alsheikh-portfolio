/**
 * Target readouts for the background bodies. Each one carries a real fact line
 * and what the body stands for in the section it sits behind.
 *
 * Facts are the textbook values. Moon counts drift as new moons are confirmed,
 * so none is used except Saturn's, which is the IAU count as of March 2025.
 */

export interface PlanetNote {
  name: string;
  facts: string;
  /** The engineering idea the body stands for, shown under the rule. */
  meaning: string;
}

export const planetNotes = {
  saturn: {
    name: "SATURN",
    facts: "9.58 AU · TILT 26.7° · 274 MOONS",
    meaning: "REF // ORDER · layers held in balance",
  },
  jupiter: {
    name: "JUPITER",
    facts: "5.20 AU · 11.2 R⊕ · DAY 9.9 H",
    meaning: "REF // SCALE · built to carry the load",
  },
  neptune: {
    name: "NEPTUNE",
    facts: "30.07 AU · ORBIT 164.8 Y · WIND 2,100 KM/H",
    meaning: "REF // LEGACY · long orbits, lasting code",
  },
  mars: {
    name: "MARS",
    facts: "1.52 AU · TILT 25.2° · SOL 24.6 H",
    meaning: "REF // RESILIENCE · built for hostile ground",
  },
  blackHole: {
    name: "EVENT HORIZON",
    facts: "PHOTON SPHERE 1.5 Rs · SHADOW 2.6 Rs",
    meaning: "REF // CONVERGENCE · every path ends here",
  },
} satisfies Record<string, PlanetNote>;
