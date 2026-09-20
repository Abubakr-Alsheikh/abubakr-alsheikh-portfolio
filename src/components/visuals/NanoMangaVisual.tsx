"use client";

import { motion } from "framer-motion";
import {
  Terminal,
  FileJson,
  BrainCircuit,
  Eye,
  Image as ImageIcon,
  Layers,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useOffscreen } from "@/hooks/useOffscreen";
import {
  anchor,
  legMid,
  nodeStyle,
  route,
  routeV,
  Wire,
  WireLabel,
  WirePort,
  WiringLayer,
  type HudNode,
} from "./HudWiring";

/**
 * NanoManga: a multi-modal generation loop. A script and a visual memory feed
 * the Gemini core, the core synthesises pages one at a time, and each finished
 * page goes back into the memory that anchors the next one.
 *
 * Laid out like QaderVisual: nodes and wires read one coordinate map, a node's
 * wrapper is its icon so text never lands on a wire, and every loop is a CSS
 * keyframe that freezes with `data-offscreen`.
 */

/** Panel percentages. `rx`/`ry` are the half-size of the body a wire stops
 *  at, measured against the panel at its usual size. */
const NODES = {
  story: { x: 15, y: 40, rx: 4.5, ry: 4.3 },
  memory: { x: 15, y: 72, rx: 4.5, ry: 4.3 },
  // The wires run to the core's diamond, crossing the rings around it.
  core: { x: 52, y: 50, rx: 7.3, ry: 6.9 },
  page1: { x: 85, y: 18, rx: 6.5, ry: 4.3 },
  page2: { x: 85, y: 50, rx: 6.5, ry: 7.4 },
  page3: { x: 85, y: 82, rx: 6.5, ry: 4.3 },
} satisfies Record<string, HudNode>;

/** Both inputs merge on this line, and all three page wires leave on that one. */
const IN_BUS_X = 32;
const OUT_BUS_X = 68;
/** The channel the finished frames take back to the memory. */
const RETURN_Y = 74;

const EMERALD = "#10B981";

// The NanoManga generation lifecycle, one step per tick.
const CYCLE = [
  { log: "[FLASH] Parsing user prompt into JSON Story Plan...", state: 0 },
  { log: "[FLASH_IMG] Synthesizing base Character Sheets...", state: 1 },
  { log: "[MEM] Caching assets to Visual Buffer.", state: 1 },
  { log: "[FLASH_IMG] Generating Page 1 (Establishing Shot)", state: 2 },
  { log: "[MEM] >> INJECTING PAGE 1 AS VISUAL CONTEXT <<", state: 3 },
  { log: "[FLASH_IMG] Generating Page 2 (Action Sequence)", state: 3 },
  { log: "[MEM] >> INJECTING PAGE 1 & 2 AS VISUAL CONTEXT <<", state: 4 },
  { log: "[FLASH_IMG] Generating Page 3 (Resolution)", state: 4 },
  { log: "[SYS] Story Arc Synthesis Complete.", state: 5 },
];

/**
 * One synthesised page. The wrapper is the frame, so the wire from the core
 * lands on its edge rather than somewhere near it.
 */
