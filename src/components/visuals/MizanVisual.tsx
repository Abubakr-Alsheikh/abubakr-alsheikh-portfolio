"use client";

import { Database, Scale, Send, Smartphone, Sparkles, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useOffscreen } from "@/hooks/useOffscreen";
import {
  anchor,
  legMid,
  nodeStyle,
  route,
  Wire,
  WireLabel,
  WirePort,
  WiringLayer,
  type HudNode,
} from "./HudWiring";

/**
 * Mizan: two clients feeding one API, which reads what it can with code and
 * hands the rest down a chain of AI providers before it writes to Postgres.
 *
 * Built on the QaderVisual pattern: one coordinate map for nodes and wires,
 * names hung off each node's body, CSS keyframe loops that freeze off screen,
 * and a timer that stops with them.
 */

/** Panel percentages. `rx`/`ry` are the half-size of the body a wire stops
 *  at, measured against the panel at its usual size. */
const NODES = {
  telegram: { x: 14, y: 50, rx: 4.6, ry: 4.3 },
  pwa: { x: 14, y: 80, rx: 4.6, ry: 4.3 },
  core: { x: 48, y: 62, rx: 5.4, ry: 5 },
  ai: { x: 84, y: 40, rx: 4.5, ry: 4.1 },
  db: { x: 84, y: 82, rx: 4.5, ry: 4.1 },
} satisfies Record<string, HudNode>;

/** The two client wires turn on one line, and so do the two outgoing ones. */
const IN_BUS_X = 31;
const OUT_BUS_X = 68;

/** The text chain, in the order a message falls through it. */
const CHAIN = ["GEMINI FLASH-LITE", "GEMINI FLASH", "GROQ GPT-OSS-120B", "GROQ GPT-OSS-20B"];

type Path = "parser" | "ai" | "keypad";

interface FeedEvent {
  from: "TG" | "PWA";
  input: string;
  path: Path;
  /** Index into CHAIN for messages the model reads. */
  model?: number;
  result: string;
  spent: number;
}

/** Illustrative traffic: the kinds of entry the product takes. */
const FEED: FeedEvent[] = [
  { from: "TG", input: "خبز 500", path: "parser", result: "PARSER HIT -> SAVED", spent: 500 },
  { from: "TG", input: "voice note 0:04", path: "ai", result: "WHISPER -> SAVED", spent: 3200 },
  { from: "PWA", input: "keypad 12,000", path: "keypad", result: "VALIDATED -> SAVED", spent: 12000 },
  { from: "TG", input: "receipt.jpg", path: "ai", model: 1, result: "LIMIT -> NEXT MODEL", spent: 7400 },
  { from: "TG", input: "taxi 3$", path: "parser", result: "PARSER HIT -> USD", spent: 4500 },
];

const START_BALANCE = 64000;

