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

/** What a node looks like: its job, readable before its label is. */
export type HoloShape =
  | "bubble"
  | "phone"
  | "gate"
  | "bolt"
  | "orb"
  | "gem"
  | "camera"
  | "spike"
  | "drum"
  | "terminal"
  | "stack"
  | "shield"
  | "gear"
  | "undo"
  | "screen"
  | "page"
  | "sheets"
  | "brush"
  | "window"
  | "cube"
  | "funnel"
  | "hex";

/** The outline of a layer's plate, so each system stands on its own table. */
export type HoloPlate = "rect" | "disc" | "hex" | "diamond" | "octagon";

export interface HoloNode {
  id: string;
  shape: HoloShape;
  /** Plain name drawn in the hologram. */
  label: string;
  /** The technical name under it, for the reader who wants it. */
  tech: string;
  /** What it does, in words anyone can follow. */
  detail: string;
  receives?: string;
  sends?: string;
  /** The real names behind it, shown on its card. */
  tools?: string[];
  layer: string;
  x: number;
  z: number;
  /** Half-width of the node's shape, world units. */
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
  /** Short state printed beside the node while the packet is there. */
  tag?: string;
  /** A reply: the wire lights green instead of blue. */
  back?: boolean;
  fallback?: HoloFallback;
  /** Lines this step prints to the system's instrument. */
  log?: string[];
  /** Left out of the route while its node is offline. */
  optional?: boolean;
  /** What this step says instead while another node is offline. */
  ifOffline?: { node: string; caption: string; tag?: string; log?: string[] };
  /** Stops here until the visitor answers; a run nobody asked for answers yes. */
  confirm?: {
    question: string;
    /** Where the route goes on a no. */
    denied: HoloStep[];
  };
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
  /** The word beside the input buttons. */
  runLabel?: string;
  /** What the header says this panel is. */
  badge?: string;
  /** Node labels show their small line only when selected or zoomed, for a crowded table. */
  quietTech?: boolean;
  plate?: HoloPlate;
  /** A bare axis through every layer, for a system drawn without wires. */
  spine?: boolean;
  camera?: { yaw: number; pitch: number };
  readout?: {
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

const DISC_R = 108;
const HEX_R = 118;
const POLY_SIDES: Partial<Record<HoloPlate, number>> = { hex: 6, diamond: 4, octagon: 8 };

const ringAt = (r: number, count: number, y: number, turn = 0): Vec[] => {
  const out: Vec[] = [];
  for (let i = 0; i < count; i++) {
    const t = turn + (i / count) * Math.PI * 2;
    out.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r * 0.82 });
  }
  return out;
};

function plateOutline(plate: HoloPlate, y: number): Vec[] {
  if (plate === "disc") return ringAt(DISC_R, 56, y);
  const sides = POLY_SIDES[plate];
  if (sides) return ringAt(HEX_R, sides, y, sides === 8 ? Math.PI / 8 : 0);
  return [
    { x: -PLANE_X, y, z: -PLANE_Z },
    { x: PLANE_X, y, z: -PLANE_Z },
    { x: PLANE_X, y, z: PLANE_Z },
    { x: -PLANE_X, y, z: PLANE_Z },
  ];
}

/** Four points on a plate's rim, for the table's light pillars. */
const plateCorners = (plate: HoloPlate, y: number): Vec[] => {
  const outline = plateOutline(plate, y);
  const step = outline.length / 4;
  return [0, 1, 2, 3].map((i) => outline[Math.floor(i * step)]);
};

