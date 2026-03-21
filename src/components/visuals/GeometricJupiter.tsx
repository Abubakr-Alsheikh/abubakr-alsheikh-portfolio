"use client";

import { motion } from "framer-motion";

export default function GeometricJupiter() {
  return (
    <div className="absolute top-[10%] left-[-30%] md:left-[-15%] w-[120%] md:w-[100%] max-w-[1200px] aspect-square opacity-[0.1] pointer-events-none z-0">
      <svg viewBox="0 0 200 200" className="w-full h-full stroke-[#F97316] fill-none">
        <g transform="translate(100, 100) rotate(10)">
          <circle cx="0" cy="0" r="45" strokeWidth="0.5" className="stroke-slate-500" />
          <path d="M -39 -22 Q 0 -15 39 -22" strokeWidth="0.3" strokeDasharray="2 2" className="stroke-slate-400" />
          <path d="M -44 -8 Q 0 0 44 -8" strokeWidth="0.5" className="stroke-[#F97316]" />
          <path d="M -44 10 Q 0 18 44 10" strokeWidth="0.3" strokeDasharray="1 3" className="stroke-slate-400" />
          <path d="M -35 28 Q 0 35 35 28" strokeWidth="0.4" className="stroke-[#F97316]" />
          <g className="stroke-[#3B82F6] fill-[#020617]">
            <line x1="-90" y1="0" x2="90" y2="0" strokeWidth="0.1" strokeDasharray="1 2" className="stroke-slate-500" />
            <motion.circle
              cx="0" cy="0" r="1.5" strokeWidth="0.5"
              animate={{ x: [-55, 55, -55] }}
              transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}
            />
            <motion.circle
              cx="0" cy="0" r="1" strokeWidth="0.5"
              animate={{ x: [65, -65, 65] }}
              transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
