"use client";

import {
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, type RefObject } from "react";
import { traceFront, useTraceFront } from "@/components/shared/TraceField";

export type TraceFill = {
  /** Height of the energised part of this segment, in px ("412px"). */
  fill: MotionValue<string>;
  /** 0 -> 1 completion of this segment. */
  progress: MotionValue<number>;
  /** Lights the travelling data packet only while the front is on this leg. */
  packetOpacity: MotionValue<number>;
};

/**
 * Welds one trace segment to its neighbours.
 *
 * The ref goes on the SEGMENT — the 1px rail itself — never on the `<section>`:
 * a section's padding would otherwise offset the rail from the scroll range
 * driving it.
 *
 * Continuity comes from two rules, and both are load-bearing:
 *
 * 1. Every rail reads the SAME front from `<TraceField>` and converts it into
 *    its own local fill, so the front of one rail and the head of the next
 *    always resolve to the same pixel at the seam.
 *
 * 2. The clamp happens AFTER that conversion, never before it. Smoothing a
 *    pre-clamped per-section value (the old `useSpring(scrollYProgress)`) lets
 *    the rail above settle towards "full" while the rail below has already
 *    begun, and the difference opens a hole at the seam as wide as the current
 *    scroll velocity. Clamping a shared position cannot do that, which is why
 *    the smoothing lives in the field and not here: the front may lag as far
 *    behind the scroll as it likes and the line still reads as one piece.
 *
 * Rendered outside a `<TraceField>` a rail still works, it just tracks the
 * scroll without easing.
 */
export function useTraceFill(ref: RefObject<HTMLElement | null>): TraceFill {
  const shared = useTraceFront();
  const { scrollY } = useScroll();

  const top = useMotionValue(0);
  const length = useMotionValue(0);
  const viewport = useMotionValue(0);
  const runway = useMotionValue(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const box = el.getBoundingClientRect();
      top.set(box.top + window.scrollY);
      length.set(box.height);
      viewport.set(window.innerHeight);
      runway.set(
        Math.max(document.documentElement.scrollHeight - window.innerHeight, 0),
      );
    };

    // The rail's own box, plus the document, which covers any reflow above it.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(document.documentElement);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref, top, length, viewport, runway]);

  const unsmoothed = useTransform<number, number>(
    [scrollY, viewport, runway],
    ([y, height, max]) => traceFront(y, height, max),
  );

  const front = shared ?? unsmoothed;

  const fillPx = useTransform<number, number>(
    [front, top, length],
    ([position, start, span]) => {
      const drawn = position - start;
      return drawn < 0 ? 0 : drawn > span ? span : drawn;
    },
  );

  const fill = useTransform(fillPx, (px) => `${px}px`);

  const progress = useTransform<number, number>(
    [fillPx, length],
    ([px, span]) => (span > 0 ? px / span : 0),
  );

  // Exactly one packet is lit on the page: dormant segments below the fold and
  // spent segments above it stay dark, so no dot is left parked on a seam. The
  // hand-off windows are sub-pixel, so the swap at a seam is invisible.
  const packetOpacity = useTransform(
    progress,
    [0, 0.0002, 0.9998, 1],
    [0, 1, 1, 0],
  );

  return { fill, progress, packetOpacity };
}
