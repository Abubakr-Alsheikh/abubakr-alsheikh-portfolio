"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowUpRight, Github, Rocket } from "lucide-react";
import { useRef } from "react";

const SystemWindowPlaceholder = ({ index, title }: { index: number; title: string }) => (
  <div className="relative w-full h-full min-h-[300px] xl:min-h-[400px] bg-[#020617] border border-slate-800 flex flex-col group overflow-hidden transition-colors duration-500 hover:border-[#3B82F6]/50">
    <div className="h-8 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/30">
      <div className="flex gap-2">
        <div className="w-2 h-2 bg-slate-700 border border-slate-600 group-hover:bg-red-500/50 transition-colors" />
        <div className="w-2 h-2 bg-slate-700 border border-slate-600 group-hover:bg-yellow-500/50 transition-colors delay-75" />
        <div className="w-2 h-2 bg-slate-700 border border-slate-600 group-hover:bg-emerald-500/50 transition-colors delay-150" />
      </div>
      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest truncate">vis_module_0{index + 1}.exe</span>
    </div>
    <div className="flex-1 relative flex items-center justify-center bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]">
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-700 group-hover:border-[#3B82F6] transition-colors" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-700 group-hover:border-[#3B82F6] transition-colors" />
      <div className="flex flex-col items-center gap-2">
        <span className="text-slate-700 group-hover:text-[#3B82F6] font-mono text-xs uppercase tracking-widest transition-colors">[ AWAITING_VISUAL_PAYLOAD ]</span>
        <span className="text-slate-800 font-mono text-[9px] uppercase tracking-widest">TARGET: {title}</span>
      </div>
    </div>
  </div>
);

type Project = {
  id: string;
  title: string;
  description: string;
  stack: string[];
  link: string;
};

export default function Projects({ data }: { data: Project[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start center", "end center"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const fillHeight = useTransform(smooth, [0, 1], ["0%", "100%"]);

  return (
    <section id="projects" ref={sectionRef} className="relative w-full flex justify-center z-20">
      
      {/* PADDING MOVED HERE */}
      <div className="w-full max-w-7xl relative pt-16 pb-16 px-6 md:px-12">
        
        {/* LEFT TRACE LINE */}
        <div className="absolute left-[4rem] top-0 bottom-0 w-px bg-slate-800/50 hidden md:block z-0">
          <motion.div style={{ height: fillHeight }} className="w-full bg-[#3B82F6] origin-top relative shadow-[0_0_15px_#3B82F6]">
            {/* The Data Packet perfectly fixed to the tip */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#3B82F6] rounded-full flex items-center justify-center shadow-[0_0_10px_#3B82F6]">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </motion.div>
        </div>

        {/* Content pushed exactly right to clear the left trace */}
        <div className="md:pl-[8rem] relative z-10">
          <div className="mb-24">
            <div className="flex items-center gap-3 mb-6">
              <Rocket className="w-5 h-5 text-[#3B82F6]" />
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">System Modules // Deployed Architectures</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-space font-bold text-slate-100 tracking-tighter leading-[1]">
              The <span className="text-slate-600">Arsenal.</span>
            </h2>
          </div>

          <div className="flex flex-col gap-24 lg:gap-32 relative">
            {data.map((project, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12 group">
                
                {/* Horizontal Hardware Connector to Trace Line */}
                <div className="hidden md:block absolute top-[40px] -left-[4rem] w-16 h-px bg-slate-800 group-hover:bg-[#3B82F6] transition-colors duration-500" />
                <div className="absolute left-[-28px] top-[40px] w-2 h-2 rounded-full bg-[#020617] border border-[#3B82F6] md:hidden" />

                {/* Left Card */}
                <div className="xl:col-span-5 flex flex-col relative z-10 order-2 xl:order-1 border border-slate-800 bg-[#020617] p-6 md:p-8 hover:border-[#3B82F6] transition-colors duration-300">
                  <div className="absolute top-2 left-2 w-1 h-1 bg-slate-800 group-hover:bg-[#3B82F6]" />
                  <div className="absolute bottom-2 right-2 w-1 h-1 bg-slate-800 group-hover:bg-[#3B82F6]" />

                  <span className="text-[10px] font-mono text-[#3B82F6] mb-6 tracking-widest uppercase block border-b border-slate-800/50 pb-4">{project.id}</span>
                  <h3 className="text-3xl md:text-4xl font-space font-bold text-slate-100 mb-6 tracking-tight leading-tight group-hover:text-[#3B82F6]">{project.title}</h3>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed font-mono font-light mb-8">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-x-3 gap-y-2 mb-10">
                    {project.stack.map((tech, i) => (
                      <span key={i} className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                        {i !== 0 && <span className="text-slate-800 mr-3">|</span>} [{tech}]
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-6 mt-auto">
                    {project.link !== "#" && (
                      <a href={project.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-slate-300 hover:text-[#3B82F6] group/link">
                        <Github className="w-4 h-4" /> <span>Execute Code</span>
                        <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Visual */}
                <div className="xl:col-span-7 relative w-full aspect-[4/3] xl:aspect-auto order-1 xl:order-2">
                  <SystemWindowPlaceholder index={index} title={project.title} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
