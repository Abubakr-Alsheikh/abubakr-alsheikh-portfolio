// src/components/sections/Hero.tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { MoveDownRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";

// --- Sub-Component: Massive Geometric Saturn ---
const GeometricPlanet = () => (
  // Scaled up massively: w-[150vw] max-w-[1600px]
  <div className="absolute top-[-20%] right-[-30%] md:right-[-20%] w-[150vw] md:w-[120vw] max-w-[1600px] aspect-square opacity-[0.15] pointer-events-none z-0">
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
    // Generate Meteors (Slower, fading smoothly)
    setMeteors(
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100, // Spread across 200vh
        right: Math.random() * 50 - 20, // Start slightly off-screen right
        delay: Math.random() * 8 + i * 3,
        duration: Math.random() * 2 + 3, // Slower duration (3-5s)
      })),
    );

    // Generate Static Twinkling Stars
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
    // This container is h-[200vh] so the stars/meteors bleed perfectly into the About section
    <div className="absolute top-0 left-0 w-full h-[200vh] pointer-events-none z-0 overflow-hidden mask-fade-bottom">
      {/* Stars */}
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

      {/* Meteors (Moving Top-Right to Bottom-Left) */}
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
          // Move diagonally down and left, fading in then out
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

export default function Hero({ data }: { data: any }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle Parallax (Reduced to prevent overlap with About section)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Framer Motion staggered animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };
  const textVars = {
    hidden: { opacity: 0, y: 50, rotateX: 20 },
    show: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100dvh] flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-32 pb-24 z-10"
    >
      <DeepSpaceEnvironment />
      <GeometricPlanet />

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-12 lg:pl-[6.5rem]"
      >
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="flex flex-col cursor-default perspective-1000"
        >
          <motion.div
            variants={textVars}
            className="flex items-center gap-3 mb-6 w-fit border border-slate-800 px-4 py-2 rounded-sm bg-[#020617]/50 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 bg-[#3B82F6] animate-pulse rounded-sm" />
            <span className="text-[10px] md:text-xs font-mono text-slate-400 uppercase tracking-widest">
              {data.status}
            </span>
          </motion.div>

          {/* Bigger Typography with elegant line height */}
          <div className="overflow-hidden pb-2">
            <motion.h1
              variants={textVars}
              className="text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter text-slate-100 font-space leading-[1.1]"
            >
              {data.title1}
            </motion.h1>
          </div>
          <div className="overflow-hidden pb-2">
            <motion.h1
              variants={textVars}
              className="text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter text-slate-600 font-space leading-[1.1]"
            >
              {data.title2}
            </motion.h1>
          </div>
          <div className="overflow-hidden pb-4">
            <motion.h1
              variants={textVars}
              className="text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter text-[#3B82F6] font-space leading-[1.1]"
            >
              {data.title3}
            </motion.h1>
          </div>
        </motion.div>

        {/* Balanced Description directly below the title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="max-w-2xl relative pl-6 border-l-2 border-[#F97316] mt-4"
        >
          <div className="absolute top-0 -left-[5px] w-2 h-2 bg-[#020617] border border-[#F97316]" />
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-mono font-light text-balance mb-8">
            <span className="text-slate-200 font-bold">
              I am Abubakr Alsheikh.
            </span>{" "}
            {data.description}
          </p>
          <button
            onClick={() =>
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-3 text-slate-300 hover:text-[#F97316] font-mono text-xs tracking-widest uppercase transition-colors group"
          >
            <span>{data.primaryAction}</span>
            <MoveDownRight className="w-4 h-4 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
