"use client";

import { useEffect, useRef } from "react";

/**
 * Freezes an SVG's animation while it is off screen: its SMIL clock, and any
 * CSS loops inside it (via `data-offscreen`, see globals.css).
 *
 * Chrome keeps ticking every `<animate>` on the page whether or not it can be
 * seen, and each tick invalidates style on the animated element. With five
 * planets and a black hole that was ~50 animations recalculating style every
 * frame, most of them for bodies several screens away. Pausing freezes them
 * where they are, and unpausing resumes from the same time, so a visitor
 * never sees a jump.
 *
 * Written straight to the DOM, not through state: a planet should not
 * re-render to stop moving. The margin wakes a body a little before it
 * scrolls in.
 */
export function useSmilPause<T extends SVGSVGElement = SVGSVGElement>(
  margin = "200px 0px",
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          svg.unpauseAnimations();
          svg.removeAttribute("data-offscreen");
        } else {
          svg.pauseAnimations();
          svg.setAttribute("data-offscreen", "");
        }
      },
      { rootMargin: margin },
    );
    io.observe(svg);
    return () => io.disconnect();
  }, [margin]);

  return ref;
}
