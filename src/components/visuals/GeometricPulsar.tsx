"use client";

import { motion } from "framer-motion";

export default function GeometricPulsar() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] md:w-[150%] max-w-[2400px] aspect-square opacity-[0.08] pointer-events-none z-0">
      <svg viewBox="0 0 200 200" className="w-full h-full fill-none">
        <g transform="translate(100, 100)">
          <circle cx="0" cy="0" r="10" strokeWidth="1" className="stroke-[#3B82F6]" />
          <circle cx="0" cy="0" r="15" strokeWidth="0.5" strokeDasharray="1 2" className="stroke-[#F97316]" />
          
          <motion.circle
            cx="0" cy="0" r="30" strokeWidth="0.2" className="stroke-[#3B82F6]"
            animate={{ r: [30, 40, 30], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            cx="0" cy="0" r="50" strokeWidth="0.3" strokeDasharray="4 8" className="stroke-slate-500"
            animate={{ rotateZ: [0, 360], scale: [1, 1.05, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            cx="0" cy="0" r="75" strokeWidth="0.1" className="stroke-[#F97316]"
            animate={{ r: [75, 80, 75], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.circle
            cx="0" cy="0" r="95" strokeWidth="0.2" strokeDasharray="1 10" className="stroke-[#3B82F6]"
            animate={{ rotateZ: [360, 0] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />
        </g>
      </svg>
    </div>
  );
}
