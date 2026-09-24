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
} from "lucide-react";
import { useEffect, useState } from "react";
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
 * Max CLI: a terminal feeding a kernel that dispatches to four engines.
 *
 * Built on the QaderVisual pattern. Nodes and wires read one coordinate map,
 * a node's wrapper is its own body with the name hung off it, and every loop
 * is a CSS keyframe that freezes with the card (`data-offscreen`), so the
 * command timer and the transitions keyed on it stop off screen.
 */

/** Panel percentages. `rx`/`ry` are the half-size of the body a wire stops
 *  at, measured against the panel at its usual size. The kernel's are its
 *  half-diagonal, because the wires meet the diamond at its points. */
const NODES = {
  tty: { x: 32, y: 66, rx: 26, ry: 15.5 },
  kernel: { x: 32, y: 26, rx: 7.3, ry: 6.6 },
  media: { x: 84, y: 16, rx: 3.9, ry: 3.6 },
  ai: { x: 84, y: 36, rx: 3.9, ry: 3.6 },
  pdf: { x: 84, y: 56, rx: 3.9, ry: 3.6 },
  net: { x: 84, y: 76, rx: 3.9, ry: 3.6 },
} satisfies Record<string, HudNode>;

/** Every engine wire turns on this line, so the fan-out reads as one bus. */
const BUS_X = 64;

/** The engines, in the order `COMMANDS[].target` addresses them. */
const MODULES = [
  {
    key: "media",
    node: NODES.media,
    icon: Film,
    label: "MEDIA_ENG",
    /** What the wire into this engine carries. */
    carries: "FFMPEG",
    tone: "#3B82F6",
    text: "text-[#3B82F6]",
    lit: "border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.3)]",
  },
  {
    key: "ai",
    node: NODES.ai,
    icon: Sparkles,
    label: "AI_ENG",
    carries: "PROMPT",
    tone: "#F97316",
    text: "text-[#F97316]",
    lit: "border-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.3)]",
  },
  {
    key: "pdf",
    node: NODES.pdf,
    icon: FileText,
    label: "PDF_ENG",
    carries: "PYMUPDF",
    tone: "#10B981",
    text: "text-[#10B981]",
    lit: "border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)]",
  },
  {
    key: "net",
    node: NODES.net,
    icon: DownloadCloud,
    label: "NET_ENG",
    carries: "STREAM",
    tone: "#8B5CF6",
    text: "text-[#8B5CF6]",
    lit: "border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.3)]",
  },
];

const COMMANDS = [
  {
    cmd: "max video compress movie.mp4",
    log: "[MEDIA_ENGINE] FFmpeg transcode initialized. Preset: high.",
    target: 0,
    color: "#3B82F6",
  },
  {
    cmd: 'max ai ask "Make this smaller"',
    log: "[AI_ENGINE] Ollama context loaded. Resolving intent...",
    target: 1,
    color: "#F97316",
  },
  {
    cmd: "max pdf bundle ./contracts/",
    log: "[PDF_ENGINE] Merging 12 documents. Applying compression.",
    target: 2,
    color: "#10B981",
  },
  {
    cmd: 'max grab download "youtube.com/..."',
    log: "[NETWORK_ENGINE] WSS stream connected. Quality: 1080p.",
    target: 3,
    color: "#8B5CF6",
  },
];

