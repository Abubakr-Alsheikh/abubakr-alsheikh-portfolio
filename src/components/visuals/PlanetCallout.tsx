"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PlanetNote } from "@/lib/data/planets";

/**
 * A target callout for a background body, in the style of hero Saturn's: a
 * marker on the limb, a leader out to an elbow, a rule, the name and a fact
 * line above the rule and what the body stands for below it.
 *
 * Drawn in the planet's own SVG units, inside its `translate(100, 100)` group,
 * so it rides the planet through every drift and resize. `size` is the title
 * height in those units: pick it from the planet's px-per-unit so the title
 * lands near 11px on screen.
 *
 * Leader widths are user units, not non-scaling, because the lines draw in
 * with `pathLength` (see the agents.md rule on the two not mixing).
 */

interface Point {
  x: number;
  y: number;
}

interface PlanetCalloutProps {
  note: PlanetNote;
  /** Body radius, in the planet's units. */
  radius: number;
  /** Where on the limb the marker sits, degrees clockwise from 3 o'clock. */
  angleDeg: number;
  /** Radial leader length past the limb. Ignored when `elbow` is given. */
  reach?: number;
  /** Explicit elbow, for a leader that has to travel to open space. */
  elbow?: Point;
  /** Length of the rule, signed: positive runs right, negative left. */
  run: number;
  size: number;
  /** Seconds after the callout scrolls into view before it starts drawing. */
  delay?: number;
}

const ORANGE = "#F97316";
const f2 = (n: number) => n.toFixed(2);

export default function PlanetCallout({
  note,
  radius,
  angleDeg,
  reach = 5,
  elbow,
  run,
  size,
  delay = 0.2,
}: PlanetCalloutProps) {
  const reduce = useReducedMotion();

  const a = (angleDeg * Math.PI) / 180;
  const dir = { x: Math.cos(a), y: Math.sin(a) };
  const anchor = { x: dir.x * radius, y: dir.y * radius };
  const bend = elbow ?? {
    x: dir.x * (radius + reach),
    y: dir.y * (radius + reach),
  };
  const end = { x: bend.x + run, y: bend.y };

  const side = run >= 0 ? 1 : -1;
  const textX = bend.x + side * size * 0.9;
  const textAnchor = side > 0 ? "start" : "end";
  const hairline = size * 0.09;

  const viewport = { once: true, amount: 0.4 } as const;
  const draw = reduce
    ? { initial: false as const }
    : {
        initial: { pathLength: 0, opacity: 0 },
        whileInView: { pathLength: 1, opacity: 0.85 },
        viewport,
        transition: { duration: 1, delay, ease: "easeInOut" as const },
      };
  const reveal = (step: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport,
          transition: { duration: 0.5, delay: delay + 0.8 + step * 0.15 },
        };

  return (
    // Below xl the planets shrink until the text is unreadable, as with
    // hero Saturn: the body stays, the callout goes.
    <g className="hidden xl:block" aria-hidden="true">
      <motion.rect
        x={anchor.x - size * 0.35}
        y={anchor.y - size * 0.35}
        width={size * 0.7}
        height={size * 0.7}
        fill="#020617"
        stroke={ORANGE}
        strokeWidth={hairline * 1.4}
        {...reveal(0)}
      />

      <motion.path
        d={`M ${f2(anchor.x)} ${f2(anchor.y)} L ${f2(bend.x)} ${f2(bend.y)} L ${f2(end.x)} ${f2(end.y)}`}
        fill="none"
        stroke={ORANGE}
        strokeWidth={hairline}
        {...draw}
      />

      <motion.g {...reveal(1)}>
        <text
          x={textX}
          y={bend.y - size * 1.75}
          textAnchor={textAnchor}
          fontSize={size}
          fill={ORANGE}
          letterSpacing={size * 0.18}
          className="font-mono"
        >
          {`TGT · ${note.name}`}
        </text>
        <text
          x={textX}
          y={bend.y - size * 0.55}
          textAnchor={textAnchor}
          fontSize={size * 0.8}
          fill="#94A3B8"
          letterSpacing={size * 0.12}
          className="font-mono"
        >
          {note.facts}
        </text>
      </motion.g>

      <motion.text
        x={textX}
        y={bend.y + size * 1.25}
        textAnchor={textAnchor}
        fontSize={size * 0.8}
        fill="#3B82F6"
        letterSpacing={size * 0.12}
        className="font-mono"
        {...reveal(2)}
      >
        {note.meaning}
      </motion.text>
    </g>
  );
}
