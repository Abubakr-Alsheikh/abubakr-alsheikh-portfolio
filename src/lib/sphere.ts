/**
 * Orthographic sphere geometry for the background planets.
 *
 * The planets used to be hand-drawn ellipses and quadratic curves, which read
 * as a sphere only from the corner of your eye: the "latitude" arcs did not
 * foreshorten toward the limb, meridians did not converge at the poles, and
 * rings drew straight over the disc instead of passing behind it.
 *
 * Everything here is the real projection instead. Points live on a unit sphere,
 * get rotated into view, and are dropped onto the screen plane by discarding z.
 * A point is on the far side when z < 0, and a ring point is hidden when it is
 * both behind the sphere and inside its silhouette — which is what makes a ring
 * disappear behind the planet and reappear on the other side.
 *
 * Pure functions, no React, no DOM. Deterministic, so server and client render
 * byte-identical paths.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

const TAU = Math.PI * 2;

export const deg = (d: number) => (d * Math.PI) / 180;

const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

const scale = (a: Vec3, s: number): Vec3 => ({
  x: a.x * s,
  y: a.y * s,
  z: a.z * s,
});

const add = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

const length = (a: Vec3) => Math.hypot(a.x, a.y, a.z);

const normalize = (a: Vec3): Vec3 => {
  const l = length(a);
  return l === 0 ? { x: 0, y: 0, z: 0 } : scale(a, 1 / l);
};

/**
 * A direction built from two screen-relative angles.
 *
 * `tilt` leans the axis within the screen plane (clockwise from straight up);
 * `lean` tips it toward the viewer, which is what gives a planet a visible
 * pole instead of an edge-on grid.
 */
export function axisFrom(tiltDeg: number, leanDeg: number): Vec3 {
  const t = deg(tiltDeg);
  const l = deg(leanDeg);

  // Start at +Y (screen up), tip toward the viewer, then lean in-plane.
  const tipped: Vec3 = { x: 0, y: Math.cos(l), z: Math.sin(l) };
  return {
    x: -tipped.y * Math.sin(t),
    y: tipped.y * Math.cos(t),
    z: tipped.z,
  };
}

