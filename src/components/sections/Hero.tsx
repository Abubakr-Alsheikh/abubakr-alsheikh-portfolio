"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { MoveDownRight } from "lucide-react";
import { useRef, useState } from "react";

const ScrambleText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/+-\\";

  const scramble = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text.split("").map((letter, index) => {
          if (index < iteration) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 20);
  };

  return (
    <span onMouseEnter={scramble} className="cursor-crosshair transition-colors hover:text-orange-400">
      {displayText}
    </span>
  );
};

type HeroData = {
  status: string;
  title1: string;
  title2: string;
  title3: string;
  description: string;
  primaryAction: string;
};

export default function Hero({ data }: { data: HeroData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={containerRef} className="relative w-full min-h-[100dvh] flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-32 pb-24 z-10 overflow-hidden">
      <motion.div style={{ y, opacity }} className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-8 flex flex-col cursor-default z-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center gap-3 mb-8 w-fit backdrop-blur-md bg-white/[0.02] border border-white/10 px-4 py-2 rounded-full"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
            <span className="text-xs font-mono text-slate-300 uppercase tracking-widest">{data.status}</span>
          </motion.div>

          <h1 className="text-[4rem] sm:text-6xl md:text-7xl lg:text-[8rem] font-bold tracking-tighter text-slate-100 font-space leading-[0.9]">
            {data.title1}
          </h1>
          <h1 className="text-[4rem] sm:text-6xl md:text-7xl lg:text-[8rem] font-bold tracking-tighter text-slate-600 font-space leading-[0.9]">
            {data.title2}
          </h1>
          <h1 className="text-[4rem] sm:text-6xl md:text-7xl lg:text-[8rem] font-bold tracking-tighter text-transparent bg-clip-text bg-[linear-gradient(to_right,#3B82F6,#A855F7,#F97316)] bg-[length:200%_auto] animate-breathing-gradient font-space leading-[1.1]">
            {data.title3}
          </h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }}
          className="lg:col-span-4 flex flex-col justify-end relative z-20"
        >
          <div className="p-6 backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-2xl shadow-2xl">
            <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 font-mono font-light text-balance">
              <ScrambleText text="I am Abubakr Alsheikh." /> A Full-Stack Architect designing secure Django backends and building responsive Next.js frontends to deliver software that solves real problems.
            </p>
            <button
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="group relative inline-flex items-center gap-4 text-slate-100 font-mono text-sm tracking-widest uppercase py-3 px-6 rounded-full border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800 transition-colors duration-300 overflow-hidden"
            >
              <span className="relative z-10">{data.primaryAction}</span>
              <MoveDownRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform text-orange-400" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
