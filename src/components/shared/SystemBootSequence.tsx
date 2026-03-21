"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const BOOT_LOGS = [
  "INITIALIZING_KERNEL_V4.9.2...",
  "ALLOCATING_MEMORY_RESERVES...",
  "MOUNTING_VIRTUAL_FILE_SYSTEM...",
  "DECRYPTING_ORBITAL_PAYLOAD...",
  "ESTABLISHING_TELEMETRY_LINK...",
  "RENDERING_HUD_GEOMETRY...",
  "BYPASSING_SECURITY_PROTOCOLS...",
  "SYSTEM_ONLINE.",
];

export default function SystemBootSequence({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState(0);
  const [hexCode, setHexCode] = useState("0x00000000");

  useEffect(() => {
    const duration = 3800;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(
        Math.floor((currentStep / steps) * 100),
        100,
      );
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => onComplete(), 600);
      }
    }, intervalTime);

    const logInterval = setInterval(() => {
      setCurrentLog((prev) => Math.min(prev + 1, BOOT_LOGS.length - 1));
    }, duration / BOOT_LOGS.length);

    const hexInterval = setInterval(() => {
      setHexCode(
        `0x${Math.floor(Math.random() * 16777215)
          .toString(16)
          .toUpperCase()
          .padStart(8, "0")}`,
      );
    }, 50);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      clearInterval(hexInterval);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] overflow-hidden selection:bg-transparent cursor-wait"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] md:w-[80vw] max-w-[1200px] aspect-square opacity-[0.15] pointer-events-none">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full stroke-[#3B82F6] fill-none"
        >
          <g transform="translate(100, 100)">
            <circle
              cx="0"
              cy="0"
              r="20"
              strokeWidth="0.4"
              className="stroke-slate-500"
            />
            <motion.ellipse
              cx="0"
              cy="0"
              rx="45"
              ry="15"
              strokeWidth="0.4"
              strokeDasharray="2 4"
              animate={{ rotateZ: progress < 100 ? [0, 360] : [0, 1440] }}
              transition={{ duration: progress < 100 ? 20 : 2, ease: "linear" }}
            />
            <motion.ellipse
              cx="0"
              cy="0"
              rx="65"
              ry="20"
              strokeWidth="0.6"
              animate={{ rotateZ: progress < 100 ? [360, 0] : [1440, 0] }}
              transition={{ duration: progress < 100 ? 25 : 2, ease: "linear" }}
            />
            <motion.ellipse
              cx="0"
              cy="0"
              rx="85"
              ry="25"
              strokeWidth="0.2"
              strokeDasharray="1 6"
              animate={{ rotateZ: progress < 100 ? [0, 360] : [0, 1440] }}
              transition={{ duration: progress < 100 ? 30 : 2, ease: "linear" }}
            />
          </g>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col">
        <div className="flex justify-between items-end border-b border-slate-800 pb-2 mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1">
              SYS.ARCH // ABUBAKR_ALSHEIKH
            </span>
            <span className="text-xs font-mono text-[#3B82F6] tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#3B82F6] animate-pulse rounded-sm" />
              ORBITAL_STABLE
            </span>
          </div>
          <span className="text-xs font-mono text-slate-600 tracking-widest">
            {hexCode}
          </span>
        </div>

        <div className="h-24 flex flex-col justify-end overflow-hidden mb-8 mask-fade-top">
          {BOOT_LOGS.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity:
                  index === currentLog ? 1 : index < currentLog ? 0.3 : 0,
                x: index <= currentLog ? 0 : -10,
              }}
              className={`text-xs md:text-sm font-mono tracking-widest uppercase mb-2 ${
                index === BOOT_LOGS.length - 1
                  ? "text-[#F97316] font-bold"
                  : "text-slate-400"
              }`}
            >
              {index <= currentLog ? `> ${log}` : ""}
            </motion.div>
          ))}
        </div>

        <div className="w-full flex flex-col gap-3">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 tracking-widest uppercase">
            <span>Core_Load</span>
            <span className={progress === 100 ? "text-[#F97316]" : ""}>
              {progress}%
            </span>
          </div>
          <div className="w-full h-1 bg-slate-900 border border-slate-800 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-[#F97316] shadow-[0_0_10px_#F97316]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
          <div className="w-full grid grid-cols-12 gap-1 mt-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 transition-colors duration-75 ${
                  progress > (i / 12) * 100 ? "bg-[#3B82F6]/50" : "bg-slate-900"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
