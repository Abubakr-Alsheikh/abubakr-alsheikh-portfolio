"use client";

import { useId, useMemo } from "react";
import {
  axisFrom,
  circlePoints,
  projectCircle,
  type Vec3,
} from "@/lib/sphere";
import { planetNotes } from "@/lib/data/planets";
import PlanetCallout from "./PlanetCallout";
import { useSmilPause } from "@/hooks/useSmilPause";
import { useOffscreen } from "@/hooks/useOffscreen";
import { flowStyle } from "@/lib/flow";

/**
 * A black hole, drawn the way the planets are: projected line work, no blur.
 *
 * What makes it read as a black hole rather than a ringed planet:
 *
 *  - The shadow is filled with the page background, so it swallows the
 *    starfield behind it. It is a hole in the sky, not a dark ball.
 *  - Gravitational lensing. Light from the far side of the accretion disk
 *    bends around the hole, so the disk appears twice more: once arched over
 *    the top of the shadow, once as a thin ring hugging its underside. Those
 *    images are approximations (an ellipse per disk ring, sized by radius),
 *    but they meet the direct image where the real ones do, at the disk's
 *    left and right extremes.
 *  - Doppler beaming. The side of the disk turning toward the viewer is
 *    brighter than the side turning away, done with a stroke gradient across
 *    the disk rather than a glow.
 *  - Keplerian flow. Inner rings orbit faster (period ∝ r^1.5), and matter
 *    spirals in and vanishes at the horizon.
 *
 * No filters, per the rule on animated SVGs; the geometry is computed once.
 *
 * Layers. The hole spans ~2000px and an SVG repaints as one piece: while
 * anything in it moved, Chrome re-rastered all of its line work every frame,
 * which alone held the contact section near 50fps in profiling. So it is
 * three layers:
 *
 *  1. Spinning rings (lensing field, dashed ring by the photon ring), each its
 *     own small SVG turned by a CSS rotation. Composited, never repainted.
 *  2. The static body: lensed images, shadow, photon ring, still disk rings
 *     and the callout. Promoted to its own layer and rastered once.
 *  3. The live overlay: only the flowing disk rings (stepped CSS, see
 *     src/lib/flow.ts) and the infalling matter (SMIL), paused off screen.
 *
 * Moving dashes on rings this size repaint them whatever drives them; the
 * stepping is what keeps that affordable.
 */

const R = 13;
/** Disk normal. Lean is the disk's elevation: small, so it is nearly edge on. */
const TILT = -6;
const LEAN = 5;
const AXIS = axisFrom(TILT, LEAN);

const INNER = 1.7;
const OUTER = 4.4;

const ORANGE = "#F97316";
const BLUE = "#3B82F6";
const BACKDROP = "#020617";

interface DiskLine {
  d: number;
  width: number;
  opacity: number;
  /** Dash pattern and orbit period for the few rings that visibly flow. */
  dash?: string;
  period?: number;
}

/** Dense bright inner disk, a gap, then a sparser outer disk. */
const DISK: DiskLine[] = [
  ...Array.from({ length: 12 }, (_, i) => {
    const d = INNER + i * 0.08;
    return { d, width: i === 0 ? 1.6 : 0.8, opacity: 0.95 - i * 0.03 };
  }),
  ...Array.from({ length: 11 }, (_, i) => {
    const d = 2.75 + i * 0.15;
    return { d, width: 0.6, opacity: 0.6 - i * 0.04 };
  }),
].map((line, i) =>
  i % 4 === 1
    ? { ...line, dash: "6 3 1 3", period: 6 * Math.pow(line.d / INNER, 1.5) }
    : line,
);

/** Lensed image arched over the shadow, for a disk ring at distance `d`. */
const lensTop = (d: number) => {
  const rx = d * R;
  const ry = R * (1.03 + (d - INNER) * 0.3);
  return `M ${-rx} 0 A ${rx} ${ry} 0 0 1 ${rx} 0`;
};

