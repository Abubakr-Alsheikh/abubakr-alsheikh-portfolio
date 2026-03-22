"use client";

export default function GeometricPlanet() {
  return (
    <div className="absolute top-[-30%] right-[-50%] md:top-[-45%] md:right-[-35%] w-[200%] md:w-[160%] max-w-[2200px] aspect-square opacity-[0.25] pointer-events-none z-0">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full stroke-[#3B82F6] fill-none"
      >
        <g transform="translate(100, 100) rotate(-25)">
          <circle
            cx="0"
            cy="0"
            r="30"
            strokeWidth="0.4"
            className="stroke-slate-500"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="15"
            ry="30"
            strokeWidth="0.2"
            className="stroke-slate-600"
          />

          {/* NATIVE SVG HARDWARE ACCELERATION */}
          <ellipse
            cx="0"
            cy="0"
            rx="55"
            ry="15"
            strokeWidth="0.4"
            strokeDasharray="2 4"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur="150s"
              repeatCount="indefinite"
            />
          </ellipse>

          <ellipse cx="0" cy="0" rx="75" ry="20" strokeWidth="0.6">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 0 0"
              to="0 0 0"
              dur="200s"
              repeatCount="indefinite"
            />
          </ellipse>

          <ellipse
            cx="0"
            cy="0"
            rx="90"
            ry="25"
            strokeWidth="0.3"
            strokeDasharray="1 6"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur="250s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
      </svg>
    </div>
  );
}