export default function MaxCLIVisual() {
  const { ref, offscreen } = useOffscreen();
  // Cycle through the actual Max CLI commands from the documentation
  const [execIndex, setExecIndex] = useState(0);

  useEffect(() => {
    if (offscreen) return;

    const timer = setInterval(() => {
      setExecIndex((prev) => (prev + 1) % COMMANDS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [offscreen]);

  const current = COMMANDS[execIndex];

  const ttyOut = anchor(NODES.tty, "top");
  const kernelIn = anchor(NODES.kernel, "bottom");
  const kernelOut = anchor(NODES.kernel, "right");
  const stdin = routeV(ttyOut, kernelIn);

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
          <div className="hud-pulse [--hud-dur:2s] w-1.5 h-1.5 bg-[#3B82F6]" />
          <div className="w-1.5 h-1.5 bg-[#F97316]" />
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest truncate pl-2">
          Max_CLI_Kernel_v0.4.exe
        </span>
      </div>

      {/* 2. Main HUD Area */}
      <div className="flex-1 relative bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem]">
        {/* Radar sweep: a band carried across on a transform, not a
            background-position repaint. */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none z-0">
          <div className="hud-traverse-y [--hud-dur:8s] absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#3B82F6_50%,transparent_100%)]" />
        </div>

        {/* 3. Routing. The idle engines keep their track; only the engine the
            current command addresses has packets on it. */}
        <WiringLayer>
          <Wire d={stdin} tone={current.color} dash="10 100" seconds={1} />
          {MODULES.map((mod, i) => (
            <Wire
              key={mod.key}
              d={route(kernelOut, anchor(mod.node, "left"), BUS_X)}
              tone={mod.tone}
              dash="15 150"
              seconds={1.2}
              live={current.target === i}
            />
          ))}
        </WiringLayer>

        {/* Pads where a wire meets a node, and what each wire carries. */}
        <WirePort at={ttyOut} />
        <WirePort at={kernelIn} />
        <WirePort at={kernelOut} tone={current.color} />
        {MODULES.map((mod, i) => (
          <WirePort
            key={mod.key}
            at={anchor(mod.node, "left")}
            tone={current.target === i ? mod.tone : "#334155"}
          />
        ))}

        <WireLabel at={{ x: NODES.tty.x, y: (ttyOut.y + kernelIn.y) / 2 }}>
          STDIN
        </WireLabel>
        {MODULES.map((mod, i) => (
          <WireLabel
            key={mod.key}
            at={legMid(BUS_X, anchor(mod.node, "left"))}
            tone={current.target === i ? mod.text : "text-slate-600"}
          >
            {mod.carries}
          </WireLabel>
        ))}

        {/* 4. THE TERMINAL SESSION. Its own node: the wire out of its top
            edge is the kernel's stdin. */}
        <div
          style={nodeStyle(NODES.tty)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-[52%] max-w-[340px]"
        >
          <div className="border border-slate-700 bg-[#020617]/95 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col">
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

          {/* Plugin bus readout, hung off the panel. */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 flex items-center gap-3 border border-slate-800 bg-[#020617] p-2 whitespace-nowrap">
            <Layers className="w-3 h-3 text-[#3B82F6] shrink-0" />
            <span className="text-[8px] text-slate-400 uppercase tracking-widest">
              BACKENDS:{" "}
              <span className="text-emerald-500">FFmpeg, Ollama, PyMuPDF</span>
            </span>
          </div>
        </div>

        {/* 5. THE KERNEL. Its name sits above it: below is where stdin
            arrives, and nothing but a wire label belongs on a wire. */}
        <div
          style={nodeStyle(NODES.kernel)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-16 md:h-16"
        >
          <div
            className="w-full h-full rounded-sm border-2 bg-[#020617] flex items-center justify-center relative rotate-45 transition-colors duration-300"
            style={{ borderColor: current.color }}
          >
            <Cpu
              className="w-5 h-5 md:w-6 md:h-6 -rotate-45"
              style={{ color: current.color }}
            />
            {/* Pulsing core effect */}
            <div
              className="hud-ping [--hud-dur:1.5s] absolute inset-0 border border-dashed"
              style={{ borderColor: current.color }}
            />
          </div>

          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 text-[9px] md:text-[10px] tracking-widest font-bold bg-[#020617] px-2 py-0.5 border border-slate-800 whitespace-nowrap">
            MAX_KERNEL
          </span>
        </div>

        {/* 6. THE EXECUTION MODULES */}
        {MODULES.map((mod, i) => {
          const on = current.target === i;
          const Icon = mod.icon;

          return (
            <div
              key={mod.key}
              style={nodeStyle(mod.node)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 transition-opacity duration-300 ${on ? "opacity-100" : "opacity-40"}`}
            >
              <div
                className={`w-full h-full rounded-full border-2 flex items-center justify-center bg-[#020617] ${on ? mod.lit : "border-slate-700"}`}
              >
                <Icon
                  className={`w-4 h-4 md:w-5 md:h-5 ${on ? mod.text : "text-slate-500"}`}
                />
              </div>
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[8px] md:text-[9px] font-bold tracking-widest uppercase whitespace-nowrap">
                {mod.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
