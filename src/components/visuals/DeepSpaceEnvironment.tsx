"use client";

import { useEffect, useRef } from "react";
import { onFrame, requestFastFrames } from "@/lib/frameClock";

/**
 * The starfield behind the whole page.
 *
 * One canvas, one rAF loop. Three things make it read as deep space rather than
 * as dots on a background:
 *
 *  - Depth. Every star has a depth in 0..1 that sets its size, brightness and
 *    parallax together, so the near field slides past faster than the far one
 *    and the eye reads the difference as distance.
 *  - A galactic band. A share of the stars is scattered along a diagonal with a
 *    gaussian falloff, which reads as the Milky Way without drawing a single
 *    soft blob.
 *  - Real star colours. Mostly white, a fair number blue-white, a few warm —
 *    the spread you actually see, rather than uniform grey.
 *
 * Performance rules, all load-bearing:
 *  - The backing store is sized to devicePixelRatio. Without it the canvas is
 *    drawn at CSS resolution and upscaled, and every star goes soft on a scaled
 *    display.
 *  - Alpha goes through `globalAlpha`, never an `rgba(...)` string per star:
 *    building hundreds of colour strings a frame is pure garbage-collector load.
 *  - Stars are sorted by colour once, so `fillStyle` changes three times a
 *    frame instead of once per star.
 *  - Faint stars are `fillRect`, which is far cheaper than `arc` + `fill`.
 */

interface Star {
  x: number;
  y: number;
  /** 0 = far, 1 = near. Drives size, brightness and parallax together. */
  depth: number;
  radius: number;
  alpha: number;
  tint: number;
  /** Radians per frame; 0 for a steady star. */
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
  x: number;
  y: number;
  length: number;
  speed: number;
  thickness: number;
  active: boolean;
  delay: number;
}

/** White, blue-white, warm. Index into this from `Star.tint`. */
const TINTS = ["#E2E8F0", "#BFDBFE", "#FED7AA"] as const;

/** One star per this many square CSS pixels. */
const DENSITY = 2400;
const MAX_STARS = 1100;

/** Share of stars placed in the galactic band rather than uniformly. */
const BAND_SHARE = 0.35;

/** Bright stars that get diffraction spikes. */
const BEACONS = 9;

/** Parallax range from the farthest star to the nearest. */
const PARALLAX_MIN = 0.04;
const PARALLAX_MAX = 0.3;

const WARP_GAIN = 3.2; // streak length per px/frame of velocity, per depth unit
const WARP_MAX = 140; // cap so violent flicks don't smear the viewport
const IDLE_SPEED = 0.35; // cruise speed (px per 60Hz frame) when not scrolling

/** Stars are drawn in batches of tint x brightness x size, not one call each. */
const ALPHA_LEVELS = 4;
const ALPHA_STEP = 1 / ALPHA_LEVELS;
/** Below this radius a star is a square, which fills far faster than an arc. */
const DOT_RADIUS = 0.9;

/** Everything here was tuned per frame at 60Hz; time is measured in those frames. */
const FRAME_60HZ = 1000 / 60;
/** How far the streaks lerp toward the scroll velocity in one 60Hz frame. */
const VELOCITY_LERP = 0.12;
/** Still moving this fast (px per 60Hz frame): stay on the clock's fast rate. */
const FAST_VELOCITY = 0.4;

