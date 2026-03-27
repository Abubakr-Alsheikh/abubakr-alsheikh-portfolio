"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ShieldCheck, Cpu, ExternalLink, Hexagon } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";
import GeometricPulsar from "@/components/visuals/GeometricPulsar";

type Skills = {
  frontend: string[];
  backend: string[];
  devops: string[];
};

type Cert = {
  issuer: string;
  title: string;
  date: string;
  verifyLink?: string;
  inProgress?: boolean;
};

type Badge = {
  title: string;
  image: string;
  url: string;
  inProgress: boolean;
};

const DataStream = ({
  items,
  reverse = false,
  speed = 40,
}: {
  items: string[];
  reverse?: boolean;
  speed?: number;
}) => {
  const duplicatedItems = [...items, ...items, ...items];
  return (
    <div className="relative flex w-full overflow-hidden py-4 group border-y border-slate-800/50 bg-[#020617] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        animate={{ x: reverse ? ["-33.33%", "0%"] : ["0%", "-33.33%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
        className="flex shrink-0 gap-8 pr-8"
      >
        {duplicatedItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 text-slate-500 font-mono text-sm uppercase tracking-widest hover:text-[#F97316] transition-colors cursor-crosshair"
          >
            <span className="text-slate-800">{"//"}</span>
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const BadgeMarquee = ({ badges }: { badges: Badge[] }) => {
  // Quadrupling the array ensures ultra-wide monitors are always filled.
  const duplicatedBadges = [...badges, ...badges, ...badges, ...badges];

  return (
    <div className="w-full relative py-8 md:py-12 mb-20 border-y border-slate-800/50 bg-[#020617]/50 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px)] bg-[size:20px_100%] md:bg-[size:40px_100%] opacity-20 pointer-events-none" />

      {/* 
        CRITICAL MATH FIX: 
        1. w-max forces the div to exactly wrap its children.
        2. x: ["0%", "-50%"] moves exactly half the total width.
        3. The gap (gap-6) and padding-right (pr-6) MUST be identical for the pixel math to result in a flawless, invisible loop. 
      */}
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 15, ease: "linear", repeat: Infinity }}
        className="flex shrink-0 items-center w-max gap-6 md:gap-12 pr-6 md:pr-12"
      >
        {duplicatedBadges.map((badge, idx) => (
          <div
            key={idx}
            className="relative group shrink-0 w-[110px] h-[110px] md:w-[180px] md:h-[180px] flex items-center justify-center"
          >
            <div
              className={`absolute inset-0 border border-slate-800 transition-colors duration-500 ${badge.inProgress ? "group-hover:border-[#3B82F6]" : "group-hover:border-[#F97316]"}`}
            />
            <div
              className={`absolute -top-1 -left-1 w-2 h-2 ${badge.inProgress ? "bg-[#3B82F6]/50" : "bg-[#F97316]/50"} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
            <div
              className={`absolute -bottom-1 -right-1 w-2 h-2 ${badge.inProgress ? "bg-[#3B82F6]/50" : "bg-[#F97316]/50"} opacity-0 group-hover:opacity-100 transition-opacity`}
            />

            {badge.inProgress ? (
              <div className="relative w-[70px] h-[70px] md:w-[140px] md:h-[140px] flex items-center justify-center opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-500">
                {/* Responsive Image overrides internal width/height */}
                <Image
                  src={badge.image}
                  alt={badge.title}
                  width={140}
                  height={140}
                  className="relative z-10 w-[70px] h-[70px] md:w-[140px] md:h-[140px]"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#020617]/70 backdrop-blur-[2px] border border-[#3B82F6]">
                  <span className="text-[8px] md:text-[10px] font-mono text-[#3B82F6] font-bold tracking-widest uppercase animate-pulse">
                    In_Progress
                  </span>
                </div>
              </div>
            ) : (
              <a
                href={badge.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-[70px] h-[70px] md:w-[140px] md:h-[140px] flex items-center justify-center opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 z-10"
              >
                <Image
                  src={badge.image}
                  alt={badge.title}
                  width={140}
                  height={140}
                  className="w-[70px] h-[70px] md:w-[140px] md:h-[140px]"
                />
              </a>
            )}

            <div className="absolute -bottom-6 md:-bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              <span className="text-[8px] md:text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-[#020617] px-2 py-1 border border-slate-800">
                {badge.title}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function Engine({
  skills,
  certs,
  badges,
}: {
  skills: Skills;
  certs: Cert[];
  badges: Badge[];
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
      id="engine"
      ref={sectionRef}
      className="relative w-full flex justify-center z-20 overflow-hidden"
    >
      <GeometricPulsar />

      <div className="w-full max-w-7xl relative pt-32 pb-32 px-6 md:px-12 flex flex-col items-center">
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

        <div className="w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 w-full md:w-1/2 md:pr-12 md:text-right"
          >
            <div className="flex items-center md:justify-end gap-3 mb-6">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                System Specifications
              </span>
              <Cpu className="w-5 h-5 text-[#F97316]" />
            </div>
            <h2 className="text-5xl md:text-7xl font-space font-bold text-slate-100 tracking-tighter leading-[1]">
              The <span className="text-slate-600">Engine.</span>
            </h2>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative w-full mb-20 flex flex-col z-10 bg-[#020617] border-y border-slate-800"
        >
          <DataStream items={skills.backend} speed={35} />
          <DataStream items={skills.frontend} speed={40} reverse={true} />
          <DataStream items={skills.devops} speed={45} />
        </motion.div>

        <div className="w-full relative z-10">
          <div className="flex items-center gap-3 mb-6 px-4">
            <Hexagon className="w-4 h-4 text-[#F97316]" />
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Active Modules // Credential Stream
            </h3>
          </div>
          <BadgeMarquee badges={badges} />
        </div>

        <div className="w-full relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-800 pb-4">
            <h3 className="text-xs font-mono text-[#3B82F6] uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck className="w-4 h-4" /> Compliance Matrix
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certs.map((cert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={`group relative flex flex-col p-6 bg-[#020617] border border-slate-800 transition-colors duration-300 ${cert.inProgress ? "hover:border-[#3B82F6]" : "hover:border-[#F97316]"}`}
              >
                <div
                  className={`absolute top-1 left-1 w-1 h-1 bg-slate-800 ${cert.inProgress ? "group-hover:bg-[#3B82F6]" : "group-hover:bg-[#F97316]"}`}
                />
                <div
                  className={`absolute bottom-1 right-1 w-1 h-1 bg-slate-800 ${cert.inProgress ? "group-hover:bg-[#3B82F6]" : "group-hover:bg-[#F97316]"}`}
                />

                <div className="flex justify-between items-start mb-6">
                  <span
                    className={`text-[10px] font-mono tracking-widest uppercase px-2 py-1 border ${cert.inProgress ? "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20" : "text-[#F97316] bg-[#F97316]/10 border-[#F97316]/20"}`}
                  >
                    {cert.issuer}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {cert.date}
                  </span>
                </div>

                <h4
                  className={`text-lg font-space font-bold text-slate-200 leading-tight mb-8 transition-colors ${cert.inProgress ? "group-hover:text-[#3B82F6]" : "group-hover:text-[#F97316]"}`}
                >
                  {cert.title}
                </h4>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-800/50">
                  <div className="flex items-center gap-2">
                    {cert.inProgress ? (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] font-mono text-[#3B82F6] font-bold uppercase tracking-widest">
                          In Progress
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                          Verified
                        </span>
                      </>
                    )}
                  </div>
                  {cert.verifyLink && (
                    <a
                      href={cert.verifyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 transition-colors group/link ${
                        cert.inProgress
                          ? "text-slate-500 hover:text-[#3B82F6]"
                          : "text-slate-500 hover:text-[#F97316]"
                      }`}
                    >
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] hidden sm:block">
                        Verify_Credential
                      </span>
                      <ExternalLink className="w-3 h-3 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
