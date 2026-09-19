"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { PlanetNote } from "@/lib/data/planets";

/**
 * A target readout for a background planet, placed in the page layout and
 * tied to the planet by a live leader line.
 *
 * Why not draw it inside the planet's SVG like hero Saturn: the planets cap
 * their size while the content column re-centres, so between 1280px and
 * 1920px a planet slides several hundred pixels against the content. A label
 * fixed to the planet lands on open space at one width and under a card at
 * another. Here the label lives in a spot that is empty at every width, and
 * only the line moves.
 *
 * The line runs from the end of the tag's rule to the planet's centre, where
 * a lock marker sits. It is recomputed every frame while the section is on
 * screen (planets drift on scroll) by writing `d` directly, never through
 * React state. Off screen, the loop stops.
 *
 * Render the tag before the content it sits beside, so later cards paint
 * over the leader rather than the leader over their text.
 */

interface PlanetTagProps {
  note: PlanetNote;
  /** `data-planet` value on the planet's SVG, looked up inside the section. */
  planet: string;
  /** Text alignment. The leader picks its own side: whichever faces the planet. */
  align?: "left" | "right";
  /** Positions the tag inside its (relative) parent. */
  className?: string;
}

const ORANGE = "#F97316";

export default function PlanetTag({
  note,
  planet,
  align = "left",
  className = "",
}: PlanetTagProps) {
  const reduce = useReducedMotion();
  const tagRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);
  const leaderRef = useRef<SVGPathElement>(null);
  const lockRef = useRef<SVGGElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const overlay = overlayRef.current;
    const rule = ruleRef.current;
    const leader = leaderRef.current;
    const lock = lockRef.current;
    const section = overlay?.closest("section");
    const body = section?.querySelector<SVGSVGElement>(
      `[data-planet="${planet}"]`,
    );
    if (!overlay || !rule || !leader || !lock || !section || !body) return;

    let frame = 0;
    let running = false;

    const draw = () => {
      const o = overlay.getBoundingClientRect();
      const r = rule.getBoundingClientRect();
      const b = body.getBoundingClientRect();

      const cx = b.left + b.width / 2 - o.left;
      const cy = b.top + b.height / 2 - o.top;
      // Leave from whichever end of the rule faces the planet, run straight
      // out a little, then turn for the centre.
      const left = cx < (r.left + r.right) / 2 - o.left;
      const ex = (left ? r.left : r.right) - o.left;
      const ey = r.top + r.height / 2 - o.top;
      const kx = ex + (left ? -18 : 18);

      leader.setAttribute(
        "d",
        `M ${ex.toFixed(1)} ${ey.toFixed(1)} L ${kx.toFixed(1)} ${ey.toFixed(1)} L ${cx.toFixed(1)} ${cy.toFixed(1)}`,
      );
      lock.setAttribute("transform", `translate(${cx.toFixed(1)} ${cy.toFixed(1)})`);
    };

    const loop = () => {
      draw();
      if (running) frame = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running) {
        setSeen(true);
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(loop);
      }
    });
    io.observe(tagRef.current ?? section);

    draw();
    window.addEventListener("resize", draw);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [planet]);

  const show = seen || reduce;
  const alignClass =
    align === "left" ? "items-start text-left" : "items-end text-right";

  return (
    <>
      {/* Leader and lock. Coordinates are measured against this SVG's own box
          and it never clips, so it only needs a positioned parent. */}
      <svg
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden xl:block overflow-visible"
      >
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.8, delay: reduce ? 0 : 0.3 }}
        >
          <path
            ref={leaderRef}
            fill="none"
            stroke={ORANGE}
            strokeOpacity={0.7}
            strokeWidth={1}
          />
          <g ref={lockRef}>
            <rect x={-5} y={-5} width={10} height={10} fill="none" stroke={ORANGE} strokeWidth={1} />
            <path
              d="M -12 0 H -7 M 7 0 H 12 M 0 -12 V -7 M 0 7 V 12"
              stroke={ORANGE}
              strokeWidth={1}
            />
            <rect x={-1.5} y={-1.5} width={3} height={3} fill={ORANGE} />
          </g>
        </motion.g>
      </svg>

      <motion.div
        ref={tagRef}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 0.6, delay: reduce ? 0 : 0.6 }}
        className={`hidden xl:flex flex-col ${alignClass} font-mono pointer-events-none z-10 ${className}`}
      >
        <span className="text-[11px] tracking-[0.2em] text-[#F97316]">
          {`TGT · ${note.name}`}
        </span>
        <span className="text-[10px] tracking-[0.12em] text-slate-400 mt-1 whitespace-nowrap">
          {note.facts}
        </span>
        <div ref={ruleRef} className="h-px w-full bg-[#F97316]/70 my-1.5" />
        <span className="text-[10px] tracking-[0.12em] text-[#3B82F6] whitespace-nowrap">
          {note.meaning}
        </span>
      </motion.div>
    </>
  );
}
