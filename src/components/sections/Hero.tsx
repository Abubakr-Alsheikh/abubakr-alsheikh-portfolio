"use client";

import { motion, useScroll, useTransform } from "framer-motion";
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

export default function Hero({ data }: { data: any }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Unified Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.2 },
    },
  };
  const textVars = {
    hidden: { opacity: 0, y: 40, rotateX: 15 },
    show: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  // Fluid typography class ensures text shrinks gracefully on smaller screens without breaking layout
  const fluidTextClass =
    "text-[clamp(3.5rem,8vw,9rem)] font-bold tracking-tighter font-space leading-[1.1]";

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100dvh] flex flex-col justify-center pt-32 pb-24 z-10"
    >
      <DeepSpaceEnvironment />
      <GeometricPlanet />

      {/* Reduced padding to md:pl-[8rem] to give text maximum horizontal space, perfectly clearing the TraceLine */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col gap-6 px-6 md:pl-[8rem] md:pr-12"
      >
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="flex flex-col cursor-default perspective-1000 w-full"
        >
          <motion.div
            variants={textVars}
            className="flex items-center gap-3 mb-8 w-fit border border-slate-800 px-4 py-2 rounded-sm bg-[#020617]/50 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 bg-[#3B82F6] animate-pulse rounded-sm" />
            <span className="text-[10px] md:text-xs font-mono text-slate-400 uppercase tracking-widest">
              {data.status}
            </span>
          </motion.div>

          {/* Title 1 & 2 */}
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

          {/* INTERLOCKING ROW: Title 3 and Description */}
          {/* By using w-full and removing justify-between, the 3rd title perfectly left-aligns with the ones above it. */}
          <div className="flex flex-col 2xl:flex-row 2xl:items-end gap-8 2xl:gap-16 w-full mt-2">
            <div className="overflow-hidden pb-2 shrink-0">
              <motion.h1
                variants={textVars}
                className={`${fluidTextClass} text-[#3B82F6]`}
              >
                {data.title3}
              </motion.h1>
            </div>

            {/* The description sits natively on the right side of the flex row, taking up remaining space */}
            <motion.div
              variants={textVars}
              className="max-w-md relative pl-6 border-l-2 border-[#F97316] mb-4 2xl:mb-8 group"
            >
              <div className="absolute top-0 -left-[5px] w-2 h-2 bg-[#020617] border border-[#F97316] group-hover:bg-[#F97316] transition-colors" />
              <p className="text-slate-400 text-base md:text-lg leading-relaxed font-mono font-light text-balance mb-6">
                <span className="text-slate-200 font-bold">Hello there!</span>{" "}
                <br></br>
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
        </motion.div>
      </motion.div>
    </section>
  );
}
