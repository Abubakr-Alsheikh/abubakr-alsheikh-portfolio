"use client";

import { useReducedMotion } from "framer-motion";
import { Play, Wallet } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { useOffscreen } from "@/hooks/useOffscreen";
import {
  HOLO_H,
  HOLO_W,
  holoFrame,
  NO_ROUTE,
  pathLength,
  pathUpTo,
  stepPath,
  type Camera,
  type HoloFrame,
  type HoloRoute,
  type HoloSystem,
  type Vec,
} from "@/lib/holo";

/**
 * A project's system as a hologram on the ship's table: exploded layers in real
 * perspective, a packet that walks the actual route of each kind of input, and
 * every part answerable on hover, focus or tap.
 *
 * The geometry is `src/lib/holo.ts`, in the line-work the planets use. Like
 * `NavGlobe`, the rAF loop writes `d` and `transform` through refs and React
 * only re-renders when a step changes. Node labels sit in `cqw` units, so the
 * server's first frame lands correctly at any panel size and nothing shifts
 * when the loop takes over.
 *
 * It plays by itself, stops off screen, and holds still under reduced motion,
 * where the Run buttons and the trace strip do the walking instead.
 */

const BLUE = "#3B82F6";
const ORANGE = "#F97316";
const GREEN = "#10B981";

const START_CAMERA: Camera = { yaw: 0.3, pitch: 0.4 };
const PITCH_MIN = 0.2;
const PITCH_MAX = 0.95;
/** Radians per dragged pixel. */
const DRAG_YAW = 0.008;
const DRAG_PITCH = 0.004;
const INERTIA = 0.93;
const KEY_YAW = 0.2;
const DRAG_START_PX = 4;

const SWAY_RADIANS = 0.16;
const SWAY_SPEED = 0.00032;
/** How long the view stays where a visitor left it before it sways again. */
const SWAY_REST_MS = 2500;

/** World units per second along a wire. */
const PACKET_SPEED = 170;
const MIN_STEP_MS = 650;
const EXPLODE_MS = 1300;
/** Pause on the finished reply before the next input plays. */
const AUTOPLAY_GAP_MS = 2400;
/** After a visitor picks something, the panel leaves them alone this long. */
const VISITOR_HOLD_MS = 12000;

/** Touch devices draw at 30fps: the page has a starfield to feed as well. */
const COARSE_FRAME_MS = 33;

const SCAN_MS = 7000;
const SCAN_RANGE = 112;

/** The balance refills once this share of it is spent, so the loop never bottoms out. */
const REFILL_AT = 0.7;

const fmt = (n: number) => n.toLocaleString("en-US");

const easeOutBack = (t: number) => {
  const c = 1.2;
  const u = t - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
};

interface Paths {
  planes: (SVGPathElement | null)[];
  grid: SVGPathElement | null;
  edges: SVGPathElement | null;
  scan: SVGPathElement | null;
  ring: SVGPathElement | null;
  pillars: SVGPathElement | null;
  wires: SVGPathElement | null;
  roofs: SVGPathElement | null;
  idle: SVGPathElement | null;
  visited: SVGPathElement | null;
  active: SVGPathElement | null;
  out: SVGPathElement | null;
  back: SVGPathElement | null;
  packet: SVGGElement | null;
}

const labelTransform = ([x, y]: [number, number]) =>
  `translate(${x}cqw, ${y}cqw) translate(-50%, -100%)`;
const layerTransform = ([x, y]: [number, number]) => `translate(${x}cqw, ${y}cqw)`;
const packetTransform = (p: [number, number] | null) =>
  p ? `translate(${p[0]} ${p[1]})` : "translate(-99 -99)";

