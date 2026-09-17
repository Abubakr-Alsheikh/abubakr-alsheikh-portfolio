"use client";

import React from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";

/**
 * The canopy is the glass the whole page is read through. Everything here is
 * decorative and pointer-transparent; it sits at z-40, above the content column
 * (z-10) and below TelemetryNav (z-50).
 *
 * Geometry rule: nothing in this file uses a square viewBox stretched to the
 * viewport. A `preserveAspectRatio="none"` frame turns a 7-unit bracket arm
 * into 179px horizontally and 100px vertically on a 2560x1440 screen, and the
 * corners read as stretched. Every piece is either a fixed-pixel SVG anchored
 * to an edge, or a CSS box positioned in percentages.
 */

/** Edge box each corner bracket is drawn in. */
const CORNER_SIZE = 72;

/** Rail graduation. */
const RAIL_TICKS = 21;
const MAJOR_EVERY = 5;

/** Matches the ALTITUDE readout in TelemetryNav so the two HUDs agree. */
const ALT_CEILING = 400_000;

const CORNER_TRANSFORMS = {
  tl: { className: "top-0 left-0", rotate: 0 },
  tr: { className: "top-0 right-0", rotate: 90 },
  br: { className: "bottom-0 right-0", rotate: 180 },
  bl: { className: "bottom-0 left-0", rotate: 270 },
} as const;

type CornerKey = keyof typeof CORNER_TRANSFORMS;

/**
 * One chamfered L. The outer corner is cut at 45 degrees rather than mitred,
 * which is what makes it read as machined plate instead of a CSS border.
 * The shape is symmetric about its diagonal, so the other three corners are
 * the same path rotated.
 */
