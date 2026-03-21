"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { MoveDownRight } from "lucide-react";
import { useRef } from "react";
import DeepSpaceEnvironment from "@/components/visuals/DeepSpaceEnvironment";
import GeometricPlanet from "@/components/visuals/GeometricPlanet";

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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const fillHeight = useTransform(smooth, [0, 0.5], ["0%", "100%"]);

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

  const fluidTextClass =
    "text-[clamp(4.5rem,11vw,13rem)] font-bold tracking-tighter font-space leading-[0.82]";

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative w-full flex justify-center min-h-[100dvh] z-10"
    >
      <DeepSpaceEnvironment />
      <GeometricPlanet />

      <div className="w-full max-w-7xl relative flex flex-col px-6 md:px-12 pt-32 pb-0 z-10">
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="flex flex-col md:flex-1 mt-4 mb-8"
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

          <div className="overflow-hidden pb-5 w-full">
            <motion.h1
              variants={textVars}
              className={`${fluidTextClass} text-slate-100`}
            >
              {data.title1}
            </motion.h1>
          </div>
          <div className="overflow-hidden pb-5 w-full">
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

        <div className="grid grid-cols-1 md:grid-cols-2 w-full relative pb-24">
          <div className="absolute left-[50%] top-[32px] bottom-0 w-px bg-slate-800/50 hidden md:block -translate-x-1/2 z-0">
            <motion.div
              style={{ height: fillHeight }}
              className="w-full bg-[#F97316] origin-top relative shadow-[0_0_15px_#F97316]"
            >
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#F97316] rounded-full flex items-center justify-center z-50 shadow-[0_0_10px_#F97316]">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            </motion.div>
          </div>

          <div className="hidden md:block"></div>

          <div className="relative flex justify-start pl-0 md:pl-16">
            <div className="absolute top-[32px] left-0 w-16 h-px bg-slate-800/50 hidden md:block z-0">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
                className="w-full h-full bg-[#F97316] origin-left shadow-[0_0_10px_#F97316]"
              />
            </div>

            <div className="absolute top-[32px] left-0 w-2 h-2 -translate-x-[4px] -translate-y-[3.5px] bg-[#020617] border border-[#F97316] rounded-sm hidden md:block z-10" />

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="max-w-lg relative p-6 md:p-8 border border-white/5 border-l-2 border-l-[#F97316] group bg-[#020617]/40 backdrop-blur-xl "
            >
              <div className="absolute top-[27px] -left-[6px] w-2.5 h-2.5 bg-[#020617] border border-[#F97316] group-hover:bg-[#F97316] transition-colors" />

              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-mono font-light text-balance mb-8">
                <span className="text-white font-bold tracking-tight">
                  System Online.
                </span>{" "}
                <br />
                {data.description}
              </p>

              <button
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex items-center gap-3 text-slate-400 hover:text-[#F97316] font-mono text-xs tracking-widest uppercase transition-colors group/btn"
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
