"use client";

import { useEffect, useState } from "react";
import type { heroData } from "@/lib/data/hero";

/**
 * Local-time instrument beside the hero's profile card.
 *
 * Says one useful thing the rest of the page does not: what time it is where
 * the operator is. A big clock, then a 24-hour track with a marker at the
 * current hour, in the same tick idiom as the canopy's altitude ladders.
 *
 * Renders same-width placeholders on the server and on first paint, so the
 * clock never causes a hydration mismatch or shifts anything.
 */

type Telemetry = typeof heroData.telemetry;

interface Clock {
  hh: string;
  mm: string;
  ss: string;
  /** Fraction of the day elapsed, 0..1. */
  day: number;
}

function useLocalClock(timeZone: string): Clock | null {
  const [clock, setClock] = useState<Clock | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => {
      const parts = format.formatToParts(new Date());
      const get = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? "00";
      // Some engines render midnight as "24".
      const hh = get("hour") === "24" ? "00" : get("hour");
      const mm = get("minute");
      const ss = get("second");
      setClock({ hh, mm, ss, day: (+hh * 3600 + +mm * 60 + +ss) / 86400 });
    };
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [timeZone]);

  return clock;
}

export default function HeroTelemetry({ data }: { data: Telemetry }) {
  const clock = useLocalClock(data.base.timeZone);

  return (
    <div
      data-hud-target="HERO.LOCAL_TIME"
      className="relative w-full max-w-xs border border-white/5 bg-[#020617] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]"
    >
      {/* Screws, as on the nav plates. */}
      <span aria-hidden="true" className="pointer-events-none absolute top-1 left-1 h-1 w-1 bg-slate-800" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-1 right-1 h-1 w-1 bg-slate-800" />

      <div className="flex justify-between items-center gap-4 px-5 py-2.5 border-b border-slate-800 font-mono text-[9px] tracking-widest uppercase">
        <span className="text-slate-400">Local_Time // Base</span>
        <span className="text-slate-400">{data.base.offset}</span>
      </div>

      <div className="px-5 pt-5 pb-4">
        <p className="flex items-baseline gap-2 tabular-nums">
          <span className="font-space font-bold tracking-tighter leading-none text-5xl text-slate-100">
            {clock ? clock.hh : "--"}
            <span className="hud-blink text-[#F97316]">:</span>
            {clock ? clock.mm : "--"}
          </span>
          <span className="font-mono text-sm text-slate-400">
            {clock ? clock.ss : "--"}
          </span>
        </p>
        <p className="mt-2 font-mono text-[10px] tracking-widest uppercase text-slate-400">
          {data.base.city}
        </p>

        {/* 24-hour track: a tick an hour, labelled every six. */}
        <div aria-hidden="true" className="relative mt-5 h-7">
          <div className="absolute inset-x-0 top-0 h-px bg-slate-800" />
          {Array.from({ length: 25 }, (_, h) => {
            const major = h % 6 === 0;
            return (
              <div
                key={h}
                className="absolute top-0"
                style={{ left: `${(h / 24) * 100}%` }}
              >
                <div
                  className={`w-px -translate-x-1/2 ${
                    major ? "h-2 bg-slate-600" : "h-1 bg-slate-800"
                  }`}
                />
                {major && (
                  <span className="absolute top-3 -translate-x-1/2 font-mono text-[8px] tracking-widest text-slate-400">
                    {String(h % 24).padStart(2, "0")}
                  </span>
                )}
              </div>
            );
          })}
          {clock && (
            <div
              className="absolute -top-1.5 h-4 w-px -translate-x-1/2 bg-[#F97316] shadow-[0_0_8px_#F97316]"
              style={{ left: `${clock.day * 100}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