function CornerBracket({ corner }: { corner: CornerKey }) {
  const { className, rotate } = CORNER_TRANSFORMS[corner];

  return (
    <svg
      width={CORNER_SIZE}
      height={CORNER_SIZE}
      viewBox={`0 0 ${CORNER_SIZE} ${CORNER_SIZE}`}
      className={`absolute ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      {/* Outer plate edge */}
      <path
        d="M 1 58 L 1 14 L 14 1 L 58 1"
        stroke="#3B82F6"
        strokeWidth="1"
        fill="none"
        opacity="0.45"
        vectorEffect="non-scaling-stroke"
      />
      {/* Inner rib, stopping short so the two lines do not read as a border */}
      <path
        d="M 7 40 L 7 17 L 17 7 L 40 7"
        stroke="#1e293b"
        strokeWidth="1"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      {/* Fastener across the chamfer */}
      <rect
        x="10.5"
        y="10.5"
        width="2"
        height="2"
        fill="#3B82F6"
        opacity="0.7"
      />
      {/* Stencil ticks along the run */}
      <path
        d="M 1 50 L 5 50 M 1 44 L 5 44 M 50 1 L 50 5 M 44 1 L 44 5"
        stroke="#3B82F6"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * The live altitude figure. Isolated into its own component so that the one
 * piece of the canopy that legitimately re-renders does not drag the frame,
 * the rails and the vignette along with it.
 */
const AltitudeReadout = React.memo(
  ({ progress }: { progress: MotionValue<number> }) => {
    const [alt, setAlt] = React.useState(ALT_CEILING);

    React.useEffect(() => {
      let last = ALT_CEILING;
      const unsubscribe = progress.on("change", (p) => {
        // Quantise to the rendered precision: without this the readout sets
        // state on every animation frame of every scroll.
        const clamped = Math.min(1, Math.max(0, p));
        const next = Math.round(((1 - clamped) * ALT_CEILING) / 500) * 500;
        if (next !== last) {
          last = next;
          setAlt(next);
        }
      });
      return () => unsubscribe();
    }, [progress]);

    return (
      <span className="font-mono text-[8px] tracking-widest text-[#F97316] tabular-nums">
        {alt.toLocaleString("en-US")}
      </span>
    );
  },
);
AltitudeReadout.displayName = "AltitudeReadout";

/**
 * A graduated ladder down one edge with a marker riding the scroll position.
 * The ladder is static and the marker is a pure motion value, so scrolling
 * moves it without a single React render.
 */
function AltitudeRail({
  side,
  progress,
  labelled,
}: {
  side: "left" | "right";
  progress: MotionValue<number>;
  labelled: boolean;
}) {
  const top = useTransform(progress, [0, 1], ["0%", "100%"]);
  const isLeft = side === "left";
  const spine = isLeft ? "left-5" : "right-5";

  const majorIndices = Array.from({ length: RAIL_TICKS }, (_, i) => i).filter(
    (i) => i % MAJOR_EVERY === 0,
  );

  return (
    <div
      className={`absolute top-24 bottom-24 w-14 ${isLeft ? "left-0" : "right-0"}`}
      aria-hidden="true"
    >
      {/* Spine */}
      <div className={`absolute inset-y-0 w-px bg-[#3B82F6]/20 ${spine}`} />

      {Array.from({ length: RAIL_TICKS }).map((_, i) => (
        <div
          key={i}
          // Anchoring each tick to the spine edge makes both ladders grow
          // inward from their own side, so they mirror exactly.
          className={`absolute h-px ${spine} ${
            i % MAJOR_EVERY === 0
              ? "w-3 bg-[#3B82F6]/40"
              : "w-1.5 bg-[#3B82F6]/20"
          }`}
          style={{ top: `${(i / (RAIL_TICKS - 1)) * 100}%` }}
        />
      ))}

      {/* Scale labels, only on the ladder that carries numbers */}
      {labelled &&
        majorIndices.map((i) => (
          <span
            key={i}
            className="absolute left-9 hidden -translate-y-1/2 font-mono text-[7px] tracking-widest text-slate-600 md:block"
            style={{ top: `${(i / (RAIL_TICKS - 1)) * 100}%` }}
          >
            {Math.round(
              ((RAIL_TICKS - 1 - i) / (RAIL_TICKS - 1)) * (ALT_CEILING / 1000),
            )}
            K
          </span>
        ))}

      {/* Scroll marker */}
      <motion.div
        style={{ top }}
        className={`absolute flex -translate-y-1/2 items-center gap-1 ${
          isLeft ? "left-2 flex-row" : "right-2 flex-row-reverse"
        }`}
      >
        <div className="h-[5px] w-[5px] bg-[#F97316]" />
        <div className="h-px w-5 bg-[#F97316]/70" />
        {isLeft && labelled ? (
          <div className="hidden md:block">
            <AltitudeReadout progress={progress} />
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

const CockpitCanopy = React.memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();

  const progress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 120,
    restDelta: 0.0005,
  });

  // Fast scroll pushes the frame brighter, the way a real HUD gains contrast
  // under load. Driven entirely through motion values - no state, no renders.
  const velocity = useSpring(useVelocity(scrollY), {
    damping: 50,
    stiffness: 300,
  });
  const chromeOpacity = useTransform(velocity, [-3000, 0, 3000], [1, 0.62, 1], {
    clamp: true,
  });

  const hullTick = prefersReducedMotion
    ? undefined
    : { x: [0, 1, -1.5, 0.5, 0], y: [0, -1, 0.5, -1.5, 0] };

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Frame chrome. The hull tick is a sub-pixel drift that keeps the glass
          from looking painted on; the whole group moves as one plate. */}
      <motion.div
        className="absolute inset-4 md:inset-6"
        style={{ opacity: chromeOpacity }}
        animate={hullTick}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 11, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* Gutter. A CSS border stays exactly 1px on every viewport. */}
        <div className="absolute inset-2 border border-slate-800/40" />

        {(Object.keys(CORNER_TRANSFORMS) as CornerKey[]).map((corner) => (
          <CornerBracket key={corner} corner={corner} />
        ))}

        <AltitudeRail side="left" progress={progress} labelled />
        <AltitudeRail side="right" progress={progress} labelled={false} />

        {/* Centre chevrons: fixed-pixel boxes, so they stay square. */}
        <svg
          width="18"
          height="8"
          viewBox="0 0 18 8"
          className="absolute top-0 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <polyline
            points="1,1 9,7 17,1"
            stroke="#3B82F6"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <svg
          width="18"
          height="8"
          viewBox="0 0 18 8"
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <polyline
            points="1,7 9,1 17,7"
            stroke="#3B82F6"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </motion.div>

      {/* Scanline drift is a CSS keyframe - see globals.css. A JS timer writing
          state here would repaint the entire overlay dozens of times a second. */}
      <div
        className="hud-scanlines absolute inset-0 opacity-25"
        style={{
          background:
            "linear-gradient(rgba(2,6,23,0) 50%, rgba(2,6,23,0.35) 50%)",
          backgroundSize: "100% 3px",
        }}
      />

      {/* Chromatic edges: lens artifact, not a glow. */}
      <div
        className="absolute inset-y-0 left-0 w-2"
        style={{
          background:
            "linear-gradient(to right, rgba(59,130,246,0.06) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-2"
        style={{
          background:
            "linear-gradient(to left, rgba(249,115,22,0.06) 0%, transparent 100%)",
        }}
      />

      {/* Vignette. The one permitted soft gradient: it is a lens artifact. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(2,6,23,0.55) 100%)",
        }}
      />
    </div>
  );
});

CockpitCanopy.displayName = "CockpitCanopy";

export default CockpitCanopy;
