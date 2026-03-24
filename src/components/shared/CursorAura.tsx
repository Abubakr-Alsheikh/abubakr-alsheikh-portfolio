"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const CursorAura = () => {
  const cursorSize = 250;

  const mouse = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  };

  const smoothOptions = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothMouse = {
    x: useSpring(mouse.x, smoothOptions),
    y: useSpring(mouse.y, smoothOptions),
  };

  const manageMouseMove = useCallback((e: MouseEvent) => {
    const { clientX, clientY } = e;
    mouse.x.set(clientX - cursorSize / 2);
    mouse.y.set(clientY - cursorSize / 2);
  }, [cursorSize, mouse.x, mouse.y]);

  useEffect(() => {
    window.addEventListener("mousemove", manageMouseMove);
    return () => {
      window.removeEventListener("mousemove", manageMouseMove);
    };
  }, [manageMouseMove]);

  return (
    <motion.div
      style={{
        left: smoothMouse.x,
        top: smoothMouse.y,
        background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0) 70%)"
      }}
      className={cn(
        "pointer-events-none fixed z-50 h-[250px] w-[250px] rounded-full"
      )}
    />
  );
};

export default CursorAura;
