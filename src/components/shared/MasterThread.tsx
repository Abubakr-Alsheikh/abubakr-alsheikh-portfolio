"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function MasterThread() {
  const { scrollYProgress } = useScroll();
  
  const drawProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="fixed inset-0 z-0 pointer-events-none flex justify-center opacity-40 mix-blend-screen md:opacity-100">
      <svg 
        className="w-full h-full"
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 20 0 C 20 30, 80 40, 80 50 C 80 60, 50 70, 50 100"
          fill="none"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          stroke="url(#thread-gradient)"
          strokeLinecap="round"
          style={{
            pathLength: drawProgress,
          }}
          className="drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
        />

        <defs>
          <linearGradient id="thread-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
