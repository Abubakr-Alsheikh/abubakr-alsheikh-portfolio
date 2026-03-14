"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

export const BranchCenterToLeft = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // FIX 1: We start at 0.20 instead of 0.00.
  // This forces the router to wait for the previous section's spring to catch up and hit the junction box.
  // FIX 2: We use "height/width" percentages instead of "scale" so we can attach an undistorted traveling dot!
  const height1 = useTransform(smooth, [0.2, 0.45], ["0%", "100%"]);
  const width2 = useTransform(smooth, [0.45, 0.75], ["0%", "100%"]);
  const height3 = useTransform(smooth, [0.75, 1.0], ["0%", "100%"]);

  // Opacity controls to seamlessly hand off the Data Packet dot at the 90-degree corners
  const dot1Opacity = useTransform(smooth, [0.2, 0.449, 0.45], [1, 1, 0]);
  const dot2Opacity = useTransform(smooth, [0.45, 0.749, 0.75], [1, 1, 0]);
  const dot3Opacity = useTransform(smooth, [0.75, 1.0], [1, 1]);

  return (
    <div
      ref={ref}
      className="w-full flex justify-center h-32 md:h-48 z-10 pointer-events-none relative"
    >
      <div className="w-full max-w-7xl mx-auto relative h-full hidden md:block">
        {/* 1. Center Drop */}
        <div className="absolute top-0 left-1/2 w-px h-1/2 bg-slate-800/50 -translate-x-1/2">
          <motion.div
            style={{ height: height1 }}
            className="w-full bg-[#F97316] relative shadow-[0_0_10px_#F97316]"
          >
            {/* Traveling Data Packet 1 */}
            <motion.div
              style={{ opacity: dot1Opacity }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#F97316] rounded-full flex items-center justify-center z-20 shadow-[0_0_10px_#F97316]"
            >
              <div className="w-1 h-1 bg-white rounded-full" />
            </motion.div>
          </motion.div>
        </div>

        {/* 2. Horizontal Route (Center to Left) - Draws Right to Left */}
        <div className="absolute top-1/2 left-[4rem] right-1/2 h-px bg-slate-800/50">
          <motion.div
            style={{ width: width2 }}
            className="absolute right-0 top-0 h-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]"
          >
            {/* Traveling Data Packet 2 */}
            <motion.div
              style={{ opacity: dot2Opacity }}
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-[#020617] border-2 border-[#3B82F6] rounded-full flex items-center justify-center z-20 shadow-[0_0_10px_#3B82F6]"
            >
              <div className="w-1 h-1 bg-white rounded-full" />
            </motion.div>
          </motion.div>
        </div>

        {/* 3. Left Drop */}
        <div className="absolute top-1/2 bottom-0 left-[4rem] w-px bg-slate-800/50">
          <motion.div
            style={{ height: height3 }}
            className="w-full bg-[#3B82F6] relative shadow-[0_0_10px_#3B82F6]"
          >
            {/* Traveling Data Packet 3 */}
            <motion.div
              style={{ opacity: dot3Opacity }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#3B82F6] rounded-full flex items-center justify-center z-20 shadow-[0_0_10px_#3B82F6]"
            >
              <div className="w-1 h-1 bg-white rounded-full" />
            </motion.div>
          </motion.div>
        </div>

        {/* Physical Hardware Junction Boxes (Sits underneath the dots) */}
        <div className="absolute top-1/2 left-[4rem] w-2 h-2 -translate-x-[4px] -translate-y-[4px] bg-[#020617] border border-[#3B82F6] rounded-sm z-10" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-[4px] -translate-y-[4px] bg-[#020617] border border-[#F97316] rounded-sm z-10" />
      </div>
    </div>
  );
};

export const BranchLeftToCenter = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const height1 = useTransform(smooth, [0.2, 0.45], ["0%", "100%"]);
  const width2 = useTransform(smooth, [0.45, 0.75], ["0%", "100%"]);
  const height3 = useTransform(smooth, [0.75, 1.0], ["0%", "100%"]);

  const dot1Opacity = useTransform(smooth, [0.2, 0.449, 0.45], [1, 1, 0]);
  const dot2Opacity = useTransform(smooth, [0.45, 0.749, 0.75], [1, 1, 0]);
  const dot3Opacity = useTransform(smooth, [0.75, 1.0], [1, 1]);

  return (
    <div
      ref={ref}
      className="w-full flex justify-center h-32 md:h-48 z-10 pointer-events-none relative"
    >
      <div className="w-full max-w-7xl mx-auto relative h-full hidden md:block">
        {/* 1. Left Drop */}
        <div className="absolute top-0 left-[4rem] w-px h-1/2 bg-slate-800/50">
          <motion.div
            style={{ height: height1 }}
            className="w-full bg-[#3B82F6] relative shadow-[0_0_10px_#3B82F6]"
          >
            <motion.div
              style={{ opacity: dot1Opacity }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#3B82F6] rounded-full flex items-center justify-center z-20 shadow-[0_0_10px_#3B82F6]"
            >
              <div className="w-1 h-1 bg-white rounded-full" />
            </motion.div>
          </motion.div>
        </div>

        {/* 2. Horizontal Route (Left to Center) - Draws Left to Right */}
        <div className="absolute top-1/2 left-[4rem] right-1/2 h-px bg-slate-800/50">
          <motion.div
            style={{ width: width2 }}
            className="absolute left-0 top-0 h-full bg-[#F97316] shadow-[0_0_10px_#F97316]"
          >
            <motion.div
              style={{ opacity: dot2Opacity }}
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#020617] border-2 border-[#F97316] rounded-full flex items-center justify-center z-20 shadow-[0_0_10px_#F97316]"
            >
              <div className="w-1 h-1 bg-white rounded-full" />
            </motion.div>
          </motion.div>
        </div>

        {/* 3. Center Drop */}
        <div className="absolute top-1/2 bottom-0 left-1/2 w-px bg-slate-800/50 -translate-x-1/2">
          <motion.div
            style={{ height: height3 }}
            className="w-full bg-[#F97316] relative shadow-[0_0_10px_#F97316]"
          >
            <motion.div
              style={{ opacity: dot3Opacity }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#F97316] rounded-full flex items-center justify-center z-20 shadow-[0_0_10px_#F97316]"
            >
              <div className="w-1 h-1 bg-white rounded-full" />
            </motion.div>
          </motion.div>
        </div>

        {/* Physical Hardware Junction Boxes */}
        <div className="absolute top-1/2 left-[4rem] w-2 h-2 -translate-x-[4px] -translate-y-[4px] bg-[#020617] border border-[#3B82F6] rounded-sm z-10" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-[4px] -translate-y-[4px] bg-[#020617] border border-[#F97316] rounded-sm z-10" />
      </div>
    </div>
  );
};
