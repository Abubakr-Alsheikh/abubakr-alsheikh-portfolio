"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

type ArchiveProject = {
  title: string;
  description: string;
  stack: string[];
  link: string;
};

export default function Archive({ projects }: { projects: ArchiveProject[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Continue the scroll trace to the very end of the projects list
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"],
  });

  // The line grows, but we fade the opacity at the very bottom so it terminates cleanly
  const traceHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const traceOpacity = useTransform(scrollYProgress, [0.8, 1], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full pb-32 pt-10 bg-[#020617] px-6 md:px-12 lg:px-20 z-20"
    >
      {/* --- CONTINUING THE TRACE LINE --- */}
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
          className="mb-12"
        >
          <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest flex items-center gap-3">
            <span className="w-2 h-2 rounded-full border border-slate-500" />
            System Logs // Legacy Architectures
          </h3>
        </motion.div>

        {/* The Ledger (High-Density List) */}
        <div className="flex flex-col border-t border-slate-800/50">
          {projects.map((project, idx) => (
            <motion.a
              key={idx}
              href={project.link !== "#" ? project.link : undefined}
              target={project.link !== "#" ? "_blank" : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`group flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 py-6 md:py-8 border-b border-slate-800/50 transition-colors duration-300 ${
                project.link !== "#"
                  ? "hover:bg-white/[0.02] cursor-pointer"
                  : "cursor-default"
              }`}
            >
              {/* Left Side: Title & Description */}
              <div className="flex-1 md:pr-8">
                <h4 className="text-xl md:text-2xl font-cal text-slate-200 mb-2 group-hover:text-orange-400 transition-colors duration-300">
                  {project.title}
                </h4>
                <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Right Side: Stack & Arrow */}
              <div className="flex items-center justify-between md:justify-end gap-8 md:w-5/12 shrink-0">
                {/* Stack (Hidden on very small screens, turns into a clean mono list) */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] md:text-xs font-mono text-slate-500">
                  {project.stack.map((s, i) => (
                    <span key={i} className="flex items-center">
                      <span className="group-hover:text-slate-300 transition-colors duration-300">
                        {s}
                      </span>
                      {i < project.stack.length - 1 && (
                        <span className="mx-2 text-slate-700">/</span>
                      )}
                    </span>
                  ))}
                </div>

                {/* Interaction Arrow */}
                {project.link !== "#" && (
                  <div className="shrink-0 w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-orange-500/50 group-hover:bg-orange-500/10 transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                  </div>
                )}
              </div>
            </motion.a>
          ))}
        </div>

        {/* Global Action (Matches the exact style from the Hero/Projects) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
            {`// End of system logs`}
          </p>
          <a
            href="https://github.com/Abubakr-Alsheikh"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center gap-3 text-slate-400 font-medium py-2 overflow-hidden hover:text-slate-100 transition-colors"
          >
            <span className="relative z-10 text-sm tracking-wide uppercase">
              Inspect Full GitHub Repository
            </span>
            <ArrowUpRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-700 transition-opacity duration-300 group-hover:opacity-0" />
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-100 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
