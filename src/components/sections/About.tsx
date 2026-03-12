"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import { useRef } from "react";

// --- Sub-Component: Geometric Jupiter & Galilean Moons ---
const GeometricJupiter = () => (
  // Positioned on the left side, slightly lower to balance Saturn in the Hero
  <div className="absolute top-[10%] left-[-30%] md:left-[-15%] w-[120vw] md:w-[100vw] max-w-[1200px] aspect-square opacity-[0.1] pointer-events-none z-0">
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full stroke-[#F97316] fill-none"
    >
      <g transform="translate(100, 100) rotate(10)">
        {/* Planet Mass */}
        <circle
          cx="0"
          cy="0"
          r="45"
          strokeWidth="0.5"
          className="stroke-slate-500"
        />

        {/* Gas Bands (Curved lines across the surface) */}
        <path
          d="M -39 -22 Q 0 -15 39 -22"
          strokeWidth="0.3"
          strokeDasharray="2 2"
          className="stroke-slate-400"
        />
        <path
          d="M -44 -8 Q 0 0 44 -8"
          strokeWidth="0.5"
          className="stroke-[#F97316]"
        />
        <path
          d="M -44 10 Q 0 18 44 10"
          strokeWidth="0.3"
          strokeDasharray="1 3"
          className="stroke-slate-400"
        />
        <path
          d="M -35 28 Q 0 35 35 28"
          strokeWidth="0.4"
          className="stroke-[#F97316]"
        />

        {/* The Galilean Moons (Io, Europa, Ganymede, Callisto) */}
        <g className="stroke-[#3B82F6] fill-[#020617]">
          {/* Orbital Line */}
          <line
            x1="-90"
            y1="0"
            x2="90"
            y2="0"
            strokeWidth="0.1"
            strokeDasharray="1 2"
            className="stroke-slate-500"
          />

          <motion.circle
            cx="0"
            cy="0"
            r="1.5"
            strokeWidth="0.5"
            animate={{ x: [-55, 55, -55] }}
            transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.circle
            cx="0"
            cy="0"
            r="1"
            strokeWidth="0.5"
            animate={{ x: [65, -65, 65] }}
            transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.circle
            cx="0"
            cy="0"
            r="2"
            strokeWidth="0.5"
            animate={{ x: [-80, 80, -80] }}
            transition={{ duration: 35, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.circle
            cx="0"
            cy="0"
            r="1.5"
            strokeWidth="0.5"
            animate={{ x: [95, -95, 95] }}
            transition={{ duration: 50, ease: "easeInOut", repeat: Infinity }}
          />
        </g>
      </g>
    </svg>
  </div>
);

type Capability = {
  id: string;
  title: string;
  metric?: string;
  subtitle: string;
  description: string;
};

type AboutData = {
  manifesto: string;
  capabilities: Capability[];
};

export default function About({ data }: { data: AboutData }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Synchronized Parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });
  const leftY = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const rightY = useTransform(scrollYProgress, [0, 1], [250, 0]);

  return (
    // CRITICAL: bg-transparent allows the stars from Hero to flow perfectly into this section
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full min-h-screen pt-32 pb-48 px-6 md:px-12 lg:px-20 z-20 bg-transparent"
    >
      <GeometricJupiter />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative lg:pl-[6.5rem]">
        {/* Left Column: Mission Manifesto (Slower Parallax) */}
        <motion.div style={{ y: leftY }} className="lg:col-span-5 relative">
          <div className="sticky top-32 flex flex-col">
            <h2 className="text-xs font-mono text-[#3B82F6] mb-6 tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-sm bg-[#3B82F6] animate-pulse" />
              CORE_ARCHITECTURE
            </h2>
            <h3 className="text-5xl md:text-6xl lg:text-7xl font-space font-bold text-slate-100 leading-[1] tracking-tighter mb-8">
              Precision in <br />
              <span className="text-slate-600">execution.</span>
            </h3>
            <div className="relative pl-6 border-l-2 border-slate-800">
              <ArrowDownRight className="absolute -left-3 top-[-2px] w-5 h-5 text-slate-500 bg-[#020617]" />
              <p className="text-lg md:text-xl text-slate-400 font-mono font-light leading-relaxed">
                {data.manifesto}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Orbital Data Nodes (Faster Parallax) */}
        <motion.div
          style={{ y: rightY }}
          className="lg:col-span-7 flex flex-col gap-8 lg:pl-16"
        >
          {data.capabilities.map((item: Capability, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative group p-8 bg-[#020617] border border-slate-800 hover:border-[#F97316]/50 transition-colors duration-500"
            >
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity" />

              <span className="text-[10px] font-mono text-[#F97316] tracking-widest uppercase block mb-6">
                {item.id}
              </span>

              {item.metric && (
                <div className="text-6xl md:text-7xl font-space font-bold text-slate-200 tracking-tighter mb-6 group-hover:text-[#3B82F6] transition-colors">
                  {item.metric}
                </div>
              )}

              <h4 className="text-2xl md:text-3xl font-space text-slate-100 tracking-tight mb-4">
                {item.title}
              </h4>

              <div className="inline-flex px-3 py-1 bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-6">
                {item.subtitle}
              </div>

              <p className="text-slate-400 text-sm md:text-base leading-relaxed font-mono font-light">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
