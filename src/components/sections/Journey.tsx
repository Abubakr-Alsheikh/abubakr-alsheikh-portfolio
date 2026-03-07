"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type JourneyItem = {
  date: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
};

export default function Journey({ data }: { data: JourneyItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Continue the scroll trace to the bottom of the timeline
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"],
  });

  // The glowing line grows down as you scroll
  const traceHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  // Fade out at the very end to signal the end of the timeline
  const traceOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);

  return (
    <section
      id="journey"
      ref={containerRef}
      className="relative w-full py-32 bg-[#020617] px-6 md:px-12 lg:px-20 z-20"
    >
      {/* --- THE UNBROKEN TRACE LINE --- */}
      <div className="absolute left-6 md:left-[5.2rem] top-0 bottom-0 w-px bg-slate-800/50 hidden lg:block">
        <motion.div
          style={{ height: traceHeight, opacity: traceOpacity }}
          className="absolute top-0 left-[-1px] w-[3px] bg-gradient-to-b from-orange-500 via-orange-500 to-transparent shadow-[0_0_15px_rgba(249,115,22,0.6)]"
        />
      </div>

      <div className="max-w-7xl mx-auto relative lg:pl-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              Operations Log <span className="text-slate-700">//</span> Career &
              Academics
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-cal text-slate-100 tracking-tight leading-[1.1]">
            The <span className="text-slate-600">Timeline.</span>
          </h2>
        </motion.div>

        {/* The Timeline Entries */}
        <div className="flex flex-col gap-16 md:gap-24">
          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 group"
            >
              {/* Node dot on the Trace Line (Visible on Desktop) */}
              <div className="absolute top-2 -left-[69px] w-3 h-3 rounded-full border-2 border-[#020617] bg-slate-700 group-hover:bg-orange-400 transition-colors duration-500 z-10 hidden lg:block" />

              {/* Left Column: Date & Subtitle */}
              <div className="md:col-span-4 flex flex-col md:text-right md:border-r border-slate-800/50 md:pr-12 pt-1 md:pt-2">
                <span className="text-sm font-mono text-orange-500 tracking-widest mb-2">
                  {item.date}
                </span>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  {item.subtitle}
                </span>
              </div>

              {/* Right Column: Title, Description, Tags */}
              <div className="md:col-span-8 flex flex-col">
                <h3 className="text-3xl md:text-4xl font-cal text-slate-100 mb-6 tracking-tight group-hover:text-orange-400 transition-colors duration-300">
                  {item.title}
                </h3>

                <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 font-light max-w-2xl text-balance">
                  {item.description}
                </p>

                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-x-3 gap-y-2">
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-slate-800/20 border border-slate-700/50 text-xs font-mono text-slate-400 group-hover:border-slate-600 group-hover:text-slate-300 transition-colors duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
