import type { CSSProperties } from "react";

/**
 * Wiring for the project visuals: the tracks that run between the nodes of a
 * topology panel, and the packets that flow along them.
 *
 * One rule holds the whole thing together: **a node and the wire that reaches
 * it read their position from the same map**. Each visual declares its nodes
 * once as percentages of the panel (`HudNode`), places the HTML with
 * `nodeStyle()` and routes the wires with `anchor()` + `<Wire>`. Before this,
 * the two were written out by hand in different places and drifted apart.
 *
 * Geometry. The wiring SVG is a 0-100 box stretched over the panel
 * (`preserveAspectRatio="none"`), so a unit is a percent of the panel on each
 * axis and the two axes scale differently. Diagonals shear under that, which
 * is why every route is orthogonal: out along x, across on y, in along x.
 * Strokes are `non-scaling-stroke`, so they stay 1-2 screen pixels.
 */

export interface Point {
  x: number;
  y: number;
}

export interface HudNode extends Point {
  /** Half-width and half-height of the node's body, in panel percent. */
  rx: number;
  ry: number;
}

/** Clearance between a node's edge and where its wire starts. */
const GAP = 1.6;

/** Centres a node's HTML on its point. */
export function nodeStyle(node: HudNode): CSSProperties {
  return { left: `${node.x}%`, top: `${node.y}%` };
}

/** The point a wire leaves from, on one side of a node. */
export function anchor(
  node: HudNode,
  side: "left" | "right" | "top" | "bottom",
): Point {
  switch (side) {
    case "left":
      return { x: node.x - node.rx - GAP, y: node.y };
    case "right":
      return { x: node.x + node.rx + GAP, y: node.y };
    case "top":
      return { x: node.x, y: node.y - node.ry - GAP };
    default:
      return { x: node.x, y: node.y + node.ry + GAP };
  }
}

/**
 * An orthogonal route between two points: along x to the bend, across on y,
 * then along x again. `bend` defaults to halfway, and several wires sharing a
 * bend read as one bus.
 */
export function route(from: Point, to: Point, bend?: number): string {
  const b = bend ?? (from.x + to.x) / 2;
  if (Math.abs(from.y - to.y) < 0.01) return `M ${from.x} ${from.y} H ${to.x}`;
  return `M ${from.x} ${from.y} H ${b} V ${to.y} H ${to.x}`;
}

/** A vertical-first route, for wires that leave a node's top or bottom. */
export function routeV(from: Point, to: Point, bend?: number): string {
  const b = bend ?? (from.y + to.y) / 2;
  if (Math.abs(from.x - to.x) < 0.01) return `M ${from.x} ${from.y} V ${to.y}`;
  return `M ${from.x} ${from.y} V ${b} H ${to.x} V ${to.y}`;
}

/** Midpoint of a route's last horizontal leg, for a label that sits on the
 *  wire. Reads from the same points the wire does, so it cannot drift. */
export function legMid(bend: number, to: Point): Point {
  return { x: (bend + to.x) / 2, y: to.y };
}

/**
 * A tag sitting on a wire, naming what runs through it. Its background is the
 * panel colour, so it cuts the track cleanly the way a schematic label does.
 */
export function WireLabel({
  at,
  children,
  tone = "text-slate-400",
}: {
  at: Point;
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <span
      style={{ left: `${at.x}%`, top: `${at.y}%` }}
      className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 bg-[#020617] px-1 font-mono text-[7px] lg:text-[8px] tracking-widest whitespace-nowrap ${tone}`}
    >
      {children}
    </span>
  );
}

/** A pad where a wire meets a node: a small square, the way a board marks a
 *  via. HTML, not SVG, so the stretched viewBox cannot turn it into a slab. */
export function WirePort({ at, tone = "#334155" }: { at: Point; tone?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ left: `${at.x}%`, top: `${at.y}%`, backgroundColor: tone }}
      className="absolute z-20 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2"
    />
  );
}

/** The dead track a wire sits on, whether or not anything is flowing. */
export function Track({ d }: { d: string }) {
  return (
    <path
      d={d}
      stroke="#334155"
      strokeOpacity={0.7}
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
      vectorEffect="non-scaling-stroke"
    />
  );
}

interface FlowProps {
  d: string;
  tone: string;
  /** Dash pattern: the lit packet, then the gap to the next one. */
  dash: string;
  /** Seconds for one packet to travel one dash period. */
  seconds: number;
  /** Runs the packets back the way they came. */
  reverse?: boolean;
  delaySeconds?: number;
}

/**
 * Packets running along a wire. The glow is a wide faint stroke under the
 * bright one, never an SVG filter; both inherit one dash offset from the
 * group, so they cannot drift apart.
 */
export function Flow({
  d,
  tone,
  dash,
  seconds,
  reverse = false,
  delaySeconds = 0,
}: FlowProps) {
  const period = dash
    .split(/[\s,]+/)
    .map(Number)
    .reduce((a, b) => a + b, 0);

  return (
    <g
      className="hud-flow"
      strokeDasharray={dash}
      stroke={tone}
      strokeLinecap="butt"
      style={
        {
          "--hud-flow": `${period}px`,
          "--hud-dur": `${seconds * 2}s`,
          // The keyframe counts the offset down, which runs packets along the
          // path as drawn; reversing sends them back to the start.
          animationDirection: reverse ? "reverse" : "normal",
          animationDelay: `${delaySeconds}s`,
        } as CSSProperties
      }
    >
      <path
        d={d}
        strokeWidth={6}
        strokeOpacity={0.18}
        vectorEffect="non-scaling-stroke"
      />
      <path d={d} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </g>
  );
}

/** A wire: its track and, when something is moving on it, its packets. */
export function Wire({
  d,
  tone,
  dash = "14 120",
  seconds = 1.2,
  reverse,
  delaySeconds,
  live = true,
}: {
  d: string;
  tone: string;
  dash?: string;
  seconds?: number;
  reverse?: boolean;
  delaySeconds?: number;
  live?: boolean;
}) {
  return (
    <>
      <Track d={d} />
      {live ? (
        <Flow
          d={d}
          tone={tone}
          dash={dash}
          seconds={seconds}
          reverse={reverse}
          delaySeconds={delaySeconds}
        />
      ) : null}
    </>
  );
}

/**
 * The wiring layer itself. Stretched over the panel, behind the nodes.
 */
export function WiringLayer({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
