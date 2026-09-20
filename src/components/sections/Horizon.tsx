"use client";

import { useState, FormEvent, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Send,
  TerminalSquare,
  CheckCircle2,
  Mail,
  MapPin,
  Github,
  Linkedin,
} from "lucide-react";
import GeometricBlackHole from "@/components/visuals/GeometricBlackHole";
import { useTraceFill } from "@/hooks/useTraceFill";
import TracePacket from "@/components/shared/TracePacket";

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

export default function Horizon({
  contact,
}: {
  contact: {
    email: string;
    location: string;
    headline: { lead: string; trail: string };
    intro: string;
    resumeLink: string;
    socials: Array<{ name: string; url: string; icon: string }>;
  };
}) {
  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const traceRef = useRef<HTMLDivElement>(null);
  const { fill, packetOpacity } = useTraceFill(traceRef);

  // The approach: the hole grows and firms up as you scroll down onto it.
  const holeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: approach } = useScroll({
    target: holeRef,
    offset: ["start end", "center center"],
  });
  const holeScale = useTransform(approach, [0, 1], [0.8, 1]);
  const holeOpacity = useTransform(approach, [0, 0.7], [0.3, 1]);

  /**
   * Netlify Forms. The submission is posted to `public/__forms.html`, which is
   * where the form is declared: Netlify registers forms by parsing the static
   * files it deploys, and an App Router page is not one of those files. Every
   * field here has to exist in that file too, or it is dropped.
   *
   * Posted by fetch rather than by a native submit so the panel keeps its
   * state instead of the browser navigating away.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setFormState("submitting");

    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(
          new FormData(form) as unknown as Record<string, string>,
        ).toString(),
      });
      if (!response.ok) throw new Error(`Netlify returned ${response.status}`);
      setFormState("success");
    } catch {
      // The address below is the fallback, so say so rather than swallowing it.
      setFormState("error");
    }
  };

  return (
    <section
      id="contact"
      className="relative w-full flex flex-col items-center justify-between z-20 overflow-hidden min-h-[100dvh]"
    >
      <div className="w-full max-w-7xl mx-auto relative pt-32 pb-32 px-6 md:px-12 flex-1 flex flex-col justify-center">
        {/* The rail stops at the black hole's centre: the trace that has run
            down the whole page falls in. The shadow is drawn over its end. */}
        <div
          ref={traceRef}
          className="absolute left-1/2 top-0 bottom-1/2 w-px bg-slate-800/50 hidden md:block -translate-x-1/2 z-0"
        >
          <motion.div
            style={{ height: fill }}
            className="w-full bg-[#F97316] origin-top relative shadow-[0_0_15px_#F97316]"
          >
            <TracePacket
              opacity={packetOpacity}
              label="HORIZON"
              tone="orange"
            />
          </motion.div>
        </div>

        {/* Event horizon, behind the contact content and centred on the
            trace. After the rail in the DOM so the shadow covers its end. */}
        <div
          ref={holeRef}
          className="absolute inset-0 pointer-events-none z-0"
        >
          <motion.div
            style={{ scale: holeScale, opacity: holeOpacity }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260vw] md:w-[190vw] max-w-[2900px] aspect-[2/1]"
          >
            {/* Dimmed disk: the contact copy is read on top of it. */}
            <GeometricBlackHole intensity={0.85} />
          </motion.div>
        </div>

        <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="flex flex-col pr-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-8"
            >
              <TerminalSquare className="w-5 h-5 text-[#F97316]" />
              <span className="text-xs font-mono text-[#F97316] uppercase tracking-widest">
                SYS.COMMS // Secure Channel
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl lg:text-8xl font-space font-bold text-slate-100 tracking-tighter leading-[0.95] mb-8"
            >
              {contact.headline.lead} <br />
              <span className="text-slate-600">{contact.headline.trail}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm md:text-base text-slate-400 font-mono font-light leading-relaxed max-w-md border-l-2 border-[#3B82F6] pl-6 mb-12"
            >
              {contact.intro}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6 pl-6 border-l-2 border-slate-800"
            >
              <div className="flex items-center gap-4 text-slate-400 group">
                <div className="w-8 h-8 flex items-center justify-center bg-[#020617] border border-slate-800 group-hover:border-[#3B82F6] group-hover:text-[#3B82F6] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-slate-600 tracking-widest uppercase">
                    DIRECT_LINE
                  </span>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-xs font-mono tracking-widest text-slate-300 hover:text-[#3B82F6] transition-colors"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-400 group">
                <div className="w-8 h-8 flex items-center justify-center bg-[#020617] border border-slate-800 group-hover:border-[#F97316] group-hover:text-[#F97316] transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-slate-600 tracking-widest uppercase">
                    COORDINATES
                  </span>
                  <span className="text-xs font-mono tracking-widest text-slate-300">
                    {contact.location}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full relative group"
          >
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
                className="absolute top-[50%] -left-[3rem] w-2 h-2 rounded-sm -translate-x-[4px] -translate-y-[3.5px] z-10 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              />
              <div className="absolute top-[50%] -left-[3rem] w-[3rem] h-px bg-slate-800">
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

            {/* Translucent, so the black hole reads through the panel instead of
                being cut in half by it. */}
            <div className="bg-[#020617]/55 border border-slate-800 p-8 relative z-10 group-hover:border-[#F97316]/50 transition-colors duration-500 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
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
                  className="absolute left-[-1px] top-0 bottom-[50%] w-[2px] bg-[#F97316] origin-bottom shadow-[0_0_15px_#F97316]"
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
                  className="absolute left-[-1px] top-[50%] bottom-0 w-[2px] bg-[#F97316] origin-top shadow-[0_0_15px_#F97316]"
                />
              </motion.div>

              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#F97316]" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#F97316]" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#F97316]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#F97316]" />

              {formState === "success" ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="w-12 h-12 text-[#3B82F6] mb-6" />
                  <h3 className="text-xl font-space font-bold text-slate-100 mb-2 tracking-widest uppercase">
                    Payload Delivered
                  </h3>
                  <p className="text-slate-500 font-mono text-xs tracking-widest uppercase">
                    Awaiting decode sequence...
                  </p>
                </div>
              ) : (
                <form
                  name="contact"
                  method="POST"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-6"
                >
                  <input type="hidden" name="form-name" value="contact" />
                  {/* Honeypot: a real visitor never sees it, a bot fills it
                      and Netlify drops the submission. */}
                  <p className="hidden">
                    <label>
                      Leave this field empty
                      <input name="bot-field" tabIndex={-1} autoComplete="off" />
                    </label>
                  </p>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-name"
                      className="text-[10px] font-mono text-slate-500 tracking-widest uppercase"
                    >
                      IDENTIFIER // Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      autoComplete="name"
                      required
                      disabled={formState === "submitting"}
                      className="w-full bg-transparent border-b border-slate-800 px-0 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-[#3B82F6] transition-colors disabled:opacity-60"
                      placeholder="Enter designation..."
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-email"
                      className="text-[10px] font-mono text-slate-500 tracking-widest uppercase"
                    >
                      RETURN_ROUTE // Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      disabled={formState === "submitting"}
                      className="w-full bg-transparent border-b border-slate-800 px-0 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-[#3B82F6] transition-colors disabled:opacity-60"
                      placeholder="system@domain.com"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-message"
                      className="text-[10px] font-mono text-slate-500 tracking-widest uppercase"
                    >
                      DATA_PAYLOAD // Objective
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      required
                      disabled={formState === "submitting"}
                      className="w-full bg-[#020617]/60 border border-slate-800 mt-2 px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-[#3B82F6] transition-colors resize-none disabled:opacity-60"
                      placeholder="Describe the architecture required..."
                    />
                  </div>

                  {formState === "error" ? (
                    <p
                      role="alert"
                      className="border border-[#F97316]/40 bg-[#F97316]/5 px-4 py-3 font-mono text-[11px] leading-relaxed text-[#F97316]"
                    >
                      TRANSMISSION FAILED // the relay did not answer. Mail{" "}
                      <a href={`mailto:${contact.email}`} className="underline">
                        {contact.email}
                      </a>{" "}
                      instead.
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={formState === "submitting"}
                    className="w-full py-4 mt-4 bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] hover:bg-[#F97316] hover:text-[#020617] font-mono text-xs tracking-widest uppercase transition-all flex justify-center items-center gap-3 group/btn disabled:cursor-wait disabled:hover:bg-[#F97316]/10 disabled:hover:text-[#F97316]"
                  >
                    {formState === "submitting"
                      ? "Transmitting..."
                      : formState === "error"
                        ? "Retry Transmission"
                        : "Transmit Payload"}
                    <Send className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full border-t border-slate-800 bg-[#020617] relative z-30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-3 bg-[#020617] border border-slate-800 hidden md:flex items-center justify-center">
          <div className="w-3 h-1 bg-[#F97316] shadow-[0_0_10px_#F97316]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse shadow-[0_0_8px_#F97316]" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              {/* Rendered at build time into the static HTML, then again by the
                  client on a later date: suppressed so the two may differ,
                  which they do for one page load every new year. */}
              <span suppressHydrationWarning>
                SYS.ONLINE // {new Date().getFullYear()} Abubakr Alsheikh
              </span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <div className="hidden md:flex items-center gap-4 border-r border-slate-800 pr-6">
              <span className="hover:text-[#3B82F6] transition-colors cursor-crosshair">
                [ NEXT.JS_ENGINE ]
              </span>
              <span className="hover:text-[#3B82F6] transition-colors cursor-crosshair">
                [ ORBITAL_STABLE ]
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              {contact.socials.map((social: { name: string; url: string; icon: string }, idx: number) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-slate-500 hover:text-[#F97316] transition-all duration-300"
                  title={social.name}
                >
                  {/* Opening Bracket - Static Slate to Active Orange */}
                  <span className="text-slate-800 group-hover:text-[#F97316] transition-colors duration-300">
                    [
                  </span>

                  {/* Social Name */}
                  <span className="group-hover:text-slate-200 transition-colors duration-300">
                    {social.name}
                  </span>

                  {/* Social Icon - Scaled down slightly for visual balance */}
                  <span className="w-3 h-3 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                    {getIcon(social.icon)}
                  </span>

                  {/* Closing Bracket */}
                  <span className="text-slate-800 group-hover:text-[#F97316] transition-colors duration-300">
                    ]
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
