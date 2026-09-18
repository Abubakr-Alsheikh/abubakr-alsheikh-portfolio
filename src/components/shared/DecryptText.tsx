"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Text that resolves out of scrambled glyphs, left to right.
 *
 * Zero layout shift by construction: an invisible copy of the real text sets
 * the box, and the scramble is laid over it absolutely. Glyphs of a different
 * width can spill past the box for the second it runs, but they can never
 * reflow the headline around them.
 *
 * The real string is always in the DOM for screen readers and crawlers; the
 * scramble is aria-hidden.
 */

interface DecryptTextProps {
  text: string;
  /** Starts the decode. Before this the final text is rendered. */
  active: boolean;
  /** Milliseconds to wait after `active` before resolving begins. */
  delay?: number;
  /** Milliseconds from first to last character resolving. */
  duration?: number;
  onDone?: () => void;
}

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789#%&*+=<>/";

/** Re-roll the unresolved glyphs this often, so the noise reads as noise. */
const ROLL_MS = 45;

function scramble(text: string, resolved: number): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out +=
      i < resolved || ch === " "
        ? ch
        : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }
  return out;
}

export default function DecryptText({
  text,
  active,
  delay = 0,
  duration = 900,
  onDone,
}: DecryptTextProps) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = React.useState(text);

  // Held in a ref so a parent re-rendering with a new callback identity does
  // not restart the decode.
  const done = React.useRef(onDone);
  React.useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  React.useEffect(() => {
    if (!active) return;

    if (reduce) {
      setDisplay(text);
      done.current?.();
      return;
    }

    // Fully scrambled from the moment the line appears, so the real text never
    // flashes before the decode starts.
    setDisplay(scramble(text, 0));

    let frame = 0;
    let startedAt = 0;
    let lastRoll = 0;

    const step = (now: number) => {
      if (!startedAt) startedAt = now;
      const t = Math.min(1, (now - startedAt) / duration);

      if (t >= 1) {
        setDisplay(text);
        done.current?.();
        return;
      }

      if (now - lastRoll >= ROLL_MS) {
        lastRoll = now;
        setDisplay(scramble(text, Math.floor(t * text.length)));
      }
      frame = requestAnimationFrame(step);
    };

    const timer = window.setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [active, reduce, text, delay, duration]);

  return (
    <span className="relative inline-block">
      <span className="sr-only">{text}</span>
      <span className="invisible" aria-hidden="true">
        {text}
      </span>
      <span
        className="absolute left-0 top-0 whitespace-pre"
        aria-hidden="true"
      >
        {display}
      </span>
    </span>
  );
}
