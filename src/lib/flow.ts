import type { CSSProperties } from "react";

/**
 * Dash flow for the big background bodies (planet rings, the black hole's
 * disk).
 *
 * A moving dash on a ring 2000px across repaints that ring every frame it
 * moves. It was a CSS animation with `steps()`, which reduced the repaints but
 * not the frames: a running stroke-dashoffset animation still recalculates style
 * on every vsync. So `useSmilPause` now writes the offset itself, on the same
 * slow step as the planet's SMIL. On rings this slow it reads the same as 60Hz.
 *
 * Give the element the class `hud-flow-stepped` and these variables.
 */

/**
 * @param period  one dash cycle, in the path's user units
 * @param seconds time for one cycle to pass
 * @param forward true for an increasing offset (the old SMIL `0 -> +period`)
 */
export function flowStyle(
  period: number,
  seconds: number,
  forward: boolean,
): CSSProperties {
  return {
    "--hud-flow": `${forward ? period : -period}`,
    "--hud-dur": `${seconds}`,
  } as CSSProperties;
}
