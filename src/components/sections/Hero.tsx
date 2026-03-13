"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { MoveDownRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";

// --- Sub-Component: Massive Geometric Saturn ---
const GeometricPlanet = () => (
  <div className="absolute top-[-20%] right-[-30%] md:right-[-10%] w-[150vw] md:w-[100vw] max-w-[1400px] aspect-square opacity-[0.15] pointer-events-none z-0">
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

// --- Sub-Component: Cinematic Starfield & Meteors ---
const DeepSpaceEnvironment = () => {
  const [meteors, setMeteors] = useState<
    Array<{
      id: number;
      top: number;
      right: number;
      delay: number;
      duration: number;
    }>
  >([]);
  const [stars, setStars] = useState<
    Array<{
      id: number;
      top: number;
      left: number;
      size: number;
      delay: number;
    }>
  >([]);

  useEffect(() => {
    setMeteors(
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        right: Math.random() * 50 - 20,
        delay: Math.random() * 8 + i * 3,
        duration: Math.random() * 2 + 3,
      })),
    );
    setStars(
      Array.from({ length: 75 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 5,
      })),
    );
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-[200vh] pointer-events-none z-0 overflow-hidden mask-fade-bottom">
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{
            duration: 3 + star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {meteors.map((meteor) => (
        <motion.div
          key={`meteor-${meteor.id}`}
          className="absolute w-[150px] h-[1px] bg-gradient-to-l from-transparent via-[#3B82F6] to-white"
          style={{
            top: `${meteor.top}%`,
            right: `${meteor.right}%`,
            rotate: "-35deg",
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], x: -800, y: 500 }}
          transition={{
            delay: meteor.delay,
            duration: meteor.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function Hero({
  data,
}: {
  data: {
    status: string;
    title1: string;
    title2: string;
    title3: string;
    description: string;
    primaryAction: string;
  };
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Trace Line scrolling logic (No Parallax for the content)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"], // Hero scrolling away
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const fillHeight = useTransform(smooth, [0, 0.5], ["0%", "100%"]); // Line fills as you scroll past the Hero

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };
  const textVars = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  // MASSIVE titles. leading-[0.85] perfectly stacks them together like a solid block of geometry.
  const fluidTextClass =
    "text-[clamp(4rem,9vw,11rem)] font-bold tracking-tighter font-space leading-[0.85]";

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative w-full flex justify-center min-h-[100dvh] z-10"
    >
      <DeepSpaceEnvironment />
      <GeometricPlanet />

      {/* Hero Inner Container - No bottom padding so the line physically hits the section edge */}
      <div className="w-full max-w-7xl relative flex flex-col px-6 md:px-12 pt-32 pb-0 z-10">
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="flex flex-col flex-1 mt-4 mb-8"
        >
          <motion.div
            variants={textVars}
            className="flex items-center gap-3 mb-10 w-fit border border-slate-800 px-4 py-2 rounded-sm bg-[#020617]/50 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 bg-[#3B82F6] animate-pulse rounded-sm" />
            <span className="text-[10px] md:text-xs font-mono text-slate-400 uppercase tracking-widest">
              {data.status}
            </span>
          </motion.div>

          {/* Colossal Titles */}
          <div className="overflow-hidden pb-2 w-full">
            <motion.h1
              variants={textVars}
              className={`${fluidTextClass} text-slate-100`}
            >
              {data.title1}
            </motion.h1>
          </div>
          <div className="overflow-hidden pb-2 w-full">
            <motion.h1
              variants={textVars}
              className={`${fluidTextClass} text-slate-600`}
            >
              {data.title2}
            </motion.h1>
          </div>
          <div className="overflow-hidden pb-2 w-full">
            <motion.h1
              variants={textVars}
              className={`${fluidTextClass} text-[#3B82F6]`}
            >
              {data.title3}
            </motion.h1>
          </div>
        </motion.div>

        {/* BOTTOM GRID: Description (Right) & The Circuit Root (Center) */}
        <div className="grid grid-cols-1 md:grid-cols-2 w-full relative pb-24">
          {/* THE CIRCUIT ROOT (Global Trace Line Origin Point) */}
          <div className="absolute left-[50%] top-[24px] bottom-0 w-px bg-slate-800/50 hidden md:block -translate-x-1/2 z-0">
            <motion.div
              style={{ height: fillHeight }}
              className="w-full bg-[#F97316] origin-top relative shadow-[0_0_15px_#F97316]"
            >
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#F97316] rounded-full flex items-center justify-center z-50 shadow-[0_0_10px_#F97316]">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            </motion.div>
          </div>
          <div className="hidden md:block"></div> {/* Empty Left Column */}
          {/* Right Column: Contains the Description and the Horizontal Connector */}
          <div className="relative flex justify-start pl-0 md:pl-16">
            {/* Horizontal Hardware Line: Spans exactly 4rem from the center line to the description's left border */}
            <div className="absolute top-[24px] left-0 w-16 h-px bg-slate-800/50 hidden md:block z-0">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
                className="w-full h-full bg-[#F97316] origin-left shadow-[0_0_10px_#F97316]"
              />
            </div>

            {/* Hardware Intersection Node at the dead center of the screen */}
            <div className="absolute top-[24px] left-0 w-2 h-2 -translate-x-[4px] -translate-y-[3.5px] bg-[#020617] border border-[#F97316] rounded-sm hidden md:block z-10" />

            {/* The Description Block */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="max-w-md relative pl-6 border-l-2 border-[#F97316] group bg-[#020617]/50 backdrop-blur-sm pt-1"
            >
              {/* This square physically connects the horizontal line to the vertical border */}
              <div className="absolute top-[20px] -left-[6px] w-2.5 h-2.5 bg-[#020617] border border-[#F97316] group-hover:bg-[#F97316] transition-colors" />

              <p className="text-slate-400 text-base md:text-lg leading-relaxed font-mono font-light text-balance mb-6">
                <span className="text-slate-200 font-bold">Hello there!</span>{" "}
                <br />
                {data.description}
              </p>

              <button
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex items-center gap-3 text-slate-300 hover:text-[#F97316] font-mono text-xs tracking-widest uppercase transition-colors group/btn"
              >
                <span>{data.primaryAction}</span>
                <MoveDownRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:translate-y-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
