// src/components/sections/About.tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import { useRef } from "react";

export default function About({ data }: { data: any }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Synchronized Parallax: As this section enters the viewport, it smoothly translates upwards
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  // Left column moves slightly slower than the right column for depth
  const leftY = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const rightY = useTransform(scrollYProgress, [0, 1], [250, 0]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full min-h-screen pt-32 pb-48 px-6 md:px-12 lg:px-20 z-20"
    >
      {/* 
        This gradient mask ensures that if the Hero parallax overlaps slightly, 
        it is hidden smoothly behind the dark atmosphere of the About section.
      */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#020617] to-transparent z-[-1]" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative lg:pl-[6.5rem]">
        {/* Left Column: Mission Manifesto (Slower Parallax) */}
        <motion.div style={{ y: leftY }} className="lg:col-span-5 relative">
          <div className="sticky top-32 flex flex-col">
            <h2 className="text-xs font-mono text-[#3B82F6] mb-6 tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-sm bg-[#3B82F6] animate-pulse" />
              CORE_ARCHITECTURE
            </h2>
            <h3 className="text-5xl md:text-6xl lg:text-7xl font-space text-slate-100 leading-[1] tracking-tighter mb-8">
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
          {data.capabilities.map((item: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative group p-8 bg-[#020617] border border-slate-800 hover:border-[#F97316]/50 transition-colors duration-500"
            >
              {/* Technical Corners */}
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