function PageFrame({
  node,
  id,
  size,
  done,
  scanning,
  scan,
}: {
  node: HudNode;
  id: string;
  size: string;
  done: boolean;
  scanning: boolean;
  scan: "x" | "y";
}) {
  return (
    <div
      style={nodeStyle(node)}
      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 ${size}`}
    >
      <div
        className={`w-full h-full border-2 bg-[#020617] flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${done ? "border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-slate-800"}`}
      >
        <ImageIcon
          className={`w-4 h-4 lg:w-6 lg:h-6 ${done ? "text-[#10B981]" : "text-slate-700"}`}
        />
        {scanning &&
          (scan === "x" ? (
            <div className="hud-traverse-x [--hud-dur:1.5s] absolute inset-0">
              <div className="absolute top-0 bottom-0 left-0 w-px bg-[#10B981] shadow-[0_0_10px_#10B981]" />
            </div>
          ) : (
            <div className="hud-traverse-y [--hud-dur:1.5s] absolute inset-0">
              <div className="absolute left-0 right-0 top-0 h-px bg-[#10B981] shadow-[0_0_10px_#10B981]" />
            </div>
          ))}
        <span className="absolute bottom-0.5 right-1 text-[5px] lg:text-[6px] text-slate-500">
          {id}
        </span>
      </div>
    </div>
  );
}

export default function NanoMangaVisual() {
  const { ref, offscreen } = useOffscreen();
  const step = useRef(0);
  const [pipelineState, setPipelineState] = useState(0);
  // Seeded to the height of the log window: a fixed box with two lines in it
  // reads as a panel that failed to load.
  const [logs, setLogs] = useState<string[]>([
    "[SYS] NANO_MANGA_STUDIO INITIALIZED",
    "[API] GEMINI_2.5_FLASH CONNECTED",
    "[MEM] VISUAL_MEMORY RESTORED [12 ANCHORS]",
    "[JOB] STORY_JSON PARSED -> 3 PAGES",
  ]);

  useEffect(() => {
    if (offscreen) return;

    const interval = setInterval(() => {
      const { log, state } = CYCLE[step.current];
      step.current = (step.current + 1) % CYCLE.length;
      setPipelineState(state);
      setLogs((prev) =>
        [
          ...prev,
          `[${new Date().toISOString().split("T")[1].slice(0, 8)}] ${log}`,
        ].slice(-5),
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [offscreen]);

  const storyOut = anchor(NODES.story, "right");
  const memoryOut = anchor(NODES.memory, "right");
  const coreIn = anchor(NODES.core, "left");
  const coreOut = anchor(NODES.core, "right");
  const page1In = anchor(NODES.page1, "left");
  const page2In = anchor(NODES.page2, "left");
  const page3In = anchor(NODES.page3, "left");
  const page2Out = anchor(NODES.page2, "bottom");

  const scriptWire = route(storyOut, coreIn, IN_BUS_X);
  const memoryWire = route(memoryOut, coreIn, IN_BUS_X);
  const page1Wire = route(coreOut, page1In, OUT_BUS_X);
  const page2Wire = route(coreOut, page2In, OUT_BUS_X);
  const page3Wire = route(coreOut, page3In, OUT_BUS_X);
  // Finished frame back to the cache: down, along the return channel, in.
  const returnWire = routeV(page2Out, memoryOut, RETURN_Y);

  return (
    <div
      ref={ref}
      data-offscreen={offscreen || undefined}
      className="relative w-full h-full min-h-[500px] xl:min-h-[450px] bg-[#020617] border border-slate-800 flex flex-col group overflow-hidden font-mono text-slate-300"
    >
      {/* 1. Hardware Header */}
      <div className="h-8 border-b border-slate-800 flex items-center px-4 justify-between bg-[#020617] z-30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] shrink-0">
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 bg-slate-700" />
          <div className="hud-pulse [--hud-dur:1.5s] w-1.5 h-1.5 bg-[#F97316]" />
          <div className="w-1.5 h-1.5 bg-[#3B82F6]" />
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest truncate pl-2">
          Gemini_MultiModal_Pipeline.exe
        </span>
      </div>

      {/* 2. Main HUD Area */}
      <div className="flex-1 relative bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem]">
        {/* Radar sweep: a band carried across on a transform, not a
            background-position repaint. */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none z-0">
          <div className="hud-traverse-y [--hud-dur:15s] absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#F97316_50%,transparent_100%)]" />
        </div>

        {/* 3. The multi-modal wiring */}
        <WiringLayer>
          <Wire d={scriptWire} tone="#F97316" dash="10 150" seconds={1.5} />
          <Wire
            d={memoryWire}
            tone="#3B82F6"
            dash="15 200"
            seconds={1.8}
            live={pipelineState >= 3}
          />

          <Wire
            d={page1Wire}
            tone={EMERALD}
            dash="20 250"
            seconds={1.2}
            live={pipelineState === 2}
          />
          <Wire
            d={page2Wire}
            tone={EMERALD}
            dash="20 200"
            seconds={1.2}
            live={pipelineState === 3}
          />
          <Wire
            d={page3Wire}
            tone={EMERALD}
            dash="20 250"
            seconds={1.2}
            live={pipelineState === 4}
          />

          {/* The finished frame goes back into the cache that anchors the
              next one. Drawn page-to-memory, so the packets run that way. */}
          <Wire
            d={returnWire}
            tone="#3B82F6"
            dash="5 90"
            seconds={1}
            live={pipelineState >= 3}
          />
        </WiringLayer>

        {/* Pads where a wire meets a node, and what each wire carries. */}
        <WirePort at={storyOut} tone="#F97316" />
        <WirePort at={memoryOut} tone="#3B82F6" />
        <WirePort at={coreIn} />
        <WirePort at={coreOut} />
        <WirePort at={page1In} tone={EMERALD} />
        <WirePort at={page2In} tone={EMERALD} />
        <WirePort at={page3In} tone={EMERALD} />
        <WirePort at={page2Out} tone="#3B82F6" />

        <WireLabel
          at={{ x: (storyOut.x + IN_BUS_X) / 2, y: storyOut.y }}
          tone="text-[#F97316]"
        >
          SCRIPT
        </WireLabel>
        <WireLabel
          at={{ x: (memoryOut.x + IN_BUS_X) / 2, y: memoryOut.y }}
          tone="text-[#3B82F6]"
        >
          CONTEXT
        </WireLabel>
        <WireLabel at={legMid(OUT_BUS_X, page1In)} tone="text-[#10B981]">
          FRAME
        </WireLabel>
        <WireLabel
          at={{ x: (memoryOut.x + page2Out.x) / 2, y: RETURN_Y }}
          tone="text-[#3B82F6]"
        >
          CACHE FRAME
        </WireLabel>

        {/* 4. LEFT TEXT LOGS (Art Director Terminal) */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-4 w-[220px] lg:w-[260px] pointer-events-none">
          <div className="border border-[#F97316]/30 bg-[#020617]/95 p-3">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
              <Terminal className="w-3 h-3 text-[#F97316]" />
              <span className="text-[9px] text-[#F97316] tracking-widest uppercase">
                Agent_Art_Director
              </span>
            </div>
            <div className="flex flex-col gap-1 h-[80px] overflow-hidden justify-end">
              {logs.map((log, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: i === logs.length - 1 ? 1 : 0.5, x: 0 }}
                  className="text-[7px] lg:text-[8px] text-slate-400 truncate"
                >
                  {log}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* 5. HARDWARE NODES */}

        {/* NODE 1: JSON Story Planner (Text Modality) */}
        <div
          style={nodeStyle(NODES.story)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14"
        >
          <div className="w-full h-full border border-[#F97316] flex items-center justify-center bg-[#020617] relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#F97316]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#F97316]" />
            <FileJson className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center bg-[#020617] px-1">
            <span className="text-[9px] lg:text-[10px] font-bold tracking-widest text-white whitespace-nowrap">
              STORY_JSON
            </span>
            <span className="text-[7px] lg:text-[8px] text-[#F97316] whitespace-nowrap">
              TEXT_MODALITY
            </span>
          </div>
        </div>

        {/* NODE 2: Visual Memory Buffer (Image Modality) */}
        <div
          style={nodeStyle(NODES.memory)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14"
        >
          <div className="w-full h-full rounded-full border-2 border-[#3B82F6] flex items-center justify-center bg-[#020617] relative">
            <div className="hud-spin [--hud-dur:8s] absolute inset-1 rounded-full border border-dashed border-[#3B82F6]/50" />
            <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-[#3B82F6]" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center bg-[#020617] px-1">
            <span className="text-[9px] lg:text-[10px] font-bold tracking-widest text-white whitespace-nowrap">
              VISUAL_MEMORY
            </span>
            <span className="text-[7px] lg:text-[8px] text-[#3B82F6] whitespace-nowrap">
              ASSET_CACHE
            </span>
          </div>
        </div>

        {/* NODE 3: GEMINI MULTI-MODAL CORE (The Engine) */}
        <div
          style={nodeStyle(NODES.core)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-24 h-24 lg:w-32 lg:h-32 flex items-center justify-center"
        >
          {/* The field around the core. Rings, not turning squares: a square
              spinning behind a diamond lands at a different angle every frame
              and reads as clutter rather than as a machine. */}
          <div className="hud-spin [--hud-dur:25s] absolute inset-0 rounded-full border border-dashed border-slate-700" />
          <div className="hud-spin-rev [--hud-dur:15s] absolute inset-3 rounded-full border-2 border-dotted border-[#F97316]/30" />

          {/* Core Box. Its left and right vertices are where the wires land. */}
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[#020617] border-2 border-[#F97316] rotate-45 flex items-center justify-center relative shadow-[0_0_30px_rgba(249,115,22,0.2)] z-10 overflow-hidden">
            {/* Scan bar rising through the core. */}
            <div className="hud-traverse-y-rev [--hud-dur:2s] absolute inset-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#F97316]/50 -rotate-45" />
            </div>
            <BrainCircuit className="w-6 h-6 lg:w-8 lg:h-8 text-white -rotate-45" />
          </div>

          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center bg-[#020617] px-2 py-1 border border-slate-800">
            <span className="text-[10px] lg:text-[11px] font-bold text-white tracking-widest whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F97316]" /> GEMINI_2.5_FLASH
            </span>
            <span className="text-[7px] lg:text-[8px] text-emerald-500 whitespace-nowrap animate-pulse">
              MULTIMODAL_SYNC_OK
            </span>
          </div>
        </div>

        {/* NODE 4: SEQUENTIAL FRAME SYNTHESIS (The Manga Pages) */}
        <span
          style={{ left: `${NODES.page1.x}%`, top: "6%" }}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 text-[8px] lg:text-[9px] tracking-widest text-[#10B981] uppercase whitespace-nowrap bg-[#020617] px-1 border border-slate-800 flex items-center gap-1"
        >
          <Layers className="w-3 h-3" /> Page_Synthesis
        </span>

        <PageFrame
          node={NODES.page1}
          id="PG_01"
          size="w-14 h-10 lg:w-20 lg:h-14"
          done={pipelineState >= 2}
          scanning={pipelineState === 2}
          scan="x"
        />
        <PageFrame
          node={NODES.page2}
          id="PG_02"
          size="w-14 h-16 lg:w-20 lg:h-24"
          done={pipelineState >= 3}
          scanning={pipelineState === 3}
          scan="y"
        />
        <PageFrame
          node={NODES.page3}
          id="PG_03"
          size="w-14 h-10 lg:w-20 lg:h-14"
          done={pipelineState >= 4}
          scanning={pipelineState === 4}
          scan="x"
        />
      </div>
    </div>
  );
}
