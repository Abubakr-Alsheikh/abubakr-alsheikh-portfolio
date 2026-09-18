"use client";

import GeometricSphere from "./GeometricSphere";

/**
 * Archive: a small, sharply inclined world. The rings sit at three different
 * inclinations, so each crosses the disc at its own angle and the occlusion is
 * visibly different on each one.
 */
export default function GeometricNeptune() {
  return (
    <div className="absolute bottom-[-10%] right-[-50%] md:right-[-28%] w-[200%] md:w-[150%] max-w-[2400px] aspect-square opacity-[0.65] pointer-events-none z-0">
      <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
        <g transform="translate(100, 100)">
          <GeometricSphere
            id="archive-neptune"
            radius={25}
            tiltDeg={28}
            leanDeg={-34}
            meridians={10}
            parallels={6}
            sunTiltDeg={-40}
            sunLeanDeg={40}
            accent="#3B82F6"
            grid="#64748B"
            glow
            rings={[
              {
                distance: 3.2,
                tiltDeg: 70,
                leanDeg: 12,
                width: 0.9,
                dash: "3 5",
                flowSeconds: 120,
              },
              {
                distance: 3.8,
                tiltDeg: -20,
                leanDeg: 28,
                width: 0.8,
                dash: "1 4",
                flowSeconds: 180,
              },
              {
                distance: 2.4,
                tiltDeg: -50,
                leanDeg: -10,
                width: 0.9,
                tone: "#475569",
              },
            ]}
            moons={[
              { ring: 0, periodSeconds: 200, size: 1.5 },
              { ring: 2, periodSeconds: 150, size: 1.1, tone: "#94A3B8" },
            ]}
          />
        </g>
      </svg>
    </div>
  );
}
