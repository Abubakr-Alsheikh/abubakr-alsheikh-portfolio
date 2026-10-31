/**
 * Geometry for the project holograms: a system drawn as exploded, stacked
 * layers in perspective, in the same spirit as `sphere.ts`. Real projection,
 * no 3D library.
 *
 * Pure functions, no React, no DOM. Numbers are rounded before they reach a
 * string, so server and client render the same first frame byte for byte.
 */

/** The SVG's viewBox. The stage keeps this aspect ratio at every size. */
export const HOLO_W = 640;
export const HOLO_H = 560;

const CX = HOLO_W / 2;
const CY = HOLO_H / 2 - 18;
/** World units to viewBox units. */
const SCALE = 1.78;
/** Camera distance. Smaller means stronger perspective. */
const DIST = 760;

/** Half-size of a layer's plane, world units. */
const PLANE_X = 122;
const PLANE_Z = 62;
const BOX_HEIGHT = 12;
/** A small box, such as a backup, stands shorter so it reads as secondary. */
const SMALL_BOX = 11;
const SMALL_BOX_HEIGHT = 7;
const LAYER_LABEL_X = 8;
/** The table's ring sits this far under the bottom layer. */
const RING_GAP = 19;
const RING_R = 122;

export interface HoloLayer {
  id: string;
  label: string;
  /** What this layer is for, in plain words, shown when it is in focus. */
  summary: string;
  y: number;
}

export interface HoloNode {
  id: string;
  /** Plain name drawn in the hologram. */
  label: string;
  /** The technical name under it, for the reader who wants it. */
  tech: string;
  /** What it does, in words anyone can follow. */
  detail: string;
  receives: string;
  sends: string;
  layer: string;
  x: number;
  z: number;
  /** Half-width of the node's box. */
  size: number;
  /** A service a visitor can take offline; the scenario that shows the result. */
  scenario?: string;
}

/** Where the message goes if this step's service is offline. */
export interface HoloFallback {
  backup: string;
  downCaption: string;
  rescuedCaption: string;
  /** Both offline: the route ends here, and the entry is not saved. */
  lostCaption: string;
  /** Nodes the packet passes on its way back to the start in that case. */
  returnVia: string[];
}

export interface HoloStep {
  to: string;
  /** Nodes the packet passes on the way, for a reply that climbs back up. */
  via?: string[];
  /** Name shown in the trace strip. */
  title: string;
  caption: string;
  /** Extra time parked on the node, ms. */
  hold?: number;
  /** Short state printed beside the node while the packet is there. */
  tag?: string;
  /** A reply: the wire lights green instead of blue. */
  back?: boolean;
  fallback?: HoloFallback;
}

export interface HoloScenario {
  id: string;
  label: string;
  input: string;
  /** The node the packet appears on. */
  start: string;
  steps: HoloStep[];
  /** What this entry costs the readout, illustrative. */
  amount: number;
  /** Services shown offline when this plays by itself, so the failover gets seen. */
  demoOffline?: string[];
}

export interface HoloSystem {
  title: string;
  layers: HoloLayer[];
  nodes: HoloNode[];
  /** Wires drawn at rest, as [upper or source node, other node]. */
  links: [string, string][];
  scenarios: HoloScenario[];
  readout: {
    label: string;
    unit: string;
    balance: number;
    days: number;
  };
}

export interface Vec {
  x: number;
  y: number;
  z: number;
}

export interface Camera {
  yaw: number;
  pitch: number;
  /** 1 shows the whole system. */
  zoom: number;
  /** The world height the camera centres on. */
  lookY: number;
}

/** How the layers are arranged for a frame. */
export interface HoloView {
  /** 0 is a closed stack, 1 is apart. */
  explode: number;
  /** World units the other layers move away from the focused one. */
  spread: number;
  focus: string | null;
}

export const OPEN_VIEW: HoloView = { explode: 1, spread: 0, focus: null };

const r1 = (n: number) => Math.round(n * 10) / 10;

interface Lens {
  cosY: number;
  sinY: number;
  cosP: number;
  sinP: number;
  zoom: number;
  lookY: number;
}

const lens = ({ yaw, pitch, zoom, lookY }: Camera): Lens => ({
  cosY: Math.cos(yaw),
  sinY: Math.sin(yaw),
  cosP: Math.cos(pitch),
  sinP: Math.sin(pitch),
  zoom,
  lookY,
});

