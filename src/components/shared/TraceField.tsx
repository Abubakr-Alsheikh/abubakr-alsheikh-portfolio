"use client";

import {
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { createContext, useContext, useEffect, type ReactNode } from "react";

/**
 * Physics for the energised front. Critically damped at mass 1, so the trace
 * trails the scroll by a beat and settles without ever overshooting a seam.
 * Smoothing here — once, on the shared front — is safe. Smoothing per section,
 * before each rail clamps, is what tears the line apart (see `useTraceFill`).
 */
export const TRACE_SPRING = {
  stiffness: 300,
  damping: 40,
  mass: 1,
  restDelta: 0.1,
} as const;

/**
 * Document-space position of the energised front.
 *
 * Through the body of the page this is simply the viewport centre line. Over
 * the final half-viewport of scroll it accelerates to 2x so that it can reach
 * the bottom of the document: the centre line stops at
 * `documentHeight - viewportHeight / 2`, which would otherwise strand the last
 * rail permanently half-drawn no matter how far you scroll.
 *
 * The ramp is monotonic and applied identically to every rail, so the line
 * stays welded while it makes up that last half viewport.
 */
export function traceFront(scrollY: number, viewport: number, runway: number) {
  const half = viewport / 2;
  if (half <= 0) return scrollY;

  const tail = runway - half;
  const overrun =
    tail > 0 ? Math.min(Math.max((scrollY - tail) / half, 0), 1) : 1;

  return scrollY + half + overrun * half;
}

const TraceFieldContext = createContext<MotionValue<number> | null>(null);

/** The one smoothed front every rail on the page clamps against. */
export const useTraceFront = () => useContext(TraceFieldContext);

/**
 * Publishes a single smoothed trace front for the whole page.
 *
 * One spring, one value, shared. Every rail derives its own fill from this and
 * clamps afterwards, so rail N is full at exactly the offset where rail N+1
 * leaves zero — at any scroll speed, however far the smoothing lags behind.
 */
export default function TraceField({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();

  const viewport = useMotionValue(0);
  const runway = useMotionValue(0);

  useEffect(() => {
    const measure = () => {
      viewport.set(window.innerHeight);
      runway.set(
        Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          0,
        ),
      );
    };

    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [viewport, runway]);

  const front = useTransform<number, number>(
    [scrollY, viewport, runway],
    ([y, height, max]) => traceFront(y, height, max),
  );

  const smoothed = useSpring(front, TRACE_SPRING);

  return (
    <TraceFieldContext.Provider value={smoothed}>
      {children}
    </TraceFieldContext.Provider>
  );
}
