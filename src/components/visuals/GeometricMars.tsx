"use client";

import { motion } from "framer-motion";

export default function GeometricMars() {
  return (
    <div className="absolute top-[10%] right-[-60%] md:right-[-40%] w-[200%] md:w-[150%] max-w-[2400px] aspect-square opacity-[0.2] pointer-events-none z-0">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full stroke-[#F97316] fill-none"
      >
        <g transform="translate(100, 100)">
          <line
            x1="-100"
            y1="0"
            x2="-40"
            y2="0"
            strokeWidth="0.2"
            className="stroke-slate-500"
          />
          <line
            x1="40"
            y1="0"
            x2="100"
            y2="0"
            strokeWidth="0.2"
            className="stroke-slate-500"
          />
          <line
            x1="0"
            y1="-100"
            x2="0"
            y2="-40"
            strokeWidth="0.2"
            className="stroke-slate-500"
          />
          <line
            x1="0"
            y1="40"
            x2="0"
            y2="100"
            strokeWidth="0.2"
            className="stroke-slate-500"
          />

          <circle
            cx="0"
            cy="0"
            r="35"
            strokeWidth="0.4"
            className="stroke-slate-500"
          />

          <path
            d="M -32 -15 Q 0 -5 32 -15"
            strokeWidth="0.3"
            className="stroke-slate-600"
          />
          <path
            d="M -35 0 Q 0 10 35 0"
            strokeWidth="0.5"
            className="stroke-[#F97316]"
          />
          <path
            d="M -32 15 Q 0 25 32 15"
            strokeWidth="0.3"
            className="stroke-slate-600"
          />

          <motion.g
            animate={{ rotateZ: [0, 360] }}
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
          >
            <circle
              cx="0"
              cy="0"
              r="70"
              strokeWidth="0.2"
              strokeDasharray="2 6"
              className="stroke-[#F97316]"
            />
            <rect
              x="-3"
              y="-73"
              width="6"
              height="6"
              strokeWidth="0.5"
              className="stroke-[#F97316] fill-[#020617]"
            />
            <circle cx="0" cy="-70" r="1" className="fill-[#F97316]" />
          </motion.g>
        </g>
      </svg>
    </div>
  );
}
