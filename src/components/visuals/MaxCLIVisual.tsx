"use client";

import { motion } from "framer-motion";
import {
  Terminal,
  Film,
  Sparkles,
  FileText,
  DownloadCloud,
  Cpu,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function MaxCLIVisual() {
  // Cycle through the actual Max CLI commands from the documentation
  const [execIndex, setExecIndex] = useState(0);

  const commands = [
    {
      cmd: "max video compress movie.mp4",
      log: "[MEDIA_ENGINE] FFmpeg transcode initialized. Preset: high.",
      target: 0, // 0 = Media
      color: "#3B82F6",
    },
    {
      cmd: 'max ai ask "Make this smaller"',
      log: "[AI_ENGINE] Ollama context loaded. Resolving intent...",
      target: 1, // 1 = AI
      color: "#F97316",
    },
    {
      cmd: "max pdf bundle ./contracts/",
      log: "[PDF_ENGINE] Merging 12 documents. Applying compression.",
      target: 2, // 2 = PDF
      color: "#10B981", // Emerald
    },
    {
      cmd: 'max grab download "youtube.com/..."',
      log: "[NETWORK_ENGINE] WSS stream connected. Quality: 1080p.",
      target: 3, // 3 = Grab/Network
      color: "#8B5CF6", // Violet
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setExecIndex((prev) => (prev + 1) % commands.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [commands.length]);

  const current = commands[execIndex];

  return (
    <div className="relative w-full h-full min-h-[500px] xl:min-h-[450px] bg-[#020617] border border-slate-800 flex flex-col group overflow-hidden font-mono text-slate-300">
      {/* 1. Hardware Header */}
      <div className="h-8 border-b border-slate-800 flex items-center px-4 justify-between bg-[#020617] z-30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] shrink-0">
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 bg-slate-700" />
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-[#3B82F6]"
          />
          <div className="w-1.5 h-1.5 bg-[#F97316]" />
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest truncate pl-2">
          Max_CLI_Kernel_v1.4.exe
        </span>
      </div>

      {/* 2. Main HUD Area */}
      <div className="flex-1 relative bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem]">
        {/* Radar Overlay */}
        <motion.div
          animate={{ backgroundPosition: ["0% -100%", "0% 200%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-10 bg-[linear-gradient(to_bottom,transparent_0%,#3B82F6_50%,transparent_100%)] bg-[length:100%_100%] pointer-events-none z-0"
        />

        {/* 3. Dynamic SVG Routing System */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Path: Terminal -> Core Router */}
          <path
            d="M 35% 50% L 50% 50%"
            stroke="#1e293b"
            strokeWidth="2"
            fill="none"
          />
          <motion.path
            d="M 35% 50% L 50% 50%"
            stroke={current.color}
            strokeWidth="2"
            fill="none"
            strokeDasharray="10 100"
            filter="url(#glow)"
            animate={{ strokeDashoffset: [110, -110] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />

          {/* Paths: Core Router -> Modules */}
          {[20, 40, 60, 80].map((yPos, i) => (
            <g key={i}>
              {/* Base dark trace */}
              <path
                d={`M 50% 50% L 60% ${yPos}% L 80% ${yPos}%`}
                stroke="#1e293b"
                strokeWidth="2"
                fill="none"
              />
              {/* Active illuminated trace */}
              {current.target === i && (
                <motion.path
                  d={`M 50% 50% L 60% ${yPos}% L 80% ${yPos}%`}
                  stroke={current.color}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="15 150"
                  filter="url(#glow)"
                  animate={{ strokeDashoffset: [165, -165] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}
            </g>
          ))}
        </svg>

        {/* 4. LEFT: Interactive Terminal Session */}
        <div className="absolute left-[5%] md:left-[10%] bottom-10  z-20 w-[55%] max-w-[340px]">
          <div className="border border-slate-700 bg-[#020617]/90 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col">
            <div className="h-6 border-b border-slate-700 flex items-center px-3 bg-slate-900/50">
              <Terminal className="w-3 h-3 text-slate-400 mr-2" />
              <span className="text-[9px] text-slate-400 tracking-widest uppercase">
                TTY1 - bash
              </span>
            </div>
            <div className="p-4 text-[10px] md:text-xs leading-relaxed flex flex-col gap-2 h-[160px] md:h-[180px] overflow-hidden">
              <div className="flex gap-2">
                <span className="text-emerald-500 shrink-0">user@sys:~$</span>
                {/* Typing animation effect based on current command */}
                <motion.span
                  key={`cmd-${execIndex}`}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  transition={{ duration: 0.5 }}
                  className="text-slate-200 truncate"
                >
                  {current.cmd}
                </motion.span>
              </div>

              <motion.div
                key={`log-${execIndex}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="text-slate-500 mt-2 flex flex-col gap-1"
              >
                <span style={{ color: current.color }}>{current.log}</span>
                <span className="text-slate-600">
                  Resolving dependencies... OK
                </span>
                <span className="text-slate-600">Executing pipeline...</span>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-emerald-500">Processing</span>
                  <div className="flex-1 h-1 bg-slate-800 relative overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, delay: 0.8, ease: "linear" }}
                      className="absolute left-0 top-0 bottom-0"
                      style={{ backgroundColor: current.color }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Plugin Bus Indicator */}
          <div className="mt-4 flex items-center gap-3 border border-slate-800 bg-[#020617]/80 p-2 w-fit">
            <Layers className="w-3 h-3 text-[#3B82F6]" />
            <span className="text-[8px] text-slate-400 uppercase tracking-widest">
              PLUGINS:{" "}
              <span className="text-emerald-500">FFmpeg, Ollama, PyPDF2</span>
            </span>
          </div>
        </div>

        {/* 5. CENTER: Core Task Router */}
        <div className="absolute left-1/3 top-30 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <div
            className="w-12 h-12 md:w-16 md:h-16 rounded-sm border-2 border-slate-700 bg-[#020617] flex items-center justify-center relative shrink-0 rotate-45 transition-colors duration-300"
            style={{ borderColor: current.color }}
          >
            <Cpu
              className="w-5 h-5 md:w-6 md:h-6 -rotate-45"
              style={{ color: current.color }}
            />
            {/* Pulsing core effect */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 border border-dashed rotate-0"
              style={{ borderColor: current.color }}
            />
          </div>
          <span className="mt-6 text-[9px] md:text-[10px] tracking-widest font-bold bg-[#020617] px-2 py-0.5 border border-slate-800">
            MAX_KERNEL
          </span>
        </div>

        {/* 6. RIGHT: Execution Modules (The 4 Engines) */}
        {/* Module 0: Media (Top) */}
        <div
          className={`absolute left-[80%] top-[20%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 transition-opacity duration-300 ${current.target === 0 ? "opacity-100" : "opacity-40"}`}
        >
          <div
            className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full border-2 flex items-center justify-center bg-[#020617] ${current.target === 0 ? "border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-slate-700"}`}
          >
            <Film
              className={`w-4 h-4 md:w-5 md:h-5 ${current.target === 0 ? "text-[#3B82F6]" : "text-slate-500"}`}
            />
          </div>
          <span className="text-[8px] md:text-[9px] font-bold tracking-widest uppercase whitespace-nowrap">
            MEDIA_ENG
          </span>
        </div>

        {/* Module 1: AI (Upper Middle) */}
        <div
          className={`absolute left-[80%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 transition-opacity duration-300 ${current.target === 1 ? "opacity-100" : "opacity-40"}`}
        >
          <div
            className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full border-2 flex items-center justify-center bg-[#020617] ${current.target === 1 ? "border-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.3)]" : "border-slate-700"}`}
          >
            <Sparkles
              className={`w-4 h-4 md:w-5 md:h-5 ${current.target === 1 ? "text-[#F97316]" : "text-slate-500"}`}
            />
          </div>
          <span className="text-[8px] md:text-[9px] font-bold tracking-widest uppercase whitespace-nowrap">
            AI_ENG
          </span>
        </div>

        {/* Module 2: PDF (Lower Middle) */}
        <div
          className={`absolute left-[80%] top-[60%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 transition-opacity duration-300 ${current.target === 2 ? "opacity-100" : "opacity-40"}`}
        >
          <div
            className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full border-2 flex items-center justify-center bg-[#020617] ${current.target === 2 ? "border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-slate-700"}`}
          >
            <FileText
              className={`w-4 h-4 md:w-5 md:h-5 ${current.target === 2 ? "text-[#10B981]" : "text-slate-500"}`}
            />
          </div>
          <span className="text-[8px] md:text-[9px] font-bold tracking-widest uppercase whitespace-nowrap">
            PDF_ENG
          </span>
        </div>

        {/* Module 3: Network/Grab (Bottom) */}
        <div
          className={`absolute left-[80%] top-[80%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 transition-opacity duration-300 ${current.target === 3 ? "opacity-100" : "opacity-40"}`}
        >
          <div
            className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full border-2 flex items-center justify-center bg-[#020617] ${current.target === 3 ? "border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "border-slate-700"}`}
          >
            <DownloadCloud
              className={`w-4 h-4 md:w-5 md:h-5 ${current.target === 3 ? "text-[#8B5CF6]" : "text-slate-500"}`}
            />
          </div>
          <span className="text-[8px] md:text-[9px] font-bold tracking-widest uppercase whitespace-nowrap">
            NET_ENG
          </span>
        </div>
      </div>
    </div>
  );
}
