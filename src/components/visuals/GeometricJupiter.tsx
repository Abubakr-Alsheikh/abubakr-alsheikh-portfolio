"use client";

import GeometricSphere from "./GeometricSphere";
import { useSmilPause } from "@/hooks/useSmilPause";

/**
 * About: a gas giant. Heavy on parallels and light on meridians, so the cage
 * reads as banding rather than as a globe grid, and lit from the left to throw
 * the terminator across the visible face.
 */
export default function GeometricJupiter() {
  const svgRef = useSmilPause();

  return (
    <div className="absolute top-[5%] left-[-55%] md:left-[-32%] w-[180%] md:w-[140%] max-w-[2000px] aspect-square opacity-[0.62] pointer-events-none z-0">
      {/* data-planet: PlanetTag finds the body by it to aim its leader. */}
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="w-full h-full"
        aria-hidden="true"
        data-planet="jupiter"
      >
        <g transform="translate(100, 100)">
          <GeometricSphere
            id="about-jupiter"
            radius={45}
            tiltDeg={12}
            leanDeg={16}
            polar={0.935}
            meridians={6}
            parallels={13}
            sunTiltDeg={-68}
            sunLeanDeg={18}
            accent="#F97316"
            grid="#64748B"
            glow
            rings={[
              {
                distance: 1.5,
                tiltDeg: 12,
                leanDeg: 16,
                width: 0.8,
                dash: "1 5",
                flowSeconds: 70,
                tone: "#F97316",
              },
            ]}
            moons={[
              { ring: 0, periodSeconds: 150, size: 1.3, tone: "#3B82F6" },
            ]}
          />
        </g>
      </svg>
    </div>
  );
}
