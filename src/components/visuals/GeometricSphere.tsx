"use client";

import React from "react";
import {
  annulusNearHalf,
  axisFrom,
  circlePoints,
  flatten,
  lightOffset,
  projectCircle,
  silhouette,
  wireframe,
  type Vec3,
} from "@/lib/sphere";
import { flowStyle } from "@/lib/flow";

/**
 * A projected wireframe planet.
 *
 * Every curve is real geometry from `@/lib/sphere` — meridians converge at the
 * poles, parallels foreshorten toward the limb, the body can be oblate, rings
 * pass behind the disc and in front of it, and moons blink out while they are
 * behind the planet.
 *
 * Stroke widths are SCREEN pixels: every stroke is `non-scaling-stroke`, so a
 * width of 0.35 is a third of a pixel and antialiases to almost nothing. That
 * was why the first version of these planets barely showed.
 *
 * The planet's own spin is deliberately static. Rotating the sphere reshapes
 * every meridian, which SMIL cannot interpolate across mismatched point counts
 * and React should not re-render per frame. Motion comes from ring material
 * flowing and moons orbiting, which a static cage can carry honestly.
 */

export interface SphereRing {
  /** Distance from the centre, in equatorial radii. Must exceed 1 to clear the disc. */
  distance: number;
  tiltDeg: number;
  leanDeg: number;
  width?: number;
  dash?: string;
  /** Seconds for the ring material to flow one dash cycle. Omit to hold still. */
  flowSeconds?: number;
  tone?: string;
  opacity?: number;
}

/**
 * A dense band of ringlets in the planet's own equatorial plane — the way
 * Saturn's A, B and C rings read: many fine concentric lines rather than one
 * stroke. Gaps between bands are simply the space between their ranges.
 */
export interface RingBand {
  from: number;
  to: number;
  lines: number;
  opacity: number;
  width?: number;
  tone?: string;
}

export interface SphereMoon {
  /** Which ring the moon rides. */
  ring: number;
  /** Seconds for one orbit. */
  periodSeconds: number;
  size?: number;
  tone?: string;
}

export interface GeometricSphereProps {
  /** Unique per instance: gradient ids are global in the document. */
  id: string;
  radius: number;
  tiltDeg?: number;
  leanDeg?: number;
  /** Polar radius as a fraction of the equatorial one. Saturn is ~0.9. */
  polar?: number;
  meridians?: number;
  parallels?: number;
  /** Direction the light comes from, as screen-relative angles. */
  sunTiltDeg?: number;
  sunLeanDeg?: number;
  accent?: string;
  grid?: string;
  rings?: SphereRing[];
  bands?: RingBand[];
  moons?: SphereMoon[];
  /** Soft halo on the limb, drawn as a wide faint stroke rather than a filter. */
  glow?: boolean;
}

const BACKDROP = "#020617";

