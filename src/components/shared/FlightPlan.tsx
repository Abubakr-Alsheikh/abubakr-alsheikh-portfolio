"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { flightPlan, type LightSide } from "@/lib/data/flightPlan";

/**
 * The right-hand edge of the canopy as a flight plan: one stop per body on the
 * page, and the visitor's ship flying down it as they scroll. Reaching a stop
 * lights the glass from the side that planet sits on, in its colour.
 *
 * The ship rides motion values like the old altitude ladder did, so scrolling
 * moves it without a render. Its engine burns with speed: down the page from
 * the tail, back up from the nose. React only re-renders when the ship passes a
 * stop. A page without these sections, like a case study, keeps the plain ladder.
 */

const TICKS = 21;
/** Within this share of the route either side of a stop, the ship is there. */
const ARRIVAL = 0.012;
/** Scroll speed (px/s) at which the engine burns at full length. */
const FULL_BURN = 2400;
/** How long the glass takes to change colour at a new stop. */
const LIGHT_FADE = "duration-[1400ms]";
/** Below these widths the text would sit on the content column. */
const LABELS = "hidden min-[1400px]:block";
const READOUT = "hidden min-[1440px]:block";

const LIGHT: Record<LightSide, (rgb: string) => string> = {
  right: (rgb) =>
    `linear-gradient(to left, rgba(${rgb},0.11) 0%, transparent 16%), radial-gradient(ellipse at 100% 30%, rgba(${rgb},0.10) 0%, transparent 42%)`,
  left: (rgb) =>
    `linear-gradient(to right, rgba(${rgb},0.11) 0%, transparent 16%), radial-gradient(ellipse at 0% 70%, rgba(${rgb},0.10) 0%, transparent 42%)`,
  below: (rgb) =>
    `radial-gradient(ellipse at 50% 112%, rgba(${rgb},0.12) 0%, transparent 46%), radial-gradient(ellipse at center, transparent 50%, rgba(2,6,23,0.35) 100%)`,
};

/** Where each stop sits along the route, as a share of the page's scroll. */
function measure(): number[] | null {
  const runway = document.documentElement.scrollHeight - window.innerHeight;
  if (runway <= 0) return null;
  const at: number[] = [];
  for (const stop of flightPlan) {
    const el = document.getElementById(stop.section);
    if (!el) return null;
    const top = el.getBoundingClientRect().top + window.scrollY;
    // Reached when the section's top passes the middle of the screen.
    at.push(Math.min(1, Math.max(0, (top - window.innerHeight / 2) / runway)));
  }
  at[0] = 0;
  return at;
}

function Ship({ velocity }: { velocity: MotionValue<number> }) {
  const tail = useTransform(velocity, [0, FULL_BURN], [0, 1], { clamp: true });
  const nose = useTransform(velocity, [-FULL_BURN, 0], [1, 0], { clamp: true });
  return (
    <div className="relative w-4 h-6">
      {/* Main engine, behind the ship while it flies down the page. */}
      <motion.div
        style={{ scaleY: tail }}
        className="absolute left-1/2 -translate-x-1/2 bottom-full w-[3px] h-5 origin-bottom bg-gradient-to-t from-[#F97316] to-transparent motion-reduce:hidden"
      />
      {/* Retro burn from the nose, when the visitor scrolls back up. */}
      <motion.div
        style={{ scaleY: nose }}
        className="absolute left-1/2 -translate-x-1/2 top-full w-[2px] h-4 origin-top bg-gradient-to-b from-[#60A5FA] to-transparent motion-reduce:hidden"
      />
      <svg viewBox="0 0 16 24" className="w-4 h-6" aria-hidden="true">
        {/* A dart flying down the page: wings back at the top, nose at the bottom. */}
        <path d="M8 23 L15 3 L8 7 L1 3 Z" fill="#020617" stroke="#CBD5E1" strokeWidth="1" strokeLinejoin="round" />
        <path d="M8 7 L8 21" stroke="#3B82F6" strokeWidth="1" />
        <path d="M4.5 8.5 L8 12 L11.5 8.5" fill="none" stroke="#F97316" strokeWidth="1" />
      </svg>
    </div>
  );
}