/** Secondary image: a thin ring pressed against the underside of the shadow. */
const lensUnder = (d: number) => {
  const rx = R * (1.1 + (d - INNER) * 0.3);
  const ry = R * (1.03 + (d - INNER) * 0.1);
  return `M ${-rx} 0 A ${rx} ${ry} 0 0 0 ${rx} 0`;
};

/** The viewBox: 200 x 100 units, centred on the hole. */
const VIEW_W = 200;
const VIEW_H = 100;

interface SpinRingSpec {
  r: number;
  strokeOpacity: number;
  strokeWidth: number;
  dash: string;
  /** hud-spin turns clockwise, hud-spin-rev counter-clockwise. */
  spin: string;
}

const SPIN_RINGS: SpinRingSpec[] = [
  // Lensed background field: faint rings the light is being bent along.
  { r: R * 3.4, strokeOpacity: 0.22, strokeWidth: 0.8, dash: "0.6 3", spin: "hud-spin [--hud-dur:140s]" },
  { r: R * 5.4, strokeOpacity: 0.14, strokeWidth: 0.8, dash: "0.4 5", spin: "hud-spin-rev [--hud-dur:220s]" },
  // Just outside the photon ring.
  { r: R * 1.13, strokeOpacity: 0.5, strokeWidth: 0.7, dash: "2 1.5 0.5 1.5", spin: "hud-spin-rev [--hud-dur:30s]" },
];

/**
 * One ring in its own square SVG, centred on the hole and turned by CSS. The
 * box is sized in percent of the 2:1 wrapper so its units match the main
 * viewBox exactly. A rotating layer is composited, so it never repaints.
 */
function SpinRing({ ring }: { ring: SpinRingSpec }) {
  const side = 2 * ring.r + 4;
  return (
    <div
      className={`absolute aspect-square ${ring.spin}`}
      style={{
        width: `${(side / VIEW_W) * 100}%`,
        left: `${50 - (side / VIEW_W) * 50}%`,
        top: `${50 - (side / VIEW_H) * 50}%`,
      }}
    >
      <svg
        viewBox={`${-side / 2} ${-side / 2} ${side} ${side}`}
        className="w-full h-full overflow-visible"
        fill="none"
      >
        <circle
          r={ring.r}
          stroke={BLUE}
          strokeOpacity={ring.strokeOpacity}
          strokeWidth={ring.strokeWidth}
          strokeDasharray={ring.dash}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/** Approaching side bright, receding side dim. userSpaceOnUse so every ring
 *  shares one sweep instead of each getting its own. */
function DopplerGradient({ id }: { id: string }) {
  return (
    <linearGradient
      id={id}
      gradientUnits="userSpaceOnUse"
      x1={-OUTER * R}
      y1={0}
      x2={OUTER * R}
      y2={0}
      gradientTransform={`rotate(${-TILT})`}
    >
      <stop offset="0" stopColor={ORANGE} stopOpacity="1" />
      <stop offset="0.5" stopColor={ORANGE} stopOpacity="0.6" />
      <stop offset="1" stopColor={ORANGE} stopOpacity="0.16" />
    </linearGradient>
  );
}

type FlowingLine = DiskLine & { dash: string; period: number };
const isFlowing = (line: DiskLine): line is FlowingLine =>
  !!(line.dash && line.period);

const dashPeriod = (dash: string) =>
  dash.split(/\s+/).reduce((sum, n) => sum + Number(n), 0);

// ---- Infalling matter ------------------------------------------------------

const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a.x, a.y, a.z);
  return { x: a.x / l, y: a.y / l, z: a.z / l };
};

interface Infall {
  path: string;
  /** Discrete opacity track: hidden behind the shadow, and gone at the end. */
  values: string;
  keyTimes: string;
  dur: number;
  begin: number;
}