function project(p: Vec, l: Lens): [number, number] {
  const px = p.y - l.lookY;
  const x = p.x * l.cosY - p.z * l.sinY;
  const z = p.x * l.sinY + p.z * l.cosY;
  // Looking down: what is further away sits higher, and higher layers are nearer.
  const y = px * l.cosP + z * l.sinP;
  const depth = z * l.cosP - px * l.sinP;
  const f = (DIST / (DIST + depth)) * SCALE * l.zoom;
  return [r1(CX + x * f), r1(CY - y * f)];
}

const line = (points: Vec[], l: Lens, close = false) => {
  let d = "";
  for (let i = 0; i < points.length; i++) {
    const [x, y] = project(points[i], l);
    d += `${i === 0 ? "M" : "L"}${x} ${y}`;
  }
  return close ? `${d}Z` : d;
};

const planeCorners = (y: number): Vec[] => [
  { x: -PLANE_X, y, z: -PLANE_Z },
  { x: PLANE_X, y, z: -PLANE_Z },
  { x: PLANE_X, y, z: PLANE_Z },
  { x: -PLANE_X, y, z: PLANE_Z },
];

function grid(y: number, l: Lens) {
  let d = "";
  for (let x = -PLANE_X + 40.67; x < PLANE_X; x += 40.67) {
    d += line([{ x, y, z: -PLANE_Z }, { x, y, z: PLANE_Z }], l);
  }
  for (let z = -PLANE_Z + 31; z < PLANE_Z; z += 31) {
    d += line([{ x: -PLANE_X, y, z }, { x: PLANE_X, y, z }], l);
  }
  return d;
}

const boxHeight = (node: HoloNode) => (node.size <= SMALL_BOX ? SMALL_BOX_HEIGHT : BOX_HEIGHT);

function box(node: HoloNode, y: number, l: Lens) {
  const s = node.size;
  const top = y + boxHeight(node);
  const a: Vec[] = [
    { x: node.x - s, y, z: node.z - s },
    { x: node.x + s, y, z: node.z - s },
    { x: node.x + s, y, z: node.z + s },
    { x: node.x - s, y, z: node.z + s },
  ];
  const b = a.map((p) => ({ ...p, y: top }));
  const roof = line(b, l, true);
  let edges = line(a, l, true) + roof;
  for (let i = 0; i < 4; i++) edges += line([a[i], b[i]], l);
  return { edges, roof };
}

function ring(y: number, l: Lens) {
  const circle: Vec[] = [];
  for (let i = 0; i < 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    circle.push({ x: Math.cos(t) * RING_R, y, z: Math.sin(t) * RING_R });
  }
  let ticks = "";
  for (let i = 0; i < 24; i++) {
    const t = (i / 24) * Math.PI * 2;
    const inner = i % 6 === 0 ? 0.88 : 0.94;
    ticks += line(
      [
        { x: Math.cos(t) * RING_R * inner, y, z: Math.sin(t) * RING_R * inner },
        { x: Math.cos(t) * RING_R, y, z: Math.sin(t) * RING_R },
      ],
      l,
    );
  }
  return line(circle, l, true) + ticks;
}

/** Node id to its node and layer. Built once per system: a frame asks often. */
const lookups = new WeakMap<HoloSystem, Map<string, { node: HoloNode; layer: HoloLayer }>>();
const layerOrders = new WeakMap<HoloSystem, HoloLayer[]>();

function lookup(system: HoloSystem, id: string) {
  let index = lookups.get(system);
  if (!index) {
    index = new Map();
    for (const node of system.nodes) {
      const layer = system.layers.find((n) => n.id === node.layer);
      if (!layer) throw new Error(`Unknown hologram layer: ${node.layer}`);
      index.set(node.id, { node, layer });
    }
    lookups.set(system, index);
  }
  const found = index.get(id);
  if (!found) throw new Error(`Unknown hologram node: ${id}`);
  return found;
}

/** Layers bottom up: the order they are painted, so nearer planes cover farther ones. */
export function layersBottomUp(system: HoloSystem) {
  let order = layerOrders.get(system);
  if (!order) {
    order = [...system.layers].sort((a, b) => a.y - b.y);
    layerOrders.set(system, order);
  }
  return order;
}