export default function FlightPlan({
  progress,
  velocity,
  fallback,
}: {
  progress: MotionValue<number>;
  velocity: MotionValue<number>;
  /** What the edge shows on a page with no route, such as a case study. */
  fallback: ReactNode;
}) {
  const pathname = usePathname();
  const [stops, setStops] = useState<number[] | null>(null);
  const [passed, setPassed] = useState(0);
  const top = useTransform(progress, [0, 1], ["0%", "100%"]);

  // Measure the route, and again whenever the page changes height.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setStops(measure()));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  // The last stop the ship has reached. Changes a handful of times a page.
  useEffect(() => {
    if (!stops) return;
    const reached = (p: number) => {
      let last = 0;
      for (let i = 0; i < stops.length; i++) if (p >= stops[i] - ARRIVAL) last = i;
      return last;
    };
    setPassed(reached(progress.get()));
    return progress.on("change", (p) => setPassed((prev) => {
      const next = reached(p);
      return next === prev ? prev : next;
    }));
  }, [progress, stops]);

  if (!stops) return fallback;

  const here = flightPlan[passed];

  return (
    <>
      {/* Planet light on the glass: one layer per stop, crossfaded on arrival. */}
      <div className="absolute inset-0">
        {flightPlan.map((stop, i) => (
          <div
            key={stop.section}
            className={`absolute inset-0 transition-opacity ${LIGHT_FADE} ease-out motion-reduce:transition-none ${
              i === passed ? "opacity-100" : "opacity-0"
            }`}
            style={{ background: LIGHT[stop.light.side](stop.light.rgb) }}
          />
        ))}
      </div>

      <div className="absolute top-24 bottom-24 right-0 w-14">
        <div className="absolute inset-y-0 right-5 w-px bg-[#3B82F6]/20" />
        {Array.from({ length: TICKS }).map((_, i) => (
          <div
            key={i}
            className="absolute right-5 h-px w-1.5 bg-[#3B82F6]/15"
            style={{ top: `${(i / (TICKS - 1)) * 100}%` }}
          />
        ))}

        {/* The route walked so far, lit. */}
        <motion.div
          style={{ height: top }}
          className="absolute top-0 right-5 w-px bg-gradient-to-b from-[#3B82F6]/10 to-[#3B82F6]/60"
        />

        {flightPlan.map((stop, i) => {
          const done = i < passed;
          const now = i === passed;
          return (
            <div
              key={stop.section}
              className="absolute right-5 translate-x-1/2 -translate-y-1/2"
              style={{ top: `${stops[i] * 100}%` }}
            >
              <div
                className={`w-2 h-2 rotate-45 border transition-colors duration-500 ${
                  now
                    ? "border-[#F97316] bg-[#F97316]"
                    : done
                      ? "border-[#3B82F6] bg-[#3B82F6]/70"
                      : "border-slate-500 bg-[#020617]"
                }`}
              />
              {/* The ship's own readout names the stop it is at, so this one steps aside. */}
              <span
                className={`${LABELS} absolute right-4 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[8px] tracking-widest transition-[color,opacity] duration-500 ${
                  now ? "opacity-0" : done ? "text-[#60A5FA]" : "text-slate-500"
                }`}
              >
                {stop.body.name}
              </span>
            </div>
          );
        })}

        {/* The ship, and what it is passing. */}
        <motion.div
          style={{ top }}
          className="absolute right-5 translate-x-1/2 -translate-y-1/2 flex items-center"
        >
          <Ship velocity={velocity} />
          <div className={`${READOUT} absolute right-6 top-1/2 -translate-y-1/2 text-right font-mono leading-[11px] whitespace-nowrap`}>
            <div className="text-[8px] tracking-widest text-[#F97316]">{here.body.name}</div>
            <div className="text-[7px] tracking-widest text-slate-400">{here.readout}</div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
