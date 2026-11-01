"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowLeft, Pause, Play, Power, SkipBack, SkipForward, Wallet, X, ZoomIn } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useOffscreen } from "@/hooks/useOffscreen";
import {
  HOLO_H,
  HOLO_W,
  holoFrame,
  layersBottomUp,
  layerY,
  linkedTo,
  NO_MARKS,
  NO_ROUTE,
  OPEN_VIEW,
  pathLength,
  pathUpTo,
  resolveRoute,
  stepPath,
  type Camera,
  type HoloFrame,
  type HoloRoute,
  type HoloScenario,
  type HoloStep,
  type HoloSystem,
  type HoloView,
  type Vec,
} from "@/lib/holo";

/**
 * A project's system as a hologram on the ship's table: exploded layers in real
 * perspective, a packet that walks the actual route of each kind of input, and
 * a playground on top. Click a part to light up what it connects to. Click a
 * layer and the camera flies in. Take a service offline and watch the next
 * message find its backup.
 *
 * There is no wheel or pinch zoom on purpose: the panel sits in a scrolling
 * page, and a wheel that zooms is a wheel that traps the visitor. Focus gives
 * the same closeness and always has a way back.
 *
 * The geometry is `src/lib/holo.ts`, in the line-work the planets use. Like
 * `NavGlobe`, the rAF loop writes `d` and `transform` through refs and React
 * only re-renders when a step or a choice changes. Node labels sit in `cqw`
 * units, so the server's first frame lands correctly at any panel size and
 * nothing shifts when the loop takes over.
 *
 * Each step stays long enough to read its caption, and the transport beside
 * the trace can pause it or walk it by hand. Pointing at a part, or opening a
 * card or a layer, holds the run too: nothing changes under someone who is
 * reading. It plays by itself until a visitor picks something, stops off screen,
 * and holds still under reduced motion, where the buttons do the walking.
 */

const BLUE = "#3B82F6";
const ORANGE = "#F97316";
const GREEN = "#10B981";
const RED = "#EF4444";

const START_ANGLE = { yaw: 0.3, pitch: 0.4 };
const PITCH_MIN = 0.2;
const PITCH_MAX = 1.1;
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
/** A focused layer barely sways: it is there to be read. */
const SWAY_IN_FOCUS = 0.2;

/** Close enough that the whole plane still fits at the stage's width. */
const FOCUS_ZOOM = 1.42;
const FOCUS_PITCH = 0.82;
const FOCUS_YAW = 0.12;
/** World units the other layers move away from a focused one. */
const FOCUS_SPREAD = 58;
/** Time constant of the camera's flight, ms. */
const FLIGHT_MS = 240;

/** World units per second along a wire. */
const PACKET_SPEED = 130;
/** A step lasts its wire plus the time to read its caption. */
const MIN_READ_MS = 1800;
const READ_MS_PER_CHAR = 52;
const EXPLODE_MS = 1300;
/** Pause on the finished reply before the next input plays. */
const AUTOPLAY_GAP_MS = 3500;
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

const EMPTY: ReadonlySet<string> = new Set();

/** What an instrument can read: the run as it stands, and the one answer it can give. */
export interface HoloRun {
  scenario: HoloScenario;
  steps: HoloStep[];
  stepIndex: number;
  /** The route reached its end. */
  finished: boolean;
  /** Every line the steps so far have printed. */
  log: string[];
  offline: ReadonlySet<string>;
  /** The route is stopped on a question. */
  awaiting: string | null;
  /** The answer to this run's question, once there is one. */
  answer: boolean | null;
  respond: (yes: boolean) => void;
}

const RUN_COLS: Record<number, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const TRANSPORT =
  "w-6 h-6 flex items-center justify-center border border-slate-700 text-slate-300 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors";

interface LayerPaths {
  plane: SVGPathElement | null;
  grid: SVGPathElement | null;
  edge: SVGPathElement | null;
  roofs: SVGPathElement | null;
  idle: SVGPathElement | null;
}

interface Paths {
  layers: LayerPaths[];
  scan: SVGPathElement | null;
  ring: SVGPathElement | null;
  pillars: SVGPathElement | null;
  wires: SVGPathElement | null;
  lit: SVGPathElement | null;
  visited: SVGPathElement | null;
  active: SVGPathElement | null;
  linked: SVGPathElement | null;
  offline: SVGPathElement | null;
  out: SVGPathElement | null;
  back: SVGPathElement | null;
  packet: SVGGElement | null;
}

const labelTransform = ([x, y]: [number, number]) =>
  `translate(${x}cqw, ${y}cqw) translate(-50%, calc(-100% - 5px))`;
const layerTransform = ([x, y]: [number, number]) => `translate(${x}cqw, ${y}cqw) translateY(-50%)`;
const packetTransform = (p: [number, number] | null) =>
  p ? `translate(${p[0]} ${p[1]})` : "translate(-99 -99)";

