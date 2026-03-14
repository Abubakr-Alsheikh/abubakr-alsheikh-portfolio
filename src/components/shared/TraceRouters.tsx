"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

export const BranchCenterToLeft = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const draw1 = useTransform(smooth, [0, 0.4], [0, 1]);
  const draw2 = useTransform(smooth, [0.4, 0.7], [0, 1]);
  const draw3 = useTransform(smooth, [0.7, 1], [0, 1]);

  return (
    <div ref={ref} className="w-full flex justify-center h-32 md:h-48 z-10 pointer-events-none relative">
      <div className="w-full max-w-7xl mx-auto relative h-full hidden md:block">
        
        {/* 1. Center Drop */}
        <div className="absolute top-0 left-1/2 w-px h-1/2 bg-slate-800/50 -translate-x-1/2">
          <motion.div style={{ scaleY: draw1, transformOrigin: "top" }} className="w-full h-full bg-[#F97316] shadow-[0_0_10px_#F97316]" />
        </div>
        
        {/* 2. Horizontal Route (Center to Left) */}
        <div className="absolute top-1/2 left-[4rem] right-1/2 h-px bg-slate-800/50">
          <motion.div style={{ scaleX: draw2, transformOrigin: "right" }} className="w-full h-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" />
        </div>
        
        {/* 3. Left Drop */}
        <div className="absolute top-1/2 bottom-0 left-[4rem] w-px bg-slate-800/50">
          <motion.div style={{ scaleY: draw3, transformOrigin: "top" }} className="w-full h-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" />
        </div>

        {/* Physical Hardware Corner Nodes */}
        <div className="absolute top-1/2 left-[4rem] w-2 h-2 -translate-x-[4px] -translate-y-[4px] bg-[#020617] border border-[#3B82F6] rounded-sm z-10" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-[4px] -translate-y-[4px] bg-[#020617] border border-[#F97316] rounded-sm z-10" />
      </div>
    </div>
  );
};

export const BranchLeftToCenter = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const draw1 = useTransform(smooth, [0, 0.4], [0, 1]);
  const draw2 = useTransform(smooth, [0.4, 0.7], [0, 1]);
  const draw3 = useTransform(smooth, [0.7, 1], [0, 1]);

  return (
    <div ref={ref} className="w-full flex justify-center h-32 md:h-48 z-10 pointer-events-none relative">
      <div className="w-full max-w-7xl mx-auto relative h-full hidden md:block">
        
        {/* 1. Left Drop */}
        <div className="absolute top-0 left-[4rem] w-px h-1/2 bg-slate-800/50">
          <motion.div style={{ scaleY: draw1, transformOrigin: "top" }} className="w-full h-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" />
        </div>
        
        {/* 2. Horizontal Route (Left to Center) */}
        <div className="absolute top-1/2 left-[4rem] right-1/2 h-px bg-slate-800/50">
          <motion.div style={{ scaleX: draw2, transformOrigin: "left" }} className="w-full h-full bg-[#F97316] shadow-[0_0_10px_#F97316]" />
        </div>
        
        {/* 3. Center Drop */}
        <div className="absolute top-1/2 bottom-0 left-1/2 w-px bg-slate-800/50 -translate-x-1/2">
          <motion.div style={{ scaleY: draw3, transformOrigin: "top" }} className="w-full h-full bg-[#F97316] shadow-[0_0_10px_#F97316]" />
        </div>

        {/* Physical Hardware Corner Nodes */}
        <div className="absolute top-1/2 left-[4rem] w-2 h-2 -translate-x-[4px] -translate-y-[4px] bg-[#020617] border border-[#3B82F6] rounded-sm z-10" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-[4px] -translate-y-[4px] bg-[#020617] border border-[#F97316] rounded-sm z-10" />
      </div>
    </div>
  );
};
