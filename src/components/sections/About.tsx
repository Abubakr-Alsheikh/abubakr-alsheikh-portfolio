"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";
import { BrainCircuit, GraduationCap, MapPin, Code2 } from "lucide-react";

type AboutData = {
  aiArchitecture: string;
  grade: string;
  diploma: string;
  location: string;
  languages: string;
  scholar: string;
  frontend: string;
};

function BentoCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
      onMouseMove={handleMouseMove}
      className={`relative group rounded-3xl border border-slate-800 bg-[#0F172A]/80 overflow-hidden ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(249, 115, 22, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full w-full p-8 flex flex-col z-10">
        {children}
      </div>
    </motion.div>
  );
}

export default function About({ data }: { data: AboutData }) {
  return (
    <section className="relative w-full py-32 bg-[#020617] text-white flex flex-col items-center px-6">
      <div className="text-center mb-16 md:mb-24 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
        >
          My{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-500">
            Core
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 max-w-xl mx-auto text-lg"
        >
          Bridging relentless learning with architectural precision.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
        <BentoCard className="md:col-span-2" delay={0.1}>
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <span className="text-xs font-mono text-slate-500 border border-slate-800 bg-slate-900/50 px-3 py-1 rounded-full">
              Backend System Design
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-3 text-slate-100">
            Architecting Intelligence
          </h3>
          <p className="text-slate-400 max-w-md text-lg leading-relaxed">
            {data.aiArchitecture}
          </p>
        </BentoCard>

        <BentoCard
          className="md:col-span-1 flex flex-col justify-center items-center text-center group"
          delay={0.2}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-[60px] rounded-full group-hover:bg-orange-500/30 transition-colors pointer-events-none" />
          <h3 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            {data.grade}
          </h3>
          <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 px-4 py-2 rounded-full text-sm font-semibold text-orange-200 mb-3">
            <GraduationCap className="w-4 h-4" />
            <span>1st Graduate</span>
          </div>
          <p className="text-slate-400 font-medium">
            {data.diploma.split("•")[1].trim()}
          </p>
        </BentoCard>

        <BentoCard className="md:col-span-1" delay={0.3}>
          <div className="p-3 w-fit rounded-2xl bg-slate-800/50 border border-slate-700 text-slate-300 mb-auto relative">
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <MapPin className="w-6 h-6" />
          </div>
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-white mb-2">
              {data.location}
            </h3>
            <div className="flex flex-col gap-1 text-slate-400 text-sm font-medium">
              {data.languages.split("•").map((lang, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  {lang.trim()}
                </span>
              ))}
            </div>
          </div>
        </BentoCard>

        <BentoCard className="md:col-span-1" delay={0.4}>
          <div className="p-3 w-fit rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-100">
            Concurrent Scholar
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {data.scholar}
          </p>
        </BentoCard>

        <BentoCard className="md:col-span-1" delay={0.5}>
          <div className="p-3 w-fit rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-6">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-100">
            Type-Safe UIs
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {data.frontend}
          </p>
        </BentoCard>
      </div>
    </section>
  );
}
