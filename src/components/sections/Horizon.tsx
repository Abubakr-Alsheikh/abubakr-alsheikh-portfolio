"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, TerminalSquare, CheckCircle2 } from "lucide-react";

export default function Horizon() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    setTimeout(() => setFormState("success"), 1500);
  };

  return (
    <section id="contact" className="relative w-full min-h-[100dvh] flex flex-col justify-between pt-32 pb-10 px-6 md:px-12 lg:px-20 z-20 overflow-hidden">
      
      <div className="absolute bottom-0 left-0 right-0 w-full h-[80vh] pointer-events-none z-0 overflow-hidden flex justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 200 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute bottom-[-20%] w-[150vw] h-[150vw] max-w-[1500px] max-h-[1500px] bg-gradient-to-t from-orange-500 via-orange-600/30 to-transparent rounded-full blur-[100px] mix-blend-screen" 
        />
        <svg viewBox="0 0 100 20" className="absolute bottom-0 w-full min-w-[1000px] h-auto fill-orange-950/80 stroke-orange-500/50">
          <path d="M0,20 Q50,0 100,20 Z" strokeWidth="0.2" />
          <path d="M0,20 Q50,5 100,20 Z" strokeWidth="0.1" strokeDasharray="1 2" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mt-10">
        
        <div className="lg:col-span-6 flex flex-col">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-3 mb-8">
            <TerminalSquare className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest">
              SYS.COMMS // Secure Channel
            </span>
          </motion.div>

          <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-5xl md:text-7xl lg:text-8xl font-space font-bold text-slate-100 tracking-tighter leading-[0.95] mb-8 drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            Initiate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500">
              Connection.
            </span>
          </motion.h2>
          
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-lg md:text-xl text-orange-100/70 font-mono leading-relaxed max-w-md">
            The descent is complete. If you need a scalable Django backend or a fluid Next.js frontend—transmit your payload.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-6 w-full max-w-lg lg:ml-auto">
          <div className="bg-[#0A0F1C]/60 backdrop-blur-2xl border border-orange-500/30 rounded-3xl p-8 relative shadow-[0_0_50px_rgba(249,115,22,0.1)]">
            {formState === "success" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-orange-400 mb-6" />
                <h3 className="text-2xl font-space text-slate-100 mb-2">Payload Delivered</h3>
                <p className="text-slate-400 font-mono text-sm">Transmission successful. Awaiting decode sequence.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono text-orange-400 tracking-widest uppercase">IDENTIFIER // Name</label>
                  <input required className="w-full bg-slate-900/50 border border-orange-500/20 rounded-xl px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-orange-500 transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono text-orange-400 tracking-widest uppercase">RETURN_ROUTE // Email</label>
                  <input type="email" required className="w-full bg-slate-900/50 border border-orange-500/20 rounded-xl px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-orange-500 transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono text-orange-400 tracking-widest uppercase">DATA_PAYLOAD // Objective</label>
                  <textarea rows={4} required className="w-full bg-slate-900/50 border border-orange-500/20 rounded-xl px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none" />
                </div>
                <button type="submit" className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-space tracking-widest uppercase hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all flex justify-center items-center gap-2">
                  {formState === "submitting" ? "Transmitting..." : "Transmit"} <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto border-t border-orange-500/20 pt-8 mt-24 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-orange-200/50 text-[11px] font-mono uppercase tracking-widest">
          © {new Date().getFullYear()} Abubakr Alsheikh | Next.js Engine Active
        </div>
      </div>
    </section>
  );
}