export default function Hologram({
  system,
  instrument,
}: {
  system: HoloSystem;
  /** This project's own read-out, in a column beside the table (a strip on phones). */
  instrument?: (run: HoloRun) => ReactNode;
}) {
  const reduce = useReducedMotion();
  const { ref, offscreen } = useOffscreen();
  const startCamera = useMemo<Camera>(
    () => ({ ...START_ANGLE, ...system.camera, zoom: 1, lookY: 0 }),
    [system],
  );

  const order = layersBottomUp(system);

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [steps, setSteps] = useState<HoloStep[]>(system.scenarios[0].steps);
  const [stepIndex, setStepIndex] = useState(0);
  const [spent, setSpent] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [focusLayer, setFocusLayer] = useState<string | null>(null);
  /** What the visitor took offline. */
  const [offline, setOffline] = useState<ReadonlySet<string>>(EMPTY);
  /** What this run shows offline: the visitor's choices plus any scripted demo. */
  const [shownOffline, setShownOffline] = useState<ReadonlySet<string>>(EMPTY);
  const [userRan, setUserRan] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [awaiting, setAwaiting] = useState<string | null>(null);
  const [answer, setAnswer] = useState<boolean | null>(null);

  const scenario = system.scenarios[scenarioIndex];
  const step = steps[stepIndex] ?? steps[0];
  const selectedNode = system.nodes.find((n) => n.id === selected);
  const hoverNode = system.nodes.find((n) => n.id === hover);
  const focusedLayer = system.layers.find((n) => n.id === focusLayer);
  const linked = useMemo(() => linkedTo(system, selected), [system, selected]);

  const first = useMemo<HoloFrame>(
    () => holoFrame(system, startCamera, OPEN_VIEW, NO_ROUTE, NO_MARKS, -SCAN_RANGE),
    [system, startCamera],
  );

  const paths = useRef<Paths>({
    layers: [],
    scan: null,
    ring: null,
    pillars: null,
    wires: null,
    lit: null,
    visited: null,
    active: null,
    linked: null,
    offline: null,
    out: null,
    back: null,
    packet: null,
  });
  const layerPaths = (i: number): LayerPaths => {
    const all = paths.current.layers;
    all[i] ??= { plane: null, grid: null, edge: null, roofs: null, idle: null };
    return all[i];
  };
  const nodeLabels = useRef<(HTMLElement | null)[]>([]);
  const layerLabels = useRef<(HTMLElement | null)[]>([]);
  const readBar = useRef<HTMLDivElement>(null);

  /** Everything the loop owns. It lives in a ref so a frame never re-renders. */
  const live = useRef({
    camera: { ...startCamera },
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
    /** Where the camera is flying to, until it lands or a visitor takes over. */
    flyYaw: null as number | null,
    flyPitch: null as number | null,
    spread: 0,
    /** Keeps the spread's direction while the layers close after a focus ends. */
    spreadFrom: null as string | null,
    focusLayer: null as string | null,
    selected: null as string | null,
    hover: null as string | null,
    offline: EMPTY,
    shownOffline: EMPTY,
    scenario: 0,
    steps: system.scenarios[0].steps,
    start: system.scenarios[0].start,
    saved: true,
    step: 0,
    /** Seconds spent on the current step. */
    elapsed: 0,
    phase: "idle" as "idle" | "walking" | "parked" | "done",
    holdUntil: 0,
    counted: false,
    byVisitor: false,
    /** The current run's question has its answer, or it never had one. */
    answered: false,
    awaiting: false,
    paused: false,
    balanceSpent: 0,
    dirty: true,
    scan: 0,
  });

  /** The lit wires for the current position in the current run. */
  const routeFor = useCallback(
    (view: HoloView): HoloRoute => {
      const s = live.current;
      const out: Vec[][] = [];
      const back: Vec[][] = [];
      const visited = new Set<string>([s.start]);
      let packet: Vec | null = null;
      for (let i = 0; i <= s.step; i++) {
        const whole = stepPath(system, s.start, s.steps, i, view);
        const walked = i === s.step ? pathUpTo(whole, s.elapsed * PACKET_SPEED) : whole;
        (s.steps[i].back ? back : out).push(walked);
        if (i === s.step) packet = walked[walked.length - 1];
        else visited.add(s.steps[i].to);
      }
      return { out, back, packet, visited, active: s.steps[s.step].to };
    },
    [system],
  );

  const stepSeconds = useCallback(
    (all: HoloStep[], start: string, at: number) => {
      const travel = pathLength(stepPath(system, start, all, at)) / PACKET_SPEED;
      return travel + Math.max(MIN_READ_MS, all[at].caption.length * READ_MS_PER_CHAR) / 1000;
    },
    [system],
  );

  const addSpend = useCallback(
    (amount: number) => {
      const s = live.current;
      if (s.counted) return;
      s.counted = true;
      // With every service down the entry never reached the ledger.
      if (!s.saved || !system.readout) return;
      s.balanceSpent += amount;
      if (s.balanceSpent > system.readout.balance * REFILL_AT) s.balanceSpent = amount;
      setSpent(s.balanceSpent);
    },
    [system],
  );

  /** Parks the packet on a step of the current run, paused until Play. */
  const seek = useCallback(
    (at: number) => {
      const s = live.current;
      s.step = at;
      s.elapsed = stepSeconds(s.steps, s.start, at);
      s.phase = "parked";
      s.paused = true;
      s.dirty = true;
      setPaused(true);
      setStepIndex(at);
      if (at === s.steps.length - 1) {
        addSpend(system.scenarios[s.scenario].amount);
        setFinished(true);
      }
    },
    [addSpend, stepSeconds, system],
  );

  /** Starts a scenario. A run nobody asked for may also show its scripted failure. */
  const begin = useCallback(
    (index: number, byVisitor: boolean) => {
      const s = live.current;
      const sc = system.scenarios[index];
      const down = new Set(s.offline);
      if (!byVisitor) for (const id of sc.demoOffline ?? []) down.add(id);
      const { steps: resolved, saved } = resolveRoute(sc, down);
      s.scenario = index;
      s.steps = resolved;
      s.start = sc.start;
      s.saved = saved;
      s.shownOffline = down;
      s.step = 0;
      s.elapsed = 0;
      s.phase = "walking";
      s.counted = false;
      s.byVisitor = byVisitor;
      s.answered = false;
      s.awaiting = false;
      s.dirty = true;
      setFinished(false);
      setAwaiting(null);
      setAnswer(null);
      if (byVisitor) {
        s.paused = false;
        setPaused(false);
      }
      setScenarioIndex(index);
      setSteps(resolved);
      setStepIndex(0);
      setShownOffline(down);
    },
    [system],
  );

  /** Aims the camera at a layer, or back out at the whole system. */
  const focusOn = useCallback(
    (id: string | null) => {
      const s = live.current;
      s.focusLayer = id;
      if (id) s.spreadFrom = id;
      // The shortest way round to the layer's reading angle.
      const turns = Math.round(s.camera.yaw / (Math.PI * 2));
      s.flyYaw = id ? turns * Math.PI * 2 + FOCUS_YAW : null;
      s.flyPitch = id ? FOCUS_PITCH : startCamera.pitch;
      s.velocity = 0;
      s.dirty = true;
      setFocusLayer(id);
    },
    [startCamera],
  );

  const select = useCallback((id: string | null) => {
    live.current.selected = id;
    live.current.dirty = true;
    setSelected(id);
  }, []);

  /** A visitor's run: step back out so the whole route can be seen. */
  const run = (index: number) => {
    setUserRan(true);
    select(null);
    focusOn(null);
    begin(index, true);
    if (reduce) seek(live.current.steps.length - 1);
  };

  /** The visitor's answer to the question this run stopped on. */
  const respond = useCallback((yes: boolean) => {
    const s = live.current;
    const step = s.steps[s.step];
    s.awaiting = false;
    s.answered = true;
    s.dirty = true;
    setAwaiting(null);
    setAnswer(yes);
    if (!yes && step.confirm) {
      s.steps = [...s.steps.slice(0, s.step + 1), ...step.confirm.denied];
      s.saved = false;
      setSteps(s.steps);
    }
  }, []);

  /** Resumes from wherever the run is: a parked step moves on, a finished run starts the next. */
  const togglePlay = () => {
    const s = live.current;
    setUserRan(true);
    if (reduce) {
      stepBy(1);
      return;
    }
    s.paused = !s.paused;
    setPaused(s.paused);
    if (!s.paused) {
      if (s.phase === "parked") s.phase = "walking";
      if (s.phase === "done") s.holdUntil = 0;
    }
    s.dirty = true;
  };

  /** One step by hand. Past the last step comes the next input's first. */
  const stepBy = (delta: number) => {
    const s = live.current;
    setUserRan(true);
    if (delta > 0 && s.awaiting) respond(true);
    const at = s.step + delta;
    if (at < 0) return;
    if (at >= s.steps.length) {
      const next = (s.scenario + 1) % system.scenarios.length;
      begin(next, true);
      seek(0);
      return;
    }
    seek(at);
  };

  const applyOffline = (next: ReadonlySet<string>, scenarioId?: string) => {
    live.current.offline = next;
    setOffline(next);
    const index = system.scenarios.findIndex((sc) => sc.id === scenarioId);
    if (index >= 0) run(index);
    else live.current.dirty = true;
  };

  const toggleOffline = (id: string, scenarioId?: string) => {
    const next = new Set(offline);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    applyOffline(next, scenarioId);
  };

  useEffect(() => {
    live.current.hover = hover;
    live.current.dirty = true;
  }, [hover]);

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
      // Closed stack first; the first packet leaves once the layers are apart.
      if (!reduce) s.explode = 0;
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
      }
      if (s.explode === 1 && s.phase === "idle") {
        begin(0, false);
        if (reduce) {
          s.step = s.steps.length - 1;
          s.elapsed = stepSeconds(s.steps, s.start, s.step);
          s.phase = "parked";
          s.paused = true;
          setPaused(true);
          setStepIndex(s.step);
          setFinished(true);
        }
      }

      // Nothing changes under someone who is reading.
      const held = s.paused || s.selected !== null || s.focusLayer !== null || s.hover !== null;

      if (s.phase === "walking") {
        if (!held) {
          moving = true;
          s.elapsed += dt / 1000;
        }
        if (!held && s.elapsed >= stepSeconds(s.steps, s.start, s.step)) {
          const question = s.steps[s.step].confirm;
          if (question && !s.answered) {
            if (s.byVisitor) {
              if (!s.awaiting) {
                s.awaiting = true;
                setAwaiting(question.question);
              }
            } else {
              s.answered = true;
              setAnswer(true);
            }
          }
          if (s.awaiting) {
            // Stopped on the question until the visitor answers.
          } else if (s.step < s.steps.length - 1) {
            s.step += 1;
            s.elapsed = 0;
            setStepIndex(s.step);
          } else {
            addSpend(system.scenarios[s.scenario].amount);
            s.phase = "done";
            s.holdUntil = now + (userRan ? VISITOR_HOLD_MS : AUTOPLAY_GAP_MS);
            setFinished(true);
          }
        }
      } else if (
        (s.phase === "done" || s.phase === "parked") &&
        !reduce &&
        now > s.holdUntil &&
        !held
      ) {
        begin(s.phase === "done" ? (s.scenario + 1) % system.scenarios.length : s.scenario, false);
      }

      if (s.dragging) {
        moving = true;
      } else if (Math.abs(s.velocity) > 0.0002) {
        s.camera.yaw += s.velocity;
        s.velocity *= INERTIA;
        moving = true;
      }

      // The camera's flight. Reduced motion lands at once.
      const k = reduce ? 1 : 1 - Math.exp(-dt / FLIGHT_MS);
      const approach = (from: number, to: number) => {
        const next = from + (to - from) * k;
        if (Math.abs(to - next) > 0.001) moving = true;
        return Math.abs(to - next) > 0.001 ? next : to;
      };
      if (s.flyYaw !== null) {
        s.camera.yaw = approach(s.camera.yaw, s.flyYaw);
        if (s.camera.yaw === s.flyYaw) s.flyYaw = null;
      }
      if (s.flyPitch !== null) {
        s.camera.pitch = approach(s.camera.pitch, s.flyPitch);
        if (s.camera.pitch === s.flyPitch) s.flyPitch = null;
      }
      const inFocus = s.focusLayer !== null;
      s.camera.zoom = approach(s.camera.zoom, inFocus ? FOCUS_ZOOM : 1);
      s.camera.lookY = approach(s.camera.lookY, s.focusLayer ? layerY(system, s.focusLayer) : 0);
      s.spread = approach(s.spread, inFocus ? FOCUS_SPREAD : 0);

      if (!reduce && !s.paused) {
        const rested = !s.dragging && now - s.lastInput > SWAY_REST_MS;
        const target = rested ? (inFocus ? SWAY_IN_FOCUS : 1) : 0;
        s.swayAmount += (target - s.swayAmount) * 0.02;
        s.swayClock += dt;
        s.scan = (s.scan + dt) % SCAN_MS;
        moving = true;
      }

      if (!moving && !s.dirty) return;
      s.dirty = false;

      const camera: Camera = {
        ...s.camera,
        yaw: s.camera.yaw + Math.sin(s.swayClock * SWAY_SPEED) * SWAY_RADIANS * s.swayAmount,
      };
      const view: HoloView = {
        explode: reduce ? 1 : easeOutBack(s.explode),
        spread: s.spread,
        focus: s.spreadFrom,
      };
      const route = s.phase === "idle" ? NO_ROUTE : routeFor(view);
      const scanY = reduce
        ? -SCAN_RANGE
        : Math.sin((s.scan / SCAN_MS) * Math.PI * 2) * SCAN_RANGE;
      const f = holoFrame(
        system,
        camera,
        view,
        route,
        { selected: s.selected, hover: s.hover, offline: s.shownOffline },
        scanY,
      );

      f.layers.forEach((layer, i) => {
        const el = p.layers[i];
        if (!el) return;
        el.plane?.setAttribute("d", layer.plane);
        el.edge?.setAttribute("d", layer.plane);
        el.grid?.setAttribute("d", layer.grid);
        el.roofs?.setAttribute("d", layer.roofs);
        el.idle?.setAttribute("d", layer.idle);
      });
      p.scan?.setAttribute("d", reduce ? "" : f.scan);
      p.ring?.setAttribute("d", f.ring);
      p.pillars?.setAttribute("d", f.pillars);
      p.wires?.setAttribute("d", f.wires);
      p.lit?.setAttribute("d", f.lit);
      p.visited?.setAttribute("d", f.visited);
      p.active?.setAttribute("d", f.active);
      p.linked?.setAttribute("d", f.linked);
      p.offline?.setAttribute("d", f.offline);
      p.out?.setAttribute("d", f.out);
      p.back?.setAttribute("d", f.back);
      p.packet?.setAttribute("transform", packetTransform(f.packet));
      if (readBar.current) {
        const share =
          s.phase === "walking"
            ? Math.min(s.elapsed / stepSeconds(s.steps, s.start, s.step), 1)
            : s.phase === "idle"
              ? 0
              : 1;
        readBar.current.style.transform = `scaleX(${share.toFixed(3)})`;
      }
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
  }, [addSpend, begin, offscreen, reduce, routeFor, stepSeconds, system, userRan]);

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
    s.flyYaw = null;
    s.flyPitch = null;
    s.velocity = dx * DRAG_YAW;
    s.camera.yaw += s.velocity;
    s.camera.pitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, s.camera.pitch + dy * DRAG_PITCH));
    s.lastInput = performance.now();
    s.dirty = true;
  };

  const endDrag = () => {
    live.current.dragging = false;
    live.current.lastInput = performance.now();
  };

  /** Clicking open table clears a selection. The end of a drag is not a click. */
  const onStageClick = () => {
    if (live.current.captured) return;
    select(null);
  };

  const onPlaneClick = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    if (live.current.captured) return;
    select(null);
    focusOn(id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      if (selected) select(null);
      else if (focusLayer) focusOn(null);
      return;
    }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (!(e.target as HTMLElement).closest("[data-holo-stage]")) return;
    e.preventDefault();
    const s = live.current;
    s.flyYaw = null;
    s.camera.yaw += e.key === "ArrowLeft" ? -KEY_YAW : KEY_YAW;
    s.lastInput = performance.now();
    s.dirty = true;
  };

  const readout = system.readout;
  const safe = readout ? Math.floor((readout.balance - spent) / readout.days) : 0;
  const activeNode = step.to;
  const runState: HoloRun = {
    scenario,
    steps,
    stepIndex,
    finished,
    log: steps.slice(0, stepIndex + 1).flatMap((s) => s.log ?? []),
    offline: shownOffline,
    awaiting,
    answer,
    respond,
  };
  const anyPoint = selected !== null;

  return (
    <div
      ref={ref}
      data-offscreen={offscreen || undefined}
      onKeyDown={onKeyDown}
      className={`relative w-full h-full aspect-[16/9] ${instrument ? "min-h-[680px] sm:min-h-[600px] xl:min-h-[600px]" : "min-h-[600px] xl:min-h-[520px]"} bg-[#020617] border border-slate-800 flex flex-col group overflow-hidden font-mono text-slate-300`}
    >
      {/* Hardware header */}
      <div className="h-8 border-b border-slate-800 flex items-center px-4 justify-between gap-3 shrink-0">
        <div className="flex gap-2 shrink-0">
          <div className="w-1.5 h-1.5 bg-slate-700" />
          <div className="hud-pulse [--hud-dur:2s] w-1.5 h-1.5 bg-[#3B82F6]" />
          <div className="w-1.5 h-1.5 bg-[#F97316]" />
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest truncate">
          {system.title} {"//"} {system.badge ?? "Simulation"}
        </span>
      </div>

      {/* Run: one button per kind of input */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-800 shrink-0">
        <span className="hidden sm:flex items-center gap-1.5 text-[10px] tracking-widest text-slate-400">
          <Play className="w-3 h-3 text-[#F97316]" />
          {system.runLabel ?? "RUN"}
        </span>
        <div
          role="group"
          aria-label="Run an example through the system"
          className={`grid ${RUN_COLS[system.scenarios.length] ?? "grid-cols-5"} gap-1.5 flex-1`}
        >
          {system.scenarios.map((sc, i) => {
            const on = i === scenarioIndex;
            return (
              <button
                key={sc.id}
                type="button"
                aria-pressed={on}
                onClick={() => run(i)}
                data-hud-target={`HOLO.RUN.${sc.id.toUpperCase()}`}
                className={`h-7 border text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest transition-colors ${
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

      <div className="flex-1 min-h-0 flex flex-col sm:flex-row">
      {instrument && (
        <div className="order-first sm:order-last shrink-0 h-[112px] sm:h-auto sm:w-[34%] sm:max-w-[260px] border-b sm:border-b-0 sm:border-l border-slate-800 bg-[#020617] overflow-hidden">
          {instrument(runState)}
        </div>
      )}
      {/* The table. The outer box measures, the inner one keeps the aspect. */}
      <div className="flex-1 min-w-0 relative min-h-0 overflow-hidden [container-type:size] bg-[linear-gradient(to_right,rgba(30,41,59,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.45)_1px,transparent_1px)] bg-[size:3rem_3rem]">
        {readout && (
          <div className="absolute bottom-2 right-2 sm:bottom-auto sm:top-3 sm:right-3 z-20 w-[136px] border border-slate-800 bg-[#020617]/90 p-2 pointer-events-none">
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 tracking-widest">
              <Wallet className="w-3 h-3 text-emerald-500" />
              {readout.label}
            </div>
            <div className="mt-1 text-sm font-bold text-emerald-500 tracking-wider tabular-nums">
              {fmt(safe)} <span className="text-[9px] font-normal text-slate-400">{readout.unit}</span>
            </div>
            <div className="mt-1 h-0.5 w-full bg-slate-800">
              <div
                className="h-full bg-emerald-500 transition-[width] duration-700"
                style={{ width: `${Math.round(((readout.balance - spent) / readout.balance) * 100)}%` }}
              />
            </div>
            <div className="mt-1 text-[9px] text-slate-400 truncate">{scenario.input}</div>
            <div className="text-[8px] tracking-widest text-slate-400">ILLUSTRATIVE</div>
          </div>
        )}

        <div className="absolute top-2 left-2 z-30 flex flex-col items-start gap-1">
          {focusLayer && (
            <button
              type="button"
              onClick={() => {
                select(null);
                focusOn(null);
              }}
              data-hud-target="HOLO.BACK"
              className="h-7 px-2 flex items-center gap-1.5 border border-[#F97316]/70 bg-[#020617]/90 text-[10px] uppercase tracking-widest text-[#F97316] hover:bg-[#F97316]/10 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to system
            </button>
          )}
          {offline.size > 0 && (
            <button
              type="button"
              onClick={() => applyOffline(EMPTY)}
              className="h-6 px-2 flex items-center gap-1.5 border border-red-500/60 bg-[#020617]/90 text-[9px] uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Power className="w-3 h-3" />
              {offline.size} offline · Restore
            </button>
          )}
        </div>

        {!anyPoint && !focusLayer && (
          <div className="absolute bottom-2 left-3 z-20 text-[9px] tracking-widest text-slate-400 pointer-events-none">
            <span className="sm:hidden">TAP A PART OR A LAYER</span>
            <span className="hidden sm:inline">
              CLICK A PART · CLICK A LAYER TO ZOOM · DRAG TO ROTATE
            </span>
          </div>
        )}

        <div
          role="group"
          data-holo-stage
          aria-label={`${system.title} hologram. Left and right arrow keys rotate it, Escape steps back.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={onStageClick}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100cqw,calc(100cqh*8/7))] aspect-[8/7] [container-type:inline-size] cursor-grab active:cursor-grabbing select-none touch-pan-y"
        >
          <svg
            viewBox={`0 0 ${HOLO_W} ${HOLO_H}`}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          >
            <g className={`transition-opacity duration-300 ${focusLayer ? "opacity-20" : ""}`}>
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
            </g>
            {order.map((layer, i) => {
              const dim = focusLayer !== null && focusLayer !== layer.id;
              return (
                <g
                  key={layer.id}
                  className={`transition-opacity duration-300 ${dim ? "opacity-[0.14]" : ""}`}
                >
                  <path
                    ref={(el) => {
                      layerPaths(i).plane = el;
                    }}
                    d={first.layers[i].plane}
                    fill={BLUE}
                    fillOpacity={focusLayer === layer.id ? 0.09 : 0.055}
                    onClick={(e) => onPlaneClick(e, layer.id)}
                    className={dim || focusLayer === layer.id ? "" : "pointer-events-auto cursor-zoom-in"}
                  />
                  <path
                    ref={(el) => {
                      layerPaths(i).grid = el;
                    }}
                    d={first.layers[i].grid}
                    fill="none"
                    stroke="#475569"
                    strokeOpacity={0.4}
                    strokeWidth={0.8}
                  />
                  <path
                    ref={(el) => {
                      layerPaths(i).edge = el;
                    }}
                    d={first.layers[i].plane}
                    fill="none"
                    stroke={BLUE}
                    strokeOpacity={0.75}
                    strokeWidth={1}
                  />
                </g>
              );
            })}
            <path
              ref={(el) => {
                paths.current.scan = el;
              }}
              d={first.scan}
              fill="none"
              stroke={ORANGE}
              strokeOpacity={focusLayer ? 0 : 0.28}
              strokeWidth={1}
            />
            <path
              ref={(el) => {
                paths.current.wires = el;
              }}
              d={first.wires}
              fill="none"
              stroke="#64748B"
              strokeOpacity={anyPoint || focusLayer ? 0.2 : 0.55}
              strokeWidth={0.9}
              strokeDasharray="3 4"
              className="transition-[stroke-opacity] duration-300"
            />
            <g className={`transition-opacity duration-300 ${anyPoint || focusLayer ? "opacity-25" : ""}`}>
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
            </g>
            <path
              ref={(el) => {
                paths.current.lit = el;
              }}
              d={first.lit}
              fill="none"
              stroke={ORANGE}
              strokeWidth={1.6}
            />
            {order.map((layer, i) => {
              const dim = focusLayer !== null && focusLayer !== layer.id;
              return (
                <g
                  key={layer.id}
                  className={`transition-opacity duration-300 ${dim ? "opacity-[0.14]" : ""}`}
                >
                  <path
                    ref={(el) => {
                      layerPaths(i).roofs = el;
                    }}
                    d={first.layers[i].roofs}
                    fill="#0B1226"
                    fillOpacity={0.9}
                  />
                  <path
                    ref={(el) => {
                      layerPaths(i).idle = el;
                    }}
                    d={first.layers[i].idle}
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth={1}
                  />
                </g>
              );
            })}
            <path
              ref={(el) => {
                paths.current.visited = el;
              }}
              d={first.visited}
              fill="none"
              stroke={BLUE}
              strokeOpacity={focusLayer ? 0.2 : 1}
              strokeWidth={1.4}
              className="transition-[stroke-opacity] duration-300"
            />
            <path
              ref={(el) => {
                paths.current.linked = el;
              }}
              d={first.linked}
              fill="none"
              stroke="#60A5FA"
              strokeWidth={1.6}
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
            <path
              ref={(el) => {
                paths.current.offline = el;
              }}
              d={first.offline}
              fill="none"
              stroke={RED}
              strokeWidth={1.8}
              strokeDasharray="4 3"
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

          {system.layers.map((layer, i) => {
            const on = focusLayer === layer.id;
            const hidden = focusLayer !== null && !on;
            return (
              <button
                key={layer.id}
                type="button"
                ref={(el) => {
                  layerLabels.current[i] = el;
                }}
                style={{ transform: layerTransform(first.layerLabels[i]) }}
                aria-pressed={on}
                aria-label={`Zoom to ${layer.label}: ${layer.summary}`}
                tabIndex={hidden ? -1 : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  select(null);
                  focusOn(on ? null : layer.id);
                }}
                className={`absolute left-0 top-0 px-1 py-1 text-[8px] leading-none tracking-widest whitespace-nowrap bg-[#020617]/70 border cursor-zoom-in transition-[opacity,color,border-color] duration-300 ${
                  hidden ? "opacity-0 pointer-events-none" : ""
                } ${
                  on
                    ? "border-[#F97316]/70 text-[#F97316]"
                    : "border-slate-800 text-[#60A5FA] hover:border-[#3B82F6]"
                }`}
              >
                L{system.layers.indexOf(layer) + 1}
                <span className="hidden @[380px]:inline"> {"//"} {layer.label}</span>
              </button>
            );
          })}

          {system.nodes.map((node, i) => {
            const down = shownOffline.has(node.id);
            const on = node.id === selected || node.id === hover || node.id === activeNode;
            const tag = node.id === activeNode ? step.tag : down ? "OFFLINE" : undefined;
            const faded =
              (focusLayer !== null && node.layer !== focusLayer) ||
              (selected !== null && node.id !== selected && !linked.has(node.id));
            const techClass =
              node.layer === focusLayer || node.id === selected
                ? "block"
                : node.size <= 11 || system.quietTech
                  ? "hidden"
                  : "hidden @[380px]:block";
            return (
              <button
                key={node.id}
                type="button"
                ref={(el) => {
                  nodeLabels.current[i] = el;
                }}
                style={{ transform: labelTransform(first.nodeLabels[i]) }}
                aria-pressed={node.id === selected}
                aria-label={`${node.label}, ${node.tech}: ${node.detail}`}
                onPointerEnter={(e) => {
                  // A tap has no leave to end it, and would hold the run for good.
                  if (e.pointerType === "mouse") setHover(node.id);
                }}
                onPointerLeave={() => setHover(null)}
                onFocus={(e) => {
                  if (e.currentTarget.matches(":focus-visible")) setHover(node.id);
                }}
                onBlur={() => setHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  select(node.id === selected ? null : node.id);
                }}
                className={`absolute left-0 top-0 px-1 py-0.5 text-[8px] @[380px]:text-[9px] leading-none tracking-wider text-center whitespace-nowrap bg-[#020617]/80 border cursor-pointer transition-[opacity,color,border-color] duration-300 ${
                  faded ? "opacity-30" : ""
                } ${
                  down
                    ? "border-red-500/70 text-red-400"
                    : on
                      ? "z-10 border-[#F97316]/70 text-[#F97316]"
                      : "border-transparent text-slate-300 hover:border-[#3B82F6]/60"
                }`}
              >
                {node.label}
                {tag && <span className="ml-1 text-slate-100">{tag}</span>}
                <span className={`${techClass} mt-0.5 text-[7px] tracking-normal text-slate-400`}>{node.tech}</span>
              </button>
            );
          })}
        </div>
      </div>
      </div>

      {/* Trace: the same route as text. Each stop can be walked by tapping it.
          Two rows are always reserved on phones: a long route wraps, and the
          table must not change size when the input does. */}
      <div className="border-t border-slate-800 px-3 pt-2 pb-2.5 shrink-0 bg-[#020617]">
        <div className="flex items-start gap-2">
          <div role="group" aria-label="Control the walkthrough" className="flex gap-1 shrink-0">
            <button
              type="button"
              aria-label="Previous step"
              disabled={stepIndex === 0}
              onClick={() => stepBy(-1)}
              className={`${TRANSPORT} disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:text-slate-300`}
            >
              <SkipBack className="w-3 h-3" />
            </button>
            <button
              type="button"
              aria-label={paused ? "Play" : "Pause"}
              onClick={togglePlay}
              data-hud-target="HOLO.PLAY"
              className={`${TRANSPORT} ${paused ? "border-[#F97316] text-[#F97316]" : ""}`}
            >
              {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </button>
            <button
              type="button"
              aria-label="Next step"
              onClick={() => stepBy(1)}
              className={TRANSPORT}
            >
              <SkipForward className="w-3 h-3" />
            </button>
          </div>
          <div className="h-[52px] sm:h-6 flex-1 min-w-0 flex flex-wrap content-start items-center gap-x-1 gap-y-1">
          {steps.map((s, i) => (
            <button
              key={`${scenario.id}-${i}-${s.to}`}
              type="button"
              aria-current={i === stepIndex ? "step" : undefined}
              onClick={() => {
                setUserRan(true);
                seek(i);
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
        </div>
        {/* How long this step has left, so the text never seems to vanish at random. */}
        <div className="mt-2 h-px w-full bg-slate-800">
          <div ref={readBar} className="h-full w-full origin-left bg-[#3B82F6] scale-x-0" />
        </div>
        <p
          aria-live={userRan ? "polite" : "off"}
          className="mt-1.5 h-[42px] sm:h-[28px] text-[11px] leading-[14px] text-slate-300 overflow-hidden"
        >
          {hoverNode ? (
            <>
              <span className="text-[#F97316]">{hoverNode.label}: </span>
              {hoverNode.detail}
            </>
          ) : focusedLayer ? (
            <>
              <span className="text-[#F97316]">{focusedLayer.label}: </span>
              {focusedLayer.summary}
            </>
          ) : (
            step.caption
          )}
        </p>
      </div>

      {/* A selected part's card rises over the trace strip, so opening it
          moves nothing on the table. */}
      {selectedNode && (
        <div className="absolute left-0 right-0 bottom-0 z-40 border-t border-[#F97316]/60 bg-[#020617] px-3 py-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-widest text-[#F97316]">{selectedNode.label}</div>
              <div className="text-[9px] tracking-wider text-slate-400">{selectedNode.tech}</div>
            </div>
            <button
              type="button"
              aria-label={`Close ${selectedNode.label}`}
              onClick={() => select(null)}
              className="w-6 h-6 shrink-0 flex items-center justify-center border border-slate-800 text-slate-400 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="mt-1.5 text-[11px] leading-[15px] text-slate-200">{selectedNode.detail}</p>
          {(selectedNode.receives || selectedNode.sends) && (
            <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[10px] leading-[14px]">
              {selectedNode.receives && (
                <div>
                  <dt className="inline text-[#60A5FA]">GETS </dt>
                  <dd className="inline text-slate-300">{selectedNode.receives}</dd>
                </div>
              )}
              {selectedNode.sends && (
                <div>
                  <dt className="inline text-emerald-500">SENDS </dt>
                  <dd className="inline text-slate-300">{selectedNode.sends}</dd>
                </div>
              )}
            </dl>
          )}
          {selectedNode.tools && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedNode.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-1.5 py-0.5 border border-slate-800 text-[9px] tracking-wider text-[#60A5FA]"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {focusLayer !== selectedNode.layer && (
              <button
                type="button"
                onClick={() => focusOn(selectedNode.layer)}
                className="h-7 px-2 flex items-center gap-1.5 border border-slate-700 text-[10px] uppercase tracking-widest text-slate-300 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
              >
                <ZoomIn className="w-3 h-3" />
                Zoom to layer
              </button>
            )}
            {selectedNode.scenario && (
              <button
                type="button"
                onClick={() => toggleOffline(selectedNode.id, selectedNode.scenario)}
                className={`h-7 px-2 flex items-center gap-1.5 border text-[10px] uppercase tracking-widest transition-colors ${
                  offline.has(selectedNode.id)
                    ? "border-emerald-500/60 text-emerald-500 hover:bg-emerald-500/10"
                    : "border-red-500/60 text-red-400 hover:bg-red-500/10"
                }`}
              >
                <Power className="w-3 h-3" />
                {offline.has(selectedNode.id) ? "Bring back & run" : "Take offline & run"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
