"use client";

import { useState, FormEvent, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Send, TerminalSquare, CheckCircle2 } from "lucide-react";

const PlanetCurvature = () => (
  <div className="absolute bottom-0 left-0 right-0 w-full h-[50vh] overflow-hidden pointer-events-none z-0 flex justify-center items-end">
    <svg
      viewBox="0 0 100 20"
      className="w-[150%] min-w-[1200px] h-auto"
      preserveAspectRatio="none"
    >
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
      <path
        d="M0,20 Q50,2 100,20"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="0.05"
        strokeDasharray="1 3"
        opacity="0.3"
      />
    </svg>
  </div>
);

export default function Horizon() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">(
    "idle",
  );
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // The line fills completely to 100%, plunging directly into the bottom footer
  const fillHeight = useTransform(smooth, [0, 1], ["0%", "100%"]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    setTimeout(() => setFormState("success"), 1500);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full flex flex-col items-center justify-between z-20 overflow-hidden min-h-[100dvh]"
    >
      <PlanetCurvature />

      {/* Main Content Area (Relative for the Trace Line) */}
      <div className="w-full max-w-7xl mx-auto relative pt-32 pb-32 px-6 md:px-12 flex-1 flex flex-col justify-center">
        {/* CENTER TRACE LINE - Final Grounding Sequence */}
        {/* Note: It goes exactly from top-0 to bottom-0 of THIS container */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/50 hidden md:block -translate-x-1/2 z-0">
          <motion.div
            style={{ height: fillHeight }}
            className="w-full bg-[#F97316] origin-top relative shadow-[0_0_15px_#F97316]"
          >
            {/* The Data Packet perfectly fixed to the tip */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#F97316] rounded-full flex items-center justify-center shadow-[0_0_10px_#F97316]">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </motion.div>
        </div>

        {/* Content Split: Left Text, Right Form */}
        {/* FIX: Set md:gap-24 explicitly. This means the gap is 6rem. Half of 6rem is 3rem. */}
        <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* Left Side: Call to Action */}
          <div className="flex flex-col pr-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-8"
            >
              <TerminalSquare className="w-5 h-5 text-[#F97316]" />
              <span className="text-xs font-mono text-[#F97316] uppercase tracking-widest">
                SYS.COMMS // Secure Channel
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl lg:text-8xl font-space font-bold text-slate-100 tracking-tighter leading-[0.95] mb-8"
            >
              Initiate <br />
              <span className="text-slate-600">Connection.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm md:text-base text-slate-400 font-mono font-light leading-relaxed max-w-md border-l-2 border-[#3B82F6] pl-6"
            >
              The descent is complete. The architecture is reviewed. If you need
              a scalable Django backend or a fluid Next.js frontend—transmit
              your payload.
            </motion.p>
          </div>

          {/* Right Side: The Terminal Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full relative group"
          >
            {/* FIX: Perfect Math Connector. Gap is 24 (6rem). So the left edge is EXACTLY 3rem from the center line. */}
            <div className="hidden md:block absolute top-[50%] -left-[3rem] w-[3rem] h-px bg-slate-800 group-hover:bg-[#F97316] transition-colors duration-500 z-0" />

            {/* FIX: Hardware node sits EXACTLY on the intersection of the center trace line */}
            <div className="hidden md:block absolute top-[50%] -left-[3rem] w-2 h-2 rounded-sm bg-[#020617] border border-slate-800 group-hover:border-[#F97316] transition-colors duration-500 -translate-x-[4px] -translate-y-[3.5px] z-10" />

            <div className="bg-[#020617] border border-slate-800 p-8 relative z-10 group-hover:border-[#F97316]/50 transition-colors duration-500">
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#F97316]" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#F97316]" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#F97316]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#F97316]" />

              {formState === "success" ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="w-12 h-12 text-[#3B82F6] mb-6" />
                  <h3 className="text-xl font-space font-bold text-slate-100 mb-2 tracking-widest uppercase">
                    Payload Delivered
                  </h3>
                  <p className="text-slate-500 font-mono text-xs tracking-widest uppercase">
                    Awaiting decode sequence...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                      IDENTIFIER // Name
                    </label>
                    <input
                      required
                      className="w-full bg-[#020617] border-b border-slate-800 px-0 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-[#3B82F6] transition-colors"
                      placeholder="Enter designation..."
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                      RETURN_ROUTE // Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full bg-[#020617] border-b border-slate-800 px-0 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-[#3B82F6] transition-colors"
                      placeholder="system@domain.com"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                      DATA_PAYLOAD // Objective
                    </label>
                    <textarea
                      rows={4}
                      required
                      className="w-full bg-[#020617] border border-slate-800 mt-2 px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
                      placeholder="Describe the architecture required..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 mt-4 bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] hover:bg-[#F97316] hover:text-[#020617] font-mono text-xs tracking-widest uppercase transition-all flex justify-center items-center gap-3 group/btn"
                  >
                    {formState === "submitting"
                      ? "Transmitting..."
                      : "Transmit Payload"}
                    <Send className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* PREMIUM FOOTER / GROUND STATION */}
      {/* Sits completely flush with the bottom of the container above it */}
      <div className="w-full border-t border-slate-800 bg-[#020617]/90 backdrop-blur-md relative z-30">
        {/* The Hardware Grounding Port (The trace line physically drops directly into this socket) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-3 bg-[#020617] border border-slate-800 hidden md:flex items-center justify-center">
          <div className="w-3 h-1 bg-[#F97316] shadow-[0_0_10px_#F97316]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Side: System Status */}
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse shadow-[0_0_8px_#F97316]" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              SYS.ONLINE // {new Date().getFullYear()} Abubakr Alsheikh
            </span>
          </div>

          {/* Right Side: Telemetry Tags */}
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <span className="hover:text-[#3B82F6] transition-colors cursor-crosshair hidden sm:block">
              [ REACT_CORE ]
            </span>
            <span className="hover:text-[#3B82F6] transition-colors cursor-crosshair">
              [ NEXT.JS_ENGINE ]
            </span>
            <span className="hover:text-[#3B82F6] transition-colors cursor-crosshair hidden md:block">
              [ ORBITAL_STABLE ]
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
