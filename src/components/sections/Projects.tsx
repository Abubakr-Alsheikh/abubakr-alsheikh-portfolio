"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowUpRight, Github, Rocket } from "lucide-react";
import { useRef } from "react";
import SystemWindowPlaceholder from "@/components/visuals/SystemWindowPlaceholder";

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
      
      <div className="w-full max-w-7xl mx-auto relative pt-16 pb-16">
        
        <div className="absolute left-[4rem] top-0 bottom-0 w-px bg-slate-800/50 hidden md:block z-0">
          <motion.div style={{ height: fillHeight }} className="w-full bg-[#3B82F6] origin-top relative shadow-[0_0_15px_#3B82F6]">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#3B82F6] rounded-full flex items-center justify-center shadow-[0_0_10px_#3B82F6]">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </motion.div>
        </div>

        <div className="pl-6 md:pl-[8rem] pr-6 md:pr-12 relative z-10">
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
                
                <div className="hidden md:block absolute top-[40px] -left-[4rem] w-[4rem] h-px bg-slate-800 group-hover:bg-[#3B82F6] transition-colors duration-500 z-0" />
                <div className="hidden md:block absolute top-[40px] -left-[4rem] w-2 h-2 rounded-sm bg-[#020617] border border-slate-800 group-hover:border-[#3B82F6] transition-colors duration-500 -translate-x-[4px] -translate-y-[3.5px] z-10" />
                
                <div className="absolute left-[-28px] top-[40px] w-2 h-2 rounded-full bg-[#020617] border border-[#3B82F6] md:hidden z-10" />

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
