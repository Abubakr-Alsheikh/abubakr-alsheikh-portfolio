"use client";

export default function GeometricMars() {
  return (
    <div className="absolute top-[10%] right-[-60%] md:right-[-40%] w-[200%] md:w-[150%] max-w-[2400px] aspect-square opacity-[0.2] pointer-events-none z-0">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full stroke-[#F97316] fill-none"
      >
        <g transform="translate(100, 100)">
          {/* 1. FIXED: Sleek, trimmed HUD Crosshairs that hug the planet instead of cutting across the screen */}
          <path
            d="M -55 0 L -45 0 M 45 0 L 55 0 M 0 -55 L 0 -45 M 0 45 L 0 55"
            strokeWidth="0.4"
            className="stroke-slate-500"
          />

          {/* Planet Core */}
          <circle
            cx="0"
            cy="0"
            r="35"
            strokeWidth="0.4"
            className="stroke-slate-500"
          />

          {/* Topographical Latitude Lines */}
          <path
            d="M -32 -15 Q 0 -5 32 -15"
            strokeWidth="0.3"
            className="stroke-slate-600"
          />
          <path
            d="M -35 0 Q 0 10 35 0"
            strokeWidth="0.5"
            className="stroke-[#F97316]"
          />
          <path
            d="M -32 15 Q 0 25 32 15"
            strokeWidth="0.3"
            className="stroke-slate-600"
          />

          {/* 2. FIXED: Grouped Animation & Sleek Satellite Node */}
          <g>
            {/* A single hardware-accelerated rotation command for the entire outer ring system */}
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur="150s"
              repeatCount="indefinite"
            />

            {/* The Tracking Ring */}
            <circle
              cx="0"
              cy="0"
              r="70"
              strokeWidth="0.2"
              strokeDasharray="2 6"
              className="stroke-[#F97316]"
            />

            {/* The Sleek Satellite Node (Replaced the blocky square) */}
            <circle
              cx="0"
              cy="-70"
              r="2.5"
              strokeWidth="0.5"
              className="stroke-[#F97316] fill-[#020617]"
            />
            <circle cx="0" cy="-70" r="0.5" className="fill-[#F97316]" />
          </g>
        </g>
      </svg>
    </div>
  );
}
