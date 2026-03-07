"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDownRight } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll for the glowing Trace Line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"],
  });

  // The glowing line grows down as you scroll
  const traceHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#020617] pt-24 pb-48 px-6 md:px-12 lg:px-20 z-20"
    >
      {/* 
        1. SEAMLESS CONNECTION
        This faint text bridges the visual gap between the Hero and About section, 
        making it feel like a continuous terminal readout.
      */}
      <div className="absolute top-0 left-6 md:left-20 text-[10px] font-mono text-slate-700 tracking-[0.2em] uppercase">
        <span className="text-orange-500 mr-2">↓</span> Continuing Sequence //
        System Profile
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 relative pt-16">
        {/* --- LEFT COLUMN: Sticky Narrative (The "Manifesto") --- */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-32 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-sm font-mono text-orange-500 mb-6 tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                CORE_ARCHITECTURE
              </h2>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-cal text-slate-100 leading-[1.1] tracking-tight mb-8">
                Precision in <br className="hidden lg:block" />
                <span className="text-slate-500">execution.</span>
              </h3>

              {/* The Manifesto */}
              <div className="relative pl-6 border-l border-slate-800">
                <ArrowDownRight className="absolute -left-3 top-0 w-5 h-5 text-slate-600 bg-[#020617]" />
                <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed text-balance">
                  {data.manifesto}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: The Scrolling Capabilities --- */}
        <div className="lg:col-span-7 relative pl-8 md:pl-16">
          {/* THE TRACE LINE (Physical scroll connection) */}
          <div className="absolute left-0 top-4 bottom-0 w-px bg-slate-800/50">
            {/* Glowing active segment that follows scroll */}
            <motion.div
              style={{ height: traceHeight }}
              className="absolute top-0 left-[-1px] w-[3px] bg-gradient-to-b from-transparent via-orange-500 to-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"
            />
          </div>

          {/* Render each Capability as a structural node */}
          <div className="flex flex-col gap-24">
            {data.capabilities.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-150px" }}
                transition={{
                  duration: 0.8,
                  delay: 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative group"
              >
                {/* Node dot on the Trace Line */}
                <div className="absolute top-2 -left-[37px] md:-left-[69px] w-3 h-3 rounded-full border-2 border-[#020617] bg-slate-700 group-hover:bg-orange-400 transition-colors duration-500 z-10" />

                {/* Capability Header */}
                <div className="mb-4">
                  <span className="text-xs font-mono text-slate-600 tracking-widest block mb-3">
                    {item.id}
                  </span>

                  {/* Special rendering for the massive 90.36% stat */}
                  {item.metric && (
                    <div className="text-6xl md:text-7xl font-cal font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-500 tracking-tight mb-2">
                      {item.metric}
                    </div>
                  )}

                  <h4 className="text-2xl md:text-3xl font-cal text-slate-100 tracking-tight">
                    {item.title}
                  </h4>
                </div>

                {/* Subtitle / Tech Stack Tags */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-sm font-medium text-slate-300 mb-6">
                  {item.subtitle}
                </div>

                {/* Description */}
                <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-xl font-light">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
