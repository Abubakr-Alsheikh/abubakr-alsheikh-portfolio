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

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const stars = Array.from({ length: 600 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
    }));

    const meteors = Array.from({ length: 15 }).map(() => ({
      x: Math.random() * canvas.width + canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 150 + 100,
      speed: Math.random() * 10 + 15,
      thickness: Math.random() * 1 + 0.5,
      active: false,
      delay: Math.random() * 200,
    }));

    const render = () => {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) star.speed *= -1;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.alpha)})`;
        ctx.fill();
      });

      meteors.forEach((meteor) => {
        if (!meteor.active) {
          meteor.delay--;
          if (meteor.delay <= 0) {
            meteor.active = true;
            meteor.x = Math.random() * canvas.width + canvas.width * 0.5;
            meteor.y = Math.random() * canvas.height * 0.8;
          }
          return;
        }

        meteor.x -= meteor.speed;
        meteor.y += meteor.speed * 0.5;

        const gradient = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x + meteor.length, meteor.y - meteor.length * 0.5);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.1, "rgba(59, 130, 246, 0.8)");
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x + meteor.length, meteor.y - meteor.length * 0.5);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = meteor.thickness;
        ctx.stroke();

        if (meteor.x < -meteor.length || meteor.y > canvas.height + meteor.length) {
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
      className="absolute top-0 left-0 w-full z-0 pointer-events-none"
      style={{ height: "100%" }}
    />
  );
}
