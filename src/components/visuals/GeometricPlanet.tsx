"use client";

import GeometricSphere from "./GeometricSphere";

/**
 * Hero: Saturn.
 *
 * Proportions are the real ones, in Saturn equatorial radii:
 *   C ring   1.24 - 1.53   faint, translucent
 *   B ring   1.53 - 1.95   the bright, dense one
 *   Cassini  1.95 - 2.03   the famous gap, left empty
 *   A ring   2.03 - 2.27   split by the Encke gap at ~2.21
 *   F ring   2.33          a narrow braided strand
 * The body is oblate (polar radius 0.9 of equatorial) and the axis leans toward
 * the viewer so the rings open up and cross in front of the disc.
 *
 * The inner moon is Mimas at 3.08 — its 2:1 resonance is what clears the
 * Cassini division. Enceladus rides further out at 3.95.
 */

// Shared by the body and every ring: Saturn's rings lie in its equator.
const TILT = -20;
const LEAN = 24;

export default function GeometricPlanet() {
  return (
    // Positioned by its centre rather than by an edge: the old right/width
    // offsets put the planet near the middle of the screen once the width cap
    // kicked in. Centre at ~88% keeps the body on screen and lets the rings
    // run off the right edge, leaving the middle of the hero clear.
    <div className="absolute left-[82%] top-[26%] w-[260vw] md:left-[88%] md:top-[34%] md:w-[180vw] max-w-[2800px] aspect-square -translate-x-1/2 -translate-y-1/2 opacity-[0.88] pointer-events-none z-0">
      <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
        <g transform="translate(100, 100)">
          <GeometricSphere
            id="hero-saturn"
            radius={24}
            tiltDeg={TILT}
            leanDeg={LEAN}
            polar={0.9}
            meridians={6}
            parallels={13}
            sunTiltDeg={58}
            sunLeanDeg={26}
            accent="#F97316"
            grid="#64748B"
            glow
            bands={[
              // C ring
              { from: 1.24, to: 1.52, lines: 8, opacity: 0.5, width: 0.7, tone: "#64748B" },
              // B ring: densest, brightest
              { from: 1.53, to: 1.94, lines: 22, opacity: 0.92, width: 0.9, tone: "#F97316" },
              // A ring, inner of the Encke gap
              { from: 2.03, to: 2.19, lines: 9, opacity: 0.75, width: 0.8, tone: "#94A3B8" },
              // A ring, outer of the Encke gap
              { from: 2.23, to: 2.27, lines: 3, opacity: 0.65, width: 0.8, tone: "#94A3B8" },
            ]}
            rings={[
              // F ring: a single flowing strand beyond the main system.
              {
                distance: 2.33,
                tiltDeg: TILT,
                leanDeg: LEAN,
                width: 0.9,
                dash: "3 2 1 2",
                flowSeconds: 40,
                tone: "#3B82F6",
                opacity: 0.9,
              },
              // Mimas
              {
                distance: 3.08,
                tiltDeg: TILT,
                leanDeg: LEAN,
                width: 0.6,
                dash: "1 5",
                flowSeconds: 160,
                tone: "#475569",
                opacity: 0.6,
              },
              // Enceladus
              {
                distance: 3.95,
                tiltDeg: TILT,
                leanDeg: LEAN,
                width: 0.5,
                dash: "1 8",
                tone: "#475569",
                opacity: 0.45,
              },
            ]}
            moons={[
              { ring: 1, periodSeconds: 90, size: 1.1, tone: "#94A3B8" },
              { ring: 2, periodSeconds: 132, size: 1.5, tone: "#3B82F6" },
            ]}
          />
        </g>
      </svg>
    </div>
  );
}