export default function Hologram({ system }: { system: HoloSystem }) {
  const reduce = useReducedMotion();
  const { ref, offscreen } = useOffscreen();

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [spent, setSpent] = useState(0);
  const [focus, setFocus] = useState<string | null>(null);
  const [userRan, setUserRan] = useState(false);
  const [hintGone, setHintGone] = useState(false);

  const scenario = system.scenarios[scenarioIndex];
  const step = scenario.steps[stepIndex];
  const focused = system.nodes.find((n) => n.id === focus);

  const first = useMemo<HoloFrame>(
    () => holoFrame(system, START_CAMERA, 1, NO_ROUTE, null, -SCAN_RANGE),
    [system],
  );

  const paths = useRef<Paths>({
    planes: [],
    grid: null,
    edges: null,
    scan: null,
    ring: null,
    pillars: null,
    wires: null,
    roofs: null,
    idle: null,
    visited: null,
    active: null,
    out: null,
    back: null,
    packet: null,
  });
  const nodeLabels = useRef<(HTMLElement | null)[]>([]);
  const layerLabels = useRef<(HTMLElement | null)[]>([]);

  /** Everything the loop owns. It lives in a ref so a frame never re-renders. */
  const live = useRef({
    camera: { ...START_CAMERA },
    velocity: 0,
    dragging: false,
    captured: false,
    lastX: 0,
    lastY: 0,
    lastInput: -Infinity,
    swayAmount: 1,
    swayClock: 0,
    explode: 1,
    played: false,
    scenario: 0,
    step: 0,
    /** World units walked along the current step, or time parked after it. */
    elapsed: 0,
    phase: "idle" as "idle" | "walking" | "parked" | "done",
    holdUntil: 0,
    counted: false,
    balanceSpent: 0,
    focus: null as string | null,
    dirty: true,
    scan: 0,
  });

  /** The lit wires for the current position in the current scenario. */
  const routeFor = useCallback(
    (scenarioAt: number, stepAt: number, elapsed: number): HoloRoute => {
      const sc = system.scenarios[scenarioAt];
      const out: Vec[][] = [];
      const back: Vec[][] = [];
      const visited = new Set<string>([sc.start]);
      let packet: Vec | null = null;
      for (let i = 0; i <= stepAt; i++) {
        const whole = stepPath(system, sc, i);
        const walked = i === stepAt ? pathUpTo(whole, elapsed * PACKET_SPEED) : whole;
        (sc.steps[i].back ? back : out).push(walked);
        if (i === stepAt) packet = walked[walked.length - 1];
        else visited.add(sc.steps[i].to);
      }
      return { out, back, packet, visited, active: sc.steps[stepAt].to };
    },
    [system],
  );

  const stepSeconds = useCallback(
    (scenarioAt: number, stepAt: number) => {
      const sc = system.scenarios[scenarioAt];
      const travel = pathLength(stepPath(system, sc, stepAt)) / PACKET_SPEED;
      return Math.max(travel, MIN_STEP_MS / 1000) + (sc.steps[stepAt].hold ?? 0) / 1000;
    },
    [system],
  );

  const addSpend = useCallback(
    (amount: number) => {
      const s = live.current;
      if (s.counted) return;
      s.counted = true;
      s.balanceSpent += amount;
      if (s.balanceSpent > system.readout.balance * REFILL_AT) s.balanceSpent = amount;
      setSpent(s.balanceSpent);
    },
    [system],
  );

  const start = useCallback((index: number) => {
    const s = live.current;
    s.scenario = index;
    s.step = 0;
    s.elapsed = 0;
    s.phase = "walking";
    s.counted = false;
    s.dirty = true;
    setScenarioIndex(index);
    setStepIndex(0);
  }, []);

  /** Parks the packet at a step, without moving through it. */
  const seek = useCallback(
    (scenarioAt: number, stepAt: number) => {
      const s = live.current;
      const sc = system.scenarios[scenarioAt];
      s.scenario = scenarioAt;
      s.step = stepAt;
      s.elapsed = stepSeconds(scenarioAt, stepAt);
      s.phase = "parked";
      s.holdUntil = performance.now() + VISITOR_HOLD_MS;
      s.dirty = true;
      setScenarioIndex(scenarioAt);
      setStepIndex(stepAt);
      if (stepAt === sc.steps.length - 1) addSpend(sc.amount);
    },
    [addSpend, stepSeconds, system],
  );

  const run = (index: number) => {
    setUserRan(true);
    live.current.counted = false;
    if (reduce) {
      seek(index, system.scenarios[index].steps.length - 1);
      return;
    }
    start(index);
  };

  useEffect(() => {
    live.current.focus = focus;
    live.current.dirty = true;
  }, [focus]);

  // Draw loop. Off screen it does not exist at all.
  useEffect(() => {
    if (offscreen) return;
    const s = live.current;
    const p = paths.current;
    let frame = 0;
    let last = performance.now();
    const frameMs = window.matchMedia("(pointer: coarse)").matches ? COARSE_FRAME_MS : 0;

    if (!s.played) {
      s.played = true;
      if (reduce) {
        s.explode = 1;
        seek(0, system.scenarios[0].steps.length - 1);
      } else {
        // Closed stack first; the first packet leaves once the layers are apart.
        s.explode = 0;
      }
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      // A little slack, so a 33ms budget lands on every second 60Hz frame.
      if (now - last < frameMs - 4) return;
      const dt = Math.min(now - last, 50);
      last = now;

      let moving = false;

      if (s.explode < 1) {
        s.explode = Math.min(s.explode + dt / EXPLODE_MS, 1);
        moving = true;
        if (s.explode === 1 && s.phase === "idle") start(0);
      }

      if (s.phase === "walking") {
        moving = true;
        s.elapsed += dt / 1000;
        if (s.elapsed >= stepSeconds(s.scenario, s.step)) {
          const sc = system.scenarios[s.scenario];
          if (s.step < sc.steps.length - 1) {
            s.step += 1;
            s.elapsed = 0;
            setStepIndex(s.step);
          } else {
            addSpend(sc.amount);
            s.phase = "done";
            s.holdUntil = now + AUTOPLAY_GAP_MS;
          }
        }
      } else if ((s.phase === "done" || s.phase === "parked") && !reduce && now > s.holdUntil) {
        start(s.phase === "done" ? (s.scenario + 1) % system.scenarios.length : s.scenario);
      }

      if (s.dragging) {
        moving = true;
      } else if (Math.abs(s.velocity) > 0.0002) {
        s.camera.yaw += s.velocity;
        s.velocity *= INERTIA;
        moving = true;
      }

      if (!reduce) {
        const rested = !s.dragging && now - s.lastInput > SWAY_REST_MS;
        s.swayAmount += ((rested ? 1 : 0) - s.swayAmount) * 0.02;
        s.swayClock += dt;
        s.scan = (s.scan + dt) % SCAN_MS;
        moving = true;
      }

      if (!moving && !s.dirty) return;
      s.dirty = false;

      const camera: Camera = {
        yaw: s.camera.yaw + Math.sin(s.swayClock * SWAY_SPEED) * SWAY_RADIANS * s.swayAmount,
        pitch: s.camera.pitch,
      };
      const route =
        s.phase === "idle" ? NO_ROUTE : routeFor(s.scenario, s.step, s.elapsed);
      const scanY = reduce
        ? -SCAN_RANGE
        : Math.sin((s.scan / SCAN_MS) * Math.PI * 2) * SCAN_RANGE;
      const f = holoFrame(
        system,
        camera,
        reduce ? 1 : easeOutBack(s.explode),
        route,
        s.focus,
        scanY,
      );

      f.planes.forEach((d, i) => p.planes[i]?.setAttribute("d", d));
      p.grid?.setAttribute("d", f.grid);
      p.edges?.setAttribute("d", f.edges);
      p.scan?.setAttribute("d", reduce ? "" : f.scan);
      p.ring?.setAttribute("d", f.ring);
      p.pillars?.setAttribute("d", f.pillars);
      p.wires?.setAttribute("d", f.wires);
      p.roofs?.setAttribute("d", f.roofs);
      p.idle?.setAttribute("d", f.idle);
      p.visited?.setAttribute("d", f.visited);
      p.active?.setAttribute("d", f.active);
      p.out?.setAttribute("d", f.out);
      p.back?.setAttribute("d", f.back);
      p.packet?.setAttribute("transform", packetTransform(f.packet));
      f.nodeLabels.forEach((at, i) => {
        const el = nodeLabels.current[i];
        if (el) el.style.transform = labelTransform(at);
      });
      f.layerLabels.forEach((at, i) => {
        const el = layerLabels.current[i];
        if (el) el.style.transform = layerTransform(at);
      });
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [addSpend, offscreen, reduce, routeFor, seek, start, stepSeconds, system]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const s = live.current;
    s.dragging = true;
    s.captured = false;
    s.velocity = 0;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = live.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    // Capture only once this is a drag: captured from the start, a tap on a
    // node label would land on the stage and never reach the label.
    if (!s.captured) {
      if (Math.abs(dx) + Math.abs(dy) < DRAG_START_PX) return;
      s.captured = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.velocity = dx * DRAG_YAW;
    s.camera.yaw += s.velocity;
    s.camera.pitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, s.camera.pitch + dy * DRAG_PITCH));
    s.lastInput = performance.now();
    s.dirty = true;
    if (dx !== 0 || dy !== 0) setHintGone(true);
  };

  const endDrag = () => {
    live.current.dragging = false;
    live.current.lastInput = performance.now();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const s = live.current;
    s.camera.yaw += e.key === "ArrowLeft" ? -KEY_YAW : KEY_YAW;
    s.lastInput = performance.now();
    s.dirty = true;
    setHintGone(true);
  };

  const { balance, days, label: readoutLabel, unit } = system.readout;
  const safe = Math.floor((balance - spent) / days);
  const activeNode = step.to;

  return (
    <div
      ref={ref}
      data-offscreen={offscreen || undefined}
      className="relative w-full h-full min-h-[560px] xl:min-h-[480px] bg-[#020617] border border-slate-800 flex flex-col group overflow-hidden font-mono text-slate-300"
    >
      {/* Hardware header */}
      <div className="h-8 border-b border-slate-800 flex items-center px-4 justify-between gap-3 shrink-0">
        <div className="flex gap-2 shrink-0">
          <div className="w-1.5 h-1.5 bg-slate-700" />
          <div className="hud-pulse [--hud-dur:2s] w-1.5 h-1.5 bg-[#3B82F6]" />
          <div className="w-1.5 h-1.5 bg-[#F97316]" />
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest truncate">
          {system.title} {"//"} Simulation
        </span>
      </div>

      {/* Run: one button per kind of input */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-800 shrink-0">
        <span className="hidden sm:flex items-center gap-1.5 text-[10px] tracking-widest text-slate-400">
          <Play className="w-3 h-3 text-[#F97316]" />
          RUN
        </span>
        <div role="group" aria-label="Run an entry through the system" className="grid grid-cols-4 gap-1.5 flex-1">
          {system.scenarios.map((sc, i) => {
            const on = i === scenarioIndex;
            return (
              <button
                key={sc.id}
                type="button"
                aria-pressed={on}
                onClick={() => run(i)}
                data-hud-target={`HOLO.RUN.${sc.id.toUpperCase()}`}
                className={`h-7 border text-[10px] uppercase tracking-widest transition-colors ${
                  on
                    ? "border-[#F97316] bg-[#F97316]/10 text-[#F97316]"
                    : "border-slate-800 text-slate-400 hover:border-[#3B82F6] hover:text-[#3B82F6]"
                }`}
              >
                {sc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* The table. The outer box measures, the inner one keeps the aspect. */}
      <div className="flex-1 relative min-h-0 [container-type:size] bg-[linear-gradient(to_right,rgba(30,41,59,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.45)_1px,transparent_1px)] bg-[size:3rem_3rem]">
        <div className="absolute bottom-2 right-2 sm:bottom-auto sm:top-3 sm:right-3 z-20 w-[136px] border border-slate-800 bg-[#020617]/90 p-2 pointer-events-none">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 tracking-widest">
            <Wallet className="w-3 h-3 text-emerald-500" />
            {readoutLabel}
          </div>
          <div className="mt-1 text-sm font-bold text-emerald-500 tracking-wider tabular-nums">
            {fmt(safe)} <span className="text-[9px] font-normal text-slate-400">{unit}</span>
          </div>
          <div className="mt-1 h-0.5 w-full bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-[width] duration-700"
              style={{ width: `${Math.round(((balance - spent) / balance) * 100)}%` }}
            />
          </div>
          <div className="mt-1 text-[9px] text-slate-400 truncate">{scenario.input}</div>
          <div className="text-[8px] tracking-widest text-slate-400">ILLUSTRATIVE</div>
        </div>

        {!hintGone && (
          <div className="absolute bottom-2 left-3 z-20 text-[9px] tracking-widest text-slate-400 pointer-events-none">
            DRAG TO ROTATE
          </div>
        )}

        <div
          role="group"
          aria-label={`${system.title} hologram. Left and right arrow keys rotate it.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100cqw,calc(100cqh*8/7))] aspect-[8/7] [container-type:inline-size] cursor-grab active:cursor-grabbing select-none touch-pan-y"
        >
          <svg
            viewBox={`0 0 ${HOLO_W} ${HOLO_H}`}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full overflow-visible"
          >
            <path
              ref={(el) => {
                paths.current.ring = el;
              }}
              d={first.ring}
              fill="none"
              stroke={BLUE}
              strokeOpacity={0.45}
              strokeWidth={1}
            />
            <path
              ref={(el) => {
                paths.current.pillars = el;
              }}
              d={first.pillars}
              fill="none"
              stroke={BLUE}
              strokeOpacity={0.22}
              strokeWidth={1}
              strokeDasharray="2 6"
            />
            {first.planes.map((d, i) => (
              <path
                key={i}
                ref={(el) => {
                  paths.current.planes[i] = el;
                }}
                d={d}
                fill={BLUE}
                fillOpacity={0.055}
              />
            ))}
            <path
              ref={(el) => {
                paths.current.grid = el;
              }}
              d={first.grid}
              fill="none"
              stroke="#475569"
              strokeOpacity={0.4}
              strokeWidth={0.8}
            />
            <path
              ref={(el) => {
                paths.current.edges = el;
              }}
              d={first.edges}
              fill="none"
              stroke={BLUE}
              strokeOpacity={0.75}
              strokeWidth={1}
            />
            <path
              ref={(el) => {
                paths.current.scan = el;
              }}
              d={first.scan}
              fill="none"
              stroke={ORANGE}
              strokeOpacity={0.28}
              strokeWidth={1}
            />
            <path
              ref={(el) => {
                paths.current.wires = el;
              }}
              d={first.wires}
              fill="none"
              stroke="#64748B"
              strokeOpacity={0.55}
              strokeWidth={0.9}
              strokeDasharray="3 4"
            />
            <path
              ref={(el) => {
                paths.current.out = el;
              }}
              d={first.out}
              fill="none"
              stroke={BLUE}
              strokeWidth={2}
            />
            <path
              ref={(el) => {
                paths.current.back = el;
              }}
              d={first.back}
              fill="none"
              stroke={GREEN}
              strokeWidth={2}
            />
            <path
              ref={(el) => {
                paths.current.roofs = el;
              }}
              d={first.roofs}
              fill="#0B1226"
              fillOpacity={0.9}
            />
            <path
              ref={(el) => {
                paths.current.idle = el;
              }}
              d={first.idle}
              fill="none"
              stroke="#94A3B8"
              strokeWidth={1}
            />
            <path
              ref={(el) => {
                paths.current.visited = el;
              }}
              d={first.visited}
              fill="none"
              stroke={BLUE}
              strokeWidth={1.4}
            />
            <path
              ref={(el) => {
                paths.current.active = el;
              }}
              d={first.active}
              fill="none"
              stroke={ORANGE}
              strokeWidth={1.8}
            />
            <g
              ref={(el) => {
                paths.current.packet = el;
              }}
              transform={packetTransform(first.packet)}
            >
              <rect x={-10} y={-10} width={20} height={20} fill={ORANGE} fillOpacity={0.22} />
              <rect x={-4} y={-4} width={8} height={8} fill={step.back ? GREEN : ORANGE} />
            </g>
          </svg>

          {system.layers.map((layer, i) => (
            <span
              key={layer.id}
              ref={(el) => {
                layerLabels.current[i] = el;
              }}
              style={{ transform: layerTransform(first.layerLabels[i]) }}
              className="hidden @[420px]:block absolute left-0 top-0 text-[8px] tracking-widest text-[#60A5FA] whitespace-nowrap pointer-events-none"
            >
              {layer.label}
            </span>
          ))}

          {system.nodes.map((node, i) => {
            const on = node.id === focus || node.id === activeNode;
            const tag = node.id === activeNode ? step.tag : undefined;
            return (
              <button
                key={node.id}
                type="button"
                ref={(el) => {
                  nodeLabels.current[i] = el;
                }}
                style={{ transform: labelTransform(first.nodeLabels[i]) }}
                aria-label={`${node.name}: ${node.detail}`}
                onMouseEnter={() => setFocus(node.id)}
                onMouseLeave={() => setFocus(null)}
                onFocus={() => setFocus(node.id)}
                onClick={() => setFocus(node.id)}
                onBlur={() => setFocus(null)}
                className={`absolute left-0 top-0 px-1 py-0.5 text-[8px] leading-none tracking-wider whitespace-nowrap bg-[#020617]/80 border cursor-help transition-colors ${
                  on
                    ? "z-10 border-[#F97316]/70 text-[#F97316]"
                    : "border-transparent text-slate-300 hover:border-[#3B82F6]/60"
                }`}
              >
                {node.label}
                {tag && <span className="ml-1 text-slate-100">{tag}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trace: the same route as text. Each stop can be walked by tapping it.
          Two rows are always reserved on phones: a six-step route wraps, and the
          table must not change size when the input does. */}
      <div className="border-t border-slate-800 px-3 pt-2 pb-2.5 shrink-0 bg-[#020617]">
        <div className="h-[52px] sm:h-6 flex flex-wrap content-start items-center gap-x-1 gap-y-1">
          {scenario.steps.map((s, i) => (
            <button
              key={`${scenario.id}-${i}`}
              type="button"
              aria-current={i === stepIndex ? "step" : undefined}
              onClick={() => {
                setUserRan(true);
                seek(scenarioIndex, i);
              }}
              className={`h-6 px-1.5 border text-[9px] uppercase tracking-widest transition-colors ${
                i === stepIndex
                  ? s.back
                    ? "border-emerald-500/70 text-emerald-500"
                    : "border-[#F97316]/70 text-[#F97316]"
                  : i < stepIndex
                    ? "border-[#3B82F6]/40 text-[#60A5FA]"
                    : "border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
        <p
          aria-live={userRan ? "polite" : "off"}
          className="mt-2 h-[42px] sm:h-[28px] text-[11px] leading-[14px] text-slate-300 overflow-hidden"
        >
          {focused ? (
            <>
              <span className="text-[#F97316]">{focused.name}: </span>
              {focused.detail}
            </>
          ) : (
            step.caption
          )}
        </p>
      </div>
    </div>
  );
}
