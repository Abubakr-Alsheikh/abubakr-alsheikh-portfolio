"use client";
import { motion } from "framer-motion";
import { BadgeCheck, Cpu } from "lucide-react";

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

const MarqueeRow = ({ items, reverse = false }: { items: string[], reverse?: boolean }) => (
  <div className="flex w-full overflow-hidden group select-none">
    <div 
      className={`flex min-w-full shrink-0 gap-4 py-3 justify-around ${
        reverse ? 'animate-marquee-reverse' : 'animate-marquee'
      } group-hover:[animation-play-state:paused]`}
    >
      {items.map((item, idx) => (
        <TechPill key={`a-${idx}`} text={item} />
      ))}
      {items.map((item, idx) => (
        <TechPill key={`b-${idx}`} text={item} />
      ))}
    </div>
  </div>
);

const TechPill = ({ text }: { text: string }) => (
  <div className="px-6 py-3 rounded-full bg-[#0F172A] border border-slate-800 text-slate-300 font-mono font-medium whitespace-nowrap cursor-pointer hover:border-orange-500 hover:text-white hover:bg-slate-800 hover:scale-110 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]">
    {text}
  </div>
);

export default function Engine({ skills, certs }: { skills: Skills, certs: Cert[] }) {
  return (
    <section className="relative w-full py-32 bg-[#020617] overflow-hidden flex flex-col items-center">
      
      <div className="text-center mb-24 relative z-10 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-sm mb-4"
        >
          <Cpu className="w-4 h-4" />
          <span>Powered By</span>
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Engine</span>
        </motion.h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          The languages, frameworks, and certifications powering my architecture.
        </p>
      </div>

      <div className="relative w-full max-w-[100vw] overflow-hidden py-10 mb-20">
        
        <div className="flex flex-col gap-6 -rotate-2 scale-110 origin-center md:scale-105">
            
            <MarqueeRow items={skills.frontend} />
            
            <MarqueeRow items={skills.backend} reverse={true} />
            
            <MarqueeRow items={skills.devops} />

        </div>

        <div className="absolute inset-y-0 left-0 w-20 md:w-60 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 md:w-60 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="flex items-center gap-4 mb-8">
           <div className="h-px flex-1 bg-slate-800" />
           <span className="text-slate-500 font-mono text-sm tracking-widest uppercase">Global Certifications</span>
           <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {certs.map((cert, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               className="group relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-orange-500/50 hover:bg-slate-800/60 transition-all duration-300"
             >
                 <div className="absolute top-4 right-4 text-slate-600 group-hover:text-orange-500 transition-colors">
                    <BadgeCheck className="w-5 h-5" />
                 </div>
                 
                 <p className="text-xs font-mono text-orange-500 mb-2">{cert.issuer}</p>
                 <h4 className="text-slate-200 font-bold leading-tight mb-4 min-h-[3rem]">
                     {cert.title}
                 </h4>
                 <div className="text-xs text-slate-500 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                     <span>Issued</span>
                     <span className="font-mono text-slate-400">{cert.date}</span>
                 </div>
             </motion.div>
           ))}
        </div>
      </div>

    </section>
  );
}
