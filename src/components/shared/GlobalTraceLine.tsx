"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

export default function GlobalTraceLine() {
  const { scrollYProgress } = useScroll();
  
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const indicatorPosition = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="fixed left-6 md:left-[5.2rem] top-0 bottom-0 w-px bg-slate-800/50 z-40 hidden md:block">
      <motion.div 
        style={{ scaleY: smoothProgress, transformOrigin: "top" }}
        className="absolute top-0 left-0 w-full h-full bg-azure/20"
      />
      
      <motion.div
        style={{ top: indicatorPosition }}
        className="absolute left-[-1.5px] w-[4px] h-16 bg-technical shadow-[0_0_15px_rgba(249,115,22,0.8)] rounded-full -translate-y-full"
      />

      <div className="absolute inset-0 flex flex-col justify-between py-32 pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="w-2 h-2 -ml-[3.5px] bg-[#020617] border border-slate-700 rounded-sm" />
        ))}
      </div>
    </div>
  );
}

export const BranchCenterToLeft = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const draw1 = useTransform(smoothProgress, [0, 0.4], [0, 1]);
  const draw2 = useTransform(smoothProgress, [0.4, 0.7], [0, 1]);
  const draw3 = useTransform(smoothProgress, [0.7, 1], [0, 1]);

  return (
    <div ref={ref} className="w-full relative h-32 md:h-48 z-10 -my-1 pointer-events-none">
      <div className="max-w-7xl mx-auto h-full relative hidden md:block px-6 md:px-12">
        <div className="absolute top-0 left-1/2 w-px h-1/2 bg-slate-800/50 -translate-x-1/2">
          <motion.div style={{ scaleY: draw1, transformOrigin: "top" }} className="w-full h-full bg-[#F97316] shadow-[0_0_10px_#F97316]" />
        </div>
        <div className="absolute top-1/2 left-[4rem] right-1/2 h-px bg-slate-800/50">
          <motion.div style={{ scaleX: draw2, transformOrigin: "right" }} className="w-full h-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" />
        </div>
        <div className="absolute top-1/2 bottom-0 left-[4rem] w-px bg-slate-800/50">
          <motion.div style={{ scaleY: draw3, transformOrigin: "top" }} className="w-full h-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" />
        </div>

        <div className="absolute top-1/2 left-[4rem] w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 bg-[#020617] border border-slate-600 rounded-sm" />
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 bg-[#020617] border border-[#F97316] rounded-sm" />
      </div>
    </div>
  );
};

export const BranchLeftToCenter = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const draw1 = useTransform(smoothProgress, [0, 0.4], [0, 1]);
  const draw2 = useTransform(smoothProgress, [0.4, 0.7], [0, 1]);
  const draw3 = useTransform(smoothProgress, [0.7, 1], [0, 1]);

  return (
    <div ref={ref} className="w-full relative h-32 md:h-48 z-10 -my-1 pointer-events-none">
      <div className="max-w-7xl mx-auto h-full relative hidden md:block px-6 md:px-12">
        <div className="absolute top-0 left-[4rem] w-px h-1/2 bg-slate-800/50">
          <motion.div style={{ scaleY: draw1, transformOrigin: "top" }} className="w-full h-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" />
        </div>
        <div className="absolute top-1/2 left-[4rem] right-1/2 h-px bg-slate-800/50">
          <motion.div style={{ scaleX: draw2, transformOrigin: "left" }} className="w-full h-full bg-[#F97316] shadow-[0_0_10px_#F97316]" />
        </div>
        <div className="absolute top-1/2 bottom-0 left-1/2 w-px bg-slate-800/50 -translate-x-1/2">
          <motion.div style={{ scaleY: draw3, transformOrigin: "top" }} className="w-full h-full bg-[#F97316] shadow-[0_0_10px_#F97316]" />
        </div>

        <div className="absolute top-1/2 left-[4rem] w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 bg-[#020617] border border-[#3B82F6] rounded-sm" />
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 bg-[#020617] border border-slate-600 rounded-sm" />
      </div>
    </div>
  );
};
