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
import { useEffect, useState } from "react";

export default function NanoMangaVisual() {
  // Cycle through the NanoManga generation lifecycle
  const [pipelineState, setPipelineState] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    "[SYS] NANO_MANGA_STUDIO INITIALIZED",
    "[API] GEMINI_2.5_FLASH CONNECTED",
  ]);

  useEffect(() => {
    const cycle = [
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

    let i = 0;
    const interval = setInterval(() => {
      setPipelineState(cycle[i].state);
      setLogs((prev) => {
        const updated = [
          ...prev,
          `[${new Date().toISOString().split("T")[1].slice(0, 8)}] ${cycle[i].log}`,
        ];
        return updated.slice(-5);
      });
      i = (i + 1) % cycle.length;
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] xl:min-h-[450px] bg-[#020617] border border-slate-800 flex flex-col group overflow-hidden font-mono text-slate-300">
      {/* 1. Hardware Header */}
      <div className="h-8 border-b border-slate-800 flex items-center px-4 justify-between bg-[#020617] z-30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] shrink-0">
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 bg-slate-700" />
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-[#F97316]"
          />
          <div className="w-1.5 h-1.5 bg-[#3B82F6]" />
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest truncate pl-2">
          Gemini_MultiModal_Pipeline.exe
        </span>
      </div>

      {/* 2. Main HUD Area */}
      <div className="flex-1 relative bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem]">
        {/* Radar Overlay */}
        <motion.div
          animate={{ backgroundPosition: ["0% -100%", "0% 200%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-10 bg-[linear-gradient(to_bottom,transparent_0%,#F97316_50%,transparent_100%)] bg-[length:100%_100%] pointer-events-none z-0"
        />

        {/* 3. The SVG Interconnect Layer (The Multi-Modal Wires) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          preserveAspectRatio="none"
        >
          <defs>
            <filter
              id="glowOrange"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter
              id="glowEmerald"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* INPUTS TO CORE */}
          {/* JSON Text Plan (Orange) */}
          <path
            d="M 20% 30% L 50% 50%"
            stroke="#1e293b"
            strokeWidth="2"
            fill="none"
          />
          <motion.path
            d="M 20% 30% L 50% 50%"
            stroke="#F97316"
            strokeWidth="2"
            fill="none"
            strokeDasharray="10 150"
            filter="url(#glowOrange)"
            animate={{ strokeDashoffset: [160, -160] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Visual Memory Buffer (Blue) */}
          <path
            d="M 20% 70% L 50% 50%"
            stroke="#1e293b"
            strokeWidth="2"
            fill="none"
          />
          <motion.path
            d="M 20% 70% L 50% 50%"
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
            strokeDasharray="15 200"
            filter="url(#glowBlue)"
            animate={{ strokeDashoffset: [215, -215] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          />

          {/* CORE TO SEQUENTIAL PAGES */}
          {/* Core -> Page 1 */}
          <path
            d="M 50% 50% L 65% 50% L 65% 25% L 80% 25%"
            stroke="#1e293b"
            strokeWidth="2"
            fill="none"
          />
          {pipelineState === 2 && (
            <motion.path
              d="M 50% 50% L 65% 50% L 65% 25% L 80% 25%"
              stroke="#10B981"
              strokeWidth="2"
              fill="none"
              strokeDasharray="20 250"
              filter="url(#glowEmerald)"
              animate={{ strokeDashoffset: [270, -270] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Core -> Page 2 */}
          <path
            d="M 50% 50% L 80% 50%"
            stroke="#1e293b"
            strokeWidth="2"
            fill="none"
          />
          {pipelineState === 3 && (
            <motion.path
              d="M 50% 50% L 80% 50%"
              stroke="#10B981"
              strokeWidth="2"
              fill="none"
              strokeDasharray="20 200"
              filter="url(#glowEmerald)"
              animate={{ strokeDashoffset: [220, -220] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Core -> Page 3 */}
          <path
            d="M 50% 50% L 65% 50% L 65% 75% L 80% 75%"
            stroke="#1e293b"
            strokeWidth="2"
            fill="none"
          />
          {pipelineState === 4 && (
            <motion.path
              d="M 50% 50% L 65% 50% L 65% 75% L 80% 75%"
              stroke="#10B981"
              strokeWidth="2"
              fill="none"
              strokeDasharray="20 250"
              filter="url(#glowEmerald)"
              animate={{ strokeDashoffset: [270, -270] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* === THE VISUAL MEMORY FEEDBACK LOOPS === */}
          {/* Page 1 -> Core (When generating Page 2) */}
          {pipelineState >= 3 && (
            <motion.path
              d="M 80% 25% L 50% 50%"
              stroke="#3B82F6"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="5 50"
              filter="url(#glowBlue)"
              animate={{ strokeDashoffset: [-55, 55] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
          {/* Page 2 -> Core (When generating Page 3) */}
          {pipelineState >= 4 && (
            <motion.path
              d="M 80% 50% L 50% 50%"
              stroke="#3B82F6"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="5 50"
              filter="url(#glowBlue)"
              animate={{ strokeDashoffset: [-55, 55] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
        </svg>

        {/* 4. LEFT TEXT LOGS (Art Director Terminal) */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-4 w-[220px] lg:w-[280px] pointer-events-none hidden md:flex">
          <div className="border border-[#F97316]/30 bg-[#020617]/90 backdrop-blur-sm p-3">
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
        <div className="absolute left-[20%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
          <div className="w-12 h-12 lg:w-14 lg:h-14 shrink-0 border border-[#F97316] flex items-center justify-center bg-[#020617] relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#F97316]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#F97316]" />
            <FileJson className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316]" />
          </div>
          <div className="flex flex-col items-center bg-[#020617]/80 px-1">
            <span className="text-[9px] lg:text-[10px] font-bold tracking-widest text-white whitespace-nowrap">
              STORY_JSON
            </span>
            <span className="text-[7px] lg:text-[8px] text-[#F97316] whitespace-nowrap">
              TEXT_MODALITY
            </span>
          </div>
        </div>

        {/* NODE 2: Visual Memory Buffer (Image Modality) */}
        <div className="absolute left-[20%] top-[80%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
          <div className="w-12 h-12 lg:w-14 lg:h-14 shrink-0 rounded-full border-2 border-[#3B82F6] flex items-center justify-center bg-[#020617] relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-1 rounded-full border border-dashed border-[#3B82F6]/50"
            />
            <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-[#3B82F6]" />
          </div>
          <div className="flex flex-col items-center bg-[#020617]/80 px-1">
            <span className="text-[9px] lg:text-[10px] font-bold tracking-widest text-white whitespace-nowrap">
              VISUAL_MEMORY
            </span>
            <span className="text-[7px] lg:text-[8px] text-[#3B82F6] whitespace-nowrap">
              ASSET_CACHE
            </span>
          </div>
        </div>

        {/* NODE 3: GEMINI MULTI-MODAL CORE (The Engine) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center w-24 h-24 lg:w-32 lg:h-32 shrink-0 mb-4">
            {/* Geometric Diamond Architecture */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-slate-700 rotate-45"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border-2 border-[#F97316]/30 rotate-45"
            />

            {/* Core Box */}
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[#020617] border-2 border-[#F97316] rotate-45 flex items-center justify-center relative shadow-[0_0_30px_rgba(249,115,22,0.2)] z-10 overflow-hidden">
              <motion.div
                animate={{ top: ["100%", "-10%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-[#F97316]/50 -rotate-45"
              />
              <BrainCircuit className="w-6 h-6 lg:w-8 lg:h-8 text-white -rotate-45" />
            </div>
          </div>

          <div className="flex flex-col items-center bg-[#020617]/80 px-2 py-1 border border-slate-800">
            <span className="text-[10px] lg:text-[11px] font-bold text-white tracking-widest whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F97316]" /> GEMINI_2.5_FLASH
            </span>
            <span className="text-[7px] lg:text-[8px] text-emerald-500 whitespace-nowrap animate-pulse">
              MULTIMODAL_SYNC_OK
            </span>
          </div>
        </div>

        {/* NODE 4: SEQUENTIAL FRAME SYNTHESIS (The Manga Pages) */}
        <div className="absolute left-[80%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col gap-4 lg:gap-6 items-center">
          <span className="text-[8px] lg:text-[9px] tracking-widest text-[#10B981] uppercase whitespace-nowrap bg-[#020617] px-1 border border-slate-800 flex items-center gap-1 mb-2">
            <Layers className="w-3 h-3" /> Page_Synthesis
          </span>

          {/* Page 1 */}
          <div
            className={`w-14 h-10 lg:w-20 lg:h-14 shrink-0 border-2 bg-[#020617] flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${pipelineState >= 2 ? "border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-slate-800"}`}
          >
            <ImageIcon
              className={`w-4 h-4 lg:w-6 lg:h-6 ${pipelineState >= 2 ? "text-[#10B981]" : "text-slate-700"}`}
            />
            {pipelineState === 2 && (
              <motion.div
                animate={{ left: ["-10%", "110%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-px bg-[#10B981] shadow-[0_0_10px_#10B981]"
              />
            )}
            <span className="absolute bottom-0.5 right-1 text-[5px] lg:text-[6px] text-slate-500">
              PG_01
            </span>
          </div>

          {/* Page 2 */}
          <div
            className={`w-14 h-16 lg:w-20 lg:h-24 shrink-0 border-2 bg-[#020617] flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${pipelineState >= 3 ? "border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-slate-800"}`}
          >
            <ImageIcon
              className={`w-4 h-4 lg:w-6 lg:h-6 ${pipelineState >= 3 ? "text-[#10B981]" : "text-slate-700"}`}
            />
            {pipelineState === 3 && (
              <motion.div
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-[#10B981] shadow-[0_0_10px_#10B981]"
              />
            )}
            <span className="absolute bottom-0.5 right-1 text-[5px] lg:text-[6px] text-slate-500">
              PG_02
            </span>
          </div>

          {/* Page 3 */}
          <div
            className={`w-14 h-10 lg:w-20 lg:h-14 shrink-0 border-2 bg-[#020617] flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${pipelineState >= 4 ? "border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-slate-800"}`}
          >
            <ImageIcon
              className={`w-4 h-4 lg:w-6 lg:h-6 ${pipelineState >= 4 ? "text-[#10B981]" : "text-slate-700"}`}
            />
            {pipelineState === 4 && (
              <motion.div
                animate={{ left: ["-10%", "110%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-px bg-[#10B981] shadow-[0_0_10px_#10B981]"
              />
            )}
            <span className="absolute bottom-0.5 right-1 text-[5px] lg:text-[6px] text-slate-500">
              PG_03
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
