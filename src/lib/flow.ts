import type { CSSProperties } from "react";

/**
 * Dash flow for the big background bodies (planet rings, the black hole's
 * disk), as a stepped CSS animation.
 *
 * A moving dash on a ring 2000px across repaints that ring every frame it
 * moves. Profiling showed those repaints, not the animation mechanism, held
 * the hero and contact sections near 50fps: CSS and SMIL flows cost the same.
 * Stepping the offset at FLOW_HZ halves that cost, and on rings this slow a
 * 20Hz update reads the same as a 60Hz one.
 *
 * Pair with `hud-flow-stepped` from globals.css.
 */

/** Offset updates per second. */
export const FLOW_HZ = 20;

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
  // The keyframe travels +period to -period: two cycles.
  const dur = seconds * 2;
  return {
    "--hud-flow": `${period}px`,
    "--hud-dur": `${dur}s`,
    "--hud-steps": Math.max(1, Math.round(dur * FLOW_HZ)),
    animationDirection: forward ? "reverse" : "normal",
  } as CSSProperties;
}
