"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { MoveDownRight } from "lucide-react";
import { useEffect, useRef } from "react";

type HeroData = {
  status: string;
  title1: string;
  title2: string;
  title3: string;
  description: string;
  primaryAction: string;
};

// --- Sub-component: The "Alive" Architectural Canvas ---
// This fills the empty space with premium, non-distracting engineering visuals.
const ArchitecturalCanvas = ({
  mouseX,
  mouseY,
}: {
  mouseX: any;
  mouseY: any;
}) => {
  // Parallax constraints for the background elements
  const x1 = useTransform(mouseX, [-1, 1], [-20, 20]);
  const y1 = useTransform(mouseY, [-1, 1], [-20, 20]);
  const x2 = useTransform(mouseX, [-1, 1], [30, -30]);
  const y2 = useTransform(mouseY, [-1, 1], [30, -30]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 1. Micro-data points (Adds a highly technical, personal feel) */}
      <motion.div
        style={{ x: x1, y: y1 }}
        className="absolute top-32 right-8 md:right-16 text-[10px] md:text-xs font-mono text-slate-500/40 tracking-widest text-right hidden sm:block"
      >
        <p>SYS.LOC // 36.2021° N, 37.1343° E</p>
        <p>ENV // PRODUCTION</p>
        <p className="text-orange-500/50 mt-1 animate-pulse">STATUS_OPTIMAL</p>
      </motion.div>

      {/* 2. Abstract Geometric Wireframe (Fills the top-right empty space) */}
      <motion.div
        style={{ x: x2, y: y2 }}
        className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] opacity-[0.15]"
      >
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full stroke-slate-400 fill-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        >
          {/* Outer dashed orbit */}
          <circle
            cx="50"
            cy="50"
            r="48"
            strokeWidth="0.2"
            strokeDasharray="2 4"
          />
          {/* Inner solid orbit */}
          <circle cx="50" cy="50" r="35" strokeWidth="0.1" />
          {/* Geometric connection lines */}
          <line
            x1="15"
            y1="50"
            x2="85"
            y2="50"
            strokeWidth="0.1"
            strokeDasharray="1 2"
          />
          <line
            x1="50"
            y1="15"
            x2="50"
            y2="85"
            strokeWidth="0.1"
            strokeDasharray="1 2"
          />
          {/* Rotating focal polygon */}
          <motion.polygon
            points="50,20 75,75 25,75"
            strokeWidth="0.2"
            strokeDasharray="1 3"
            animate={{ rotate: -360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "50px 50px" }}
          />
        </motion.svg>
      </motion.div>

      {/* 3. Glowing Intersections (Crosshairs) scattered across the screen */}
      {[
        { top: "20%", left: "15%", delay: 0 },
        { top: "45%", left: "60%", delay: 2 },
        { top: "70%", left: "85%", delay: 1 },
        { top: "30%", left: "80%", delay: 3 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 text-slate-600/30 flex items-center justify-center font-light text-lg select-none"
          style={{ top: pos.top, left: pos.left }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
          transition={{
            duration: 4,
            delay: pos.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          +
        </motion.div>
      ))}
    </div>
  );
};

export default function Hero({ data }: { data: HeroData }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // -- SCROLL PARALLAX --
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // -- MOUSE TRACKING (For the "Alive" feel) --
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  // Heavy damping makes it feel smooth and deliberate, not hyperactive
  const smoothMouseX = useSpring(mouseX, {
    stiffness: 40,
    damping: 25,
    mass: 0.5,
  });
  const smoothMouseY = useSpring(mouseY, {
    stiffness: 40,
    damping: 25,
    mass: 0.5,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Premium easing curve
  const ease = [0.16, 1, 0.3, 1];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1.2, ease },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100dvh] flex flex-col justify-between px-6 md:px-12 lg:px-20 pt-32 pb-24 z-10 overflow-hidden"
    >
      {/* 1. SEAMLESS BLEND GRADIENT */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-b from-transparent to-[#020617] pointer-events-none z-0" />

      {/* 2. THE ALIVE BACKGROUND */}
      <ArchitecturalCanvas mouseX={smoothMouseX} mouseY={smoothMouseY} />

      {/* --- TOP ROW: Availability Indicator --- */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 50]), opacity }}
        className="relative z-10 w-full max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 1, ease }}
          className="flex items-center gap-3 backdrop-blur-sm bg-white/[0.02] border border-white/5 w-fit px-4 py-2 rounded-full cursor-default"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </span>
          <span className="text-xs font-mono text-slate-300 uppercase tracking-widest">
            {data.status}
          </span>
        </motion.div>
      </motion.div>

      {/* --- BOTTOM ROW: Main Content --- */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 w-full max-w-7xl mx-auto mt-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end"
      >
        {/* LEFT COLUMN: Typography */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-8 flex flex-col cursor-default"
        >
          {/* Changed from tracking-tighter to tracking-tight, and relaxed the leading slightly for elegance */}
          <div className="overflow-hidden pb-2 -ml-1 sm:-ml-2">
            <motion.h1
              variants={item}
              className="text-[4rem] sm:text-6xl md:text-7xl lg:text-[7rem] font-bold tracking-tight text-slate-100 font-cal leading-[1]"
            >
              {data.title1}
            </motion.h1>
          </div>
          <div className="overflow-hidden pb-2 -ml-1 sm:-ml-2">
            <motion.h1
              variants={item}
              className="text-[4rem] sm:text-6xl md:text-7xl lg:text-[7rem] font-bold tracking-tight text-slate-500 font-cal leading-[1]"
            >
              {data.title2}
            </motion.h1>
          </div>
          <div className="overflow-hidden pb-4 -ml-1 sm:-ml-2">
            <motion.h1
              variants={item}
              // Added an infinite breathing shimmer to the orange text
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="text-[4rem] sm:text-6xl md:text-7xl lg:text-[7rem] font-bold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(to_right,#F97316,#FDBA74,#F97316)] bg-[length:200%_auto] font-cal leading-[1.1] drop-shadow-[0_0_30px_rgba(249,115,22,0.2)]"
            >
              {data.title3}
            </motion.h1>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Description & Button */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-4 flex flex-col justify-end pb-2 lg:pb-6 relative"
        >
          {/* Subtle structural divider line */}
          <div className="hidden lg:block absolute left-[-2rem] top-0 w-px h-full bg-gradient-to-b from-transparent via-slate-800 to-transparent" />

          <motion.p
            variants={item}
            className="text-slate-400 text-base md:text-lg leading-relaxed mb-10 font-light max-w-md text-balance"
          >
            {data.description}
          </motion.p>

          <motion.div variants={item}>
            <button
              onClick={() => {
                document
                  .getElementById("projects")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative inline-flex items-center gap-4 text-slate-100 font-medium py-3 px-6 rounded-full border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800 transition-colors duration-300 backdrop-blur-sm overflow-hidden"
            >
              <span className="relative z-10 text-sm tracking-wide uppercase">
                {data.primaryAction}
              </span>
              <MoveDownRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300 text-orange-400" />

              {/* Subtle orange glow inside the button that follows hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
