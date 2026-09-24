"use client";

import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Menu, TerminalSquare, X } from "lucide-react";
import AdminTerminal from "./AdminTerminal";
import { useLenisInstance } from "./LenisProvider";

/**
 * The flight instrument across the top of the page.
 *
 * Navigation is visible, not hidden: every destination is a link on the bar at
 * desktop width, and the collapsing menu exists only where there is genuinely
 * no room for it. Altitude is deliberately absent — the canopy's ladder owns
 * that readout, and printing it twice made the two instruments redundant.
 */

interface NavLink {
  id: string;
  /** Full label, used in the mobile list. */
  name: string;
  /** Compact label for the desktop bar. */
  short: string;
}

const NAV_LINKS: NavLink[] = [
  { id: "hero", name: "00. ORBITAL_DROP", short: "DROP" },
  { id: "about", name: "01. CORE_ARCH", short: "CORE" },
  { id: "projects", name: "02. SATELLITES", short: "SAT" },
  { id: "archive", name: "03. ARCHIVE", short: "ARCH" },
  { id: "journey", name: "04. JOURNEY", short: "JRNY" },
  { id: "engine", name: "05. ENGINE", short: "ENG" },
  { id: "contact", name: "06. HORIZON", short: "HRZN" },
];

/** Samples per second for the velocity trace. */
const GRAPH_HZ = 6;
const GRAPH_POINTS = 20;

/** px/s of scroll that fills the graph to its ceiling. */
const GRAPH_SCALE = 260;

/**
 * Scroll velocity over the last few seconds.
 *
 * Polls the motion value on a timer rather than subscribing to it: the trace
 * only needs a handful of samples a second, and a `.on("change")` here would
 * re-render the whole nav on every frame of every scroll.
 */
