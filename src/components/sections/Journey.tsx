"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Terminal } from "lucide-react";
import { useRef } from "react";
import GeometricMars from "@/components/visuals/GeometricMars";

type JourneyItem = {
  date: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
};

export default function Journey({ data }: { data: JourneyItem[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start center", "end center"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const fillHeight = useTransform(smooth, [0, 1], ["0%", "100%"]);

  return (
    <section id="journey" ref={sectionRef} className="relative w-full flex justify-center z-20">
      
      <GeometricMars />

      <div className="w-full max-w-7xl mx-auto relative pt-16 pb-16">
        
        <div className="absolute left-[4rem] top-0 bottom-0 w-px bg-slate-800/50 hidden md:block z-0">
          <motion.div style={{ height: fillHeight }} className="w-full bg-[#3B82F6] origin-top relative shadow-[0_0_15px_#3B82F6]">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#3B82F6] rounded-full flex items-center justify-center shadow-[0_0_10px_#3B82F6]">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
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

                <div className="relative border border-slate-800 bg-[#020617]/40 backdrop-blur-md p-6 md:p-8 hover:border-[#3B82F6]/50 transition-colors duration-300 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
                  
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
                  <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-6">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{i !== 0 && <span className="text-slate-800 mr-2">|</span>} {tag}</span>
                    ))}
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