/**
 * A spiral in the disk plane from the outer edge to just outside the
 * horizon, with an opacity track that blinks the particle out wherever it
 * passes behind the shadow.
 */
function infall(start: number, turns: number, dur: number, begin: number): Infall {
  const u = norm(cross(AXIS, { x: 0, y: 0, z: 1 }));
  const v = cross(AXIS, u);
  const samples = 220;
  const pts: { x: number; y: number; hidden: boolean }[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    // Slow at the rim, fast near the horizon, like a real inspiral.
    const r = OUTER - (OUTER - 1.04) * Math.pow(t, 0.7);
    const a = start + t * turns * Math.PI * 2;
    const p = {
      x: (u.x * Math.cos(a) + v.x * Math.sin(a)) * r,
      y: (u.y * Math.cos(a) + v.y * Math.sin(a)) * r,
      z: (u.z * Math.cos(a) + v.z * Math.sin(a)) * r,
    };
    pts.push({
      x: p.x * R,
      y: -p.y * R,
      hidden: p.z < 0 && p.x * p.x + p.y * p.y < 1,
    });
  }

  const lengths = [0];
  for (let i = 1; i < pts.length; i++) {
    lengths.push(
      lengths[i - 1] +
        Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y),
    );
  }
  const total = lengths[lengths.length - 1];

  const values: number[] = [pts[0].hidden ? 0 : 1];
  const times: number[] = [0];
  const END = 0.985;
  for (let i = 1; i < pts.length; i++) {
    // keyTimes must rise strictly, and nothing may land after the swallow.
    if (lengths[i] / total >= END) break;
    if (pts[i].hidden !== pts[i - 1].hidden) {
      values.push(pts[i].hidden ? 0 : 1);
      times.push(lengths[i] / total);
    }
  }
  // Swallowed: off for the last sliver so the loop never shows a pop.
  values.push(0);
  times.push(END);

  return {
    path: pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" "),
    values: values.join(";"),
    keyTimes: times.map((t) => t.toFixed(4)).join(";"),
    dur,
    begin,
  };
}

const INFALL: Infall[] = [
  infall(0.3, 1.6, 9, 0),
  infall(2.1, 1.4, 11, -4),
  infall(4.0, 1.8, 10, -7),
  infall(5.2, 1.5, 12, -2),
  infall(1.2, 1.7, 13, -9),
];

// ---------------------------------------------------------------------------

