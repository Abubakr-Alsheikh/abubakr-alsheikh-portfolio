// src/components/shared/TelemetryNav.tsx
"use client";

import { motion, useScroll, useVelocity, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

const NetworkGraph = () => {
  const [points, setPoints] = useState<number[]>(Array(20).fill(5));
  const mouseSpeed = useMotionValue(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const speed = Math.abs(e.movementX) + Math.abs(e.movementY);
    mouseSpeed.set(speed);
  }, [mouseSpeed]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    const interval = setInterval(() => {
      const currentSpeed = mouseSpeed.get();
      const newPoint = Math.min(20, Math.max(2, (currentSpeed / 5) + (Math.random() * 4)));
      
      setPoints(prev => {
        const next = [...prev.slice(1), newPoint];
        return next;
      });
      
      mouseSpeed.set(currentSpeed * 0.5);
    }, 100);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, [handleMouseMove, mouseSpeed]);

  const pointsString = points.map((p, i) => `${i * 5},${24 - p}`).join(" ") + ` 95,24 0,24`;

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">NET.LOAD</span>
      <svg width="100" height="24" className="overflow-visible">
        <polygon points={pointsString} fill="rgba(249,115,22,0.1)" />
        <polyline points={points.map((p, i) => `${i * 5},${24 - p}`).join(" ")} fill="none" stroke="#F97316" strokeWidth="1" />
      </svg>
    </div>
  );
};

export default function TelemetryNav() {
  const { scrollYProgress, scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const smoothProgress = useSpring(scrollYProgress, { damping: 30, stiffness: 100, restDelta: 0.001 });

  const altitude = useTransform(smoothProgress, [0, 1], [400000, 0]);
  const machSpeed = useTransform(smoothVelocity, [-1000, 0, 1000], [25, 0, 25]);

  const [altDisplay, setAltDisplay] = useState("400,000");
  const [machDisplay, setMachDisplay] = useState("0.00");

  useEffect(() => {
    const unsubscribeAlt = altitude.on("change", (v) => setAltDisplay(Math.max(0, Math.floor(v)).toLocaleString("en-US")));
    const unsubscribeMach = machSpeed.on("change", (v) => setMachDisplay(Math.abs(v).toFixed(2)));
    return () => { unsubscribeAlt(); unsubscribeMach(); };
  }, [altitude, machSpeed]);

  return (
    <motion.header 
      initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none px-6 md:px-12 pt-6"
    >
      <div className="max-w-7xl mx-auto flex items-start justify-between">
        <div className="flex flex-col gap-1 backdrop-blur-md bg-[#020617]/60 border border-slate-800/50 p-3 md:p-4 rounded-xl shadow-2xl pointer-events-auto">
          <h1 className="text-sm font-space font-bold tracking-widest text-slate-100 uppercase">
            A. Alsheikh <span className="text-orange-500 animate-pulse">_</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-500/80 tracking-widest uppercase">Telemetry Active</span>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end gap-2 backdrop-blur-md bg-[#020617]/60 border border-slate-800/50 p-3 md:p-4 rounded-xl shadow-2xl">
          <div className="flex gap-6 text-[11px] font-mono text-slate-400 tracking-widest uppercase items-center">
            
            <NetworkGraph />

            <div className="w-px h-6 bg-slate-800" />
            
            <div className="flex flex-col text-right w-24">
              <span className="text-slate-600 mb-1">ALTITUDE</span>
              <span className="text-slate-200">{altDisplay} <span className="text-orange-500 text-[9px]">FT</span></span>
            </div>
            <div className="flex flex-col text-right w-20">
              <span className="text-slate-600 mb-1">VELOCITY</span>
              <span className="text-slate-200">M {machDisplay}</span>
            </div>
          </div>
          
          <div className="w-full h-px bg-slate-800 mt-1 relative overflow-hidden rounded-full">
            <motion.div style={{ scaleX: smoothProgress, transformOrigin: "0% 50%" }} className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
