"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  axisFrom,
  circlePoints,
  deg,
  projectCircle,
  wireframe,
} from "@/lib/sphere";
import { navTarget, type LaunchStage } from "@/lib/data/bootSequence";

/**
 * The spinning navigation globe on the boot screen.
 *
 * Built on the same projection as the page's planets, but the meridians spin,
 * so their paths are recomputed every frame. That happens in a rAF loop that
 * writes straight to the `d` attributes through refs; React never re-renders
 * for it. The cage assembles one meridian at a time while the self test runs,
 * then brackets close on a target and the spin winds up for the jump.
 *
 * Stroke widths are viewBox units (200 across), not non-scaling: the globe is
 * never drawn small enough for them to vanish, and `pathLength` is not used.
 */

interface NavGlobeProps {
  progress: number;
  stage: LaunchStage["id"];
}

const R = 54;
const MERIDIANS = 12;
const SAMPLES = 72;
const AXIS = axisFrom(-18, 22);

/** Meridians are all drawn by the time the self test resolves. */
const POST_END = 60;

/** Spin rate per stage, radians per second. */
const SPIN: Record<LaunchStage["id"], number> = {
  post: 0.45,
  nav: 0.18,
  ignition: 1.4,
  warp: 4.2,
};

const BLUE = "#3B82F6";
const ORANGE = "#F97316";

/** A satellite orbit, tipped off the globe's axis so it crosses the disc. */
const ORBIT = projectCircle(
  circlePoints({ normal: axisFrom(38, 58), distance: 1.42, samples: 160 }),
  R,
  "occlusion",
);

/** Where on the disc the target sits, and where its brackets close to. */
const TARGET = { x: 16, y: -14 };
const LOCK = 9;
const LOOSE = 26;

