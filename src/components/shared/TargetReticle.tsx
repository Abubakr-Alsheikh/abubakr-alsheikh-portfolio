"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";

/**
 * Target reticle over `[data-hud-target]` elements, in two modes.
 *
 * Fine pointer: brackets follow the cursor and lock onto the target under it.
 * The innermost target wins, so a button inside a card locks the button.
 *
 * Touch: there is no cursor, so scrolling drives the lock. The target that
 * crosses the focus line (FOCUS of the viewport height) locks, and the
 * outermost one wins, so the reticle frames a card rather than jumping
 * between the card and its buttons as you scroll through it. The readout sits
 * in a fixed corner because a full-width card leaves no room beside it.
 *
 * Either way, React renders only when the locked element changes. Scroll and
 * resize write motion values.
 */

/** Edge length of the free-floating reticle when nothing is locked. */
const IDLE_SIZE = 44;

/** Touch mode's focus line, as a fraction of the viewport height. */
const FOCUS = 0.45;

/** Touch mode keeps the brackets this far inside the viewport. */
const INSET = 6;

/** Entrance animations move targets after scrolling stops; measure once more. */
const SETTLE_MS = 450;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const SPRING = { damping: 25, stiffness: 350, mass: 0.4 };

/** One bracket per corner, drawn as an L so the reticle never reads as a box. */
const CORNER_PATHS = [
  { d: "M 1 1 L 1 9 M 1 1 L 9 1", cls: "top-0 left-0" },
  { d: "M 19 1 L 19 9 M 19 1 L 11 1", cls: "top-0 right-0" },
  { d: "M 1 19 L 1 11 M 1 19 L 9 19", cls: "bottom-0 left-0" },
  { d: "M 19 19 L 19 11 M 19 19 L 11 19", cls: "bottom-0 right-0" },
] as const;

const toRect = (r: DOMRect): Rect => ({
  x: r.left,
  y: r.top,
  width: r.width,
  height: r.height,
});

/** Clamp a rect into the viewport, so a tall card's brackets stay on screen. */
function clampToViewport(r: Rect): Rect {
  const top = Math.max(INSET, r.y);
  const bottom = Math.min(window.innerHeight - INSET, r.y + r.height);
  const left = Math.max(INSET, r.x);
  const right = Math.min(window.innerWidth - INSET, r.x + r.width);
  return {
    x: left,
    y: top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

/** Touch mode: the outermost target crossing the focus line, if any. */
function pickFocused(): Element | null {
  const line = window.innerHeight * FOCUS;
  const hits: Element[] = [];
  document.querySelectorAll("[data-hud-target]").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.top > line || r.bottom < line) return;
    // Cards fade in on view; a lock on one still at opacity 0 frames nothing.
    if (parseFloat(getComputedStyle(el).opacity) < 0.3) return;
    hits.push(el);
  });
  const outer = hits.filter(
    (el) => !hits.some((other) => other !== el && other.contains(el)),
  );
  return outer[0] ?? null;
}

