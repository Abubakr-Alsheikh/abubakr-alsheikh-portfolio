"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import GeometricSphere from "./GeometricSphere";
import { axisFrom, circlePoints, flatten } from "@/lib/sphere";
import { planetNotes } from "@/lib/data/planets";
import { useSmilPause } from "@/hooks/useSmilPause";

/**
 * Hero: Saturn.
 *
 * Proportions are the real ones, in Saturn equatorial radii (Rs):
 *   C ring   1.24 - 1.53   faint, translucent
 *   B ring   1.53 - 1.95   the bright, dense one
 *   Cassini  1.95 - 2.03   the famous gap, left empty
 *   A ring   2.03 - 2.27   split by the Encke gap at ~2.21
 *   F ring   2.33          a narrow braided strand
 * The body is oblate (polar radius 0.9 of equatorial) and the axis leans toward
 * the viewer so the rings open up and cross in front of the disc.
 *
 * The inner moon is Mimas at 3.08 - its 2:1 resonance is what clears the
 * Cassini division. Enceladus rides further out at 3.95.
 *
 * The annotations are computed from the same geometry the planet is drawn
 * with, so the scale bar crosses the rings exactly where they are.
 */

// Shared by the body, every ring and the annotations: Saturn's rings lie in
// its equator.
const TILT = -20;
const LEAN = 24;
const POLAR = 0.9;
const RADIUS = 24;

/** Ring boundaries, for the ticks on the scale bar. */
const BOUNDARIES = [1.24, 1.53, 1.95, 2.03, 2.21, 2.27, 2.33];

/**
 * Labels riding the scale. `side` keeps the long names off the letters;
 * `lift` is the distance off the bar, and C sits higher because the inner end
 * of the bar dips toward the headline.
 */
const FEATURES: {
  d: number;
  label: string;
  side: 1 | -1;
  major: boolean;
  lift?: number;
}[] = [
  { d: 1.385, label: "C", side: 1, major: true, lift: 2.6 },
  { d: 1.74, label: "B", side: 1, major: true },
  { d: 1.99, label: "CASSINI", side: -1, major: false },
  { d: 2.12, label: "A", side: 1, major: true },
  { d: 2.21, label: "ENCKE", side: -1, major: false },
  { d: 2.33, label: "F", side: 1, major: true },
];

/**
 * A ~1px line at desktop widths, in SVG user units. Used where a stroke has to
 * scale with the SVG instead of being non-scaling (see `stroke` below).
 */
const HAIRLINE = 0.08;

/** SVG user units. At 1440px wide one unit is ~13px. */
const TEXT_MAJOR = 0.95;
const TEXT_MINOR = 0.62;
const TEXT_SPEC = 0.78;

interface ScreenPoint {
  x: number;
  y: number;
}

/**
 * Where the scale bar runs: the ring plane's leftmost direction, which is the
 * ring system's left tip ("ansa") on screen. Every ring shares the plane, so
 * each one's ansa is this direction scaled by its radius — the bar is a
 * straight radial line.
 */
function useScaleGeometry() {
  return React.useMemo(() => {
    const axis = axisFrom(TILT, LEAN);

    const unit = circlePoints({ normal: axis, distance: 1, samples: 720 });
    const ansa = unit.reduce((best, p) => (p.x < best.x ? p : best));

    // Screen direction from the centre toward the tip (SVG y points down).
    const dx = ansa.x;
    const dy = -ansa.y;
    const len = Math.hypot(dx, dy);
    const dir = { x: dx / len, y: dy / len };

    // Perpendicular that points up the screen, away from the headline.
    let perp = { x: -dir.y, y: dir.x };
    if (perp.y > 0) perp = { x: -perp.x, y: -perp.y };

    const at = (d: number, offset = 0): ScreenPoint => ({
      x: ansa.x * d * RADIUS + perp.x * offset,
      y: -ansa.y * d * RADIUS + perp.y * offset,
    });

    // Polar axis, squashed with the body so the pole markers sit on its limb.
    const pole = flatten(axis, axis, POLAR);
    const north: ScreenPoint = { x: pole.x * RADIUS, y: -pole.y * RADIUS };

    return { at, north };
  }, []);
}

