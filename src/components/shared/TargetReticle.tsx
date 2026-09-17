"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";

/** Edge length of the free-floating reticle when nothing is locked. */
const IDLE_SIZE = 44;

interface LockTarget {
  label: string;
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

const TargetReticle = React.memo(() => {
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [lock, setLock] = useState<LockTarget | null>(null);

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
    (rect: Pick<LockTarget, "x" | "y" | "width" | "height">) => {
      boxX.set(rect.x);
      boxY.set(rect.y);
      boxW.set(rect.width);
      boxH.set(rect.height);
    },
    [boxX, boxY, boxW, boxH],
  );

  useEffect(() => {
    setHasFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!hasFinePointer) return;

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
          setLock(null);
        }
        return;
      }

      if (el === lockedEl.current) return;

      const label = el.getAttribute("data-hud-target");
      if (!label) return;

      const rect = el.getBoundingClientRect();
      lockedEl.current = el;
      setLock({
        label,
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
      applyRect({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    };

    // Scroll and resize only move the box; the lock state itself is unchanged,
    // so this writes motion values and never triggers a React render.
    const remeasure = () => {
      if (!lockedEl.current) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = lockedEl.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        applyRect({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        });
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
  }, [hasFinePointer, applyRect]);

  if (!hasFinePointer) return null;

  const isLocked = lock !== null;
  const color = isLocked ? "#F97316" : "#3B82F6";

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]" aria-hidden="true">
      <motion.div
        style={{ x, y, width, height }}
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
                {lock.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

TargetReticle.displayName = "TargetReticle";

export default TargetReticle;
