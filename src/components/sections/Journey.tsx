"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, FileText, Terminal } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useTraceFill } from "@/hooks/useTraceFill";
import TracePacket from "@/components/shared/TracePacket";

import type { JourneyEntry } from "@/lib/data/journey";

export default function Journey({ data }: { data: JourneyEntry[] }) {
  const traceRef = useRef<HTMLDivElement>(null);
  const { fill, packetOpacity } = useTraceFill(traceRef);

  return (
    <section id="journey" className="relative w-full flex justify-center z-20">

      <div className="w-full max-w-7xl mx-auto relative pt-16 pb-16">
        
        <div
          ref={traceRef}
          className="absolute left-[4rem] top-0 bottom-0 w-px bg-slate-800/50 hidden md:block z-0"
        >
          <motion.div style={{ height: fill }} className="w-full bg-[#3B82F6] origin-top relative shadow-[0_0_15px_#3B82F6]">
            <TracePacket
              opacity={packetOpacity}
              label="JOURNEY"
              tone="blue"
            />
          </motion.div>
        </div>

        <div className="pl-6 md:pl-[8rem] pr-6 md:pr-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="w-5 h-5 text-[#F97316]" />
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Operations Log // Career Trajectory</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-space font-bold text-slate-100 tracking-tighter leading-[1]">
              The <span className="text-slate-600">Timeline.</span>
            </h2>
          </motion.div>

          <div className="flex flex-col gap-12 relative">
            <div className="absolute left-[-24px] top-0 bottom-0 w-px bg-slate-800 md:hidden" />

            {data.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className="relative pl-6 md:pl-0 group">
                <div className="absolute left-[-28px] top-6 w-2 h-2 rounded-full bg-[#020617] border border-[#F97316] md:hidden" />
                
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50% 0px -50% 0px" }}
                  className="absolute inset-0 pointer-events-none z-0 hidden md:block"
                >
                  <motion.div 
                    variants={{
                      hidden: { backgroundColor: "#020617", borderColor: "#1e293b" },
                      visible: { backgroundColor: "#F97316", borderColor: "#F97316", transition: { duration: 0.1 } }
                    }}
                    className="absolute top-[28px] -left-[4rem] w-2 h-2 rounded-sm -translate-x-[4px] -translate-y-[3.5px] z-10 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                  />
                  <div className="absolute top-[28px] -left-[4rem] w-[4rem] h-px bg-slate-800">
                    <motion.div
                      variants={{
                        hidden: { scaleX: 0 },
                        visible: { scaleX: 1, transition: { duration: 0.4, ease: "easeOut", delay: 0.1 } }
                      }}
                      className="w-full h-full bg-[#F97316] origin-left shadow-[0_0_10px_#F97316]"
                    />
                  </div>
                </motion.div>

                <div className="relative border border-slate-800 bg-[#020617]/85 backdrop-blur-sm p-6 md:p-8 hover:border-[#3B82F6]/50 transition-colors duration-300 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
                  
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50% 0px -50% 0px" }}
                    className="absolute inset-0 pointer-events-none hidden md:block"
                  >
                    <motion.div variants={{ hidden: { scaleY: 0 }, visible: { scaleY: 1, transition: { duration: 0.4, ease: "easeOut", delay: 0.5 } } }} className="absolute left-[-1px] top-0 bottom-[calc(100%-28px)] w-[2px] bg-[#F97316] origin-bottom shadow-[0_0_15px_#F97316]" />
                    <motion.div variants={{ hidden: { scaleY: 0 }, visible: { scaleY: 1, transition: { duration: 0.4, ease: "easeOut", delay: 0.5 } } }} className="absolute left-[-1px] top-[28px] bottom-0 w-[2px] bg-[#F97316] origin-top shadow-[0_0_15px_#F97316]" />
                  </motion.div>

                  <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-slate-800 group-hover:bg-[#3B82F6]" />
                  <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-slate-800 group-hover:bg-[#3B82F6]" />

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                      <span className="text-xs font-mono text-[#F97316] uppercase tracking-widest block mb-2">{item.date}</span>
                      <h3 className="text-2xl md:text-3xl font-space font-bold text-slate-100 group-hover:text-[#3B82F6] transition-colors">{item.title}</h3>
                    </div>
                    <div className="inline-flex px-3 py-1 bg-[#020617]/80 border border-slate-700 text-[10px] font-mono text-slate-400 uppercase tracking-widest self-start">{item.subtitle}</div>
                  </div>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed font-mono font-light mb-8 max-w-3xl">{item.description}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-4 border-t border-slate-800 pt-6">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{i !== 0 && <span className="text-slate-800 mr-2">|</span>} {tag}</span>
                    ))}
                    {item.caseStudy && (
                      <Link
                        href={`/projects/${item.caseStudy}`}
                        data-hud-target="JRNY.CASE"
                        className="md:ml-auto flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#F97316] hover:text-slate-100 transition-colors group/link"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Case_Study</span>
                        <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
