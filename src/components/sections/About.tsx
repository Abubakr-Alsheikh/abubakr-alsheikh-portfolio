"use client";

import { motion } from "framer-motion";
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
  return (
    <section id="about" className="relative w-full min-h-screen pt-24 pb-48 px-6 md:px-12 lg:px-20 z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
        
        <div className="lg:col-span-5 relative">
          <div className="sticky top-32 flex flex-col">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-sm font-mono text-blue-400 mb-6 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                CORE_ARCHITECTURE
              </h2>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-space text-slate-100 leading-[1] tracking-tighter mb-8">
                Precision in <br /><span className="text-slate-500">execution.</span>
              </h3>
              <div className="relative pl-6 border-l border-slate-800/50">
                <ArrowDownRight className="absolute -left-3 top-0 w-5 h-5 text-slate-600 bg-transparent" />
                <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed">
                  {data.manifesto}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8 lg:pl-16">
          {data.capabilities.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative group p-8 backdrop-blur-xl bg-white/[0.01] border border-white/5 rounded-3xl hover:bg-white/[0.03] transition-colors duration-500 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/10 rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/10 rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <span className="text-xs font-mono text-slate-500 tracking-widest block mb-4">
                {item.id}
              </span>
              
              {item.metric && (
                <div className="text-6xl md:text-7xl font-space font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-600 tracking-tighter mb-4">
                  {item.metric}
                </div>
              )}
              
              <h4 className="text-2xl md:text-3xl font-space text-slate-100 tracking-tight mb-4">
                {item.title}
              </h4>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/30 border border-slate-700/50 text-xs font-mono text-slate-300 mb-6">
                {item.subtitle}
              </div>
              
              <p className="text-slate-400 text-base leading-relaxed font-light">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
