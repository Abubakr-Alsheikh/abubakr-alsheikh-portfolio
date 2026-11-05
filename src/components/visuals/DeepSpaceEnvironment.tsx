"use client";

import { useEffect, useRef } from "react";
import { onFrame, requestFastFrames } from "@/lib/frameClock";

/**
 * The starfield behind the whole page.
 *
 * One canvas on the shared frame clock. Four things make it read as deep space
 * rather than as dots on a background:
 *
 *  - Depth. Every star has a depth that sets its size, brightness and parallax
 *    together, so the near field slides past faster than the far one and the
 *    eye reads the difference as distance.
 *  - A galactic band. A share of the stars is scattered along a diagonal with a
 *    gaussian falloff, which reads as the Milky Way without a single soft blob.
 *  - Real star colours. Mostly white, a fair number blue-white, a few warm.
 *  - Distant galaxies, the farthest things on the page: dot-built spirals and an
 *    elliptical, tilted in perspective, that barely move when the page does.
 *
 * Scrolling is parallax only. Stars used to stretch into streaks with speed, and
 * hundreds of lines flashing on and off at once was hard on the eyes.
 *
 * How it stays cheap:
 *  - Stars are drawn in batches of colour x brightness, one path each, never a
 *    call per star. Galaxies are drawn once into small sprites and copied.
 *    (Pre-drawing the stars into full-viewport layers and sliding those was
 *    tried: eight full-screen copies a frame cost far more than the dots.)
 *  - At rest the shared clock runs near 30Hz. Any scroll, or a meteor in flight,
 *    asks for its fast rate, which steps on an even beat of the display.
 *  - Backing stores are sized to devicePixelRatio (capped at 2), and alpha goes
 *    through `globalAlpha`, never an `rgba(...)` string per star.
 */