/** Standard normal sample (Box-Muller), for the galactic band's falloff. */
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
    const twinkles = Math.random() < 0.45;

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

  // Grouped by colour so fillStyle is set once per group, not once per star.
  return stars.sort((a, b) => a.tint - b.tint);
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

    // CSS-pixel dimensions. All star positions live in this space; the context
    // transform maps it onto the device-pixel backing store.
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let beacons: Beacon[] = [];

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

    const meteors: Meteor[] = Array.from({ length: 4 }, () => ({
      x: 0,
      y: 0,
      length: Math.random() * 150 + 100,
      speed: Math.random() * 4 + 6,
      thickness: Math.random() * 1 + 0.5,
      active: false,
      delay: Math.random() * 300 + 60,
    }));

    // Reused every frame, so a scroll allocates nothing per star.
    const batches = Array.from({ length: TINTS.length * ALPHA_LEVELS }, () => ({
      // Flat runs of plain numbers: x, y, then radius or streak length.
      dots: [] as number[],
      discs: [] as number[],
      lines: [] as number[],
    }));

    let lastScroll = window.scrollY;
    let velocity = 0;
    let drift = 0;
    let stop: (() => void) | null = null;
    let tick = 0;

    // Wrap a scrolled y back into the viewport, handling JS's negative modulo.
    const wrap = (y: number) => {
      const m = y % height;
      return m < 0 ? m + height : m;
    };

    const render = (dtMs: number) => {
      // Elapsed time in 60Hz frames, so the field moves at one speed at any rate.
      const step = dtMs / FRAME_60HZ;
      tick += step;

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);

      const scroll = window.scrollY;
      const rawDelta = (scroll - lastScroll) / Math.max(step, 0.01);
      lastScroll = scroll;
      // Lerp toward the raw delta: mechanical response without jitter.
      velocity += (rawDelta - velocity) * (1 - Math.pow(1 - VELOCITY_LERP, step));
      if (!reduceMotion) drift += IDLE_SPEED * step;
      // Streaks need the frames while the page moves. At rest, 30Hz is plenty.
      const fast = Math.abs(velocity) > FAST_VELOCITY;
      if (fast) requestFastFrames();

      const travel = scroll + drift;

      // ---- Stars ----
      // One path per batch. A call per star was the page's single hottest
      // function while scrolling, when every star turns into a streak.
      ctx.lineCap = "round";
      for (const batch of batches) {
        batch.dots.length = 0;
        batch.discs.length = 0;
        batch.lines.length = 0;
      }

      for (const star of stars) {
        const parallax =
          PARALLAX_MIN + star.depth * (PARALLAX_MAX - PARALLAX_MIN);
        const y = wrap(star.y - travel * parallax);

        // Nobody can see a star twinkle while it is a streak.
        const shimmer =
          star.twinkleSpeed && !reduceMotion && !fast
            ? 0.72 + 0.28 * Math.sin(tick * star.twinkleSpeed + star.twinklePhase)
            : 1;
        const level = Math.min(ALPHA_LEVELS - 1, Math.floor((star.alpha * shimmer) / ALPHA_STEP));
        const batch = batches[star.tint * ALPHA_LEVELS + level];

        const streak = reduceMotion
          ? 0
          : Math.max(
              -WARP_MAX,
              Math.min(WARP_MAX, -velocity * parallax * WARP_GAIN),
            );

        if (Math.abs(streak) > 1.5) batch.lines.push(star.x, y, streak);
        else if (star.radius < DOT_RADIUS) batch.dots.push(star.x, y, star.radius);
        else batch.discs.push(star.x, y, star.radius);
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < batches.length; i++) {
        const { dots, discs, lines } = batches[i];
        if (dots.length + discs.length + lines.length === 0) continue;
        const tint = TINTS[Math.floor(i / ALPHA_LEVELS)];
        ctx.fillStyle = tint;
        ctx.strokeStyle = tint;
        ctx.globalAlpha = ((i % ALPHA_LEVELS) + 0.5) * ALPHA_STEP;

        if (dots.length || discs.length) {
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

        if (lines.length) {
          ctx.beginPath();
          for (let d = 0; d < lines.length; d += 3) {
            ctx.moveTo(lines[d], lines[d + 1]);
            ctx.lineTo(lines[d], lines[d + 1] + lines[d + 2]);
          }
          ctx.stroke();
        }
      }

      // ---- Beacons: the few bright stars, with diffraction spikes ----
      ctx.fillStyle = "#F8FAFC";
      ctx.strokeStyle = "#BFDBFE";
      ctx.lineWidth = 0.6;
      ctx.lineCap = "butt";

      for (const b of beacons) {
        const y = wrap(b.y - travel * b.parallax);
        const pulse = reduceMotion ? 1 : 0.8 + 0.2 * Math.sin(tick * 0.02 + b.phase);

        // Spikes collapse into the streak while warping, like the stars do.
        if (Math.abs(velocity) < 2) {
          ctx.globalAlpha = 0.45 * pulse;
          ctx.beginPath();
          ctx.moveTo(b.x - b.spike, y);
          ctx.lineTo(b.x + b.spike, y);
          ctx.moveTo(b.x, y - b.spike);
          ctx.lineTo(b.x, y + b.spike);
          ctx.stroke();
        }

        ctx.globalAlpha = pulse;
        ctx.beginPath();
        ctx.arc(b.x, y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- Meteors ----
      if (!reduceMotion) {
        ctx.globalAlpha = 1;
        ctx.lineCap = "round";

        for (const m of meteors) {
          if (!m.active) {
            m.delay -= step;
            if (m.delay <= 0) {
              m.active = true;
              m.x = Math.random() * width + width * 0.5;
              m.y = Math.random() * height * 0.6;
            }
            continue;
          }

          m.x -= m.speed * step;
          m.y += m.speed * 0.5 * step;

          const gradient = ctx.createLinearGradient(
            m.x,
            m.y,
            m.x + m.length,
            m.y - m.length * 0.5,
          );
          gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
          gradient.addColorStop(0.1, "rgba(59, 130, 246, 0.8)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x + m.length, m.y - m.length * 0.5);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = m.thickness;
          ctx.stroke();

          if (m.x < -m.length || m.y > height + m.length) {
            m.active = false;
            m.delay = Math.random() * 300 + 100;
          }
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
