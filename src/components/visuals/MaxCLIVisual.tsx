"use client";

import { logLines } from "./holoLog";
import Hologram, { type HoloRun } from "./Hologram";
import { maxSystem } from "@/lib/data/maxSystem";

/**
 * Max's own screen beside its hologram: a real terminal that prints as the run
 * walks, and stops on a [y/N] the visitor has to answer. That question is the
 * point of this panel, because asking first is what makes the agent safe to use.
 */
function Terminal({ run }: { run: HoloRun }) {
  const lines = logLines(run);
  return (
    <div className="h-full flex flex-col text-[10px] leading-[15px]">
      <div className="h-6 shrink-0 flex items-center gap-1.5 px-2 border-b border-slate-800 text-[9px] tracking-widest text-slate-400">
        <span className="text-emerald-500">●</span> TERMINAL
      </div>
      <div
        role="log"
        aria-label="Terminal output"
        className="flex-1 min-h-0 overflow-hidden flex flex-col justify-end p-2 gap-0.5"
      >
        {lines.map((line, i) => (
          <div
            key={`${run.scenario.id}-${i}`}
            className={`break-words ${
              line.startsWith("$")
                ? "text-slate-100"
                : line.startsWith("ok")
                  ? "text-emerald-500"
                  : line.startsWith("x ")
                    ? "text-red-400"
                    : line.startsWith("?")
                      ? "text-[#F97316]"
                      : "text-slate-400"
            }`}
          >
            {line}
          </div>
        ))}
        {run.awaiting ? (
          <div className="mt-1 flex gap-1.5">
            <button
              type="button"
              onClick={() => run.respond(true)}
              data-hud-target="HOLO.CONFIRM.YES"
              className="h-7 flex-1 border border-emerald-500/70 text-emerald-500 tracking-widest hover:bg-emerald-500/10 transition-colors"
            >
              Y · YES
            </button>
            <button
              type="button"
              onClick={() => run.respond(false)}
              data-hud-target="HOLO.CONFIRM.NO"
              className="h-7 flex-1 border border-red-500/60 text-red-400 tracking-widest hover:bg-red-500/10 transition-colors"
            >
              N · NO
            </button>
          </div>
        ) : (
          <span aria-hidden="true" className="hud-blink text-slate-400">_</span>
        )}
      </div>
    </div>
  );
}

export default function MaxCLIVisual() {
  return <Hologram system={maxSystem} instrument={(run) => <Terminal run={run} />} />;
}
