import { planetNotes, type PlanetNote } from "./planets";

/**
 * The route the page flies, one stop per body. Each stop is reached when its
 * section reaches the middle of the screen, and lights the canopy from the side
 * its planet sits on, in the planet's own colour. Readouts use the body's real
 * fact line from planets.ts; nothing here invents a distance.
 */

export type LightSide = "left" | "right" | "below";

export interface FlightStop {
  /** The id of the section the body sits behind. */
  section: string;
  body: PlanetNote;
  /** The ship's readout at this stop: short enough for the margin. Real figures only. */
  readout: string;
  light: { side: LightSide; rgb: string };
}

const ORANGE = "249, 115, 22";
const BLUE = "59, 130, 246";

export const flightPlan: FlightStop[] = [
  { section: "hero", body: planetNotes.saturn, readout: "9.58 AU", light: { side: "right", rgb: ORANGE } },
  { section: "about", body: planetNotes.jupiter, readout: "5.20 AU", light: { side: "left", rgb: ORANGE } },
  { section: "archive", body: planetNotes.neptune, readout: "30.07 AU", light: { side: "right", rgb: BLUE } },
  { section: "engine", body: planetNotes.mars, readout: "1.52 AU", light: { side: "right", rgb: ORANGE } },
  { section: "contact", body: planetNotes.blackHole, readout: "SHADOW 2.6 Rs", light: { side: "below", rgb: BLUE } },
];
