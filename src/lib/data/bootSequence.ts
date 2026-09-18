/**
 * Power-on self test played by `SystemBootSequence`.
 *
 * Authored rather than generated: the addresses, the order and the one skipped
 * subsystem are all fixed, so the boot reads the same way every time and the
 * server and client never disagree.
 */

export type PostResult = "OK" | "SKIP";

export interface PostCheck {
  /** Three-letter subsystem code. */
  sys: string;
  /** What the check covers — an address range, a bus, a link. */
  range: string;
  result: PostResult;
}

export const postChecks: PostCheck[] = [
  { sys: "MEM", range: "0x0000-0x3FFF", result: "OK" },
  { sys: "VFS", range: "mount /orbital", result: "OK" },
  { sys: "GPU", range: "raster pipeline", result: "OK" },
  { sys: "HUD", range: "canopy z40..z60", result: "OK" },
  { sys: "TRC", range: "trace.field x13", result: "OK" },
  { sys: "NET", range: "telemetry uplink", result: "OK" },
  { sys: "DBG", range: "remote inspector", result: "SKIP" },
  { sys: "CRC", range: "0x9E41B7", result: "OK" },
];

/** Cells in the memory map strip filled during the POST. */
export const MEMORY_CELLS = 32;

/**
 * The launch sequence the boot screen walks through, keyed by the progress
 * percentage each stage starts at. The self test resolves inside the first
 * stage; the last one is the warp jump that hands the page over.
 */
export interface LaunchStage {
  id: "post" | "nav" | "ignition" | "warp";
  label: string;
  /** Status line shown in the panel header while the stage runs. */
  status: string;
  from: number;
}

export const launchStages: LaunchStage[] = [
  { id: "post", label: "Self_Test", status: "Power_On_Self_Test", from: 0 },
  { id: "nav", label: "Nav_Lock", status: "Nav_Lock // Acquiring", from: 60 },
  { id: "ignition", label: "Ignition", status: "Ignition // Main_Engine", from: 86 },
  { id: "warp", label: "Warp", status: "Warp // Engaged", from: 100 },
];

/**
 * What the nav globe locks onto during the second stage. Real coordinates
 * (the Orion Nebula), so the readout is a fix rather than noise.
 */
export const navTarget = {
  name: "M42 // ORION",
  ra: "05h 35m 17s",
  dec: "-05° 23′ 28″",
};