function Bracket({
  corner,
  locked,
}: {
  corner: 0 | 1 | 2 | 3;
  locked: boolean;
}) {
  const sx = corner === 0 || corner === 3 ? -1 : 1;
  const sy = corner < 2 ? -1 : 1;
  const d = locked ? LOCK : LOOSE;

  return (
    <motion.path
      d={`M ${sx * 5} 0 H 0 V ${sy * 5}`}
      fill="none"
      strokeWidth={0.7}
      initial={false}
      animate={{
        x: TARGET.x + sx * d,
        y: TARGET.y + sy * d,
        stroke: locked ? ORANGE : "#475569",
      }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
    />
  );
}

export default function NavGlobe({ progress, stage }: NavGlobeProps) {
  const front = useRef<SVGPathElement>(null);
  const back = useRef<SVGPathElement>(null);
  const heading = useRef<SVGTextElement>(null);

  // The loop reads these; prop changes never restart it.
  const drawn = useRef(1);
  const rate = useRef(SPIN.post);
  useEffect(() => {
    drawn.current = Math.max(
      1,
      Math.min(MERIDIANS, Math.ceil((progress / POST_END) * MERIDIANS)),
    );
  }, [progress]);
  useEffect(() => {
    rate.current = SPIN[stage];
  }, [stage]);

  // Parallels do not change as the globe spins about its own axis.
  const parallels = useMemo(
    () => wireframe({ axis: AXIS, radius: R, meridians: 0, parallels: 7 }),
    [],
  );
  const equator = useMemo(
    () => projectCircle(circlePoints({ normal: AXIS, samples: 160 }), R),
    [],
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let spin = 0;
    let speed = rate.current;
    let last = performance.now();
    let frame = 0;
    let count = 0;

    const draw = () => {
      const cage = wireframe({
        axis: AXIS,
        radius: R,
        meridians: MERIDIANS,
        parallels: 0,
        samples: SAMPLES,
        spin,
        drawn: reduce ? MERIDIANS : drawn.current,
      });
      front.current?.setAttribute("d", cage.front);
      back.current?.setAttribute("d", cage.back);
    };

    if (reduce) {
      draw();
      return;
    }

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Eased toward the stage's rate, so the wind-up to warp is felt.
      speed += (rate.current - speed) * Math.min(1, dt * 2.5);
      spin = (spin + speed * dt) % (Math.PI * 2);
      draw();

      // The heading readout only needs a few updates a second.
      if (++count % 8 === 0 && heading.current) {
        const hdg = ((spin / deg(1)) % 360).toFixed(1).padStart(5, "0");
        heading.current.textContent = `HDG ${hdg}°`;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, []);

  const locked = stage !== "post";
  const hot = stage === "ignition" || stage === "warp";
  const hidden = ORBIT.hiddenRange;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-full h-full overflow-visible"
      fill="none"
      aria-hidden="true"
    >
      {/* Compass ring: 5° ticks, a label every 30°, turning slowly. */}
      <g>
        <circle r={95} stroke="#1E293B" strokeWidth={0.4} />
        {Array.from({ length: 72 }, (_, i) => {
          const major = i % 6 === 0;
          return (
            <line
              key={i}
              y1={-95}
              y2={major ? -88 : -91.5}
              stroke={major ? "#64748B" : "#334155"}
              strokeWidth={major ? 0.6 : 0.4}
              transform={`rotate(${i * 5})`}
            />
          );
        })}
        {Array.from({ length: 12 }, (_, i) => (
          <text
            key={i}
            transform={`rotate(${i * 30}) translate(0 -82)`}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={4.2}
            fill="#475569"
            className="font-mono"
          >
            {String(i * 30).padStart(3, "0")}
          </text>
        ))}
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0"
          to="360"
          dur="120s"
          repeatCount="indefinite"
        />
      </g>

      {/* Counter-rotating scan arc. */}
      <g>
        <circle
          r={71}
          stroke={hot ? ORANGE : BLUE}
          strokeOpacity={0.55}
          strokeWidth={0.6}
          strokeDasharray="46 10 4 10 18 24"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="360"
          to="0"
          dur={hot ? "6s" : "22s"}
          repeatCount="indefinite"
        />
      </g>

      {/* Orbit, far half: behind the disc. */}
      <path
        d={ORBIT.back}
        stroke="#334155"
        strokeWidth={0.45}
        strokeDasharray="1 2"
      />

      {/* Globe */}
      <circle r={R} fill="#020617" />
      <path
        ref={back}
        stroke="#334155"
        strokeWidth={0.4}
        strokeDasharray="1 1.6"
      />
      <path d={parallels.back} stroke="#1E293B" strokeWidth={0.4} />
      <path d={parallels.front} stroke="#475569" strokeWidth={0.45} />
      <path ref={front} stroke={BLUE} strokeWidth={0.6} strokeOpacity={0.9} />
      <path
        d={equator.front}
        stroke={hot ? ORANGE : BLUE}
        strokeWidth={0.9}
      />
      <circle r={R} stroke="#94A3B8" strokeWidth={0.8} />
      {/* Halo: a wide faint stroke, not a filter — filters stall the SMIL. */}
      <circle
        r={R + 2}
        stroke={hot ? ORANGE : BLUE}
        strokeOpacity={0.12}
        strokeWidth={4}
      />

      {/* Orbit, near half, and the satellite riding it. */}
      <path d={ORBIT.front} stroke="#64748B" strokeWidth={0.55} />
      <rect x={-1.4} y={-1.4} width={2.8} height={2.8} fill="#020617" stroke="#E2E8F0" strokeWidth={0.6}>
        <animateMotion dur="9s" repeatCount="indefinite" path={ORBIT.full} />
        {hidden && (
          <animate
            attributeName="opacity"
            calcMode="discrete"
            values="1;0;0;1"
            keyTimes={`0;${hidden[0].toFixed(3)};${hidden[1].toFixed(3)};1`}
            dur="9s"
            repeatCount="indefinite"
          />
        )}
      </rect>

      {/* Target lock. The callout runs out above the compass ring so the
          coordinates never sit on the disc. */}
      <g>
        {([0, 1, 2, 3] as const).map((c) => (
          <Bracket key={c} corner={c} locked={locked} />
        ))}
        <motion.g
          initial={false}
          animate={{ opacity: locked ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <rect
            x={TARGET.x - 1}
            y={TARGET.y - 1}
            width={2}
            height={2}
            fill={ORANGE}
          />
          <path
            d={`M ${TARGET.x + LOCK} ${TARGET.y - LOCK} L 46 -104 H 100`}
            stroke={ORANGE}
            strokeWidth={0.45}
          />
          <text
            x={100}
            y={-115}
            textAnchor="end"
            fontSize={5}
            fill={ORANGE}
            className="font-mono"
            letterSpacing={0.6}
          >
            {`TGT · ${navTarget.name}`}
          </text>
          <text
            x={100}
            y={-108}
            textAnchor="end"
            fontSize={3.8}
            fill="#94A3B8"
            className="font-mono"
            letterSpacing={0.4}
          >
            {`RA ${navTarget.ra} · DEC ${navTarget.dec}`}
          </text>
        </motion.g>
      </g>

      {/* Heading, written by the spin loop. */}
      <text
        ref={heading}
        x={0}
        y={104}
        textAnchor="middle"
        fontSize={4.4}
        fill="#64748B"
        className="font-mono"
        letterSpacing={0.8}
      >
        HDG 000.0°
      </text>
    </svg>
  );
}
