"use client";

import { useEffect, useRef } from "react";

export default function DeepSpaceEnvironment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    // 1. Lock canvas size strictly to the viewport (Huge performance save)
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Respect system motion preferences: static starfield fallback
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // SCROLL TELEMETRY: smoothed velocity drives warp streaks
    let lastScroll = window.scrollY;
    let velocity = 0;
    let idleDrift = 0;
    const WARP_GAIN = 3.2; // streak length per px/frame of velocity, per depth unit
    const WARP_MAX = 140; // hard cap so violent flicks don't smear the viewport
    const IDLE_SPEED = 0.35; // constant cruise speed (px/frame) when not scrolling

    // 2. Generate stars with a 'parallax' multiplier
    const stars = Array.from({ length: 600 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      alpha: Math.random(),
      // SLOWED DOWN: Twinkle speed is now gentle
      speed: Math.random() * 0.005 + 0.002,
      // NEW: Depth perception. Smaller stars move slower.
      parallax: Math.random() * 0.2 + 0.05,
    }));

    // 3. Generate slower meteors
    const meteors = Array.from({ length: 5 }).map(() => ({
      x: Math.random() * canvas.width + canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 150 + 100,
      // SLOWED DOWN: Meteors glide instead of flashing by
      speed: Math.random() * 4 + 6,
      thickness: Math.random() * 1 + 0.5,
      active: false,
      delay: Math.random() * 200,
      parallax: 0.4, // Meteors are "closer", so they move faster with scroll
    }));

    const render = () => {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grab the current scroll position for our math
      const currentScroll = window.scrollY;
      const rawDelta = currentScroll - lastScroll;
      lastScroll = currentScroll;
      // Lerp toward raw delta: mechanical response without jitter
      velocity += (rawDelta - velocity) * 0.12;
      if (!reduceMotion) idleDrift += IDLE_SPEED;

      // --- RENDER STARS ---
      stars.forEach((star) => {
        // Safer twinkle math to prevent flashing glitches
        star.alpha += star.speed;
        if (star.alpha >= 1) {
          star.alpha = 1;
          star.speed = -Math.abs(star.speed);
        } else if (star.alpha <= 0.1) {
          star.alpha = 0.1; // Prevent complete disappearance
          star.speed = Math.abs(star.speed);
        }

        // INFINITE WRAP MATH: scroll + idle cruise move the starfield,
        // teleport to bottom if it goes off screen
        let drawY =
          (star.y -
            currentScroll * star.parallax -
            idleDrift * star.parallax) %
          canvas.height;
        if (drawY < 0) drawY += canvas.height; // Handle negative modulo in JS

        // WARP STREAKS: stretch the dot into a motion line when velocity spikes.
        // Negative sign keeps streak direction aligned with apparent star travel.
        const streak = reduceMotion
          ? 0
          : Math.max(
              -WARP_MAX,
              Math.min(WARP_MAX, -velocity * star.parallax * WARP_GAIN),
            );

        if (Math.abs(streak) > 1.5) {
          ctx.beginPath();
          ctx.moveTo(star.x, drawY);
          ctx.lineTo(star.x, drawY + streak);
          ctx.strokeStyle = `rgba(255, 255, 255, ${star.alpha * 0.9})`;
          ctx.lineWidth = Math.max(star.radius, 0.5);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(star.x, drawY, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.fill();
        }
      });

      // --- RENDER METEORS ---
      meteors.forEach((meteor) => {
        if (!meteor.active) {
          meteor.delay--;
          if (meteor.delay <= 0) {
            meteor.active = true;
            meteor.x = Math.random() * canvas.width + canvas.width * 0.5;
            // Spawn relative to current scroll so it always enters the viewport
            meteor.y =
              Math.random() * canvas.height + currentScroll * meteor.parallax;
          }
          return;
        }

        meteor.x -= meteor.speed;
        meteor.y += meteor.speed * 0.5;

        // Apply scroll parallax to meteor
        const drawY = meteor.y - currentScroll * meteor.parallax;

        const gradient = ctx.createLinearGradient(
          meteor.x,
          drawY,
          meteor.x + meteor.length,
          drawY - meteor.length * 0.5,
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.1, "rgba(59, 130, 246, 0.8)");
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

        ctx.beginPath();
        ctx.moveTo(meteor.x, drawY);
        ctx.lineTo(meteor.x + meteor.length, drawY - meteor.length * 0.5);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = meteor.thickness;
        ctx.stroke();

        // Reset if it flies off-screen
        if (
          meteor.x < -meteor.length ||
          drawY > canvas.height + meteor.length
        ) {
          meteor.active = false;
          meteor.delay = Math.random() * 300 + 100;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none"
    />
  );
}
