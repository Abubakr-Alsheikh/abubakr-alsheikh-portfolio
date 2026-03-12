"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Cpu } from "lucide-react";
import TechFrame from "../shared/TechFrame";

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
    <div className="relative flex w-full overflow-hidden py-2 group [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      <motion.div
        animate={{ x: reverse ? ["-33.33%", "0%"] : ["0%", "-33.33%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
        className="flex shrink-0 gap-8 pr-8"
      >
        {duplicatedItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 text-slate-400 font-mono text-sm uppercase tracking-widest cursor-crosshair hover:text-purple-400 transition-colors">
            <span className="text-purple-500/50">{"//"}</span>
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function Engine({ skills, certs }: { skills: Skills; certs: Cert[] }) {
  return (
    <section id="engine" className="relative w-full py-32 px-6 md:px-12 lg:px-20 z-20">
      <div className="max-w-7xl mx-auto relative">
        
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="mb-20 md:w-2/3">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              System Specifications <span className="text-slate-700">|</span> Core Technologies
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-space font-bold text-slate-100 tracking-tighter leading-[1]">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-700">Engine.</span>
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="relative w-[110%] -ml-[5%] mb-32 py-10 border-y border-white/5 bg-black/20 backdrop-blur-sm shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] transform -skew-y-2">
          <div className="transform skew-y-2 flex flex-col gap-6">
            <DataStream items={skills.backend} speed={35} />
            <DataStream items={skills.frontend} speed={40} reverse={true} />
            <DataStream items={skills.devops} speed={45} />
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-800/50 pb-4">
          <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Compliance Matrix
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map((cert, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
              <TechFrame accentColor="text-emerald-500/50">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase bg-emerald-500/10 px-2 py-1 border border-emerald-500/20">
                    {cert.issuer}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{cert.date}</span>
                </div>
                <h4 className="text-lg font-space text-slate-200 leading-tight mb-8">
                  {cert.title}
                </h4>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Status: Verified</span>
                </div>
              </TechFrame>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