const TargetReticle = React.memo(() => {
  const [mode, setMode] = useState<"fine" | "touch" | null>(null);
  const [label, setLabel] = useState<string | null>(null);

  // The locked element itself, so a scroll re-measures the real node instead of
  // re-querying the DOM by label.
  const lockedEl = useRef<Element | null>(null);

  // Box geometry in viewport coordinates. Position and size are separate motion
  // values so idle -> lock is one continuous spring, not a component swap.
  const boxX = useMotionValue(0);
  const boxY = useMotionValue(0);
  const boxW = useMotionValue(IDLE_SIZE);
  const boxH = useMotionValue(IDLE_SIZE);

  const x = useSpring(boxX, SPRING);
  const y = useSpring(boxY, SPRING);
  const width = useSpring(boxW, SPRING);
  const height = useSpring(boxH, SPRING);

  const applyRect = useCallback(
    (rect: Rect, jump = false) => {
      boxX.set(rect.x);
      boxY.set(rect.y);
      boxW.set(rect.width);
      boxH.set(rect.height);
      // Appearing from nothing: land on the target instead of flying in from
      // wherever the springs last were.
      if (jump) {
        x.jump(rect.x);
        y.jump(rect.y);
        width.jump(rect.width);
        height.jump(rect.height);
      }
    },
    [boxX, boxY, boxW, boxH, x, y, width, height],
  );

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const id = window.setTimeout(() => setMode(fine ? "fine" : "touch"), 0);
    return () => window.clearTimeout(id);
  }, []);

  // ---- Fine pointer ----
  useEffect(() => {
    if (mode !== "fine") return;

    let frame = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // While locked the box belongs to the target, not the cursor.
      if (lockedEl.current) return;
      applyRect({
        x: e.clientX - IDLE_SIZE / 2,
        y: e.clientY - IDLE_SIZE / 2,
        width: IDLE_SIZE,
        height: IDLE_SIZE,
      });
    };

    // A single delegated mouseover covers both directions: entering a target
    // locks, entering anything else clears. Using mouseout instead would
    // unlock every time the pointer crossed between a target's own children.
    const handleMouseOver = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest("[data-hud-target]");

      if (!el) {
        if (lockedEl.current) {
          lockedEl.current = null;
          setLabel(null);
        }
        return;
      }

      if (el === lockedEl.current) return;

      const next = el.getAttribute("data-hud-target");
      if (!next) return;

      lockedEl.current = el;
      setLabel(next);
      applyRect(toRect(el.getBoundingClientRect()));
    };

    const remeasure = () => {
      if (!lockedEl.current) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = lockedEl.current;
        if (el) applyRect(toRect(el.getBoundingClientRect()));
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("scroll", remeasure, { passive: true });
    window.addEventListener("resize", remeasure);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("scroll", remeasure);
      window.removeEventListener("resize", remeasure);
    };
  }, [mode, applyRect]);

  // ---- Touch: scroll drives the lock ----
  useEffect(() => {
    if (mode !== "touch") return;

    let frame = 0;
    let settle = 0;

    const scan = () => {
      const el = pickFocused();

      if (el !== lockedEl.current) {
        const wasEmpty = lockedEl.current === null;
        lockedEl.current = el;
        setLabel(el ? el.getAttribute("data-hud-target") : null);
        if (el) applyRect(clampToViewport(toRect(el.getBoundingClientRect())), wasEmpty);
        return;
      }

      if (el) applyRect(clampToViewport(toRect(el.getBoundingClientRect())));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
      window.clearTimeout(settle);
      settle = window.setTimeout(scan, SETTLE_MS);
    };

    scan();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mode, applyRect]);

  if (!mode) return null;

  const isLocked = label !== null;
  const touch = mode === "touch";
  const color = isLocked ? "#F97316" : "#3B82F6";

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]" aria-hidden="true">
      <motion.div
        style={{ x, y, width, height }}
        // Touch has no idle cursor to show: the brackets exist only when locked.
        animate={{ opacity: touch && !isLocked ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute top-0 left-0"
      >
        {CORNER_PATHS.map((corner) => (
          <svg
            key={corner.cls}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            className={`absolute ${corner.cls}`}
          >
            <motion.path
              d={corner.d}
              fill="none"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              animate={{ stroke: color, opacity: isLocked ? 0.9 : 0.4 }}
              transition={{ duration: 0.18 }}
            />
          </svg>
        ))}

        {/* Crosshair belongs to the free cursor only; it would sit meaninglessly
            in the middle of a locked card. */}
        {!touch && (
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ opacity: isLocked ? 0 : 0.4 }}
            transition={{ duration: 0.18 }}
          >
            <path
              d="M 0 12 L 7 12 M 17 12 L 24 12 M 12 0 L 12 7 M 12 17 L 12 24"
              stroke="#3B82F6"
              strokeWidth="1"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </motion.svg>
        )}

        {!touch && (
          <AnimatePresence>
            {isLocked && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full left-full ml-3 mt-2 flex flex-col gap-0.5 whitespace-nowrap"
              >
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#F97316]">
                  Target Lock
                </span>
                <span className="font-mono text-[8px] uppercase tracking-widest text-slate-500">
                  {label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Touch readout: a fixed corner of the glass, never off screen. */}
      {touch && (
        <AnimatePresence>
          {isLocked && (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-4 left-4 flex items-center gap-2 px-2 py-1 bg-[#020617]/90 border border-[#F97316]/40 font-mono text-[9px] uppercase tracking-widest"
            >
              <span className="w-1.5 h-1.5 bg-[#F97316]" />
              <span className="text-[#F97316]">Lock</span>
              <span className="text-slate-400">{label}</span>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
});

TargetReticle.displayName = "TargetReticle";

export default TargetReticle;
