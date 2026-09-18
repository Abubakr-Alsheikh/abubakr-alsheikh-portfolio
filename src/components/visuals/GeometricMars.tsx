"use client";

import GeometricSphere from "./GeometricSphere";

/**
 * Engine: a surveyed world. Keeps the HUD crosshairs and the tracking ring of
 * the original, but the body underneath is now real geometry.
 */
export default function GeometricMars() {
  return (
    <div className="absolute top-[-6%] right-[-60%] md:right-[-38%] w-[200%] md:w-[130%] max-w-[2400px] aspect-square opacity-[0.7] pointer-events-none z-0">
      <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
        <g transform="translate(100, 100)">
          {/* Survey crosshairs, trimmed so they hug the body. */}
          <path
            d="M -55 0 L -45 0 M 45 0 L 55 0 M 0 -55 L 0 -45 M 0 45 L 0 55"
            fill="none"
            stroke="#64748B"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />

          <GeometricSphere
            id="journey-mars"
            radius={35}
            tiltDeg={-14}
            leanDeg={20}
            meridians={10}
            parallels={9}
            sunTiltDeg={48}
            sunLeanDeg={-12}
            accent="#F97316"
            grid="#64748B"
            glow
            rings={[
              {
                distance: 2,
                tiltDeg: -14,
                leanDeg: 20,
                width: 0.8,
                dash: "2 6",
                flowSeconds: 60,
              },
            ]}
            moons={[{ ring: 0, periodSeconds: 150, size: 2.2 }]}
          />
        </g>
      </svg>
    </div>
  );
}
