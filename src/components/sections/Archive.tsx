"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Database } from "lucide-react";
import { useRef } from "react";
import GeometricNeptune from "@/components/visuals/GeometricNeptune";

type ArchiveProject = {
  title: string;
  description: string;
  stack: string[];
  link: string;
};

export default function Archive({ projects }: { projects: ArchiveProject[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const fillHeight = useTransform(smooth, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="archive"
      ref={sectionRef}
      className="relative w-full flex justify-center z-0"
    >
      <GeometricNeptune />

      <div className="w-full max-w-7xl mx-auto relative pt-16 pb-16">
        {/* LEFT TRACE LINE */}
        <div className="absolute left-[4rem] top-0 bottom-0 w-px bg-slate-800/50 hidden md:block z-0">
          <motion.div
            style={{ height: fillHeight }}
            className="w-full bg-[#3B82F6] origin-top relative shadow-[0_0_15px_#3B82F6]"
          >
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#3B82F6] rounded-full flex items-center justify-center shadow-[0_0_10px_#3B82F6]">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </motion.div>
        </div>

        <div className="pl-6 md:pl-[8rem] pr-6 md:pr-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="text-xs font-mono text-[#3B82F6] uppercase tracking-widest flex items-center gap-3">
              <Database className="w-4 h-4" />
              System Logs // Legacy Architectures
            </h3>
          </motion.div>

          <div className="flex flex-col border-t-2 border-slate-800">
            {projects.map((project, idx) => (
              <motion.a
                key={idx}
                href={project.link !== "#" ? project.link : undefined}
                target={project.link !== "#" ? "_blank" : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`group relative grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 border-b border-slate-800 transition-colors duration-300 ${
                  project.link !== "#"
                    ? "hover:bg-[#3B82F6]/5 cursor-pointer"
                    : "cursor-default"
                }`}
              >
                {/* Horizontal Hardware Connector */}
                <div className="hidden md:block absolute top-1/2 -left-[4rem] w-[4rem] h-px bg-slate-800 group-hover:bg-[#3B82F6] transition-colors duration-500 -translate-y-1/2 z-0" />
                <div className="hidden md:block absolute top-1/2 -left-[4rem] w-2 h-2 rounded-sm bg-[#020617] border border-slate-800 group-hover:border-[#3B82F6] transition-colors duration-500 -translate-x-[4px] -translate-y-[4px] z-10" />

                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="md:col-span-6 pl-6">
                  <h4 className="text-xl font-space font-bold text-slate-200 mb-2 group-hover:text-[#F97316] transition-colors">
                    {project.title}
                  </h4>
                  <p className="text-slate-400 text-sm font-mono leading-relaxed line-clamp-2 md:line-clamp-none pr-4">
                    {project.description}
                  </p>
                </div>

                <div className="md:col-span-5 pl-6 md:pl-0">
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] md:text-xs font-mono text-slate-500">
                    {project.stack.map((s, i) => (
                      <span key={i} className="flex items-center">
                        <span className="group-hover:text-slate-300 transition-colors">
                          [{s}]
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-1 hidden md:flex justify-end pr-6">
                  {project.link !== "#" && (
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-[#F97316] group-hover:translate-x-2 transition-all" />
                  )}
                </div>
              </motion.a>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 flex items-center justify-between"
          >
            <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">
              EOF // End of Logs
            </p>
            <a
              href="https://github.com/Abubakr-Alsheikh"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[#3B82F6] hover:text-[#F97316] font-mono text-xs uppercase tracking-widest transition-colors group"
            >
              Inspect Full Repository
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
