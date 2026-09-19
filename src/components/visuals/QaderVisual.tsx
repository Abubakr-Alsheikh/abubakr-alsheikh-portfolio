"use client";

import { Database, Server, Webhook, Terminal, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useOffscreen } from "@/hooks/useOffscreen";

/**
 * Every loop here is a CSS keyframe from globals.css, and the whole card
 * freezes while it is off screen (`data-offscreen`). The log timer stops with
 * it. See the project-visual rule in agents.md before adding motion.
 */

const LOG_MESSAGES = [
  "POST /api/v1/auth/ [VALIDATING]",
  "GET /api/v1/courses/ -> 22 Records",
  "WSS PUB: COURSE_LIST_UPDATED",
  "TASK [celery.gen_report] DISPATCHED",
  "QUERY [SELECT * FROM users] 14ms",
  "REDIS GET session:token 2ms",
];

/** One flowing packet: a faint wide stroke under a 2px one, sharing a dash. */
function Flow({
  d,
  tone,
  dash,
  className,
}: {
  d: string;
  tone: string;
  dash: string;
  className: string;
}) {
  return (
    <g className={`hud-flow ${className}`} strokeDasharray={dash} stroke={tone}>
      <path d={d} strokeWidth={6} strokeOpacity={0.2} vectorEffect="non-scaling-stroke" />
      <path d={d} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </g>
  );
}

