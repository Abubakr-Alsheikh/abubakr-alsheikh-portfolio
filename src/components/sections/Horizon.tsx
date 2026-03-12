"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, TerminalSquare, CheckCircle2 } from "lucide-react";

const PlanetCurvature = () => (
  <div className="absolute bottom-0 left-0 right-0 w-full h-[50vh] overflow-hidden pointer-events-none z-0 flex justify-center items-end">
    <svg viewBox="0 0 100 20" className="w-[150%] min-w-[1200px] h-auto" preserveAspectRatio="none">
      <path 
        d="M0,20 Q50,0 100,20 Z" 
        fill="#020617" 
        stroke="#1E293B" 
        strokeWidth="0.1" 
      />
      <motion.path 
        d="M0,20 Q50,0 100,20" 
        fill="none" 
        stroke="#F97316" 
        strokeWidth="0.15"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="drop-shadow-[0_-5px_15px_rgba(249,115,22,0.4)]"
      />
      <path d="M0,20 Q50,2 100,20" fill="none" stroke="#3B82F6" strokeWidth="0.05" strokeDasharray="1 3" opacity="0.3" />
      <path d="M0,20 Q50,5 100,20" fill="none" stroke="#3B82F6" strokeWidth="0.02" strokeDasharray="0.5 1" opacity="0.1" />
    </svg>
  </div>
);

export default function Horizon() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    setTimeout(() => setFormState("success"), 1500);
  };

  return (
    <section id="contact" className="relative w-full min-h-[100dvh] flex flex-col justify-between pt-32 pb-10 px-6 md:px-12 lg:px-20 z-20 overflow-hidden">
      
      <PlanetCurvature />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mt-10 lg:pl-[6.5rem]">
        
        <div className="lg:col-span-6 flex flex-col">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-3 mb-8">
            <TerminalSquare className="w-5 h-5 text-[#F97316]" />
            <span className="text-xs font-mono text-[#F97316] uppercase tracking-widest">
              SYS.COMMS // Secure Channel
            </span>
          </motion.div>

          <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-5xl md:text-7xl lg:text-8xl font-space font-bold text-slate-100 tracking-tighter leading-[0.95] mb-8">
            Initiate <br />
            <span className="text-slate-600">
              Connection.
            </span>
          </motion.h2>
          
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-sm md:text-base text-slate-400 font-mono font-light leading-relaxed max-w-md border-l-2 border-[#3B82F6] pl-6">
            The descent is complete. The architecture is reviewed. If you need a scalable Django backend or a fluid Next.js frontend—transmit your payload.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-6 w-full max-w-lg lg:ml-auto">
          <div className="bg-[#020617] border border-slate-800 p-8 relative">
            
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#F97316]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#F97316]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#F97316]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#F97316]" />

            {formState === "success" ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#3B82F6] mb-6" />
                <h3 className="text-xl font-space font-bold text-slate-100 mb-2 tracking-widest uppercase">Payload Delivered</h3>
                <p className="text-slate-500 font-mono text-xs tracking-widest uppercase">Awaiting decode sequence...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">IDENTIFIER // Name</label>
                  <input required className="w-full bg-[#020617] border-b border-slate-800 px-0 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-[#3B82F6] transition-colors" placeholder="Enter designation..." />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">RETURN_ROUTE // Email</label>
                  <input type="email" required className="w-full bg-[#020617] border-b border-slate-800 px-0 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-[#3B82F6] transition-colors" placeholder="system@domain.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">DATA_PAYLOAD // Objective</label>
                  <textarea rows={4} required className="w-full bg-[#020617] border border-slate-800 mt-2 px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-[#3B82F6] transition-colors resize-none" placeholder="Describe the architecture required..." />
                </div>
                <button type="submit" className="w-full py-4 mt-4 bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] hover:bg-[#F97316] hover:text-[#020617] font-mono text-xs tracking-widest uppercase transition-all flex justify-center items-center gap-3 group">
                  {formState === "submitting" ? "Transmitting..." : "Transmit Payload"} 
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto border-t border-slate-800 pt-8 mt-24 flex flex-col md:flex-row items-center justify-between gap-6 lg:pl-[6.5rem]">
        <div className="text-slate-600 text-[10px] font-mono uppercase tracking-widest">
          © {new Date().getFullYear()} Abubakr Alsheikh <span className="text-slate-800 mx-2">|</span> Next.js Engine Active
        </div>
      </div>

    </section>
  );
}