export default function MizanVisual() {
  const { ref, offscreen } = useOffscreen();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (offscreen) return;
    const interval = setInterval(() => setStep((s) => s + 1), 1800);
    return () => clearInterval(interval);
  }, [offscreen]);

  const current = FEED[step % FEED.length];
  const recent = Array.from({ length: 4 }, (_, i) => FEED[(step - 3 + i + FEED.length * 4) % FEED.length]);
  const spentThisRound = FEED.slice(0, (step % FEED.length) + 1).reduce((sum, e) => sum + e.spent, 0);
  const balance = START_BALANCE - spentThisRound;
  const safeToday = Math.floor(balance / 9);

  const tgOut = anchor(NODES.telegram, "right");
  const pwaOut = anchor(NODES.pwa, "right");
  const coreIn = anchor(NODES.core, "left");
  const coreOut = anchor(NODES.core, "right");
  const aiIn = anchor(NODES.ai, "left");
  const dbIn = anchor(NODES.db, "left");

  const fromTg = route(tgOut, coreIn, IN_BUS_X);
  const fromPwa = route(pwaOut, coreIn, IN_BUS_X);
  const toAi = route(coreOut, aiIn, OUT_BUS_X);
  const toDb = route(coreOut, dbIn, OUT_BUS_X);

  return (
    <div
      ref={ref}
      data-offscreen={offscreen || undefined}
      className="relative w-full h-full min-h-[450px] xl:min-h-[400px] bg-[#020617] border border-slate-800 flex flex-col group overflow-hidden font-mono text-slate-300"
    >
      {/* 1. Hardware header */}
      <div className="h-8 border-b border-slate-800 flex items-center px-4 justify-between bg-[#020617] z-30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] shrink-0">
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 bg-slate-700" />
          <div className="hud-pulse [--hud-dur:2s] w-1.5 h-1.5 bg-[#3B82F6]" />
          <div className="w-1.5 h-1.5 bg-[#F97316]" />
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest truncate pl-2">
          Mizan_Ledger_Flow.exe
        </span>
      </div>

      {/* 2. Main HUD area */}
      <div className="flex-1 relative bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem]">
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none z-0">
          <div className="hud-traverse-y [--hud-dur:12s] absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#F97316_50%,transparent_100%)]" />
        </div>

        {/* 3. Interconnect. The AI wire carries packets only while the model
            is reading the current message; code-parsed entries skip it. */}
        <WiringLayer>
          <Wire d={fromTg} tone="#3B82F6" dash="14 120" seconds={1.2} live={current.from === "TG"} />
          <Wire d={fromPwa} tone="#3B82F6" dash="14 120" seconds={1.2} live={current.from === "PWA"} />
          <Wire d={toAi} tone="#F97316" dash="10 140" seconds={1.4} live={current.path === "ai"} />
          <Wire d={toDb} tone="#10B981" dash="16 170" seconds={1.5} delaySeconds={0.3} />
        </WiringLayer>

        <WirePort at={tgOut} />
        <WirePort at={pwaOut} />
        <WirePort at={coreIn} />
        <WirePort at={coreOut} />
        <WirePort at={aiIn} tone="#F97316" />
        <WirePort at={dbIn} tone="#10B981" />

        <WireLabel at={legMid(IN_BUS_X, coreIn)}>/api/v1</WireLabel>
        <WireLabel at={legMid(OUT_BUS_X, aiIn)} tone="text-[#F97316]">
          MISSES ONLY
        </WireLabel>
        <WireLabel at={legMid(OUT_BUS_X, dbIn)} tone="text-[#10B981]">
          DRIZZLE
        </WireLabel>

        {/* 4. Telemetry panels */}
        <div className="absolute top-4 left-4 z-20 w-[200px] lg:w-[240px] pointer-events-none">
          <div className="border border-slate-800 bg-[#020617]/90 p-3">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
              <Send className="w-3 h-3 text-[#3B82F6]" />
              <span className="text-[10px] text-[#3B82F6] tracking-widest">ENTRY_FEED</span>
            </div>
            <div className="flex flex-col gap-1">
              {recent.map((e, i) => (
                <div
                  key={`${step}-${i}`}
                  className={`flex justify-between gap-2 text-[7px] lg:text-[8px] ${i === recent.length - 1 ? "text-slate-100" : "text-slate-400"}`}
                >
                  <span className="truncate">
                    [{e.from}] <bdi>{e.input}</bdi>
                  </span>
                  <span className={e.path === "ai" ? "text-[#F97316] shrink-0" : "text-emerald-500 shrink-0"}>
                    {e.path === "ai" ? "AI" : e.path === "parser" ? "CODE" : "FORM"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20 w-[150px] lg:w-[190px] pointer-events-none">
          <div className="border border-slate-800 bg-[#020617]/90 p-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 tracking-widest mb-2 border-b border-slate-800 pb-2">
              <Wallet className="w-3 h-3 text-emerald-500" />
              SAFE_TO_SPEND
            </div>
            <div className="text-[13px] lg:text-[15px] font-bold text-emerald-500 tracking-wider">
              {safeToday.toLocaleString("en-US")} <span className="text-[8px] text-slate-400">SYP / DAY</span>
            </div>
            <div className="mt-2 h-1 w-full bg-slate-800">
              <div
                className="h-full bg-emerald-500 transition-[width] duration-700"
                style={{ width: `${Math.round((balance / START_BALANCE) * 100)}%` }}
              />
            </div>
            <div className="mt-1 text-[7px] lg:text-[8px] text-slate-400">
              {current.result}
            </div>
          </div>
        </div>

        {/* 5. Nodes */}

        {/* Telegram bot */}
        <div
          style={nodeStyle(NODES.telegram)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14"
        >
          <div
            className={`w-full h-full rounded-full border-2 bg-[#020617] flex items-center justify-center relative transition-colors ${current.from === "TG" ? "border-[#3B82F6]" : "border-slate-700"}`}
          >
            <Send className="w-5 h-5 lg:w-6 lg:h-6 text-[#3B82F6]" />
            <div className="hud-spin [--hud-dur:8s] absolute inset-1 rounded-full border border-dashed border-[#3B82F6]/40" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center bg-[#020617] px-1">
            <span className="text-[9px] lg:text-[10px] tracking-widest whitespace-nowrap">TELEGRAM BOT</span>
            <span className="text-[7px] lg:text-[8px] text-slate-400 whitespace-nowrap">TEXT · VOICE · PHOTO</span>
          </div>
        </div>

        {/* PWA keypad */}
        <div
          style={nodeStyle(NODES.pwa)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14"
        >
          <div
            className={`w-full h-full border-2 bg-[#020617] flex items-center justify-center transition-colors ${current.from === "PWA" ? "border-[#3B82F6]" : "border-slate-700"}`}
          >
            <Smartphone className="w-5 h-5 lg:w-6 lg:h-6 text-slate-300" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center bg-[#020617] px-1">
            <span className="text-[9px] lg:text-[10px] tracking-widest whitespace-nowrap">PWA KEYPAD</span>
            <span className="text-[7px] lg:text-[8px] text-slate-400 whitespace-nowrap">AR · EN · TR</span>
          </div>
        </div>

        {/* The API core */}
        <div
          style={nodeStyle(NODES.core)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center"
        >
          <div className="hud-spin [--hud-dur:30s] absolute w-[140px] h-[140px] lg:w-[160px] lg:h-[160px] rounded-full border border-slate-800" />
          <div className="hud-spin-rev [--hud-dur:18s] absolute w-[104px] h-[104px] lg:w-[120px] lg:h-[120px] rounded-full border-[3px] border-dashed border-[#F97316]/30" />

          <div className="w-14 h-14 lg:w-16 lg:h-16 bg-[#020617] border-2 border-[#F97316] flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.25)] relative shrink-0">
            <Scale className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            <div className="hud-flash [--hud-dur:1.8s] absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" />
          </div>

          <div
            className={`absolute -top-[44px] text-[7px] lg:text-[8px] tracking-widest bg-[#020617] px-1 whitespace-nowrap ${current.path === "parser" ? "text-emerald-500" : "text-slate-400"}`}
          >
            PATTERN PARSER {current.path === "parser" ? "[HIT]" : "[PASS]"}
          </div>
          <div className="absolute -bottom-[44px] text-[7px] lg:text-[8px] tracking-widest text-[#3B82F6] bg-[#020617] px-1 whitespace-nowrap">
            MEMBERSHIP GUARD
          </div>
          <div className="absolute -bottom-[66px] text-[10px] lg:text-[12px] font-bold text-white tracking-widest whitespace-nowrap">
            HONO API · NEXT.JS
          </div>
        </div>

        {/* AI fallback chain */}
        <div
          style={nodeStyle(NODES.ai)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14"
        >
          <div
            className={`w-full h-full rounded-full border-2 bg-[#020617] flex items-center justify-center relative transition-colors ${current.path === "ai" ? "border-[#F97316]" : "border-slate-700"}`}
          >
            <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />
            <div className="hud-spin [--hud-dur:4s] absolute inset-[-4px] rounded-full border-t-2 border-[#F97316]/70" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-end bg-[#020617] px-1">
            <span className="text-[9px] lg:text-[10px] font-bold tracking-widest text-white whitespace-nowrap self-center">
              AI FALLBACK
            </span>
            {CHAIN.map((name, i) => (
              <span
                key={name}
                className={`text-[7px] lg:text-[8px] whitespace-nowrap ${current.path === "ai" && current.model === i ? "text-[#F97316]" : "text-slate-400"}`}
              >
                {i + 1}. {name}
              </span>
            ))}
          </div>
        </div>

        {/* Postgres */}
        <div
          style={nodeStyle(NODES.db)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14"
        >
          <div className="w-full h-full rounded-full border-2 border-slate-700 bg-[#020617] flex items-center justify-center relative">
            <Database className="w-5 h-5 lg:w-6 lg:h-6 text-slate-300" />
            <div className="hud-level [--hud-dur:1.5s] absolute bottom-1 right-1 w-1 h-[calc(100%-0.5rem)] bg-[#10B981]" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center text-center bg-[#020617] px-1">
            <span className="text-[10px] lg:text-[12px] font-bold tracking-widest text-white whitespace-nowrap">
              SUPABASE PG
            </span>
            <span className="text-[8px] lg:text-[9px] text-[#10B981] whitespace-nowrap">[NUMERIC · RATE OF DAY]</span>
          </div>
        </div>
      </div>
    </div>
  );
}
