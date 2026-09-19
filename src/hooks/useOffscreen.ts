"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element is near the viewport, for pausing work that only
 * matters while it can be seen.
 *
 * Put the ref on a visual's root and spread `data-offscreen={offscreen || undefined}`
 * on it: globals.css pauses every CSS loop under that attribute. Timers read
 * `offscreen` and stop themselves.
 *
 * Starts as "offscreen" so nothing runs before the first observation lands.
 */
export function useOffscreen<T extends Element = HTMLDivElement>(
  margin = "200px 0px",
) {
  const ref = useRef<T>(null);
  const [offscreen, setOffscreen] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return { ref, offscreen };
}
