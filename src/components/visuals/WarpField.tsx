"use client";

import { useEffect, useRef } from "react";

/**
 * Forward-flight starfield for the boot screen.
 *
 * Stars live in a box in front of the camera and fly toward it; each frame a
 * star is drawn as the segment between where it projected last frame and where
 * it projects now. At cruise speed that segment is a dot, at warp it is a long
 * streak radiating from the vanishing point — the same code, only the speed
 * changes, so the jump to warp is continuous rather than a swapped effect.
 *
 * Same performance rules as `DeepSpaceEnvironment`: DPR-sized backing store,
 * alpha via `globalAlpha`, and strokes batched. Stars are bucketed by tint and
 * brightness so a frame is a dozen `stroke()` calls, not one per star.
 */

interface WarpFieldProps {
  /** Ramps from cruise to full warp. The ramp is eased, never a jump. */
  engaged: boolean;
  /** 0..1 extra thrust before warp, for the ignition stage. */
  throttle?: number;
}

const TINTS = ["#E2E8F0", "#BFDBFE", "#3B82F6"] as const;
const BUCKETS = 4;

/** Depth of the star box, in the same units as screen px at focal length 1. */
const DEPTH = 1600;
const DENSITY = 2600;
const MAX_STARS = 750;

const CRUISE = 2.2;
const IGNITION = 9;
const WARP = 78;

export default function WarpField({ engaged, throttle = 0 }: WarpFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Read by the loop every frame; props only move the target.
  const target = useRef(CRUISE);
  useEffect(() => {
    target.current = engaged ? WARP : CRUISE + (IGNITION - CRUISE) * throttle;
  }, [engaged, throttle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let focal = 0;
    let count = 0;
    // Struct of arrays: x, y, z, and the tint each star keeps for life.
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let zs = new Float32Array(0);
    let tints = new Uint8Array(0);

    const spawn = (i: number, z: number) => {
      // Spread wider than the viewport so streaks enter from the edges too.
      xs[i] = (Math.random() - 0.5) * width * 2.4;
      ys[i] = (Math.random() - 0.5) * height * 2.4;
      zs[i] = z;
    };

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      focal = Math.max(width, height) * 0.5;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      count = Math.min(MAX_STARS, Math.round((width * height) / DENSITY));
      xs = new Float32Array(count);
      ys = new Float32Array(count);
      zs = new Float32Array(count);
      tints = new Uint8Array(count);
      for (let i = 0; i < count; i++) {
        spawn(i, 1 + Math.random() * DEPTH);
        const r = Math.random();
        tints[i] = r < 0.62 ? 0 : r < 0.9 ? 1 : 2;
      }
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setup();
        // With no loop running, the reseeded field has to be drawn by hand.
        if (reduceMotion) render();
      }, 150);
    };

    setup();
    window.addEventListener("resize", onResize);

    let speed = reduceMotion ? 0 : CRUISE;
    let frame = 0;

    // Previous projected position per star, filled during the move pass.
    let px = new Float32Array(0);
    let py = new Float32Array(0);
    let sx = new Float32Array(0);
    let sy = new Float32Array(0);
    let bucket = new Uint8Array(0);

    const render = () => {
      if (px.length !== count) {
        px = new Float32Array(count);
        py = new Float32Array(count);
        sx = new Float32Array(count);
        sy = new Float32Array(count);
        bucket = new Uint8Array(count);
      }

      if (!reduceMotion) speed += (target.current - speed) * 0.035;

      const cx = width / 2;
      const cy = height / 2;
      // A streak is at least this long in z, so cruise stars read as points
      // with a hint of motion rather than vanishing.
      const trail = Math.max(speed, 1.2) * (1 + speed * 0.06);

      // ---- Move + project ----
      for (let i = 0; i < count; i++) {
        let z = zs[i] - speed;
        if (z < 1) {
          spawn(i, DEPTH);
          z = DEPTH;
        }
        zs[i] = z;

        const k = focal / z;
        const kPrev = focal / Math.min(DEPTH, z + trail);
        sx[i] = cx + xs[i] * k;
        sy[i] = cy + ys[i] * k;
        px[i] = cx + xs[i] * kPrev;
        py[i] = cy + ys[i] * kPrev;

        // Brightness rises as the star closes in.
        const near = 1 - z / DEPTH;
        bucket[i] = Math.min(BUCKETS - 1, Math.floor(near * BUCKETS));
      }

      // ---- Draw, batched by tint and brightness ----
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);
      ctx.lineCap = "round";

      for (let t = 0; t < TINTS.length; t++) {
        ctx.strokeStyle = TINTS[t];
        for (let b = 0; b < BUCKETS; b++) {
          ctx.globalAlpha = 0.3 + (b / (BUCKETS - 1)) * 0.7;
          ctx.lineWidth = 0.6 + b * 0.45;
          ctx.beginPath();
          for (let i = 0; i < count; i++) {
            if (tints[i] !== t || bucket[i] !== b) continue;
            const x = sx[i];
            const y = sy[i];
            if (x < -40 || x > width + 40 || y < -40 || y > height + 40) continue;
            ctx.moveTo(px[i], py[i]);
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      if (!reduceMotion) frame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
