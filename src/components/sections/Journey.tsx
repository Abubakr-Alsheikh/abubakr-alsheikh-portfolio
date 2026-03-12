"use client";

import { motion } from "framer-motion";

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
      <div className="max-w-7xl mx-auto relative">
        
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24 text-right">
          <div className="flex items-center justify-end gap-3 mb-6">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Operations Log <span className="text-slate-700">|</span> Trajectory
            </span>
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          </div>
          <h2 className="text-5xl md:text-7xl font-space font-bold text-slate-100 tracking-tighter leading-[1]">
            The <span className="text-slate-600">Timeline.</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-20 md:gap-32 mt-16">
          {data.map((item, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex flex-col md:w-[70%] group ${
                  isEven ? "md:ml-auto md:items-end md:text-right" : "md:mr-auto md:items-start md:text-left"
                }`}
              >
                <div className={`absolute top-0 text-[10px] font-mono text-slate-700 tracking-widest uppercase hidden md:block ${
                  isEven ? "-left-32" : "-right-32"
                }`}>
                  LAT. {Math.floor(Math.random() * 90)}° N <br/>
                  LONG. {Math.floor(Math.random() * 180)}° E
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-none bg-orange-500/10 border border-orange-500/30 text-xs font-mono text-orange-400 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {item.date}
                </div>

                <span className="text-sm font-mono text-slate-500 uppercase tracking-wide mb-2">
                  {item.subtitle}
                </span>

                <h3 className="text-3xl md:text-5xl font-space font-bold text-slate-100 mb-6 tracking-tight group-hover:text-orange-300 transition-colors duration-500">
                  {item.title}
                </h3>

                <p className={`text-slate-400 text-lg leading-relaxed mb-8 font-light ${
                  isEven ? "md:pl-12" : "md:pr-12"
                }`}>
                  {item.description}
                </p>

                <div className={`flex flex-wrap gap-2 ${isEven ? "md:justify-end" : "md:justify-start"}`}>
                  {item.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-white/[0.02] border border-white/10 text-xs font-mono text-slate-400 hover:text-orange-400 hover:border-orange-500/50 transition-colors duration-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