function grid(plate: HoloPlate, y: number, l: Lens) {
  let d = "";
  if (plate === "disc") {
    for (const r of [DISC_R * 0.36, DISC_R * 0.68]) d += line(ringAt(r, 40, y), l, true);
    for (const t of [0, Math.PI / 2]) {
      d += line(
        [
          { x: Math.cos(t) * DISC_R, y, z: Math.sin(t) * DISC_R * 0.82 },
          { x: -Math.cos(t) * DISC_R, y, z: -Math.sin(t) * DISC_R * 0.82 },
        ],
        l,
      );
    }
    return d;
  }
  const sides = POLY_SIDES[plate];
  if (sides) {
    const turn = sides === 8 ? Math.PI / 8 : 0;
    for (const r of [HEX_R * 0.36, HEX_R * 0.68]) d += line(ringAt(r, sides, y, turn), l, true);
    const rim = ringAt(HEX_R, sides, y, turn);
    for (let i = 0; i < sides / 2; i++) d += line([rim[i], rim[i + sides / 2]], l);
    return d;
  }
  for (let x = -PLANE_X + 40.67; x < PLANE_X; x += 40.67) {
    d += line([{ x, y, z: -PLANE_Z }, { x, y, z: PLANE_Z }], l);
  }
  for (let z = -PLANE_Z + 31; z < PLANE_Z; z += 31) {
    d += line([{ x: -PLANE_X, y, z }, { x: PLANE_X, y, z }], l);
  }
  return d;
}

/**
 * A node's wireframe in its own coordinates: base on the plane at y = 0, and
 * facing the viewer along -z, because further away is +z. Lines are strokes,
 * faces are filled so wires pass behind them, and height is where the label sits.
 */
interface Model {
  lines: Vec[][];
  faces: Vec[][];
  height: number;
}

const v = (x: number, y: number, z: number): Vec => ({ x, y, z });

/** A closed loop of `count` points around y, in the plane the axes name. */
function loop(
  radius: number,
  count: number,
  point: (c: number, s: number) => Vec,
  turn = 0,
): Vec[] {
  const out: Vec[] = [];
  for (let i = 0; i <= count; i++) {
    const t = turn + (i / count) * Math.PI * 2;
    out.push(point(Math.cos(t) * radius, Math.sin(t) * radius));
  }
  return out;
}

const flat = (radius: number, count: number, y: number, turn = 0) =>
  loop(radius, count, (c, s) => v(c, y, s), turn);