const f2 = (n: number) => n.toFixed(2);
const line = (a: ScreenPoint, b: ScreenPoint) =>
  `M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;

function SaturnAnnotations({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion();
  const { at, north } = useScaleGeometry();

  const start = at(BOUNDARIES[0]);
  const end = at(BOUNDARIES[BOUNDARIES.length - 1]);
  // Spec block sits above and left of the F label, unrotated. It is anchored
  // to F rather than to the screen, so it moves with the planet at every width.
  const fLabel = at(2.33, 1.65);
  const spec = { x: fLabel.x - 1.2, y: fLabel.y - 4.3 };
  const spec2 = { x: spec.x, y: spec.y + 1.2 };
  const underline = spec2.y + 0.8;
  const tail = at(2.4);
  const south: ScreenPoint = { x: -north.x, y: -north.y };

  // Each piece fades in after the boot handover, inner to outer.
  const reveal = (i: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: ready ? 1 : 0 } }
      : {
          initial: { opacity: 0 },
          animate: { opacity: ready ? 1 : 0 },
          transition: { duration: 0.5, delay: ready ? 1.4 + i * 0.09 : 0 },
        };

  // Fade only, for strokes that carry their own dash pattern.
  const fade = (opacity: number, delay: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: ready ? opacity : 0 } }
      : {
          initial: { opacity: 0 },
          animate: { opacity: ready ? opacity : 0 },
          transition: { duration: 1.2, delay: ready ? delay : 0 },
        };

  // Lines draw themselves along their length. framer fakes the draw with a
  // dash pattern in user units, so these must NOT be non-scaling-stroke: the
  // two measure length in different spaces and the line comes out dashed.
  const stroke = (opacity: number, delay: number, duration: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: ready ? opacity : 0 } }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: ready ? 1 : 0, opacity: ready ? opacity : 0 },
          transition: {
            duration,
            delay: ready ? delay : 0,
            ease: "easeInOut" as const,
          },
        };

  return (
    // Below xl the SVG scales down until the labels are unreadably small, so
    // the planet stays and the annotations go.
    <g className="hidden xl:block" aria-hidden="true">
      {/* Polar axis, pole to pole and a little past each. The north end runs
          under the nav panel, which is why it carries no label. */}
      <motion.path
        d={line(
          { x: south.x * 1.22, y: south.y * 1.22 },
          { x: north.x * 1.22, y: north.y * 1.22 },
        )}
        fill="none"
        stroke="#94A3B8"
        strokeWidth="0.8"
        strokeDasharray="4 5"
        vectorEffect="non-scaling-stroke"
        {...fade(0.55, 1.2)}
      />
      {[north, south].map((p, i) => (
        <motion.rect
          key={i}
          x={p.x - 0.45}
          y={p.y - 0.45}
          width="0.9"
          height="0.9"
          fill="#020617"
          stroke="#F97316"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          {...reveal(i)}
        />
      ))}

      {/* Scale bar across the ring plane. */}
      <motion.path
        d={line(start, end)}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth={HAIRLINE}
        {...stroke(0.8, 1.3, 1)}
      />

      {/* Ticks at every boundary, longer at the two ends. */}
      {BOUNDARIES.map((d, i) => {
        const half = i === 0 || i === BOUNDARIES.length - 1 ? 0.9 : 0.55;
        return (
          <motion.path
            key={d}
            d={line(at(d, half), at(d, -half))}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            {...reveal(i)}
          />
        );
      })}

      {/* Ring names. Letters above the bar; the two long names below it. */}
      {FEATURES.map((f, i) => {
        const p = at(f.d, f.side * (f.lift ?? (f.major ? 1.65 : 1.2)));
        return (
          <motion.text
            key={f.label}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={f.major ? TEXT_MAJOR : TEXT_MINOR}
            fill={f.major ? "#F8FAFC" : "#94A3B8"}
            letterSpacing={f.major ? 0 : 0.08}
            className="font-mono"
            {...reveal(i + 2)}
          >
            {f.label}
          </motion.text>
        );
      })}

      {/* Callout: up from just past the F ring, then under the spec. */}
      <motion.path
        d={`M ${f2(tail.x)} ${f2(tail.y)} L ${f2(spec.x + 0.3)} ${f2(underline)} L ${f2(spec.x - 11)} ${f2(underline)}`}
        fill="none"
        stroke="#F97316"
        strokeWidth={HAIRLINE}
        {...stroke(0.85, 2.1, 0.8)}
      />

      {/* Spec readout. */}
      <motion.g {...reveal(9)}>
        <text
          x={spec.x}
          y={spec.y}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={TEXT_SPEC}
          fill="#F97316"
          letterSpacing="0.14"
          className="font-mono"
        >
          {`TGT · ${planetNotes.saturn.name}`}
        </text>
        <text
          x={spec2.x}
          y={spec2.y}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={TEXT_SPEC * 0.8}
          fill="#94A3B8"
          letterSpacing="0.1"
          className="font-mono"
        >
          {planetNotes.saturn.facts}
        </text>
      </motion.g>

      {/* What the body stands for, under the rule, as on the other planets. */}
      <motion.text
        x={spec.x}
        y={underline + 1.05}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={TEXT_SPEC * 0.8}
        fill="#3B82F6"
        letterSpacing="0.1"
        className="font-mono"
        {...reveal(10)}
      >
        {planetNotes.saturn.meaning}
      </motion.text>
    </g>
  );
}

export default function GeometricPlanet({ ready = true }: { ready?: boolean }) {
  const svgRef = useSmilPause();

  return (
    // Positioned by its centre rather than by an edge: the old right/width
    // offsets put the planet near the middle of the screen once the width cap
    // kicked in. Centre at ~88% keeps the body on screen and lets the rings
    // run off the right edge, leaving the middle of the hero clear.
    //
    // Vertically it is a fixed offset, not a percentage: the hero's height is
    // set by its content, so a percentage moved the planet (and its scale bar)
    // down into the headline on wide screens. The headline sits a fixed
    // distance from the top, so the planet has to as well.
    //
    // On phones the headline fills the width, so the planet rides higher and
    // dimmer: at full strength the B ring sat right behind the dim second line
    // and washed it out.
    <div className="absolute left-[86%] top-[13%] w-[250vw] md:left-[88%] md:top-[355px] md:w-[180vw] max-w-[2800px] aspect-square -translate-x-1/2 -translate-y-1/2 opacity-[0.45] md:opacity-[0.88] pointer-events-none z-0">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="w-full h-full"
        aria-hidden="true"
      >
        <g transform="translate(100, 100)">
          <GeometricSphere
            id="hero-saturn"
            radius={RADIUS}
            tiltDeg={TILT}
            leanDeg={LEAN}
            polar={POLAR}
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

          <SaturnAnnotations ready={ready} />
        </g>
      </svg>
    </div>
  );
}
