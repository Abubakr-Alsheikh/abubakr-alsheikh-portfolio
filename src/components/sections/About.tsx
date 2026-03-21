"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import GeometricJupiter from "@/components/visuals/GeometricJupiter";

type Capability = {
  id: string;
  title: string;
  metric?: string;
  subtitle: string;
  description: string;
};

export default function About({
  data,
}: {
  data: { manifesto: string; capabilities: Capability[] };
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const fillHeight = useTransform(smooth, [0, 1], ["0%", "100%"]);

  return (
    <section id="about" ref={sectionRef} className="relative w-full flex justify-center bg-transparent z-20">
      <GeometricJupiter />

      <div className="w-full max-w-7xl relative pt-32 pb-16 px-6 md:px-12">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/50 hidden md:block -translate-x-1/2 z-0">
          <motion.div style={{ height: fillHeight }} className="w-full bg-[#F97316] origin-top relative shadow-[0_0_15px_#F97316]">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#F97316] rounded-full flex items-center justify-center shadow-[0_0_10px_#F97316]">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 relative z-10">
          
          <div className="relative h-full">
            <div className="sticky top-32 flex flex-col pr-8 pb-12">
              <div className="hidden md:block absolute top-[10px] -right-[3rem] w-12 h-px bg-slate-800" />
              
              <h2 className="text-xs font-mono text-[#3B82F6] mb-6 tracking-widest uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-sm bg-[#3B82F6] animate-pulse" />{" "}
                CORE_ARCHITECTURE
              </h2>
              <h3 className="text-5xl md:text-7xl font-space font-bold text-slate-100 leading-[1] tracking-tighter mb-8">
                Precision in <br />
                <span className="text-slate-600">execution.</span>
              </h3>
              <p className="text-lg text-slate-400 font-mono font-light leading-relaxed border-l-2 border-slate-800 pl-6">
                {data.manifesto}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-12 pt-8 md:pt-[20vh]">
            {data.capabilities.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative p-8 bg-[#020617] border border-slate-800 group hover:border-[#F97316]/50 transition-colors"
              >
                <div className="hidden md:block absolute top-12 -left-[3rem] w-12 h-px bg-slate-800 group-hover:bg-[#F97316] transition-colors" />
                <span className="text-[10px] font-mono text-[#F97316] block mb-6">
                  {item.id}
                </span>
                {item.metric && (
                  <div className="text-6xl font-space font-bold text-slate-200 mb-6">
                    {item.metric}
                  </div>
                )}
                <h4 className="text-2xl font-space text-slate-100 mb-4">
                  {item.title}
                </h4>
                <div className="inline-flex px-3 py-1 bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-6">
                  {item.subtitle}
                </div>
                <p className="text-slate-400 text-sm font-mono font-light">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
