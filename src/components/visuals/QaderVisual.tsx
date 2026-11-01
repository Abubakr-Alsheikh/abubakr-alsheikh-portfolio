"use client";

import Hologram, { type HoloRun } from "./Hologram";
import { logLines } from "./holoLog";
import { qaderSystem } from "@/lib/data/qaderSystem";

/**
 * A network waterfall beside the hologram, the view an engineer opens first in
 * DevTools: each hop gets a bar, stepping down and across as the request travels,
 * with what it travels over at the end of the row. The bars show order, not
 * measured time. Qader is company work, so the footer says these are simplified
 * flows with placeholder paths.
 */
function Waterfall({ run }: { run: HoloRun }) {
  const rows = logLines(run).map((line) => {
    const [kind, title, protocol] = line.split("|");
    return { back: kind === "back", title, protocol };
  });
  const lanes = Math.max(run.steps.length, 1);
  const last = run.steps[run.steps.length - 1];
  const verb = run.scenario.input;

  return (
    <div className="h-full flex flex-col">
      <div className="h-6 shrink-0 flex items-center justify-between gap-2 px-2 border-b border-slate-800 text-[9px] tracking-widest text-slate-400">
        <span className="truncate">NETWORK</span>
        <span className="text-[#F97316] truncate">{verb}</span>
      </div>
      <div
        role="log"
        aria-label="Request trace"
        className="flex-1 min-h-0 overflow-hidden flex flex-col justify-end sm:justify-start p-2 gap-1.5"
      >
        {rows.map((row, i) => (
          <div key={`${run.scenario.id}-${i}`} className="text-[9px] leading-[11px]">
            <div className="flex justify-between gap-2">
              <span className={row.back ? "text-emerald-500" : "text-slate-200"}>{row.title}</span>
              <span className="text-slate-400 truncate">{row.protocol}</span>
            </div>
            <div className="mt-0.5 h-1 w-full bg-slate-800/60">
              <div
                className={`hud-grow h-full ${row.back ? "bg-emerald-500" : "bg-[#3B82F6]"}`}
                style={{
                  marginLeft: `${(i / lanes) * 100}%`,
                  width: `${(1 / lanes) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
        {run.finished && (
          <div className="mt-1 text-[9px] tracking-widest text-emerald-500">
            {last?.back ? "COMPLETE" : "DONE"}
          </div>
        )}
      </div>
      <p className="hidden sm:block shrink-0 px-2 pb-1.5 text-[8px] leading-[11px] tracking-wide text-slate-400">
        SIMPLIFIED FLOWS. COMPANY PRODUCT, NO INTERNALS.
      </p>
    </div>
  );
}

export default function QaderVisual() {
  return <Hologram system={qaderSystem} instrument={(run) => <Waterfall run={run} />} />;
}