/** A layer's height in a view: opened by `explode`, pushed clear of the focused layer. */
function heightOf(system: HoloSystem, layer: HoloLayer, view: HoloView) {
  const y = layer.y * view.explode;
  if (!view.focus || view.focus === layer.id) return y;
  const focused = system.layers.find((n) => n.id === view.focus);
  if (!focused) return y;
  return y + (layer.y > focused.y ? view.spread : -view.spread);
}

/** The world height the camera needs to centre a layer. */
export function layerY(system: HoloSystem, id: string) {
  return system.layers.find((n) => n.id === id)?.y ?? 0;
}

function nodePosition(system: HoloSystem, id: string, view: HoloView): Vec {
  const { node, layer } = lookup(system, id);
  return { x: node.x, y: heightOf(system, layer, view), z: node.z };
}

/**
 * The wire between two nodes, one coordinate map for the drawn wire and the
 * packet riding it. Downward: a straight drop, then along the lower plane.
 * Upward is that same wire walked in reverse, so a reply retraces its route.
 */
export function leg(system: HoloSystem, from: string, to: string, view: HoloView): Vec[] {
  const a = nodePosition(system, from, view);
  const b = nodePosition(system, to, view);
  if (a.y < b.y) return leg(system, to, from, view).reverse();
  return [a, { x: a.x, y: b.y, z: a.z }, { x: b.x, y: b.y, z: a.z }, b];
}

const distance = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

export const pathLength = (points: Vec[]) => {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += distance(points[i - 1], points[i]);
  return total;
};

/** The part of a polyline up to `travelled` world units along it. */
export function pathUpTo(points: Vec[], travelled: number): Vec[] {
  const out: Vec[] = [points[0]];
  let left = travelled;
  for (let i = 1; i < points.length; i++) {
    const span = distance(points[i - 1], points[i]);
    if (left >= span) {
      out.push(points[i]);
      left -= span;
      continue;
    }
    if (span > 0) {
      const t = left / span;
      const a = points[i - 1];
      const b = points[i];
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t });
    }
    break;
  }
  return out;
}

/** The world path a step walks, including any stops on the way. */
export function stepPath(
  system: HoloSystem,
  start: string,
  steps: HoloStep[],
  stepIndex: number,
  view: HoloView = OPEN_VIEW,
): Vec[] {
  const step = steps[stepIndex];
  const from = stepIndex === 0 ? start : steps[stepIndex - 1].to;
  if (from === step.to) return [nodePosition(system, from, view)];
  const stops = [from, ...(step.via ?? []), step.to];
  const out: Vec[] = [];
  for (let i = 1; i < stops.length; i++) out.push(...leg(system, stops[i - 1], stops[i], view));
  return out;
}

/**
 * A scenario's route once the offline services are taken into account. A
 * service that is down hands over to its backup. With both down the route stops
 * and returns to where it started, and `saved` says no entry reached the ledger.
 */
export function resolveRoute(
  scenario: HoloScenario,
  offline: ReadonlySet<string>,
): { steps: HoloStep[]; saved: boolean } {
  const steps: HoloStep[] = [];
  for (const step of scenario.steps) {
    const fallback = step.fallback;
    if (!fallback || !offline.has(step.to)) {
      steps.push(step);
      continue;
    }
    steps.push({ ...step, caption: fallback.downCaption, tag: "OFFLINE", hold: 500 });
    if (!offline.has(fallback.backup)) {
      steps.push({
        to: fallback.backup,
        title: "Backup",
        caption: fallback.rescuedCaption,
        tag: "TOOK OVER",
        hold: 300,
      });
      continue;
    }
    steps.push({
      to: fallback.backup,
      title: "Backup",
      caption: fallback.lostCaption,
      tag: "OFFLINE",
      hold: 500,
    });
    steps.push({
      to: scenario.start,
      via: fallback.returnVia,
      title: "Kept",
      caption: fallback.lostCaption,
      tag: "KEPT",
    });
    return { steps, saved: false };
  }
  return { steps, saved: true };
}

export interface HoloRoute {
  /** Completed outward wire plus the part of the current step walked so far. */
  out: Vec[][];
  /** The same, for reply steps. */
  back: Vec[][];
  packet: Vec | null;
  /** Nodes already passed. */
  visited: Set<string>;
  /** Node the packet is on or heading to. */
  active: string | null;
}

