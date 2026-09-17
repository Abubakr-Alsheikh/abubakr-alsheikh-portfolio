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
