"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ShieldCheck, Cpu } from "lucide-react";
import { useRef } from "react";

type Skills = {
  frontend: string[];
  backend: string[];
  devops: string[];
};

type Cert = {
  issuer: string;
  title: string;
  date: string;
};

const DataStream = ({ items, reverse = false, speed = 40 }: { items: string[]; reverse?: boolean; speed?: number; }) => {
  const duplicatedItems = [...items, ...items, ...items];
  return (
    <div className="relative flex w-full overflow-hidden py-3 group border-y border-slate-800/50 bg-[#020617] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        animate={{ x: reverse ? ["-33.33%", "0%"] : ["0%", "-33.33%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
        className="flex shrink-0 gap-8 pr-8"
      >
        {duplicatedItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 text-slate-500 font-mono text-sm uppercase tracking-widest hover:text-[#3B82F6] transition-colors cursor-crosshair">
            <span className="text-slate-800">{"//"}</span>
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function Engine({ skills, certs }: { skills: Skills; certs: Cert[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start center", "end center"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const dotY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const fillY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="engine" ref={sectionRef} className="relative w-full py-32 z-20">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        {/* CENTER TRACE LINE */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800 hidden md:block -translate-x-1/2">
          <motion.div style={{ height: fillY }} className="w-full bg-slate-700/50 origin-top" />
        </div>

        {/* DATA PACKET (FOLLOWING DOT) */}
        <motion.div
          style={{ top: dotY }}
          className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-[#020617] border-2 border-[#F97316] rounded-full hidden md:flex items-center justify-center z-50 shadow-[0_0_20px_rgba(249,115,22,0.8)]"
        >
          <div className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-pulse" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-5 h-5 text-[#3B82F6]" />
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              System Specifications // Core Technologies
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-space font-bold text-slate-100 tracking-tighter leading-[1]">
            The <span className="text-slate-600">Engine.</span>
          </h2>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="relative w-full mb-32 flex flex-col">
        <DataStream items={skills.backend} speed={35} />
        <DataStream items={skills.frontend} speed={40} reverse={true} />
        <DataStream items={skills.devops} speed={45} />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-800 pb-4">
          <h3 className="text-xs font-mono text-[#F97316] uppercase tracking-widest flex items-center gap-3">
            <ShieldCheck className="w-4 h-4" /> Compliance Matrix
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map((cert, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: idx * 0.05 }}
              className="group relative flex flex-col p-6 bg-[#020617] border border-slate-800 hover:border-[#3B82F6] transition-colors duration-300"
            >
              <div className="absolute top-1 left-1 w-1 h-1 bg-slate-800 group-hover:bg-[#3B82F6]" />
              <div className="absolute bottom-1 right-1 w-1 h-1 bg-slate-800 group-hover:bg-[#3B82F6]" />

              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-mono text-[#F97316] tracking-widest uppercase bg-[#F97316]/10 px-2 py-1 border border-[#F97316]/20">
                  {cert.issuer}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{cert.date}</span>
              </div>
              
              <h4 className="text-lg font-space font-bold text-slate-200 leading-tight mb-8 group-hover:text-[#3B82F6] transition-colors">
                {cert.title}
              </h4>
              
              <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-800/50">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Status: Verified</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  );
}