function VelocityGraph({ velocity }: { velocity: MotionValue<number> }) {
  const [points, setPoints] = useState<number[]>(() =>
    Array(GRAPH_POINTS).fill(0),
  );

  useEffect(() => {
    const id = setInterval(() => {
      const sample = Math.min(20, Math.abs(velocity.get()) / GRAPH_SCALE);
      setPoints((prev) => [...prev.slice(1), sample]);
    }, 1000 / GRAPH_HZ);

    return () => clearInterval(id);
  }, [velocity]);

  const line = points.map((p, i) => `${i * 4},${24 - p}`).join(" ");

  return (
    <div className="hidden flex-col items-end gap-1 md:flex">
      <span className="font-mono text-[8px] uppercase tracking-widest text-slate-400">
        SCROLL.V
      </span>
      <svg width="76" height="24" aria-hidden="true">
        <polygon points={`${line} 76,24 0,24`} fill="rgba(59,130,246,0.08)" />
        <polyline
          points={line}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/** Tiny fastener square. Every panel in this project carries them. */
function Screws() {
  return (
    <>
      <div className="pointer-events-none absolute top-1 left-1 h-1 w-1 bg-slate-800" />
      <div className="pointer-events-none absolute bottom-1 right-1 h-1 w-1 bg-slate-800" />
    </>
  );
}

/**
 * The terminal is easy to miss, so it asks for attention once per visit until
 * a visitor has opened it: after ATTENTION_MS the button pings and a callout
 * names what it does, then the callout folds down to a blinking dot. Opening
 * the terminal ends it for good (TERMINAL_SEEN_KEY).
 */
const ATTENTION_MS = 14000;
const CALLOUT_MS = 9000;
const TERMINAL_SEEN_KEY = "orbital.terminal.opened";

export default function TelemetryNav() {
  const { scrollYProgress, scrollY } = useScroll();
  const lenis = useLenisInstance();

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

  const [machDisplay, setMachDisplay] = useState("0.00");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [beacon, setBeacon] = useState<"off" | "callout" | "dot">("off");

  useEffect(() => {
    try {
      if (window.localStorage.getItem(TERMINAL_SEEN_KEY)) return;
    } catch {}
    let fold = 0;
    const show = window.setTimeout(() => {
      setBeacon("callout");
      fold = window.setTimeout(
        () => setBeacon((b) => (b === "callout" ? "dot" : b)),
        CALLOUT_MS,
      );
    }, ATTENTION_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(fold);
    };
  }, []);

  const openTerminal = () => {
    setIsTerminalOpen(true);
    setBeacon("off");
    try {
      window.localStorage.setItem(TERMINAL_SEEN_KEY, "1");
    } catch {}
  };
  const [activeSection, setActiveSection] = useState("hero");

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = smoothVelocity.on("change", (v) => {
      const mach = Math.min(25, Math.abs(v) / 40);
      const next = mach.toFixed(2);
      // Quantise to the rendered string so a scroll does not set state per frame.
      setMachDisplay((prev) => (prev === next ? prev : next));
    });
    return () => unsubscribe();
  }, [smoothVelocity]);

  // Active section, by observation rather than by measuring offsets. The old
  // `el.offsetTop` comparison drifted because sections sit inside positioned
  // containers, and it only listed four of the seven.
  useEffect(() => {
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Earliest section in page order wins, so a tall section below does not
        // steal the crown the moment its first pixel enters the band.
        const next = NAV_LINKS.find((l) => visible.has(l.id));
        if (next) setActiveSection(next.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    for (const link of NAV_LINKS) {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  // Escape closes the menu; a click outside the panel does too.
  useEffect(() => {
    if (!isMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setIsMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isMenuOpen]);

  const scrollToSection = useCallback(
    (id: string) => {
      setIsMenuOpen(false);

      if (id === "hero") {
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0 });
        return;
      }

      const el = document.getElementById(id);
      if (!el) return;

      // Through Lenis, never `scrollIntoView({ behavior: "smooth" })` — a
      // native smooth scroll animates against Lenis instead of with it.
      if (lenis) lenis.scrollTo(el);
      else el.scrollIntoView({ block: "start" });
    },
    [lenis],
  );

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-4 pointer-events-none"
      >
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-2 sm:gap-4">
          {/* Brand returns to the top of the page. It used to open the
              terminal, which now has its own button on this bar. */}
          <button
            onClick={() => scrollToSection("hero")}
            aria-label="Back to top"
            className="pointer-events-auto relative flex items-center gap-2.5 md:gap-4 border border-slate-800/60 bg-[#020617] p-2 md:p-3 transition-colors duration-300 hover:border-[#3B82F6]/50"
          >
            <Screws />
            <div className="relative h-9 w-9 flex-shrink-0 sm:h-10 sm:w-10 md:h-12 md:w-12">
              <Image
                src="/web-app-manifest-512x512.png"
                alt="Abubakr Alsheikh"
                fill
                // Without this a `fill` image asks for the widest source in
                // the set: 1920px of PNG for a 48px mark.
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-start leading-[1.1] tracking-wide">
              <span className="font-space text-[13px] font-bold text-slate-100 sm:text-sm md:text-lg">
                ABUBAKR
              </span>
              <span className="font-space text-[13px] font-bold text-slate-400 sm:text-sm md:text-lg">
                ALSHEIKH
              </span>
            </div>
          </button>

          <div
            ref={panelRef}
            className="pointer-events-auto relative flex flex-col border border-slate-800/60 bg-[#020617]"
          >
            <Screws />

            <div className="flex items-stretch">
              {/* Desktop: every destination on the bar, no discovery step. */}
              <nav aria-label="Sections" className="hidden items-stretch lg:flex">
                {NAV_LINKS.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`relative px-3 py-4 font-mono text-[10px] tracking-widest transition-colors ${
                        isActive
                          ? "text-[#F97316]"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {link.short}
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 400,
                          }}
                          className="absolute inset-x-2 top-0 h-[2px] bg-[#F97316] shadow-[0_0_10px_#F97316]"
                        />
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="hidden w-px bg-slate-800 lg:block" />

              {/* Phones get the two controls only: the velocity readout is
                  decoration, and at 390px it squeezed the bar edge to edge. */}
              <div className="flex items-center gap-2 px-2 py-2 sm:gap-4 sm:px-4 sm:py-3">
                <VelocityGraph velocity={smoothVelocity} />

                <div className="hidden w-20 flex-col text-right sm:flex">
                  <span className="mb-1 font-mono text-[8px] uppercase tracking-widest text-slate-400">
                    Velocity
                  </span>
                  <span className="font-mono text-xs tracking-widest text-slate-200 tabular-nums md:text-sm">
                    M {machDisplay}
                  </span>
                </div>

                <span className="relative flex">
                  <button
                    onClick={openTerminal}
                    aria-label="Open root terminal (backtick)"
                    title="Root terminal  [ ` ]"
                    className={`relative flex h-9 min-w-9 items-center justify-center gap-1.5 border px-2 font-mono sm:h-auto sm:min-w-0 sm:py-1.5 text-[9px] uppercase tracking-widest transition-colors hover:border-[#3B82F6]/50 hover:text-[#3B82F6] ${
                      beacon === "off"
                        ? "border-slate-800 text-slate-400"
                        : "border-[#F97316]/70 text-[#F97316]"
                    }`}
                  >
                    <TerminalSquare className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline">`</span>
                    {beacon !== "off" && (
                      <>
                        {/* Ping ring, then a dot that stays until opened. */}
                        <span
                          aria-hidden="true"
                          className="hud-ping pointer-events-none absolute -inset-1 border border-[#F97316] motion-reduce:hidden"
                        />
                        <span
                          aria-hidden="true"
                          className="hud-blink absolute -right-1 -top-1 h-1.5 w-1.5 bg-[#F97316]"
                        />
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {beacon === "callout" && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ type: "spring", stiffness: 260, damping: 30 }}
                        className="absolute right-0 top-full z-10 mt-3 w-60 border border-[#F97316]/50 bg-[#020617] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]"
                      >
                        {/* Pointer notch up to the button. */}
                        <span
                          aria-hidden="true"
                          className="absolute -top-[5px] right-3 h-2 w-2 rotate-45 border-l border-t border-[#F97316]/50 bg-[#020617]"
                        />
                        <button
                          onClick={openTerminal}
                          className="block w-full px-3 pb-2.5 pt-3 text-left"
                        >
                          <span className="mb-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-[#F97316]">
                            <span className="hud-blink h-1.5 w-1.5 bg-[#F97316]" />
                            Incoming // Ask_ARCH
                          </span>
                          <span className="block font-mono text-[11px] leading-relaxed text-slate-300">
                            Questions about my work? Ask the terminal. It answers live.
                          </span>
                        </button>
                        <button
                          onClick={() => setBeacon("dot")}
                          aria-label="Dismiss"
                          className="absolute right-1.5 top-1.5 p-1 text-slate-400 hover:text-slate-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </span>

                <button
                  onClick={() => setIsMenuOpen((open) => !open)}
                  aria-expanded={isMenuOpen}
                  aria-controls="hud-menu"
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                  className="flex h-9 items-center gap-2 border border-slate-800 px-3 font-mono text-[9px] uppercase tracking-widest text-slate-400 transition-colors hover:border-[#F97316]/40 hover:text-[#F97316] sm:h-auto sm:px-2 sm:py-1.5 lg:hidden"
                >
                  {isMenuOpen ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    <Menu className="h-3.5 w-3.5" />
                  )}
                  {isMenuOpen ? "Close" : "Menu"}
                </button>
              </div>
            </div>

            {/* Journey bar. Two-stop blue to orange: the palette has no purple. */}
            <div className="relative h-[2px] w-full bg-slate-800/50">
              <motion.div
                style={{ scaleX: smoothProgress, transformOrigin: "0% 50%" }}
                className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#F97316]"
              />
            </div>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  id="hud-menu"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden border-t border-slate-800/50 lg:hidden"
                >
                  <nav aria-label="Sections" className="flex flex-col gap-1 p-3">
                    {NAV_LINKS.map((link) => {
                      const isActive = activeSection === link.id;
                      return (
                        <button
                          key={link.id}
                          onClick={() => scrollToSection(link.id)}
                          aria-current={isActive ? "true" : undefined}
                          className={`flex items-center justify-between border px-3 py-2.5 font-mono text-[10px] tracking-widest transition-colors md:text-xs ${
                            isActive
                              ? "border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316]"
                              : "border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                          }`}
                        >
                          <span>{link.name}</span>
                          {isActive && <span className="h-1.5 w-1.5 bg-[#F97316]" />}
                        </button>
                      );
                    })}
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      <AdminTerminal
        isOpen={isTerminalOpen}
        onOpen={openTerminal}
        onClose={() => setIsTerminalOpen(false)}
        onNavigate={scrollToSection}
      />
    </>
  );
}
