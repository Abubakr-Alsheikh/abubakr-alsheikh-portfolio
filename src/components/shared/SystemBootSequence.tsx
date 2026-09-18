"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  MEMORY_CELLS,
  launchStages,
  postChecks,
  type LaunchStage,
  type PostCheck,
} from "@/lib/data/bootSequence";
import WarpField from "@/components/visuals/WarpField";
import NavGlobe from "@/components/visuals/NavGlobe";

/**
 * The boot screen, played as a launch sequence.
 *
 * SELF_TEST → NAV_LOCK → IGNITION → WARP. The POST checklist resolves in the
 * first stage while the nav globe assembles; brackets close on a target in the
 * second; the third throttles the starfield up; at 100% the field jumps to
 * warp, the panels fall away and the page is handed over through a flash.
 *
 * The starfield and the globe run their own rAF loops off refs. The only React
 * state is the progress tick and the scratch register.
 */

/** Run time of the sequence up to 100%. */
const BOOT_MS = 5200;
const TICK_MS = 30;

/** Warp jump between 100% and handing the page over. */
const HANDOVER_MS = 1300;

/** Checklist resolves within the self-test stage. */
const POST_END = launchStages[1].from;

function stageAt(progress: number): LaunchStage {
  let current = launchStages[0];
  for (const s of launchStages) if (progress >= s.from) current = s;
  return current;
}

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
      <span className="text-slate-600 whitespace-nowrap">{check.range}</span>
      {/* Leader dots: the row is a line item on a checklist, not a log line. */}
      <span className="flex-1 overflow-hidden whitespace-nowrap text-slate-800 select-none">
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

/** Viewport corner brackets, so the loader reads as a screen in a console. */
function FrameCorners() {
  const base = "absolute w-6 h-6 md:w-8 md:h-8 border-slate-700";
  return (
    <div aria-hidden="true" className="absolute inset-3 md:inset-6 pointer-events-none">
      <span className={`${base} top-0 left-0 border-l border-t`} />
      <span className={`${base} top-0 right-0 border-r border-t`} />
      <span className={`${base} bottom-0 left-0 border-l border-b`} />
      <span className={`${base} bottom-0 right-0 border-r border-b`} />
    </div>
  );
}