export const NO_ROUTE: HoloRoute = {
  out: [],
  back: [],
  packet: null,
  visited: new Set(),
  active: null,
};

export interface HoloMarks {
  /** The node a visitor clicked: its wires light up. */
  selected: string | null;
  hover: string | null;
  offline: ReadonlySet<string>;
}

export const NO_MARKS: HoloMarks = { selected: null, hover: null, offline: new Set() };

export interface HoloLayerFrame {
  plane: string;
  grid: string;
  roofs: string;
  idle: string;
}

export interface HoloFrame {
  /** Bottom up, matching `layersBottomUp`. */
  layers: HoloLayerFrame[];
  scan: string;
  ring: string;
  pillars: string;
  wires: string;
  /** The selected node's own wires. */
  lit: string;
  visited: string;
  active: string;
  linked: string;
  offline: string;
  out: string;
  back: string;
  packet: [number, number] | null;
  /** Label anchors as percentages of the stage's width, for cqw transforms. */
  nodeLabels: [number, number][];
  layerLabels: [number, number][];
}

const toCqw = ([x, y]: [number, number]): [number, number] => [
  Math.round((x / HOLO_W) * 10000) / 100,
  Math.round((y / HOLO_W) * 10000) / 100,
];

/** The nodes wired directly to this one. */
export function linkedTo(system: HoloSystem, id: string | null): Set<string> {
  const out = new Set<string>();
  if (!id) return out;
  for (const [a, b] of system.links) {
    if (a === id) out.add(b);
    if (b === id) out.add(a);
  }
  return out;
}

/** Everything the stage draws for one camera, view, route and set of marks. */
export function holoFrame(
  system: HoloSystem,
  camera: Camera,
  view: HoloView,
  route: HoloRoute,
  marks: HoloMarks,
  scanY: number,
): HoloFrame {
  const l = lens(camera);
  const order = layersBottomUp(system);
  const point = marks.selected ?? marks.hover;
  const linked = linkedTo(system, point);

  const layers: HoloLayerFrame[] = order.map((layer) => {
    const y = heightOf(system, layer, view);
    return {
      plane: line(planeCorners(y), l, true),
      grid: grid(y, l),
      roofs: "",
      idle: "",
    };
  });

  let wires = "";
  let lit = "";
  for (const [a, b] of system.links) {
    const d = line(leg(system, a, b, view), l);
    if (a === point || b === point) lit += d;
    else wires += d;
  }

  let visited = "";
  let active = "";
  let linkedBoxes = "";
  let offline = "";
  for (const node of system.nodes) {
    const { layer } = lookup(system, node.id);
    const slot = layers[order.indexOf(layer)];
    const { edges, roof } = box(node, heightOf(system, layer, view), l);
    slot.roofs += roof;
    if (marks.offline.has(node.id)) offline += edges;
    else if (node.id === route.active || node.id === point) active += edges;
    else if (linked.has(node.id)) linkedBoxes += edges;
    else if (route.visited.has(node.id)) visited += edges;
    else slot.idle += edges;
  }

  const bottom = order[0] ? heightOf(system, order[0], view) : 0;
  const ringY = bottom - RING_GAP;
  const pillars = planeCorners(bottom)
    .map((corner) => line([corner, { ...corner, y: ringY }], l))
    .join("");

  const nodeLabels = system.nodes.map((node) => {
    const p = nodePosition(system, node.id, view);
    return toCqw(project({ ...p, y: p.y + boxHeight(node) }, l));
  });

  // Layer names keep a fixed column and only follow their plane's height, so
  // no rotation can land one on a node.
  const layerLabels = system.layers.map((layer) => {
    const [, y] = project({ x: 0, y: heightOf(system, layer, view), z: 0 }, l);
    return toCqw([LAYER_LABEL_X, y]);
  });

  return {
    layers,
    scan: line(planeCorners(scanY), l, true),
    ring: ring(ringY, l),
    pillars,
    wires,
    lit,
    visited,
    active,
    linked: linkedBoxes,
    offline,
    out: route.out.map((p) => line(p, l)).join(""),
    back: route.back.map((p) => line(p, l)).join(""),
    packet: route.packet ? project(route.packet, l) : null,
    nodeLabels,
    layerLabels,
  };
}