export default function GeometricBlackHole({
  intensity = 1,
}: {
  /**
   * Scales the disk and lensed light, never the shadow: dimming the whole SVG
   * would make the shadow see-through, and a hole you can see stars through
   * is no longer a hole.
   */
  intensity?: number;
}) {
  const svgRef = useSmilPause();
  const { ref: wrapRef, offscreen } = useOffscreen();
  const uid = useId().replace(/:/g, "");
  const doppler = `bh-doppler-${uid}`;
  const dopplerLive = `bh-doppler-live-${uid}`;

  const disk = useMemo(
    () =>
      DISK.map((line) =>
        projectCircle(
          circlePoints({ normal: AXIS, distance: line.d, samples: 240 }),
          R,
          "occlusion",
        ),
      ),
    [],
  );

  return (
    <div
      ref={wrapRef}
      data-offscreen={offscreen || undefined}
      className="relative w-full h-full"
      aria-hidden="true"
    >
      {/* 1. Spinning rings, under the body so the disk crosses over them. */}
      {SPIN_RINGS.map((ring) => (
        <SpinRing key={ring.r} ring={ring} />
      ))}

      {/* 2. Static body, rastered once. */}
      <svg
        viewBox="-100 -50 200 100"
        className="absolute inset-0 w-full h-full overflow-visible will-change-transform"
        fill="none"
      >
        <defs>
          <DopplerGradient id={doppler} />
        </defs>

        <g transform={`rotate(${-TILT})`} opacity={intensity}>
          {/* Secondary image, under the shadow. */}
          {DISK.filter((_, i) => i % 3 === 0).map((line) => (
            <path
              key={`under-${line.d}`}
              d={lensUnder(line.d)}
              stroke={`url(#${doppler})`}
              strokeWidth={0.7}
              opacity={0.6}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Primary lensed image: the far disk, arched over the top. */}
          {DISK.filter((line) => !isFlowing(line)).map((line) => (
            <path
              key={`top-${line.d}`}
              d={lensTop(line.d)}
              stroke={`url(#${doppler})`}
              strokeWidth={line.width}
              opacity={line.opacity}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        {/* The shadow. Page background, so the stars behind it are gone. */}
        <circle r={R} fill={BACKDROP} />

        {/* Photon ring: light on the last orbit before the horizon. */}
        <circle
          r={R * 1.035}
          stroke={BLUE}
          strokeWidth={1.3}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          r={R * 1.035}
          stroke={BLUE}
          strokeOpacity={0.14}
          strokeWidth={6}
          vectorEffect="non-scaling-stroke"
        />

        {/* Direct image of the disk: near side crosses in front of the shadow,
            far side is hidden only where the shadow actually covers it. */}
        {disk.map((geo, i) => {
          const line = DISK[i];
          return geo.front && !isFlowing(line) ? (
            <path
              key={`disk-${line.d}`}
              d={geo.front}
              stroke={`url(#${doppler})`}
              strokeWidth={line.width}
              opacity={line.opacity * intensity}
              vectorEffect="non-scaling-stroke"
            />
          ) : null;
        })}

        {/* Below and right of the shadow, clear of the contact form. */}
        <PlanetCallout
          note={planetNotes.blackHole}
          radius={R}
          angleDeg={60}
          reach={9}
          run={22}
          size={0.82}
        />
      </svg>

      {/* 3. Live overlay: flowing rings and infalling matter only. */}
      <svg
        ref={svgRef}
        viewBox="-100 -50 200 100"
        className="absolute inset-0 w-full h-full overflow-visible will-change-transform"
        fill="none"
      >
        <defs>
          <DopplerGradient id={dopplerLive} />
        </defs>

        <g transform={`rotate(${-TILT})`} opacity={intensity}>
          {DISK.filter(isFlowing).map((line) => (
            <path
              key={`top-${line.d}`}
              d={lensTop(line.d)}
              stroke={`url(#${dopplerLive})`}
              strokeWidth={line.width}
              opacity={line.opacity}
              strokeDasharray={line.dash}
              vectorEffect="non-scaling-stroke"
              className="hud-flow-stepped"
              style={flowStyle(dashPeriod(line.dash), line.period, false)}
            />
          ))}
        </g>

        {disk.map((geo, i) => {
          const line = DISK[i];
          return geo.front && isFlowing(line) ? (
            <path
              key={`disk-${line.d}`}
              d={geo.front}
              stroke={`url(#${dopplerLive})`}
              strokeWidth={line.width}
              opacity={line.opacity * intensity}
              strokeDasharray={line.dash}
              vectorEffect="non-scaling-stroke"
              className="hud-flow-stepped"
              style={flowStyle(dashPeriod(line.dash), line.period, true)}
            />
          ) : null;
        })}

        {/* Infalling matter. */}
        {INFALL.map((p, i) => (
          <rect
            key={i}
            x={-0.3}
            y={-0.3}
            width={0.6}
            height={0.6}
            fill={i % 2 ? "#E2E8F0" : ORANGE}
            opacity={0}
          >
            <animateMotion
              dur={`${p.dur}s`}
              begin={`${p.begin}s`}
              repeatCount="indefinite"
              path={p.path}
            />
            <animate
              attributeName="opacity"
              calcMode="discrete"
              values={p.values}
              keyTimes={p.keyTimes}
              dur={`${p.dur}s`}
              begin={`${p.begin}s`}
              repeatCount="indefinite"
            />
          </rect>
        ))}
      </svg>
    </div>
  );
}
