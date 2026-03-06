"use client";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollLine() {
  const { scrollYProgress } = useScroll();
  
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="fixed left-4 md:left-10 top-0 bottom-0 w-px bg-slate-800/30 z-40 hidden lg:block">
      <motion.div 
        style={{ 
          scaleY,
          originY: 0,
          background: "linear-gradient(to bottom, transparent, #3B82F6, #F97316)"
        }} 
        className="absolute inset-0 w-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"
      />
      
      <div className="absolute inset-0 flex flex-col justify-between py-20 pointer-events-none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-2 h-2 -ml-[3.5px] rounded-full bg-slate-800 border border-[#020617]" />
        ))}
      </div>
    </div>
  );
}