/** A rectangular prism's twelve edges as three strokes' worth of lines. */
function prism(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Vec[][] {
  const ring = (y: number) => [v(x0, y, z0), v(x1, y, z0), v(x1, y, z1), v(x0, y, z1), v(x0, y, z0)];
  return [
    ring(y0),
    ring(y1),
    [v(x0, y0, z0), v(x0, y1, z0)],
    [v(x1, y0, z0), v(x1, y1, z0)],
    [v(x1, y0, z1), v(x1, y1, z1)],
    [v(x0, y0, z1), v(x0, y1, z1)],
  ];
}

/** A chat bubble lying on the plane, with its tail toward the viewer. */
function bubbleModel(s: number): Model {
  const h = s * 0.55;
  const w = s;
  const d = s * 0.72;
  const c = s * 0.28;
  const outline = (y: number): Vec[] => [
    v(-w + c, y, -d),
    v(-s * 0.38, y, -d),
    v(-s * 0.62, y, -d - s * 0.55),
    v(-s * 0.06, y, -d),
    v(w - c, y, -d),
    v(w, y, -d + c),
    v(w, y, d - c),
    v(w - c, y, d),
    v(-w + c, y, d),
    v(-w, y, d - c),
    v(-w, y, -d + c),
    v(-w + c, y, -d),
  ];
  const top = outline(h);
  const lines = [outline(0), top];
  for (const i of [0, 4, 5, 6, 7, 8, 9, 10]) lines.push([v(top[i].x, 0, top[i].z), top[i]]);
  // Three dots of someone typing.
  for (const x of [-0.42, 0, 0.42]) {
    lines.push(flat(s * 0.08, 4, h).map((p) => v(p.x + x * s, p.y, p.z)));
  }
  return { lines, faces: [top], height: h };
}

/** A phone standing up, its keypad on the face toward the viewer. */
function phoneModel(s: number): Model {
  const w = s * 0.62;
  const h = s * 1.5;
  const d = s * 0.14;
  const front = -d;
  const m = w * 0.18;
  const lines = prism(-w, w, 0, h, -d, d);
  lines.push([v(-w + m, h * 0.55, front), v(w - m, h * 0.55, front), v(w - m, h * 0.88, front), v(-w + m, h * 0.88, front), v(-w + m, h * 0.55, front)]);
  for (const t of [0.12, 0.25, 0.38]) lines.push([v(-w + m, h * t, front), v(w - m, h * t, front)]);
  for (const t of [-0.33, 0.33]) lines.push([v(t * w, h * 0.12, front), v(t * w, h * 0.38, front)]);
  return {
    lines,
    faces: [[v(-w, 0, front), v(w, 0, front), v(w, h, front), v(-w, h, front)]],
    height: h,
  };
}

/** An open arch, which every entry walks through. */
function gateModel(s: number): Model {
  const post = s * 0.95;
  const d = s * 0.28;
  const arch = (w: number, z: number): Vec[] => {
    const pts = [v(-w, 0, z)];
    for (let i = 0; i <= 12; i++) {
      const t = Math.PI - (i / 12) * Math.PI;
      pts.push(v(Math.cos(t) * w, post + Math.sin(t) * w, z));
    }
    pts.push(v(w, 0, z));
    return pts;
  };
  const outer = arch(s, -d);
  const back = arch(s, d);
  const lines = [outer, back, arch(s * 0.62, -d)];
  for (const i of [0, 1, 7, 13, 14]) lines.push([outer[i], back[i]]);
  lines.push([v(-s, 0, -d), v(-s * 0.62, 0, -d)], [v(s * 0.62, 0, -d), v(s, 0, -d)]);
  return { lines, faces: [], height: post + s };
}

/** A low hexagon with a lightning bolt on top: fast, and nothing but code. */
function boltModel(s: number): Model {
  const h = s * 0.5;
  const top = flat(s, 6, h, Math.PI / 6);
  const lines = [flat(s, 6, 0, Math.PI / 6), top];
  for (let i = 0; i < 6; i++) lines.push([v(top[i].x, 0, top[i].z), top[i]]);
  const bolt: [number, number][] = [
    [0.18, 0.72],
    [-0.36, -0.06],
    [-0.02, -0.06],
    [-0.18, -0.72],
    [0.36, 0.1],
    [0.02, 0.1],
    [0.18, 0.72],
  ];
  lines.push(bolt.map(([x, z]) => v(x * s, h, z * s)));
  return { lines, faces: [top], height: h };
}

/** A floating sphere with sound rippling out on the plane beneath it. */
function orbModel(s: number): Model {
  const r = s * 0.8;
  const c = r + 3;
  const lines = [
    flat(r, 24, c),
    loop(r, 24, (a, b) => v(a, c + b, 0)),
    loop(r, 24, (a, b) => v(0, c + b, a)),
    flat(r * 0.72, 24, c + r * 0.69),
    flat(r * 0.72, 24, c - r * 0.69),
    flat(s * 0.95, 24, 0),
    flat(s * 1.35, 24, 0),
  ];
  return { lines, faces: [], height: c + r };
}

/** A cut gem standing on its point. */
function gemModel(s: number): Model {
  const r = s * 0.9;
  const g = s * 0.85;
  const t = g + s * 0.42;
  const girdle = flat(r, 6, g);
  const table = flat(r * 0.55, 6, t);
  const lines = [girdle, table];
  for (let i = 0; i < 6; i++) {
    lines.push([v(0, 0, 0), girdle[i]], [girdle[i], table[i]]);
  }
  return { lines, faces: [table], height: t };
}

/** A camera with its lens toward the viewer. */
function cameraModel(s: number): Model {
  const w = s;
  const d = s * 0.6;
  const h = s * 0.95;
  const front = -d;
  const lensAt = (r: number, z: number) => loop(r, 20, (a, b) => v(a, h * 0.5 + b, z));
  const lines = prism(-w, w, 0, h, -d, d);
  lines.push(lensAt(h * 0.36, front), lensAt(h * 0.22, front));
  lines.push(...prism(-w * 0.62, -w * 0.18, h, h * 1.22, -d * 0.5, d * 0.5));
  return {
    lines,
    faces: [[v(-w, h, -d), v(w, h, -d), v(w, h, d), v(-w, h, d)]],
    height: h * 1.22,
  };
}

/** A small pyramid standing by: a backup, not a main service. */
function spikeModel(s: number): Model {
  const h = s * 1.4;
  const base = flat(s, 4, 0, Math.PI / 4);
  const lines = [base];
  for (let i = 0; i < 4; i++) lines.push([base[i], v(0, h, 0)]);
  return { lines, faces: [], height: h };
}

/** The drawn sign for a database: a stack of discs. */
function drumModel(s: number): Model {
  const h = s * 0.95;
  const top = flat(s, 28, h);
  const lines = [flat(s, 28, 0), flat(s, 28, h / 2), top];
  for (const [x, z] of [[-s, 0], [s, 0], [0, -s], [0, s]]) {
    lines.push([v(x, 0, z), v(x, h, z)]);
  }
  return { lines, faces: [top], height: h };
}

/** A terminal with a prompt on its face. */
function terminalModel(s: number): Model {
  const w = s;
  const h = s * 0.9;
  const d = s * 0.42;
  const f = -d;
  const lines = prism(-w, w, 0, h, -d, d);
  lines.push(
    [v(-w * 0.62, h * 0.7, f), v(-w * 0.28, h * 0.48, f), v(-w * 0.62, h * 0.26, f)],
    [v(-w * 0.14, h * 0.24, f), v(w * 0.38, h * 0.24, f)],
  );
  return { lines, faces: [[v(-w, 0, f), v(w, 0, f), v(w, h, f), v(-w, h, f)]], height: h };
}

/** A pile of plates: many entries, one source. */
function stackModel(s: number): Model {
  const t = s * 0.16;
  const gap = s * 0.3;
  const lines: Vec[][] = [];
  let top: Vec[] = [];
  for (let i = 0; i < 3; i++) {
    const y = i * gap;
    const o = (i - 1) * s * 0.1;
    lines.push(...prism(-s + o, s + o, y, y + t, -s * 0.72, s * 0.72));
    top = [v(-s + o, y + t, -s * 0.72), v(s + o, y + t, -s * 0.72), v(s + o, y + t, s * 0.72), v(-s + o, y + t, s * 0.72)];
  }
  return { lines, faces: [top], height: 2 * gap + t };
}

/** A shield standing guard, with a check on its face. */
function shieldModel(s: number): Model {
  const w = s * 0.82;
  const h = s * 1.7;
  const d = s * 0.14;
  const outline = (z: number) => [
    v(-w, h, z),
    v(w, h, z),
    v(w, h * 0.46, z),
    v(0, 0, z),
    v(-w, h * 0.46, z),
    v(-w, h, z),
  ];
  const front = outline(-d);
  const back = outline(d);
  const lines = [front, back];
  for (let i = 0; i < 5; i++) lines.push([front[i], back[i]]);
  lines.push([v(-w * 0.42, h * 0.62, -d), v(-w * 0.08, h * 0.38, -d), v(w * 0.48, h * 0.82, -d)]);
  return { lines, faces: [front.slice(0, 5)], height: h };
}

/** A gear lying flat: the part that does the work. */
function gearModel(s: number): Model {
  const h = s * 0.42;
  const teeth = 8;
  const outline = (y: number) => {
    const pts: Vec[] = [];
    for (let i = 0; i < teeth; i++) {
      const t = (i / teeth) * Math.PI * 2;
      const u = (Math.PI * 2) / teeth;
      for (const [r, a] of [[s * 0.76, -0.5], [s, -0.28], [s, 0.08], [s * 0.76, 0.28]] as const) {
        pts.push(v(Math.cos(t + a * u) * r, y, Math.sin(t + a * u) * r));
      }
    }
    pts.push(pts[0]);
    return pts;
  };
  const top = outline(h);
  const lines = [outline(0), top, flat(s * 0.3, 16, h)];
  for (let i = 0; i < top.length - 1; i += 2) lines.push([v(top[i].x, 0, top[i].z), top[i]]);
  return { lines, faces: [top], height: h };
}

/** A curved arrow standing up: everything here can be put back. */
function undoModel(s: number): Model {
  const r = s * 0.78;
  const c = r + 4;
  const arc = (z: number) => {
    const pts: Vec[] = [];
    for (let i = 0; i <= 18; i++) {
      const t = -Math.PI * 0.25 + (i / 18) * Math.PI * 1.5;
      pts.push(v(Math.cos(t) * r, c + Math.sin(t) * r, z));
    }
    return pts;
  };
  const front = arc(-s * 0.1);
  const end = front[front.length - 1];
  const lines = [front, arc(s * 0.1)];
  lines.push(
    [v(end.x - r * 0.42, end.y + r * 0.1, end.z), end, v(end.x + r * 0.08, end.y + r * 0.44, end.z)],
    [v(0, 0, 0), v(0, 3, 0)],
  );
  return { lines, faces: [], height: c + r };
}

/** A monitor on a stand. */
function screenModel(s: number): Model {
  const w = s;
  const b = s * 0.34;
  const h = b + s * 1.1;
  const d = s * 0.1;
  const f = -d;
  const lines = prism(-w, w, b, h, -d, d);
  lines.push(
    [v(0, b, 0), v(0, 0, 0)],
    [v(-w * 0.45, 0, 0), v(w * 0.45, 0, 0)],
    [v(-w * 0.72, b + s * 0.82, f), v(w * 0.1, b + s * 0.82, f)],
    [v(-w * 0.72, b + s * 0.56, f), v(w * 0.62, b + s * 0.56, f)],
    [v(-w * 0.72, b + s * 0.3, f), v(w * 0.36, b + s * 0.3, f)],
  );
  return { lines, faces: [[v(-w, b, f), v(w, b, f), v(w, h, f), v(-w, h, f)]], height: h };
}

/** A comic page standing up, ruled into panels. */
function pageModel(s: number): Model {
  const w = s * 0.74;
  const h = s * 2;
  const d = s * 0.06;
  const f = -d;
  const lines = prism(-w, w, 0, h, -d, d);
  lines.push(
    [v(-w, h * 0.64, f), v(w, h * 0.7, f)],
    [v(-w, h * 0.3, f), v(w, h * 0.3, f)],
    [v(-w * 0.1, h * 0.67, f), v(w * 0.1, h, f)],
    [v(w * 0.2, h * 0.3, f), v(-w * 0.05, 0, f)],
  );
  return { lines, faces: [[v(-w, 0, f), v(w, 0, f), v(w, h, f), v(-w, h, f)]], height: h };
}

/** Character sheets fanned out, each with a head on it. */
function sheetsModel(s: number): Model {
  const w = s * 0.56;
  const h = s * 1.6;
  const lines: Vec[][] = [];
  let front: Vec[] = [];
  for (const [ox, oz] of [[s * 0.5, s * 0.34], [0, s * 0.14], [-s * 0.5, -s * 0.08]] as const) {
    const card = [v(ox - w, 0, oz), v(ox + w, 0, oz), v(ox + w, h, oz), v(ox - w, h, oz), v(ox - w, 0, oz)];
    lines.push(card);
    lines.push(loop(w * 0.42, 12, (a, b) => v(ox + a, h * 0.66 + b, oz)));
    lines.push([v(ox - w * 0.55, h * 0.16, oz), v(ox - w * 0.35, h * 0.38, oz), v(ox + w * 0.35, h * 0.38, oz), v(ox + w * 0.55, h * 0.16, oz)]);
    front = card.slice(0, 4);
  }
  return { lines, faces: [front], height: h };
}

/** A pen standing on its point. */
function brushModel(s: number): Model {
  const r = s * 0.28;
  const tip = s * 0.62;
  const h = s * 2;
  const low = flat(r, 6, tip);
  const high = flat(r, 6, h);
  const lines = [low, high];
  for (let i = 0; i < 6; i++) lines.push([v(0, 0, 0), low[i]], [low[i], high[i]]);
  return { lines, faces: [high], height: h };
}

/** A desktop window: title bar, close box and a few fields. */
function windowModel(s: number): Model {
  const w = s;
  const h = s * 1.45;
  const d = s * 0.08;
  const f = -d;
  const bar = h * 0.82;
  const lines = prism(-w, w, 0, h, -d, d);
  lines.push(
    [v(-w, bar, f), v(w, bar, f)],
    [v(w * 0.72, h * 0.95, f), v(w * 0.86, h * 0.86, f)],
    [v(w * 0.86, h * 0.95, f), v(w * 0.72, h * 0.86, f)],
    [v(-w * 0.76, h * 0.6, f), v(w * 0.76, h * 0.6, f)],
    [v(-w * 0.76, h * 0.4, f), v(w * 0.76, h * 0.4, f)],
    [v(w * 0.2, h * 0.14, f), v(w * 0.76, h * 0.14, f), v(w * 0.76, h * 0.26, f), v(w * 0.2, h * 0.26, f), v(w * 0.2, h * 0.14, f)],
  );
  return { lines, faces: [[v(-w, 0, f), v(w, 0, f), v(w, h, f), v(-w, h, f)]], height: h };
}

/** A plain block with the lines of a class on its lid. */
function cubeModel(s: number): Model {
  const h = s * 1.1;
  const lines = prism(-s, s, 0, h, -s, s);
  lines.push(
    [v(-s, h, -s * 0.34), v(s, h, -s * 0.34)],
    [v(-s, h, s * 0.34), v(s, h, s * 0.34)],
  );
  return { lines, faces: [[v(-s, h, -s), v(s, h, -s), v(s, h, s), v(-s, h, s)]], height: h };
}

/** A funnel: everything narrows down to one way through. */
function funnelModel(s: number): Model {
  const h = s * 1.2;
  const top = flat(s, 24, h);
  const neck = flat(s * 0.3, 24, h * 0.28);
  const foot = flat(s * 0.3, 24, 0);
  const lines = [top, neck, foot];
  for (let i = 0; i < 24; i += 6) lines.push([top[i], neck[i]], [neck[i], foot[i]]);
  return { lines, faces: [top], height: h };
}

/** A plain hexagonal block. */
function hexModel(s: number): Model {
  const h = s * 0.7;
  const top = flat(s, 6, h, Math.PI / 6);
  const lines = [flat(s, 6, 0, Math.PI / 6), top, flat(s * 0.42, 6, h, Math.PI / 6)];
  for (let i = 0; i < 6; i++) lines.push([v(top[i].x, 0, top[i].z), top[i]]);
  return { lines, faces: [top], height: h };
}

const MODELS: Record<HoloShape, (size: number) => Model> = {
  bubble: bubbleModel,
  phone: phoneModel,
  gate: gateModel,
  bolt: boltModel,
  orb: orbModel,
  gem: gemModel,
  camera: cameraModel,
  spike: spikeModel,
  drum: drumModel,
  terminal: terminalModel,
  stack: stackModel,
  shield: shieldModel,
  gear: gearModel,
  undo: undoModel,
  screen: screenModel,
  page: pageModel,
  sheets: sheetsModel,
  brush: brushModel,
  window: windowModel,
  cube: cubeModel,
  funnel: funnelModel,
  hex: hexModel,
};

function drawModel(model: Model, node: HoloNode, y: number, l: Lens) {
  const place = (p: Vec) => v(node.x + p.x, y + p.y, node.z + p.z);
  let edges = "";
  for (const stroke of model.lines) edges += line(stroke.map(place), l);
  let faces = "";
  for (const face of model.faces) faces += line(face.map(place), l, true);
  return { edges, faces };
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

/** Node id to its node, layer and model. Built once per system: a frame asks often. */
const lookups = new WeakMap<
  HoloSystem,
  Map<string, { node: HoloNode; layer: HoloLayer; model: Model }>
>();
const layerOrders = new WeakMap<HoloSystem, HoloLayer[]>();

function lookup(system: HoloSystem, id: string) {
  let index = lookups.get(system);
  if (!index) {
    index = new Map();
    for (const node of system.nodes) {
      const layer = system.layers.find((n) => n.id === node.layer);
      if (!layer) throw new Error(`Unknown hologram layer: ${node.layer}`);
      index.set(node.id, { node, layer, model: MODELS[node.shape](node.size) });
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
    if (step.optional && offline.has(step.to)) continue;
    const fallback = step.fallback;
    if (!fallback || !offline.has(step.to)) {
      const swap = step.ifOffline && offline.has(step.ifOffline.node) ? step.ifOffline : null;
      steps.push(
        swap
          ? { ...step, caption: swap.caption, tag: swap.tag ?? step.tag, log: swap.log ?? step.log }
          : step,
      );
      continue;
    }
    steps.push({ ...step, caption: fallback.downCaption, tag: "OFFLINE" });
    if (!offline.has(fallback.backup)) {
      steps.push({
        to: fallback.backup,
        title: "Backup",
        caption: fallback.rescuedCaption,
        tag: "TOOK OVER",
      });
      continue;
    }
    steps.push({
      to: fallback.backup,
      title: "Backup",
      caption: fallback.lostCaption,
      tag: "OFFLINE",
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
  const plate = system.plate ?? "rect";
  const order = layersBottomUp(system);
  const point = marks.selected ?? marks.hover;
  const linked = linkedTo(system, point);

  const layers: HoloLayerFrame[] = order.map((layer) => {
    const y = heightOf(system, layer, view);
    return {
      plane: line(plateOutline(plate, y), l, true),
      grid: grid(plate, y, l),
      roofs: "",
      idle: "",
    };
  });

  let wires = "";
  let lit = "";
  if (system.spine && order.length > 0) {
    const low = heightOf(system, order[0], view);
    const high = heightOf(system, order[order.length - 1], view);
    wires += line([{ x: 0, y: low, z: 0 }, { x: 0, y: high, z: 0 }], l);
  }
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
    const { layer, model } = lookup(system, node.id);
    const slot = layers[order.indexOf(layer)];
    const { edges, faces } = drawModel(model, node, heightOf(system, layer, view), l);
    slot.roofs += faces;
    if (marks.offline.has(node.id)) offline += edges;
    else if (node.id === route.active || node.id === point) active += edges;
    else if (linked.has(node.id)) linkedBoxes += edges;
    else if (route.visited.has(node.id)) visited += edges;
    else slot.idle += edges;
  }

  const bottom = order[0] ? heightOf(system, order[0], view) : 0;
  const ringY = bottom - RING_GAP;
  const pillars = plateCorners(plate, bottom)
    .map((corner) => line([corner, { ...corner, y: ringY }], l))
    .join("");

  const nodeLabels = system.nodes.map((node) => {
    const p = nodePosition(system, node.id, view);
    return toCqw(project({ ...p, y: p.y + lookup(system, node.id).model.height }, l));
  });

  // Layer names keep a fixed column and only follow their plane's height, so
  // no rotation can land one on a node.
  const layerLabels = system.layers.map((layer) => {
    const [, y] = project({ x: 0, y: heightOf(system, layer, view), z: 0 }, l);
    return toCqw([LAYER_LABEL_X, y]);
  });

  return {
    layers,
    scan: line(plateOutline(plate, scanY), l, true),
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
