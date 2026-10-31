"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hologram, { type HoloRun } from "./Hologram";
import { qaderSystem } from "@/lib/data/qaderSystem";

/**
 * Qader's panel is about the tools, not the product: a stack manifest that ticks
 * off each tool as the scan reaches it. It is company work, so nothing here
 * traces how the product behaves, and the footer says as much.
 */
function Manifest({ run }: { run: HoloRun }) {
  const seen = useRef(new Set<string>());
  const [, setTicks] = useState(0);
  const current = run.steps[run.stepIndex]?.to;

  useEffect(() => {
    if (!current || seen.current.has(current)) return;
    seen.current.add(current);
    setTicks(seen.current.size);
  }, [current]);

  const groups = useMemo(
    () =>
      qaderSystem.layers.map((layer) => ({
        id: layer.id,
        label: layer.label,
        tools: qaderSystem.nodes.filter((n) => n.layer === layer.id),
      })),
    [],
  );
  const total = qaderSystem.nodes.length;

  return (
    <div className="h-full flex flex-col">
      <div className="h-6 shrink-0 flex items-center justify-between px-2 border-b border-slate-800 text-[9px] tracking-widest text-slate-400">
        <span>STACK.MANIFEST</span>
        <span className="tabular-nums text-[#60A5FA]">
          {seen.current.size}/{total}
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden p-2 grid grid-cols-3 sm:grid-cols-1 gap-x-3 gap-y-1.5 content-start">
        {groups.map((group) => (
          <div key={group.id} className="min-w-0">
            <div className={`text-[8px] tracking-widest ${group.id === run.scenario.id ? "text-[#F97316]" : "text-slate-400"}`}>
              {group.label}
            </div>
            <ul className="hidden sm:block">
              {group.tools.map((tool) => {
                const on = tool.id === current;
                const done = seen.current.has(tool.id);
                return (
                  <li
                    key={tool.id}
                    className={`flex justify-between gap-2 text-[9px] leading-[13px] ${
                      on ? "text-[#F97316]" : done ? "text-slate-200" : "text-slate-400"
                    }`}
                  >
                    <span className="truncate">{tool.label.toLowerCase()}</span>
                    <span aria-hidden="true" className={done ? "text-emerald-500" : "text-slate-700"}>
                      {done ? "ok" : "--"}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="sm:hidden text-[9px] leading-[13px] text-slate-300 truncate">
              {group.tools.filter((tool) => seen.current.has(tool.id)).length}/{group.tools.length} scanned
            </div>
          </div>
        ))}
      </div>
      <p className="hidden sm:block shrink-0 px-2 pb-1.5 text-[8px] leading-[11px] tracking-wide text-slate-400">
        COMPANY PRODUCT. TOOLS ONLY, NO INTERNALS.
      </p>
    </div>
  );
}

export default function QaderVisual() {
  return <Hologram system={qaderSystem} instrument={(run) => <Manifest run={run} />} />;
}
