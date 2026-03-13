// src/components/shared/TelemetryNav.tsx
"use client";

import {
  motion,
  useScroll,
  useVelocity,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import AdminTerminal from "./AdminTerminal";

// --- Sub-Component: Dynamic Mouse Sparkline (System Work) ---
const NetworkGraph = () => {
  const [points, setPoints] = useState<number[]>(Array(20).fill(5));
  const mouseSpeed = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const speed = Math.abs(e.movementX) + Math.abs(e.movementY);
      mouseSpeed.set(speed);
    },
    [mouseSpeed],
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    const interval = setInterval(() => {
      const currentSpeed = mouseSpeed.get();
      const newPoint = Math.min(
        20,
        Math.max(2, currentSpeed / 5 + Math.random() * 4),
      );
      setPoints((prev) => [...prev.slice(1), newPoint]);
      mouseSpeed.set(currentSpeed * 0.5);
    }, 100);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, [handleMouseMove, mouseSpeed]);

  const pointsString =
    points.map((p, i) => `${i * 4},${24 - p}`).join(" ") + ` 76,24 0,24`;

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
        SYS.WORK
      </span>
      <svg width="76" height="24" className="overflow-visible">
        <polygon points={pointsString} fill="rgba(59,130,246,0.1)" />
        <polyline
          points={points.map((p, i) => `${i * 4},${24 - p}`).join(" ")}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

export default function TelemetryNav() {
  // Scroll Physics
  const { scrollYProgress, scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 100,
    restDelta: 0.001,
  });

  const altitude = useTransform(smoothProgress, [0, 1], [400000, 0]);
  const machSpeed = useTransform(smoothVelocity, [-1000, 0, 1000], [25, 0, 25]);
  const circlePosition = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const [altDisplay, setAltDisplay] = useState("400,000");
  const [machDisplay, setMachDisplay] = useState("0.00");

  // States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const unsubscribeAlt = altitude.on("change", (v) =>
      setAltDisplay(Math.max(0, Math.floor(v)).toLocaleString("en-US")),
    );
    const unsubscribeMach = machSpeed.on("change", (v) =>
      setMachDisplay(Math.abs(v).toFixed(2)),
    );
    return () => {
      unsubscribeAlt();
      unsubscribeMach();
    };
  }, [altitude, machSpeed]);

  // Track active section for the dropdown menu
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["about", "projects", "engine", "contact"];
      let current = "hero";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 300) {
          current = section;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "hero", name: "00. ORBITAL_DROP" },
    { id: "about", name: "01. CORE_ARCH" },
    { id: "projects", name: "02. SATELLITES" },
    { id: "engine", name: "03. ENGINE" },
    { id: "contact", name: "04. HORIZON" },
  ];

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-4 pointer-events-none"
      >
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          {/* LEFT SIDE: Logo & Terminal Trigger */}
          <button
            onClick={() => setIsTerminalOpen(true)}
            className="pointer-events-auto flex items-center gap-3 md:gap-4 bg-[#020617]/50 backdrop-blur-xl border border-slate-800/60 p-2 md:p-3 rounded-2xl shadow-2xl group transition-all duration-300 hover:border-[#3B82F6]/50 hover:bg-[#020617]/70"
          >
            {/* Logo Placeholder */}
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
              {/* Replace src with your actual logo path (e.g., "/logo.png") */}
              {/* <div className="absolute inset-0 bg-slate-800 rounded flex items-center justify-center text-[8px] text-slate-500 font-mono">
                LOGO
              </div> */}
              <Image
                src="/web-app-manifest-512x512.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>

            {/* Typography mimicking your image */}
            <div className="flex flex-col items-start leading-[1.1] tracking-wide">
              <span className="font-space font-bold text-slate-100 text-sm md:text-lg">
                ABUBAKR
              </span>
              <span className="font-space font-bold text-slate-400 text-sm md:text-lg">
                ALSHEIKH
              </span>
              {/* <span className="font-mono text-[8px] md:text-[9px] text-slate-500 mt-0.5 uppercase tracking-widest group-hover:text-[#F97316] transition-colors">
                // ARCHITECT
              </span> */}
            </div>
          </button>

          {/* RIGHT SIDE: Telemetry & Expandable Menu */}
          <div className="pointer-events-auto flex flex-col items-end">
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col bg-[#020617]/50 backdrop-blur-xl border border-slate-800/60 rounded-2xl shadow-2xl overflow-hidden cursor-pointer hover:border-[#F97316]/40 transition-colors"
            >
              {/* Top Persistent Bar */}
              <div className="flex items-center gap-4 md:gap-6 p-3 md:p-4 min-w-[200px] md:min-w-[340px] justify-end">
                {/* Network Graph (Hidden on Mobile) */}
                <div className="hidden md:block">
                  <NetworkGraph />
                </div>

                <div className="w-px h-8 bg-slate-800 hidden md:block" />

                {/* Altitude (Visible on Mobile to indicate it's clickable) */}
                <div className="flex flex-col text-right group w-[110px]">
                  <span className="text-[8px] font-mono text-slate-500 mb-1 tracking-widest uppercase transition-colors group-hover:text-[#F97316]">
                    {isMenuOpen ? "CLOSE MENU" : "ALTITUDE (CLICK)"}
                  </span>
                  <span className="text-slate-200 font-mono text-xs md:text-sm tracking-widest">
                    {altDisplay}{" "}
                    <span className="text-[#3B82F6] text-[9px]">FT</span>
                  </span>
                </div>

                {/* Velocity (Hidden on Mobile) */}
                <div className="hidden md:flex flex-col text-right w-20">
                  <span className="text-[8px] font-mono text-slate-500 mb-1 tracking-widest uppercase">
                    VELOCITY
                  </span>
                  <span className="text-slate-200 font-mono text-xs md:text-sm tracking-widest">
                    M {machDisplay}
                  </span>
                </div>
              </div>

              {/* Gradient Progress Bar & Glowing Circle */}
              <div className="relative w-full h-[2px] bg-slate-800/50">
                <motion.div
                  style={{ scaleX: smoothProgress, transformOrigin: "0% 50%" }}
                  className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] via-[#A855F7] to-[#F97316]"
                />
                <motion.div
                  style={{ left: circlePosition }}
                  className="absolute top-1/2 -translate-y-1/2 -ml-1 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_#F97316,0_0_4px_#ffffff]"
                />
              </div>

              {/* Expandable Navigation Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col border-t border-slate-800/50"
                  >
                    <div className="flex flex-col gap-1 p-3">
                      {navLinks.map((link) => {
                        const isActive = activeSection === link.id;
                        return (
                          <button
                            key={link.id}
                            onClick={(e) => scrollToSection(e, link.id)}
                            className={`flex items-center justify-between font-mono text-[10px] md:text-xs tracking-widest px-3 py-2.5 rounded-lg transition-all ${
                              isActive
                                ? "bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                            }`}
                          >
                            <span>{link.name}</span>
                            {isActive && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* The Interactive Terminal (Triggered by Logo) */}
      <AdminTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />
    </>
  );
}
