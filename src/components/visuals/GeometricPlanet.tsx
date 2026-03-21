"use client";

import { motion } from "framer-motion";

export default function GeometricPlanet() {
  return (
    <div className="absolute top-[-20%] right-[-30%] md:right-[-10%] w-[150%] md:w-[100%] max-w-[1400px] aspect-square opacity-[0.15] pointer-events-none z-0">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full stroke-[#3B82F6] fill-none"
      >
        <g transform="translate(100, 100) rotate(-25)">
          <circle
            cx="0"
            cy="0"
            r="30"
            strokeWidth="0.4"
            className="stroke-slate-500"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="15"
            ry="30"
            strokeWidth="0.2"
            className="stroke-slate-600"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="30"
            ry="10"
            strokeWidth="0.2"
            className="stroke-slate-600"
          />
          <motion.ellipse
            cx="0"
            cy="0"
            rx="55"
            ry="15"
            strokeWidth="0.4"
            strokeDasharray="2 4"
            animate={{ rotateZ: [0, 360] }}
            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          />
          <motion.ellipse
            cx="0"
            cy="0"
            rx="75"
            ry="20"
            strokeWidth="0.6"
            animate={{ rotateZ: [360, 0] }}
            transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          />
          <motion.ellipse
            cx="0"
            cy="0"
            rx="90"
            ry="25"
            strokeWidth="0.3"
            strokeDasharray="1 6"
            animate={{ rotateZ: [0, 360] }}
            transition={{ duration: 250, repeat: Infinity, ease: "linear" }}
          />
        </g>
      </svg>
    </div>
  );
}
