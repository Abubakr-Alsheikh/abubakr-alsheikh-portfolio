"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  MEMORY_CELLS,
  postChecks,
  type PostCheck,
} from "@/lib/data/bootSequence";

/** Total run time of the self test before the page is handed over. */
const BOOT_MS = 5500;
const TICK_MS = 30;

/** Beat after the last check resolves, so "SYSTEM NOMINAL" lands. */
const HANDOVER_MS = 900;

function PostRow({ check, resolved }: { check: PostCheck; resolved: boolean }) {
  const passed = check.result === "OK";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: resolved ? 1 : 0.25, x: resolved ? 0 : -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-baseline gap-3 font-mono text-[10px] md:text-xs tracking-widest"
    >
      <span className="w-8 shrink-0 text-slate-300">{check.sys}</span>
      <span className="text-slate-600">{check.range}</span>
      {/* Leader dots: the row is a line item on a checklist, not a log line. */}
      <span className="flex-1 overflow-hidden text-slate-800 select-none">
        {"·".repeat(64)}
      </span>
      <span
        className={
          !resolved
            ? "text-slate-700"
            : passed
              ? "text-[#3B82F6]"
              : "text-slate-600"
        }
      >
        {resolved ? check.result : "··"}
      </span>
    </motion.div>
  );
}

export default function SystemBootSequence({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [hexCode, setHexCode] = useState("0x00000000");

  useEffect(() => {
    const steps = BOOT_MS / TICK_MS;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const next = Math.min(Math.floor((currentStep / steps) * 100), 100);
      setProgress(next);

      if (next >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => onComplete(), HANDOVER_MS);
      }
    }, TICK_MS);

    // Scratch register readout. Random is safe here because it only ever runs
    // client-side, after mount, and never renders on the server.
    const hexInterval = setInterval(() => {
      setHexCode(
        `0x${Math.floor(Math.random() * 16777215)
          .toString(16)
          .toUpperCase()
          .padStart(8, "0")}`,
      );
    }, 50);

    return () => {
      clearInterval(progressInterval);
      clearInterval(hexInterval);
    };
  }, [onComplete]);

  // The checklist resolves across the first 88% of the run; the tail is the
  // memory map finishing and the nominal banner.
  const resolvedCount = Math.floor((progress / 88) * postChecks.length);
  const complete = progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] overflow-hidden selection:bg-transparent cursor-wait"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] md:w-[80vw] max-w-[1200px] aspect-square opacity-[0.15] pointer-events-none">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full stroke-[#3B82F6] fill-none"
          aria-hidden="true"
        >
          <g transform="translate(100, 100)">
            <circle
              cx="0"
              cy="0"
              r="20"
              strokeWidth="0.4"
              className="stroke-slate-500"
            />
            <motion.ellipse
              cx="0"
              cy="0"
              rx="45"
              ry="15"
              strokeWidth="0.4"
              strokeDasharray="2 4"
              animate={{ rotateZ: complete ? [0, 1440] : [0, 360] }}
              transition={{ duration: complete ? 2 : 20, ease: "linear" }}
            />
            <motion.ellipse
              cx="0"
              cy="0"
              rx="65"
              ry="20"
              strokeWidth="0.6"
              animate={{ rotateZ: complete ? [1440, 0] : [360, 0] }}
              transition={{ duration: complete ? 2 : 25, ease: "linear" }}
            />
            <motion.ellipse
              cx="0"
              cy="0"
              rx="85"
              ry="25"
              strokeWidth="0.2"
              strokeDasharray="1 6"
              animate={{ rotateZ: complete ? [0, 1440] : [0, 360] }}
              transition={{ duration: complete ? 2 : 30, ease: "linear" }}
            />
          </g>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col">
        <div className="flex justify-between items-end border-b border-slate-800 pb-2 mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1">
              SYS.ARCH // ABUBAKR_ALSHEIKH
            </span>
            <span className="text-xs font-mono text-[#3B82F6] tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#3B82F6] animate-pulse rounded-sm" />
              POWER_ON_SELF_TEST
            </span>
          </div>
          <span className="text-xs font-mono text-slate-600 tracking-widest">
            {hexCode}
          </span>
        </div>

        {/* Self test checklist */}
        <div className="flex flex-col gap-1.5 mb-6">
          {postChecks.map((check, i) => (
            <PostRow key={check.sys} check={check} resolved={i < resolvedCount} />
          ))}
        </div>

        {/* Memory map: cells commit left to right as the test walks the range. */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 text-[9px] font-mono text-slate-600 tracking-widest uppercase">
            <span>Memory_Map</span>
            <span className="tabular-nums">
              {String(Math.round((progress / 100) * 64)).padStart(2, "0")}/64 KB
            </span>
          </div>
          {/* Tailwind only ships grid-cols up to 12, so the map declares its
              own track count. */}
          <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[3px] md:grid-cols-[repeat(32,minmax(0,1fr))]">
            {Array.from({ length: MEMORY_CELLS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 transition-colors duration-100 ${
                  progress > (i / MEMORY_CELLS) * 100
                    ? "bg-[#3B82F6]/60"
                    : "bg-slate-900"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 tracking-widest uppercase">
            <span>{complete ? "System_Nominal" : "Core_Load"}</span>
            <span className={complete ? "text-[#F97316]" : ""}>{progress}%</span>
          </div>
          <div className="w-full h-1 bg-slate-900 border border-slate-800 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-[#F97316] shadow-[0_0_10px_#F97316]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: complete ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 flex items-center gap-2 font-mono text-xs md:text-sm tracking-widest uppercase text-[#F97316] font-bold"
        >
          <span className="w-1.5 h-1.5 bg-[#F97316]" />
          All subsystems nominal — handing over
        </motion.div>
      </div>
    </motion.div>
  );
}
