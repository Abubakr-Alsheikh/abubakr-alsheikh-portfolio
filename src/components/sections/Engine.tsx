"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck } from "lucide-react";

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

// --- Sub-Component: Linear Data Stream (Framer Motion Marquee) ---
const DataStream = ({
  items,
  reverse = false,
  speed = 40,
}: {
  items: string[];
  reverse?: boolean;
  speed?: number;
}) => {
  // Tripling the array ensures a perfectly seamless infinite scroll
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="relative flex w-full overflow-hidden py-3 group [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        animate={{ x: reverse ? ["-33.33%", "0%"] : ["0%", "-33.33%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
        className="flex shrink-0 gap-4 md:gap-6 pr-4 md:pr-6"
      >
        {duplicatedItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-5 py-2.5 rounded-none border border-slate-800 bg-[#0A0F1C] text-slate-400 font-mono text-xs md:text-sm uppercase tracking-widest hover:border-orange-500/50 hover:text-orange-400 hover:bg-orange-500/5 transition-colors duration-300 cursor-default"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-orange-500 transition-colors duration-300" />
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function Engine({
  skills,
  certs,
}: {
  skills: Skills;
  certs: Cert[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Continue the scroll trace to the bottom
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"],
  });

  // The glowing line grows down as you scroll
  const traceHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  // Fade out at the bottom
  const traceOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);

  return (
    <section
      id="engine"
      ref={containerRef}
      className="relative w-full py-32 bg-[#020617] px-6 md:px-12 lg:px-20 z-20"
    >
      {/* --- THE UNBROKEN TRACE LINE --- */}
      <div className="absolute left-6 md:left-[5.2rem] top-0 bottom-0 w-px bg-slate-800/50 hidden lg:block">
        <motion.div
          style={{ height: traceHeight, opacity: traceOpacity }}
          className="absolute top-0 left-[-1px] w-[3px] bg-gradient-to-b from-orange-500 via-orange-500 to-transparent shadow-[0_0_15px_rgba(249,115,22,0.6)]"
        />
      </div>

      <div className="max-w-7xl mx-auto relative lg:pl-16">
        {/* --- SECTION 1: SYSTEM SPECIFICATIONS (Skills) --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full border border-orange-500" />
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              System Specifications <span className="text-slate-700">//</span>{" "}
              Core Technologies
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-cal text-slate-100 tracking-tight leading-[1.1]">
            The <span className="text-slate-600">Engine.</span>
          </h2>
        </motion.div>

        {/* The Linear Data Streams */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative w-full border-y border-slate-800/50 py-8 mb-32 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px]"
        >
          <div className="flex flex-col gap-4">
            <DataStream items={skills.frontend} speed={40} />
            <DataStream items={skills.backend} speed={35} reverse={true} />
            <DataStream items={skills.devops} speed={45} />
          </div>
        </motion.div>

        {/* --- SECTION 2: COMPLIANCE MATRIX (Certifications) --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex items-center justify-between"
        >
          <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Authorization & Compliance
          </h3>
          <div className="hidden sm:block h-px flex-1 bg-slate-800/50 ml-6" />
        </motion.div>

        {/* The Certification Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {certs.map((cert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-6 border border-slate-800 bg-slate-900/20 hover:bg-slate-800/40 transition-colors duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Corner Accents (High-tech HUD feel) */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="mb-8 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono text-emerald-500/80 tracking-widest uppercase bg-emerald-500/10 px-2 py-1 border border-emerald-500/20">
                    {cert.issuer}
                  </span>
                  <span className="text-xs font-mono text-slate-600">
                    {cert.date}
                  </span>
                </div>

                <h4 className="text-lg md:text-xl font-cal text-slate-200 group-hover:text-emerald-400 transition-colors duration-300 leading-tight">
                  {cert.title}
                </h4>
              </div>

              {/* Status Footer */}
              <div className="pt-4 border-t border-slate-800/50 flex items-center gap-2 relative z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Status: Verified
                </span>
              </div>

              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
