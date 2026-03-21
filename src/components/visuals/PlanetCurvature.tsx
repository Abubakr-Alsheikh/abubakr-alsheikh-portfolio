"use client";

import { motion } from "framer-motion";

export default function PlanetCurvature() {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full h-[50vh] overflow-hidden pointer-events-none z-0 flex justify-center items-end">
      <svg
        viewBox="0 0 100 20"
        className="w-[150%] min-w-[1200px] h-auto"
        preserveAspectRatio="none"
      >
        <path
          d="M0,20 Q50,0 100,20 Z"
          fill="#020617"
          stroke="#1E293B"
          strokeWidth="0.1"
        />
        <motion.path
          d="M0,20 Q50,0 100,20"
          fill="none"
          stroke="#F97316"
          strokeWidth="0.15"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="drop-shadow-[0_-5px_15px_rgba(249,115,22,0.4)]"
        />
        <path
          d="M0,20 Q50,2 100,20"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="0.05"
          strokeDasharray="1 3"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
