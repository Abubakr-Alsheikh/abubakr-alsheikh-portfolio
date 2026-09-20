"use client";

import { Database, Server, Webhook, Terminal, ShieldCheck } from "lucide-react";
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
 * Qader: a Django service with its client, its database and its worker.
 *
 * Reference implementation for the project visuals. Three rules:
 *  - Nodes and wires read one coordinate map (`NODES`), so a wire always
 *    lands on the node it belongs to, at every panel size.
 *  - A node's wrapper is its icon. Names and readouts hang off the wrapper,
 *    so centring the node centres the icon and never puts text on a wire.
 *  - Every loop is a CSS keyframe from globals.css, and the card freezes
 *    while it is off screen (`data-offscreen`). The log timer stops with it.
 */

/** Panel percentages. `rx`/`ry` are the half-size of the body a wire stops
 *  at, measured against the panel at its usual size. */
const NODES = {
  client: { x: 16, y: 52, rx: 5.1, ry: 4.7 },
  // The reactor's wires run to its box, crossing the field rings around it.
  core: { x: 50, y: 52, rx: 5.4, ry: 5 },
  db: { x: 84, y: 22, rx: 4.5, ry: 4.1 },
  worker: { x: 84, y: 80, rx: 4.5, ry: 4.1 },
} satisfies Record<string, HudNode>;

/** Both right-hand wires turn on this line, so they read as one bus. */
const BUS_X = 70;