/** Any unit vector perpendicular to `n`. */
function perpendicular(n: Vec3): Vec3 {
  // Cross with whichever axis n is least aligned to, so the result is stable.
  const helper: Vec3 =
    Math.abs(n.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
  return normalize(cross(n, helper));
}

export interface CircleSpec {
  /** Unit normal of the circle's plane. */
  normal: Vec3;
  /**
   * Angular radius from `normal`. `PI / 2` is a great circle (equator,
   * meridian, terminator); smaller values ride nearer the pole.
   */
  alpha?: number;
  /** Distance from the centre. 1 sits on the surface; > 1 is a ring. */
  distance?: number;
  samples?: number;
  /** Rotates the start point around the circle. */
  phase?: number;
}

/** Points of a circle on (or around) the unit sphere. */
export function circlePoints({
  normal,
  alpha = Math.PI / 2,
  distance = 1,
  samples = 180,
  phase = 0,
}: CircleSpec): Vec3[] {
  const n = normalize(normal);
  const u = perpendicular(n);
  const v = cross(n, u);

  const axial = scale(n, Math.cos(alpha) * distance);
  const radial = Math.sin(alpha) * distance;

  const points: Vec3[] = [];
  for (let i = 0; i < samples; i++) {
    const t = phase + (i / samples) * TAU;
    points.push(
      add(axial, add(scale(u, Math.cos(t) * radial), scale(v, Math.sin(t) * radial))),
    );
  }
  return points;
}

/**
 * How a point is classified once projected.
 *
 * `depth` splits on which hemisphere the point is in, and suits the wireframe:
 * the far half of a meridian is still drawn, just dimmer.
 *
 * `occlusion` splits on whether the sphere is actually in the way, and suits
 * rings and moons: a ring behind the planet but wide of its silhouette is in
 * plain view and must stay bright.
 */
export type SplitMode = "depth" | "occlusion";

export interface SplitPaths {
  /** Visible / near-side runs. */
  front: string;
  /** Hidden / far-side runs. */
  back: string;
  /** The whole closed curve, for motion paths. */
  full: string;
  /**
   * Arc-length fractions bounding the hidden stretch, or null when the curve
   * is never occluded. Used to blink an orbiting moon out behind the planet.
   */
  hiddenRange: [number, number] | null;
}

const fmt = (n: number) => (Math.abs(n) < 1e-4 ? "0" : n.toFixed(2));

/**
 * Projects a closed curve and splits it into visible and hidden runs.
 *
 * Screen y is negated because SVG's y axis points down while the sphere's
 * points up.
 */
export function projectCircle(
  points: Vec3[],
  radius: number,
  mode: SplitMode = "depth",
  outline: Silhouette = SPHERE_OUTLINE,
): SplitPaths {
  const screen = points.map((p) => ({
    x: p.x * radius,
    y: -p.y * radius,
    hidden:
      mode === "depth" ? p.z < 0 : p.z < 0 && insideOutline(p.x, -p.y, outline),
  }));

  const n = screen.length;
  if (n === 0) return { front: "", back: "", full: "", hiddenRange: null };

  // Cumulative arc length, so the hidden stretch can be expressed the way
  // animateMotion measures progress: by distance, not by sample index.
  const lengths: number[] = [0];
  for (let i = 1; i <= n; i++) {
    const a = screen[i - 1];
    const b = screen[i % n];
    lengths.push(lengths[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const perimeter = lengths[n];

  const runs: { hidden: boolean; from: number; to: number }[] = [];
  for (let i = 0; i < n; i++) {
    const hidden = screen[i].hidden;
    const last = runs[runs.length - 1];
    if (last && last.hidden === hidden) last.to = i;
    else runs.push({ hidden, from: i, to: i });
  }

  // The curve is closed, so a run that starts at the first sample and one that
  // ends at the last are the same run.
  if (
    runs.length > 1 &&
    runs[0].hidden === runs[runs.length - 1].hidden &&
    runs[0].from === 0 &&
    runs[runs.length - 1].to === n - 1
  ) {
    const tail = runs.pop();
    if (tail) runs[0] = { ...runs[0], from: tail.from - n };
  }

  const draw = (run: { from: number; to: number }) => {
    const parts: string[] = [];
    for (let i = run.from; i <= run.to; i++) {
      const p = screen[((i % n) + n) % n];
      parts.push(`${i === run.from ? "M" : "L"} ${fmt(p.x)} ${fmt(p.y)}`);
    }
    return parts.join(" ");
  };

  const front = runs
    .filter((r) => !r.hidden)
    .map(draw)
    .join(" ");
  const back = runs
    .filter((r) => r.hidden)
    .map(draw)
    .join(" ");

  const full =
    screen
      .map((p, i) => `${i === 0 ? "M" : "L"} ${fmt(p.x)} ${fmt(p.y)}`)
      .join(" ") + " Z";

  const hiddenRun = runs.find((r) => r.hidden);
  const hiddenRange: [number, number] | null =
    hiddenRun && perimeter > 0
      ? [
          lengths[((hiddenRun.from % n) + n) % n] / perimeter,
          lengths[(((hiddenRun.to % n) + n) % n) + 1] / perimeter,
        ]
      : null;

  return { front, back, full, hiddenRange };
}

/**
 * Projected outline of the body: an ellipse in unit-radius screen space.
 * `ry` runs along the projected polar axis; `rotateDeg` is the SVG rotation
 * that puts it there.
 */
export interface Silhouette {
  rx: number;
  ry: number;
  rotateDeg: number;
}

const SPHERE_OUTLINE: Silhouette = { rx: 1, ry: 1, rotateDeg: 0 };

/**
 * Squashes a unit-sphere point toward the equatorial plane. `polar` is the
 * polar radius as a fraction of the equatorial one: 1 is a sphere, Saturn is
 * about 0.9.
 */
export function flatten(p: Vec3, axis: Vec3, polar: number): Vec3 {
  if (polar === 1) return p;
  const a = normalize(axis);
  const along = p.x * a.x + p.y * a.y + p.z * a.z;
  return add(p, scale(a, (polar - 1) * along));
}

/**
 * The projected outline of an oblate spheroid.
 *
 * Under orthographic projection it is always an ellipse: the full equatorial
 * radius across the axis, and along the axis something between the polar
 * radius (axis in the screen plane) and the equatorial one (axis pointing at
 * the viewer).
 */
export function silhouette(axis: Vec3, polar = 1): Silhouette {
  const a = normalize(axis);
  const sinLean = Math.min(1, Math.abs(a.z));
  const cosLean = Math.sqrt(1 - sinLean * sinLean);
  const ry = Math.sqrt(polar * polar * cosLean * cosLean + sinLean * sinLean);

  // Screen direction of the projected axis (SVG y points down), then turned a
  // quarter so the ellipse's local y — its `ry` — lies along it.
  const axisDeg = (Math.atan2(-a.y, a.x) * 180) / Math.PI;
  return { rx: 1, ry, rotateDeg: axisDeg + 90 };
}

function insideOutline(x: number, y: number, o: Silhouette): boolean {
  const r = deg(o.rotateDeg);
  const c = Math.cos(r);
  const s = Math.sin(r);
  const u = x * c + y * s;
  const w = -x * s + y * c;
  return (u / o.rx) ** 2 + (w / o.ry) ** 2 < 1;
}

/**
 * The half of a ring annulus that passes in front of the body, as one closed
 * fill path.
 *
 * Filled in the backdrop colour and laid over the planet, it cuts the cage
 * where the ring crosses the disc — which is what makes a ring read as lying
 * in front of the planet rather than drawn on top of it.
 */
export function annulusNearHalf(
  normal: Vec3,
  inner: number,
  outer: number,
  radius: number,
  samples = 240,
): string {
  const outerPts = circlePoints({ normal, distance: outer, samples });
  const innerPts = circlePoints({ normal, distance: inner, samples });
  const n = outerPts.length;

  // The near half is one contiguous arc; find where it begins.
  let start = -1;
  for (let i = 0; i < n; i++) {
    const prev = outerPts[(i - 1 + n) % n];
    if (outerPts[i].z > 0 && prev.z <= 0) {
      start = i;
      break;
    }
  }
  if (start < 0) return "";

  const arc: number[] = [];
  for (let k = 0; k < n; k++) {
    const i = (start + k) % n;
    if (outerPts[i].z <= 0) break;
    arc.push(i);
  }
  if (arc.length < 2) return "";

  const pt = (p: Vec3) => `${fmt(p.x * radius)} ${fmt(-p.y * radius)}`;
  const out = arc.map((i, k) => `${k === 0 ? "M" : "L"} ${pt(outerPts[i])}`);
  const back = [...arc].reverse().map((i) => `L ${pt(innerPts[i])}`);
  return [...out, ...back, "Z"].join(" ");
}

export interface WireframeSpec {
  axis: Vec3;
  radius: number;
  meridians: number;
  parallels: number;
  samples?: number;
  /** Polar radius as a fraction of the equatorial one. */
  polar?: number;
}

/**
 * The lat/long cage.
 *
 * Meridians are great circles through the poles, so they converge there rather
 * than staying parallel; parallels are small circles about the axis, so they
 * foreshorten toward the limb. Both fall out of the projection for free.
 */
export function wireframe({
  axis,
  radius,
  meridians,
  parallels,
  samples = 160,
  polar = 1,
}: WireframeSpec): { front: string; back: string } {
  const a = normalize(axis);
  const u = perpendicular(a);
  const v = cross(a, u);
  const squash = (pts: Vec3[]) => pts.map((p) => flatten(p, a, polar));

  const front: string[] = [];
  const back: string[] = [];

  for (let i = 0; i < meridians; i++) {
    const lon = (i / meridians) * Math.PI;
    // Normal of a meridian plane is perpendicular to the polar axis.
    const normal = add(scale(u, Math.cos(lon)), scale(v, Math.sin(lon)));
    const paths = projectCircle(
      squash(circlePoints({ normal, samples })),
      radius,
    );
    if (paths.front) front.push(paths.front);
    if (paths.back) back.push(paths.back);
  }

  // Evenly spaced in latitude, poles excluded.
  for (let i = 1; i <= parallels; i++) {
    const alpha = (i / (parallels + 1)) * Math.PI;
    const paths = projectCircle(
      squash(circlePoints({ normal: a, alpha, samples })),
      radius,
    );
    if (paths.front) front.push(paths.front);
    if (paths.back) back.push(paths.back);
  }

  return { front: front.join(" "), back: back.join(" ") };
}

/**
 * Where the lit limb sits, as a screen-space offset in the range -1..1.
 *
 * Feeding this to a radial gradient's focus puts the highlight on the side the
 * light is actually coming from, which is what limb darkening amounts to at
 * this scale.
 */
export function lightOffset(sun: Vec3): { x: number; y: number } {
  const s = normalize(sun);
  return { x: s.x, y: -s.y };
}
