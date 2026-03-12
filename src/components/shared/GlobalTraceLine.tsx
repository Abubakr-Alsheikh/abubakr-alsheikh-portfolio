"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";

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
