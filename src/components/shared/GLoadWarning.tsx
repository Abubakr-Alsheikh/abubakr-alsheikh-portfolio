"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

/** Scroll velocity (px/s) that lights the strip, and the lower value that clears it. */
const ENGAGE = 2200;
const RELEASE = 900;

const GLoadWarning = React.memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  const [isWarningActive, setIsWarningActive] = useState(false);
  const [gLoadValue, setGLoadValue] = useState(0);

  useEffect(() => {
    // The strip is only ever mounted above ENGAGE, so state is written on the
    // two threshold crossings and on a changed readout - never once per frame.
    let active = false;
    let lastReadout = 0;

    const unsubscribe = smoothVelocity.on("change", (v) => {
      const absVel = Math.abs(v);

      // Hysteresis keeps the strip from strobing around a single threshold.
      if (!active && absVel > ENGAGE) {
        active = true;
        setIsWarningActive(true);
      } else if (active && absVel < RELEASE) {
        active = false;
        setIsWarningActive(false);
      }

      if (!active) return;

      // Map velocity to a plausible G figure, rounded to the rendered
      // precision so identical readouts do not re-render the strip.
      const readout = Math.round(Math.min(9.9, (absVel / 1000) * 5) * 10) / 10;
      if (readout !== lastReadout) {
        lastReadout = readout;
        setGLoadValue(readout);
      }
    });

    return () => unsubscribe();
  }, [smoothVelocity]);

  return (
    <AnimatePresence>
      {isWarningActive && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
            mass: 0.4,
          }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
        >
          <div className="flex items-center gap-3 bg-[#020617]/90 border border-[#F97316]/40 px-4 py-2 rounded-none font-mono text-[10px] uppercase tracking-[0.2em]">
            {/* Pulsing square indicator */}
            {!prefersReducedMotion ? (
              <motion.div
                className="w-1.5 h-1.5 bg-[#F97316] flex-shrink-0"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            ) : (
              <div className="w-1.5 h-1.5 bg-[#F97316] flex-shrink-0" />
            )}

            {/* Warning text */}
            <span className="text-[#F97316]">G-LOAD HIGH</span>

            {/* Live G number */}
            <span className="text-slate-400">
              {gLoadValue.toFixed(1)} <span className="text-[8px]">G</span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

GLoadWarning.displayName = "GLoadWarning";

export default GLoadWarning;