export default function QaderVisual() {
  const { ref, offscreen } = useOffscreen();
  const [logs, setLogs] = useState<string[]>([
    "[SYS] WSS POOL INITIALIZED",
    "[DB] POSTGRES READY [5/10]",
  ]);
  const [metrics, setMetrics] = useState({ cpu: 8.2, ram: 75.5, req: 1.86 });

  useEffect(() => {
    if (offscreen) return;

    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLog =
          LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
        const updated = [
          ...prev,
          `[${new Date().toISOString().split("T")[1].slice(0, 8)}] ${newLog}`,
        ];
        return updated.slice(-5);
      });
      setMetrics({
        cpu: +(Math.random() * 5 + 5).toFixed(1),
        ram: +(Math.random() * 10 + 70).toFixed(1),
        req: +(Math.random() * 2 + 1).toFixed(2),
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [offscreen]);

  return (
    <div
      ref={ref}
      data-offscreen={offscreen || undefined}
      className="relative w-full h-full min-h-[450px] xl:min-h-[400px] bg-[#020617] border border-slate-800 flex flex-col group overflow-hidden font-mono text-slate-300"
    >
      {/* 1. Hardware Header */}
      <div className="h-8 border-b border-slate-800 flex items-center px-4 justify-between bg-[#020617] z-30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] shrink-0">
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 bg-slate-700" />
          <div className="hud-pulse [--hud-dur:2s] w-1.5 h-1.5 bg-[#3B82F6]" />
          <div className="w-1.5 h-1.5 bg-[#F97316]" />
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest truncate pl-2">
          Qader_Topology_Live_Feed.exe
        </span>
      </div>

      {/* 2. Main HUD Area */}
      <div className="flex-1 relative bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem]">
        {/* Radar sweep: a band carried across on a transform, not a
            background-position repaint. */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none z-0">
          <div className="hud-traverse-y [--hud-dur:10s] absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#3B82F6_50%,transparent_100%)]" />
        </div>

        {/* 3. Interconnect. A 0-100 box stretched to the panel, with
            non-scaling strokes so lines and dashes stay in screen pixels. */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          {/* Client to API */}
          <path d="M 20 50 L 50 50" stroke="#1e293b" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          <Flow d="M 20 50 L 50 50" tone="#3B82F6" dash="15 150" className="[--hud-dur:1.2s] [--hud-flow:165px]" />
          <Flow d="M 20 50 L 50 50" tone="#F97316" dash="10 250" className="[--hud-dur:1.8s] [--hud-flow:260px] [animation-delay:0.4s]" />

          {/* API to Postgres */}
          <path d="M 50 50 L 50 25 L 80 25" stroke="#1e293b" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          <Flow d="M 50 50 L 50 25 L 80 25" tone="#F97316" dash="20 200" className="[--hud-dur:1.5s] [--hud-flow:220px] [animation-delay:0.2s]" />

          {/* API to Celery */}
          <path d="M 50 50 L 50 75 L 80 75" stroke="#1e293b" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          <Flow d="M 50 50 L 50 75 L 80 75" tone="#3B82F6" dash="20 200" className="[--hud-dur:1.6s] [--hud-flow:220px] [animation-delay:0.7s]" />
        </svg>

        {/* 4. HUD Telemetry Panels */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-4 w-[200px] lg:w-[250px] pointer-events-none">
          <div className="border border-slate-800 bg-[#020617]/90 p-3">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
              <Terminal className="w-3 h-3 text-[#3B82F6]" />
              <span className="text-[10px] text-[#3B82F6] tracking-widest">
                TRAFFIC_LOG
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {logs.map((log, i) => (
                <span
                  key={i}
                  className="text-[7px] lg:text-[8px] text-slate-400 truncate"
                >
                  {log}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20 flex flex-col gap-4 w-[160px] lg:w-[200px] pointer-events-none">
          <div className="border border-slate-800 bg-[#020617]/90 p-3">
            <div className="text-[10px] text-slate-500 tracking-widest mb-2 border-b border-slate-800 pb-2">
              SYSTEM_METRICS
            </div>
            <div className="flex justify-between text-[8px] lg:text-[9px]">
              <span>CPU_LOAD</span>{" "}
              <span className="text-emerald-500">{metrics.cpu}%</span>
            </div>
            <div className="flex justify-between text-[8px] lg:text-[9px]">
              <span>MEM_UTIL</span>{" "}
              <span className="text-[#3B82F6]">{metrics.ram}%</span>
            </div>
            <div className="flex justify-between text-[8px] lg:text-[9px]">
              <span>REQ_RATE</span>{" "}
              <span className="text-[#F97316]">{metrics.req}/s</span>
            </div>
          </div>
        </div>

        {/* 5. HARDWARE NODES */}

        {/* NODE 1: NEXT.JS CLIENT */}
        <div className="absolute left-[20%] top-2/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
          <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full border border-slate-700 flex items-center justify-center bg-[#020617] relative shrink-0">
            <div className="hud-spin [--hud-dur:10s] absolute inset-2 rounded-full border border-dashed border-[#3B82F6]/50" />
            <span className="text-lg lg:text-xl font-bold font-sans">N</span>
          </div>
          <span className="mt-2 text-[9px] lg:text-[10px] tracking-widest bg-[#020617] px-1 whitespace-nowrap">
            NEXT.JS CLIENT
          </span>

          <div className="mt-4 lg:mt-6 border border-slate-800 bg-[#020617] p-2 text-[7px] lg:text-[8px] text-slate-400 w-28 lg:w-32 block">
            <div className="flex items-center gap-1 text-emerald-500 mb-1">
              <ShieldCheck className="w-3 h-3" /> JWT Valid
            </div>
            <div>UID: u_89x2z</div>
            <div>Role: Admin</div>
          </div>
        </div>

        {/* NODE 2: THE DJANGO CORE REACTOR */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center">
          {/* Rings */}
          <div className="hud-spin [--hud-dur:30s] absolute w-[200px] h-[200px] lg:w-[240px] lg:h-[240px] rounded-full border border-slate-800" />
          <div className="hud-spin-rev [--hud-dur:20s] absolute w-[150px] h-[150px] lg:w-[180px] lg:h-[180px] rounded-full border-[3px] border-dashed border-[#3B82F6]/30" />
          <div className="hud-spin [--hud-dur:10s] absolute w-[100px] h-[100px] lg:w-[120px] lg:h-[120px] rounded-full border-[2px] border-dotted border-[#F97316]/50" />

          {/* Labels strapped to the reactor */}
          <div className="absolute top-22 text-[7px] lg:text-[8px] tracking-widest text-[#F97316] bg-[#020617] px-1 whitespace-nowrap">
            AUTH MIDDLEWARE
          </div>
          <div className="absolute bottom-22 text-[7px] lg:text-[8px] tracking-widest text-[#3B82F6] bg-[#020617] px-1 whitespace-nowrap">
            CELERY DISPATCHER
          </div>
          <div className="absolute left-22 text-[7px] lg:text-[8px] tracking-widest text-slate-400 bg-[#020617] px-1 whitespace-nowrap hidden sm:block">
            VIEW ROUTER
          </div>
          <div className="absolute right-22 text-[7px] lg:text-[8px] tracking-widest text-slate-400 bg-[#020617] px-1 whitespace-nowrap hidden sm:block">
            ORM ROUTER
          </div>

          {/* Center Core */}
          <div className="w-14 h-14 lg:w-16 lg:h-16 bg-[#020617] border-2 border-[#3B82F6] flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] relative shrink-0">
            <Server className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            <div className="hud-flash [--hud-dur:1s] absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#F97316] shadow-[0_0_10px_#F97316]" />
          </div>
          <div className="absolute -bottom-14 lg:-bottom-16 text-[10px] lg:text-[12px] font-bold text-white tracking-widest whitespace-nowrap">
            DJANGO API CORE
          </div>
        </div>

        {/* NODE 3: POSTGRES DATABASE */}
        <div className="absolute left-[80%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
          <div className="w-12 h-12 lg:w-14 lg:h-14 shrink-0 rounded-full border-2 border-slate-700 bg-[#020617] flex items-center justify-center relative">
            <Database className="w-5 h-5 lg:w-6 lg:h-6 text-slate-300" />
            <div className="hud-level [--hud-dur:1.5s] absolute bottom-1 right-1 w-1 h-[calc(100%-0.5rem)] bg-[#F97316]" />
          </div>
          <div className="flex flex-col items-center text-center bg-[#020617]/80 px-1">
            <span className="text-[10px] lg:text-[12px] font-bold tracking-widest text-white whitespace-nowrap">
              POSTGRES DB
            </span>
            <span className="text-[8px] lg:text-[9px] text-[#F97316] whitespace-nowrap">
              [ACTIVE CONNS: 5/10]
            </span>
          </div>
        </div>

        {/* NODE 4: CELERY / REDIS WORKER */}
        <div className="absolute left-[80%] top-[75%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
          <div className="w-12 h-12 lg:w-14 lg:h-14 shrink-0 rounded-full border-2 border-[#3B82F6]/50 bg-[#020617] flex items-center justify-center relative">
            <Webhook className="w-5 h-5 lg:w-6 lg:h-6 text-[#3B82F6]" />
            <div className="hud-spin [--hud-dur:4s] absolute inset-[-4px] rounded-full border-t-2 border-[#3B82F6]" />
          </div>
          <div className="flex flex-col items-center text-center bg-[#020617]/80 px-1">
            <span className="text-[10px] lg:text-[12px] font-bold tracking-widest text-white whitespace-nowrap">
              REDIS / CELERY
            </span>
            <span className="text-[8px] lg:text-[9px] text-[#3B82F6] whitespace-nowrap">
              [QUEUE: 2 PENDING]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