const GeometricSphere = React.memo(
  ({
    id,
    radius,
    tiltDeg = -18,
    leanDeg = 22,
    polar = 1,
    meridians = 12,
    parallels = 7,
    sunTiltDeg = 55,
    sunLeanDeg = 30,
    accent = "#3B82F6",
    grid = "#64748B",
    rings = [],
    bands = [],
    moons = [],
    glow = false,
  }: GeometricSphereProps) => {
    const axis = React.useMemo(
      () => axisFrom(tiltDeg, leanDeg),
      [tiltDeg, leanDeg],
    );

    const sun: Vec3 = React.useMemo(
      () => axisFrom(sunTiltDeg, sunLeanDeg),
      [sunTiltDeg, sunLeanDeg],
    );

    const outline = React.useMemo(
      () => silhouette(axis, polar),
      [axis, polar],
    );

    const cage = React.useMemo(
      () => wireframe({ axis, radius, meridians, parallels, polar }),
      [axis, radius, meridians, parallels, polar],
    );

    // The terminator is the great circle whose normal points at the light,
    // squashed with the body so it stays on the surface of an oblate planet.
    const terminator = React.useMemo(
      () =>
        projectCircle(
          circlePoints({ normal: sun, samples: 200 }).map((p) =>
            flatten(p, axis, polar),
          ),
          radius,
        ),
      [sun, axis, polar, radius],
    );

    const ringGeometry = React.useMemo(
      () =>
        rings.map((ring) =>
          projectCircle(
            circlePoints({
              normal: axisFrom(ring.tiltDeg, ring.leanDeg),
              distance: ring.distance,
              samples: 240,
            }),
            radius,
            "occlusion",
            outline,
          ),
        ),
      [rings, radius, outline],
    );

    // Every ringlet of every band, each split against the body's outline.
    const bandGeometry = React.useMemo(
      () =>
        bands.map((band) => {
          const lines = Array.from({ length: band.lines }, (_, i) => {
            const t = band.lines === 1 ? 0.5 : i / (band.lines - 1);
            return projectCircle(
              circlePoints({
                normal: axis,
                distance: band.from + (band.to - band.from) * t,
                samples: 220,
              }),
              radius,
              "occlusion",
              outline,
            );
          });
          return {
            front: lines.map((l) => l.front).join(" "),
            back: lines.map((l) => l.back).join(" "),
          };
        }),
      [bands, axis, radius, outline],
    );

    // One fill covering the near half of every band, used to cut the cage
    // where the rings cross in front of the disc.
    const bandShadow = React.useMemo(() => {
      if (bands.length === 0) return "";
      const inner = Math.min(...bands.map((b) => b.from));
      const outer = Math.max(...bands.map((b) => b.to));
      return annulusNearHalf(axis, inner, outer, radius);
    }, [bands, axis, radius]);

    const light = lightOffset(sun);
    const body = {
      rx: radius * outline.rx,
      ry: radius * outline.ry,
      transform: `rotate(${outline.rotateDeg.toFixed(2)})`,
    };

    return (
      <g>
        <defs>
          {/* Night side. The focus is pushed away from the light, so the disc
              darkens across the terminator instead of vignetting evenly. */}
          <radialGradient
            id={`${id}-night`}
            cx="50%"
            cy="50%"
            r="72%"
            fx={`${50 - light.x * 42}%`}
            fy={`${50 - light.y * 42}%`}
          >
            <stop offset="0%" stopColor={BACKDROP} stopOpacity="0.85" />
            <stop offset="55%" stopColor={BACKDROP} stopOpacity="0.35" />
            <stop offset="100%" stopColor={BACKDROP} stopOpacity="0" />
          </radialGradient>

          {/* Lit hemisphere. */}
          <radialGradient
            id={`${id}-limb`}
            cx="50%"
            cy="50%"
            r="60%"
            fx={`${50 + light.x * 38}%`}
            fy={`${50 + light.y * 38}%`}
          >
            <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ---- Behind the body ---- */}

        {bandGeometry.map((geo, i) =>
          geo.back ? (
            <path
              key={`band-back-${i}`}
              d={geo.back}
              fill="none"
              stroke={bands[i].tone ?? accent}
              strokeWidth={(bands[i].width ?? 0.7) * 0.8}
              opacity={bands[i].opacity * 0.3}
              vectorEffect="non-scaling-stroke"
            />
          ) : null,
        )}

        {ringGeometry.map((geo, i) =>
          geo.back ? (
            <path
              key={`ring-back-${i}`}
              d={geo.back}
              fill="none"
              stroke={rings[i].tone ?? accent}
              strokeWidth={(rings[i].width ?? 0.9) * 0.8}
              strokeDasharray={rings[i].dash}
              opacity={(rings[i].opacity ?? 0.85) * 0.3}
              vectorEffect="non-scaling-stroke"
            />
          ) : null,
        )}

        {moons.map((moon, i) => {
          const geo = ringGeometry[moon.ring];
          if (!geo) return null;
          return (
            <MoonNode
              key={`moon-back-${i}`}
              path={geo.full}
              hiddenRange={geo.hiddenRange}
              moon={moon}
              accent={accent}
              behind
            />
          );
        })}

        {/* ---- The body ---- */}

        <ellipse
          rx={body.rx}
          ry={body.ry}
          transform={body.transform}
          fill={`url(#${id}-limb)`}
        />

        {/* Far side of the cage: still drawn, because the planet reads as a
            wireframe, but dashed and dim so the near side stays legible. */}
        <path
          d={cage.back}
          fill="none"
          stroke={grid}
          strokeWidth="0.6"
          strokeDasharray="2 4"
          opacity="0.35"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d={cage.front}
          fill="none"
          stroke={grid}
          strokeWidth="0.9"
          opacity="0.85"
          vectorEffect="non-scaling-stroke"
        />

        {/* Terminator: the near half is the visible day/night boundary. */}
        <path
          d={terminator.front}
          fill="none"
          stroke={accent}
          strokeWidth="1.2"
          opacity="0.9"
          vectorEffect="non-scaling-stroke"
        />

        <ellipse
          rx={body.rx}
          ry={body.ry}
          transform={body.transform}
          fill={`url(#${id}-night)`}
        />

        {/* Halo: a wide, faint stroke under the limb. An SVG blur filter
            looked the same but re-ran over the whole planet every frame the
            rings animated, and starved the starfield canvas of frame time. */}
        {glow ? (
          <ellipse
            rx={body.rx}
            ry={body.ry}
            transform={body.transform}
            fill="none"
            stroke={accent}
            strokeWidth="5"
            opacity="0.12"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        <ellipse
          rx={body.rx}
          ry={body.ry}
          transform={body.transform}
          fill="none"
          stroke={accent}
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />

        {/* ---- In front of the body ---- */}

        {/* Where the rings cross in front, they cut the planet behind them. */}
        {bandShadow ? (
          <path d={bandShadow} fill={BACKDROP} opacity="0.72" />
        ) : null}

        {bandGeometry.map((geo, i) =>
          geo.front ? (
            <path
              key={`band-front-${i}`}
              d={geo.front}
              fill="none"
              stroke={bands[i].tone ?? accent}
              strokeWidth={bands[i].width ?? 0.7}
              opacity={bands[i].opacity}
              vectorEffect="non-scaling-stroke"
            />
          ) : null,
        )}

        {ringGeometry.map((geo, i) => {
          const ring = rings[i];
          return geo.front ? (
            <path
              key={`ring-front-${i}`}
              d={geo.front}
              fill="none"
              stroke={ring.tone ?? accent}
              strokeWidth={ring.width ?? 0.9}
              strokeDasharray={ring.dash}
              opacity={ring.opacity ?? 0.85}
              vectorEffect="non-scaling-stroke"
              // Material flowing around the ring. Offsetting the dash is the
              // only rotation a circularly symmetric ring can actually show.
              // Stepped CSS, not SMIL: see src/lib/flow.ts.
              {...(ring.dash && ring.flowSeconds
                ? {
                    className: "hud-flow-stepped",
                    style: flowStyle(
                      dashPeriod(ring.dash),
                      ring.flowSeconds,
                      true,
                    ),
                  }
                : {})}
            />
          ) : null;
        })}

        {moons.map((moon, i) => {
          const geo = ringGeometry[moon.ring];
          if (!geo) return null;
          return (
            <MoonNode
              key={`moon-front-${i}`}
              path={geo.full}
              hiddenRange={geo.hiddenRange}
              moon={moon}
              accent={accent}
            />
          );
        })}
      </g>
    );
  },
);

GeometricSphere.displayName = "GeometricSphere";

/** One dash cycle, so the flow animation loops without a seam. */
function dashPeriod(dash: string): number {
  const parts = dash
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  if (parts.length === 0) return 0;
  const sum = parts.reduce((a, b) => a + b, 0);
  // An odd-length dash array repeats after two passes.
  return parts.length % 2 === 0 ? sum : sum * 2;
}

/**
 * A moon riding its ring.
 *
 * The same orbit is rendered twice — once beneath the planet and once above it
 * — and each copy blanks itself over the stretch of the orbit where it should
 * not be seen. `hiddenRange` is in arc length, which is how `animateMotion`
 * measures progress, so the swap happens exactly at the silhouette.
 */
function MoonNode({
  path,
  hiddenRange,
  moon,
  accent,
  behind = false,
}: {
  path: string;
  hiddenRange: [number, number] | null;
  moon: SphereMoon;
  accent: string;
  behind?: boolean;
}) {
  const size = moon.size ?? 1.6;
  const tone = moon.tone ?? accent;
  const dur = `${moon.periodSeconds}s`;

  // With no occluded stretch the orbit clears the planet entirely, so only the
  // front copy is needed.
  if (!hiddenRange) {
    if (behind) return null;
    return (
      <circle
        r={size}
        fill={BACKDROP}
        stroke={tone}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      >
        <animateMotion dur={dur} repeatCount="indefinite" path={path} />
      </circle>
    );
  }

  const [from, to] = hiddenRange;
  // Visible everywhere except the hidden stretch, or only within it.
  const values = behind ? "0;1;1;0" : "1;0;0;1";
  const keyTimes = `0;${clamp(from)};${clamp(to)};1`;

  return (
    <circle
      r={size}
      fill={BACKDROP}
      stroke={tone}
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
    >
      <animateMotion dur={dur} repeatCount="indefinite" path={path} />
      <animate
        attributeName="opacity"
        calcMode="discrete"
        values={values}
        keyTimes={keyTimes}
        dur={dur}
        repeatCount="indefinite"
      />
    </circle>
  );
}

const clamp = (n: number) => Math.min(0.999, Math.max(0.001, n)).toFixed(3);

export default GeometricSphere;
