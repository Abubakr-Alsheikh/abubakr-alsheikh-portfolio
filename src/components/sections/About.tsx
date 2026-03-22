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
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full flex justify-center bg-transparent z-20"
    >
      <GeometricJupiter />

      <div className="w-full max-w-7xl relative pt-32 pb-16 px-6 md:px-12">
        {/* CENTER TRACE LINE */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/50 hidden md:block -translate-x-1/2 z-0">
          <motion.div
            style={{ height: fillHeight }}
            className="w-full bg-[#F97316] origin-top relative shadow-[0_0_15px_#F97316]"
          >
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] border-2 border-[#F97316] rounded-full flex items-center justify-center shadow-[0_0_10px_#F97316]">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 relative z-10">
          {/* ⚡ THE FOOLPROOF STICKY FIX */}
          {/* self-start prevents the grid from stretching this column to 100% height */}
          {/* It is now a tight box that will slide cleanly down the grid parent track */}
          <div className="md:sticky top-[20vh] self-start flex flex-col pr-8 z-10">
            {/* ⚡ THE SLIDING ELEVATOR CONNECTION */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40% 0px -40% 0px" }}
              className="absolute inset-0 pointer-events-none z-0 hidden md:block"
            >
              {/* Connection Node rides the center rail */}
              <motion.div
                variants={{
                  hidden: {
                    backgroundColor: "#020617",
                    borderColor: "#1e293b",
                  },
                  visible: {
                    backgroundColor: "#F97316",
                    borderColor: "#F97316",
                    transition: { duration: 0.1 },
                  },
                }}
                className="absolute top-[20px] -right-[3rem] w-2 h-2 rounded-sm translate-x-[4px] -translate-y-[3.5px] z-10 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              />
              {/* Horizontal Hardware Line shooting left to the text */}
              <div className="absolute top-[20px] -right-[3rem] w-[3rem] h-px bg-slate-800">
                <motion.div
                  variants={{
                    hidden: { scaleX: 0 },
                    visible: {
                      scaleX: 1,
                      transition: {
                        duration: 0.4,
                        ease: "easeOut",
                        delay: 0.1,
                      },
                    },
                  }}
                  className="w-full h-full bg-[#F97316] origin-right shadow-[0_0_10px_#F97316]"
                />
              </div>
            </motion.div>

            <h2 className="text-xs font-mono text-[#3B82F6] mb-6 tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-sm bg-[#3B82F6] animate-pulse" />{" "}
              CORE_ARCHITECTURE
            </h2>
            <h3 className="text-5xl md:text-7xl font-space font-bold text-slate-100 leading-[1] tracking-tighter mb-8">
              Precision in <br />
              <span className="text-slate-600">execution.</span>
            </h3>

            {/* ⚡ ACTIVE LEFT BORDER TRACE ON MANIFESTO */}
            <div className="relative pl-6 py-2 mt-2">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-800" />
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "-40% 0px -40% 0px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#F97316] origin-top shadow-[0_0_10px_#F97316]"
              />
              <p className="text-lg text-slate-400 font-mono font-light leading-relaxed">
                {data.manifesto}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: CAPABILITY CARDS */}
          <div className="flex flex-col gap-12 pt-8 md:pt-[20vh]">
            {data.capabilities.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50% 0px -50% 0px" }}
                className="relative p-8 bg-[#020617] border border-slate-800 group hover:border-[#F97316]/50 transition-colors"
              >
                {/* ⚡ HARDWARE CIRCUIT TRIGGER FOR RIGHT CARDS */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50% 0px -50% 0px" }}
                  className="absolute inset-0 pointer-events-none z-0 hidden md:block"
                >
                  <motion.div
                    variants={{
                      hidden: {
                        backgroundColor: "#020617",
                        borderColor: "#1e293b",
                      },
                      visible: {
                        backgroundColor: "#F97316",
                        borderColor: "#F97316",
                        transition: { duration: 0.1 },
                      },
                    }}
                    className="absolute top-[48px] -left-[3rem] w-2 h-2 rounded-sm -translate-x-[4px] -translate-y-[3.5px] z-10 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                  />
                  <div className="absolute top-[48px] -left-[3rem] w-[3rem] h-px bg-slate-800">
                    <motion.div
                      variants={{
                        hidden: { scaleX: 0 },
                        visible: {
                          scaleX: 1,
                          transition: {
                            duration: 0.4,
                            ease: "easeOut",
                            delay: 0.1,
                          },
                        },
                      }}
                      className="w-full h-full bg-[#F97316] origin-left shadow-[0_0_10px_#F97316]"
                    />
                  </div>
                </motion.div>

                {/* ⚡ SPLIT-FLOW BORDER TRACE ON LEFT EDGE OF CARDS */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50% 0px -50% 0px" }}
                  className="absolute inset-0 pointer-events-none hidden md:block"
                >
                  <motion.div
                    variants={{
                      hidden: { scaleY: 0 },
                      visible: {
                        scaleY: 1,
                        transition: {
                          duration: 0.4,
                          ease: "easeOut",
                          delay: 0.5,
                        },
                      },
                    }}
                    className="absolute left-[-1px] top-0 bottom-[calc(100%-48px)] w-[2px] bg-[#F97316] origin-bottom shadow-[0_0_15px_#F97316]"
                  />
                  <motion.div
                    variants={{
                      hidden: { scaleY: 0 },
                      visible: {
                        scaleY: 1,
                        transition: {
                          duration: 0.4,
                          ease: "easeOut",
                          delay: 0.5,
                        },
                      },
                    }}
                    className="absolute left-[-1px] top-[48px] bottom-0 w-[2px] bg-[#F97316] origin-top shadow-[0_0_15px_#F97316]"
                  />
                </motion.div>

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

                {/* Hardware Screws */}
                <div className="absolute top-2 right-2 w-1 h-1 bg-slate-800 group-hover:bg-[#F97316]" />
                <div className="absolute bottom-2 right-2 w-1 h-1 bg-slate-800 group-hover:bg-[#F97316]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
