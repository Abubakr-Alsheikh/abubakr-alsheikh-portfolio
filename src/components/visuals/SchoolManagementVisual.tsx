"use client";

import { logLines } from "./holoLog";
import Hologram, { type HoloRun } from "./Hologram";
import { schoolSystem } from "@/lib/data/schoolSystem";

/**
 * A SQL console beside the hologram: the statement, its bound values and what
 * came back, with the repo's own queries. The Inject run is the point of it. The
 * attack reaches the database as a plain value, and nothing leaks.
 */

const TONE: Record<string, string> = {
  sql: "text-[#60A5FA]",
  call: "text-slate-400",
  bind: "text-[#F97316]",
  row: "text-slate-100",
  done: "text-emerald-500",
  safe: "text-emerald-500",
};

function SqlConsole({ run }: { run: HoloRun }) {
  return (
    <div className="h-full flex flex-col">
      <div className="h-6 shrink-0 flex items-center justify-between px-2 border-b border-slate-800 text-[9px] tracking-widest text-slate-400">
        <span>SQL&gt; ORACLE</span>
        <span className={run.scenario.id === "inject" ? "text-red-400" : "text-slate-400"}>
          {run.scenario.id === "inject" ? "ATTACK" : "SESSION"}
        </span>
      </div>
      <div
        role="log"
        aria-label="SQL console"
        className="flex-1 min-h-0 overflow-hidden flex flex-col justify-end p-2 gap-0.5 text-[10px] leading-[14px]"
      >
        {logLines(run).map((line, i) => {
          const [kind, text] = line.split("|");
          return (
            <div key={`${run.scenario.id}-${i}`} className={`break-all ${TONE[kind] ?? "text-slate-400"}`}>
              {kind === "bind" ? `  ${text}` : text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SchoolManagementVisual() {
  return <Hologram system={schoolSystem} instrument={(run) => <SqlConsole run={run} />} />;
}