const LOG_MESSAGES = [
  "POST /api/v1/auth/ [VALIDATING]",
  "GET /api/v1/courses/ -> 22 Records",
  "WSS PUB: COURSE_LIST_UPDATED",
  "TASK [celery.gen_report] DISPATCHED",
  "QUERY [SELECT * FROM users] 14ms",
  "REDIS GET session:token 2ms",
];

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

  const clientOut = anchor(NODES.client, "right");
  const coreIn = anchor(NODES.core, "left");
  const coreOut = anchor(NODES.core, "right");
  const dbIn = anchor(NODES.db, "left");
  const workerIn = anchor(NODES.worker, "left");

  const toCore = route(clientOut, coreIn);
  const toDb = route(coreOut, dbIn, BUS_X);
  const toWorker = route(coreOut, workerIn, BUS_X);

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

        {/* 3. Interconnect */}
        <WiringLayer>
          <Wire d={toCore} tone="#3B82F6" dash="14 120" seconds={1.2} />
          <Wire
            d={toCore}
            tone="#F97316"
            dash="8 220"
            seconds={1.8}
            reverse
            delaySeconds={0.4}
          />
          <Wire
            d={toDb}
            tone="#F97316"
            dash="16 170"
            seconds={1.5}
            delaySeconds={0.2}
          />
          <Wire
            d={toWorker}
            tone="#3B82F6"
            dash="16 170"
            seconds={1.6}
            delaySeconds={0.7}
          />
        </WiringLayer>

        {/* Pads where a wire meets a node, and what each wire carries. */}
        <WirePort at={clientOut} />
        <WirePort at={coreIn} />
        <WirePort at={coreOut} />
        <WirePort at={dbIn} tone="#F97316" />
        <WirePort at={workerIn} tone="#3B82F6" />

        <WireLabel at={{ x: (clientOut.x + coreIn.x) / 2, y: coreIn.y }}>
          HTTPS / WSS
        </WireLabel>
        <WireLabel at={legMid(BUS_X, dbIn)} tone="text-[#F97316]">
          ORM
        </WireLabel>
        <WireLabel at={legMid(BUS_X, workerIn)} tone="text-[#3B82F6]">
          BROKER
        </WireLabel>

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
        <div
          style={nodeStyle(NODES.client)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 lg:w-16 lg:h-16"
        >
          <div className="w-full h-full rounded-full border border-slate-700 flex items-center justify-center bg-[#020617] relative">
            <div className="hud-spin [--hud-dur:10s] absolute inset-2 rounded-full border border-dashed border-[#3B82F6]/50" />
            <span className="text-lg lg:text-xl font-bold font-sans">N</span>
          </div>

          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center">
            <span className="text-[9px] lg:text-[10px] tracking-widest bg-[#020617] px-1 whitespace-nowrap">
              NEXT.JS CLIENT
            </span>
            <div className="mt-2 border border-slate-800 bg-[#020617] p-2 text-[7px] lg:text-[8px] text-slate-400 w-28 lg:w-32">
              <div className="flex items-center gap-1 text-emerald-500 mb-1">
                <ShieldCheck className="w-3 h-3" /> JWT Valid
              </div>
              <div>UID: u_89x2z</div>
              <div>Role: Admin</div>
            </div>
          </div>
        </div>

        {/* NODE 2: THE DJANGO CORE REACTOR */}
        <div
          style={nodeStyle(NODES.core)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center"
        >
          {/* The reactor field. Decorative, and the wires pass through it
              to the box, which is what they actually connect to. */}
          <div className="hud-spin [--hud-dur:30s] absolute w-[150px] h-[150px] lg:w-[170px] lg:h-[170px] rounded-full border border-slate-800" />
          <div className="hud-spin-rev [--hud-dur:20s] absolute w-[112px] h-[112px] lg:w-[128px] lg:h-[128px] rounded-full border-[3px] border-dashed border-[#3B82F6]/30" />
          <div className="hud-spin [--hud-dur:10s] absolute w-[80px] h-[80px] lg:w-[92px] lg:h-[92px] rounded-full border-[2px] border-dotted border-[#F97316]/50" />

          {/* Center Core */}
          <div className="w-14 h-14 lg:w-16 lg:h-16 bg-[#020617] border-2 border-[#3B82F6] flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] relative shrink-0">
            <Server className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            <div className="hud-flash [--hud-dur:1s] absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#F97316] shadow-[0_0_10px_#F97316]" />
          </div>

          {/* What the core runs, stacked above and below so nothing sits on
              the wires, which arrive on its left and right. */}
          <div className="absolute -top-[46px] text-[7px] lg:text-[8px] tracking-widest text-[#F97316] bg-[#020617] px-1 whitespace-nowrap">
            AUTH MIDDLEWARE
          </div>
          <div className="absolute -bottom-[46px] text-[7px] lg:text-[8px] tracking-widest text-[#3B82F6] bg-[#020617] px-1 whitespace-nowrap">
            CELERY DISPATCHER
          </div>
          <div className="absolute -bottom-[104px] text-[10px] lg:text-[12px] font-bold text-white tracking-widest whitespace-nowrap">
            DJANGO API CORE
          </div>
        </div>

        {/* NODE 3: POSTGRES DATABASE */}
        <div
          style={nodeStyle(NODES.db)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14"
        >
          <div className="w-full h-full rounded-full border-2 border-slate-700 bg-[#020617] flex items-center justify-center relative">
            <Database className="w-5 h-5 lg:w-6 lg:h-6 text-slate-300" />
            <div className="hud-level [--hud-dur:1.5s] absolute bottom-1 right-1 w-1 h-[calc(100%-0.5rem)] bg-[#F97316]" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center text-center bg-[#020617] px-1">
            <span className="text-[10px] lg:text-[12px] font-bold tracking-widest text-white whitespace-nowrap">
              POSTGRES DB
            </span>
            <span className="text-[8px] lg:text-[9px] text-[#F97316] whitespace-nowrap">
              [ACTIVE CONNS: 5/10]
            </span>
          </div>
        </div>

        {/* NODE 4: CELERY / REDIS WORKER */}
        <div
          style={nodeStyle(NODES.worker)}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14"
        >
          <div className="w-full h-full rounded-full border-2 border-[#3B82F6]/50 bg-[#020617] flex items-center justify-center relative">
            <Webhook className="w-5 h-5 lg:w-6 lg:h-6 text-[#3B82F6]" />
            <div className="hud-spin [--hud-dur:4s] absolute inset-[-4px] rounded-full border-t-2 border-[#3B82F6]" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center text-center bg-[#020617] px-1">
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