function StageTrack({ current }: { current: LaunchStage }) {
  const index = launchStages.indexOf(current);

  return (
    <ol className="flex items-center gap-2 md:gap-3 font-mono text-[9px] md:text-[10px] tracking-widest uppercase">
      {launchStages.map((s, i) => {
        const done = i < index;
        const active = i === index;
        const hot = s.id === "ignition" || s.id === "warp";
        const tone = active
          ? hot
            ? "text-[#F97316]"
            : "text-[#3B82F6]"
          : done
            ? "text-slate-400"
            : "text-slate-700";

        return (
          <li key={s.id} className="flex items-center gap-2 md:gap-3">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`block h-px w-4 md:w-12 ${
                  i <= index ? "bg-slate-500" : "bg-slate-800"
                }`}
              />
            )}
            <span className={`flex items-center gap-1.5 ${tone}`}>
              <span
                aria-hidden="true"
                className={`block w-1.5 h-1.5 ${
                  active
                    ? `hud-blink ${hot ? "bg-[#F97316]" : "bg-[#3B82F6]"}`
                    : done
                      ? "bg-slate-400"
                      : "border border-slate-700"
                }`}
              />
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
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
    let handover = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const next = Math.min(Math.floor((currentStep / steps) * 100), 100);
      setProgress(next);

      if (next >= 100) {
        clearInterval(progressInterval);
        handover = window.setTimeout(() => onComplete(), HANDOVER_MS);
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
      window.clearTimeout(handover);
    };
  }, [onComplete]);

  const stage = stageAt(progress);
  const resolvedCount = Math.floor(
    (Math.min(progress, POST_END) / POST_END) * postChecks.length,
  );
  const complete = progress >= 100;
  const hot = stage.id === "ignition" || stage.id === "warp";

  // Ignition throttles the starfield up before the jump.
  const ignitionFrom = launchStages[2].from;
  const throttle =
    progress < ignitionFrom ? 0 : (progress - ignitionFrom) / (100 - ignitionFrom);

  const remaining = ((1 - progress / 100) * BOOT_MS) / 1000;
  const countdown = `T-${remaining.toFixed(2).padStart(5, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#020617] overflow-hidden selection:bg-transparent cursor-wait"
    >
      <WarpField engaged={complete} throttle={throttle} />

      <FrameCorners />

      {/* Top telemetry strip */}
      <div className="absolute top-6 inset-x-8 md:top-10 md:inset-x-14 flex justify-between font-mono text-[9px] md:text-[10px] tracking-widest uppercase text-slate-500">
        <span>Orbital_Core // Boot_Rom v3.0</span>
        <span className="tabular-nums text-slate-600">{hexCode}</span>
      </div>

      {/* Console: falls away as the jump starts. */}
      <motion.div
        initial={false}
        animate={
          complete
            ? { opacity: 0, scale: 1.08, filter: "blur(4px)" }
            : { opacity: 1, scale: 1, filter: "blur(0px)" }
        }
        transition={{ duration: 0.55, ease: "easeIn", delay: 0.1 }}
        className="relative z-10 h-full w-full flex items-center justify-center px-6 md:px-16"
      >
        <div className="w-full max-w-6xl grid grid-cols-[minmax(0,1fr)] gap-4 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center">
          <div className="order-1 lg:order-2 mx-auto w-[220px] sm:w-[300px] lg:w-full max-w-[480px] aspect-square">
            <NavGlobe progress={progress} stage={stage.id} />
          </div>

          <div className="order-2 lg:order-1 w-full max-w-xl mx-auto bg-[#020617]/75 border border-slate-800 p-5 md:p-6">
            <div className="flex justify-between items-end gap-4 border-b border-slate-800 pb-3 mb-5">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1">
                  SYS.ARCH // ABUBAKR_ALSHEIKH
                </span>
                <span
                  className={`text-xs font-mono tracking-widest uppercase flex items-center gap-2 ${
                    hot ? "text-[#F97316]" : "text-[#3B82F6]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 hud-blink ${
                      hot ? "bg-[#F97316]" : "bg-[#3B82F6]"
                    }`}
                  />
                  {stage.status}
                </span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[9px] font-mono text-slate-600 tracking-widest uppercase">
                  Launch_In
                </span>
                <span className="font-mono text-2xl md:text-3xl tabular-nums tracking-tight text-slate-100 leading-none mt-1">
                  {countdown}
                </span>
              </div>
            </div>

            {/* Self test checklist */}
            <div className="flex flex-col gap-1.5 mb-5">
              {postChecks.map((check, i) => (
                <PostRow key={check.sys} check={check} resolved={i < resolvedCount} />
              ))}
            </div>

            {/* Memory map: cells commit left to right as the test walks the range. */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2 text-[9px] font-mono text-slate-600 tracking-widest uppercase">
                <span>Memory_Map</span>
                <span className="tabular-nums">
                  {String(
                    Math.round((Math.min(progress, POST_END) / POST_END) * 64),
                  ).padStart(2, "0")}
                  /64 KB
                </span>
              </div>
              {/* Tailwind only ships grid-cols up to 12, so the map declares its
                  own track count. */}
              <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[3px] md:grid-cols-[repeat(32,minmax(0,1fr))]">
                {Array.from({ length: MEMORY_CELLS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 transition-colors duration-100 ${
                      progress > (i / MEMORY_CELLS) * POST_END
                        ? "bg-[#3B82F6]/60"
                        : "bg-slate-900"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                <span>{complete ? "System_Nominal" : "Core_Load"}</span>
                <span className={`tabular-nums ${hot ? "text-[#F97316]" : ""}`}>
                  {progress}%
                </span>
              </div>
              <div className="w-full h-1 bg-slate-900 border border-slate-800 relative overflow-hidden">
                <motion.div
                  className={`absolute top-0 left-0 h-full ${
                    hot
                      ? "bg-[#F97316] shadow-[0_0_10px_#F97316]"
                      : "bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]"
                  }`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.1 }}
                />
                {/* Stage boundaries */}
                {launchStages.slice(1, -1).map((s) => (
                  <span
                    key={s.id}
                    aria-hidden="true"
                    className="absolute top-0 h-full w-px bg-[#020617]"
                    style={{ left: `${s.from}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* The jump: a title over the warp, then a flash into the page. */}
      <motion.div
        aria-hidden={!complete}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={complete ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.25 }}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
      >
        <span className="font-mono text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#F97316] mb-3">
          All subsystems nominal
        </span>
        <span className="font-space font-bold uppercase tracking-tighter text-slate-100 text-4xl sm:text-6xl md:text-8xl leading-none">
          Engaging_Warp
        </span>
      </motion.div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={complete ? { opacity: [0, 0, 0.45, 0.2] } : { opacity: 0 }}
        transition={{
          duration: HANDOVER_MS / 1000,
          times: [0, 0.7, 0.92, 1],
          ease: "easeIn",
        }}
        className="absolute inset-0 z-30 bg-[#E2E8F0] pointer-events-none"
      />

      {/* Stage track */}
      <div className="absolute bottom-6 md:bottom-10 inset-x-0 flex justify-center px-6">
        <StageTrack current={stage} />
      </div>
    </motion.div>
  );
}