interface Star {
  x: number;
  y: number;
  /** 0 = far, 1 = near. Drives size, brightness and parallax together. */
  depth: number;
  radius: number;
  alpha: number;
  tint: number;
  /** Radians per 60Hz frame; 0 for a steady star. */
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Beacon {
  x: number;
  y: number;
  radius: number;
  spike: number;
  parallax: number;
  phase: number;
}

interface Meteor {
  /** Where the head is, in viewport pixels. */
  x: number;
  y: number;
  /** Unit direction of travel. */
  dx: number;
  dy: number;
  /** Pixels per millisecond. */
  speed: number;
  length: number;
  thickness: number;
  age: number;
  life: number;
  active: boolean;
  /** Milliseconds until it next appears. */
  wait: number;
}

interface Galaxy {
  sprite: HTMLCanvasElement;
  /** Centre, as a share of the viewport. */
  fx: number;
  fy: number;
  /** The sprite's size in CSS pixels. */
  size: number;
  parallax: number;
  alpha: number;
}

/** White, blue-white, warm. Index into this from `Star.tint`. */
const TINTS = ["#E2E8F0", "#BFDBFE", "#FED7AA"] as const;

/** One star per this many square CSS pixels. */
const DENSITY = 2400;
const MAX_STARS = 1100;

/** Share of stars placed in the galactic band rather than uniformly. */
const BAND_SHARE = 0.35;
/** Share of stars that twinkle. */
const TWINKLE_SHARE = 0.45;

/** Bright stars that get diffraction spikes. */
const BEACONS = 9;

/** Parallax range from the farthest star to the nearest. */
const PARALLAX_MIN = 0.04;
const PARALLAX_MAX = 0.3;
const IDLE_SPEED = 0.35; // cruise speed (px per 60Hz frame) when not scrolling

/** Stars are drawn in batches of tint x brightness, not one call each. */
const ALPHA_LEVELS = 4;
const ALPHA_STEP = 1 / ALPHA_LEVELS;
/** Below this radius a star is a square, which fills far faster than an arc. */
const DOT_RADIUS = 0.9;

/** Twinkle and drift were tuned per frame at 60Hz; time is measured in those frames. */
const FRAME_60HZ = 1000 / 60;

/** Meteors: rare, slow enough to follow, and carried by the scroll like far stars. */
const METEORS = 2;
const METEOR_WAIT_MS: [number, number] = [12000, 26000];
const METEOR_LIFE_MS: [number, number] = [1100, 1700];
const METEOR_SPEED: [number, number] = [0.35, 0.55];
const METEOR_PARALLAX = 0.12;

/** Galaxies sit behind everything and barely move: they are the farthest things here. */
const GALAXY_PARALLAX = 0.018;

const between = ([a, b]: [number, number]) => a + Math.random() * (b - a);

/** Standard normal sample (Box-Muller), for falloffs. */
function gaussian(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function pickTint(): number {
  const r = Math.random();
  return r < 0.68 ? 0 : r < 0.92 ? 1 : 2;
}

function buildStars(width: number, height: number): Star[] {
  const count = Math.min(MAX_STARS, Math.round((width * height) / DENSITY));

  // The band runs corner to corner at a shallow angle.
  const angle = -0.42;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const bandWidth = Math.min(width, height) * 0.16;

  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;

    if (Math.random() < BAND_SHARE) {
      // Along the band's axis uniformly, across it with a gaussian falloff.
      const along = (Math.random() - 0.5) * Math.hypot(width, height);
      const across = gaussian() * bandWidth;
      x = width / 2 + along * cos - across * sin;
      y = height / 2 + along * sin + across * cos;
      if (x < 0 || x > width || y < 0 || y > height) {
        x = Math.random() * width;
        y = Math.random() * height;
      }
    } else {
      x = Math.random() * width;
      y = Math.random() * height;
    }

    // Most stars are far away: skew depth toward 0.
    const depth = Math.pow(Math.random(), 2.2);
    const twinkles = Math.random() < TWINKLE_SHARE;

    stars.push({
      x,
      y,
      depth,
      radius: 0.35 + depth * 1.25,
      alpha: 0.25 + depth * 0.7,
      tint: pickTint(),
      twinkleSpeed: twinkles ? 0.008 + Math.random() * 0.025 : 0,
      twinklePhase: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

function buildBeacons(width: number, height: number): Beacon[] {
  return Array.from({ length: BEACONS }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 1.1 + Math.random() * 0.9,
    spike: 5 + Math.random() * 7,
    parallax: PARALLAX_MAX * (0.7 + Math.random() * 0.3),
    phase: Math.random() * Math.PI * 2,
  }));
}

function canvasOf(width: number, height: number, dpr: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(width * dpr));
  c.height = Math.max(1, Math.round(height * dpr));
  const g = c.getContext("2d");
  g?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { c, g };
}

type GalaxyKind = "spiral" | "edge" | "elliptical";

/**
 * One galaxy as a sprite of dots: two logarithmic arms and a bulge for a spiral,
 * a gaussian cloud for an elliptical, then tilted (flattened) and turned. Built
 * from points like the planets are built from geometry, so it stays sharp.
 */
function buildGalaxy(kind: GalaxyKind, radius: number, tilt: number, turn: number, dpr: number) {
  const size = Math.ceil(radius * 2.4);
  const { c, g } = canvasOf(size, size, dpr);
  if (!g) return c;
  const cx = size / 2;
  const cy = size / 2;
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  const dot = (x: number, y: number, r: number, alpha: number, tint: string) => {
    // Flatten for the tilt, then turn on the sky.
    const fy = y * tilt;
    g.globalAlpha = alpha;
    g.fillStyle = tint;
    g.fillRect(cx + x * cos - fy * sin - r, cy + x * sin + fy * cos - r, r * 2, r * 2);
  };

  if (kind === "elliptical") {
    for (let i = 0; i < 900; i++) {
      const x = gaussian() * radius * 0.38;
      const y = gaussian() * radius * 0.38;
      const d = Math.hypot(x, y) / radius;
      dot(x, y, 0.55 + Math.random() * 0.4, Math.max(0.08, 0.8 - d * 0.9), d < 0.3 ? TINTS[2] : TINTS[0]);
    }
    return c;
  }

  // Bulge: warm, dense, and round even when the disc is seen edge-on.
  for (let i = 0; i < 320; i++) {
    const x = gaussian() * radius * 0.1;
    const y = (gaussian() * radius * 0.1) / Math.max(tilt, 0.35);
    dot(x, y, 0.55 + Math.random() * 0.45, 0.55 + Math.random() * 0.4, TINTS[2]);
  }
  // Arms.
  const arms = 2;
  const winding = 0.32;
  for (let i = 0; i < 1800; i++) {
    const arm = i % arms;
    const t = Math.pow(Math.random(), 0.8);
    const theta = t * Math.PI * 3.2 + (arm * Math.PI * 2) / arms;
    const r = radius * 0.12 * Math.exp(winding * theta * 0.62);
    if (r > radius) continue;
    const spread = r * 0.16;
    const x = Math.cos(theta) * r + gaussian() * spread;
    const y = Math.sin(theta) * r + gaussian() * spread;
    const fade = 1 - r / radius;
    dot(x, y, 0.5 + Math.random() * 0.45, 0.16 + fade * 0.55, Math.random() < 0.7 ? TINTS[1] : TINTS[0]);
  }
  return c;
}

/** Four galaxies in the side margins, so on a desktop none sits behind text. */
function buildGalaxies(width: number, height: number, dpr: number): Galaxy[] {
  const scale = Math.min(1, Math.max(0.5, Math.min(width, height) / 900));
  const plan: { kind: GalaxyKind; r: number; tilt: number; turn: number; fx: number; fy: number; alpha: number }[] = [
    { kind: "spiral", r: 78, tilt: 0.55, turn: -0.5, fx: 0.07, fy: 0.3, alpha: 0.6 },
    { kind: "edge", r: 70, tilt: 0.1, turn: 0.35, fx: 0.955, fy: 0.62, alpha: 0.5 },
    { kind: "elliptical", r: 46, tilt: 0.65, turn: 0.9, fx: 0.965, fy: 0.2, alpha: 0.5 },
    { kind: "spiral", r: 30, tilt: 0.8, turn: 1.4, fx: 0.035, fy: 0.86, alpha: 0.45 },
  ];
  return plan.map((p) => {
    const radius = p.r * scale;
    return {
      sprite: buildGalaxy(p.kind, radius, p.tilt, p.turn, dpr),
      fx: p.fx,
      fy: p.fy,
      size: Math.ceil(radius * 2.4),
      parallax: GALAXY_PARALLAX * (0.7 + Math.random() * 0.6),
      alpha: p.alpha,
    };
  });
}

export default function DeepSpaceEnvironment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // CSS-pixel dimensions. All positions live in this space; the context
    // transform maps it onto the device-pixel backing store.
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let beacons: Beacon[] = [];
    let galaxies: Galaxy[] = [];

    const setup = () => {
      // Capped at 2: beyond that the extra pixels cost fill rate and the eye
      // cannot resolve a sub-pixel star any better.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The distribution depends on the viewport, so a resize reseeds it
      // rather than leaving the field bunched into the old rectangle.
      stars = buildStars(width, height);
      beacons = buildBeacons(width, height);
      galaxies = buildGalaxies(width, height, dpr);
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setup();
        // With no loop running, the reseeded field has to be drawn by hand.
        if (reduceMotion) render(FRAME_60HZ);
      }, 150);
    };

    setup();
    window.addEventListener("resize", onResize);

    const meteors: Meteor[] = Array.from({ length: METEORS }, (_, i) => ({
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      speed: 0,
      length: 0,
      thickness: 1,
      age: 0,
      life: 1,
      active: false,
      // Staggered, so the first one does not come the moment the page opens.
      wait: between(METEOR_WAIT_MS) * (0.4 + i * 0.6),
    }));

    const launch = (m: Meteor) => {
      // Down and to the left, at a slightly different angle each time.
      const angle = Math.PI * (0.82 + Math.random() * 0.08);
      m.dx = Math.cos(angle);
      m.dy = Math.sin(angle);
      m.x = width * (0.35 + Math.random() * 0.6);
      m.y = height * Math.random() * 0.45;
      m.speed = between(METEOR_SPEED);
      m.length = 90 + Math.random() * 90;
      m.thickness = 0.7 + Math.random() * 0.6;
      m.age = 0;
      m.life = between(METEOR_LIFE_MS);
      m.active = true;
    };

    // Reused every frame, so a scroll allocates nothing per star.
    const batches = Array.from({ length: TINTS.length * ALPHA_LEVELS }, () => ({
      dots: [] as number[],
      discs: [] as number[],
    }));

    let lastScroll = window.scrollY;
    let drift = 0;
    let stop: (() => void) | null = null;
    let tick = 0;

    // Wrap a scrolled y back into a span, handling JS's negative modulo.
    const wrapIn = (y: number, span: number) => {
      const m = y % span;
      return m < 0 ? m + span : m;
    };

    const render = (dtMs: number) => {
      // Elapsed time in 60Hz frames, so the field moves at one speed at any rate.
      const step = dtMs / FRAME_60HZ;
      tick += step;

      const scroll = window.scrollY;
      const scrolled = scroll - lastScroll;
      lastScroll = scroll;
      if (!reduceMotion) drift += IDLE_SPEED * step;
      const anyMeteor = meteors.some((m) => m.active);
      // Every display frame while anything moves fast, so it never judders.
      if (scrolled !== 0 || anyMeteor) requestFastFrames();

      const travel = scroll + drift;

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);

      // ---- Galaxies: farthest away, so drawn first and moved least ----
      for (const gx of galaxies) {
        const span = height + gx.size;
        const y = wrapIn(gx.fy * height - travel * gx.parallax + gx.size / 2, span) - gx.size;
        ctx.globalAlpha = gx.alpha;
        ctx.drawImage(gx.sprite, gx.fx * width - gx.size / 2, y, gx.size, gx.size);
      }

      // ---- Stars: parallax only, in batches ----
      for (const batch of batches) {
        batch.dots.length = 0;
        batch.discs.length = 0;
      }
      for (const star of stars) {
        const parallax = PARALLAX_MIN + star.depth * (PARALLAX_MAX - PARALLAX_MIN);
        const y = wrapIn(star.y - travel * parallax, height);
        const shimmer =
          star.twinkleSpeed && !reduceMotion
            ? 0.72 + 0.28 * Math.sin(tick * star.twinkleSpeed + star.twinklePhase)
            : 1;
        const level = Math.min(ALPHA_LEVELS - 1, Math.floor((star.alpha * shimmer) / ALPHA_STEP));
        const batch = batches[star.tint * ALPHA_LEVELS + level];
        if (star.radius < DOT_RADIUS) batch.dots.push(star.x, y, star.radius);
        else batch.discs.push(star.x, y, star.radius);
      }
      for (let i = 0; i < batches.length; i++) {
        const { dots, discs } = batches[i];
        if (dots.length + discs.length === 0) continue;
        ctx.fillStyle = TINTS[Math.floor(i / ALPHA_LEVELS)];
        ctx.globalAlpha = ((i % ALPHA_LEVELS) + 0.5) * ALPHA_STEP;
        ctx.beginPath();
        for (let d = 0; d < dots.length; d += 3) {
          const r = dots[d + 2];
          ctx.rect(dots[d] - r, dots[d + 1] - r, r * 2, r * 2);
        }
        for (let d = 0; d < discs.length; d += 3) {
          const r = discs[d + 2];
          ctx.moveTo(discs[d] + r, discs[d + 1]);
          ctx.arc(discs[d], discs[d + 1], r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // ---- Beacons: the few bright stars, with diffraction spikes ----
      ctx.fillStyle = "#F8FAFC";
      ctx.strokeStyle = "#BFDBFE";
      ctx.lineWidth = 0.6;
      ctx.lineCap = "butt";
      for (const b of beacons) {
        const y = wrapIn(b.y - travel * b.parallax, height);
        const pulse = reduceMotion ? 1 : 0.8 + 0.2 * Math.sin(tick * 0.02 + b.phase);
        ctx.globalAlpha = 0.45 * pulse;
        ctx.beginPath();
        ctx.moveTo(b.x - b.spike, y);
        ctx.lineTo(b.x + b.spike, y);
        ctx.moveTo(b.x, y - b.spike);
        ctx.lineTo(b.x, y + b.spike);
        ctx.stroke();
        ctx.globalAlpha = pulse;
        ctx.beginPath();
        ctx.arc(b.x, y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- Meteors ----
      if (!reduceMotion) {
        ctx.lineCap = "round";
        for (const m of meteors) {
          if (!m.active) {
            m.wait -= dtMs;
            if (m.wait <= 0) launch(m);
            continue;
          }
          m.age += dtMs;
          m.x += m.dx * m.speed * dtMs;
          // Carried by the scroll like a far star, so it never looks pinned to the glass.
          m.y += m.dy * m.speed * dtMs - scrolled * METEOR_PARALLAX;

          const t = m.age / m.life;
          if (t >= 1) {
            m.active = false;
            m.wait = between(METEOR_WAIT_MS);
            continue;
          }
          // Fades in and out, and the tail grows from the head instead of popping in.
          const fade = Math.sin(Math.PI * t);
          const tail = m.length * Math.min(1, t * 3);
          const tx = m.x - m.dx * tail;
          const ty = m.y - m.dy * tail;
          const gradient = ctx.createLinearGradient(m.x, m.y, tx, ty);
          gradient.addColorStop(0, "rgba(248, 250, 252, 1)");
          gradient.addColorStop(0.15, "rgba(147, 197, 253, 0.7)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
          ctx.globalAlpha = fade;
          ctx.strokeStyle = gradient;
          ctx.lineWidth = m.thickness;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }
      }
    };

    // Reduced motion gets one still frame and no loop at all.
    render(FRAME_60HZ);
    if (!reduceMotion) stop = onFrame((dt) => render(dt));

    return () => {
      stop?.();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none"
    />
  );
}
