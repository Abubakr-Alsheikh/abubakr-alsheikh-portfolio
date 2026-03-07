"use client";

import { useRef, useState, MouseEvent, FormEvent } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  FileText,
  Send,
  TerminalSquare,
  CheckCircle2,
} from "lucide-react";

// --- Sub-component: Scramble Text Link ---
// Kept this because it fits the high-tech terminal vibe perfectly.
const ScrambleLink = ({
  text,
  href,
  icon: Icon,
}: {
  text: string;
  href: string;
  icon?: React.ElementType;
}) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/";

  const handleMouseEnter = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join(""),
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3;
    }, 30);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={handleMouseEnter}
      className="flex items-center gap-2 text-slate-500 hover:text-orange-400 font-mono text-xs md:text-sm uppercase tracking-widest transition-colors group"
    >
      {Icon && (
        <Icon className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" />
      )}
      <span>{displayText}</span>
    </a>
  );
};

export default function Horizon() {
  const containerRef = useRef<HTMLDivElement>(null);

  // The final leg of the Trace Line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"],
  });
  const traceHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Form State to make the interaction feel "Alive"
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    // Simulate a network request/payload delivery
    setTimeout(() => {
      setFormState("success");
    }, 1500);
  };

  return (
    <section
      id="contact"
      ref={containerRef}
      className="relative w-full min-h-[100dvh] bg-[#020617] flex flex-col justify-between pt-32 pb-10 px-6 md:px-12 lg:px-20 z-20 overflow-hidden"
    >
      {/* --- BACKGROUND HORIZON GLOW --- */}
      <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-orange-900/10 via-[#020617] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      {/* --- THE TERMINATING TRACE LINE --- */}
      <div className="absolute left-6 md:left-[5.2rem] top-0 bottom-[120px] w-px bg-slate-800/50 hidden lg:block">
        <motion.div
          style={{ height: traceHeight }}
          className="absolute top-0 left-[-1px] w-[3px] bg-gradient-to-b from-transparent via-orange-500 to-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"
        />
        {/* Terminal Block at the very end of the line */}
        <div className="absolute bottom-0 left-[-4px] w-2 h-4 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]" />
        <div className="absolute -bottom-8 left-[-14px] font-mono text-[10px] text-orange-500/50 tracking-widest whitespace-nowrap rotate-90 origin-left">
          [END_OF_TRACE]
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 lg:pl-16 items-start mt-10">
        {/* Left Column: Massive Typography & Story Conclusion */}
        <div className="lg:col-span-6 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <TerminalSquare className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              SYS.COMMS <span className="text-slate-700">//</span> Secure
              Channel
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl lg:text-8xl font-cal text-slate-100 tracking-tight leading-[0.95] mb-8"
          >
            Initiate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              Connection.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-400 leading-relaxed font-light max-w-md"
          >
            The system architecture is reviewed. The logs are verified.{" "}
            <br className="hidden md:block" />
            If you need a scalable Django backend, a fluid Next.js frontend, or
            end-to-end delivery—transmit your payload.
          </motion.p>
        </div>

        {/* Right Column: The "Secure Transmission" Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="lg:col-span-6 w-full max-w-lg lg:ml-auto"
        >
          <div className="bg-[#0A0F1C]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            {/* High-tech corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-slate-800 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-slate-800 rounded-tr-2xl" />

            {formState === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center h-full min-h-[300px]"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-cal text-slate-100 mb-2">
                  Payload Delivered
                </h3>
                <p className="text-slate-400 font-light">
                  The transmission was successful. I will decode the sequence
                  and respond shortly.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 relative z-10"
              >
                {/* Identifier (Name) */}
                <div className="group flex flex-col gap-2">
                  <label
                    htmlFor="name"
                    className="text-[10px] font-mono text-slate-500 tracking-widest uppercase flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-focus-within:bg-orange-500 transition-colors" />
                    IDENTIFIER // Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    disabled={formState === "submitting"}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 text-sm font-light placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:bg-slate-900 transition-all disabled:opacity-50"
                    placeholder="Enter your designation"
                  />
                </div>

                {/* Return Route (Email) */}
                <div className="group flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-[10px] font-mono text-slate-500 tracking-widest uppercase flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-focus-within:bg-orange-500 transition-colors" />
                    RETURN_ROUTE // Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    disabled={formState === "submitting"}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 text-sm font-light placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:bg-slate-900 transition-all disabled:opacity-50"
                    placeholder="system@domain.com"
                  />
                </div>

                {/* Data Payload (Message) */}
                <div className="group flex flex-col gap-2">
                  <label
                    htmlFor="message"
                    className="text-[10px] font-mono text-slate-500 tracking-widest uppercase flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-focus-within:bg-orange-500 transition-colors" />
                    DATA_PAYLOAD // Objective
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    disabled={formState === "submitting"}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 text-sm font-light placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:bg-slate-900 transition-all resize-none disabled:opacity-50"
                    placeholder="Describe the architecture required..."
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 mt-2 rounded-lg bg-slate-100 text-[#020617] font-semibold transition-all duration-300 hover:bg-white disabled:opacity-70 overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.05)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat group-hover:transition-[background-position_0s_ease] group-hover:bg-[position:-100%_0,0_0] group-hover:duration-[1500ms]" />

                  <span className="relative z-10 uppercase tracking-wider text-sm">
                    {formState === "submitting"
                      ? "Transmitting..."
                      : "Transmit Payload"}
                  </span>

                  {formState === "submitting" ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="relative z-10"
                    >
                      <div className="w-4 h-4 border-2 border-[#020617] border-t-transparent rounded-full" />
                    </motion.div>
                  ) : (
                    <Send className="w-4 h-4 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      {/* --- FOOTER (Bottom Bar) --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto border-t border-slate-800/50 pt-8 mt-24 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-slate-600 text-[11px] md:text-xs font-mono uppercase tracking-widest">
          <span>© {new Date().getFullYear()} Abubakr Alsheikh</span>
          <span className="hidden md:inline text-slate-800">|</span>
          <span>Sys.Architecture: Next.js + Tailwind</span>
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          <ScrambleLink
            text="GitHub"
            href="https://github.com/Abubakr-Alsheikh/"
            icon={Github}
          />
          <ScrambleLink
            text="LinkedIn"
            href="https://www.linkedin.com/in/abubakr-alsheikh-dev/"
            icon={Linkedin}
          />
          <ScrambleLink text="Resume" href="#" icon={FileText} />
        </div>
      </div>
    </section>
  );
}
