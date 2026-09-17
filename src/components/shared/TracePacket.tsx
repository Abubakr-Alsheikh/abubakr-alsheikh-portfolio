"use client";

import React from "react";
import { motion, type MotionValue } from "framer-motion";

/**
 * The lit data packet riding the head of a trace segment.
 *
 * Exactly one is visible on the page at a time — `useTraceFill` darkens the
 * packet on spent and dormant rails — so this renders the payload it is
 * currently carrying rather than an anonymous dot.
 *
 * The node is a diamond rather than a circle: `rounded-full` on technical
 * readouts is a slop pattern this project does not use.
 */

interface TracePacketProps {
  /** From `useTraceFill`. Lights the packet only while the front is on this leg. */
  opacity: MotionValue<number>;
  /** Payload name, e.g. "ABOUT". Seeds the displayed address. */
  label: string;
  tone?: "orange" | "blue";
}

const TONES = {
  orange: {
    border: "border-[#F97316]",
    glow: "shadow-[0_0_10px_#F97316]",
    text: "text-[#F97316]",
    wake: "bg-[#F97316]",
  },
  blue: {
    border: "border-[#3B82F6]",
    glow: "shadow-[0_0_10px_#3B82F6]",
    text: "text-[#3B82F6]",
    wake: "bg-[#3B82F6]",
  },
} as const;

/**
 * Deterministic address for a payload name. Derived rather than random so the
 * server and client render the same string — a `Math.random()` address here
 * would be a hydration mismatch on every load.
 */
function addressOf(label: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < label.length; i++) {
    hash ^= label.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `0x${(hash & 0xffff).toString(16).toUpperCase().padStart(4, "0")}`;
}

const TracePacket = React.memo(
  ({ opacity, label, tone = "orange" }: TracePacketProps) => {
    const t = TONES[tone];

    return (
      <motion.div
        style={{ opacity }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center"
      >
        {/* Wake: two spent cells trailing the head up the rail it just drew. */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pb-1">
          <div className={`h-px w-1 ${t.wake} opacity-20`} />
          <div className={`h-px w-1.5 ${t.wake} opacity-40`} />
        </div>

        <div
          className={`w-2.5 h-2.5 rotate-45 bg-[#020617] border ${t.border} ${t.glow} flex items-center justify-center`}
        >
          <div className="w-[3px] h-[3px] bg-white" />
        </div>

        <div className="absolute left-4 hidden md:flex items-center gap-1.5 whitespace-nowrap">
          <span
            className={`font-mono text-[8px] tracking-[0.2em] ${t.text} tabular-nums`}
          >
            {addressOf(label)}
          </span>
          <span className="font-mono text-[8px] tracking-[0.2em] text-slate-600">
            {label}
          </span>
        </div>
      </motion.div>
    );
  },
);

TracePacket.displayName = "TracePacket";

export default TracePacket;
