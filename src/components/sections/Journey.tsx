"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

type JourneyItem = {
  date: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
};

export default function Journey({ data }: { data: JourneyItem[] }) {
  return (
    <section id="journey" className="relative w-full py-32 px-6 md:px-12 lg:px-20 z-20">
      <div className="max-w-7xl mx-auto relative lg:pl-[6.5rem]">
        
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-5 h-5 text-[#F97316]" />
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Operations Log // Career Trajectory
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-space font-bold text-slate-100 tracking-tighter leading-[1]">
            The <span className="text-slate-600">Timeline.</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-12 relative">
          
          <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-800 md:hidden" />

          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative pl-8 md:pl-0 group"
            >
              <div className="absolute left-[-4px] top-6 w-2 h-2 rounded-full bg-[#020617] border border-[#F97316] md:hidden" />
              
              <div className="hidden md:block absolute top-[28px] -left-[6.5rem] w-[6.5rem] h-px bg-slate-800 group-hover:bg-[#F97316] transition-colors duration-500">
                <div className="absolute left-0 top-[-3px] w-1.5 h-1.5 bg-[#020617] border border-[#F97316] group-hover:bg-[#F97316] transition-colors" />
              </div>

              <div className="relative border border-slate-800 bg-[#020617] p-6 md:p-8 hover:border-[#3B82F6]/50 transition-colors duration-300">
                
                <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-slate-800 group-hover:bg-[#3B82F6] transition-colors" />
                <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-slate-800 group-hover:bg-[#3B82F6] transition-colors" />
                <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-slate-800 group-hover:bg-[#3B82F6] transition-colors" />
                <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-slate-800 group-hover:bg-[#3B82F6] transition-colors" />

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-mono text-[#F97316] uppercase tracking-widest block mb-2">
                      {item.date}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-space font-bold text-slate-100 group-hover:text-[#3B82F6] transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <div className="inline-flex px-3 py-1 bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-widest self-start">
                    {item.subtitle}
                  </div>
                </div>

                <p className="text-slate-400 text-sm md:text-base leading-relaxed font-mono font-light mb-8 max-w-3xl">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-6">
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors"
                    >
                      {i !== 0 && <span className="text-slate-800 mr-2">|</span>}
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
