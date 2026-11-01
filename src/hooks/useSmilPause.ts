"use client";

import { useEffect, useRef } from "react";
import { onFrame } from "@/lib/frameClock";

/** How often a planet's SMIL advances. Its fastest mover is a slow moon. */
const SMIL_STEP_MS = 1000 / 15;

/**
 * Runs an SVG's SMIL and moving dashes on a slow step while it is on screen, and
 * stops them, its CSS loops and its painting while it is not.
 *
 * Left alone, SMIL ticks at the display's full rate, and each tick invalidates
 * style and layout on the animated element, so one visible planet forced a full
 * frame on every vsync. Its clock stays paused here and `setCurrentTime` moves it
 * by hand from the shared frame clock. Off screen the clock does not move at
 * all, so a visitor never sees a jump, and `visibility: hidden` drops the paths
 * from paint while keeping the box the observer watches and `PlanetTag` measures.
 *
 * Written straight to the DOM, not through state: a planet should not re-render
 * to stop moving. The margin wakes a body a little before it scrolls in.
 */
export function useSmilPause<T extends SVGSVGElement = SVGSVGElement>(
  margin = "200px 0px",
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    svg.pauseAnimations();

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stop: (() => void) | null = null;
    let clock = svg.getCurrentTime();
    let pending = 0;
    // What each moving dash needs: its element, one cycle's length and time.
    const flows = [...svg.querySelectorAll<SVGElement>(".hud-flow-stepped")].map((el) => ({
      el,
      period: parseFloat(el.style.getPropertyValue("--hud-flow")) || 0,
      seconds: parseFloat(el.style.getPropertyValue("--hud-dur")) || 1,
    }));

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          svg.removeAttribute("data-offscreen");
          svg.style.visibility = "";
          if (!stop && !still) {
            stop = onFrame((dt) => {
              pending += dt;
              if (pending < SMIL_STEP_MS) return;
              clock += pending / 1000;
              pending = 0;
              svg.setCurrentTime(clock);
              for (const { el, period, seconds } of flows) {
                el.style.strokeDashoffset = `${((clock / seconds) % 1) * period}`;
              }
            });
          }
        } else {
          svg.setAttribute("data-offscreen", "");
          svg.style.visibility = "hidden";
          stop?.();
          stop = null;
        }
      },
      { rootMargin: margin },
    );
    io.observe(svg);
    return () => {
      io.disconnect();
      stop?.();
    };
  }, [margin]);

  return ref;
}
