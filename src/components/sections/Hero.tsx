"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { MoveDownRight, Download, Github, Linkedin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GeometricPlanet from "@/components/visuals/GeometricPlanet";
import { useTraceFill } from "@/hooks/useTraceFill";
import TracePacket from "@/components/shared/TracePacket";
import DecryptText from "@/components/shared/DecryptText";
import { useLenisInstance } from "@/components/shared/LenisProvider";
import HeroTelemetry from "@/components/shared/HeroTelemetry";
import type { heroData } from "@/lib/data/hero";

/** How far Saturn leans against the cursor, in px, edge to edge. */
const PARALLAX_X = 36;
const PARALLAX_Y = 24;
/** Heavy and slow: a planet should lag the eye, not chase it. */
const PARALLAX_SPRING = { damping: 40, stiffness: 90, mass: 1.2 };

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "github":
      return <Github className="w-4 h-4" />;
    case "linkedin":
      return <Linkedin className="w-4 h-4" />;
    default:
      return null;
  }
};

export default function Hero({
  data,
  contact,
  isBooting,
}: {
  data: typeof heroData;
  contact: {
    email: string;
    location: string;
    resumeLink: string;
    socials: Array<{ name: string; url: string; icon: string }>;
  };
  isBooting: boolean;
}) {
  const traceRef = useRef<HTMLDivElement>(null);
  const { fill, packetOpacity } = useTraceFill(traceRef);
  const lenis = useLenisInstance();
  const reduce = useReducedMotion();

  // The caret appears once the last headline line has finished decoding.
  const [decoded, setDecoded] = useState(false);

  // DEPTH PARALLAX: Saturn leans against the cursor on a soft spring, and
  // sinks and recedes as the hero scrolls away. All motion values - the
  // section never re-renders for either.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const leanX = useSpring(pointerX, PARALLAX_SPRING);
  const leanY = useSpring(pointerY, PARALLAX_SPRING);
  const { scrollY } = useScroll();
  const sink = useTransform(scrollY, [0, 900], [0, 220]);
  const recede = useTransform(scrollY, [0, 900], [1, 0.9]);
  const planetY = useTransform<number, number>(
    [leanY, sink],
    ([lean, drop]) => lean + drop,
  );

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      // Opposite to the cursor: the far object moves against the eye.
      pointerX.set((e.clientX / window.innerWidth - 0.5) * -PARALLAX_X);
      pointerY.set((e.clientY / window.innerHeight - 0.5) * -PARALLAX_Y);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, pointerX, pointerY]);

  const scrollToWork = () => {
    const el = document.getElementById("about");
    if (!el) return;
    // Through Lenis: a native smooth scroll animates against it.
    if (lenis) lenis.scrollTo(el);
    else el.scrollIntoView({ block: "start" });
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const textVars = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const fluidTextClass =
    "text-[clamp(3.9rem,11vw,13rem)] font-bold tracking-tighter font-space leading-[0.82]";

  return (
    <section
      id="hero"
      className="relative w-full flex justify-center min-h-[100dvh] z-10"
    >
      <motion.div
        style={
          reduce
            ? undefined
            : { x: leanX, y: planetY, scale: recede, transformOrigin: "88% 34%" }
        }
        className="absolute inset-0 pointer-events-none"
      >
        <GeometricPlanet ready={!isBooting} />
      </motion.div>

      <div className="w-full max-w-7xl relative flex flex-col px-6 md:px-12 pt-32 pb-0 z-10">
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate={isBooting ? "hidden" : "show"}
          className="flex flex-col md:flex-1 mt-4 mb-8"
        >
          <motion.div
            variants={textVars}
            className="flex items-center gap-3 mb-10 w-fit border border-slate-800 px-4 py-2 bg-[#020617] border-[#020617]/50"
          >
            <span className="w-1.5 h-1.5 bg-[#3B82F6] animate-pulse" />
            <span className="text-[10px] md:text-xs font-mono text-slate-400 uppercase tracking-widest">
              {data.status}
            </span>
          </motion.div>

          <div className="overflow-hidden pb-5 w-full">
            <motion.h1
              variants={textVars}
              className={`${fluidTextClass} text-slate-100`}
            >
              <DecryptText
                text={data.title1}
                active={!isBooting}
                delay={350}
              />
            </motion.h1>
          </div>
          <div className="overflow-hidden pb-5 w-full">
            <motion.h1
              variants={textVars}
              className={`${fluidTextClass} text-slate-600`}
            >
              <DecryptText
                text={data.title2}
                active={!isBooting}
                delay={500}
              />
            </motion.h1>
          </div>
          <div className="overflow-hidden pb-2 w-full">
            <motion.h1
              variants={textVars}
              className={`${fluidTextClass} text-[#3B82F6]`}
            >
              <DecryptText
                text={data.title3}
                active={!isBooting}
                delay={650}
                onDone={() => setDecoded(true)}
              />
              {/* Terminal caret. Present from the start and only revealed,
                  so it never shifts the line. */}
              <span
                aria-hidden="true"
                className={`hud-blink ml-[0.06em] inline-block h-[0.68em] w-[0.1em] bg-[#F97316] align-baseline shadow-[0_0_15px_#F97316] ${
                  decoded ? "opacity-100" : "opacity-0"
                }`}
              />
            </motion.h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 w-full relative pb-24">
          <div
            ref={traceRef}
            className="absolute left-[50%] top-[32px] bottom-0 w-px bg-slate-800/50 hidden md:block -translate-x-1/2 z-0"
          >
            <motion.div
              style={{ height: fill }}
              className="w-full bg-[#F97316] origin-top relative shadow-[0_0_15px_#F97316]"
            >
              <TracePacket
                opacity={packetOpacity}
                label="HERO.INIT"
                tone="orange"
              />
            </motion.div>
          </div>

          {/* Telemetry: branches off the trace on the left, lower than the
              card, so the two read as taps on one bus rather than a pair. The
              wide gap leaves room for the trace packet's label, which rides
              down the left of the trace. */}
          <div className="order-2 md:order-1 relative flex items-start justify-start md:justify-end mt-6 md:mt-40 md:pr-24 lg:pr-36">
            <div className="absolute top-[32px] right-0 md:w-24 lg:w-36 h-px bg-slate-800/50 hidden md:block z-0">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isBooting ? 0 : 1 }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 1.3 }}
                className="w-full h-full bg-[#F97316] origin-right shadow-[0_0_10px_#F97316]"
              />
            </div>
            <div className="absolute top-[32px] right-0 w-2 h-2 translate-x-[4px] -translate-y-[3.5px] bg-[#020617] border border-[#F97316] hidden md:block z-10" />

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isBooting ? 0 : 1, x: isBooting ? -20 : 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="w-full max-w-xs"
            >
              <HeroTelemetry data={data.telemetry} />
            </motion.div>
          </div>

          {/* items-start: without it the card stretches to the height of the
              offset telemetry column and grows an empty band at the bottom. */}
          <div className="order-1 md:order-2 relative flex items-start justify-start pl-0 md:pl-16">
            <div className="absolute top-[32px] left-0 w-16 h-px bg-slate-800/50 hidden md:block z-0">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isBooting ? 0 : 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
                className="w-full h-full bg-[#F97316] origin-left shadow-[0_0_10px_#F97316]"
              />
            </div>

            <div className="absolute top-[32px] left-0 w-2 h-2 -translate-x-[4px] -translate-y-[3.5px] bg-[#020617] border border-[#F97316] hidden md:block z-10" />

            <motion.div
              data-hud-target="HERO.PROFILE"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isBooting ? 0 : 1, x: isBooting ? 20 : 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="max-w-lg w-full relative border border-white/5 border-l-2 border-l-[#F97316] group bg-[#020617] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] transform-gpu"
            >
              <div className="absolute top-[27px] -left-[6px] w-2.5 h-2.5 bg-[#020617] border border-[#F97316] group-hover:bg-[#F97316] transition-colors" />

              {/* Panel header, in the same idiom as the nav and boot plates. */}
              <div className="flex justify-between items-center gap-4 px-6 lg:px-8 py-2.5 border-b border-slate-800 font-mono text-[9px] tracking-widest uppercase">
                <span className="text-slate-400">Operator.Profile</span>
                <span className="flex items-center gap-2 text-[#3B82F6]">
                  <span aria-hidden="true" className="hud-blink w-1.5 h-1.5 bg-[#3B82F6]" />
                  Online
                </span>
              </div>

              <div className="p-6 lg:p-8">
                <p className="font-space text-xl md:text-2xl font-medium tracking-tight leading-snug text-slate-100 text-balance mb-6">
                  {data.lead}
                </p>

                {/* How the work gets done, as a spec table. Each row decodes
                    in turn once the card is on screen, carrying on from the
                    headline. Word by word, so a narrow card wraps the line
                    instead of clipping it. */}
                <ul className="mb-8 border-t border-slate-800/70">
                  {data.specs.map((spec, i) => (
                    <li
                      key={spec.sys}
                      className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 py-2.5 border-b border-slate-800/70 font-mono text-[11px] md:text-xs tracking-wider"
                    >
                      <span className="flex items-center gap-2 text-slate-400 tracking-widest">
                        <span aria-hidden="true" className="w-1 h-1 bg-[#F97316]" />
                        {spec.sys}
                      </span>
                      <span className="flex flex-wrap gap-x-[0.6em] text-slate-200">
                        {spec.label.split(" ").map((word, j) => (
                          <DecryptText
                            key={j}
                            text={word}
                            active={!isBooting}
                            delay={1000 + i * 220 + j * 40}
                            duration={450}
                          />
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    data-hud-target="HERO.PRIMARY_ACTION"
                    onClick={scrollToWork}
                    className="h-9 flex items-center gap-2 px-4 bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] hover:bg-[#F97316] hover:text-[#020617] font-mono text-xs tracking-widest uppercase transition-all group/btn"
                  >
                    <span>{data.primaryAction}</span>
                    <MoveDownRight className="w-3 h-3 group-hover/btn:translate-x-1 group-hover/btn:translate-y-1 transition-transform" />
                  </button>

                  <a
                    data-hud-target="HERO.EXTRACT_SPECS"
                    href={contact.resumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 flex items-center gap-2 px-4 bg-[#020617] border border-slate-700 text-slate-300 hover:border-[#3B82F6] hover:text-[#3B82F6] font-mono text-xs tracking-widest uppercase transition-all group/resume"
                  >
                    <Download className="w-3 h-3 group-hover/resume:-translate-y-0.5 transition-transform" />
                    <span>EXTRACT_SPECS</span>
                  </a>

                  <div className="flex items-center gap-2 ml-auto">
                    {contact.socials.map((social, idx) => (
                      <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        className="w-9 h-9 flex items-center justify-center bg-[#020617] border border-slate-800 text-slate-500 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors group/social"
                        title={social.name}
                      >
                        {getIcon(social.icon)}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
