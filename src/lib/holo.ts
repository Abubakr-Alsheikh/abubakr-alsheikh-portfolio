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
const LAYER_LABEL_X = 8;
const RING_Y = -118;
const RING_R = 122;

export interface HoloLayer {
  id: string;
  label: string;
  y: number;
}

export interface HoloNode {
  id: string;
  /** Short name drawn in the hologram. */
  label: string;
  /** Full name and what it does, shown when the node is hovered or focused. */
  name: string;
  detail: string;
  layer: string;
  x: number;
  z: number;
  /** Half-width of the node's box. */
  size: number;
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
}

const r1 = (n: number) => Math.round(n * 10) / 10;

interface Lens {
  cosY: number;
  sinY: number;
  cosP: number;
  sinP: number;
}

const lens = ({ yaw, pitch }: Camera): Lens => ({
  cosY: Math.cos(yaw),
  sinY: Math.sin(yaw),
  cosP: Math.cos(pitch),
  sinP: Math.sin(pitch),
});

function project(p: Vec, l: Lens): [number, number] {
  const x = p.x * l.cosY - p.z * l.sinY;
  const z = p.x * l.sinY + p.z * l.cosY;
  // Looking down: what is further away sits higher, and higher layers are nearer.
  const y = p.y * l.cosP + z * l.sinP;
  const depth = z * l.cosP - p.y * l.sinP;
  const f = (DIST / (DIST + depth)) * SCALE;
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

function box(node: HoloNode, y: number, l: Lens) {
  const s = node.size;
  const top = y + BOX_HEIGHT;
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

function ring(l: Lens) {
  const circle: Vec[] = [];
  for (let i = 0; i < 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    circle.push({ x: Math.cos(t) * RING_R, y: RING_Y, z: Math.sin(t) * RING_R });
  }
  let ticks = "";
  for (let i = 0; i < 24; i++) {
    const t = (i / 24) * Math.PI * 2;
    const inner = i % 6 === 0 ? 0.88 : 0.94;
    ticks += line(
      [
        { x: Math.cos(t) * RING_R * inner, y: RING_Y, z: Math.sin(t) * RING_R * inner },
        { x: Math.cos(t) * RING_R, y: RING_Y, z: Math.sin(t) * RING_R },
      ],
      l,
    );
  }
  return line(circle, l, true) + ticks;
}

/** A layer's height for a given explode amount: 0 is a closed stack, 1 is apart. */
const heightOf = (layer: HoloLayer, explode: number) => layer.y * explode;

/** Node id to its node and layer. Built once per system: a frame asks often. */
const lookups = new WeakMap<HoloSystem, Map<string, { node: HoloNode; layer: HoloLayer }>>();

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

function nodePosition(system: HoloSystem, id: string, explode = 1): Vec {
  const { node, layer } = lookup(system, id);
  return { x: node.x, y: heightOf(layer, explode), z: node.z };
}

/**
 * The wire between two nodes, one coordinate map for the drawn wire and the
 * packet riding it. Downward: a straight drop, then along the lower plane.
 * Upward is that same wire walked in reverse, so a reply retraces its route.
 */
export function leg(system: HoloSystem, from: string, to: string, explode = 1): Vec[] {
  const a = nodePosition(system, from, explode);
  const b = nodePosition(system, to, explode);
  if (a.y < b.y) return leg(system, to, from, explode).reverse();
  return [
    a,
    { x: a.x, y: b.y, z: a.z },
    { x: b.x, y: b.y, z: a.z },
    b,
  ];
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

/** The world path a scenario's step walks, including any stops on the way. */
export function stepPath(system: HoloSystem, scenario: HoloScenario, stepIndex: number): Vec[] {
  const step = scenario.steps[stepIndex];
  const from = stepIndex === 0 ? scenario.start : scenario.steps[stepIndex - 1].to;
  if (from === step.to) return [nodePosition(system, from)];
  const stops = [from, ...(step.via ?? []), step.to];
  const out: Vec[] = [];
  for (let i = 1; i < stops.length; i++) out.push(...leg(system, stops[i - 1], stops[i]));
  return out;
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

export interface HoloFrame {
  planes: string[];
  grid: string;
  edges: string;
  scan: string;
  ring: string;
  pillars: string;
  wires: string;
  roofs: string;
  idle: string;
  visited: string;
  active: string;
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

/** Everything the stage draws for one camera, explode amount and route. */
export function holoFrame(
  system: HoloSystem,
  camera: Camera,
  explode: number,
  route: HoloRoute,
  focus: string | null,
  scanY: number,
): HoloFrame {
  const l = lens(camera);

  // Painted bottom up, so nearer planes cover farther ones while looking down.
  const layers = [...system.layers].sort((a, b) => a.y - b.y);
  const planes = layers.map((layer) => line(planeCorners(heightOf(layer, explode)), l, true));
  const gridLines = layers.map((layer) => grid(heightOf(layer, explode), l)).join("");

  const wires = system.links
    .map(([a, b]) => line(leg(system, a, b, explode), l))
    .join("");

  let roofs = "";
  let idle = "";
  let visited = "";
  let active = "";
  for (const node of system.nodes) {
    const { layer } = lookup(system, node.id);
    const { edges, roof } = box(node, heightOf(layer, explode), l);
    roofs += roof;
    if (node.id === route.active || node.id === focus) active += edges;
    else if (route.visited.has(node.id)) visited += edges;
    else idle += edges;
  }

  const bottom = layers[0] ? heightOf(layers[0], explode) : 0;
  const pillars = planeCorners(bottom)
    .map((corner) => line([corner, { ...corner, y: RING_Y }], l))
    .join("");

  const nodeLabels = system.nodes.map((node) => {
    const p = nodePosition(system, node.id, explode);
    return toCqw(project({ ...p, y: p.y + BOX_HEIGHT }, l));
  });

  // Layer names keep a fixed column and only follow their plane's height, so
  // no rotation can land one on a node.
  const layerLabels = system.layers.map((layer) => {
    const [, y] = project({ x: 0, y: heightOf(layer, explode), z: 0 }, l);
    return toCqw([LAYER_LABEL_X, y]);
  });

  return {
    planes,
    grid: gridLines,
    edges: planes.join(""),
    scan: line(planeCorners(scanY), l, true),
    ring: ring(l),
    pillars,
    wires,
    roofs,
    idle,
    visited,
    active,
    out: route.out.map((p) => line(p, l)).join(""),
    back: route.back.map((p) => line(p, l)).join(""),
    packet: route.packet ? project(route.packet, l) : null,
    nodeLabels,
    layerLabels,
  };
}
